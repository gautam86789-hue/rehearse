import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Compass,
  Sparkles,
  Settings,
  MessageSquare,
  TrendingUp
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TAB_CONFIG: { [key: string]: { label: string; icon: any } } = {
  HomeTab: { label: 'Home', icon: Home },
  DescribeTab: { label: 'Describe', icon: Sparkles },
  ScenariosTab: { label: 'Scenarios', icon: Compass },
  ProgressTab: { label: 'Progress', icon: TrendingUp },
  SettingsTab: { label: 'Settings', icon: Settings }
  // [PHASE 1: Preserved in code, main tab connections commented out]
  // ReplyCoachTab: { label: 'Coach', icon: MessageSquare },
};

/**
 * Rehearse Solid Floating Executive Command Dock
 *
 * - Floating capsule dock with 360-degree curved pill geometry (solid, non-transparent).
 * - Solid Warm Ivory (Light) / Solid Deep Obsidian (Dark) surface with crisp micro-border.
 * - UNIFORM hover and active treatment across all 5 destinations.
 * - Restrained editorial executive aesthetic.
 */
export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation
}) => {
  const { colors: themeColors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const bottomMargin = Math.max(insets.bottom > 0 ? insets.bottom : 12, 10);

  // Solid Dock Tokens (Non-transparent)
  const dockBg = isDark ? '#0C1712' : '#FAF7F2';
  const dockBorder = isDark ? 'rgba(200, 170, 106, 0.22)' : '#E6E0D4';

  const activePillBg = isDark ? '#173D2C' : '#173D2C';
  const activeIconColor = '#C8AA6A';
  const activeLabelColor = isDark ? '#C8AA6A' : '#173D2C';
  const inactiveColor = isDark ? '#7E9588' : '#6A7F73';
  const hoverBg = isDark ? 'rgba(200, 170, 106, 0.12)' : 'rgba(23, 61, 44, 0.08)';

  return (
    <View style={[styles.outerWrapper, { paddingBottom: bottomMargin }]} pointerEvents="box-none">
      <View
        style={[
          styles.floatingDock,
          {
            backgroundColor: dockBg,
            borderColor: dockBorder,
            shadowOpacity: isDark ? 0.45 : 0.10
          }
        ]}
      >
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] || { label: route.name, icon: Home };
          const IconComponent = config.icon;
          const label = config.label;

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
            <DockItem
              key={route.key}
              icon={IconComponent}
              label={label}
              isFocused={isFocused}
              onPress={onPress}
              activePillBg={activePillBg}
              activeIconColor={activeIconColor}
              activeLabelColor={activeLabelColor}
              inactiveColor={inactiveColor}
              hoverBg={hoverBg}
              isDark={isDark}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              testID={options.tabBarTestID}
            />
          );
        })}
      </View>
    </View>
  );
};

interface DockItemProps {
  icon: any;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  activePillBg: string;
  activeIconColor: string;
  activeLabelColor: string;
  inactiveColor: string;
  hoverBg: string;
  isDark: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

const DockItem: React.FC<DockItemProps> = ({
  icon: Icon,
  label,
  isFocused,
  onPress,
  activePillBg,
  activeIconColor,
  activeLabelColor,
  inactiveColor,
  hoverBg,
  isDark,
  accessibilityLabel,
  testID
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const pressScale = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      speed: 24,
      bounciness: 4,
      useNativeDriver: true
    }).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.92,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      speed: 30,
      bounciness: 8,
      useNativeDriver: true
    }).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={styles.itemCell}
    >
      <Animated.View
        style={[
          styles.cellInner,
          { transform: [{ scale: pressScale }] }
        ]}
      >
        {/* Uniform Squircle Icon Container for Every Item */}
        <View
          style={[
            styles.iconSquircle,
            isFocused
              ? [
                  styles.activeSquircle,
                  {
                    backgroundColor: activePillBg,
                    borderColor: isDark ? 'rgba(200, 170, 106, 0.5)' : '#173D2C',
                    shadowColor: isDark ? '#C8AA6A' : '#173D2C'
                  }
                ]
              : [
                  styles.inactiveSquircle,
                  isHovered && {
                    backgroundColor: hoverBg,
                    borderColor: isDark ? 'rgba(200, 170, 106, 0.2)' : 'rgba(23, 61, 44, 0.12)'
                  }
                ]
          ]}
        >
          <Icon
            size={21}
            color={isFocused ? activeIconColor : inactiveColor}
            strokeWidth={isFocused ? 2.3 : 1.8}
          />
        </View>

        {/* Label */}
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? activeLabelColor : inactiveColor,
              fontWeight: isFocused ? '700' : '500'
            }
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {/* Subtle Indicator Dot for Active Tab */}
        {isFocused && (
          <View
            style={[
              styles.indicatorDot,
              { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }
            ]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16
  },
  floatingDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 440,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.2,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 14
  },
  itemCell: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cellInner: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconSquircle: {
    width: 44,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2
  },
  activeSquircle: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  inactiveSquircle: {
    borderWidth: 1,
    borderColor: 'transparent'
  },
  label: {
    fontSize: 10.5,
    letterSpacing: -0.1,
    marginTop: 1
  },
  indicatorDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    marginTop: 2
  }
});
