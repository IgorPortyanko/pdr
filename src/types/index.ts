export type RuleStatus = 'published' | 'draft' | 'review';

export interface Rule {
  id: string;
  code: string;
  title: string;
  cat: string;
  catId: string;
  status: RuleStatus;
  updated: string;
  author: string;
  pending: boolean;
  description?: string;
  penalty?: string;
  appliesTo?: string;
  tags?: string[];
  linkedQuiz?: string;
}

export interface Category {
  id: string;
  label: string;
  count: number;
  icon: string;
  children?: Omit<Category, 'icon' | 'children'>[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
}

export interface Signs {
  id: string;
  number: string;
  title: string;
  desc: string;
  src: string;
  categoryId: string;
}

export interface Marking {
  id: string;
  number: string;
  title: string;
  desc: string;
  src: string;
  kind: 'horizontal' | 'vertical';
}

export type QuizMode = 'training' | 'exam';

export interface Profile {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
}

export interface QuestionStat {
  correct: number;
  wrong: number;
  lastSeen: string;
}

export interface ExamResult {
  id: string;
  date: string;
  score: number;
  total: number;
  mode: QuizMode;
  topic: string;
}
export type QuizTopic =
  | 'exam'
  | 'definitions'
  | 'priority'
  | 'markings'
  | 'signs'
  | 'maneuvering'
  | 'overtaking'
  | 'stopping'
  | 'railway'
  | 'pedestrians'
  | 'route-transport'
  | 'tram'
  | 'rules'
  | 'safe_driving';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  image?: string;
  options: QuizOption[];
  explanation?: string;
  relatedRuleCodes?: string[];
  relatedSignNumbers?: string[];
  relatedMarkingNumbers?: string[];
  topic?: QuizTopic;
}
