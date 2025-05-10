// src/server.js
import { FastMCP } from './utils/simpleMCP.js';
import registerResources from './resources/index.js';
import registerTools from './tools/index.js';

// Create a server
const server = new FastMCP({
  name: 'MCP Perfecto-to-Appium Converter',
  version: '1.0.0',
  description: 'MCP server for converting Perfecto mobile automation code to Appium code',
  port: 8000,
  logLevel: 'info'
});

// Register all resources
registerResources(server);

// Register all tools
registerTools(server);

// Export the server instance
export default server;