import type { CountryConfig, CountryCode } from '../types';

// ─── Country Data ─────────────────────────────────────────────────────────────

export const COUNTRIES: CountryConfig[] = [
  { code: 'UA', label: 'Україна',           baseLifeExpectancy: 71 },
  { code: 'DE', label: 'Німеччина',         baseLifeExpectancy: 81 },
  { code: 'JP', label: 'Японія',            baseLifeExpectancy: 84 },
  { code: 'US', label: 'США',               baseLifeExpectancy: 78 },
  { code: 'GB', label: 'Велика Британія',   baseLifeExpectancy: 81 },
  { code: 'FR', label: 'Франція',           baseLifeExpectancy: 82 },
  { code: 'PL', label: 'Польща',            baseLifeExpectancy: 77 },
  { code: 'CA', label: 'Канада',            baseLifeExpectancy: 82 },
];

export const COUNTRY_MAP = Object.fromEntries(
  COUNTRIES.map(c => [c.code, c])
) as Record<CountryCode, CountryConfig>;

// ─── Lifestyle Adjustment Table ───────────────────────────────────────────────

export const LIFESTYLE_ADJUSTMENTS = {
  gender: {
    female: +3,
    male:   0,
    other:  +1.5,
  },
  smoking: {
    true:  -7,
    false:  0,
  },
  alcohol: {
    none:   0,
    low:    0,
    medium: -2,
    high:   -5,
  },
  activity: {
    low:    -2,
    medium:  0,
    high:   +4,
  },
  sleep: {
    poor:    -3,
    average:  0,
    good:    +1,
  },
} as const;

// ─── Motivational Messages ────────────────────────────────────────────────────

export const MOTIVATIONAL_MESSAGES = [
  { quote: 'Кожен ранок — новий шанс', sub: 'Цінуйте кожен світанок' },
  { quote: 'Час — найцінніший ресурс', sub: 'Витрачайте його з мудрістю' },
  { quote: 'Ви пишете свою книгу',     sub: 'Яка глава буде сьогодні?' },
  { quote: 'Маленькі кроки — великий шлях', sub: 'Зробіть сьогодні один крок' },
  { quote: 'Якість важливіша за кількість', sub: 'Наповнюйте дні змістом' },
  { quote: 'Сьогодні ніколи не повториться', sub: 'Проживіть його повністю' },
] as const;

// ─── Default User Profile ────────────────────────────────────────────────────

export const DEFAULT_PROFILE = {
  dateOfBirth: '1990-01-01',
  country: 'UA' as CountryCode,
  gender: 'male' as const,
  additionalNotes: '',
  lifestyle: {
    smoking:  false,
    smokingStatus: 'never' as const,
    cigarettesPerDay: 0,
    alcohol:  'none'    as const,
    alcoholUnitsPerWeek: 0,
    activity: 'medium'  as const,
    activityType: '',
    activityMinutesPerWeek: 150,
    sleep:    'average' as const,
    sleepHours: 7.5,
    heightCm: 175,
    weightKg: 75,
    stressLevel: 3 as const,
    workType: 'mixed' as const,
    profession: '',
    workHoursPerWeek: 40,
    socialConnectionsPerWeek: 3,
    sexualContactsPerMonth: 4,
    annualCheckup: true,
    chronicConditions: {
      hypertension: false,
      diabetes: false,
      cardiovascular: false,
    },
  },
};

// ─── App Config ───────────────────────────────────────────────────────────────

export const APP_CONFIG = {
  TIMER_INTERVAL_MS: 1000,
  MAX_LIFESPAN_YEARS: 120,
  WEEKS_PER_YEAR: 52,
  MS_PER_DAY: 86_400_000,
  MS_PER_WEEK: 604_800_000,
  MS_PER_YEAR: 31_557_600_000, // 365.25 days
} as const;
