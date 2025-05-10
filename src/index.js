// src/index.js
import server from './server.js';

// Start the server
server.start().then(() => {
  console.log('MCP Perfecto-to-Appium Server started successfully');
  console.log(`Server name: ${server.config.name}`);
  console.log(`Version: ${server.config.version}`);
  console.log(`Description: ${server.config.description}`);
  console.log('Ready to convert Perfecto code to Appium!');
}).catch(error => {
  console.error('Failed to start MCP Server:', error);
});