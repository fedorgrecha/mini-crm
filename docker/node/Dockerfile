FROM node:20-alpine

RUN apk add --no-cache bash

WORKDIR /app

RUN npm install -g @nestjs/cli nodemon

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY . .

EXPOSE 3000 3001 9229

CMD ["npm", "run", "start:dev"]