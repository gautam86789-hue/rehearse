import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, MessageSquare, TrendingUp, User } from 'lucide-react-native';
import { useTheme, RADII } from '../../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TAB_CONFIG: { [key: string]: { label: string; icon: any } } = {
  HomeTab: { label: 'Home', icon: Home },
  PracticeTab: { label: 'Practice', icon: MessageSquare },
  ProgressTab: { label: 'Progress', icon: TrendingUp },
  ProfileTab: { label: 'Profile', icon: User }
};

// Sized to the floating pill's real footprint (bottom margin + pill height +
// a little breathing room) — screens hosted under the tab bar should pad
// their scroll content by this much instead of a repeated magic number.
export const TAB_BAR_CLEARANCE = 110;

/**
 * Rehearse bottom tab bar — a floating solid pill (iOS-style), icon-only for
 * inactive tabs, icon+label pill for the active tab.
 */
export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation
}) => {
  const { colors, isDark, elevation } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity'));
  }, [state.index]);

  return (
    <View
      style={[
        styles.shadowWrapper,
        elevation.lg,
        { bottom: Math.max(insets.bottom, 12), borderRadius: RADII.xxl }
      ]}
    >
      <View
        style={[
          styles.wrapper,
          {
            borderRadius: RADII.xxl,
            borderColor: colors.tabBarBorder,
            backgroundColor: colors.tabBarBackground
          }
        ]}
      >
        {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] || { label: route.name, icon: Home };
        const IconComponent = config.icon;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            icon={IconComponent}
            label={config.label}
            isFocused={isFocused}
            onPress={onPress}
            activeColor={colors.primary}
            inactiveColor={colors.tabBarInactive}
            activePillColor={colors.primarySubtle}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
            testID={options.tabBarTestID}
          />
          );
        })}
      </View>
    </View>
  );
};

interface TabItemProps {
  icon: any;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  activeColor: string;
  inactiveColor: string;
  activePillColor: string;
  accessibilityLabel?: string;
  testID?: string;
}

const TabItem: React.FC<TabItemProps> = ({
  icon: Icon,
  label,
  isFocused,
  onPress,
  activeColor,
  inactiveColor,
  activePillColor,
  accessibilityLabel,
  testID
}) => {
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(pressScale, {
      toValue: isFocused ? 1.06 : 1,
      speed: 22,
      bounciness: 6,
      useNativeDriver: true
    }).start();
  }, [isFocused]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      style={styles.itemCell}
    >
      <Animated.View
        style={[
          styles.cellInner,
          isFocused && [styles.cellInnerActive, { backgroundColor: activePillColor }],
          { transform: [{ scale: pressScale }] }
        ]}
      >
        <Icon
          size={22}
          color={isFocused ? activeColor : inactiveColor}
          strokeWidth={isFocused ? 2.4 : 2}
        />
        {isFocused && (
          <Text style={[styles.label, { color: activeColor }]} numberOfLines={1}>
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  // Carries position + shadow. Not clipped (overflow:'hidden' would clip the
  // shadow along with the content), unlike the inner `wrapper` below.
  shadowWrapper: {
    position: 'absolute',
    left: 16,
    right: 16
  },
  // Carries the actual pill shape + blur/content clipping.
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    overflow: 'hidden',
    paddingVertical: 8,
    paddingHorizontal: 6
  },
  itemCell: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  cellInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADII.pill
  },
  cellInnerActive: {
    paddingHorizontal: 14
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700'
  }
});
