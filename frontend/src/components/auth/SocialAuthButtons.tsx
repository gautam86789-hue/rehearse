import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { typography } from '../../theme/typography';

interface SocialAuthButtonsProps {
  onSelectProvider: (provider: 'google' | 'azure' | 'facebook') => void;
  loadingProvider: 'google' | 'azure' | 'facebook' | null;
  mode?: 'signin' | 'signup';
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onSelectProvider,
  loadingProvider,
  mode = 'signin'
}) => {
  const { colors, accentColor } = useTheme();
  const prefix = mode === 'signin' ? 'Sign in with' : 'Sign up with';

  return (
    <View style={styles.container}>
      {/* Google Button */}
      <TouchableOpacity
        style={[
          styles.socialButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border
          }
        ]}
        onPress={() => onSelectProvider('google')}
        disabled={loadingProvider !== null}
        activeOpacity={0.8}
      >
        {loadingProvider === 'google' ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <Path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <Path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <Path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </Svg>
            </View>
            <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>
              {prefix} Google
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Microsoft Azure Enterprise Button */}
      <TouchableOpacity
        style={[
          styles.socialButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border
          }
        ]}
        onPress={() => onSelectProvider('azure')}
        disabled={loadingProvider !== null}
        activeOpacity={0.8}
      >
        {loadingProvider === 'azure' ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Svg width={16} height={16} viewBox="0 0 21 21">
                <Rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <Rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <Rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <Rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </Svg>
            </View>
            <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>
              {prefix} Microsoft
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Facebook Button */}
      <TouchableOpacity
        style={[
          styles.socialButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border
          }
        ]}
        onPress={() => onSelectProvider('facebook')}
        disabled={loadingProvider !== null}
        activeOpacity={0.8}
      >
        {loadingProvider === 'facebook' ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  fill="#1877F2"
                />
              </Svg>
            </View>
            <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>
              {prefix} Facebook
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16
  },
  iconContainer: {
    marginRight: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  socialButtonText: {
    ...typography.button,
    fontWeight: '500'
  }
});
