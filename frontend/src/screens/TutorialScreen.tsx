import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Target, TrendingUp, Flame } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { RehearseEmblem } from '../components/brand/RehearseEmblem';
import { markTutorialSeen } from '../utils/tutorial';

const STEPS = [
  {
    icon: MessageCircle,
    title: 'Practice the talk before the talk',
    body: 'Rehearse is a safe place to practice difficult conversations — asking for a raise, giving feedback, saying no — with an AI that plays the other person.'
  },
  {
    icon: Target,
    title: 'Pick a scenario, then just talk',
    body: 'Choose a situation that matches what you are facing. The conversation starts casually, like real life, and you reply in your own words. There are no wrong answers here.'
  },
  {
    icon: TrendingUp,
    title: 'Get clear feedback',
    body: 'When you finish, you get a score, what you did well, and a better way to say your weakest line. Start with easy scenarios — they get harder as you improve.'
  },
  {
    icon: Flame,
    title: 'Come back a little each day',
    body: "Do Today's Challenge in two minutes and keep your streak alive. Small daily practice is what builds real confidence."
  }
];

export const TutorialScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === STEPS.length - 1;

  const finish = async () => {
    await markTutorialSeen(user.id);
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('HomeTabs');
  };

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <View style={styles.topRow}>
        <RehearseEmblem size={32} />
        <TouchableOpacity onPress={finish} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={[styles.skip, { color: colors.textSecondary }]}>{isLast ? '' : 'Skip'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={STEPS}
        keyExtractor={(s) => s.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={[styles.page, { width }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primarySubtle }]}>
                <Icon size={40} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>{item.body}</Text>
            </View>
          );
        }}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <View style={styles.dots}>
          {STEPS.map((s, i) => (
            <View
              key={s.title}
              style={[styles.dot, { backgroundColor: i === index ? colors.primary : colors.surfaceBorder, width: i === index ? 22 : 8 }]}
            />
          ))}
        </View>
        <TouchableOpacity style={[styles.cta, { backgroundColor: colors.primary }]} onPress={next} activeOpacity={0.85}>
          <Text style={styles.ctaText}>{isLast ? 'Get started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, height: 40 },
  skip: { fontSize: 14, fontWeight: '600' },
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  iconCircle: { width: 104, height: 104, borderRadius: 52, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4, textAlign: 'center', marginBottom: 14 },
  body: { fontSize: 15.5, lineHeight: 23, textAlign: 'center' },
  footer: { paddingHorizontal: 24, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
