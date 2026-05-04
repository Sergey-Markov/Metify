import type {
  GoalCategory,
  GoalPriority,
  HabitCategory,
  HabitFrequency,
} from "../types/goalsHabits";

export interface HabitPreset {
  id: string;
  title: string;
  emoji: string;
  category: HabitCategory;
  frequency: HabitFrequency;
}

export interface GoalPreset {
  id: string;
  title: string;
  category: GoalCategory;
  priority: GoalPriority;
  milestoneTitles: string[];
}

export const PRESETS_PREVIEW_LIMIT = 8;

export const HABIT_PRESETS: HabitPreset[] = [
  {
    id: "habit-water",
    title: "Випити 2л води",
    emoji: "💧",
    category: "health",
    frequency: "daily",
  },
  {
    id: "habit-steps",
    title: "10 000 кроків",
    emoji: "🚶",
    category: "health",
    frequency: "daily",
  },
  {
    id: "habit-reading",
    title: "Читати 20 хвилин",
    emoji: "📚",
    category: "mind",
    frequency: "daily",
  },
  {
    id: "habit-sleep",
    title: "Сон до 23:00",
    emoji: "🌙",
    category: "health",
    frequency: "daily",
  },
  {
    id: "habit-review",
    title: "Тижневий огляд цілей",
    emoji: "🧭",
    category: "work",
    frequency: "weekly",
  },
  {
    id: "habit-no-sugar",
    title: "Без солодкого після 19:00",
    emoji: "🍬",
    category: "health",
    frequency: "daily",
  },
  {
    id: "habit-vegetables",
    title: "Овочі в кожному прийомі їжі",
    emoji: "🥗",
    category: "health",
    frequency: "daily",
  },
  {
    id: "habit-stretch",
    title: "Розтяжка 10 хвилин",
    emoji: "🧘",
    category: "health",
    frequency: "daily",
  },
  {
    id: "habit-journal",
    title: "Щоденник: 5 хвилин увечері",
    emoji: "✍️",
    category: "mind",
    frequency: "daily",
  },
  {
    id: "habit-language",
    title: "Практика мови 15 хвилин",
    emoji: "🗣️",
    category: "mind",
    frequency: "daily",
  },
  {
    id: "habit-breathing",
    title: "Дихальна вправа 3 хвилини",
    emoji: "🌬️",
    category: "mind",
    frequency: "daily",
  },
  {
    id: "habit-no-scroll-morning",
    title: "Без соцмереж першу годину",
    emoji: "📵",
    category: "mind",
    frequency: "daily",
  },
  {
    id: "habit-focus-block",
    title: "1 фокус-блок без відволікань",
    emoji: "🎯",
    category: "work",
    frequency: "daily",
  },
  {
    id: "habit-inbox-zero",
    title: "Inbox zero до кінця дня",
    emoji: "📥",
    category: "work",
    frequency: "daily",
  },
  {
    id: "habit-plan-tomorrow",
    title: "План на завтра (3 пріоритети)",
    emoji: "📝",
    category: "work",
    frequency: "daily",
  },
  {
    id: "habit-deep-work",
    title: "2 години deep work",
    emoji: "💻",
    category: "work",
    frequency: "daily",
  },
  {
    id: "habit-call-family",
    title: "Зв'язатися з рідними",
    emoji: "📞",
    category: "social",
    frequency: "daily",
  },
  {
    id: "habit-thank-you",
    title: "Подяка одній людині щодня",
    emoji: "🙏",
    category: "social",
    frequency: "daily",
  },
  {
    id: "habit-no-buy-day",
    title: "День без зайвих витрат",
    emoji: "💸",
    category: "other",
    frequency: "weekly",
  },
  {
    id: "habit-evening-walk",
    title: "Вечірня прогулянка 20 хвилин",
    emoji: "🌆",
    category: "other",
    frequency: "daily",
  },
];

