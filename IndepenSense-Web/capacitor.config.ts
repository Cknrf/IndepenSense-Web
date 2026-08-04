import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const BACKGROUND_COLOR = "#121621";

const config: CapacitorConfig = {
  appId: "com.indepensense.app",
  appName: "IndepenSense",
  webDir: "dist",
  backgroundColor: BACKGROUND_COLOR,
  server: {
    url: "https://indepensense.maendou.com",
    cleartext: false,
    errorPath: "offline.html",
  },
  android: {
    backgroundColor: BACKGROUND_COLOR,
    allowMixedContent: false,
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Native,
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      backgroundColor: BACKGROUND_COLOR,
      launchShowDuration: 500,
      launchAutoHide: true,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
  },
};

export default config;
