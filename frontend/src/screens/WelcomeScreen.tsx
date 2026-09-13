import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';

interface WelcomeScreenProps {
  navigation: any;
}

const NAVY = '#0F2358';
const INDIGO = '#8B96F5';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const [heroFailed, setHeroFailed] = useState(false);

  const handleGetStarted = () => {
    navigation?.navigate?.('Onboarding');
  };

  const handleSignIn = () => {
    navigation?.navigate?.('SignIn');
  };

  return (
    <View style={styles.container}>
      <View style={{ height: screenHeight * 0.52 }}>
        {heroFailed ? (
          // Coded fallback — a real image load failure (or, on the web
          // preview, a stale bundler cache) degrades to this instead of a
          // broken-image icon. Same drawing technique as JourneyBackdrop:
          // soft low-opacity circles, transform-free so there's nothing to
          // get stuck mid-animation on this particular screen.
          <View style={styles.heroFallback}>
            <View style={[styles.fallbackBlob, { width: 220, height: 220, borderRadius: 110, top: -40, left: -50, backgroundColor: INDIGO, opacity: 0.18 }]} />
            <View style={[styles.fallbackBlob, { width: 160, height: 160, borderRadius: 80, bottom: -20, right: -30, backgroundColor: INDIGO, opacity: 0.14 }]} />
          </View>
        ) : (
          <Image
            source={require('../../assets/welcome-hero.png')}
            style={styles.heroImage}
            resizeMode="cover"
            onError={() => setHeroFailed(true)}
          />
        )}
      </View>

      <View style={styles.headlineBlock}>
        <Text style={styles.headline}>
          Your growth journey,{'\n'}
          <Text style={{ color: INDIGO }}>all in one place.</Text>
        </Text>
      </View>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={handleGetStarted}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Get Started"
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <ArrowRight size={16} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignIn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
          style={styles.signInRow}
        >
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text style={styles.legalLink} onPress={() => navigation?.navigate?.('TermsOfService')}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.legalLink} onPress={() => navigation?.navigate?.('PrivacyPolicy')}>
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY
  },
  heroImage: {
    flex: 1,
    width: '100%'
  },
  heroFallback: {
    flex: 1,
    width: '100%',
    overflow: 'hidden'
  },
  fallbackBlob: {
    position: 'absolute'
  },
  headlineBlock: {
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 4
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 33,
    letterSpacing: -0.4
  },
  bottomBar: {
    backgroundColor: NAVY,
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 24,
    marginTop: 'auto'
  },
  getStartedButton: {
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
  getStartedText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1
  },
  signInRow: {
    marginTop: 14,
    paddingVertical: 4
  },
  signInText: {
    fontSize: 12.5,
    color: '#A9B3D6'
  },
  signInLink: {
    color: '#8B96F5',
    fontWeight: '700'
  },
  legalText: {
    fontSize: 11,
    color: '#7C86AD',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 16,
    paddingHorizontal: 12
  },
  legalLink: {
    color: '#A9B3D6',
    fontWeight: '700'
  }
});