export const GOAL_PRESETS: GoalPreset[] = [
  {
    id: "goal-interview",
    title: "Підготуватися до співбесіди",
    category: "career",
    priority: "high",
    milestoneTitles: [
      "Оновити резюме та портфоліо",
      "Пройти 3 технічні мок-інтерв'ю",
      "Підготувати відповіді на поведінкові питання",
    ],
  },
  {
    id: "goal-run-5k",
    title: "Пробігти 5 км без зупинки",
    category: "health",
    priority: "medium",
    milestoneTitles: [
      "Тренуватись 3 рази на тиждень",
      "Пробігти 3 км комфортним темпом",
      "Завершити контрольний забіг 5 км",
    ],
  },
  {
    id: "goal-savings",
    title: "Зібрати фінансову подушку",
    category: "finance",
    priority: "high",
    milestoneTitles: [
      "Порахувати базові місячні витрати",
      "Налаштувати автонакопичення",
      "Накопичити резерв на 3 місяці",
    ],
  },
  {
    id: "goal-books-year",
    title: "Прочитати 12 книг за рік",
    category: "growth",
    priority: "medium",
    milestoneTitles: [
      "Скласти річний список книг",
      "Виділити щоденний слот для читання",
      "Робити короткі нотатки після кожної книги",
    ],
  },
  {
    id: "goal-promotion",
    title: "Отримати підвищення на роботі",
    category: "career",
    priority: "high",
    milestoneTitles: [
      "Узгодити критерії підвищення з менеджером",
      "Закрити 2 проєкти з вимірним результатом",
      "Підготувати self-review і план росту",
    ],
  },
  {
    id: "goal-portfolio",
    title: "Оновити професійне портфоліо",
    category: "career",
    priority: "medium",
    milestoneTitles: [
      "Зібрати 5 найсильніших кейсів",
      "Описати результати в цифрах",
      "Опублікувати нову версію портфоліо",
    ],
  },
  {
    id: "goal-cv-linkedin",
    title: "Прокачати CV та LinkedIn",
    category: "career",
    priority: "medium",
    milestoneTitles: [
      "Оновити блок про досвід",
      "Додати вимірні досягнення",
      "Отримати 2 зовнішніх рев'ю",
    ],
  },
  {
    id: "goal-public-speaking",
    title: "Прокачати публічні виступи",
    category: "career",
    priority: "medium",
    milestoneTitles: [
      "Підготувати 1 коротку доповідь",
      "Виступити на внутрішній зустрічі",
      "Отримати та впровадити фідбек",
    ],
  },
  {
    id: "goal-networking",
    title: "Розширити професійний нетворк",
    category: "career",
    priority: "low",
    milestoneTitles: [
      "Оновити профілі в проф-спільнотах",
      "Відвідати 2 профільні події",
      "Призначити 5 корисних дзвінків",
    ],
  },
  {
    id: "goal-english-b2",
    title: "Підтягнути англійську до B2",
    category: "growth",
    priority: "high",
    milestoneTitles: [
      "Зробити діагностичний тест",
      "Займатися 4 рази на тиждень",
      "Скласти пробний іспит рівня B2",
    ],
  },
  {
    id: "goal-read-24",
    title: "Прочитати 24 книги за рік",
    category: "growth",
    priority: "medium",
    milestoneTitles: [
      "Зробити 12-тижневий план читання",
      "Закрити перші 6 книг",
      "Вести нотатки та висновки по кожній",
    ],
  },
  {
    id: "goal-course",
    title: "Завершити профільний онлайн-курс",
    category: "growth",
    priority: "medium",
    milestoneTitles: [
      "Обрати курс і дедлайн",
      "Проходити 3 модулі щотижня",
      "Здати фінальний проєкт",
    ],
  },
  {
    id: "goal-time-management",
    title: "Покращити тайм-менеджмент",
    category: "growth",
    priority: "medium",
    milestoneTitles: [
      "Впровадити тижневе планування",
      "Відслідковувати витрати часу 14 днів",
      "Оптимізувати топ-3 часові втрати",
    ],
  },
  {
    id: "goal-writing",
    title: "Писати 2 тексти на місяць",
    category: "growth",
    priority: "low",
    milestoneTitles: [
      "Скласти контент-план на 3 місяці",
      "Підготувати 4 чернетки",
      "Опублікувати 2 завершені тексти",
    ],
  },
  {
    id: "goal-sleep",
    title: "Нормалізувати режим сну",
    category: "health",
    priority: "high",
    milestoneTitles: [
      "Лягати до 23:00 5 днів на тиждень",
      "Прибрати гаджети за 1 годину до сну",
      "Тримати режим 30 днів поспіль",
    ],
  },
  {
    id: "goal-weight",
    title: "Скинути 5 кг без жорстких дієт",
    category: "health",
    priority: "high",
    milestoneTitles: [
      "Налаштувати дефіцит калорій",
      "Додати 8-10 тис. кроків щодня",
      "Закріпити результат 4 тижні",
    ],
  },
  {
    id: "goal-strength",
    title: "Підвищити силові показники",
    category: "health",
    priority: "medium",
    milestoneTitles: [
      "Скласти програму 3 тренування/тиждень",
      "Фіксувати прогрес ваг у вправах",
      "Збільшити робочі ваги на 15%",
    ],
  },
  {
    id: "goal-10k-run",
    title: "Пробігти 10 км",
    category: "health",
    priority: "medium",
    milestoneTitles: [
      "Підняти обсяг до 20 км/тиждень",
      "Пробігти 7 км без зупинки",
      "Фінішувати контрольний старт 10 км",
    ],
  },
  {
    id: "goal-mobility",
    title: "Покращити мобільність і поставу",
    category: "health",
    priority: "low",
    milestoneTitles: [
      "Робити мобіліті-комплекс 4 рази/тиждень",
      "Пройти скринінг постави",
      "Зменшити дискомфорт у спині",
    ],
  },
  {
    id: "goal-emergency-fund-6m",
    title: "Створити подушку на 6 місяців",
    category: "finance",
    priority: "high",
    milestoneTitles: [
      "Визначити суму цілі",
      "Налаштувати щомісячний автопереказ",
      "Досягти 100% цілі",
    ],
  },
  {
    id: "goal-investing-start",
    title: "Почати інвестувати регулярно",
    category: "finance",
    priority: "medium",
    milestoneTitles: [
      "Вивчити базову стратегію портфеля",
      "Відкрити інвест-рахунок",
      "Інвестувати 3 місяці поспіль",
    ],
  },
  {
    id: "goal-debt-free",
    title: "Закрити споживчий борг",
    category: "finance",
    priority: "high",
    milestoneTitles: [
      "Зібрати повний список боргів",
      "Скласти графік дострокового погашення",
      "Погасити 100% боргу",
    ],
  },
  {
    id: "goal-budget-control",
    title: "Вести бюджет без пропусків 90 днів",
    category: "finance",
    priority: "medium",
    milestoneTitles: [
      "Налаштувати 5 основних категорій витрат",
      "Вносити витрати щодня",
      "Зробити 3 щомісячні рев'ю бюджету",
    ],
  },
  {
    id: "goal-family-time",
    title: "Більше часу з родиною",
    category: "family",
    priority: "high",
    milestoneTitles: [
      "Запланувати 2 сімейні вечори щотижня",
      "Прибрати робочі дзвінки у вихідні",
      "Закріпити ритм протягом 8 тижнів",
    ],
  },
  {
    id: "goal-family-trip",
    title: "Сімейна подорож без стресу",
    category: "family",
    priority: "medium",
    milestoneTitles: [
      "Визначити бюджет і напрямок",
      "Забронювати ключові пункти маршруту",
      "Підготувати чекліст перед виїздом",
    ],
  },
  {
    id: "goal-parents-support",
    title: "Регулярна підтримка батьків",
    category: "family",
    priority: "medium",
    milestoneTitles: [
      "Узгодити щотижневий графік дзвінків",
      "Організувати 2 спільні зустрічі на місяць",
      "Закріпити ритуал допомоги на 3 місяці",
    ],
  },
  {
    id: "goal-europe-trip",
    title: "Організувати подорож Європою",
    category: "travel",
    priority: "medium",
    milestoneTitles: [
      "Визначити 3 міста маршруту",
      "Сформувати бюджет і резерв",
      "Купити квитки і забронювати житло",
    ],
  },
  {
    id: "goal-passport-docs",
    title: "Підготувати документи для подорожей",
    category: "travel",
    priority: "low",
    milestoneTitles: [
      "Перевірити строки дії документів",
      "Оформити страхування",
      "Підготувати цифрові копії документів",
    ],
  },
  {
    id: "goal-travel-fund",
    title: "Назбирати на велику подорож",
    category: "travel",
    priority: "medium",
    milestoneTitles: [
      "Визначити суму travel-фонду",
      "Відкладати фіксовану суму щомісяця",
      "Досягти цілі до дедлайну",
    ],
  },
  {
    id: "goal-photo-project",
    title: "Запустити творчий фотопроєкт",
    category: "creative",
    priority: "low",
    milestoneTitles: [
      "Обрати тему і стиль проєкту",
      "Зробити 20 знімків серії",
      "Опублікувати підбірку робіт",
    ],
  },
  {
    id: "goal-music-skill",
    title: "Освоїти новий музичний навик",
    category: "creative",
    priority: "medium",
    milestoneTitles: [
      "Скласти план занять на 8 тижнів",
      "Вивчити 3 композиції",
      "Записати фінальне виконання",
    ],
  },
];
