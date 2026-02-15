FROM node:20-bullseye-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY client/package*.json ./
ENV NPM_CONFIG_FUND=false NPM_CONFIG_AUDIT=false npm_config_ignore_scripts=true
RUN npm ci --no-audit --no-fund --legacy-peer-deps

FROM node:20-bullseye-slim AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max_old_space_size=2048

COPY --from=deps /app/node_modules ./node_modules
COPY client/ ./
COPY client/prisma ./prisma/
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
RUN npx prisma generate || true
RUN npm run build || (npm install --legacy-peer-deps && npm run build)
RUN npm prune --omit=dev --legacy-peer-deps || npm prune --omit=dev --force || true

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
RUN useradd -m appuser

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# Optimize: Only copy production node_modules (faster, smaller)
# Use --chown for better performance
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
USER appuser
CMD ["npm","run","start"]
