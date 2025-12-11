# QR Code Scanner MCP

A Model Context Protocol (MCP) server that enables QR code scanning capabilities for any MCP-compatible LLM client. This server can decode QR codes from base64-encoded images or from image URLs.

## Features

- 🔍 Scan QR codes from base64-encoded images
- 🌐 Scan QR codes from image URLs
- 📍 Returns decoded content with precise location coordinates
- 🔒 Supports both stdio and HTTP/SSE transports
- 🚀 Easy deployment to cloud platforms (Railway, Render, etc.)
- 🐳 Docker support for easy deployment
- ☁️ Ready for cloud hosting

## Installation

### Local Installation

1. Clone the repository:
```bash
git clone https://github.com/raman-1222/qr-code-scanner-mcp.git
cd qr-code-scanner-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

### Docker Installation

Pull the pre-built Docker image:
```bash
docker pull ghcr.io/raman-1222/qr-code-scanner-mcp:latest
```

Or build locally:
```bash
docker build -t qr-code-scanner-mcp .
```

## Usage

### Transport Modes

The server supports two transport modes:

1. **stdio transport** (for local usage with Claude Desktop and other MCP clients)
2. **HTTP/SSE transport** (for cloud deployment and remote access)

Set the transport mode using the `MCP_TRANSPORT` environment variable:
- `MCP_TRANSPORT=stdio` - Use stdio transport (default for local development)
- `MCP_TRANSPORT=sse` - Use HTTP/SSE transport (default for cloud deployment)

### Environment Variables

- `MCP_TRANSPORT` - Transport mode: `stdio` or `sse` (default: `sse`)
- `PORT` - HTTP server port (default: `3000`, only used in SSE mode)
- `CORS_ORIGINS` - Comma-separated list of allowed origins for CORS (default: `*` - all origins). Example: `https://example.com,https://app.example.com`

### As a Standalone Server (HTTP/SSE mode)

Run the server with HTTP/SSE transport:
```bash
npm start
# or
MCP_TRANSPORT=sse PORT=3000 npm start
```

The server will start on `http://localhost:3000` with the following endpoints:
- `GET /` - Server information
- `GET /health` - Health check endpoint
- `GET/POST/DELETE /mcp` - MCP communication endpoint

### As a Standalone Server (stdio mode)

Run the server with stdio transport:
```bash
MCP_TRANSPORT=stdio npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### With Claude Desktop

Add the following to your Claude Desktop configuration file (stdio mode):

**On macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**On Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "qr-code-scanner": {
      "command": "node",
      "args": ["/absolute/path/to/qr-code-scanner-mcp/dist/index.js"],
      "env": {
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

Or using npm:
```json
{
  "mcpServers": {
    "qr-code-scanner": {
      "command": "npx",
      "args": ["-y", "qr-code-scanner-mcp"],
      "env": {
        "MCP_TRANSPORT": "stdio"
      }
    }
  }
}
```

### With Remote MCP Clients (HTTP/SSE mode)

For remote access, you can deploy the server to a cloud platform and connect using the HTTP/SSE endpoint.

Example: `https://qr-code-scanner-mcp-production.up.railway.app/mcp`

### With Other MCP Clients

Any MCP-compatible client can connect to this server using stdio transport. Configure your client to run the server as a child process with stdio communication.

## API Reference

### Tools

#### `scan_qr_code`

Scans a QR code from a base64-encoded image.

**Parameters:**
- `imageData` (string, required): Base64-encoded image data. Can include or omit the data URL prefix (e.g., `data:image/png;base64,`)

**Returns:**
```json
{
  "data": "decoded QR code content",
  "location": {
    "topLeft": { "x": 0, "y": 0 },
    "topRight": { "x": 100, "y": 0 },
    "bottomLeft": { "x": 0, "y": 100 },
    "bottomRight": { "x": 100, "y": 100 }
  }
}
```

**Example:**
```json
{
  "imageData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
```

#### `scan_qr_code_from_url`

Scans a QR code from an image URL.

**Parameters:**
- `imageUrl` (string, required): URL of the image to scan

