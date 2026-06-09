FROM node:18-alpine

WORKDIR /app

COPY logging_middleware /logging_middleware
COPY notification_app_be/package*.json ./
RUN npm ci

COPY notification_app_be/ .

EXPOSE 5000

CMD ["npm", "start"]
