// src/test-mock.js
import server from './server.js';

console.log('Server configuration:', {
  name: server.config.name,
  version: server.config.version,
  description: server.config.description
});

// Get resources
console.log('Resources:', Object.keys(server.resources));

// Get tools
console.log('Tools:', Object.keys(server.tools));

// Test the server
async function testServer() {
  try {
    // Start the server
    await server.start();
    console.log('Server started successfully');
    
    // If convertCode tool exists, test it
    if (server.tools.convertCode) {
      const testCode = 'driver.findElement(PerfectoMobileBy.id("login-button")).click();';
      console.log('Testing code conversion with:', testCode);
      
      const result = await server.tools.convertCode.execute({
        code: testCode,
        platform: 'android'
      });
      
      console.log('Conversion result:', result);
    } else {
      console.log('convertCode tool not found');
    }
    
    // Stop the server
    await server.stop();
    console.log('Server stopped successfully');
  } catch (error) {
    console.error('Error testing server:', error);
  }
}

// Run the test
testServer();