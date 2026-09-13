import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, Award, Flame, ShieldCheck, Sparkles, Lock, Check, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, RADII } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { MILESTONES, MilestoneDef } from '../data/milestones';
import { useShareCard } from '../components/share/useShareCard';
import { MilestoneShareCard } from '../components/share/MilestoneShareCard';

const ICONS: Record<string, any> = {
  flame: Flame,
  award: Award,
  'shield-check': ShieldCheck,
  sparkles: Sparkles
};

export const MilestonesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, elevation } = useTheme();
  const { user, history } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

  const unlockedCount = MILESTONES.filter((m) => m.isUnlocked(user, history)).length;

  const { viewShotRef, share } = useShareCard();
  const [sharingMilestone, setSharingMilestone] = useState<MilestoneDef | null>(null);

  // Waits for the off-screen card to actually re-render with the newly
  // selected milestone before capturing it — setting state and capturing in
  // the same handler would grab whatever was rendered a frame earlier.
  useEffect(() => {
    if (!sharingMilestone) return;
    share(`Share "${sharingMilestone.title}"`);
  }, [sharingMilestone]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Milestones</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
          {unlockedCount} of {MILESTONES.length} unlocked
        </Text>

        <View style={styles.list}>
          {MILESTONES.map((m) => {
            const unlocked = m.isUnlocked(user, history);
            const Icon = ICONS[m.icon];
            return (
              <View
                key={m.id}
                style={[
                  styles.row,
                  elevation.sm,
                  {
                    backgroundColor: unlocked ? colors.surfaceCard : colors.surfaceElevated,
                    borderColor: unlocked ? colors.champagne : colors.surfaceBorder,
                    opacity: unlocked ? 1 : 0.6
                  }
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: unlocked ? colors.champagneSubtle : colors.surfaceBorder }
                  ]}
                >
                  {unlocked ? (
                    <Icon size={20} color={colors.champagneDark} />
                  ) : (
                    <Lock size={17} color={colors.textMuted} />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.rowTitle, { color: colors.textPrimary }]}>{m.title}</Text>
                  <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>{m.description}</Text>
                </View>
                {unlocked && (
                  <>
                    <TouchableOpacity
                      style={styles.shareIconBtn}
                      onPress={() => setSharingMilestone(m)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Share2 size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={[styles.checkBadge, { backgroundColor: colors.sage }]}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  </>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {sharingMilestone && (
        <View style={styles.offscreenCard} pointerEvents="none">
          <MilestoneShareCard
            ref={viewShotRef}
            title={sharingMilestone.title}
            description={sharingMilestone.description}
            icon={sharingMilestone.icon}
          />
        </View>
      )}
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
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14
  },
  list: {
    gap: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.lg,
    borderWidth: 1,
    padding: 14
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2
  },
  rowDesc: {
    fontSize: 12,
    lineHeight: 16
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  shareIconBtn: {
    padding: 4,
    marginLeft: 4
  },
  offscreenCard: {
    position: 'absolute',
    top: -9999,
    left: -9999
  }
});
