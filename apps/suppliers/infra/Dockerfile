#nginx
FROM nginx:1.21.0-alpine
COPY libs/infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/apps/suppliers /usr/share/nginx/html