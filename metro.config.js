const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for better module resolution
config.resolver.platforms = ['native', 'ios', 'android', 'web'];

// Ensure proper asset extensions
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');

// Add source extensions
config.resolver.sourceExts.push('jsx', 'js', 'ts', 'tsx', 'json', 'wasm', 'svg');

// Configure transformer for better compatibility
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;