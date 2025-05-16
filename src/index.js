#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { convertCode, convertFile, validateCode } from './converter.js';
import { conversionRules } from './conversionRules.js';
import { EventEmitter } from 'events';

// Increase the default max listeners to avoid warnings
EventEmitter.defaultMaxListeners = 25;

import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  try {
    fs.mkdirSync(logsDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create logs directory:', err);
  }
}

// Setup logging
const logFile = path.join(logsDir, `mcp-${new Date().toISOString().replace(/:/g, '-')}.log`);
let logStream;
try {
  logStream = fs.createWriteStream(logFile, { flags: 'a' });
} catch (err) {
  console.error('Failed to create log stream:', err);
}

// Custom logger function
function log(level, ...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
  ).join(' ');
  
  const logLine = `${timestamp} [${level.toUpperCase()}] ${message}`;
  
  // Log to console
  if (level === 'error') {
    console.error(logLine);
  } else {
    console.error(logLine); // Use console.error for all logs since we're using stdio for communication
  }
  
  // Log to file if available
  if (logStream) {
    logStream.write(logLine + '\n');
  }
}

class ConverterServer {
  constructor() {
    log('info', 'Starting Perfecto-Appium Converter MCP server...');
    
    // Log environment info
    log('info', 'Node version:', process.version);
    log('info', 'Current directory:', process.cwd());
    log('info', 'Log file:', logFile);
    
    try {
      // Create a safer server configuration
      this.server = new Server(
        {
          name: 'perfecto-appium-converter',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {}, // Tools will be registered via handlers
          },
        }
      );
      
      log('info', 'MCP Server instance created successfully');
      
      // Set up custom error handling for the server
      this.server.onerror = (error) => {
        log('error', 'MCP Server Error:', error);
        if (error.stack) {
          log('error', 'Stack Trace:', error.stack);
        }
      };
      
      // Set up tool handlers
      this.setupToolHandlers();
      
      // Set up clean shutdown
      process.on('SIGINT', async () => {
        log('info', 'Received SIGINT, shutting down...');
        await this.cleanup();
        process.exit(0);
      });
      
      process.on('SIGTERM', async () => {
        log('info', 'Received SIGTERM, shutting down...');
        await this.cleanup();
        process.exit(0);
      });
      
      // Handle uncaught exceptions
      process.on('uncaughtException', async (error) => {
        log('error', 'Uncaught Exception:', error);
        await this.cleanup();
        process.exit(1);
      });
      
      // Handle unhandled promise rejections
      process.on('unhandledRejection', async (reason, promise) => {
        log('error', 'Unhandled Promise Rejection:', reason);
        await this.cleanup();
        process.exit(1);
      });
      
    } catch (error) {
      log('error', 'Failed to initialize server:', error);
      process.exit(1);
    }
  }
  
  async cleanup() {
    log('info', 'Running cleanup...');
    try {
      if (this.server) {
        await this.server.close();
      }
      if (logStream) {
        logStream.end();
      }
    } catch (error) {
      log('error', 'Error during cleanup:', error);
    }
  }
  
  setupToolHandlers() {
    // Handle tool listing requests
    this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
      log('info', 'Received ListTools request:', request);
      
      try {
        // Return the list of tools
        return {
          tools: [
            {
              name: 'ping',
              description: 'Simple ping test to verify MCP connection',
              parameters: {},
            },
            {
              name: 'convertCode',
              description: 'Convert Perfecto code to Appium code',
              parameters: {
                code: {
                  type: 'string',
                  description: 'Perfecto code to convert',
                  required: true
                },
                platform: {
                  type: 'string',
                  description: 'Target platform (android or ios)',
                  required: false,
                  default: 'android'
                }
              },
            },
            {
              name: 'convertFile',
              description: 'Convert a file containing Perfecto code to Appium code',
              parameters: {
                filePath: {
                  type: 'string',
                  description: 'Path to the file containing Perfecto code',
                  required: true
                },
                outputPath: {
                  type: 'string',
                  description: 'Path to save the converted Appium code',
                  required: false
                },
                platform: {
                  type: 'string',
                  description: 'Target platform (android or ios)',
                  required: false,
                  default: 'android'
                }
              },
            },
            {
              name: 'validateCode',
              description: 'Validate if the given code can be converted',
              parameters: {
                code: {
                  type: 'string',
                  description: 'Perfecto code to validate',
                  required: true
                }
              },
            }
          ],
        };
      } catch (error) {
        log('error', 'Error handling ListTools request:', error);
        throw new McpError(ErrorCode.InternalError, `Error listing tools: ${error.message}`);
      }
    });
    
    // Handle tool call requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const toolName = request.params.name;
        const args = request.params.arguments || {};
        
        log('info', `Received ${toolName} request with args:`, args);
        
        // Check for invalid or missing parameters
        if (!toolName) {
          throw new McpError(ErrorCode.InvalidArgument, 'Tool name is required');
        }
        
        let result;
        
        switch (toolName) {
          case 'ping':
            log('info', 'Processing ping request');
            return {
              content: [{ 
                type: 'text', 
                text: 'Pong! Perfecto-Appium Converter MCP server is working properly.'
              }]
            };
            
          case 'convertCode':
            if (!args.code) {
              throw new McpError(ErrorCode.InvalidArgument, 'Code parameter is required');
            }
            
            log('info', `Converting code (${args.code.length} chars) for platform: ${args.platform || 'android'}`);
            
            try {
              result = await convertCode(args.code, args.platform || 'android', conversionRules);
              log('info', 'Code conversion successful');
              
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(result, null, 2)
                }]
              };
            } catch (conversionError) {
              log('error', 'Error during code conversion:', conversionError);
              throw new McpError(
                ErrorCode.ToolExecutionError, 
                `Error converting code: ${conversionError.message}`
              );
            }
            
          case 'convertFile':
            if (!args.filePath) {
              throw new McpError(ErrorCode.InvalidArgument, 'File path parameter is required');
            }
            
            log('info', `Converting file: ${args.filePath} for platform: ${args.platform || 'android'}`);
            
            try {
              result = await convertFile(
                args.filePath, 
                args.outputPath, 
                args.platform || 'android', 
                conversionRules
              );
              
              log('info', 'File conversion successful:', result.outputFile);
              
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(result, null, 2)
                }]
              };
            } catch (fileError) {
              log('error', 'Error during file conversion:', fileError);
              throw new McpError(
                ErrorCode.ToolExecutionError, 
                `Error converting file: ${fileError.message}`
              );
            }
            
          case 'validateCode':
            if (!args.code) {
              throw new McpError(ErrorCode.InvalidArgument, 'Code parameter is required');
            }
            
            log('info', `Validating code (${args.code.length} chars)`);
            
            try {
              result = await validateCode(args.code, conversionRules);
              log('info', 'Code validation result:', result.isConvertible ? 'Convertible' : 'Not convertible');
              
              return {
                content: [{ 
                  type: 'text', 
                  text: JSON.stringify(result, null, 2)
                }]
              };
            } catch (validationError) {
              log('error', 'Error during code validation:', validationError);
              throw new McpError(
                ErrorCode.ToolExecutionError, 
                `Error validating code: ${validationError.message}`
              );
            }
            
          default:
            log('error', `Unknown tool requested: ${toolName}`);
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
      } catch (error) {
        // Handle errors properly
        if (error instanceof McpError) {
          throw error; // Re-throw McpError as is
        }
        
        log('error', 'Unexpected error processing request:', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Internal server error: ${error.message}`
        );
      }
    });
    
    log('info', 'Tool handlers set up successfully');
  }
  
  async run() {
    try {
      log('info', 'Creating StdioServerTransport');
      
      // Create a custom transport with error handling
      const transport = new StdioServerTransport({
        // Add any additional options if supported
      });
      
      log('info', 'Connecting server to transport...');
      await this.server.connect(transport);
      
      log('info', 'Perfecto-Appium Converter MCP server running on stdio transport');
      log('info', 'Ready to accept requests');
      
    } catch (error) {
      log('error', 'Failed to start server:', error);
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Main execution
try {
  const server = new ConverterServer();
  server.run().catch(async (error) => {
    log('error', 'Fatal error running server:', error);
    await server.cleanup();
    process.exit(1);
  });
} catch (error) {
  log('error', 'Fatal error during server initialization:', error);
  if (logStream) {
    logStream.end();
  }
  process.exit(1);
}