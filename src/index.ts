#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Jimp } from "jimp";
import jsQRModule from "jsqr";
import { z } from "zod";

// Handle jsQR import - it may be a default export or a module with default
const jsQR = (jsQRModule as any).default || jsQRModule;

// Constants
const NO_QR_CODE_FOUND_MESSAGE = "No QR code found in the image";

// Zod schemas for input validation
const ScanQRCodeSchema = z.object({
  imageData: z.string().describe("Base64-encoded image data (with or without data URL prefix)"),
});

const ScanQRCodeFromURLSchema = z.object({
  imageUrl: z.string().url().describe("URL of the image to scan"),
});

// Helper function to decode base64 image and extract QR code
async function decodeQRFromBase64(imageData: string): Promise<{
  data: string;
  location: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
} | null> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64");
    
    // Read image with Jimp
    const image = await Jimp.read(buffer);
    
    // Get image data in the format jsQR expects
    const imageData2 = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height,
    };
    
    // Decode QR code
    const code = jsQR(imageData2.data, imageData2.width, imageData2.height);
    
    if (!code) {
      return null;
    }
    
    return {
      data: code.data,
      location: {
        topLeft: { x: code.location.topLeftCorner.x, y: code.location.topLeftCorner.y },
        topRight: { x: code.location.topRightCorner.x, y: code.location.topRightCorner.y },
        bottomLeft: { x: code.location.bottomLeftCorner.x, y: code.location.bottomLeftCorner.y },
        bottomRight: { x: code.location.bottomRightCorner.x, y: code.location.bottomRightCorner.y },
      },
    };
  } catch (error) {
    throw new Error(`Failed to decode QR code: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to fetch image from URL and decode QR code
async function decodeQRFromURL(imageUrl: string): Promise<{
  data: string;
  location: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
} | null> {
  try {
    // Fetch and read image
    const image = await Jimp.read(imageUrl);
    
    // Get image data in the format jsQR expects
    const imageData = {
      data: new Uint8ClampedArray(image.bitmap.data),
      width: image.bitmap.width,
      height: image.bitmap.height,
    };
    
    // Decode QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (!code) {
      return null;
    }
    
    return {
      data: code.data,
      location: {
        topLeft: { x: code.location.topLeftCorner.x, y: code.location.topLeftCorner.y },
        topRight: { x: code.location.topRightCorner.x, y: code.location.topRightCorner.y },
        bottomLeft: { x: code.location.bottomLeftCorner.x, y: code.location.bottomLeftCorner.y },
        bottomRight: { x: code.location.bottomRightCorner.x, y: code.location.bottomRightCorner.y },
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch or decode QR code from URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Create MCP server
const server = new Server(
  {
    name: "qr-code-scanner-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  {
    name: "scan_qr_code",
    description: "Scan QR codes from base64-encoded images. Returns the decoded content and location coordinates of the QR code.",
    inputSchema: {
      type: "object",
      properties: {
        imageData: {
          type: "string",
          description: "Base64-encoded image data (with or without data URL prefix)",
        },
      },
      required: ["imageData"],
    },
  },
  {
    name: "scan_qr_code_from_url",
    description: "Scan QR codes from image URLs. Fetches the image from the provided URL and returns the decoded content and location coordinates.",
    inputSchema: {
      type: "object",
      properties: {
        imageUrl: {
          type: "string",
          description: "URL of the image to scan",
        },
      },
      required: ["imageUrl"],
    },
  },
];

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "scan_qr_code": {
        const { imageData } = ScanQRCodeSchema.parse(args);
        const result = await decodeQRFromBase64(imageData);
        
        if (!result) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: NO_QR_CODE_FOUND_MESSAGE }, null, 2),
              },
            ],
          };
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "scan_qr_code_from_url": {
        const { imageUrl } = ScanQRCodeFromURLSchema.parse(args);
        const result = await decodeQRFromURL(imageUrl);
        
        if (!result) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ error: NO_QR_CODE_FOUND_MESSAGE }, null, 2),
              },
            ],
          };
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { error: "Invalid input", details: error.errors },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { error: error instanceof Error ? error.message : String(error) },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("QR Code Scanner MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
