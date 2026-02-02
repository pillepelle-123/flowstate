/**
 * Metro configuration for React Native
 * https://github.com/facebook/metro
 *
 * @format
 */

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });