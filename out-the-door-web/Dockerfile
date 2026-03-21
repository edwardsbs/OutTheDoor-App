# Stage 1: Build Angular app
FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Adjust this path to match your real Angular dist output
COPY --from=build /app/dist/out-the-door/browser /usr/share/nginx/html

EXPOSE 80