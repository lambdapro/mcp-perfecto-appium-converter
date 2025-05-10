// src/tools/index.js
import { convertCode, convertFile, validateCode } from './converter.js';

/**
 * Register all tools with the server
 * @param {Object} server - The server instance
 */
export default function registerTools(server) {
  // Register code conversion tool
  server.registerTool('convertCode', {
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
    handler: async ({ code, platform }) => {
      return await convertCode(code, platform, server.resources.conversionRules);
    }
  });

  // Register file conversion tool
  server.registerTool('convertFile', {
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
    handler: async ({ filePath, outputPath, platform }) => {
      return await convertFile(filePath, outputPath, platform, server.resources.conversionRules);
    }
  });

  // Register code validation tool
  server.registerTool('validateCode', {
    description: 'Validate if the given code can be converted',
    parameters: {
      code: {
        type: 'string',
        description: 'Perfecto code to validate',
        required: true
      }
    },
    handler: async ({ code }) => {
      return await validateCode(code, server.resources.conversionRules);
    }
  });
}