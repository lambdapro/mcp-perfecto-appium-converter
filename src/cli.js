#!/usr/bin/env node

import server from './server.js';

// Check for --version or -v flag
if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(`MCP Perfecto-to-Appium Converter v${server.config.version}`);
  process.exit(0);
}

// Check for --help or -h flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
MCP Perfecto-to-Appium Converter

Usage:
  mcp-perfecto-appium-converter [options]

Options:
  -v, --version    Display the version number
  -h, --help       Display this help message
  --port PORT      Specify the port to use (default: 8000)
  --verbose        Enable verbose logging

Description:
  This is a Model Context Protocol (MCP) server that converts Perfecto
  mobile automation code to Appium code. It can be used standalone or
  integrated with Claude Desktop.
  `);
  process.exit(0);
}

// Parse port from command line arguments
let port = 8000;
const portIndex = process.argv.indexOf('--port');
if (portIndex !== -1 && process.argv.length > portIndex + 1) {
  port = parseInt(process.argv[portIndex + 1], 10);
}

// Parse verbose flag
const verbose = process.argv.includes('--verbose');

// Configure server based on command line arguments
server.config.port = port;
server.config.logLevel = verbose ? 'debug' : 'info';

// Start the server
server.start().then(() => {
  console.log(`
  ┌────────────────────────────────────────────┐
  │  MCP Perfecto-to-Appium Converter Server   │
  │  v${server.config.version.padEnd(38, ' ')}│
  │  Running on port: ${port.toString().padEnd(25, ' ')}│
  │  Type Ctrl+C to stop                       │
  └────────────────────────────────────────────┘

  Ready to convert Perfecto code to Appium!
  `);

  if (verbose) {
    console.log('Registered Tools:');
    Object.keys(server.tools).forEach(tool => {
      console.log(`- ${tool}: ${server.tools[tool].description}`);
    });
    
    console.log('\nRegistered Resources:');
    Object.keys(server.resources).forEach(resource => {
      console.log(`- ${resource}`);
    });
  }
}).catch(error => {
  console.error('Failed to start MCP Server:', error);
  process.exit(1);
});