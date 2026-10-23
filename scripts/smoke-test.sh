#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "  Wonderlab — Foundation Smoke Test Suite"
echo "=========================================================="

CLIENT_URL="${CLIENT_URL:-http://localhost:3002}"
SERVER_URL="${SERVER_URL:-http://localhost:3001}"

# 1. Test Server Health API
echo -n "• Testing Server Health API (${SERVER_URL}/api/v1/health)... "
HEALTH_RESP=$(curl -s "${SERVER_URL}/api/v1/health" || true)
if echo "$HEALTH_RESP" | grep -q '"status":"ok"'; then
  echo "✅ OK"
else
  echo "❌ FAILED (Response: $HEALTH_RESP)"
  exit 1
fi

# 2. Test Swagger Documentation
echo -n "• Testing Swagger API Docs (${SERVER_URL}/api/docs)... "
SWAGGER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SERVER_URL}/api/docs" || true)
if [ "$SWAGGER_STATUS" = "200" ]; then
  echo "✅ OK (HTTP 200)"
else
  echo "❌ FAILED (Status: $SWAGGER_STATUS)"
  exit 1
fi

# 3. Test Client Homepage
echo -n "• Testing Client Homepage (${CLIENT_URL})... "
CLIENT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${CLIENT_URL}" || true)
if [ "$CLIENT_STATUS" = "200" ]; then
  echo "✅ OK (HTTP 200)"
else
  echo "❌ FAILED (Status: $CLIENT_STATUS)"
  exit 1
fi

# 4. Test Client Admin Placeholder
echo -n "• Testing Client Admin Route (${CLIENT_URL}/admin)... "
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${CLIENT_URL}/admin" || true)
if [ "$ADMIN_STATUS" = "200" ]; then
  echo "✅ OK (HTTP 200)"
else
  echo "❌ FAILED (Status: $ADMIN_STATUS)"
  exit 1
fi

echo "=========================================================="
echo "  🎉 All smoke tests passed successfully!"
echo "=========================================================="
