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
    // Get all rule categories from the conversionRules resource
    const allRuleCategories = Object.keys(rulesResource.data);
    
    // Log available rule categories for debugging
    console.log(`Found ${allRuleCategories.length} rule categories:`, allRuleCategories);
    
    // Collect all rules from all categories
    let allRules = [];
    allRuleCategories.forEach(category => {
      if (Array.isArray(rulesResource.data[category])) {
        allRules = [...allRules, ...rulesResource.data[category]];
      }
    });
    
    console.log(`Total rules collected: ${allRules.length}`);

    // Apply each rule to the code
    let convertedCode = code;
    for (const rule of allRules) {
      // Reset the regex lastIndex to start from the beginning each time
      if (rule.pattern && rule.pattern.lastIndex !== undefined) {
        rule.pattern.lastIndex = 0;
      }
      
      if (typeof rule.replacement === 'function') {
        // Handle function-based replacements
        convertedCode = convertedCode.replace(rule.pattern, rule.replacement);
      } else {
        // Handle string-based replacements
        convertedCode = convertedCode.replace(rule.pattern, rule.replacement);
      }
    }

    // Add necessary helper functions for percentage to pixel conversion
    // Only add if not already present
    if (convertedCode.includes('percentToPixel') && !convertedCode.includes('function percentToPixel')) {
      const helperFunctions = `
/**
 * Helper function to convert percentage to pixels
 * @param {string} percentage - The percentage value (may include % sign)
 * @param {number} total - The total dimension (width or height)
 * @returns {number} - The pixel value
 */
function percentToPixel(percentage, total) {
  // Remove % sign if present
  const cleanPercentage = percentage.toString().replace('%', '');
  
  // Convert to number
  const percent = parseFloat(cleanPercentage);
  
  // Calculate pixels
  return Math.round((percent / 100) * total);
}

/**
 * Helper function to get app identifier
 * @returns {string} - The app identifier
 */
function getAppIdentifier() {
  // This is a placeholder. In a real implementation, 
  // this would get the app identifier from the desired capabilities
  return "com.example.app";
}
`;
      
      // Add helper functions before the converted code
      convertedCode = helperFunctions + '\n' + convertedCode;
    }

    // Add necessary imports for Appium
    const imports = [
      'import org.openqa.selenium.By;',
      'import io.appium.java_client.AppiumBy;',
      'import com.google.common.collect.ImmutableMap;',
      'import java.time.Duration;'
    ];
    
    // Check if imports are already present
    const hasAllImports = imports.every(imp => convertedCode.includes(imp));
    if (!hasAllImports) {
      // Add any missing imports
      const missingImports = imports.filter(imp => !convertedCode.includes(imp));
      convertedCode = missingImports.join('\n') + '\n\n' + convertedCode;
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
      platform: platform,
      rulesApplied: allRules.length
    };
  } catch (error) {
    console.error('Error in convertCode:', error);
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
      message: 'File converted successfully',
      rulesApplied: result.rulesApplied
    };
  } catch (error) {
    console.error('Error in convertFile:', error);
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
    // Get all rule categories
    const allRuleCategories = Object.keys(rulesResource.data);
    
    // Collect all patterns from all rule categories
    let allPatterns = [];
    allRuleCategories.forEach(category => {
      if (Array.isArray(rulesResource.data[category])) {
        allPatterns = [
          ...allPatterns, 
          ...rulesResource.data[category].map(rule => rule.pattern)
        ];
      }
    });

    // Check if any pattern matches the code
    const matchingPatterns = [];
    for (const pattern of allPatterns) {
      // Reset the regex's lastIndex to start matching from the beginning
      if (pattern && pattern.lastIndex !== undefined) {
        pattern.lastIndex = 0;
      }
      
      if (pattern && pattern.test(code)) {
        matchingPatterns.push(pattern.toString());
      }
    }

    // Check if code contains any recognizable Perfecto patterns
    const isPerfectoCode = code.includes('PerfectoMobileBy') || 
                          code.includes('mobile:application:') ||
                          code.includes('mobile:touch:') ||
                          code.includes('mobile:device:') ||
                          code.includes('mobile:keyboard:') ||
                          code.includes('mobile:button-text:') ||
                          code.includes('mobile:edit-text:') ||
                          code.includes('mobile:text:') ||
                          code.includes('mobile:checkpoint:') ||
                          code.includes('mobile:image:') ||
                          code.includes('mobile:scroll') ||
                          code.includes('mobile:location:') ||
                          code.includes('mobile:notifications:') ||
                          code.includes('mobile:timer:') ||
                          code.includes('mobile:browser:') ||
                          code.includes('mobile:network:');

    // Determine which categories matched
    const matchedCategories = {};
    allRuleCategories.forEach(category => {
      if (Array.isArray(rulesResource.data[category])) {
        const categoryPatterns = rulesResource.data[category].map(rule => rule.pattern.toString());
        
        // Check if any patterns from this category matched
        const hasMatch = matchingPatterns.some(pattern => 
          categoryPatterns.includes(pattern)
        );
        
        if (hasMatch) {
          matchedCategories[category] = true;
        }
      }
    });

    return {
      status: 'success',
      isConvertible: matchingPatterns.length > 0 || isPerfectoCode,
      matchingPatterns: matchingPatterns,
      isPerfectoCode: isPerfectoCode,
      matchedCategories: Object.keys(matchedCategories)
    };
  } catch (error) {
    console.error('Error in validateCode:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}