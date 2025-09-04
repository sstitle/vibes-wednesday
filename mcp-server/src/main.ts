import WebSocket, { WebSocketServer } from 'ws';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Initialize WebSocket server on port 3000 to match our client
const wss = new WebSocketServer({ port: 3000 });
let clientConnection: WebSocket | null = null;
let sceneState: any = { objects: [] };

console.log('Three.js MCP Server starting on port 3000...');

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected to WebSocket');
  clientConnection = ws;

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      console.log('Received command:', data);
      
      // Handle different command types from our client
      if (data.command === 'scene.create') {
        sceneState = { objects: [], sceneId: data.payload?.id || 'main-scene' };
        ws.send(JSON.stringify({ success: true, action: 'scene.create' }));
      } else if (data.command === 'scene.clear') {
        sceneState.objects = [];
        ws.send(JSON.stringify({ success: true, action: 'scene.clear' }));
      } else if (data.command === 'object.create') {
        const obj = data.payload;
        const newObject = {
          id: obj.id,
          type: obj.type,
          position: obj.properties?.position || [0, 0, 0],
          rotation: obj.properties?.rotation || [0, 0, 0],
          scale: obj.properties?.scale || [1, 1, 1],
          color: obj.properties?.materialOptions?.color || 0xff0000
        };
        sceneState.objects.push(newObject);
        console.log('Added object:', newObject);
        ws.send(JSON.stringify({ success: true, action: 'object.create', object: newObject }));
      } else if (data.command === 'object.update') {
        const { id, properties } = data.payload;
        const objIndex = sceneState.objects.findIndex((o: any) => o.id === id);
        if (objIndex !== -1) {
          Object.assign(sceneState.objects[objIndex], properties);
          ws.send(JSON.stringify({ success: true, action: 'object.update' }));
        } else {
          ws.send(JSON.stringify({ success: false, error: 'Object not found' }));
        }
      } else if (data.command === 'object.delete') {
        const { id } = data.payload;
        sceneState.objects = sceneState.objects.filter((o: any) => o.id !== id);
        ws.send(JSON.stringify({ success: true, action: 'object.delete' }));
      } else if (data.command === 'render') {
        ws.send(JSON.stringify({ success: true, action: 'render', scene: sceneState }));
      }
    } catch (e) {
      console.error('Invalid message:', message, e);
      ws.send(JSON.stringify({ success: false, error: 'Invalid message format' }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clientConnection = null;
  });
});

// Initialize MCP server for Claude integration (optional)
const server = new Server(
  { name: "threejs_mcp_server", version: "1.0.0" },
  { capabilities: { prompts: {}, tools: {} } }
);

server.onerror = (error) => {
  console.error("[MCP Error]", error);
};

process.on("SIGINT", async () => {
  console.log('Shutting down servers...');
  wss.close();
  await server.close();
  process.exit(0);
});

// Define MCP tools for Claude integration
const tools = [
  {
    name: "addObject",
    description: "Add an object to the scene",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string" },
        position: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
        color: { type: "string" }
      },
      required: ["type", "position", "color"]
    }
  },
  {
    name: "moveObject",
    description: "Move an object to a new position",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        position: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 }
      },
      required: ["id", "position"]
    }
  },
  {
    name: "removeObject",
    description: "Remove an object",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" }
      },
      required: ["id"]
    }
  },
  {
    name: "getSceneState",
    description: "Get the current scene state",
    inputSchema: { type: "object", properties: {} }
  }
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

// Handle tool calls for Claude integration
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: input } = request.params;

  console.log("MCP tool request:", name, input);

  if (name === "addObject" && clientConnection) {
    const command = { action: "addObject", ...(input as any) };
    clientConnection.send(JSON.stringify(command));
    return {
      content: [{ type: "text", text: "Object add command sent" }]
    };
  } else if (name === "getSceneState") {
    return {
      content: [{ 
        type: "text", 
        text: `Current scene state:\n${JSON.stringify(sceneState, null, 2)}` 
      }]
    };
  }
  
  return {
    content: [{ type: "text", text: "Command not implemented or no client connected" }]
  };
});

console.log('Three.js MCP Server ready on port 3000');
console.log('WebSocket server listening for client connections...'); 