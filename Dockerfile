FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy the pre-built dist folder
COPY dist ./dist

# Run the server
CMD ["node", "dist/index.js"]
