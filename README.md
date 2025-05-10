# MCP Perfecto-to-Appium Converter

A Model Context Protocol (MCP) server that converts Perfecto mobile automation code to Appium code, designed for seamless integration with Claude Desktop.

## Overview

This tool helps mobile automation testers and developers migrate their Perfecto Mobile test scripts to Appium. It automatically converts Perfecto-specific locators, gestures, and device interactions to Appium's equivalent implementations, saving hours of manual code conversion.

## Features

- Convert Perfecto element locator strategies to Appium
- Transform Perfecto-specific gestures to Appium W3C Actions
- Support for both Android and iOS platforms
- Convert individual code snippets or entire files
- Validate if code is convertible before attempting conversion

## Installation

### Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn
- Claude Desktop (for AI-assisted conversions)

### Steps

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/mcp-perfecto-appium-converter.git
   cd mcp-perfecto-appium-converter
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Make the CLI executable (Linux/macOS only)
   ```bash
   chmod +x src/cli.js
   ```

4. Link the package globally
   ```bash
   npm link
   ```

## Claude Desktop Integration

### Setting Up Claude Desktop

1. Download and install [Claude Desktop](https://www.anthropic.com/claude-desktop) from Anthropic's website
2. Launch Claude Desktop on your computer

### Configuring the MCP Server in Claude Desktop

1. Open Claude Desktop
2. Click the gear icon (⚙️) in the bottom-left corner to open Settings
3. Navigate to Advanced → MCP Servers in the sidebar
4. Click "Add MCP Server"
5. Enter the following details:
   - **Name**: MCP Perfecto-to-Appium Converter
   - **Command**: The command to run your server. You have two options:
     - If installed via npm globally: `mcp-perfecto-appium-converter`
     - If running from local directory: Full path to `src/cli.js` (e.g., `/path/to/mcp-perfecto-appium-converter/src/cli.js` or `C:\path\to\mcp-perfecto-appium-converter\src\cli.js`)
6. Click "Save"
7. Verify the connection status shows "Connected" in green

### Alternative: Import Configuration

You can also import a pre-configured settings file:

1. Create a configuration file named `claude-desktop-config.json`:
   ```json
   {
     "mcpServers": {
       "mcp-perfecto-appium-converter": {
         "command": "mcp-perfecto-appium-converter",
         "args": []
       }
     }
   }
   ```

2. In Claude Desktop's MCP Servers settings, click "Import Configuration"
3. Select the `claude-desktop-config.json` file

## Using the Converter with Claude

Once the MCP server is connected to Claude Desktop, you can ask Claude to convert Perfecto code to Appium using natural language:

### Example Prompts

#### Basic Code Conversion
```
Convert this Perfecto code to Appium:

driver.findElement(PerfectoMobileBy.id("login-button")).click();
driver.executeScript("mobile:application:open", "{'name':'Calculator'}");
```

#### Platform-Specific Conversion
```
Convert this Perfecto code to Appium for iOS:

driver.findElement(PerfectoMobileBy.accessibilityId("sign-in")).click();
driver.executeScript("mobile:application:open", "{'name':'Settings'}");
```

#### File Conversion
```
I've uploaded a Perfecto test file called PerfectoTest.java. Please convert it to Appium code for Android.
```

#### Learning About Differences
```
What's the difference between how Perfecto and Appium handle gestures like swipe and tap?
```

## Standalone Usage

You can also use the converter without Claude Desktop:

1. Start the server
   ```bash
   mcp-perfecto-appium-converter
   ```

2. Use the provided API endpoints to convert code
   ```bash
   # Example using curl
   curl -X POST http://localhost:8000/tools/convertCode \
     -H "Content-Type: application/json" \
     -d '{"code": "driver.findElement(PerfectoMobileBy.id(\"login-button\")).click();", "platform": "android"}'
   ```

## Supported Conversions

### Element Locators
- `PerfectoMobileBy.id` → `By.id`
- `PerfectoMobileBy.accessibilityId` → `AppiumBy.accessibilityId`
- `PerfectoMobileBy.xpath` → `By.xpath`
- `PerfectoMobileBy.className` → `By.className`

### Gestures
- `mobile:touch:tap` → `mobile: longClickGesture` or `mobile: tapGesture`
- `mobile:touch:swipe` → `mobile: swipeGesture`

### Application Management
- `mobile:application:open` → `mobile: shell` (Android) or `mobile: launchApp` (iOS)
- `mobile:application:close` → `terminateApp`
- `mobile:application:install` → `installApp`

## Troubleshooting

### Connection Issues
- **Status shows "Disconnected"**: 
  - Ensure the command path is correct
  - Check if another instance of the server is already running
  - Try restarting Claude Desktop

### Conversion Errors
- **Claude doesn't recognize code as Perfecto**:
  - Make sure the code follows standard Perfecto syntax
  - Try using more explicit prompting

- **Server doesn't start**:
  - Check Node.js version (`node -v`)
  - Ensure all required files are present in the project structure

## License

MIT

## Contact & Contribution

- Report issues on GitHub
- Pull requests are welcome
- For major changes, please open an issue first to discuss what you would like to change

## Acknowledgments

- Inspired by the transition needs of mobile automation testers moving from Perfecto to Appium
- Special thanks to [saikrishna321](https://github.com/saikrishna321) and [SrinivasanTarget](https://github.com/SrinivasanTarget) for their inspiring work and contributions in the mobile automation space to Appium
---

*Note: This project is not officially affiliated with Perfecto Mobile or Appium.*
