// src/utils/simpleMCP.js
/**
 * A simple implementation of an MCP server
 */
export class FastMCP {
    constructor(config) {
      this.config = config || {};
      this.resources = {};
      this.tools = {};
      
      // Set default values
      this.config.port = this.config.port || 8000;
      this.config.logLevel = this.config.logLevel || 'info';
      
      console.log(`Created server: ${this.config.name} v${this.config.version}`);
    }
    
    /**
     * Register a resource
     * @param {string} name - Resource name
     * @param {Object} resource - Resource object
     * @returns {FastMCP} - The server instance
     */
    registerResource(name, resource) {
      console.log(`Registering resource: ${name}`);
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
      console.log(`Registering tool: ${name}`);
      this.tools[name] = tool;
      
      // Add execute method to the tool
      this.tools[name].execute = async (params) => {
        console.log(`Executing tool: ${name}`);
        try {
          return await tool.handler(params);
        } catch (error) {
          console.error(`Error executing tool ${name}:`, error);
          return {
            status: 'error',
            message: error.message
          };
        }
      };
      
      return this;
    }
    
    /**
     * Start the server
     * @returns {Promise<FastMCP>} - The server instance
     */
    async start() {
      console.log(`Starting server on port ${this.config.port}...`);
      return this;
    }
    
    /**
     * Stop the server
     * @returns {Promise<FastMCP>} - The server instance
     */
    async stop() {
      console.log('Stopping server...');
      return this;
    }
  }