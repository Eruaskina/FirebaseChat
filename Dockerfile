# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json ./

# Install npm dependencies
RUN npm install --legacy-peer-deps

# Copy application source code
COPY . .

# Build the production React bundle
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose container port
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
