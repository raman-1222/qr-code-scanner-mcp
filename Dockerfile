FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Build the TypeScript code
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Expose no ports (stdio-based server)
# Run the server
CMD ["node", "dist/index.js"]
