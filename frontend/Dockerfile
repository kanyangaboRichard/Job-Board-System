# Use the official Node.js 18 Alpine image
FROM node:18-alpine AS build

# Create and change to the app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

#Serve build with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["nginx", "-g", "daemon off;"]