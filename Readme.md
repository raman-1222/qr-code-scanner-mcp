# QR Code Scanner MCP

A Model Context Protocol (MCP) server that enables QR code scanning capabilities for any MCP-compatible LLM client. This server can decode QR codes from base64-encoded images or from image URLs.

## Features

- 🔍 Scan QR codes from base64-encoded images
- 🌐 Scan QR codes from image URLs
- 📍 Returns decoded content with precise location coordinates
- 🔒 Secure stdio-based communication
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

### As a Standalone Server

Run the server directly:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### With Claude Desktop

Add the following to your Claude Desktop configuration file:

**On macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**On Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "qr-code-scanner": {
      "command": "node",
      "args": ["/absolute/path/to/qr-code-scanner-mcp/dist/index.js"]
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
      "args": ["-y", "qr-code-scanner-mcp"]
    }
  }
}
```

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

### Local Hosting

Simply run the server on your local machine:
```bash
npm start
```

### Docker Hosting

Run the Docker container:
```bash
docker run -i ghcr.io/raman-1222/qr-code-scanner-mcp:latest
```

### Cloud Hosting

The server can be deployed to any cloud platform that supports Node.js or Docker:

- **AWS**: Deploy to ECS, Fargate, or EC2
- **Google Cloud**: Deploy to Cloud Run or GKE
- **Azure**: Deploy to Container Instances or AKS
- **Heroku**: Deploy as a Docker container
- **DigitalOcean**: Deploy to App Platform or Droplets

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
- **jimp**: Image processing library
- **jsqr**: QR code decoding library
- **zod**: Input validation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/raman-1222/qr-code-scanner-mcp).
