const { withGradleProperties } = require('@expo/config-plugins');

// Android Studio's bundled JBR on this machine is JDK 25. Since JDK 22+,
// calling a restricted native method without --enable-native-access prints a
// "WARNING: A restricted method in java.lang.System has been called" to
// stderr — and the CMake configure task for native modules (expo-modules-core,
// react-native-screens) treats that stray warning as a fatal failure,
// aborting the whole build with no other error. Passing this JVM flag to the
// Gradle daemon silences the warning. `expo prebuild` regenerates
// gradle.properties from scratch each time, so this must be a config plugin
// rather than a hand-edit.
module.exports = function withGradleNativeAccessFix(config) {
  return withGradleProperties(config, (config) => {
    const key = 'org.gradle.jvmargs';
    const flag = '--enable-native-access=ALL-UNNAMED';
    const entry = config.modResults.find((item) => item.type === 'property' && item.key === key);
    if (entry) {
      if (!entry.value.includes(flag)) {
        entry.value = `${entry.value} ${flag}`;
      }
    } else {
      config.modResults.push({ type: 'property', key, value: `-Xmx2048m ${flag}` });
    }
    return config;
  });
};
