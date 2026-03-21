FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY out-the-door-web/package*.json ./
RUN npm install

COPY out-the-door-web/ .
RUN npm run build -- --configuration production

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/out-the-door-web /usr/share/nginx/html

EXPOSE 80