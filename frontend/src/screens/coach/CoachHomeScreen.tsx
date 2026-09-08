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

export const CoachHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors: themeColors, isDark } = useTheme();
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
        <View style={[styles.landscapeCard, { backgroundColor: isDark ? '#0D1E16' : '#FAF6EB', borderColor: themeColors.surfaceBorder }]}>
          <Svg width="100%" height={150} viewBox="0 0 340 150">
            <Defs>
              <LinearGradient id="coachSky" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={isDark ? '#08140E' : '#F7F3E6'} />
                <Stop offset="100%" stopColor={isDark ? '#193A2A' : '#D2CBB1'} />
              </LinearGradient>
              <LinearGradient id="coachRidgeFar" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={isDark ? '#1C402E' : '#8CA08A'} />
                <Stop offset="100%" stopColor={isDark ? '#0F251A' : '#576C55'} />
              </LinearGradient>
              <LinearGradient id="coachRidgeNear" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={isDark ? '#26543E' : '#6A8268'} />
                <Stop offset="100%" stopColor={isDark ? '#11291D' : '#3E533D'} />
              </LinearGradient>
              <RadialGradient id="coachSun" cx="80%" cy="20%" r="60%">
                <Stop offset="0%" stopColor="#C8AA6A" stopOpacity="0.5" />
                <Stop offset="100%" stopColor="#C8AA6A" stopOpacity="0" />
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
                <Polygon points="0,0 -7,14 7,14" fill={isDark ? '#09150E' : '#2A3C28'} />
                <Polygon points="0,8 -9,23 9,23" fill={isDark ? '#09150E' : '#2A3C28'} />
                <Polygon points="0,16 -11,33 11,33" fill={isDark ? '#060E09' : '#1F2E1E'} />
              </G>
            ))}

            {/* Winding Trail */}
            <Path
              d="M 50 150 Q 120 125 170 120 Q 230 110 270 85"
              stroke="#C8AA6A"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>

          <View style={styles.quoteOverlay}>
            <Text style={[styles.quoteQuoteText, { color: isDark ? '#F5F2E9' : '#17241E' }]}>
              "Better conversations build brighter careers."
            </Text>
          </View>
        </View>

        {/* 3 Primary Coaching Entrypoint Cards */}
        <View style={styles.modesSection}>
          {/* Card 1: Understand My Situation */}
          <TouchableOpacity
            style={[styles.modeCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}
            onPress={() => navigation.navigate('SituationCoach')}
            activeOpacity={0.8}
          >
            <View style={[styles.modeIconBox, { backgroundColor: themeColors.primarySubtle }]}>
              <FileText size={22} color={themeColors.primary} />
            </View>
            <View style={styles.modeTextStack}>
              <Text style={[styles.modeTitle, { color: themeColors.textPrimary }]}>Understand My Situation</Text>
              <Text style={[styles.modeSub, { color: themeColors.textSecondary }]}>
                Get a tactical brief for your real-world challenge.
              </Text>
            </View>
            <ChevronRight size={18} color={themeColors.textMuted} />
          </TouchableOpacity>

          {/* Card 2: Strategic Reply */}
          <TouchableOpacity
            style={[styles.modeCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}
            onPress={() => navigation.navigate('StrategicReply')}
            activeOpacity={0.8}
          >
            <View style={[styles.modeIconBox, { backgroundColor: themeColors.primarySubtle }]}>
              <Send size={20} color={themeColors.primary} />
            </View>
            <View style={styles.modeTextStack}>
              <Text style={[styles.modeTitle, { color: themeColors.textPrimary }]}>Strategic Reply</Text>
              <Text style={[styles.modeSub, { color: themeColors.textSecondary }]}>
                Craft clear, confident responses for Slack, email or text.
              </Text>
            </View>
            <ChevronRight size={18} color={themeColors.textMuted} />
          </TouchableOpacity>

          {/* Card 3: Live Rehearsal */}
          <TouchableOpacity
            style={[styles.modeCard, { backgroundColor: themeColors.surfaceCard, borderColor: themeColors.surfaceBorder }]}
            onPress={() => navigation.navigate('RehearsalSettings')}
            activeOpacity={0.8}
          >
            <View style={[styles.modeIconBox, { backgroundColor: themeColors.primarySubtle }]}>
              <Mic size={22} color={themeColors.primary} />
            </View>
            <View style={styles.modeTextStack}>
              <Text style={[styles.modeTitle, { color: themeColors.textPrimary }]}>Live Rehearsal</Text>
              <Text style={[styles.modeSub, { color: themeColors.textSecondary }]}>
                Practice the conversation with an adaptive AI counterpart.
              </Text>
            </View>
            <ChevronRight size={18} color={themeColors.textMuted} />
          </TouchableOpacity>
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
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1
  },
  modeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14
  },
  modeTextStack: {
    flex: 1,
    marginRight: 8
  },
  modeTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    marginBottom: 2
  },
  modeSub: {
    fontSize: 12.5,
    lineHeight: 16
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