**Returns:**
```json
{
  "data": "decoded QR code content",
  "location": {
    "topLeft": { "x": 0, "y": 0 },
    "topRight": { "x": 100, "y": 0 },
    "bottomLeft": { "x": 0, "y": 100 },
    "bottomRight": { "x": 100, "y": 100 }
  }
}
```

**Example:**
```json
{
  "imageUrl": "https://example.com/qr-code.png"
}
```

### Error Handling

If no QR code is found in the image:
```json
{
  "error": "No QR code found in the image"
}
```

If there's an error during processing:
```json
{
  "error": "Failed to decode QR code: <error message>"
}
```

## Hosting Options

### Local Hosting (stdio mode)

Simply run the server on your local machine with stdio transport:
```bash
MCP_TRANSPORT=stdio npm start
```

### Local Hosting (HTTP/SSE mode)

Run the server with HTTP/SSE transport:
```bash
MCP_TRANSPORT=sse PORT=3000 npm start
```

Access the server at:
- `http://localhost:3000/` - Server info
- `http://localhost:3000/health` - Health check
- `http://localhost:3000/mcp` - MCP endpoint

### Docker Hosting

Run the Docker container (defaults to HTTP/SSE mode):
```bash
docker run -p 3000:3000 ghcr.io/raman-1222/qr-code-scanner-mcp:latest
```

Or for stdio mode:
```bash
docker run -e MCP_TRANSPORT=stdio -i ghcr.io/raman-1222/qr-code-scanner-mcp:latest
```

### Cloud Hosting

The server can be deployed to any cloud platform that supports Node.js or Docker.

#### Railway Deployment

Railway is a modern platform that makes deployment easy:

1. **Fork this repository** to your GitHub account

2. **Create a new project on Railway**:
   - Go to [Railway.app](https://railway.app/)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your forked repository

3. **Railway will automatically**:
   - Detect the Dockerfile
   - Build and deploy your app
   - Assign a public URL like: `https://qr-code-scanner-mcp-production.up.railway.app`

4. **Environment Variables** (Railway sets these automatically):
   - `MCP_TRANSPORT=sse` (set by Dockerfile)
   - `PORT=3000` (set by Dockerfile)

5. **Access your deployed server**:
   - Server info: `https://your-app.up.railway.app/`
   - Health check: `https://your-app.up.railway.app/health`
   - MCP endpoint: `https://your-app.up.railway.app/mcp`

6. **Testing the deployed MCP server**:
   ```bash
   # Check server status
   curl https://your-app.up.railway.app/health
   
   # Initialize MCP session
   curl -X POST https://your-app.up.railway.app/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "initialize",
       "params": {
         "protocolVersion": "2024-11-05",
         "capabilities": {},
         "clientInfo": {
           "name": "test-client",
           "version": "1.0.0"
         }
       }
     }'
   ```

#### Other Cloud Platforms

- **Render**: Deploy as a Web Service using the Dockerfile
- **Fly.io**: Use `fly launch` to deploy the Dockerfile
- **AWS**: Deploy to ECS, Fargate, or EC2
- **Google Cloud**: Deploy to Cloud Run or GKE
- **Azure**: Deploy to Container Instances or AKS
- **Heroku**: Deploy as a Docker container
- **DigitalOcean**: Deploy to App Platform or Droplets

For all platforms, ensure:
- The `PORT` environment variable is set (default: 3000)
- The `MCP_TRANSPORT` environment variable is set to `sse`
- The service is publicly accessible via HTTPS

## Development

### Project Structure

```
qr-code-scanner-mcp/
├── src/
│   └── index.ts          # Main server implementation
├── dist/                 # Compiled JavaScript (generated)
├── .github/
│   └── workflows/
│       └── docker-publish.yml  # CI/CD workflow
├── Dockerfile            # Docker configuration
├── package.json          # Node.js configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

### Building from Source

```bash
npm install
npm run build
```

### Running in Development Mode

```bash
npm run dev
```

## Dependencies

- **@modelcontextprotocol/sdk**: MCP server implementation
- **express**: Web framework for HTTP/SSE transport
- **cors**: Cross-origin resource sharing middleware
- **jimp**: Image processing library
- **jsqr**: QR code decoding library
- **zod**: Input validation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/raman-1222/qr-code-scanner-mcp).
