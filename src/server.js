// src/server.js
import { FastMCP } from './utils/simpleMCP.js';
import registerResources from './resources/index.js';
import registerTools from './tools/index.js';

// Allow environment variable configuration
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'localhost';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Create a server
const server = new FastMCP({
  name: 'MCP Perfecto-to-Appium Converter',
  version: '1.0.0',
  description: 'MCP server for converting Perfecto mobile automation code to Appium code',
  port: PORT,
  host: HOST,
  logLevel: LOG_LEVEL
});

// Add error handler for global process failures
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Log but don't exit - let the server continue if possible
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // Log but don't exit - let the server continue if possible
});

// Register all resources
try {
  registerResources(server);
} catch (error) {
  console.error('Error registering resources:', error);
}

// Register all tools
try {
  registerTools(server);
} catch (error) {
  console.error('Error registering tools:', error);
}

// Export the server instance
export default server;