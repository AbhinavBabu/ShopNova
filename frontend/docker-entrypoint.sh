#!/bin/sh
# docker-entrypoint.sh
#
# Renders the nginx config template by substituting environment variables,
# then hands off to the CMD (nginx).
#
# Required environment variables (with sensible Docker Compose defaults):
#   AUTH_SERVICE_HOST    – hostname of the auth service    (default: auth-service)
#   AUTH_SERVICE_PORT    – port of the auth service        (default: 8001)
#   PRODUCT_SERVICE_HOST – hostname of the product service (default: product-service)
#   PRODUCT_SERVICE_PORT – port of the product service     (default: 8002)
#   ORDER_SERVICE_HOST   – hostname of the order service   (default: order-service)
#   ORDER_SERVICE_PORT   – port of the order service       (default: 8003)

set -e

# Apply defaults so the container works out-of-the-box with Docker Compose
: "${AUTH_SERVICE_HOST:=auth-service}"
: "${AUTH_SERVICE_PORT:=8001}"
: "${PRODUCT_SERVICE_HOST:=product-service}"
: "${PRODUCT_SERVICE_PORT:=8002}"
: "${ORDER_SERVICE_HOST:=order-service}"
: "${ORDER_SERVICE_PORT:=8003}"

echo "[entrypoint] Rendering nginx config template..."
echo "  AUTH    → http://${AUTH_SERVICE_HOST}:${AUTH_SERVICE_PORT}"
echo "  PRODUCT → http://${PRODUCT_SERVICE_HOST}:${PRODUCT_SERVICE_PORT}"
echo "  ORDER   → http://${ORDER_SERVICE_HOST}:${ORDER_SERVICE_PORT}"

envsubst '${AUTH_SERVICE_HOST} ${AUTH_SERVICE_PORT} ${PRODUCT_SERVICE_HOST} ${PRODUCT_SERVICE_PORT} ${ORDER_SERVICE_HOST} ${ORDER_SERVICE_PORT}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "[entrypoint] nginx config written. Starting nginx..."
exec "$@"
