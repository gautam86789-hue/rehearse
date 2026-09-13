const { withAppBuildGradle } = require('@expo/config-plugins');

// RevenueCat's SDK deliberately crashes a non-debuggable ("release") build
// that's still using a test/sandbox API key (SimulatedStoreErrorDialogActivity)
// — a safety guard against shipping broken payments to the Play Store. Google
// Play Console / RevenueCat production setup is intentionally deferred until
// later, so local release builds are for friend-testing only, not a Play
// Store release. Keeping the release build type debuggable disables that
// guard without affecting JS bundling or minification.
// Remove this plugin once real Play Store RevenueCat API keys are configured.
module.exports = function withReleaseDebuggable(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const marker = 'signingConfig signingConfigs.debug\n            def enableShrinkResources';
      const replacement = 'signingConfig signingConfigs.debug\n            debuggable true\n            def enableShrinkResources';
      if (config.modResults.contents.includes(marker) && !config.modResults.contents.includes('debuggable true')) {
        config.modResults.contents = config.modResults.contents.replace(marker, replacement);
      }
    }
    return config;
  });
};
