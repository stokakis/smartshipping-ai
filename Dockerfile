# Production Dockerfile for SmartShipping AI Full-Stack Web App
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors and npmrc
COPY package*.json .npmrc* ./

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy application source code
COPY . .

# Build client assets into /app/dist
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production-only dependencies
COPY package*.json .npmrc* ./
RUN npm install --omit=dev --legacy-peer-deps && npm install -g tsx

# Copy built frontend assets and server file
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["tsx", "server.ts"]
