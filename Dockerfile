# build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# inject Vite env at build time
ARG VITE_GOOGLE_CLIENT_ID
RUN test -n "$VITE_GOOGLE_CLIENT_ID" || (echo "Missing VITE_GOOGLE_CLIENT_ID build arg" && exit 1)
RUN printf "VITE_GOOGLE_CLIENT_ID=%s\n" "$VITE_GOOGLE_CLIENT_ID" > .env.production


RUN npm run build

# serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
