#!/usr/bin/env bash

# ============================================================
# Visava - Single Command Stop Server
# ============================================================

echo "🛑 Stopping all Visava services..."
echo "------------------------------------------------------------"

echo "🧹 Cleaning up local ports..."
# Kill any processes still hanging onto our ports just in case
npx --yes kill-port 3000 4000 5173 8081 || true
echo "✅ Ports 3000, 4000, 5173, and 8081 are free."

echo "🧹 Stopping Redis container..."
if sudo docker ps -q -f name=visava-redis &> /dev/null; then
    sudo docker stop visava-redis >/dev/null
    sudo docker rm visava-redis >/dev/null
    echo "✅ Redis container stopped and removed."
else
    echo "ℹ️ Redis container is not running."
fi

echo "------------------------------------------------------------"
echo "✅ Everything has been completely shut down safely!"
