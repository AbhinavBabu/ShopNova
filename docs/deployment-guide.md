# ShopNova — Kubernetes Deployment Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| kubectl | ≥ 1.28 | https://kubernetes.io/docs/tasks/tools/ |
| helm | ≥ 3.14 | https://helm.sh/docs/intro/install/ |
| minikube | ≥ 1.33 (local dev) | https://minikube.sigs.k8s.io/docs/start/ |
| Docker | ≥ 24 | https://docs.docker.com/get-docker/ |

---

## Step 1 — Start Local Cluster (minikube)

```bash
# Start minikube with enough resources
minikube start --cpus=4 --memory=8192 --disk-size=30g

# Enable metrics-server (required for HPA)
minikube addons enable metrics-server

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

---

## Step 2 — Install Gateway API CRDs

The Gateway API CRDs must be installed before deploying Envoy Gateway.

```bash
# Install stable Gateway API CRDs (v1.2.x)
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.0/standard-install.yaml

# Verify CRDs are installed
kubectl get crd gateways.gateway.networking.k8s.io
kubectl get crd httproutes.gateway.networking.k8s.io
kubectl get crd gatewayclasses.gateway.networking.k8s.io
```

---

## Step 3 — Install KGateway (Envoy Gateway Controller)

```bash
# Install Envoy Gateway via Helm
helm install eg oci://docker.io/envoyproxy/gateway-helm \
  --version v1.2.0 \
  --namespace envoy-gateway-system \
  --create-namespace

# Wait for controller to be ready
kubectl wait --timeout=5m \
  --for=condition=Available \
  deployment/envoy-gateway \
  -n envoy-gateway-system

# Verify installation
kubectl get pods -n envoy-gateway-system
```

---

## Step 4 — Build Docker Images

> **minikube users:** Run `eval $(minikube docker-env)` first so images are built inside minikube's Docker daemon (no registry needed).

```bash
# Point Docker CLI to minikube's daemon
eval $(minikube docker-env)

# Build all images from ShopNova root
cd ShopNova

docker build -t shopnova/auth-service:1.0.0 ./auth-service/
docker build -t shopnova/product-service:1.0.0 ./product-service/
docker build -t shopnova/order-service:1.0.0 ./order-service/
docker build -t shopnova/notification-service:1.0.0 ./notification-service/
docker build -t shopnova/frontend:1.0.0 ./frontend/

# Verify images exist in minikube
docker images | grep shopnova
```

> **Production (registry):** Tag and push to your registry:
> ```bash
> docker tag shopnova/auth-service:1.0.0 docker.io/youruser/auth-service:1.0.0
> docker push docker.io/youruser/auth-service:1.0.0
> # Repeat for all services, then update global.imageRegistry in values.yaml
> ```

---

## Step 5 — Create Namespaces

```bash
kubectl apply -f k8s/namespace/namespaces.yaml

# Verify
kubectl get namespaces | grep ecommerce
```

---

## Step 6 — Bootstrap Secrets (Imperative — Recommended)

> Do NOT use the placeholder `secrets.yaml` in production. Create secrets imperatively:

```bash
kubectl create secret generic shopnova-secrets \
  --from-literal=JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters" \
  --from-literal=EMAIL_USER="your@gmail.com" \
  --from-literal=EMAIL_PASS="your-gmail-app-password-16-chars" \
  --namespace=ecommerce-dev

# For production namespace
kubectl create secret generic shopnova-secrets \
  --from-literal=JWT_SECRET="your-prod-jwt-secret-minimum-32-chars" \
  --from-literal=EMAIL_USER="your@gmail.com" \
  --from-literal=EMAIL_PASS="your-gmail-app-password-16-chars" \
  --namespace=ecommerce-prod

# Verify (values are redacted)
kubectl get secret shopnova-secrets -n ecommerce-dev
```

---

## Step 7 — Deploy to Dev (Helm)

```bash
# Lint chart first
helm lint helm/ecommerce-platform/ -f helm/ecommerce-platform/values-dev.yaml

# Dry-run to preview manifests
helm install shopnova-dev helm/ecommerce-platform/ \
  -f helm/ecommerce-platform/values-dev.yaml \
  --namespace ecommerce-dev \
  --create-namespace \
  --dry-run

