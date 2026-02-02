/**
 * Metro configuration for React Native (CommonJS)
 * Using CommonJS avoids Windows ESM URL-scheme issues.
 */

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Fix für framer-motion/tslib Web-Kompatibilität
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib' && platform === 'web') {
    return {
      filePath: require.resolve('tslib'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
