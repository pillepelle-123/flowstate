/**
 * Metro configuration for React Native
 * https://github.com/facebook/metro
 *
 * @format
 */

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

module.exports = withNativeWind(getDefaultConfig(__dirname), { input: './global.css' });


