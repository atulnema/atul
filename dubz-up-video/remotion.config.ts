/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import fs from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Sandboxes without internet access ship their own headless Chrome.
// Point REMOTION_BROWSER at it; everywhere else Remotion downloads its own.
const browser = process.env.REMOTION_BROWSER;
if (browser && fs.existsSync(browser)) {
  Config.setBrowserExecutable(browser);
}
