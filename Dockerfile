FROM node:22-alpine AS build
WORKDIR /app

COPY out-the-door-web/package*.json ./
RUN npm ci

COPY out-the-door-web/ .
RUN npm run build -- --configuration production

FROM nginx:alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/out-the-door-web/browser /usr/share/nginx/html
EXPOSE 80
