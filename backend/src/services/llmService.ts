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
}

export class LLMService {
  private geminiApiKey: string | undefined;
  private openaiApiKey: string | undefined;
  private openrouterApiKey: string | undefined;
  private openrouterModel: string;

  constructor() {
    this.geminiApiKey = process.env.GEMINI_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openrouterApiKey = process.env.OPENROUTER_API_KEY;
    this.openrouterModel = process.env.OPENROUTER_MODEL || 'openrouter/free';
  }

  async generateCompletion(
    messages: LLMMessage[],
    options: LLMGenerateOptions = {}
  ): Promise<string> {
    const { temperature = 0.7, maxTokens = 800, responseFormat = 'text' } = options;

    // 1. Try OpenRouter if configured — free-tier router, tried first since
    // it costs nothing; Gemini/OpenAI below are the paid fallbacks if the
    // free route is unavailable or rate-limited.
    if (this.openrouterApiKey) {
      try {
        const response = await this.callOpenRouter(messages, temperature, maxTokens, responseFormat);
        if (response) return response;
      } catch (err) {
        console.warn('OpenRouter API call failed, attempting fallback...', err);
      }
    }

    // 2. Try Gemini if configured
    if (this.geminiApiKey) {
      try {
        const response = await this.callGemini(messages, temperature, responseFormat);
        if (response) return response;
      } catch (err) {
        console.warn('Gemini API call failed, attempting fallback...', err);
      }
    }

    // 3. Try OpenAI if configured
    if (this.openaiApiKey) {
      try {
        const response = await this.callOpenAI(messages, temperature, responseFormat);
        if (response) return response;
      } catch (err) {
        console.warn('OpenAI API call failed, attempting fallback...', err);
      }
    }

    // 4. Fallback: Intelligent Simulated Engine
    return this.simulateFallback(messages);
  }

  private async callOpenRouter(
    messages: LLMMessage[],
    temperature: number,
    maxTokens: number,
    responseFormat: string
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openrouterApiKey}`
        },
        body: JSON.stringify({
          model: this.openrouterModel,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          temperature,
          max_tokens: maxTokens,
          // Some free OpenRouter models (Nemotron in particular) are hybrid
          // reasoning models that spend tokens "thinking" before answering.
          // With our tight per-reply maxTokens budget, that reasoning can
          // consume the whole budget and get cut off before the real answer
          // is written — sometimes leaking the raw scratch-thinking straight
          // into `content` instead of a clean reply. Disabling reasoning
          // keeps the full token budget on the actual response.
          reasoning: { enabled: false },
          response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined
        })
      });

      if (!res.ok) {
        throw new Error(`OpenRouter returned ${res.status}: ${await res.text()}`);
      }

      const data = await res.json() as any;
      return data.choices?.[0]?.message?.content || '';
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async callGemini(
    messages: LLMMessage[],
    temperature: number,
    responseFormat: string
  ): Promise<string> {
    const prompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${this.geminiApiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            responseMimeType: responseFormat === 'json' ? 'application/json' : 'text/plain'
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Gemini returned ${res.status}: ${await res.text()}`);
      }

      const data = await res.json() as any;
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async callOpenAI(
    messages: LLMMessage[],
    temperature: number,
    responseFormat: string
  ): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        temperature,
        response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined
      })
    });

    if (!res.ok) {
      throw new Error(`OpenAI returned ${res.status}: ${await res.text()}`);
    }

    const data = await res.json() as any;
    return data.choices?.[0]?.message?.content || '';
  }

  private simulateFallback(messages: LLMMessage[]): string {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const systemMsg = messages.find((m) => m.role === 'system')?.content || '';

    // AI Assistant chat — plain text, not JSON, so it must be checked before
    // the JSON branch below or it falls through to the unrelated roleplay
    // default line at the bottom of this method.
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

    // Default conversational response
    return "I hear your point, but given our current roadmap and bandwidth, I need to understand why this cannot wait until next quarter.";
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
