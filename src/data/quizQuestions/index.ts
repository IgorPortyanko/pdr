import type { QuizQuestion } from '../../types';
import { EXAM_QUESTIONS } from './exam';
import { DEFINITIONS_QUESTIONS } from './definitions';
import { PRIORITY_QUESTIONS } from './priority';
import { SIGNS_QUESTIONS } from './signs';
import { MARKINGS_QUESTIONS } from './markings';
import { MANEUVERING_QUESTIONS } from './maneuvering';
import { OVERTAKING_QUESTIONS } from './overtaking';
import { STOPPING_QUESTIONS } from './stopping';
import { RAILWAY_QUESTIONS } from './railway';
import { PEDESTRIANS_QUESTIONS } from './pedestrians';
import { ROUTE_TRANSPORT_QUESTIONS } from './routeTransport';
import { TRAM_QUESTIONS } from './tram';
import { RULES_QUESTIONS } from './rules';
import { SAFE_DRIVING_QUESTIONS } from './safeDriving';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  ...EXAM_QUESTIONS,
  ...DEFINITIONS_QUESTIONS,
  ...PRIORITY_QUESTIONS,
  ...SIGNS_QUESTIONS,
  ...MARKINGS_QUESTIONS,
  ...MANEUVERING_QUESTIONS,
  ...OVERTAKING_QUESTIONS,
  ...STOPPING_QUESTIONS,
  ...RAILWAY_QUESTIONS,
  ...PEDESTRIANS_QUESTIONS,
  ...ROUTE_TRANSPORT_QUESTIONS,
  ...TRAM_QUESTIONS,
  ...RULES_QUESTIONS,
  ...SAFE_DRIVING_QUESTIONS,
];
