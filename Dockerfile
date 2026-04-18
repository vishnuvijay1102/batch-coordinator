# Stage 1 - Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2 - Run the Express server
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY server.ts ./
COPY tsconfig.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]