# Install to dev namespace
helm install shopnova-dev helm/ecommerce-platform/ \
  -f helm/ecommerce-platform/values-dev.yaml \
  --namespace ecommerce-dev \
  --create-namespace \
  --set secrets.jwtSecret="" \
  --set secrets.emailUser="" \
  --set secrets.emailPass=""
```

> **Note:** Pass `--set secrets.*=""` if you already created the secret imperatively in Step 6 to avoid overwriting it. Alternatively, remove the secrets template from the chart and manage secrets externally.

---

## Step 8 — Deploy to Production (Helm)

```bash
helm install shopnova-prod helm/ecommerce-platform/ \
  -f helm/ecommerce-platform/values-prod.yaml \
  --namespace ecommerce-prod \
  --create-namespace
```

---

## Step 9 — Validate Deployment

```bash
# Check all pods are Running
kubectl get pods -n ecommerce-dev

# Check StatefulSets (MongoDB)
kubectl get statefulsets -n ecommerce-dev

# Check services
kubectl get services -n ecommerce-dev

# Check Gateway is Programmed
kubectl get gateway -n ecommerce-dev
kubectl describe gateway shopnova-gateway -n ecommerce-dev

# Check HTTPRoutes are Accepted
kubectl get httproutes -n ecommerce-dev

# Check HPAs (need metrics-server)
kubectl get hpa -n ecommerce-dev

# Check NetworkPolicies
kubectl get networkpolicies -n ecommerce-dev

# Check PVCs are Bound
kubectl get pvc -n ecommerce-dev
```

---

## Step 10 — Access the Application (minikube)

```bash
# Get gateway LoadBalancer IP (in a separate terminal)
minikube tunnel

# In another terminal, get the external IP
kubectl get service -n envoy-gateway-system

# Or use minikube service to open directly
kubectl get gateway shopnova-gateway -n ecommerce-dev -o jsonpath='{.status.addresses[0].value}'
```

---

## Upgrade & Rollback

```bash
# Upgrade release with new values or image tag
helm upgrade shopnova-dev helm/ecommerce-platform/ \
  -f helm/ecommerce-platform/values-dev.yaml \
  --namespace ecommerce-dev \
  --set authService.image.tag="1.1.0"

# View release history
helm history shopnova-dev -n ecommerce-dev

# Rollback to previous revision
helm rollback shopnova-dev 1 -n ecommerce-dev
```

---

## Teardown

```bash
# Uninstall Helm release (keeps PVCs by default)
helm uninstall shopnova-dev -n ecommerce-dev

# Delete PVCs (WARNING: destroys data)
kubectl delete pvc -l app.kubernetes.io/name=shopnova -n ecommerce-dev

# Delete namespaces (removes everything)
kubectl delete namespace ecommerce-dev ecommerce-prod
```

---

## Troubleshooting

| Symptom | Command | Fix |
|---------|---------|-----|
| Pod stuck in `Pending` | `kubectl describe pod <name> -n ecommerce-dev` | Check PVC bound, node resources |
| Pod in `CrashLoopBackOff` | `kubectl logs <pod> -n ecommerce-dev` | Check env vars, secrets mounted |
| HPA showing `<unknown>` targets | `kubectl top pods -n ecommerce-dev` | Install metrics-server addon |
| Gateway `NotProgrammed` | `kubectl describe gateway -n ecommerce-dev` | Verify Envoy Gateway is running |
| HTTPRoute `ResolvedRefs: False` | `kubectl describe httproute -n ecommerce-dev` | Check Service name/port match |
| MongoDB not ready | `kubectl exec -it auth-db-0 -n ecommerce-dev -- mongosh` | Check fsGroup, PVC access |
| Network policy blocking | `kubectl describe networkpolicy -n ecommerce-dev` | Check pod labels match selectors |

---

## Security Checklist

- [ ] Secrets created imperatively (not from `secrets.yaml`)
- [ ] All pods show `runAsNonRoot: true` in `kubectl describe pod`
- [ ] NetworkPolicies active: `kubectl get netpol -n ecommerce-dev`
- [ ] No pod runs as root: `kubectl get pods -n ecommerce-dev -o jsonpath='{range .items[*]}{.metadata.name}: {.spec.containers[*].securityContext.runAsUser}{"\n"}{end}'`
- [ ] PVCs encrypted (cloud provider volume encryption enabled)
- [ ] TLS terminated at Gateway level (future phase: add TLS listener)
