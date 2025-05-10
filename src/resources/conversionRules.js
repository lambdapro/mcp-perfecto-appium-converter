/**
 * Enhanced conversion rules for transforming Perfecto code to Appium code
 * Based on Perfecto extensions documentation
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
    },
    {
      pattern: /PerfectoMobileBy\.name\("([^"]+)"\)/g,
      replacement: 'By.name("$1")',
      description: 'Convert PerfectoMobileBy.name to By.name'
    },
    {
      pattern: /PerfectoMobileBy\.linkText\("([^"]+)"\)/g,
      replacement: 'By.linkText("$1")',
      description: 'Convert PerfectoMobileBy.linkText to By.linkText'
    },
    {
      pattern: /PerfectoMobileBy\.partialLinkText\("([^"]+)"\)/g,
      replacement: 'By.partialLinkText("$1")',
      description: 'Convert PerfectoMobileBy.partialLinkText to By.partialLinkText'
    },
    {
      pattern: /PerfectoMobileBy\.tagName\("([^"]+)"\)/g,
      replacement: 'By.tagName("$1")',
      description: 'Convert PerfectoMobileBy.tagName to By.tagName'
    },
    {
      pattern: /PerfectoMobileBy\.cssSelector\("([^"]+)"\)/g,
      replacement: 'By.cssSelector("$1")',
      description: 'Convert PerfectoMobileBy.cssSelector to By.cssSelector'
    }
  ],
  
  application: [
    {
      pattern: /driver\.executeScript\("mobile:application:open", (?:.+?)identifier\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: (match, appIdentifier) => {
        return `// For Android:\ndriver.executeScript("mobile: shell", ImmutableMap.of("command", "am start -n ${appIdentifier}"));\n// For iOS:\n// driver.executeScript("mobile: launchApp", ImmutableMap.of("bundleId", "${appIdentifier}"));`;
      },
      description: 'Convert mobile:application:open to platform-specific app launch'
    },
    {
      pattern: /driver\.executeScript\("mobile:application:close", (?:.+?)identifier\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: (match, appIdentifier) => {
        return `driver.terminateApp("${appIdentifier}");`;
      },
      description: 'Convert mobile:application:close to terminateApp'
    },
    {
      pattern: /driver\.executeScript\("mobile:application:install", (?:.+?)file\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: 'driver.installApp("$1")',
      description: 'Convert mobile:application:install to installApp'
    },
    {
      pattern: /driver\.executeScript\("mobile:application:uninstall", (?:.+?)identifier\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: 'driver.removeApp("$1")',
      description: 'Convert mobile:application:uninstall to removeApp'
    },
    {
      pattern: /driver\.executeScript\("mobile:application:clean", (?:.+?)identifier\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: 'driver.executeScript("mobile: clearApp", ImmutableMap.of("appId", "$1"))',
      description: 'Convert mobile:application:clean to mobile: clearApp'
    },
    {
      pattern: /driver\.executeScript\("mobile:application:background", (?:.+?)seconds\s*:\s*(\d+)(?:.+?)\)/g,
      replacement: 'driver.runAppInBackground(Duration.ofSeconds($1))',
      description: 'Convert mobile:application:background to runAppInBackground'
    },
    {
      pattern: /driver\.executeScript\("mobile:application:start", (?:.+?)name\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: (match, appName) => {
        return `// For Android:\ndriver.activateApp("${appName}");\n// For iOS:\n// driver.activateApp("${appName}");`;
      },
      description: 'Convert mobile:application:start to activateApp'
    }
  ],
  
  device: [
    {
      pattern: /driver\.executeScript\("mobile:device:info", (?:.+?)property\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: (match, property) => {
        if (property === 'model') {
          return 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "getprop ro.product.model"))';
        } else if (property === 'manufacturer') {
          return 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "getprop ro.product.manufacturer"))';
        } else if (property === 'deviceId') {
          return 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "getprop ro.serialno"))';
        } else if (property === 'currentPackage') {
          return 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "dumpsys window windows | grep -E \'mCurrentFocus\'"))';
        } else {
          return `driver.executeScript("mobile: deviceInfo", ImmutableMap.of("property", "${property}"))`;
        }
      },
      description: 'Convert mobile:device:info to appropriate Appium device info commands'
    },
    {
      pattern: /driver\.executeScript\("mobile:device:log", (?:.+?)\)/g,
      replacement: 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "logcat -d -v threadtime"))',
      description: 'Convert mobile:device:log to mobile: shell logcat command'
    },
    {
      pattern: /driver\.executeScript\("mobile:device:ready", (?:.+?)\)/g,
      replacement: 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "input keyevent 3"))',
      description: 'Convert mobile:device:ready to return to home screen'
    },
    {
      pattern: /driver\.executeScript\("mobile:device:reboot", (?:.+?)\)/g,
      replacement: 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "reboot"))',
      description: 'Convert mobile:device:reboot to mobile: shell reboot'
    },
    {
      pattern: /driver\.executeScript\("mobile:device:recovery", (?:.+?)\)/g,
      replacement: 'driver.terminateApp(getAppIdentifier()); driver.activateApp(getAppIdentifier());',
      description: 'Convert mobile:device:recovery to terminate and activate app'
    }
  ],
  
  keyboard: [
    {
      pattern: /driver\.executeScript\("mobile:presskey", (?:.+?)keySequence\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: (match, keySequence) => {
        // Handle different key sequences with more specific replacements
        if (keySequence === 'KEYBOARD_ENTER') {
          return 'driver.executeScript("mobile: pressKey", ImmutableMap.of("key", "enter"))';
        } else if (keySequence === 'BACK') {
          return 'driver.executeScript("mobile: pressKey", ImmutableMap.of("key", "back"))';
        } else if (keySequence.includes(',')) {
          // Handle complex key sequences
          return `// Multiple key sequence detected\n// Original: ${keySequence}\n` +
                 `driver.executeScript("mobile: pressKey", ImmutableMap.of("key", "${keySequence.split(',')[0].toLowerCase()}"))`;
        } else {
          return `driver.executeScript("mobile: pressKey", ImmutableMap.of("key", "${keySequence.toLowerCase()}"))`;
        }
      },
      description: 'Convert mobile:presskey to mobile: pressKey'
    },
    {
      pattern: /driver\.executeScript\("mobile:keyboard:display", (?:.+?)mode\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: (match, mode) => {
        if (mode.toLowerCase() === 'off') {
          return 'driver.hideKeyboard()';
        } else {
          return '// Keyboard display mode set to ON - no direct Appium equivalent';
        }
      },
      description: 'Convert mobile:keyboard:display to hideKeyboard'
    }
  ],
  
  gestures: [
    {
      pattern: /driver\.executeScript\("mobile:touch:tap", (?:.+?)location\s*:\s*['"]([^,]+),\s*([^,]+)(?:.+?)['"](?:.+?)\)/g,
      replacement: (match, xCoord, yCoord) => {
        return `// Convert percentage to pixel coordinates in your implementation\ndriver.executeScript("mobile: tapGesture", ImmutableMap.of(\n\t"x", percentToPixel("${xCoord}", driver.manage().window().getSize().width),\n\t"y", percentToPixel("${yCoord}", driver.manage().window().getSize().height)\n))`;
      },
      description: 'Convert mobile:touch:tap with location to tapGesture'
    },
    {
      pattern: /driver\.executeScript\("mobile:touch:tap", (?:.+?)duration\s*:\s*(\d+)(?:.+?)\)/g,
      replacement: 'driver.executeScript("mobile: longClickGesture", ImmutableMap.of("duration", $1))',
      description: 'Convert mobile:touch:tap with duration to longClickGesture'
    },
    {
      pattern: /driver\.executeScript\("mobile:touch:swipe", (?:.+?)start\s*:\s*['"]([^,]+),\s*([^,]+)['"],\s*end\s*:\s*['"]([^,]+),\s*([^,]+)['"](?:.+?)\)/g,
      replacement: (match, startX, startY, endX, endY) => {
        // Consider direction based on start and end coordinates
        const direction = getSwipeDirection(startX, startY, endX, endY);
        return `// Convert percentage to pixel coordinates in your implementation\ndriver.executeScript("mobile: swipeGesture", ImmutableMap.of(\n\t"left", percentToPixel("${startX}", driver.manage().window().getSize().width),\n\t"top", percentToPixel("${startY}", driver.manage().window().getSize().height),\n\t"width", Math.abs(percentToPixel("${endX}", driver.manage().window().getSize().width) - percentToPixel("${startX}", driver.manage().window().getSize().width)),\n\t"height", Math.abs(percentToPixel("${endY}", driver.manage().window().getSize().height) - percentToPixel("${startY}", driver.manage().window().getSize().height)),\n\t"direction", "${direction}",\n\t"percent", 0.75\n))`;
      },
      description: 'Convert mobile:touch:swipe to swipeGesture with direction detection'
    },
    {
      pattern: /driver\.executeScript\("mobile:touch:swipe", (?:.+?)start\s*:\s*['"]([^'"]+)['"],\s*end\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: (match, start, end) => {
        // Handle simple swipe with just start and end
        return `// Convert percentage to pixel coordinates in your implementation\ndriver.executeScript("mobile: swipeGesture", ImmutableMap.of(\n\t"left", 0,\n\t"top", percentToPixel("${start}", driver.manage().window().getSize().height),\n\t"width", driver.manage().window().getSize().width,\n\t"height", Math.abs(percentToPixel("${end}", driver.manage().window().getSize().height) - percentToPixel("${start}", driver.manage().window().getSize().height)),\n\t"direction", percentToPixel("${start}", driver.manage().window().getSize().height) > percentToPixel("${end}", driver.manage().window().getSize().height) ? "up" : "down",\n\t"percent", 0.75\n))`;
      },
      description: 'Convert simple mobile:touch:swipe to swipeGesture'
    },
    {
      pattern: /driver\.executeScript\("mobile:touch:drag", (?:.+?)start\s*:\s*['"]([^,]+),\s*([^,]+)['"],\s*end\s*:\s*['"]([^,]+),\s*([^,]+)['"](?:.+?)\)/g,
      replacement: (match, startX, startY, endX, endY) => {
        return `// Convert percentage to pixel coordinates in your implementation\ndriver.executeScript("mobile: dragGesture", ImmutableMap.of(\n\t"startX", percentToPixel("${startX}", driver.manage().window().getSize().width),\n\t"startY", percentToPixel("${startY}", driver.manage().window().getSize().height),\n\t"endX", percentToPixel("${endX}", driver.manage().window().getSize().width),\n\t"endY", percentToPixel("${endY}", driver.manage().window().getSize().height)\n))`;
      },
      description: 'Convert mobile:touch:drag to dragGesture'
    },
    {
      pattern: /driver\.executeScript\("mobile:touch:pinch", (?:.+?)scale\s*:\s*([\d.]+)(?:.+?)\)/g,
      replacement: (match, scale) => {
        const mode = parseFloat(scale) > 1 ? "zoom" : "pinch";
        return `// Pinch gesture - use W3C Actions API\ndriver.executeScript("mobile: pinchGesture", ImmutableMap.of(\n\t"left", driver.manage().window().getSize().width / 4,\n\t"top", driver.manage().window().getSize().height / 4,\n\t"width", driver.manage().window().getSize().width / 2,\n\t"height", driver.manage().window().getSize().height / 2,\n\t"percent", ${mode === "zoom" ? 0.75 : 0.25},\n\t"speed", 10\n))`;
      },
      description: 'Convert mobile:touch:pinch to pinchGesture'
    }
  ],
  
  visual: [
    {
      pattern: /driver\.executeScript\("mobile:button-text:click", (?:.+?)label\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: 'driver.findElement(By.xpath("//*[@text=\'$1\' or @content-desc=\'$1\']")).click()',
      description: 'Convert mobile:button-text:click to element find and click'
    },
    {
      pattern: /driver\.executeScript\("mobile:edit-text:set", (?:.+?)label\s*:\s*['"]([^'"]+)['"],\s*text\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: 'driver.findElement(By.xpath("//*[@text=\'$1\' or @content-desc=\'$1\']/..//android.widget.EditText | //android.widget.TextView[contains(@text,\'$1\')]/following::android.widget.EditText")).sendKeys("$2")',
      description: 'Convert mobile:edit-text:set to element find and sendKeys'
    },
    {
      pattern: /driver\.executeScript\("mobile:text:find", (?:.+?)content\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: 'driver.findElement(By.xpath("//*[contains(@text, \'$1\') or contains(@content-desc, \'$1\')]")).isDisplayed()',
      description: 'Convert mobile:text:find to element find and isDisplayed'
    },
    {
      pattern: /driver\.executeScript\("mobile:checkpoint:text", (?:.+?)content\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: 'driver.findElement(By.xpath("//*[contains(@text, \'$1\') or contains(@content-desc, \'$1\')]")).isDisplayed()',
      description: 'Convert mobile:checkpoint:text to element find and isDisplayed'
    },
    {
      pattern: /driver\.executeScript\("mobile:image:find", (?:.+?)content\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: '// Image recognition not directly supported in Appium\n// Consider using OpenCV or other image recognition libraries\n// Placeholder implementation:\nboolean imageFound = false;\ntry {\n    // Add your image recognition implementation here\n    imageFound = true;\n} catch (Exception e) {\n    imageFound = false;\n}\nreturn imageFound;',
      description: 'Convert mobile:image:find to image recognition placeholder'
    },
    {
      pattern: /driver\.executeScript\("mobile:button-image:click", (?:.+?)label\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: '// Image button click not directly supported in Appium\n// Consider using OpenCV or other image recognition libraries\n// Placeholder implementation:\n// Add your image recognition and click implementation here',
      description: 'Convert mobile:button-image:click to image button click placeholder'
    }
  ],
  
  scroll: [
    {
      pattern: /driver\.executeScript\("mobile:scroll", (?:.+?)element\s*:\s*([^,]+),\s*predicateString\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: (match, element, predicate) => {
        return `// For Android:\ndriver.findElement(AppiumBy.androidUIAutomator("new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains(\\"${predicate}\\"))"));\n// For iOS:\n// Use the original element reference: ${element}`;
      },
      description: 'Convert mobile:scroll to androidUIAutomator scrollIntoView'
    },
    {
      pattern: /driver\.executeScript\("mobile:text:find", (?:.+?)content\s*:\s*['"]([^'"]+)['"],\s*scrolling\s*:\s*['"]scroll['"],\s*next\s*:\s*['"]SWIPE_UP['"](?:.+?)\)/g,
      replacement: 'driver.findElement(AppiumBy.androidUIAutomator("new UiScrollable(new UiSelector().scrollable(true)).scrollBackward().scrollIntoView(new UiSelector().textContains(\\"$1\\"))"))',
      description: 'Convert mobile:text:find with scrolling SWIPE_UP to androidUIAutomator scrollBackward'
    },
    {
      pattern: /driver\.executeScript\("mobile:text:find", (?:.+?)content\s*:\s*['"]([^'"]+)['"],\s*scrolling\s*:\s*['"]scroll['"],\s*next\s*:\s*['"]SWIPE_DOWN['"](?:.+?)\)/g,
      replacement: 'driver.findElement(AppiumBy.androidUIAutomator("new UiScrollable(new UiSelector().scrollable(true)).scrollForward().scrollIntoView(new UiSelector().textContains(\\"$1\\"))"))',
      description: 'Convert mobile:text:find with scrolling SWIPE_DOWN to androidUIAutomator scrollForward'
    }
  ],
  
  location: [
    {
      pattern: /driver\.executeScript\("mobile:location:set", (?:.+?)coordinates\s*:\s*['"]([^,]+),\s*([^'"]+)['"](?:.+?)\)/g,
      replacement: 'driver.setLocation(new Location($1, $2, 0))',
      description: 'Convert mobile:location:set to setLocation'
    },
    {
      pattern: /driver\.executeScript\("mobile:location:get", (?:.+?)\)/g,
      replacement: 'driver.location()',
      description: 'Convert mobile:location:get to location()'
    },
    {
      pattern: /driver\.executeScript\("mobile:location:reset", (?:.+?)\)/g,
      replacement: '// No direct equivalent in Appium\n// Consider implementing location reset with your own logic',
      description: 'Convert mobile:location:reset to location reset placeholder'
    }
  ],
  
  notification: [
    {
      pattern: /driver\.executeScript\("mobile:notifications:open", (?:.+?)\)/g,
      replacement: 'driver.openNotifications()',
      description: 'Convert mobile:notifications:open to openNotifications'
    }
  ],
  
  timer: [
    {
      pattern: /driver\.executeScript\("mobile:timer:start", (?:.+?)timerId\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: '// Timer functionality not directly supported in Appium\n// Consider implementing with your own timing logic\nlong $1StartTime = System.currentTimeMillis();',
      description: 'Convert mobile:timer:start to manual timing implementation'
    },
    {
      pattern: /driver\.executeScript\("mobile:timer:stop", (?:.+?)timerId\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: '// Timer functionality not directly supported in Appium\n// Consider implementing with your own timing logic\nlong $1ElapsedTime = System.currentTimeMillis() - $1StartTime;',
      description: 'Convert mobile:timer:stop to manual timing implementation'
    },
    {
      pattern: /driver\.executeScript\("mobile:timer:get", (?:.+?)timerId\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: '// Timer functionality not directly supported in Appium\n// Consider implementing with your own timing logic\nlong $1CurrentTime = System.currentTimeMillis() - $1StartTime;',
      description: 'Convert mobile:timer:get to manual timing implementation'
    }
  ],
  
  browser: [
    {
      pattern: /driver\.executeScript\("mobile:browser:execute", (?:.+?)script\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: 'driver.executeScript("$1")',
      description: 'Convert mobile:browser:execute to standard executeScript'
    },
    {
      pattern: /driver\.executeScript\("mobile:browser:open", (?:.+?)url\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: 'driver.get("$1")',
      description: 'Convert mobile:browser:open to standard get'
    }
  ],
  
  network: [
    {
      pattern: /driver\.executeScript\("mobile:network:settings", (?:.+?)name\s*:\s*['"]([^'"]+)['"],\s*value\s*:\s*['"]([^'"]+)['"](?:.+?)\)/g,
      replacement: (match, name, value) => {
        if (name.toLowerCase() === 'wifi') {
          if (value.toLowerCase() === 'enabled') {
            return 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "svc wifi enable"))';
          } else {
            return 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "svc wifi disable"))';
          }
        } else if (name.toLowerCase() === 'data') {
          if (value.toLowerCase() === 'enabled') {
            return 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "svc data enable"))';
          } else {
            return 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "svc data disable"))';
          }
        } else if (name.toLowerCase() === 'airplane') {
          if (value.toLowerCase() === 'enabled') {
            return 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "settings put global airplane_mode_on 1"))';
          } else {
            return 'driver.executeScript("mobile: shell", ImmutableMap.of("command", "settings put global airplane_mode_on 0"))';
          }
        } else {
          return `// Network setting '${name}' with value '${value}' - no direct Appium equivalent\n// Consider implementing with appropriate mobile: shell commands`;
        }
      },
      description: 'Convert mobile:network:settings to appropriate shell commands'
    }
  ]
};

// Helper function to determine swipe direction based on coordinates
function getSwipeDirection(startX, startY, endX, endY) {
  // Remove '%' if present in coordinates
  startX = startX.toString().replace('%', '');
  startY = startY.toString().replace('%', '');
  endX = endX.toString().replace('%', '');
  endY = endY.toString().replace('%', '');
  
  // Convert to numbers
  const sX = parseFloat(startX);
  const sY = parseFloat(startY);
  const eX = parseFloat(endX);
  const eY = parseFloat(endY);
  
  // Calculate horizontal and vertical differences
  const horizDiff = Math.abs(eX - sX);
  const vertDiff = Math.abs(eY - sY);
  
  // Determine primary direction
  if (horizDiff > vertDiff) {
    // Horizontal swipe
    return eX > sX ? "right" : "left";
  } else {
    // Vertical swipe
    return eY > sY ? "down" : "up";
  }
}

export default conversionRules;