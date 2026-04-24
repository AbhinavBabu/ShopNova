# ShopNova — Kubernetes Deployment Guide
# Run these commands on your EC2 instance (kubeadm + Weave CNI)

# ════════════════════════════════════════════════════════════════════
# PHASE 0: PREREQUISITES (one-time cluster setup)
# ════════════════════════════════════════════════════════════════════

# 0a. Install metrics-server (required for HPA)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
# For kubeadm single-node: patch to disable TLS verification
kubectl patch deployment metrics-server -n kube-system \
  --type=json \
  -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'

# 0b. Install local-path-provisioner (for storage BEFORE your NFS instance is ready)
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.26/deploy/local-path-storage.yaml
# Verify the StorageClass is created:
kubectl get storageclass

# 0c. Label the kube-system namespace (required for NetworkPolicy DNS rules)
kubectl label namespace kube-system kubernetes.io/metadata.name=kube-system --overwrite

# ════════════════════════════════════════════════════════════════════
# PHASE 1: INSTALL KGATEWAY (Envoy-based Gateway controller)
# ════════════════════════════════════════════════════════════════════

# 1a. Install Gateway API CRDs (standard Kubernetes Gateway API)
kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.0/standard-install.yaml

# 1b. Install kgateway via Helm
helm repo add kgateway-dev https://kgateway-dev.github.io/kgateway
helm repo update
helm upgrade --install kgateway kgateway-dev/kgateway \
  --namespace kgateway-system \
  --create-namespace \
  --version 2.0.3

# 1c. Verify kgateway is running
kubectl get pods -n kgateway-system
# Expected: kgateway pod Running

# ════════════════════════════════════════════════════════════════════
# PHASE 2: APPLY CLUSTER-WIDE RESOURCES
# ════════════════════════════════════════════════════════════════════

cd /path/to/ShopNova   # adjust to your clone path

# 2a. Create namespaces
kubectl apply -f k8s/00-namespaces.yaml

# 2b. Create GatewayClass (cluster-scoped)
kubectl apply -f k8s/01-gatewayclass.yaml

# Verify GatewayClass is accepted
kubectl get gatewayclass kgateway

# ════════════════════════════════════════════════════════════════════
# PHASE 3: DEPLOY PROD NAMESPACE
# ════════════════════════════════════════════════════════════════════

# 3a. Edit your secrets FIRST before applying!
nano k8s/prod/01-secrets.yaml
# Change: JWT_SECRET, EMAIL_USER, EMAIL_PASS (MongoDB URIs are already correct)

# 3b. Apply Secrets and ConfigMaps
kubectl apply -f k8s/prod/01-secrets.yaml
kubectl apply -f k8s/prod/02-configmaps.yaml

# 3c. Apply Gateway and wait for it to be ready
kubectl apply -f k8s/gateway/prod-gateway.yaml
kubectl get gateway -n prod --watch   # Wait until READY=True, then Ctrl+C

# 3d. Expose kgateway proxy service as NodePort 30080
#     (kgateway creates a Service named after the Gateway in the same namespace)
kubectl patch svc shopnova-gateway -n prod \
  -p '{"spec":{"type":"NodePort","ports":[{"port":80,"targetPort":10080,"nodePort":30080,"protocol":"TCP"}]}}'
# Note: if the service name is different, check with: kubectl get svc -n prod

# 3e. Apply HTTPRoutes
kubectl apply -f k8s/gateway/prod-httproutes.yaml

# 3f. Apply MongoDB StatefulSets (wait for them before services!)
kubectl apply -f k8s/prod/03-mongodb.yaml
kubectl rollout status statefulset/auth-db -n prod
kubectl rollout status statefulset/product-db -n prod
kubectl rollout status statefulset/order-db -n prod
# MongoDB takes ~40s to start — wait until all pods are Running+Ready

# 3g. Apply all microservices
kubectl apply -f k8s/prod/04-auth-service.yaml
kubectl apply -f k8s/prod/05-product-service.yaml
kubectl apply -f k8s/prod/06-order-service.yaml
kubectl apply -f k8s/prod/07-notification-service.yaml
kubectl apply -f k8s/prod/08-frontend.yaml

# 3h. Apply NetworkPolicies
kubectl apply -f k8s/prod/09-networkpolicies.yaml

# ════════════════════════════════════════════════════════════════════
# PHASE 4: DEPLOY DEV NAMESPACE
# ════════════════════════════════════════════════════════════════════

# 4a. Edit dev secrets
nano k8s/dev/01-secrets.yaml

# 4b. Apply dev resources
kubectl apply -f k8s/dev/01-secrets.yaml
kubectl apply -f k8s/dev/02-configmaps.yaml
kubectl apply -f k8s/gateway/dev-gateway.yaml
kubectl get gateway -n dev --watch   # Wait until READY=True

