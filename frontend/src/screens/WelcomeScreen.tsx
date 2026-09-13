import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';

interface WelcomeScreenProps {
  navigation: any;
}

// Source artwork is cropped to end just above where the old baked-in button
// graphic used to sit (solid navy from there down), so it seams invisibly
// into the navy bottom bar below, which carries a real, properly-sized button.
const NAVY = '#0F2358';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    navigation?.navigate?.('Onboarding');
  };

  const handleSignIn = () => {
    navigation?.navigate?.('SignIn');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/welcome-hero.png')}
        style={styles.heroImage}
        resizeMode="cover"
      />

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
  bottomBar: {
    backgroundColor: NAVY,
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 24
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
  }
});
