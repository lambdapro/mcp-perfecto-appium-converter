/**
 * Conversion rules for transforming Perfecto code to Appium code
 */
const conversionRules = {
  elementFinding: [
    {
      pattern: /PerfectoMobileBy\.id\("([^"]+)"\)/g,
      replacement: 'By.id("$1")',
      description: 'Convert PerfectoMobileBy.id to By.id'
    },
    {
      pattern: /PerfectoMobileBy\.accessibilityId\("([^"]+)"\)/g,
      replacement: 'AppiumBy.accessibilityId("$1")',
      description: 'Convert PerfectoMobileBy.accessibilityId to AppiumBy.accessibilityId'
    },
    {
      pattern: /PerfectoMobileBy\.xpath\("([^"]+)"\)/g,
      replacement: 'By.xpath("$1")',
      description: 'Convert PerfectoMobileBy.xpath to By.xpath'
    },
    {
      pattern: /PerfectoMobileBy\.className\("([^"]+)"\)/g,
      replacement: 'By.className("$1")',
      description: 'Convert PerfectoMobileBy.className to By.className'
    }
  ],
  
  gestures: [
    {
      pattern: /driver\.executeScript\("mobile:application:open", "{'name':'([^']+)'}"(?:.*)\)/g,
      replacement: (match, appName) => {
        return `// For Android:\ndriver.executeScript("mobile: shell", ImmutableMap.of("command", "am start -n com.example.${appName.toLowerCase()}/.MainActivity"));\n// For iOS:\n// driver.executeScript("mobile: launchApp", ImmutableMap.of("bundleId", "com.example.${appName.toLowerCase()}"));`;
      },
      description: 'Convert mobile:application:open to platform-specific app launch'
    },
    {
      pattern: /driver\.executeScript\("mobile:touch:tap", "{'duration':(\d+)(?:.*)}"\)/g,
      replacement: 'driver.executeScript("mobile: longClickGesture", ImmutableMap.of("duration", $1))',
      description: 'Convert mobile:touch:tap with duration to longClickGesture'
    },
    {
      pattern: /driver\.executeScript\("mobile:touch:swipe", "{'start':(\d+),(\d+),'end':(\d+),(\d+)(?:.*)}"\)/g,
      replacement: 'driver.executeScript("mobile: swipeGesture", ImmutableMap.of("startX", $1, "startY", $2, "endX", $3, "endY", $4))',
      description: 'Convert mobile:touch:swipe to swipeGesture'
    }
  ],
  
  application: [
    {
      pattern: /driver\.executeScript\("mobile:application:close", "{'name':'([^']+)'}"(?:.*)\)/g,
      replacement: (match, appName) => {
        return `// For Android:\ndriver.terminateApp("com.example.${appName.toLowerCase()}");\n// For iOS:\n// driver.terminateApp("com.example.${appName.toLowerCase()}");`;
      },
      description: 'Convert mobile:application:close to terminateApp'
    },
    {
      pattern: /driver\.executeScript\("mobile:application:install", "{'file':'([^']+)'}"(?:.*)\)/g,
      replacement: 'driver.installApp("$1")',
      description: 'Convert mobile:application:install to installApp'
    }
  ]
};

export default conversionRules;