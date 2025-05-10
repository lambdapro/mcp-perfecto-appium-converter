import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

/**
 * Convert Perfecto code to Appium code
 * @param {string} code - Perfecto code to convert
 * @param {string} platform - Target platform (android or ios)
 * @param {Object} rules - Conversion rules resource
 * @returns {Object} - Result of conversion with original and converted code
 */
export async function convertCode(code, platform = 'android', rulesResource) {
  try {
    // Get all conversion rules
    const allRules = [
      ...rulesResource.data.elementFinding,
      ...rulesResource.data.gestures,
      ...rulesResource.data.application
    ];

    // Apply each rule to the code
    let convertedCode = code;
    for (const rule of allRules) {
      if (typeof rule.replacement === 'function') {
        // Handle function-based replacements
        convertedCode = convertedCode.replace(rule.pattern, rule.replacement);
      } else {
        // Handle string-based replacements
        convertedCode = convertedCode.replace(rule.pattern, rule.replacement);
      }
    }

    // Add necessary imports for Appium
    const imports = [
      'import org.openqa.selenium.By;',
      'import io.appium.java_client.AppiumBy;',
      'import com.google.common.collect.ImmutableMap;'
    ];
    
    // Check if imports are already present
    if (!imports.some(imp => convertedCode.includes(imp))) {
      convertedCode = imports.join('\n') + '\n\n' + convertedCode;
    }

    // Platform-specific adjustments
    if (platform === 'ios') {
      // Make iOS-specific adjustments here
      convertedCode = convertedCode.replace(/\/\/ For iOS:\n\/\/ /g, '');
      convertedCode = convertedCode.replace(/\/\/ For Android:\n[^\n]+\n/g, '');
    } else {
      // Make Android-specific adjustments here
      convertedCode = convertedCode.replace(/\/\/ For Android:\n/g, '');
      convertedCode = convertedCode.replace(/\/\/ For iOS:\n\/\/ [^\n]+\n/g, '');
    }

    return {
      status: 'success',
      originalCode: code,
      convertedCode: convertedCode,
      platform: platform
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      originalCode: code
    };
  }
}

/**
 * Convert a file containing Perfecto code to Appium code
 * @param {string} filePath - Path to the file containing Perfecto code
 * @param {string} outputPath - Path to save the converted Appium code
 * @param {string} platform - Target platform (android or ios)
 * @param {Object} rules - Conversion rules resource
 * @returns {Object} - Result of file conversion
 */
export async function convertFile(filePath, outputPath, platform = 'android', rulesResource) {
  try {
    // Check if input file exists
    if (!fs.existsSync(filePath)) {
      return {
        status: 'error',
        message: `Input file not found: ${filePath}`
      };
    }

    // Read the input file
    const code = await fsPromises.readFile(filePath, 'utf8');

    // Convert the code
    const result = await convertCode(code, platform, rulesResource);

    if (result.status === 'error') {
      return result;
    }

    // Determine output path if not provided
    if (!outputPath) {
      const parsedPath = path.parse(filePath);
      outputPath = path.join(parsedPath.dir, `converted_${parsedPath.base}`);
    }

    // Write the converted code to the output file
    await fsPromises.writeFile(outputPath, result.convertedCode, 'utf8');

    return {
      status: 'success',
      inputFile: filePath,
      outputFile: outputPath,
      message: 'File converted successfully'
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      inputFile: filePath
    };
  }
}

/**
 * Validate if the given code can be converted
 * @param {string} code - Perfecto code to validate
 * @param {Object} rules - Conversion rules resource
 * @returns {Object} - Validation result
 */
export async function validateCode(code, rulesResource) {
  try {
    // Get all patterns from conversion rules
    const allPatterns = [
      ...rulesResource.data.elementFinding.map(rule => rule.pattern),
      ...rulesResource.data.gestures.map(rule => rule.pattern),
      ...rulesResource.data.application.map(rule => rule.pattern)
    ];

    // Check if any pattern matches the code
    const matchingPatterns = [];
    for (const pattern of allPatterns) {
      // Reset the regex's lastIndex to start matching from the beginning
      pattern.lastIndex = 0;
      
      if (pattern.test(code)) {
        matchingPatterns.push(pattern.toString());
      }
    }

    // Check if code contains any recognizable Perfecto patterns
    const isPerfectoCode = code.includes('PerfectoMobileBy') || 
                          code.includes('mobile:application:') ||
                          code.includes('mobile:touch:');

    return {
      status: 'success',
      isConvertible: matchingPatterns.length > 0 || isPerfectoCode,
      matchingPatterns: matchingPatterns,
      isPerfectoCode: isPerfectoCode
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message
    };
  }
}