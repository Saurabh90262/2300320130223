FROM node:18-alpine AS builder

WORKDIR /app

COPY logging_middleware /logging_middleware
COPY notification_app_fe/package*.json ./
RUN npm ci

COPY notification_app_fe/ .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY logging_middleware /logging_middleware
COPY notification_app_fe/package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY notification_app_fe/public ./public

EXPOSE 3000

CMD ["npm", "start"]