# 4c. Expose dev gateway on NodePort 30081
kubectl patch svc shopnova-gateway -n dev \
  -p '{"spec":{"type":"NodePort","ports":[{"port":80,"targetPort":10080,"nodePort":30081,"protocol":"TCP"}]}}'

kubectl apply -f k8s/gateway/dev-httproutes.yaml
kubectl apply -f k8s/dev/03-mongodb.yaml
kubectl rollout status statefulset/auth-db -n dev
kubectl rollout status statefulset/product-db -n dev
kubectl rollout status statefulset/order-db -n dev
kubectl apply -f k8s/dev/04-auth-service.yaml
kubectl apply -f k8s/dev/05-product-service.yaml
kubectl apply -f k8s/dev/06-order-service.yaml
kubectl apply -f k8s/dev/07-notification-service.yaml
kubectl apply -f k8s/dev/08-frontend.yaml
kubectl apply -f k8s/dev/09-networkpolicies.yaml

# ════════════════════════════════════════════════════════════════════
# PHASE 5: VERIFY EVERYTHING IS WORKING
# ════════════════════════════════════════════════════════════════════

# Check all pods
kubectl get pods -n prod
kubectl get pods -n dev
# All pods should show STATUS=Running and READY=1/1 (or 1/1 for StatefulSets)

# Check HPAs
kubectl get hpa -n prod
kubectl get hpa -n dev

# Check HTTPRoutes
kubectl get httproutes -n prod
kubectl get httproutes -n dev

# Test health endpoints via kgateway
EC2_IP="<YOUR_EC2_PUBLIC_IP>"

# Frontend loads
curl http://$EC2_IP:30080/

# API routes (direct to each service via kgateway)
curl http://$EC2_IP:30080/api/auth/
curl http://$EC2_IP:30080/api/products/
curl http://$EC2_IP:30080/api/orders/

# Test from inside a pod (internal K8s DNS)
kubectl exec -it deploy/auth-service -n prod -- wget -qO- http://auth-service:8001/health
kubectl exec -it deploy/product-service -n prod -- wget -qO- http://product-service:8002/health
kubectl exec -it deploy/order-service -n prod -- wget -qO- http://order-service:8003/health
kubectl exec -it deploy/notification-service -n prod -- wget -qO- http://notification-service:8004/health

# ════════════════════════════════════════════════════════════════════
# OPEN THIS PORT IN EC2 SECURITY GROUP
# ════════════════════════════════════════════════════════════════════
# Inbound rules on your EC2 Security Group:
#   Port 30080  — Prod frontend + all API routes (via kgateway)
#   Port 30081  — Dev environment
#   Port 22     — SSH
# You do NOT need to expose 8001-8004 anymore (all traffic through kgateway)

# ════════════════════════════════════════════════════════════════════
# ACCESS URLS
# ════════════════════════════════════════════════════════════════════
# Prod:  http://<EC2_IP>:30080
# Dev:   http://<EC2_IP>:30081

# ════════════════════════════════════════════════════════════════════
# WHEN NFS IS READY (switch from local-path to NFS storage)
# ════════════════════════════════════════════════════════════════════

# 1. Apply NFS StorageClass (edit NFS_SERVER_IP first!)
nano k8s/storage/nfs-storageclass.yaml   # Set your NFS server IP
kubectl apply -f k8s/storage/nfs-storageclass.yaml

# 2. Install NFS CSI driver
helm repo add csi-driver-nfs https://raw.githubusercontent.com/kubernetes-csi/csi-driver-nfs/master/charts
helm install csi-driver-nfs csi-driver-nfs/csi-driver-nfs \
  --namespace kube-system \
  --set kubeletDir=/var/lib/kubelet

# 3. Update storageClassName in MongoDB StatefulSets from "local-path" to "nfs-storage"
# Then delete old PVCs + StatefulSets and re-apply (data migration needed if any)

# ════════════════════════════════════════════════════════════════════
# USEFUL DEBUGGING COMMANDS
# ════════════════════════════════════════════════════════════════════

# View logs
kubectl logs deploy/auth-service -n prod
kubectl logs deploy/product-service -n prod
kubectl logs deploy/order-service -n prod
kubectl logs deploy/notification-service -n prod
kubectl logs deploy/frontend -n prod

# Describe a pod (shows Events if something fails)
kubectl describe pod -l app=auth-service -n prod

# Check gateway status
kubectl describe gateway shopnova-gateway -n prod

# Check NetworkPolicy
kubectl describe networkpolicy -n prod

# Check HPA status (scaling decisions)
kubectl describe hpa auth-service-hpa -n prod
