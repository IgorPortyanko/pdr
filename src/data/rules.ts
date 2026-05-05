import type { Rule, Category, Chapter } from '../types';
import { PDR_RULES } from './pdrRules.generated';
import { SIGNS } from './signs';
import { MARKINGS } from './markings';
import { QUIZ_QUESTIONS } from './quiz';

export const RULES: Rule[] = PDR_RULES;

export const CHAPTERS: Chapter[] = [
  { id: 'ch-1', number: 1, title: 'Загальні положення' },
  { id: 'ch-2', number: 2, title: "Обов'язки і права водіїв механічних транспортних засобів" },
  { id: 'ch-3', number: 3, title: 'Рух транспортних засобів зі спеціальними сигналами' },
  { id: 'ch-4', number: 4, title: "Обов'язки та права пішоходів" },
  { id: 'ch-5', number: 5, title: "Обов'язки та права пасажирів" },
  { id: 'ch-6', number: 6, title: 'Вимоги до велосипедистів' },
  { id: 'ch-7', number: 7, title: 'Вимоги до осіб, які керують гужовим транспортом та погоничів тварин' },
  { id: 'ch-8', number: 8, title: 'Регулювання дорожнього руху' },
  { id: 'ch-9', number: 9, title: 'Попереджувальні сигнали' },
  { id: 'ch-10', number: 10, title: 'Початок руху та зміна його напрямку' },
  { id: 'ch-11', number: 11, title: 'Розташування транспортних засобів на дорозі' },
  { id: 'ch-12', number: 12, title: 'Швидкість руху' },
  { id: 'ch-13', number: 13, title: "Дистанція, інтервал, зустрічний роз'їзд" },
  { id: 'ch-14', number: 14, title: 'Обгін' },
  { id: 'ch-15', number: 15, title: 'Зупинка та стоянка' },
  { id: 'ch-16', number: 16, title: 'Проїзд перехресть' },
  { id: 'ch-17', number: 17, title: 'Переваги маршрутних транспортних засобів' },
  { id: 'ch-18', number: 18, title: 'Проїзд пішохідних переходів та зупинок транспортних засобів' },
  { id: 'ch-19', number: 19, title: 'Користування зовнішніми світловими приладами' },
  { id: 'ch-20', number: 20, title: 'Рух через залізничні переїзди' },
  { id: 'ch-21', number: 21, title: 'Перевезення пасажирів' },
  { id: 'ch-22', number: 22, title: 'Перевезення вантажу' },
  { id: 'ch-23', number: 23, title: 'Буксирування та експлуатація транспортних составів' },
  { id: 'ch-24', number: 24, title: 'Навчальна їзда' },
  { id: 'ch-25', number: 25, title: 'Рух транспортних засобів у колонах' },
  { id: 'ch-26', number: 26, title: 'Рух у житловій та пішохідній зоні' },
  { id: 'ch-27', number: 27, title: 'Рух по автомагістралях і дорогах для автомобілів' },
  { id: 'ch-28', number: 28, title: 'Рух по гірських дорогах і на крутих спусках' },
  { id: 'ch-29', number: 29, title: 'Міжнародний рух' },
  { id: 'ch-30', number: 30, title: 'Номерні, розпізнавальні знаки, написи та позначення' },
  { id: 'ch-31', number: 31, title: 'Технічний стан транспортних засобів та їх обладнання' },
  { id: 'ch-32', number: 32, title: 'Окремі питання організації дорожнього руху, що потребують узгодження' },
];

function countSigns(categoryId?: string) {
  return categoryId ? SIGNS.filter((sign) => sign.categoryId === categoryId).length : SIGNS.length;
}

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'Всі правила', count: RULES.length, icon: 'BookOpen' },
  {
    id: 'signs',
    label: 'Дорожні знаки',
    count: countSigns(),
    icon: 'TriangleAlert',
    children: [
      { id: 'warning', label: 'Попереджувальні знаки', count: countSigns('warning') },
      { id: 'priority', label: 'Знаки пріоритету', count: countSigns('priority') },
      { id: 'prohibit', label: 'Заборонні знаки', count: countSigns('prohibit') },
      { id: 'mandate', label: 'Наказові знаки', count: countSigns('mandate') },
      { id: 'info', label: 'Інформаційно-вказівні знаки', count: countSigns('info') },
      { id: 'service', label: 'Знаки сервісу', count: countSigns('service') },
      { id: 'tabl', label: 'Таблички до знаків', count: countSigns('tabl') },
    ],
  },
  { id: 'markings', label: 'Дорожня розмітка', count: MARKINGS.length, icon: 'Minus' },
  { id: 'right', label: 'Право проїзду', count: 36, icon: 'Car' },
  { id: 'speed', label: 'Швидкість і дистанція', count: 24, icon: 'Gauge' },
  // { id: 'penalty', label: 'Штрафи', count: 64, icon: 'BookOpen' },
  { id: 'tasks', label: 'Екзаменаційні задачі', count: QUIZ_QUESTIONS.length, icon: 'ClipboardCheck' },
];
