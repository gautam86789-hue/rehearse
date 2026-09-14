import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, History, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, RADII } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { categoryColorFor } from '../data/categoryColors';

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

export const ConversationHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors, elevation } = useTheme();
  const { history } = useApp();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 12) + 8;

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

      {history.length === 0 ? (
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
          {history.map((entry) => {
            const palette = colors.cardCategories[categoryColorFor(entry.category)];
            return (
            <View
              key={entry.id}
              style={[styles.row, elevation.sm, { backgroundColor: palette.subtle, borderColor: palette.border }]}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADII.lg,
    borderWidth: 1,
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
