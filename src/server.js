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

// Start the server
server.start().then(() => {
  console.log(`Server started and listening on port ${server.config.port}`);
}).catch(error => {
  console.error('Failed to start server:', error);
});

// Handle process signals to gracefully shut down
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.stop().then(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});

// Export the server instance
export default server;