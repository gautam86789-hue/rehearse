import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

interface WelcomeScreenProps {
  navigation: any;
}

const NAVY = '#0F2358';
const INDIGO = '#8B96F5';

// The hero PNG's own natural size/ratio (frontend/assets/welcome-hero.png,
// 855x1840) — used to letterbox it correctly on any device instead of
// cropping. Update this if the source artwork is ever regenerated at a
// different size.
const IMAGE_WIDTH = 855;
const IMAGE_HEIGHT = 1840;
const IMAGE_RATIO = IMAGE_WIDTH / IMAGE_HEIGHT;
const IMAGE_BG = '#F7F7FD'; // sampled from the artwork's own background, to fill any letterbox gap invisibly

// The hero PNG IS the entire opening screen — headline, "Get started"
// button, and legal links are all painted into the artwork itself. Real
// interactivity is layered on top as invisible, percentage-positioned touch
// targets over those exact painted regions (measured directly from the
// source PNG's pixels). These percentages are relative to the IMAGE's own
// bounds, not the screen — see the contain-fit math below, which is what
// keeps them aligned on any device instead of only the one the art was
// measured against. If the image ever changes, these need re-measuring.
const HOTSPOTS = {
  getStarted: { top: '84.3%', left: '12.5%', width: '75.1%', height: '4.9%' },
  termsOfService: { top: '92.8%', left: '29%', width: '20%', height: '3%' },
  privacyPolicy: { top: '92.8%', left: '53%', width: '18%', height: '3%' }
} as const;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const [heroFailed, setHeroFailed] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // "contain" math, computed by hand rather than left to resizeMode: sizes
  // the image so its full content is always visible with correct
  // proportions (never cropped), then centers it — matching a wide/short
  // device by fitting to width (letterboxed top/bottom) and a
  // narrow/tall one by fitting to height (letterboxed left/right).
  const screenRatio = screenWidth / screenHeight;
  const renderedWidth = screenRatio > IMAGE_RATIO ? screenHeight * IMAGE_RATIO : screenWidth;
  const renderedHeight = screenRatio > IMAGE_RATIO ? screenHeight : screenWidth / IMAGE_RATIO;
  const offsetX = (screenWidth - renderedWidth) / 2;
  const offsetY = (screenHeight - renderedHeight) / 2;

  const handleGetStarted = () => {
    navigation?.navigate?.('Onboarding');
  };

  const handleSignIn = () => {
    navigation?.navigate?.('SignIn');
  };

  // If the image fails to load, fall back to a fully coded (and fully
  // visible/functional) version instead of leaving invisible-but-tappable
  // hotspots floating over a blank screen with nothing to see.
  if (heroFailed) {
    return (
      <View style={styles.fallbackContainer}>
        <View style={styles.fallbackHero}>
          <View style={[styles.fallbackBlob, { width: 220, height: 220, borderRadius: 110, top: -40, left: -50, backgroundColor: INDIGO, opacity: 0.18 }]} />
          <View style={[styles.fallbackBlob, { width: 160, height: 160, borderRadius: 80, bottom: -20, right: -30, backgroundColor: INDIGO, opacity: 0.14 }]} />
        </View>
        <View style={styles.fallbackHeadlineBlock}>
          <Text style={styles.fallbackHeadline}>
            Your growth journey,{'\n'}
            <Text style={{ color: INDIGO }}>all in one place.</Text>
          </Text>
        </View>
        <View style={styles.fallbackBottomBar}>
          <TouchableOpacity style={styles.fallbackButton} onPress={handleGetStarted} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Get Started">
            <Text style={styles.fallbackButtonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignIn} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Sign in" style={styles.fallbackSignInRow}>
            <Text style={styles.fallbackSignInText}>
              Already have an account? <Text style={styles.fallbackSignInLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
          <Text style={styles.fallbackLegalText}>
            By continuing, you agree to our{' '}
            <Text style={styles.fallbackLegalLink} onPress={() => navigation?.navigate?.('TermsOfService')}>Terms of Service</Text>{' '}
            and{' '}
            <Text style={styles.fallbackLegalLink} onPress={() => navigation?.navigate?.('PrivacyPolicy')}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    );
  }

  // Everything below lives inside this exact box — the image at its true
  // proportions, and every hotspot positioned as a percentage of THIS box,
  // not the screen, so they stay locked to the artwork regardless of how
  // much letterbox space surrounds it on a given device.
  const imageBox = { position: 'absolute' as const, left: offsetX, top: offsetY, width: renderedWidth, height: renderedHeight };

  return (
    <View style={[styles.container, { backgroundColor: IMAGE_BG }]}>
      <View style={imageBox}>
        <Image
          source={require('../../assets/welcome-hero.png')}
          style={styles.heroImage}
          resizeMode="contain"
          onError={() => setHeroFailed(true)}
        />

        <TouchableOpacity
          style={[styles.hotspot, HOTSPOTS.getStarted]}
          onPress={handleGetStarted}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
        />
        <TouchableOpacity
          style={[styles.hotspot, HOTSPOTS.termsOfService]}
          onPress={() => navigation?.navigate?.('TermsOfService')}
          accessibilityRole="button"
          accessibilityLabel="Terms of Service"
        />
        <TouchableOpacity
          style={[styles.hotspot, HOTSPOTS.privacyPolicy]}
          onPress={() => navigation?.navigate?.('PrivacyPolicy')}
          accessibilityRole="button"
          accessibilityLabel="Privacy Policy"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEBFB'
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  hotspot: {
    position: 'absolute'
  },

  // --- Fallback path (image failed to load) ---
  fallbackContainer: {
    flex: 1,
    backgroundColor: NAVY
  },
  fallbackHero: {
    flex: 1,
    width: '100%',
    overflow: 'hidden'
  },
  fallbackBlob: {
    position: 'absolute'
  },
  fallbackHeadlineBlock: {
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 4
  },
  fallbackHeadline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 33,
    letterSpacing: -0.4
  },
  fallbackBottomBar: {
    backgroundColor: NAVY,
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 32
  },
  fallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F5FF0',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 26,
    minWidth: 168
  },
  fallbackButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1
  },
  fallbackSignInRow: {
    marginTop: 14,
    paddingVertical: 4
  },
  fallbackSignInText: {
    fontSize: 12.5,
    color: '#A9B3D6'
  },
  fallbackSignInLink: {
    color: '#8B96F5',
    fontWeight: '700'
  },
  fallbackLegalText: {
    fontSize: 11,
    color: '#7C86AD',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
    paddingHorizontal: 12
  },
  fallbackLegalLink: {
    color: '#A9B3D6',
    fontWeight: '700'
  }
});
