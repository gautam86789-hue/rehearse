import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Sparkles, Lightbulb, Lock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, RADII } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Scorecard, Scenario } from '../types';

export const FeedbackScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { scorecard, scenario } = route.params as { scorecard: Scorecard; scenario: Scenario };
  const { colors, elevation } = useTheme();
  const { user, setIsPaywallVisible } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const isPro = ['active_annual', 'active_three_month', 'active_monthly', 'active_promo'].includes(
    user.subscription?.status || ''
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Your Feedback</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
            <Sparkles size={18} color="#059669" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>What you did well</Text>
            <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
              {scorecard.strengths?.[0] || 'You stayed calm and acknowledged their concerns.'}
            </Text>
          </View>
        </View>

        <View style={[styles.card, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}>
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Lightbulb size={18} color="#D97706" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>What to improve</Text>
            <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
              {scorecard.growthAreas?.[0] || 'Be more specific about next steps.'}
            </Text>
          </View>
        </View>

        {isPro ? (
          <TouchableOpacity
            style={[styles.proCard, { backgroundColor: colors.textPrimary }]}
            onPress={() => navigation.navigate('DetailedFeedback', { scorecard, scenario })}
            activeOpacity={0.88}
          >
            <Text style={[styles.proCardText, { color: colors.background }]}>View Detailed Feedback →</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.proCard, { backgroundColor: '#12121F' }]}>
            <View style={styles.proLockRow}>
              <View style={styles.proLockCircle}>
                <Lock size={14} color="#12121F" />
              </View>
              <Text style={styles.proCardText}>Get suggested phrases and examples with Pro.</Text>
            </View>
            <TouchableOpacity
              style={styles.unlockBtn}
              onPress={() => setIsPaywallVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.unlockBtnText}>Unlock Pro</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12
  },
  headerBtn: {
    padding: 6
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800'
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 16
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 19
  },
  proCard: {
    borderRadius: 20,
    padding: 20,
    marginTop: 6
  },
  proLockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16
  },
  proLockCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  proCardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1
  },
  unlockBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center'
  },
  unlockBtnText: {
    color: '#12121F',
    fontSize: 14,
    fontWeight: '700'
  }
});
