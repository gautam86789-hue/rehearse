import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Share } from 'react-native';
import { Sparkles, Copy, Check, Zap } from 'lucide-react-native';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { typography } from '../theme/typography';
import { apiService } from '../services/api';
import { ReplyAssistantResult, ReplyOption } from '../types';

export const ReplyAssistantScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useApp();
  const [incomingText, setIncomingText] = useState('');
  const [contextText, setContextText] = useState('');
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ReplyAssistantResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const sampleSituations = [
    'Slack from boss at 7 PM: "Hey, can you quickly jump on to finish this deck before tomorrow morning?"',
    'Client email: "We are adding 3 more pages to scope, assume deadline remains Friday?"',
    'Colleague message: "I told the VP we co-authored your model, hope that is fine!"'
  ];

  const handleGenerateReplies = async () => {
    if (!incomingText.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await apiService.generateReplies({
        userId: user.id,
        incomingMessage: incomingText.trim(),
        contextOrRelationship: contextText.trim() || undefined,
        desiredOutcome: desiredOutcome.trim() || undefined
      });

      if (res?.result) {
        setResult(res.result);
      }
    } catch (e) {
      // Local fallback
      setResult({
        id: `reply-${Date.now()}`,
        originalSituation: incomingText,
        options: [
          {
            label: 'The Direct Option',
            responseText: `Thanks for the message. My bandwidth is fully committed to the primary release goals, so I will not be able to take this on tonight. Let's align on priority trade-offs tomorrow morning.`,
            whatThisAccomplishes: `States your boundary cleanly without apologetic hedging while keeping focus on committed deliverables.`,
            toneStyle: 'Crisp & Assertive'
          },
          {
            label: 'The Diplomatic Option',
            responseText: `I want to ensure this gets the attention it deserves. If this needs immediate priority, which of my current active launch tasks would you like me to deprioritize to make room?`,
            whatThisAccomplishes: `Puts the trade-off decision directly back on the requester while maintaining collaborative warmth.`,
            toneStyle: 'Collaborative & Strategic'
          },
          {
            label: 'The Boundary-Setting Option',
            responseText: `I am offline for the evening to recharge, but I have noted this request and will review the requirements first thing at 9:00 AM tomorrow.`,
            whatThisAccomplishes: `Protects your personal evening boundary firmly while reassuring the sender that the item is captured.`,
            toneStyle: 'Calm & Protective'
          }
        ],
        createdAt: new Date().toISOString()
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyOption = async (option: ReplyOption, index: number) => {
    try {
      await Share.share({ message: option.responseText });
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    } catch (e) {
      // Handled
    }
  };

  const getOptionBadgeColor = (label: string) => {
    if (label.includes('Direct')) return colors.primary;
    if (label.includes('Diplomatic')) return colors.sage;
    return colors.gold;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Reply Assistant" rightAction="more" navigation={navigation} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badgeRow}>
          <View style={[styles.coachTag, { backgroundColor: colors.purpleSubtle, borderColor: colors.purple }]}>
            <Zap size={13} color={colors.purple} />
            <Text style={[typography.tag, { color: colors.purple }]}>STRATEGIC NEGOTIATION COACH</Text>
          </View>
        </View>

        <Text style={[typography.hero, { color: colors.textPrimary }]}>Never send an emotional reply</Text>
        <Text style={[typography.subtitle, { color: colors.textSecondary, marginTop: 4, marginBottom: 16 }]}>
          Paste an incoming email, Slack message, or difficult ask. We will engineer 3 calibrated strategies: Direct, Diplomatic, and Boundary-Setting.
        </Text>

        {/* Quick sample chips */}
        <Text style={[typography.overline, { color: colors.textMuted, marginBottom: 8 }]}>QUICK SAMPLE THREADS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {sampleSituations.map((sample, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.chip, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder }]}
              onPress={() => setIncomingText(sample)}
            >
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={1}>{sample}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Text Box */}
        <Text style={[typography.overline, { color: colors.textMuted, marginTop: 14, marginBottom: 6 }]}>THE MESSAGE YOU RECEIVED *</Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder, color: colors.textPrimary }]}
          multiline
          numberOfLines={3}
          placeholder="Paste the Slack message or email thread here..."
          placeholderTextColor={colors.textMuted}
          value={incomingText}
          onChangeText={setIncomingText}
        />

        {/* Context / Relationship */}
        <Text style={[typography.overline, { color: colors.textMuted, marginTop: 14, marginBottom: 6 }]}>RELATIONSHIP / STAKES (OPTIONAL)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surfaceCard, borderColor: colors.surfaceBorder, color: colors.textPrimary }]}
          placeholder="e.g. Demanding executive, passive-aggressive peer, important client"
          placeholderTextColor={colors.textMuted}
          value={contextText}
          onChangeText={setContextText}
        />

        {/* Generate Button */}
        <Button
          title="Generate 3 Strategic Replies"
          variant="primary"
          size="lg"
          loading={isGenerating}
          disabled={!incomingText.trim()}
          onPress={handleGenerateReplies}
          icon={<Sparkles size={18} color={colors.textInverse} />}
          style={styles.generateBtn}
        />

        {/* Generated Options */}
        {result && (
          <View style={styles.resultsContainer}>
            <Text style={[typography.overline, { color: colors.primary, marginBottom: 8 }]}>STRATEGIC RESPONSE OPTIONS</Text>

            {result.options.map((opt, idx) => (
              <Card key={idx} variant="elevated" style={styles.optionCard}>
                <View style={styles.optionHeader}>
                  <View
                    style={[
                      styles.strategyTag,
                      { borderColor: getOptionBadgeColor(opt.label), backgroundColor: colors.surfaceElevated }
                    ]}
                  >
                    <Text style={[typography.tag, { color: getOptionBadgeColor(opt.label) }]}>
                      {opt.label}
                    </Text>
                  </View>
                  <Text style={[typography.caption, { color: colors.textSecondary, fontStyle: 'italic' }]}>{opt.toneStyle}</Text>
                </View>

                {/* Response Text */}
                <View style={[styles.messageBox, { backgroundColor: colors.surfaceHighlight }]}>
                  <Text style={[typography.body, { color: colors.textPrimary, fontStyle: 'italic' }]}>"{opt.responseText}"</Text>
                </View>

                {/* What this accomplishes */}
                <View style={[styles.accomplishesBox, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={[typography.tag, { color: colors.textSecondary, marginBottom: 2 }]}>WHAT THIS ACCOMPLISHES:</Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{opt.whatThisAccomplishes}</Text>
                </View>

                {/* Copy / Share CTA */}
                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: colors.surfaceBorder }]}
                  onPress={() => handleCopyOption(opt, idx)}
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check size={16} color={colors.sage} />
                      <Text style={[typography.buttonSmall, { color: colors.sage }]}>Copied / Shared!</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={16} color={colors.textSecondary} />
                      <Text style={[typography.buttonSmall, { color: colors.textPrimary }]}>Copy & Send</Text>
                    </>
                  )}
                </TouchableOpacity>
              </Card>
            ))}
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
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40
  },
  badgeRow: {
    marginBottom: 8
  },
  coachTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6
  },
  chipsRow: {
    gap: 8,
    paddingBottom: 6
  },
  chip: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    maxWidth: 260
  },
  textArea: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 13
  },
  generateBtn: {
    marginTop: 18,
    marginBottom: 20
  },
  resultsContainer: {
    gap: 16,
    marginTop: 10
  },
  optionCard: {
    padding: 16
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  strategyTag: {
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  messageBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  accomplishesBox: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6
  }
});
