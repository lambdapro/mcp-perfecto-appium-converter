// src/utils/simpleMCP.js
import http from 'http';

/**
 * A simple implementation of an MCP server
 * Enhanced with stability improvements while maintaining original design
 */
export class FastMCP {
    constructor(config) {
      this.config = config || {};
      this.resources = {};
      this.tools = {};
      this.server = null;
      this.isRunning = false;
      
      // Set default values
      this.config.port = this.config.port || 8000;
      this.config.logLevel = this.config.logLevel || 'info';
      this.config.host = this.config.host || 'localhost';
      this.keepAliveInterval = null;
      
      this.setupLogging();
      this.log(`Created server: ${this.config.name} v${this.config.version}`);
    }
    
    /**
     * Setup simple logging based on log level
     */
    setupLogging() {
      const logLevels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
      };
      
      this.logLevel = logLevels[this.config.logLevel] || 1;
    }
    
    /**
     * Log a message if log level is appropriate
     */
    log(message, level = 'info') {
      const logLevels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
      };
      
      if (logLevels[level] >= this.logLevel) {
        console.log(`[${level.toUpperCase()}] ${message}`);
      }
    }
    
    /**
     * Register a resource
     * @param {string} name - Resource name
     * @param {Object} resource - Resource object
     * @returns {FastMCP} - The server instance
     */
    registerResource(name, resource) {
      this.log(`Registering resource: ${name}`);
      this.resources[name] = resource;
      return this;
    }
    
    /**
     * Register a tool
     * @param {string} name - Tool name
     * @param {Object} tool - Tool object
     * @returns {FastMCP} - The server instance
     */
    registerTool(name, tool) {
      this.log(`Registering tool: ${name}`);
      this.tools[name] = tool;
      
      // Add execute method to the tool
      this.tools[name].execute = async (params) => {
        this.log(`Executing tool: ${name}`);
        try {
          return await tool.handler(params);
        } catch (error) {
          this.log(`Error executing tool ${name}: ${error.message}`, 'error');
          return {
            status: 'error',
            message: error.message
          };
        }
      };
      
      return this;
    }
    
    /**
     * Parse the request body as JSON
     * @param {http.IncomingMessage} req - The request object
     * @returns {Promise<Object>} - The parsed body
     */
    async parseBody(req) {
      return new Promise((resolve, reject) => {
        let body = '';
        
        req.on('data', chunk => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            if (body) {
              resolve(JSON.parse(body));
            } else {
              resolve({});
            }
          } catch (error) {
            reject(error);
          }
        });
        
        req.on('error', reject);
      });
    }
    
    /**
     * Handle HTTP requests (simple internal router)
     * @param {http.IncomingMessage} req - The request object
     * @param {http.ServerResponse} res - The response object
     */
    async handleRequest(req, res) {
      try {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Handle preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }
        
        // Handle health check endpoint
        if (req.url === '/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'ok',
            version: this.config.version,
            name: this.config.name
          }));
          return;
        }
        
        // List all tools
        if (req.url === '/tools' && req.method === 'GET') {
          const toolList = Object.keys(this.tools).map(name => ({
            name,
            description: this.tools[name].description,
            parameters: this.tools[name].parameters
          }));
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'success',
            tools: toolList
          }));
          return;
        }
        
        // Handle tool execution
        if (req.url.startsWith('/tools/') && req.method === 'POST') {
          const toolName = req.url.slice(7); // Remove /tools/
          
          if (!this.tools[toolName]) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'error',
              message: `Tool not found: ${toolName}`
            }));
            return;
          }
          
          try {
            // Parse request body
            const params = await this.parseBody(req);
            this.log(`Executing tool ${toolName} with params: ${JSON.stringify(params)}`, 'debug');
            
            // Execute the tool
            const result = await this.tools[toolName].execute(params);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
          } catch (error) {
            this.log(`Error executing tool ${toolName}: ${error.message}`, 'error');
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'error',
              message: `Error parsing request: ${error.message}`
            }));
          }
          
          return;
        }
        
        // List all resources
        if (req.url === '/resources' && req.method === 'GET') {
          const resourceList = Object.keys(this.resources).map(name => ({
            name,
            description: this.resources[name].description
          }));
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'success',
            resources: resourceList
          }));
          return;
        }
        
        // Access a resource
        if (req.url.startsWith('/resources/') && req.method === 'GET') {
          const resourceName = req.url.slice(11); // Remove /resources/
          
          if (!this.resources[resourceName]) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'error',
              message: `Resource not found: ${resourceName}`
            }));
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'success',
            data: this.resources[resourceName].data
          }));
          return;
        }
        
        // Server info
        if (req.url === '/info' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            name: this.config.name,
            version: this.config.version,
            description: this.config.description,
            tools: Object.keys(this.tools),
            resources: Object.keys(this.resources)
          }));
          return;
        }
        
        // Default response for unhandled routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error', 
          message: 'Endpoint not found',
          url: req.url,
          method: req.method
        }));
      } catch (error) {
        this.log(`Error handling request: ${error.message}`, 'error');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'error',
          message: 'Internal server error'
        }));
      }
    }
    
    /**
     * Start the server
     * @param {boolean} keepAlive - Whether to keep the server alive with a ping
     * @returns {Promise<FastMCP>} - The server instance
     */
    async start(keepAlive = false) {
      if (this.isRunning) {
        this.log('Server is already running', 'warn');
        return this;
      }
      
      return new Promise((resolve, reject) => {
        try {
          // Create a basic HTTP server
          this.server = http.createServer(async (req, res) => {
            await this.handleRequest(req, res).catch(error => {
              this.log(`Error in request handler: ${error.message}`, 'error');
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                status: 'error',
                message: 'Internal server error'
              }));
            });
          });
          
          // Handle server errors
          this.server.on('error', (error) => {
            this.log(`Server error: ${error.message}`, 'error');
            // Don't reject as this would cause the promise to fail
            // Instead, log and attempt to keep running
            
            // If it's a fatal error like EADDRINUSE, we should reject
            if (
              error.code === 'EADDRINUSE' || 
              error.code === 'EACCES' || 
              error.code === 'EAFNOSUPPORT'
            ) {
              reject(error);
            }
          });
          
          // Handle client errors to prevent crashing
          this.server.on('clientError', (error, socket) => {
            this.log(`Client error: ${error.message}`, 'error');
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
          });
          
          // Start listening
          this.server.listen(this.config.port, this.config.host, () => {
            this.isRunning = true;
            this.log(`Server started on http://${this.config.host}:${this.config.port}`);
            
            // Setup keep-alive if requested
            if (keepAlive) {
              this.startKeepAlive();
            }
            
            // Setup signal handlers
            this.setupSignalHandlers();
            
            resolve(this);
          });
        } catch (error) {
          this.log(`Error starting server: ${error.message}`, 'error');
          reject(error);
        }
      });
    }
    
    /**
     * Setup signal handlers for graceful shutdown
     */
    setupSignalHandlers() {
      // Handle Ctrl+C
      process.on('SIGINT', () => {
        this.log('Received SIGINT signal, shutting down gracefully');
        this.stop().catch(error => {
          this.log(`Error during shutdown: ${error.message}`, 'error');
          process.exit(1);
        });
      });
      
      // Handle termination signal
      process.on('SIGTERM', () => {
        this.log('Received SIGTERM signal, shutting down gracefully');
        this.stop().catch(error => {
          this.log(`Error during shutdown: ${error.message}`, 'error');
          process.exit(1);
        });
      });
      
      // Keep process alive on uncaught exceptions, but log them
      process.on('uncaughtException', (error) => {
        this.log(`Uncaught exception: ${error.message}\n${error.stack}`, 'error');
      });
      
      // Handle unhandled promise rejections
      process.on('unhandledRejection', (reason, promise) => {
        this.log(`Unhandled promise rejection at: ${promise}\nReason: ${reason}`, 'error');
      });
    }
    
    /**
     * Start a keep-alive interval to prevent the process from exiting
     */
    startKeepAlive() {
      this.log('Starting keep-alive mechanism');
      
      // Clear any existing interval
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
      }
      
      // Set up a new interval
      this.keepAliveInterval = setInterval(() => {
        this.log('Keep-alive ping', 'debug');
      }, 30000); // Every 30 seconds
      
      // Prevent the keep-alive interval from keeping the process alive if we want to exit
      this.keepAliveInterval.unref();
    }
    
    /**
     * Stop the server
     * @returns {Promise<FastMCP>} - The server instance
     */
    async stop() {
      if (!this.isRunning || !this.server) {
        this.log('Server is not running', 'warn');
        return this;
      }
      
      // Clear keep-alive interval if it exists
      if (this.keepAliveInterval) {
        clearInterval(this.keepAliveInterval);
        this.keepAliveInterval = null;
      }
      
      return new Promise((resolve, reject) => {
        try {
          this.server.close((error) => {
            if (error) {
              this.log(`Error closing server: ${error.message}`, 'error');
              reject(error);
              return;
            }
            
            this.isRunning = false;
            this.log('Server stopped');
            resolve(this);
          });
        } catch (error) {
          this.log(`Error stopping server: ${error.message}`, 'error');
          reject(error);
        }
      });
    }
    
    /**
     * Ping the server to check if it's alive
     * @returns {Object} - Ping response
     */
    ping() {
      return {
        status: this.isRunning ? 'ok' : 'stopped',
        uptime: process.uptime(),
        version: this.config.version,
        name: this.config.name
      };
    }
}