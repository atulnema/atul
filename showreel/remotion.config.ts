/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Sandboxed/CI machines often can't download Remotion's own headless shell.
// Point REMOTION_BROWSER at any Chrome / chrome-headless-shell binary to use that instead.
const browser = process.env.REMOTION_BROWSER;
if (browser && existsSync(browser)) {
  Config.setBrowserExecutable(browser);
}
