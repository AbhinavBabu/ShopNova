# ShopNova — Git Branching Strategy

## Branch Model

ShopNova uses a **trunk-based development with short-lived feature branches** model. The `main` branch is always production-ready.

```
main (protected, production-ready)
├── feature/k8s-setup          ← Current: K8s + Helm setup
├── feature/github-actions     ← Later: CI/CD pipeline
├── feature/argocd-setup       ← Later: GitOps deployment
└── hotfix/<description>       ← Emergency fixes only
```

---

## Branch Definitions

| Branch | Purpose | Deploy Target | Merge Strategy |
|--------|---------|---------------|---------------|
| `main` | Production code — always stable | `ecommerce-prod` | Squash merge via PR only |
| `feature/k8s-setup` | K8s, Helm, Docker hardening | `ecommerce-dev` | PR → main |
| `feature/github-actions` | GitHub Actions CI/CD | `ecommerce-dev` | PR → main |
| `feature/argocd-setup` | ArgoCD GitOps | `ecommerce-dev` | PR → main |
| `hotfix/*` | Critical production fixes | `ecommerce-prod` | PR → main + cherry-pick |

---

## Branch Creation Workflow

```bash
# Always branch from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/k8s-setup

# Work, commit often with conventional commits
git add .
git commit -m "feat(k8s): add MongoDB StatefulSets with PVCs"
git commit -m "feat(helm): add Helm chart with dev/prod values"
git commit -m "feat(docker): harden all Dockerfiles with non-root users"

# Push to remote
git push -u origin feature/k8s-setup
```

---

## Conventional Commit Format

```
<type>(<scope>): <subject>

Types:
  feat     — new feature
  fix      — bug fix
  chore    — maintenance (deps, configs)
  docs     — documentation only
  refactor — refactoring without behavior change
  ci       — CI/CD changes
  test     — adding tests

Scopes:
  docker, helm, k8s, gateway, auth, product, order, notification, frontend

Examples:
  feat(helm): add HPA templates for frontend and auth-service
  fix(docker): correct nginx non-root port to 8080
  chore(k8s): update MongoDB image to mongo:7
  docs(deploy): add troubleshooting section to deployment guide
  ci(github-actions): add Docker build and push workflow
```

---

## Pull Request Workflow

### Opening a PR

1. Push your feature branch: `git push -u origin feature/k8s-setup`
2. Open a PR on GitHub: `feature/k8s-setup → main`
3. Fill out the PR template:
   - **What changed**: Summary of changes
   - **Why**: Motivation / ticket reference
   - **How to test**: Validation steps
   - **Checklist**: Linting, tests passed

### PR Requirements (Branch Protection Rules)

| Rule | Setting |
|------|---------|
| Require PR before merging | ✅ Enabled |
| Required approvals | Minimum 1 reviewer |
| Dismiss stale reviews | ✅ On new commits |
| Require status checks | ✅ `helm-lint`, `docker-build` |
| Require branches up to date | ✅ Must rebase before merge |
| Restrict direct pushes to main | ✅ No direct push allowed |
| Require signed commits | ✅ Recommended for prod |
| Prevent force push | ✅ Enabled |
| Require linear history | ✅ Squash merge only |

### Configuring Branch Protection (GitHub)

```
Repository → Settings → Branches → Add rule → Branch name: main
Enable all rules listed above
```

---

## Merge Strategy

- **Feature → Main:** Squash merge (clean linear history)
- **Hotfix → Main:** Regular merge commit (preserves context)
- **Never:** Direct push to `main` or force push

---

## Release Tagging

After merging to main, tag the release:

```bash
git checkout main
git pull origin main

# Semantic versioning: MAJOR.MINOR.PATCH
git tag -a v1.0.0 -m "feat: initial K8s + Helm production setup"
git push origin v1.0.0
```

---

## Environment Promotion Flow

```
Developer pushes code
        │
        ▼
feature/k8s-setup branch
        │
        ▼ (Pull Request opened)
Code Review + Helm Lint Check
        │
        ▼ (PR merged to main)
main branch
        │
        ├──► (Auto) Deploy to ecommerce-dev      [CI/CD — later phase]
        │
        └──► (Manual/ArgoCD) Deploy to ecommerce-prod  [ArgoCD — later phase]
```

---

## .gitignore Additions

Ensure the following are gitignored:

```gitignore
# Secrets — never commit real secrets
.env
*.env.local
k8s/secrets/secrets-real.yaml

# Helm chart dependencies
helm/*/charts/
helm/*/.helmignore

# Local dev artifacts
*.log
.DS_Store
```

---

## Viva Discussion Points

**Q: Why trunk-based vs Gitflow?**
- Trunk-based reduces merge conflicts, encourages small frequent commits, and aligns with CI/CD best practices (shorter feedback loops).

**Q: Why squash merge to main?**
- Keeps the main branch history linear and clean. Each merge represents one complete feature, making rollbacks and `git bisect` simple.

**Q: How do namespaces map to branches?**
- `feature/*` branches deploy to `ecommerce-dev`. The `main` branch deploys to `ecommerce-prod`. This mirrors the GitOps pattern ArgoCD will use in the next phase.

**Q: How are secrets protected in Git?**
- Never stored in Git. Placeholder values only in committed YAML. Real secrets are created imperatively via `kubectl create secret` or managed by Sealed Secrets/External Secrets Operator.
