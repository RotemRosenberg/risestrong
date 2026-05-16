const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

module.exports = withPWA({
  // Acknowledge Turbopack for dev; next-pwa's webpack config runs in production builds only
  turbopack: {},
});
