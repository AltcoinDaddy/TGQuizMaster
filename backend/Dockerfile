# Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production Stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
# Copy raw assets if any (e.g. templates) - none in current structure but good practice
# COPY --from=builder /app/src/assets ./dist/assets 

EXPOSE 3001
CMD ["node", "dist/index.js"]
