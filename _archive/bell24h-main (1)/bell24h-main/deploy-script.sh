#!/bin/bash
set -e

echo "🚀 Starting Bell24H deployment..."

# Stop and remove old container
echo "Stopping old container..."
docker stop bell24h || true
docker rm bell24h || true

# Pull latest image (if using OCI Registry)
# docker pull ${IMAGE_NAME}:${IMAGE_TAG} || true

# Load image from build artifact (if using local build)
# docker load -i bell24h-image.tar || true

# Run new container
echo "Starting new container..."
docker run -d \
  --name bell24h \
  --restart always \
  -p 80:3000 \
  --env-file /home/ubuntu/bell24h/client/.env.production \
  bell24h:latest

# Wait for container to start
echo "Waiting for container to start..."
sleep 10

# Health check
echo "Checking health..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
  echo "✅ Deployment successful! Application is healthy."
else
  echo "⚠️  Container started but health check failed. Check logs:"
  docker logs --tail 50 bell24h
  exit 1
fi

echo "🎉 Bell24H deployment completed successfully!"

