const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// @ant-design/react-native 5.x imports legacy entry points that
// react-native-gesture-handler 3 no longer ships. Redirect them to a stub.
const removedGestureHandlerEntries = new Set([
  'react-native-gesture-handler/DrawerLayout',
  'react-native-gesture-handler/Swipeable',
]);
const removedComponentShim = path.resolve(__dirname, 'src/shims/rngh-removed-component.js');

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (removedGestureHandlerEntries.has(moduleName)) {
    return { type: 'sourceFile', filePath: removedComponentShim };
  }
  return (defaultResolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
