# Step 1: Build the Vue app
FROM node:20 AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build for production
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
RUN npm run build

# Step 2: Serve the built app with a lightweight web server
FROM nginx:stable-alpine

# Copy built files to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
