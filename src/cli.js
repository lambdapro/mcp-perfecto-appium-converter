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
  --host HOST      Specify the host to bind to (default: localhost)
  --verbose        Enable verbose logging
  --keep-alive     Keep the server running with a ping interval
  --test           Run a quick health check and exit

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
  if (isNaN(port)) {
    console.error(`Invalid port: ${process.argv[portIndex + 1]}`);
    process.exit(1);
  }
}

// Parse host from command line arguments
let host = 'localhost';
const hostIndex = process.argv.indexOf('--host');
if (hostIndex !== -1 && process.argv.length > hostIndex + 1) {
  host = process.argv[hostIndex + 1];
}

// Parse verbose flag
const verbose = process.argv.includes('--verbose');

// Parse keep-alive flag
const keepAlive = process.argv.includes('--keep-alive');

// Parse test flag
const testMode = process.argv.includes('--test');

// Configure server based on command line arguments
server.config.port = port;
server.config.host = host;
server.config.logLevel = verbose ? 'debug' : 'info';

// Start the server
server.start(keepAlive).then(() => {
  // If in test mode, just ping and exit
  if (testMode) {
    const pingResult = server.ping();
    console.log('Server health check:', pingResult);
    server.stop().then(() => {
      console.log('Test complete, server stopped');
      process.exit(0);
    });
    return;
  }

  console.log(`
  ┌────────────────────────────────────────────┐
  │  MCP Perfecto-to-Appium Converter Server   │
  │  v${server.config.version.padEnd(38, ' ')}│
  │  Running on http://${host}:${port.toString().padEnd(19, ' ')}│
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

  if (keepAlive) {
    console.log('Keep-alive mode enabled - server will stay running');
  }

  // Set up a simple interval for server health check if not in keep-alive mode
  // This doesn't keep the process alive but provides periodic health status
  if (verbose && !keepAlive) {
    const statusInterval = setInterval(() => {
      const pingResult = server.ping();
      console.log(`[${new Date().toISOString()}] Server status:`, pingResult.status);
    }, 60000); // Check every minute
    
    // Don't let this interval keep the process alive if we want to exit
    statusInterval.unref();
  }
}).catch(error => {
  console.error('Failed to start MCP Server:', error);
  process.exit(1);
});