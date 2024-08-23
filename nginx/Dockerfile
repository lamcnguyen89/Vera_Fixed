# production environment
FROM nginx:stable-alpine as nginx-prod
COPY ./nginx-debug.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]