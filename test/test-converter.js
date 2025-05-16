// test-converter.js
import { convertCode } from '../src/converter.js';
import { conversionRules } from '../src/conversionRules.js';  // Make sure this path is correct

// Sample Perfecto code to test
const perfectoCode = `
driver.findElement(PerfectoMobileBy.name("Login")).click();
driver.executeScript("mobile:application:close", ImmutableMap.of("name", "Calculator"));
`;

async function runTest() {
  try {
    // Make sure conversionRules is properly imported and has the expected structure
    if (!conversionRules || !conversionRules.data) {
      console.error('Error: conversionRules is not properly defined:', conversionRules);
      return;
    }
    
    console.error('Using conversion rules:', Object.keys(conversionRules.data));
    
    const result = await convertCode(perfectoCode, 'android', conversionRules);
    console.error('Conversion Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();