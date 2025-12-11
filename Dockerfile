# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY src ./src

# Build the TypeScript code
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built dist from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000 for HTTP/SSE transport
EXPOSE 3000

# Set environment variables for SSE transport
ENV MCP_TRANSPORT=sse
ENV PORT=3000

# Run the server
CMD ["node", "dist/index.js"]
