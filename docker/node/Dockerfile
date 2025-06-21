FROM node:20-alpine AS builder

RUN apk add --no-cache bash

WORKDIR /app

RUN npm install -g @nestjs/cli nodemon

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine AS local

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 3000 3001 9229

CMD ["npm", "run", "start:dev"]

FROM node:20-alpine AS pm2

RUN npm install pm2 -g

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

COPY ecosystem.config.js ./

RUN mkdir -p /app/logs

EXPOSE 3002-3020

#RUN echo "global.crypto = require('crypto');" > /app/crypto-polyfill.js

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD pm2 list | grep online || exit 1

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
