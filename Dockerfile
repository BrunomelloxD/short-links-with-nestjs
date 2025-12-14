FROM node:lts-alpine3.20 AS deps
WORKDIR /home/node/app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:lts-alpine3.20 AS builder
WORKDIR /home/node/app
COPY package*.json ./
RUN npm ci
COPY . .

# Generate Prisma Client (requires a dummy DATABASE_URL for generation only)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

RUN npm run build

FROM node:lts-alpine3.20 AS production
WORKDIR /home/node/app

# Copy node_modules from builder (includes generated Prisma Client)
COPY --from=builder /home/node/app/node_modules ./node_modules
# Copy built application
COPY --from=builder /home/node/app/dist ./dist
# Copy Prisma schema for runtime
COPY --from=builder /home/node/app/prisma ./prisma
# Copy package files
COPY --from=builder /home/node/app/package*.json ./
# Copy start script
COPY start.sh ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /home/node/app && \
    chmod +x /home/node/app/start.sh

USER nodejs

EXPOSE 3000

CMD ["./start.sh"]
