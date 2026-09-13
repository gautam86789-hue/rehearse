const { withGradleProperties } = require('@expo/config-plugins');

// The default release build embeds native (.so) libraries for all 4 CPU
// architectures (arm64-v8a, armeabi-v7a, x86, x86_64) — but x86/x86_64 only
// exist on Android emulators, and armeabi-v7a is only relevant to very old
// 32-bit devices. That duplication was ~68MB (uncompressed) of a ~137MB
// package — by far the single biggest contributor to APK size. Restricting
// to arm64-v8a (virtually every real Android phone sold since ~2017,
// including the ones this gets sideloaded to for testing) removes that
// duplication outright. R8 minification + resource shrinking then trims the
// remaining Java/Kotlin bytecode and unused resources.
//
// Trade-off: this build will not install on an armeabi-v7a-only device or an
// x86 emulator. If that's ever needed, drop this plugin for that one build.
function setProp(list, key, value) {
  const entry = list.find((item) => item.type === 'property' && item.key === key);
  if (entry) {
    entry.value = value;
  } else {
    list.push({ type: 'property', key, value });
  }
}

module.exports = function withApkSizeOptimizations(config) {
  return withGradleProperties(config, (config) => {
    setProp(config.modResults, 'reactNativeArchitectures', 'arm64-v8a');
    setProp(config.modResults, 'android.enableMinifyInReleaseBuilds', 'true');
    setProp(config.modResults, 'android.enableShrinkResourcesInReleaseBuilds', 'true');
    return config;
  });
};
