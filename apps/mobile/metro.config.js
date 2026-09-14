const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

const config = getDefaultConfig(__dirname)

// Exclude Next.js build artifacts and web static files from Metro watcher
config.resolver.blockList = [
  /.*\/apps\/web\/\.next\/.*/,
  /.*\.next\/.*/,
]

module.exports = withNativeWind(config, { input: "./global.css" })