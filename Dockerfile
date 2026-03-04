# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3001
# Utilise "npm start" qui lance "next start -p 3001" selon ton package.json
CMD ["npm", "start"]