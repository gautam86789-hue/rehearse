import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  Rect,
  Polygon,
  G
} from 'react-native-svg';
import {
  FileText,
  Send,
  Mic,
  ChevronRight,
  Sparkles,
  Clock,
  Quote,
  Flame,
  UserCheck
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { Header } from '../../components/common/Header';
import { ThemedFeatureCard } from '../../components/common/ThemedFeatureCard';

export const CoachHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors } = useTheme();
  const { user } = useApp();

  const recentConversations = [
    {
      id: 'rc1',
      title: 'Compensation discussion',
      time: '2 hours ago',
      category: 'Negotiation',
      confidence: 86
    },
    {
      id: 'rc2',
      title: 'Feedback to direct report',
      time: 'Yesterday',
      category: 'Leadership',
      confidence: 79
    },
    {
      id: 'rc3',
      title: 'Boundary pushback with VP',
      time: '3 days ago',
      category: 'Boundaries',
      confidence: 82
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Header
        title="Coach"
        rightAction="more"
        navigation={navigation}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Title Section */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroPretitle, { color: themeColors.primary }]}>CONVERSATION STRATEGIST</Text>
          <Text style={[styles.heroHeadline, { color: themeColors.textPrimary }]}>
            Turn tough moments into confident conversations.
          </Text>
        </View>

        {/* Mountain Landscape Card with Quote */}
        <View style={[styles.landscapeCard, { backgroundColor: themeColors.surfaceElevated, borderColor: themeColors.surfaceBorder }]}>
          <Svg width="100%" height={150} viewBox="0 0 340 150">
            <Defs>
              <LinearGradient id="coachSky" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={themeColors.surfaceHighlight} />
                <Stop offset="100%" stopColor={themeColors.surface} />
              </LinearGradient>
              <LinearGradient id="coachRidgeFar" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={themeColors.primaryLight} />
                <Stop offset="100%" stopColor={themeColors.primaryDark} />
              </LinearGradient>
              <LinearGradient id="coachRidgeNear" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={themeColors.primary} />
                <Stop offset="100%" stopColor={themeColors.primaryDark} />
              </LinearGradient>
              <RadialGradient id="coachSun" cx="80%" cy="20%" r="60%">
                <Stop offset="0%" stopColor={themeColors.primary} stopOpacity="0.5" />
                <Stop offset="100%" stopColor={themeColors.primary} stopOpacity="0" />
              </RadialGradient>
            </Defs>

            <Rect x="0" y="0" width="340" height="150" fill="url(#coachSky)" />
            <Circle cx="270" cy="40" r="70" fill="url(#coachSun)" />

            {/* Mountains */}
            <Path d="M 80 150 L 160 50 L 220 90 L 270 25 L 340 70 L 340 150 Z" fill="url(#coachRidgeFar)" />
            <Path d="M -10 150 L 40 90 L 100 110 L 170 60 L 240 115 L 350 150 Z" fill="url(#coachRidgeNear)" />

            {/* Pine Trees */}
            {[
              { x: 20, y: 100, s: 0.7 },
              { x: 35, y: 115, s: 0.9 },
              { x: 305, y: 85, s: 0.8 },
              { x: 280, y: 105, s: 0.9 }
            ].map((t, idx) => (
              <G key={idx} transform={`translate(${t.x}, ${t.y}) scale(${t.s})`}>
                <Polygon points="0,0 -7,14 7,14" fill={themeColors.primaryDark} />
                <Polygon points="0,8 -9,23 9,23" fill={themeColors.primaryDark} />
                <Polygon points="0,16 -11,33 11,33" fill={themeColors.primaryDark} />
              </G>
            ))}

            {/* Winding Trail */}
            <Path
              d="M 50 150 Q 120 125 170 120 Q 230 110 270 85"
              stroke={themeColors.primary}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>

          <View style={styles.quoteOverlay}>
            <Text style={[styles.quoteQuoteText, { color: themeColors.textPrimary }]}>
              "Better conversations build brighter careers."
            </Text>
          </View>
        </View>

        {/* 3 Primary Coaching Entrypoint Cards */}
        <View style={styles.modesSection}>
          <ThemedFeatureCard
            title="Understand My Situation"
            subtitle="Get a tactical brief for your real-world challenge."
            icon={FileText}
            categoryColor="indigo"
            onPress={() => navigation.navigate('SituationCoach')}
          />
          <ThemedFeatureCard
            title="Strategic Reply"
            subtitle="Craft clear, confident responses for Slack, email or text."
            icon={Send}
            categoryColor="teal"
            onPress={() => navigation.navigate('StrategicReply')}
          />
          <ThemedFeatureCard
            title="Live Rehearsal"
            subtitle="Practice the conversation with an adaptive AI counterpart."
            icon={Mic}
            categoryColor="flame"
            onPress={() => navigation.navigate('RehearsalSettings')}
          />
        </View>

        {/* Section: Recent Conversations */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={[styles.recentHeading, { color: themeColors.textSecondary }]}>RECENT CONVERSATIONS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Scenarios')}>
              <Text style={[styles.viewAllLink, { color: themeColors.primary }]}>View all →</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.recentCardGroup, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}>
            {recentConversations.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.recentRow,
                  idx < recentConversations.length - 1 && { borderBottomColor: themeColors.surfaceBorder, borderBottomWidth: 1 }
                ]}
                onPress={() => navigation.navigate('ConversationBrief', { conversationId: item.id, title: item.title })}
                activeOpacity={0.7}
              >
                <View style={[styles.recentDot, { backgroundColor: themeColors.primary }]} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.recentTitle, { color: themeColors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.recentTime, { color: themeColors.textSecondary }]}>{item.time}</Text>
                </View>
                <ChevronRight size={16} color={themeColors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 110
  },
  heroSection: {
    marginBottom: 14
  },
  heroPretitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4
  },
  heroHeadline: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 30
  },
  landscapeCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18,
    position: 'relative'
  },
  quoteOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    maxWidth: 200,
    alignItems: 'flex-end'
  },
  quoteQuoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '600',
    textAlign: 'right'
  },
  modesSection: {
    gap: 12,
    marginBottom: 22
  },
  recentSection: {
    marginBottom: 20
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginLeft: 4
  },
  recentHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  viewAllLink: {
    fontSize: 12.5,
    fontWeight: '600'
  },
  recentCardGroup: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden'
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  recentDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600'
  },
  recentTime: {
    fontSize: 12,
    marginTop: 2
  }
});
