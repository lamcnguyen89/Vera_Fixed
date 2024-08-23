FROM node:16-alpine as debug
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY ["package.json", "package-lock.json*", "tsconfig.json", "./"]
RUN npm ci --silent && npm install react-scripts -g --silent
COPY . ./

FROM debug as build
RUN npm run build

# production environment
FROM nginx:stable-alpine as client-prod
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]