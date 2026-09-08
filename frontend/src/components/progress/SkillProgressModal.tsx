import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import {
  X,
  Target,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  BookOpen
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { CommunicationSkill } from '../../types/progress';

interface SkillProgressModalProps {
  skill: CommunicationSkill | null;
  visible: boolean;
  onClose: () => void;
  onPractice?: (scenarioId?: string) => void;
}

export const SkillProgressModal: React.FC<SkillProgressModalProps> = ({
  skill,
  visible,
  onClose,
  onPractice
}) => {
  const { colors: themeColors } = useTheme();

  if (!skill) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.categoryOverline, { color: themeColors.primary }]}>
                {skill.category.toUpperCase()}
              </Text>
              <Text style={[styles.skillTitle, { color: themeColors.textPrimary }]}>{skill.name}</Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: themeColors.surfaceElevated }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Score & Rehearsals Overview */}
            <View style={[styles.statRow, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}>
              <View style={styles.statCol}>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Confidence Score</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={[styles.statScoreNum, { color: themeColors.primary }]}>{skill.score}</Text>
                  <Text style={[styles.statScoreMax, { color: themeColors.textSecondary }]}>/100</Text>
                </View>
              </View>

              <View style={[styles.verticalDivider, { backgroundColor: themeColors.surfaceBorder }]} />

              <View style={styles.statCol}>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Rehearsals</Text>
                <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
                  {skill.rehearsalsCount} {skill.rehearsalsCount === 1 ? 'session' : 'sessions'}
                </Text>
              </View>
            </View>

            {/* Historical Trend */}
            {skill.recentScores && skill.recentScores.length > 1 && (
              <View style={[styles.sectionBox, { borderBottomColor: themeColors.surfaceBorder }]}>
                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>HISTORICAL PROGRESS</Text>
                <View style={styles.trendRow}>
                  {skill.recentScores.map((sc, idx) => (
                    <React.Fragment key={idx}>
                      <View style={[styles.scoreBubble, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}>
                        <Text style={[styles.scoreBubbleText, { color: themeColors.textPrimary }]}>{sc}</Text>
                      </View>
                      {idx < skill.recentScores.length - 1 && (
                        <TrendingUp size={14} color={themeColors.primary} style={{ marginHorizontal: 6 }} />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}

            {/* Strengths */}
            {skill.strengths && skill.strengths.length > 0 && (
              <View style={[styles.sectionBox, { borderBottomColor: themeColors.surfaceBorder }]}>
                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>DEMONSTRATED STRENGTHS</Text>
                {skill.strengths.map((str, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <CheckCircle2 size={15} color={themeColors.primary} style={{ marginTop: 2, marginRight: 8 }} />
                    <Text style={[styles.bulletText, { color: themeColors.textPrimary }]}>{str}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Growth Areas */}
            {skill.growthAreas && skill.growthAreas.length > 0 && (
              <View style={[styles.sectionBox, { borderBottomColor: themeColors.surfaceBorder }]}>
                <Text style={[styles.sectionTitle, { color: themeColors.textSecondary }]}>AREAS TO EXPAND</Text>
                {skill.growthAreas.map((area, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Target size={15} color={themeColors.primary} style={{ marginTop: 2, marginRight: 8 }} />
                    <Text style={[styles.bulletText, { color: themeColors.textPrimary }]}>{area}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommended Rehearsal Scenario */}
            {skill.recommendedScenarioTitle && (
              <View style={[styles.recCard, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <BookOpen size={14} color={themeColors.primary} />
                  <Text style={[styles.recOverline, { color: themeColors.primary }]}>RECOMMENDED PRACTICE</Text>
                </View>
                <Text style={[styles.recTitle, { color: themeColors.textPrimary }]}>
                  {skill.recommendedScenarioTitle}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Practice Action */}
          <TouchableOpacity
            style={[styles.practiceBtn, { backgroundColor: themeColors.primary }]}
            onPress={() => {
              onClose();
              if (onPractice) {
                onPractice(skill.recommendedScenarioId);
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.practiceBtnText, { color: themeColors.textInverse }]}>Practice This Skill</Text>
            <ArrowRight size={16} color={themeColors.textInverse} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  categoryOverline: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10
  },
  scrollArea: {
    marginBottom: 14
  },
  statRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14
  },
  statCol: {
    flex: 1,
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    marginBottom: 2
  },
  statScoreNum: {
    fontSize: 24,
    fontWeight: '800'
  },
  statScoreMax: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4
  },
  verticalDivider: {
    width: 1,
    height: '100%'
  },
  sectionBox: {
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  scoreBubble: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1
  },
  scoreBubbleText: {
    fontSize: 13,
    fontWeight: '700'
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  bulletText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1
  },
  recCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 12
  },
  recOverline: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  recTitle: {
    fontSize: 13.5,
    fontWeight: '600'
  },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10
  },
  practiceBtnText: {
    fontSize: 14,
    fontWeight: '700'
  }
});
