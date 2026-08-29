FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist
RUN apk add --no-cache curl
USER node
EXPOSE 4000 4001
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 CMD curl -f http://localhost:4000/health || exit 1
CMD ["node", "dist/server.js"]
