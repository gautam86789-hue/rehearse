const { withAndroidColorsNight, AndroidConfig } = require('@expo/config-plugins');

// Must match ThemeContext.tsx's dark-mode `background` value.
const DARK_BACKGROUND = '#12121F';

// Expo's base `android.backgroundColor` config only sets one static color,
// applied to values/colors.xml (light). That leaves values-night/colors.xml
// empty, so when the system is in dark mode (or the app's own theme resolves
// to dark), Android's native window background falls back to the light
// color — visible as a white flash during every native screen transition
// (push/pop/back-gesture), since react-native-screens briefly shows the raw
// Activity window background before RN's JS-driven content paints over it.
// This plugin writes the matching dark override so prebuild regenerates it
// correctly every time, instead of hand-editing the generated XML (which
// `expo prebuild` would silently overwrite on the next run).
module.exports = function withAndroidDarkBackground(config) {
  return withAndroidColorsNight(config, (config) => {
    config.modResults = AndroidConfig.Colors.setColorItem(
      { $: { name: 'activityBackground' }, _: DARK_BACKGROUND },
      config.modResults
    );
    config.modResults = AndroidConfig.Colors.setColorItem(
      { $: { name: 'iconBackground' }, _: DARK_BACKGROUND },
      config.modResults
    );
    return config;
  });
};
