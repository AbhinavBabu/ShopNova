{{/*
================================================================================
ShopNova Helm Chart — Named Template Helpers
================================================================================
*/}}

{{/*
Expand the chart name (max 63 chars, trimmed)
*/}}
{{- define "ecommerce.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart reference string: name-version
*/}}
{{- define "ecommerce.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels — applied to all resources
*/}}
{{- define "ecommerce.labels" -}}
helm.sh/chart: {{ include "ecommerce.chart" . }}
app.kubernetes.io/name: {{ include "ecommerce.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
environment: {{ .Values.global.environment | quote }}
{{- end }}

{{/*
Selector labels — used in matchLabels and pod labels
Usage: pass component name as second arg via dict
  {{ include "ecommerce.selectorLabels" (dict "component" "auth-service" "context" .) }}
*/}}
{{- define "ecommerce.selectorLabels" -}}
app: {{ .component }}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/*
Full image reference: registry/repository:tag
Usage: {{ include "ecommerce.image" (dict "registry" .Values.global.imageRegistry "repo" .Values.authService.image.repository "tag" .Values.authService.image.tag) }}
*/}}
{{- define "ecommerce.image" -}}
{{- if .registry -}}
{{- printf "%s/%s:%s" .registry .repo .tag -}}
{{- else -}}
{{- printf "%s:%s" .repo .tag -}}
{{- end -}}
{{- end }}

{{/*
Standard pod security context for Node.js services (UID 1001)
*/}}
{{- define "ecommerce.podSecurityContext.node" -}}
runAsNonRoot: true
runAsUser: 1001
runAsGroup: 1001
fsGroup: 1001
{{- end }}

{{/*
Standard pod security context for nginx (UID 101)
*/}}
{{- define "ecommerce.podSecurityContext.nginx" -}}
runAsNonRoot: true
runAsUser: 101
runAsGroup: 101
fsGroup: 101
{{- end }}

{{/*
Standard container security context (shared by all containers)
*/}}
{{- define "ecommerce.containerSecurityContext" -}}
allowPrivilegeEscalation: false
capabilities:
  drop:
    - ALL
{{- end }}

{{/*
MongoDB internal ClusterIP DNS for a given DB name and namespace
Usage: {{ include "ecommerce.mongoURI" (dict "dbService" "auth-db" "dbName" "authdb" "namespace" .Release.Namespace) }}
*/}}
{{- define "ecommerce.mongoURI" -}}
{{- printf "mongodb://%s.%s.svc.cluster.local:27017/%s" .dbService .namespace .dbName -}}
{{- end }}
