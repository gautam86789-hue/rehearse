import dotenv from 'dotenv';
dotenv.config();

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
  // When a real Gemini key is configured and every attempt fails, throw
  // instead of returning the canned simulator text — used where a scripted
  // stand-in would be passed off as a genuine AI reply or a real score.
  strict?: boolean;
}

export class LLMService {
  private geminiApiKey: string | undefined;
  private geminiModel: string;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  }

  async generateCompletion(
    messages: LLMMessage[],
    options: LLMGenerateOptions = {}
  ): Promise<string> {
    const { temperature = 0.75, responseFormat = 'text', maxTokens, strict = false } = options;

    if (this.geminiApiKey) {
      // Two attempts: one transient timeout or empty completion shouldn't be
      // what decides whether someone gets a real reply.
      let lastErr: unknown = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await this.callGemini(messages, temperature, responseFormat, maxTokens);
          if (response && response.trim().length > 0) return response;
          lastErr = new Error('Gemini returned an empty completion');
        } catch (err) {
          lastErr = err;
        }
        console.warn(`Gemini attempt ${attempt} failed:`, lastErr);
      }
      if (strict) throw lastErr instanceof Error ? lastErr : new Error('AI generation failed');
    }

    // Fallback: Intelligent Simulated Engine (no key configured, or the call above failed)
    return this.simulateFallback(messages);
  }

  private async callGemini(
    messages: LLMMessage[],
    temperature: number,
    responseFormat: string,
    maxTokens?: number
  ): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    // Extract system message for Gemini systemInstruction
    const systemMsg = messages.find((m) => m.role === 'system')?.content;
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    const systemInstruction = systemMsg ? { parts: [{ text: systemMsg }] } : undefined;
    const contents = conversationMessages.length > 0
      ? conversationMessages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      : [{ role: 'user', parts: [{ text: 'Hello' }] }];

    // Gemini 3.6 Flash uses internal thinking tokens before emitting final text.
    // Setting maxOutputTokens below 1000 causes MAX_TOKENS truncation after 2-10 words.
    // Ensure effectiveMaxTokens is at least 1500 so responses are complete and fully formed.
    const effectiveMaxTokens = Math.max(maxTokens || 1800, 1500);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(systemInstruction ? { systemInstruction } : {}),
          contents,
          generationConfig: {
            temperature,
            responseMimeType: responseFormat === 'json' ? 'application/json' : 'text/plain',
            maxOutputTokens: effectiveMaxTokens
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Gemini returned ${res.status}: ${await res.text()}`);
      }

      const data = await res.json() as any;
      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || '';
      
      if (!text && candidate?.finishReason === 'MAX_TOKENS') {
        console.warn('Gemini response hit MAX_TOKENS limit before text output');
      }

      return text;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private simulateFallback(messages: LLMMessage[]): string {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const systemMsg = messages.find((m) => m.role === 'system')?.content || '';

    // AI Assistant chat — plain text
    if (systemMsg.includes('in-app AI assistant for Rehearse')) {
      return this.simulateAssistantReply(lastUserMsg);
    }

    // Check if JSON response is expected
    if (systemMsg.includes('JSON') || lastUserMsg.includes('JSON')) {
      // 1. Scoring Rubric JSON
      if (systemMsg.includes('COMMUNICATION RUBRIC') || systemMsg.includes('clarity')) {
        return JSON.stringify({
          clarity: 85,
          empathy: 78,
          assertiveness: 80,
          listening: 82,
          overallScore: 81,
          strengths: [
            "Clearly anchored the conversation on verified business metrics ($2.5M)",
            "Refused blanket deferrals and proposed the concrete executive exception process"
          ],
          growthAreas: [
            "Shorten the preamble sentence to get to the core number even faster",
            "Hold steady during counterpart pushback pauses"
          ],
          weakestLineRewrite: {
            originalLine: "I understand macro policy is tight, but we agreed out-of-cycle exceptions apply to top 5% performers.",
            suggestedRewrite: "Given the verified $2.5M ROI, let's initiate the out-of-cycle performance exception review this week.",
            coachingRationale: "Replaces tentative justification with a decisive, collaborative call to action.",
            techniqueApplied: "The Value-Anchored Directive"
          },
          keyTakeaways: [
            "Lead with the data within the first 30 seconds",
            "Anchor on the formal exception process when standard bands are cited"
          ]
        });
      }

      // 2. Scenario Brief Generation JSON
      if (systemMsg.includes('Scenario Brief') || lastUserMsg.includes('Situation:')) {
        return JSON.stringify({
          title: "Custom High-Stakes Rehearsal",
          counterpartRole: "Department Lead",
          difficulty: "High Stakes",
          userGoal: "Navigate this high-stakes discussion successfully.",
          brief: {
            counterpartPosition: "Will minimize urgency, cite competing priorities, and test whether you hold your request firmly.",
            probablePushbackPatterns: [
              "Questioning the timing of your request",
              "Suggesting a diluted compromise",
              "Highlighting resource constraints"
            ],
            whatGoodLooksLike: "Stating your target outcome directly in sentence 1, grounding your request in verified impact, and maintaining emotional composure without over-apologizing.",
            keyPhrasesToAvoid: ["I was just wondering", "Sorry to bother you", "If it's not possible, no worries"],
            recommendedOpeningFormula: "Clear context in 1 sentence → Specific ask with exact terms → Open invitation for alignment."
          }
        });
      }

      // 3. Reply Assistant JSON
      if (systemMsg.includes('Message Coach') || systemMsg.includes('Direct Option')) {
        return JSON.stringify({
          options: [
            {
              label: "The Direct Option",
              responseText: "Thanks for checking in. My bandwidth is fully committed to the launch deliverables, so I will not be able to take this on right now. Let's revisit during sprint planning on Monday.",
              whatThisAccomplishes: "States your boundary with zero ambiguity while keeping priorities centered on core company goals.",
              toneStyle: "Crisp & Assertive"
            },
            {
              label: "The Diplomatic Option",
              responseText: "I want to ensure this gets the focus it requires—if this needs immediate turnaround, which of my current active projects should we deprioritize to create room?",
              whatThisAccomplishes: "Places the trade-off decision squarely back on the stakeholder while preserving a collaborative relationship.",
              toneStyle: "Collaborative & Strategic"
            },
            {
              label: "The Boundary-Setting Option",
              responseText: "I am offline for the evening to recharge, but I have flagged this and will review the requirements first thing at 9:00 AM tomorrow.",
              whatThisAccomplishes: "Protects personal rest time firmly without leaving the sender wondering whether you received the message.",
              toneStyle: "Calm & Protective"
            }
          ]
        });
      }
    }

    // Default conversational fallback (complete 3-sentence response)
    return "I hear the points you're bringing forward, but our department is operating under strict quarterly resource allocations right now. I need to see a clear, data-backed business case before I can consider an exception to this policy. Bring me specific ROI figures by Friday, and we can discuss a potential conditional path forward.";
  }

  private simulateAssistantReply(userMessage: string): string {
    const lower = userMessage.toLowerCase();
    if (lower.includes('pattern') || lower.includes('setback') || lower.includes('struggle') || lower.includes('weak')) {
      return "Based on your recent sessions, you tend to lose specificity once the other person pushes back — try anchoring on one concrete number or fact before responding next time.";
    }
    if (lower.includes('reply') || lower.includes('respond') || lower.includes('say to') || lower.includes('what should i say')) {
      return 'Try: "I hear that, and here\'s where I stand: [your specific ask]. What would it take to make that work?" — states your position without over-explaining.';
    }
    if (lower.includes('feature') || lower.includes('what should i use') || lower.includes('best') || lower.includes('practice next')) {
      return 'If you have a specific real situation, use Custom Scenario. For a fast daily rep, use Quick Drill. To build a skill from scratch, start with Guided Practice.';
    }
    return "I'm here to help — ask me what to practice next, how to respond to something, or what patterns are showing up in your rehearsals.";
  }
}

export const llmService = new LLMService();
