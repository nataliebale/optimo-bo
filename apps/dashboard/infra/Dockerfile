#nginx
FROM nginx:1.21.0-alpine
COPY libs/infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/apps/dashboard /usr/share/nginx/html