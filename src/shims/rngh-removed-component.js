// react-native-gesture-handler 3 (Expo SDK 58) removed the legacy `DrawerLayout`
// and `Swipeable` entry points that @ant-design/react-native 5.x still imports.
// metro.config.js points those imports here so the bundle builds. The app does not
// use antd's Drawer or SwipeAction; if it ever does, swap them for
// ReanimatedDrawerLayout / ReanimatedSwipeable from react-native-gesture-handler.
const React = require('react');
const { View } = require('react-native');

function RemovedGestureComponent({ children, renderNavigationView, ...rest }) {
  return React.createElement(View, rest, children);
}

module.exports = RemovedGestureComponent;
module.exports.default = RemovedGestureComponent;
