export interface FrameworkComponent {
  step: string;
  label: string;
  explanation: string;
  example: string;
}

export interface FrameworkOfTheDay {
  id: string;
  title: string;
  sourceCredit: string;
  tagline: string;
  summary: string;
  components: FrameworkComponent[];
  suggestedScenarioId: string;
  releaseDate: string;
}

export interface DailyPuzzleOption {
  id: string;
  strategyLabel: string;
  responseText: string;
  isOptimal: boolean;
  score: number;
  explanation: string;
}

export interface DailyPuzzle {
  id: string;
  date: string;
  title: string;
  scenarioContext: string;
  counterpartOpeningLine: string;
  options: DailyPuzzleOption[];
  communityDistribution: {
    optionA: number;
    optionB: number;
    optionC: number;
  };
}

export interface ReplyOption {
  label: 'The Direct Option' | 'The Diplomatic Option' | 'The Boundary-Setting Option';
  responseText: string;
  whatThisAccomplishes: string;
  toneStyle: string;
}

export interface ReplyAssistantResult {
  id: string;
  originalSituation: string;
  options: ReplyOption[];
  createdAt: string;
}
