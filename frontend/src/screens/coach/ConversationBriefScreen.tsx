import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import {
  ChevronLeft,
  Sparkles,
  Target,
  User,
  Scale,
  AlertTriangle,
  Flame,
  ArrowRight,
  CheckCircle2
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export const ConversationBriefScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route
}) => {
  const { colors: themeColors, isDark } = useTheme();

  const title = route?.params?.title || 'Compensation Discussion';

  const analysisItems = [
    {
      icon: Target,
      label: 'Your Objective',
      value: 'Secure higher compensation without damaging the relationship.',
      highlight: true
    },
    {
      icon: User,
      label: 'Counterpart',
      value: 'Supportive but budget-constrained'
    },
    {
      icon: Scale,
      label: 'Power Dynamic',
      value: 'Balanced'
    },
    {
      icon: AlertTriangle,
      label: 'Emotional Risk',
      value: 'Moderate'
    },
    {
      icon: Flame,
      label: 'Opportunity',
      value: 'High — you have recent wins to leverage'
    }
  ];

  const whatTheyMayDo = [
    'Cite budget limitations',
    'Ask for more proof of impact',
    'Offer non-monetary compensation',
    'Delay the decision'
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.surfaceBorder }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: themeColors.surfaceElevated }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>Conversation Brief</Text>
          <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
            Here's what we're seeing.
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tactical Analysis Badge & Title */}
        <View style={styles.titleSection}>
          <View style={[styles.tagPill, { backgroundColor: themeColors.primarySubtle }]}>
            <Sparkles size={12} color={themeColors.primary} />
            <Text style={[styles.tagText, { color: themeColors.primary }]}>TACTICAL ANALYSIS</Text>
          </View>
          <Text style={[styles.briefTitle, { color: themeColors.textPrimary }]}>{title}</Text>
          <Text style={[styles.briefSubtitle, { color: themeColors.textSecondary }]}>
            You're in a strong position. Let's make this conversation count.
          </Text>
        </View>

        {/* Tactical Parameters Group */}
        <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
          {analysisItems.map((item, idx) => {
            const IconComp = item.icon;
            return (
              <View
                key={idx}
                style={[
                  styles.paramRow,
                  idx < analysisItems.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 }
                ]}
              >
                <View style={[styles.iconCircle, { backgroundColor: themeColors.surfaceElevated }]}>
                  <IconComp size={16} color={themeColors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.paramLabel, { color: themeColors.textSecondary }]}>{item.label}</Text>
                  <Text style={[styles.paramValue, { color: themeColors.textPrimary }]}>{item.value}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Section: WHAT THEY MAY DO */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: themeColors.textSecondary }]}>WHAT THEY MAY DO</Text>
          <View style={[styles.cardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {whatTheyMayDo.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.pushbackRow,
                  idx < whatTheyMayDo.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 }
                ]}
              >
                <CheckCircle2 size={16} color={themeColors.primary} style={{ marginTop: 2, marginRight: 10 }} />
                <Text style={[styles.pushbackText, { color: themeColors.textPrimary }]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: isDark ? '#C8AA6A' : '#173D2C' }]}
          onPress={() => navigation.navigate('StrategicReply', { title })}
          activeOpacity={0.85}
        >
          <Text style={[styles.actionBtnText, { color: isDark ? '#0B1712' : '#FFFFFF' }]}>
            Generate Strategic Replies
          </Text>
          <ArrowRight size={18} color={isDark ? '#0B1712' : '#FFFFFF'} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40
  },
  titleSection: {
    marginBottom: 16
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
    marginBottom: 8
  },
  tagText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8
  },
  briefTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4
  },
  briefSubtitle: {
    fontSize: 13,
    lineHeight: 18
  },
  cardGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18
  },
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  paramLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 2
  },
  paramValue: {
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 18
  },
  section: {
    marginBottom: 16
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase'
  },
  pushbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  pushbackText: {
    fontSize: 13.5,
    fontWeight: '500',
    flex: 1
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '800'
  }
});
