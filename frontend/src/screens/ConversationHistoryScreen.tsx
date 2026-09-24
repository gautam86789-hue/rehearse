import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, History, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, RADII } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { categoryColorFor } from '../data/categoryColors';
import { Scenario, MessageTurn } from '../types';

const CATEGORY_LABEL: Record<string, string> = {
  negotiation: 'Negotiation',
  feedback: 'Feedback',
  boundaries: 'Boundaries',
  managing_up: 'Managing Up',
  difficult_decisions: 'Difficult Decisions',
  crisis: 'Crisis & Layoffs'
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function scoreColor(score: number, colors: any): string {
  if (score >= 80) return colors.sage;
  if (score >= 60) return colors.champagneDark;
  return colors.ruby;
}

interface InProgressItem {
  scenario: Scenario;
  turns: MessageTurn[];
}

export const ConversationHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, elevation } = useTheme();
  const { history, user } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState<InProgressItem[]>([]);

  // Unfinished rehearsals (started, not yet scored) are saved under their own
  // storage keys by RoleplayScreen — list them here so they can be picked
  // back up.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(`@rehearse_inprogress_${user.id}_`));
          const items: InProgressItem[] = [];
          for (const key of keys) {
            const raw = await AsyncStorage.getItem(key);
            if (!raw) continue;
            const parsed = JSON.parse(raw);
            if (parsed?.session?.scenario && parsed.turns?.length > 1) {
              items.push({ scenario: parsed.session.scenario, turns: parsed.turns });
            }
          }
          if (!cancelled) setInProgress(items);
        } catch {
          if (!cancelled) setInProgress([]);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [user.id])
  );

  const isEmpty = history.length === 0 && inProgress.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Conversation History</Text>
        <View style={{ width: 32 }} />
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.primarySubtle }]}>
            <History size={26} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No rehearsals yet</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Every conversation you complete will show up here, with its score and date, so you can track how you're improving over time.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {inProgress.map((item) => (
            <TouchableOpacity
              key={`ip-${item.scenario.id}`}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Roleplay', { scenario: item.scenario })}
              style={[styles.card, elevation.sm, { backgroundColor: colors.surfaceCard, borderColor: colors.primary }]}
            >
              <View style={styles.rowInner}>
                <View style={[styles.iconSquare, { backgroundColor: colors.primarySubtle }]}>
                  <MessageCircle size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                  <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.scenario.title}
                  </Text>
                  <Text style={[styles.rowSub, { color: colors.primary }]} numberOfLines={1}>
                    In progress · Tap to continue
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {history.map((entry) => {
            const palette = colors.cardCategories[categoryColorFor(entry.category)];
            const isOpen = expandedId === entry.id;
            const hasTranscript = !!entry.turns && entry.turns.length > 0;
            return (
              <View
                key={entry.id}
                style={[styles.card, elevation.sm, { backgroundColor: palette.subtle, borderColor: palette.border }]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={!hasTranscript}
                  onPress={() => setExpandedId(isOpen ? null : entry.id)}
                  style={styles.rowInner}
                >
                  <View style={[styles.iconSquare, { backgroundColor: colors.surfaceCard }]}>
                    <MessageCircle size={18} color={palette.solid} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                    <Text style={[styles.rowTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {entry.scenarioTitle}
                    </Text>
                    <Text style={[styles.rowSub, { color: colors.textSecondary }]} numberOfLines={1}>
                      {CATEGORY_LABEL[entry.category] || entry.category} • {formatRelativeDate(entry.completedAt)}
                    </Text>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: scoreColor(entry.overallScore, colors) + '1A' }]}>
                    <Text style={[styles.scoreBadgeText, { color: scoreColor(entry.overallScore, colors) }]}>
                      {entry.overallScore}
                    </Text>
                  </View>
                  {hasTranscript &&
                    (isOpen ? (
                      <ChevronUp size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />
                    ) : (
                      <ChevronDown size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />
                    ))}
                </TouchableOpacity>

                {isOpen && entry.turns && (
                  <View style={styles.transcript}>
                    {entry.turns.map((t, i) => (
                      <View
                        key={i}
                        style={[
                          styles.bubble,
                          t.speaker === 'user'
                            ? { alignSelf: 'flex-end', backgroundColor: colors.primary }
                            : {
                                alignSelf: 'flex-start',
                                backgroundColor: colors.surfaceCard,
                                borderColor: colors.surfaceBorder,
                                borderWidth: 1
                              }
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            lineHeight: 18,
                            color: t.speaker === 'user' ? colors.textInverse : colors.textPrimary
                          }}
                        >
                          {t.message}
                        </Text>
                      </View>
                    ))}
                    {entry.scorecard && (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('Feedback', {
                            scorecard: entry.scorecard,
                            scenario: {
                              title: entry.scenarioTitle,
                              counterpartName: entry.counterpartName,
                              category: entry.category
                            }
                          })
                        }
                        style={[styles.feedbackBtn, { borderColor: colors.primary }]}
                      >
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>View feedback</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
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
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10
  },
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    overflow: 'hidden'
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14
  },
  iconSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2
  },
  rowSub: {
    fontSize: 12
  },
  scoreBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '800'
  },
  transcript: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  feedbackBtn: {
    alignSelf: 'center',
    marginTop: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8
  },
  emptyBody: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center'
  }
});
