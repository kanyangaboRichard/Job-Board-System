
FROM node:20-alpine AS build

WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


RUN npm run build

FROM nginx:alpine

# Copy build output from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port (Nginx default 80)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
