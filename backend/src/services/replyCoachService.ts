import { v4 as uuidv4 } from 'uuid';
import { LLMService, llmService } from './llmService.js';
import { ReplyAssistantResult, ReplyOption } from '../types/index.js';

export interface GenerateReplyInput {
  incomingMessage: string;
  contextOrRelationship?: string; // e.g. "My manager asking for weekend work"
  desiredOutcome?: string;        // e.g. "Say no without sounding like a slacker"
}

export class ReplyCoachService {
  constructor(private llm: LLMService = llmService) {}

  async generateStrategicReplies(input: GenerateReplyInput): Promise<ReplyAssistantResult> {
    const systemPrompt = `You are the executive Message Coach and Strategic Reply Assistant for Rehearse.
The user received a tricky, high-stakes message (Slack, email, text) or is in a tense professional situation.

Your task is to generate 3 DISTINCT, strategic response options:
1. "The Direct Option": Clear, crisp, assertive, and straightforward. Ideal when speed and clarity matter most.
2. "The Diplomatic Option": Collaborative, empathetic, high relational warmth while maintaining professional firmness.
3. "The Boundary-Setting Option": Uncompromising on limits/time/scope, de-escalating, and offers structured alternatives.

For each option, provide:
- The exact response text to copy/send
- "whatThisAccomplishes": A 1-sentence breakdown of why this works and what strategic advantage it gives
- "toneStyle": A 2-3 word tone descriptor (e.g. "Assertive & Decisive", "Collaborative Bridge-Builder", "Firm & Protective")

You MUST return a valid JSON object strictly matching this schema:
{
  "options": [
    {
      "label": "The Direct Option",
      "responseText": "Exact text...",
      "whatThisAccomplishes": "...",
      "toneStyle": "..."
    },
    {
      "label": "The Diplomatic Option",
      "responseText": "Exact text...",
      "whatThisAccomplishes": "...",
      "toneStyle": "..."
    },
    {
      "label": "The Boundary-Setting Option",
      "responseText": "Exact text...",
      "whatThisAccomplishes": "...",
      "toneStyle": "..."
    }
  ]
}`;

    const userPrompt = `INCOMING MESSAGE / SITUATION:
"${input.incomingMessage}"

RELATIONSHIP / CONTEXT:
"${input.contextOrRelationship || 'Colleague / Manager'}"

DESIRED OUTCOME:
"${input.desiredOutcome || 'Handle with professional confidence'}"

Generate the 3 strategic reply options JSON now.`;

    try {
      const rawResponse = await this.llm.generateCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        { temperature: 0.6, responseFormat: 'json' }
      );

      const parsed = this.cleanAndParseJSON(rawResponse);
      const options = this.validateOptions(parsed.options, input.incomingMessage);

      return {
        id: `reply-${uuidv4().slice(0, 8)}`,
        originalSituation: input.incomingMessage,
        options,
        createdAt: new Date().toISOString()
      };
    } catch (err) {
      console.warn('LLM reply coach generation failed, using intelligent fallback options:', err);
      return this.buildFallbackReplies(input);
    }
  }

  private cleanAndParseJSON(text: string): any {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON found in reply coach output');
    return JSON.parse(match[0]);
  }

  private validateOptions(options: any[], incoming: string): ReplyOption[] {
    if (!Array.isArray(options) || options.length < 3) {
      return this.buildFallbackReplies({ incomingMessage: incoming }).options;
    }
    return options.map((opt, i) => {
      const defaultLabels: ('The Direct Option' | 'The Diplomatic Option' | 'The Boundary-Setting Option')[] = [
        'The Direct Option',
        'The Diplomatic Option',
        'The Boundary-Setting Option'
      ];
      return {
        label: defaultLabels[i] || 'The Direct Option',
        responseText: String(opt.responseText || ''),
        whatThisAccomplishes: String(opt.whatThisAccomplishes || 'Provides a clear professional reply.'),
        toneStyle: String(opt.toneStyle || 'Professional')
      };
    });
  }

  private buildFallbackReplies(input: GenerateReplyInput): ReplyAssistantResult {
    return {
      id: `reply-${uuidv4().slice(0, 8)}`,
      originalSituation: input.incomingMessage,
      options: [
        {
          label: 'The Direct Option',
          responseText: `Thanks for the note. My current capacity is dedicated to the Q3 launch deliverables, so I won't be able to take this on right now. Let's revisit during sprint planning on Monday.`,
          whatThisAccomplishes: `States your availability cleanly without over-explaining or apologizing, keeping focus on core priorities.`,
          toneStyle: 'Crisp & Assertive'
        },
        {
          label: 'The Diplomatic Option',
          responseText: `I appreciate you flagging this. I want to make sure this gets the attention it needs—if this is urgent, which of my existing commitments would you like me to deprioritize to free up bandwidth?`,
          whatThisAccomplishes: `Puts the trade-off decision back on the requester while remaining collaborative and solutions-oriented.`,
          toneStyle: 'Collaborative & Strategic'
        },
        {
          label: 'The Boundary-Setting Option',
          responseText: `I'm offline for the evening to recharge, but I have noted this and will review the requirements first thing at 9 AM tomorrow.`,
          whatThisAccomplishes: `Protects your personal boundary firmly while assuring the sender that the message has been captured.`,
          toneStyle: 'Calm & Protective'
        }
      ],
      createdAt: new Date().toISOString()
    };
  }
}

export const replyCoachService = new ReplyCoachService();
