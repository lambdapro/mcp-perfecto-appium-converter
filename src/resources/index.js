import conversionRules from './conversionRules.js';

/**
 * Register all resources with the MCP server
 * @param {Object} server - The FastMCP server instance
 */
export default function registerResources(server) {
  // Register the conversion rules resource
  server.registerResource('conversionRules', {
    description: 'Perfecto to Appium conversion rules',
    data: conversionRules,
    accessors: {
      // Define accessor methods to get specific rules
      getElementFindingRules: () => conversionRules.elementFinding,
      getGestureRules: () => conversionRules.gestures,
      getApplicationRules: () => conversionRules.application
    }
  });

  // Register any other resources
  server.registerResource('supportedPlatforms', {
    description: 'Platforms supported by the converter',
    data: ['android', 'ios'],
    accessors: {
      isSupported: (platform) => ['android', 'ios'].includes(platform.toLowerCase())
    }
  });
}