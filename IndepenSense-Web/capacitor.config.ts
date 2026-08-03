import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.indepensense.app",
  appName: "IndepenSense",
  webDir: "dist",
  server: {
    url: "https://indepensense-web-production.up.railway.app",
    cleartext: false,
  },
};

export default config;
