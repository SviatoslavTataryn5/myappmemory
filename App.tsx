import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameType, GameState, GameSettings, PlayingCard, CardSuit, AnalysisResult, NameFace, HistoryEntry } from './types';
import { generateWordsList, generateNamesList, getMnemonicCoachTip } from './services/gemini';
import { CardView } from './components/CardView';
import { 
  Brain, 
  Play, 
  Trophy, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Timer as TimerIcon,
  Sparkles,
  Binary,
  Users,
  Image as ImageIcon,
  Palette,
  BarChart2,
  BookOpen,
  Trash2,
  ArrowRight,
  Globe,
  History,
  CheckCircle
} from 'lucide-react';

// --- Localization ---

const STRINGS = {
  en: {
    title: "MnemoPro",
    subtitle: "Master the art of memory with professional drills.",
    numbers: "Numbers",
    binaries: "Binaries",
    cards: "Cards",
    words: "Words",
    faces: "Faces",
    images: "Images",
    colors: "Colors",
    progress: "My Progress",
    progressDesc: "View stats and history",
    guide: "Rules & Tips",
    guideDesc: "Learn techniques",
    back: "Back",
    clearHistory: "Clear History",
    historyTitle: "Performance History",
    noHistory: "No games played yet. Go train your brain!",
    date: "Date",
    discipline: "Discipline",
    score: "Score",
    accuracy: "Accuracy",
    time: "Time",
    quantity: "Quantity",
    items: "items",
    timeLimit: "Time Limit (seconds)",
    grouping: "Grouping Size",
    pace: "Auto-Advance Pace",
    paceDesc: "Items per minute (0 = manual)",
    start: "Start Game",
    generating: "Generating...",
    timeLeft: "Time Left",
    finish: "Finish",
    recall: "Recall",
    finishAll: "Finish All",
    typeNum: "Enter sequence of numbers:",
    typeBin: "Enter binary sequence (0/1):",
    typeHere: "Type here...",
    item: "Item",
    whoIs: "Who is this?",
    typeWord: "Type word...",
    typeName: "Type name...",
    pressEnter: "Press Enter to Next",
    selectCard: "Select Card",
    tapCard: "Tap a card to Select & Next",
    tapColor: "Tap a color to Select & Next",
    tapImage: "Tap an image to Select & Next",
    prev: "Previous",
    next: "Next",
    analysis: "Analysis Complete",
    perf: "Here is how you performed.",
    mistakes: "Mistakes",
    comparison: "Comparison",
    correctVsInput: "Correct vs Input",
    yourInput: "Your Input:",
    aiCoach: "AI Coach",
    askCoach: "Get Mnemonic Advice for this Set",
    asking: "Asking Coach...",
    mainMenu: "Main Menu",
    playAgain: "Play Again",
    confirmClear: "Are you sure you want to clear all history?",
    guides: {
        numbers_desc: 'The Major System is the gold standard.',
        numbers_content: 'Assign a consonant sound to each digit (0-9). For example: 0=s/z, 1=t/d, 2=n, 3=m, 4=r, 5=l, 6=j/sh, 7=k/g, 8=f/v, 9=p/b. Create words from pairs or triplets of numbers and place them in a Memory Palace.',
        cards_desc: 'PAO (Person-Action-Object) System.',
        cards_content: 'Assign a specific Person, Action, and Object to every card in the deck. When you see three cards, use the Person of the first, Action of the second, and Object of the third to create a unique, memorable scene.',
        images_desc: 'The Story Method or Linking.',
        images_content: 'Create a vivid narrative that links each image to the next. If you see a "Cat" then a "Toaster", imagine a Cat jumping into a Toaster. The more absurd and emotional the visualization, the better it sticks.',
        faces_desc: 'Feature Association.',
        faces_content: 'Pick a distinctive feature on the face (e.g., big nose). Associate the name with a concrete image (e.g., "Mike" -> "Microphone"). Visualize a microphone balancing on the big nose.',
        colors_desc: 'Object Association.',
        colors_content: 'Associate each color with a fixed object. Red = Apple, Blue = Ocean, Green = Grass. When you see a sequence, link these objects together using the Story Method.',
        words_desc: 'Memory Palace.',
        words_content: 'Place each word (converted to an image) along a familiar route (your house, walk to work). Retrieving the words is simply a matter of "walking" through your palace.'
    }
  },
  uk: {
    title: "MnemoPro",
    subtitle: "Опануйте мистецтво пам'яті за допомогою професійних тренувань.",
    numbers: "Числа",
    binaries: "Бінарні",
    cards: "Карти",
    words: "Слова",
    faces: "Обличчя",
    images: "Картинки",
    colors: "Кольори",
    progress: "Мій прогрес",
    progressDesc: "Статистика та історія",
    guide: "Правила та Поради",
    guideDesc: "Вивчення технік",
    back: "Назад",
    clearHistory: "Очистити історію",
    historyTitle: "Історія результатів",
    noHistory: "Ігор ще не було. Тренуйте свій мозок!",
    date: "Дата",
    discipline: "Дисципліна",
    score: "Рахунок",
    accuracy: "Точність",
    time: "Час",
    quantity: "Кількість",
    items: "шт",
    timeLimit: "Ліміт часу (секунди)",
    grouping: "Розмір групи",
    pace: "Темп авто-показу",
    paceDesc: "Елементів за хвилину (0 = вручну)",
    start: "Почати гру",
    generating: "Генерування...",
    timeLeft: "Час",
    finish: "Завершити",
    recall: "Відтворення",
    finishAll: "Завершити все",
    typeNum: "Введіть послідовність чисел:",
    typeBin: "Введіть бінарну послідовність (0/1):",
    typeHere: "Введіть тут...",
    item: "Елемент",
    whoIs: "Хто це?",
    typeWord: "Введіть слово...",
    typeName: "Введіть ім'я...",
    pressEnter: "Натисніть Enter для наступного",
    selectCard: "Виберіть карту",
    tapCard: "Натисніть карту для вибору",
    tapColor: "Натисніть колір для вибору",
    tapImage: "Натисніть зображення для вибору",
    prev: "Назад",
    next: "Далі",
    analysis: "Аналіз завершено",
    perf: "Ваші результати.",
    mistakes: "Помилки",
    comparison: "Порівняння",
    correctVsInput: "Правильно vs Введено",
    yourInput: "Ваше введення:",
    aiCoach: "ШІ Тренер",
    askCoach: "Отримати мнемонічну пораду",
    asking: "Запитую тренера...",
    mainMenu: "Головне меню",
    playAgain: "Грати знову",
    confirmClear: "Ви впевнені, що хочете очистити всю історію?",
    guides: {
        numbers_desc: 'Головна система (Major System) є золотим стандартом.',
        numbers_content: 'Призначте приголосний звук кожній цифрі (0-9). Створюйте слова з пар або трійок чисел і розміщуйте їх у Палаці Пам\'яті.',
        cards_desc: 'Система ПД (Персона-Дія-Об\'єкт).',
        cards_content: 'Призначте конкретну Персону, Дію та Об\'єкт кожній карті в колоді. Коли ви бачите три карти, використовуйте Персону першої, Дію другої та Об\'єкт третьої, щоб створити унікальну сцену.',
        images_desc: 'Метод історій або ланцюжок.',
        images_content: 'Створіть яскраву розповідь, яка пов\'язує кожне зображення з наступним. Чим абсурдніша та емоційніша візуалізація, тим краще вона запам\'ятовується.',
        faces_desc: 'Асоціація рис.',
        faces_content: 'Виберіть характерну рису обличчя. Пов\'яжіть ім\'я з конкретним образом. Візуалізуйте цей образ, що взаємодіє з характерною рисою.',
        colors_desc: 'Асоціація об\'єктів.',
        colors_content: 'Пов\'яжіть кожен колір з фіксованим об\'єктом. Червоний = Яблуко, Синій = Океан. Пов\'язуйте ці об\'єкти за допомогою Методу історій.',
        words_desc: 'Палац пам\'яті.',
        words_content: 'Розмістіть кожне слово (перетворене на образ) вздовж знайомого маршруту. Відтворення слів - це просто "прогулянка" вашим палацом.'
    }
  }
};

// --- Utils ---

const generateDeck = (): PlayingCard[] => {
  const suits = [CardSuit.SPADES, CardSuit.HEARTS, CardSuit.CLUBS, CardSuit.DIAMONDS];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: PlayingCard[] = [];
  
  suits.forEach(suit => {
    ranks.forEach((rank, index) => {
      deck.push({
        id: `${rank}${suit}`,
        suit,
        rank,
        value: index + 1,
        color: (suit === CardSuit.HEARTS || suit === CardSuit.DIAMONDS) ? 'red' : 'black'
      });
    });
  });
  return deck;
};

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Colors Palette
const COLORS_PALETTE = [
  { id: 'red', hex: '#ef4444', name: 'Red' },
  { id: 'orange', hex: '#f97316', name: 'Orange' },
  { id: 'yellow', hex: '#eab308', name: 'Yellow' },
  { id: 'green', hex: '#22c55e', name: 'Green' },
  { id: 'cyan', hex: '#06b6d4', name: 'Cyan' },
  { id: 'blue', hex: '#3b82f6', name: 'Blue' },
  { id: 'purple', hex: '#a855f7', name: 'Purple' },
  { id: 'pink', hex: '#ec4899', name: 'Pink' },
  { id: 'grey', hex: '#64748b', name: 'Grey' },
  { id: 'black', hex: '#0f172a', name: 'Black' },
];

// --- Components ---

const TimerDisplay: React.FC<{ seconds: number, total: number, t: any }> = ({ seconds, total, t }) => {
  const percentage = (seconds / total) * 100;
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-between text-brand-100 mb-1 font-mono text-lg">
        <span className="flex items-center gap-2"><TimerIcon size={18} /> {t.timeLeft}</span>
        <span>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</span>
      </div>
      <div className="h-2 bg-brand-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand-500 transition-all duration-1000 ease-linear"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// --- History View ---
const HistoryView: React.FC<{ onBack: () => void, t: any }> = ({ onBack, t }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('mnemopro_history');
    if (saved) {
      setHistory(JSON.parse(saved).sort((a: HistoryEntry, b: HistoryEntry) => b.timestamp - a.timestamp));
    }
  }, []);

  const clearHistory = () => {
    if(confirm(t.confirmClear)) {
      localStorage.removeItem('mnemopro_history');
      setHistory([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pt-10 px-4 pb-10">
      <div className="flex items-center justify-between mb-8">
         <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white">
          <ChevronLeft size={20} /> {t.back}
        </button>
        <button onClick={clearHistory} className="text-red-500 hover:text-red-400 flex items-center gap-2 text-sm">
          <Trash2 size={16} /> {t.clearHistory}
        </button>
      </div>

      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
           <BarChart2 className="text-brand-400" size={32}/> {t.historyTitle}
        </h2>
      </div>

      {history.length === 0 ? (
        <div className="text-center text-slate-500 py-10 bg-slate-900/50 rounded-xl border border-slate-800">
          {t.noHistory}
        </div>
      ) : (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
              <tr>
                <th className="p-4">{t.date}</th>
                <th className="p-4">{t.discipline}</th>
                <th className="p-4">{t.score}</th>
                <th className="p-4">{t.accuracy}</th>
                <th className="p-4 hidden sm:table-cell">{t.time}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {history.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-slate-300">
                    {new Date(entry.timestamp).toLocaleDateString()} <span className="text-slate-500 text-xs">{new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </td>
                  <td className="p-4 font-bold text-brand-400">{entry.gameType.replace('_', ' ')}</td>
                  <td className="p-4 text-white font-mono">{entry.score}/{entry.total}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${entry.accuracy >= 90 ? 'bg-green-500/20 text-green-400' : entry.accuracy >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {entry.accuracy}%
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono hidden sm:table-cell">{entry.timeUsed}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Guide View ---
const GuideView: React.FC<{ onBack: () => void, t: any }> = ({ onBack, t }) => {
  const guides = [
    {
      id: GameType.NUMBERS,
      title: t.numbers,
      icon: <span className="font-mono font-bold">123</span>,
      desc: t.guides.numbers_desc,
      content: t.guides.numbers_content
    },
    {
      id: GameType.CARDS,
      title: t.cards,
      icon: <div className="">♠</div>,
      desc: t.guides.cards_desc,
      content: t.guides.cards_content
    },
    {
      id: GameType.IMAGES,
      title: t.images,
      icon: <ImageIcon size={18} />,
      desc: t.guides.images_desc,
      content: t.guides.images_content
    },
    {
      id: GameType.NAMES_FACES,
      title: t.faces,
      icon: <Users size={18} />,
      desc: t.guides.faces_desc,
      content: t.guides.faces_content
    },
    {
      id: GameType.COLORS,
      title: t.colors,
      icon: <Palette size={18} />,
      desc: t.guides.colors_desc,
      content: t.guides.colors_content
    },
    {
      id: GameType.WORDS,
      title: t.words,
      icon: <span className="font-serif font-bold">Aa</span>,
      desc: t.guides.words_desc,
      content: t.guides.words_content
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pt-10 px-4 pb-10">
      <button onClick={onBack} className="flex items-center text-slate-400 hover:text-white mb-8">
        <ChevronLeft size={20} /> {t.back}
      </button>
      
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
           <BookOpen className="text-brand-400" size={32}/> {t.guide}
        </h2>
        <p className="text-slate-400">{t.guideDesc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((g) => (
           <div key={g.id} className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl hover:border-brand-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-3 text-brand-400 text-xl font-bold">
                 <div className="p-2 bg-brand-900/50 rounded-lg">{g.icon}</div>
                 {g.title}
              </div>
              <p className="text-white font-medium mb-2">{g.desc}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{g.content}</p>
           </div>
        ))}
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [gameType, setGameType] = useState<GameType>(GameType.NUMBERS);
  const [settings, setSettings] = useState<GameSettings>({ timeLimit: 60, quantity: 20, grouping: 2, pace: 0 });
  const [lang, setLang] = useState<'en' | 'uk'>('en');
  
  const t = STRINGS[lang];

  // Data State
  const [numbersData, setNumbersData] = useState<string>('');
  const [binariesData, setBinariesData] = useState<string>('');
  const [cardsData, setCardsData] = useState<PlayingCard[]>([]);
  const [wordsData, setWordsData] = useState<string[]>([]);
  const [namesData, setNamesData] = useState<NameFace[]>([]);
  const [imagesData, setImagesData] = useState<string[]>([]); // URLs
  const [colorsData, setColorsData] = useState<string[]>([]); // Hex codes
  
  // Recall State
  const [recallIndex, setRecallIndex] = useState(0); // Current item being recalled
  const [memorizeIndex, setMemorizeIndex] = useState(0); // Current item being memorized (if pace > 0)
  const [numbersInput, setNumbersInput] = useState<string>('');
  const [binariesInput, setBinariesInput] = useState<string>('');
  const [cardsInput, setCardsInput] = useState<PlayingCard[]>([]);
  const [wordsInput, setWordsInput] = useState<string[]>([]);
  const [namesInput, setNamesInput] = useState<string[]>([]);
  const [imagesInput, setImagesInput] = useState<string[]>([]);
  const [colorsInput, setColorsInput] = useState<string[]>([]);
  
  // Game Session State
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [coachTip, setCoachTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<number | null>(null);
  const paceTimerRef = useRef<number | null>(null);
  const shuffledImagesRef = useRef<string[]>([]);
  const fullDeckRef = useRef<PlayingCard[]>([]);

  // --- Derived State & Handlers (Hoisted to avoid hook errors) ---

  const memorizeMaxIndex = (gameType === GameType.NUMBERS || gameType === GameType.BINARIES) 
    ? Math.ceil(settings.quantity / (settings.grouping || 2)) 
    : settings.quantity;

  const handleMemorizeNext = useCallback(() => {
    setMemorizeIndex(prev => Math.min(prev + 1, memorizeMaxIndex - 1));
  }, [memorizeMaxIndex]);

  const handleMemorizePrev = useCallback(() => {
    setMemorizeIndex(prev => Math.max(prev - 1, 0));
  }, []);

  // Keyboard support for Memorize Phase
  useEffect(() => {
    if (gameState !== GameState.MEMORIZE) return;
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') handleMemorizeNext();
        if (e.key === 'ArrowLeft') handleMemorizePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleMemorizeNext, handleMemorizePrev]);


  // --- Game Control ---

  const startGame = async () => {
    setLoading(true);
    setGameState(GameState.MEMORIZE);
    setTimeLeft(settings.timeLimit);
    setCoachTip(null);
    setRecallIndex(0);
    setMemorizeIndex(0);

    // Initialize Data
    if (gameType === GameType.NUMBERS) {
      let nums = '';
      for (let i = 0; i < settings.quantity; i++) nums += Math.floor(Math.random() * 10).toString();
      setNumbersData(nums);
      setNumbersInput('');
    } else if (gameType === GameType.BINARIES) {
      let bins = '';
      for (let i = 0; i < settings.quantity; i++) bins += Math.random() > 0.5 ? '1' : '0';
      setBinariesData(bins);
      setBinariesInput('');
    } else if (gameType === GameType.CARDS) {
        // Multi-deck support for quantity > 52
        const decksNeeded = Math.ceil(settings.quantity / 52);
        let combinedDeck: PlayingCard[] = [];
        for(let i=0; i<decksNeeded; i++) {
            const d = shuffle(generateDeck());
            // Add deck prefix to IDs to keep them unique in React keys
            const deckWithPrefix = d.map(c => ({ ...c, id: `${i}-${c.id}` }));
            combinedDeck = [...combinedDeck, ...deckWithPrefix];
        }
        setCardsData(combinedDeck.slice(0, settings.quantity));
        setCardsInput([]);
    } else if (gameType === GameType.WORDS) {
      const words = await generateWordsList(settings.quantity, lang);
      setWordsData(words);
      setWordsInput(Array(settings.quantity).fill(''));
    } else if (gameType === GameType.NAMES_FACES) {
      const names = await generateNamesList(settings.quantity, lang);
      const namesFaces: NameFace[] = names.map((name, i) => ({
        id: `nf-${i}`,
        name: name,
        avatarUrl: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
      }));
      setNamesData(namesFaces);
      setNamesInput(Array(settings.quantity).fill(''));
    } else if (gameType === GameType.IMAGES) {
      const images: string[] = [];
      for(let i=0; i<settings.quantity; i++) {
        images.push(`https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/300/300`);
      }
      setImagesData(images);
      setImagesInput([]);
      shuffledImagesRef.current = shuffle([...images]); // Prepare for recall
    } else if (gameType === GameType.COLORS) {
       const colors: string[] = [];
       for(let i=0; i<settings.quantity; i++) {
          colors.push(COLORS_PALETTE[Math.floor(Math.random() * COLORS_PALETTE.length)].hex);
       }
       setColorsData(colors);
       setColorsInput([]);
    }
    setLoading(false);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (paceTimerRef.current) {
      window.clearInterval(paceTimerRef.current);
      paceTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (gameState === GameState.MEMORIZE && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            stopTimer();
            startRecall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Pace Timer
      if (settings.pace > 0) {
        let intervalMs = (60 / settings.pace) * 1000;
        
        // Adjust for grouping (Digits/Bits per minute -> Groups per minute)
        if ((gameType === GameType.NUMBERS || gameType === GameType.BINARIES) && settings.grouping) {
            intervalMs = intervalMs * settings.grouping;
        }

        paceTimerRef.current = window.setInterval(() => {
           setMemorizeIndex(prev => {
             const maxIndex = (gameType === GameType.NUMBERS || gameType === GameType.BINARIES) 
                ? Math.ceil(settings.quantity / (settings.grouping || 2)) 
                : settings.quantity;

             if (prev < maxIndex - 1) return prev + 1;
             return prev;
           });
        }, intervalMs);
      }
    }
    return () => stopTimer();
  }, [gameState, settings.pace, settings.quantity, settings.grouping, gameType]);

  // Auto scroll to memorized item
  useEffect(() => {
     if(gameState === GameState.MEMORIZE) {
         const el = document.getElementById(`mem-item-${memorizeIndex}`);
         if (el) {
             el.scrollIntoView({ behavior: 'smooth', block: 'center' });
         }
     }
  }, [memorizeIndex, gameState]);

  const startRecall = () => {
    setGameState(GameState.RECALL);
    setRecallIndex(0);
    if (gameType === GameType.CARDS) {
        fullDeckRef.current = generateDeck(); // Fresh deck for keyboard
    }
  }

  const finishRecall = () => {
    setGameState(GameState.RESULTS);
    calculateResults();
  };

  const calculateResults = () => {
    let score = 0;
    let mistakes = 0;
    let total = 0;
    let timeUsed = settings.timeLimit - timeLeft;

    if (gameType === GameType.NUMBERS) {
      total = numbersData.length;
      for (let i = 0; i < total; i++) {
        if (numbersInput[i] === numbersData[i]) score++;
        else mistakes++;
      }
    } else if (gameType === GameType.BINARIES) {
      total = binariesData.length;
      for (let i = 0; i < total; i++) {
        if (binariesInput[i] === binariesData[i]) score++;
        else mistakes++;
      }
    } else if (gameType === GameType.CARDS) {
      total = cardsData.length;
      cardsData.forEach((card, idx) => {
        // Compare Rank and Suit
        const inputCard = cardsInput[idx];
        if (inputCard && inputCard.rank === card.rank && inputCard.suit === card.suit) score++;
        else mistakes++;
      });
    } else if (gameType === GameType.WORDS) {
      total = wordsData.length;
      wordsData.forEach((word, idx) => {
        if (wordsInput[idx]?.toLowerCase().trim() === word.toLowerCase().trim()) score++;
        else mistakes++;
      });
    } else if (gameType === GameType.NAMES_FACES) {
      total = namesData.length;
      namesData.forEach((nf, idx) => {
        const inputName = namesInput[idx]?.toLowerCase().trim() || '';
        if (inputName === nf.name.toLowerCase().trim()) score++;
        else mistakes++;
      });
    } else if (gameType === GameType.IMAGES) {
      total = imagesData.length;
      imagesData.forEach((url, idx) => {
        if (imagesInput[idx] === url) score++;
        else mistakes++;
      });
    } else if (gameType === GameType.COLORS) {
      total = colorsData.length;
      colorsData.forEach((col, idx) => {
        if (colorsInput[idx] === col) score++;
        else mistakes++;
      });
    }

    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

    const resultObj: AnalysisResult = {
      score,
      total,
      accuracy,
      mistakes,
      timeUsed
    };
    setResult(resultObj);

    // Save History
    const historyEntry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      gameType,
      score,
      total,
      accuracy,
      timeUsed
    };
    
    const existingHistory = localStorage.getItem('mnemopro_history');
    const newHistory = existingHistory ? [...JSON.parse(existingHistory), historyEntry] : [historyEntry];
    localStorage.setItem('mnemopro_history', JSON.stringify(newHistory));
  };

  const getGeminiAdvice = async () => {
    setLoading(true);
    let itemsToAnalyze: string[] = [];
    let typeLabel = gameType.toString();

    if (gameType === GameType.NUMBERS) itemsToAnalyze = [numbersData.slice(0, 10)]; 
    else if (gameType === GameType.BINARIES) itemsToAnalyze = [binariesData.slice(0, 12)];
    else if (gameType === GameType.CARDS) itemsToAnalyze = cardsData.slice(0, 5).map(c => `${c.rank}${c.suit}`);
    else if (gameType === GameType.WORDS) itemsToAnalyze = wordsData.slice(0, 5);
    else if (gameType === GameType.NAMES_FACES) itemsToAnalyze = namesData.slice(0, 3).map(n => n.name);
    else if (gameType === GameType.IMAGES) itemsToAnalyze = ["Sequence of abstract images"];
    else if (gameType === GameType.COLORS) itemsToAnalyze = ["Red", "Blue", "Green", "Yellow"];

    const tip = await getMnemonicCoachTip(itemsToAnalyze, typeLabel, lang);
    setCoachTip(tip);
    setLoading(false);
  };

  // --- Render Helpers ---

  const renderMainMenu = () => (
    <div className="max-w-6xl mx-auto pt-10 px-4 pb-10">
      
      {/* Header with Lang Toggle */}
      <div className="flex justify-between items-start mb-16">
          <div className="text-left">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400 mb-4">
              {t.title}
            </h1>
            <p className="text-slate-400 text-lg">{t.subtitle}</p>
          </div>
          <button 
             onClick={() => setLang(l => l === 'en' ? 'uk' : 'en')}
             className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-full hover:bg-slate-800 transition-colors text-slate-300"
          >
             <Globe size={18} />
             <span className="font-bold uppercase">{lang}</span>
          </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
        {[
          { id: GameType.NUMBERS, label: t.numbers, icon: <span className="text-2xl font-mono">123</span> },
          { id: GameType.BINARIES, label: t.binaries, icon: <Binary size={24} /> },
          { id: GameType.CARDS, label: t.cards, icon: <div className="text-2xl">♠</div> },
          { id: GameType.WORDS, label: t.words, icon: <span className="text-xl font-serif">Aa</span> },
          { id: GameType.NAMES_FACES, label: t.faces, icon: <Users size={24} /> },
          { id: GameType.IMAGES, label: t.images, icon: <ImageIcon size={24} /> },
          { id: GameType.COLORS, label: t.colors, icon: <Palette size={24} /> },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => { setGameType(mode.id as GameType); setGameState(GameState.SETUP); }}
            className="bg-brand-950 border border-brand-900 hover:border-brand-500 p-4 rounded-xl transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 group flex flex-col items-center gap-3 aspect-square justify-center"
          >
            <div className="w-12 h-12 bg-brand-900 rounded-full flex items-center justify-center text-brand-400 group-hover:text-white transition-colors">
              {mode.icon}
            </div>
            <h3 className="text-sm font-bold text-white">{mode.label}</h3>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
         <button 
           onClick={() => setGameState(GameState.HISTORY)}
           className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-between group"
         >
           <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-900/30 rounded-lg text-blue-400"><History size={24}/></div>
             <div className="text-left">
               <h3 className="font-bold text-white text-lg">{t.progress}</h3>
               <p className="text-slate-500 text-sm">{t.progressDesc}</p>
             </div>
           </div>
           <ChevronLeft className="rotate-180 text-slate-600 group-hover:text-white transition-colors" />
         </button>

         <button 
           onClick={() => setGameState(GameState.GUIDE)}
           className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-between group"
         >
           <div className="flex items-center gap-4">
             <div className="p-3 bg-purple-900/30 rounded-lg text-purple-400"><BookOpen size={24}/></div>
             <div className="text-left">
               <h3 className="font-bold text-white text-lg">{t.guide}</h3>
               <p className="text-slate-500 text-sm">{t.guideDesc}</p>
             </div>
           </div>
           <ChevronLeft className="rotate-180 text-slate-600 group-hover:text-white transition-colors" />
         </button>
      </div>
    </div>
  );

  const renderSetup = () => (
    <div className="max-w-md mx-auto pt-10 px-4">
      <button onClick={() => setGameState(GameState.MENU)} className="flex items-center text-slate-400 hover:text-white mb-8">
        <ChevronLeft size={20} /> {t.back}
      </button>
      
      <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 capitalize">
          <Settings className="text-brand-500" /> 
          {gameType === GameType.NUMBERS && t.numbers}
          {gameType === GameType.BINARIES && t.binaries}
          {gameType === GameType.CARDS && t.cards}
          {gameType === GameType.WORDS && t.words}
          {gameType === GameType.NAMES_FACES && t.faces}
          {gameType === GameType.IMAGES && t.images}
          {gameType === GameType.COLORS && t.colors}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">{t.quantity}</label>
            <input 
              type="range" 
              min="5" 
              max="500" 
              step="1"
              value={settings.quantity}
              onChange={(e) => setSettings({...settings, quantity: parseInt(e.target.value)})}
              className="w-full accent-brand-500"
            />
            <div className="text-right text-brand-400 font-mono mt-1">{settings.quantity} {t.items}</div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">{t.timeLimit}</label>
            <input 
              type="range" 
              min="10" 
              max="600" 
              step="10"
              value={settings.timeLimit}
              onChange={(e) => setSettings({...settings, timeLimit: parseInt(e.target.value)})}
              className="w-full accent-brand-500"
            />
            <div className="text-right text-brand-400 font-mono mt-1">{settings.timeLimit}s</div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">{t.pace}</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              step="10"
              value={settings.pace}
              onChange={(e) => setSettings({...settings, pace: parseInt(e.target.value)})}
              className="w-full accent-brand-500"
            />
            <div className="text-right text-brand-400 font-mono mt-1 flex justify-end gap-2 items-center">
                {settings.pace === 0 ? (
                    <span className="text-slate-500 text-xs">Manual Mode</span>
                ) : (
                    <span>{settings.pace} items/min</span>
                )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{t.paceDesc}</p>
          </div>

          {(gameType === GameType.NUMBERS || gameType === GameType.BINARIES) && (
              <div>
                <label className="block text-sm text-slate-400 mb-2">{t.grouping}</label>
                <div className="flex gap-2">
                    {[2, 3, 4, 6].map(g => (
                        <button 
                            key={g}
                            onClick={() => setSettings({...settings, grouping: g})}
                            className={`flex-1 py-2 rounded border ${settings.grouping === g ? 'bg-brand-600 border-brand-500 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
              </div>
          )}

          <button 
            onClick={startGame}
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t.generating : <><Play size={20} /> {t.start}</>}
          </button>
        </div>
      </div>
    </div>
  );

  const renderMemorize = () => {
    const getItemStyle = (idx: number) => {
        const isCurrent = idx === memorizeIndex;
        if (isCurrent) {
            return 'ring-4 ring-yellow-400 scale-105 z-10 shadow-[0_0_20px_rgba(250,204,21,0.5)] bg-slate-800 transition-all duration-300';
        }
        return settings.pace > 0 ? 'opacity-30 grayscale transition-all duration-300' : 'transition-all duration-300';
    };

    const getGroupStyle = (idx: number) => {
       const isCurrent = idx === memorizeIndex;
       if (isCurrent) {
           return 'bg-brand-900 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] scale-110 rounded px-1 transition-all duration-200';
       }
       return settings.pace > 0 ? 'opacity-20 transition-all duration-200' : 'opacity-80 transition-all duration-200';
    }

    return (
      <div className="h-screen flex flex-col pt-4 px-4 pb-4">
        <div className="flex justify-between items-center mb-4 max-w-6xl mx-auto w-full">
           <TimerDisplay seconds={timeLeft} total={settings.timeLimit} t={t} />
        </div>

        <div className="flex-1 overflow-auto bg-slate-900/50 rounded-2xl border border-slate-800 p-6 max-w-6xl mx-auto w-full shadow-inner custom-scrollbar relative mb-4">
          
          {settings.pace > 0 && <div className="absolute inset-0 z-0 pointer-events-none"></div>}

          {gameType === GameType.NUMBERS && (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 font-mono text-3xl sm:text-4xl tracking-widest leading-relaxed text-slate-300">
              {numbersData.match(new RegExp(`.{1,${settings.grouping}}`, 'g'))?.map((group, i) => (
                <span 
                    key={i} 
                    id={`mem-item-${i}`}
                    className={`whitespace-nowrap ${getGroupStyle(i)} cursor-pointer`}
                    onClick={() => setMemorizeIndex(i)}
                >
                    {group}
                </span>
              ))}
            </div>
          )}

          {gameType === GameType.BINARIES && (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 font-mono text-3xl sm:text-4xl tracking-widest leading-relaxed text-green-400 font-bold">
              {binariesData.match(new RegExp(`.{1,${settings.grouping}}`, 'g'))?.map((group, i) => (
                <span 
                    key={i} 
                    id={`mem-item-${i}`}
                    className={`whitespace-nowrap ${getGroupStyle(i)} cursor-pointer`}
                    onClick={() => setMemorizeIndex(i)}
                >
                    {group}
                </span>
              ))}
            </div>
          )}

          {gameType === GameType.CARDS && (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 justify-items-center">
              {cardsData.map((card, idx) => (
                <div 
                    key={card.id} 
                    id={`mem-item-${idx}`} 
                    className={`rounded-lg cursor-pointer ${getItemStyle(idx)}`}
                    onClick={() => setMemorizeIndex(idx)}
                >
                    <CardView card={card} />
                </div>
              ))}
            </div>
          )}

          {gameType === GameType.WORDS && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {wordsData.map((word, idx) => (
                <div 
                    key={idx} 
                    id={`mem-item-${idx}`}
                    className={`bg-slate-800 p-4 rounded-lg text-center text-lg font-medium text-slate-200 border border-slate-700 cursor-pointer ${getItemStyle(idx)}`}
                    onClick={() => setMemorizeIndex(idx)}
                >
                  <span className="text-xs text-slate-500 block mb-1">#{idx + 1}</span>
                  {word}
                </div>
              ))}
            </div>
          )}

          {gameType === GameType.NAMES_FACES && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {namesData.map((nf, idx) => (
                <div 
                    key={nf.id} 
                    id={`mem-item-${idx}`}
                    className={`bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center text-center cursor-pointer ${getItemStyle(idx)}`}
                    onClick={() => setMemorizeIndex(idx)}
                >
                   <div className="relative w-24 h-24 mb-3">
                      <div className="absolute top-0 left-0 bg-brand-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-800">
                        {idx + 1}
                      </div>
                      <img src={nf.avatarUrl} alt="face" className="w-full h-full rounded-full bg-slate-700" />
                   </div>
                   <div className="font-bold text-lg text-white">{nf.name}</div>
                </div>
              ))}
            </div>
          )}

          {gameType === GameType.IMAGES && (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imagesData.map((url, idx) => (
                   <div 
                        key={idx} 
                        id={`mem-item-${idx}`}
                        className={`relative aspect-square bg-slate-800 rounded-lg overflow-hidden border border-slate-700 cursor-pointer ${getItemStyle(idx)}`}
                        onClick={() => setMemorizeIndex(idx)}
                   >
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
                        #{idx + 1}
                      </div>
                      <img src={url} className="w-full h-full object-cover" loading="lazy" />
                   </div>
                ))}
             </div>
          )}

          {gameType === GameType.COLORS && (
            <div className="flex flex-wrap gap-4 justify-center content-start">
               {colorsData.map((hex, idx) => (
                 <div 
                    key={idx} 
                    id={`mem-item-${idx}`}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl shadow-lg flex items-center justify-center text-black/20 font-bold text-2xl border-2 border-white/10 cursor-pointer ${getItemStyle(idx)}`} 
                    style={{ backgroundColor: hex }}
                    onClick={() => setMemorizeIndex(idx)}
                 >
                    {idx + 1}
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
             <div className="flex items-center gap-4">
                 <button 
                     onClick={handleMemorizePrev}
                     disabled={memorizeIndex === 0}
                     className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full disabled:opacity-30 transition-colors border border-slate-700"
                 >
                     <ChevronLeft size={24} />
                 </button>
                 
                 <div className="text-slate-500 font-mono text-sm">
                    {memorizeIndex + 1} / {memorizeMaxIndex}
                 </div>

                 <button 
                     onClick={handleMemorizeNext}
                     disabled={memorizeIndex >= memorizeMaxIndex - 1}
                     className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full disabled:opacity-30 transition-colors border border-slate-700"
                 >
                     <ChevronRight size={24} />
                 </button>
             </div>

             <button 
                onClick={startRecall}
                className="ml-4 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20"
             >
                {t.finish}
             </button>
        </div>
      </div>
    );
  };

  const renderRecall = () => {
    const isDiscrete = [GameType.CARDS, GameType.WORDS, GameType.NAMES_FACES, GameType.IMAGES, GameType.COLORS].includes(gameType);

    const goToNext = () => {
        if (recallIndex < settings.quantity - 1) {
            setRecallIndex(prev => prev + 1);
        } else {
            finishRecall();
        }
    };

    const goToPrev = () => {
        if (recallIndex > 0) setRecallIndex(prev => prev - 1);
    };

    const handleDiscreteInput = (value: any) => {
        if (gameType === GameType.CARDS) {
            const newInputs = [...cardsInput];
            newInputs[recallIndex] = value;
            setCardsInput(newInputs);
        } else if (gameType === GameType.IMAGES) {
            const newInputs = [...imagesInput];
            newInputs[recallIndex] = value;
            setImagesInput(newInputs);
        } else if (gameType === GameType.COLORS) {
            const newInputs = [...colorsInput];
            newInputs[recallIndex] = value;
            setColorsInput(newInputs);
        }
        
        if (recallIndex < settings.quantity - 1) {
            setTimeout(() => setRecallIndex(prev => prev + 1), 150);
        }
    };

    const recallHeader = (
      <div className="flex justify-between items-center mb-4 max-w-4xl mx-auto w-full">
         <div className="flex items-center gap-3">
             <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                 <Brain className="text-pink-500" /> {t.recall}
             </h2>
             {isDiscrete && (
                 <div className="bg-slate-800 px-3 py-1 rounded-full text-sm font-mono text-brand-400 border border-slate-700">
                     {recallIndex + 1} / {settings.quantity}
                 </div>
             )}
         </div>
         <button 
             onClick={finishRecall}
             className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-brand-500/20 text-sm"
         >
             {t.finishAll}
         </button>
      </div>
    );

    if (!isDiscrete) {
        return (
            <div className="h-screen flex flex-col pt-4 px-4 pb-4">
                {recallHeader}
                <div className="flex-1 max-w-4xl mx-auto w-full bg-slate-900/50 rounded-2xl border border-slate-800 p-6 flex flex-col">
                    <label className="text-slate-400 mb-2 block">
                        {gameType === GameType.NUMBERS ? t.typeNum : t.typeBin}
                    </label>
                    <textarea
                        value={gameType === GameType.NUMBERS ? numbersInput : binariesInput}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (gameType === GameType.NUMBERS) setNumbersInput(val.replace(/[^0-9]/g, ''));
                            else setBinariesInput(val.replace(/[^0-1]/g, ''));
                        }}
                        className={`w-full h-full bg-slate-950 border border-slate-700 rounded-xl p-6 font-mono text-2xl tracking-widest focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none ${gameType === GameType.BINARIES ? 'text-green-400' : 'text-white'}`}
                        placeholder={t.typeHere}
                        autoFocus
                    />
                </div>
            </div>
        );
    }

    const renderContextStrip = () => {
        const start = Math.max(0, recallIndex - 4);
        const end = recallIndex;
        const visibleItems = [];

        for (let i = start; i < end; i++) {
             let content = null;
             if (gameType === GameType.CARDS && cardsInput[i]) content = <CardView card={cardsInput[i]} small />;
             else if (gameType === GameType.COLORS && colorsInput[i]) content = <div className="w-8 h-8 rounded bg-current border border-slate-600" style={{backgroundColor: colorsInput[i]}} />;
             else if (gameType === GameType.IMAGES && imagesInput[i]) content = <img src={imagesInput[i]} className="w-10 h-10 object-cover rounded" />;
             else if (gameType === GameType.WORDS && wordsInput[i]) content = <span className="text-xs truncate max-w-[60px]">{wordsInput[i]}</span>;
             else if (gameType === GameType.NAMES_FACES && namesInput[i]) content = <span className="text-xs truncate max-w-[60px]">{namesInput[i]}</span>;
             
             if(content) {
                 visibleItems.push(
                     <div key={i} className="flex flex-col items-center gap-1 opacity-50 scale-90">
                         <span className="text-[10px] text-slate-500">#{i+1}</span>
                         {content}
                     </div>
                 )
             }
        }
        
        return (
            <div className="h-16 flex items-center justify-center gap-2 mb-4 border-b border-slate-800 pb-2">
                 {visibleItems.length > 0 ? visibleItems : <span className="text-slate-600 text-xs italic">...</span>}
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col pt-4 px-4 pb-4">
            {recallHeader}
            
            <div className="flex-1 max-w-4xl mx-auto w-full bg-slate-900/50 rounded-2xl border border-slate-800 p-4 sm:p-6 flex flex-col relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                     <div className="h-full bg-brand-500 transition-all duration-300" style={{width: `${((recallIndex + 1) / settings.quantity) * 100}%`}}></div>
                 </div>

                 {renderContextStrip()}

                 <div className="flex-1 flex flex-col items-center justify-center min-h-0">
                     
                     <div className="text-center mb-6">
                        <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">{t.item} #{recallIndex + 1}</h3>
                        
                        {gameType === GameType.NAMES_FACES && (
                            <div className="mb-4 flex flex-col items-center">
                                <img src={namesData[recallIndex]?.avatarUrl} className="w-32 h-32 rounded-full bg-slate-800 mb-2 border-4 border-slate-700" />
                                <p className="text-slate-500 text-sm">{t.whoIs}</p>
                            </div>
                        )}
                     </div>

                     <div className="w-full max-w-2xl overflow-y-auto custom-scrollbar flex-1 flex flex-col items-center">
                         
                         {(gameType === GameType.WORDS || gameType === GameType.NAMES_FACES) && (
                             <div className="w-full max-w-md">
                                 <input 
                                     type="text"
                                     autoFocus
                                     value={gameType === GameType.WORDS ? (wordsInput[recallIndex] || '') : (namesInput[recallIndex] || '')}
                                     onChange={(e) => {
                                         const val = e.target.value;
                                         if(gameType === GameType.WORDS) {
                                             const newArr = [...wordsInput];
                                             newArr[recallIndex] = val;
                                             setWordsInput(newArr);
                                         } else {
                                             const newArr = [...namesInput];
                                             newArr[recallIndex] = val;
                                             setNamesInput(newArr);
                                         }
                                     }}
                                     onKeyDown={(e) => {
                                         if(e.key === 'Enter') goToNext();
                                     }}
                                     className="w-full bg-slate-950 border border-slate-600 rounded-xl p-4 text-center text-2xl text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-slate-700"
                                     placeholder={gameType === GameType.WORDS ? t.typeWord : t.typeName}
                                 />
                                 <div className="text-center mt-4 text-slate-500 text-sm">{t.pressEnter}</div>
                             </div>
                         )}

                         {gameType === GameType.CARDS && (
                             <div className="w-full">
                                 <div className="flex justify-center mb-6 min-h-[144px]">
                                     {cardsInput[recallIndex] ? (
                                         <div onClick={() => handleDiscreteInput(null)} className="cursor-pointer hover:opacity-80">
                                            <CardView card={cardsInput[recallIndex]} />
                                         </div>
                                     ) : (
                                         <div className="w-24 h-36 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-600">
                                             {t.selectCard}
                                         </div>
                                     )}
                                 </div>
                                 
                                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                     {[CardSuit.SPADES, CardSuit.HEARTS, CardSuit.CLUBS, CardSuit.DIAMONDS].map(suit => (
                                         <div key={suit} className="flex gap-1 mb-2 overflow-x-auto pb-2 justify-center">
                                             <div className="w-6 flex items-center justify-center text-xl text-slate-500">{suit}</div>
                                             {fullDeckRef.current.filter(c => c.suit === suit).map(card => (
                                                 <button 
                                                     key={card.id}
                                                     onClick={() => handleDiscreteInput(card)}
                                                     className="hover:-translate-y-1 transition-transform"
                                                 >
                                                     <CardView card={card} small />
                                                 </button>
                                             ))}
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}

                         {gameType === GameType.COLORS && (
                             <div className="grid grid-cols-5 gap-4">
                                 {COLORS_PALETTE.map(c => (
                                     <button 
                                        key={c.id} 
                                        onClick={() => handleDiscreteInput(c.hex)}
                                        className={`w-16 h-16 rounded-full border-4 shadow-lg transition-transform hover:scale-110 ${colorsInput[recallIndex] === c.hex ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'border-slate-800'}`}
                                        style={{backgroundColor: c.hex}}
                                        title={c.name}
                                     />
                                 ))}
                             </div>
                         )}

                         {gameType === GameType.IMAGES && (
                             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-2">
                                 {shuffledImagesRef.current.map((url, i) => (
                                     <button 
                                        key={i} 
                                        onClick={() => handleDiscreteInput(url)}
                                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${imagesInput[recallIndex] === url ? 'border-brand-500 ring-2 ring-brand-500' : 'border-slate-700 hover:border-slate-500'}`}
                                     >
                                         <img src={url} className="w-full h-full object-cover" />
                                         {imagesInput.includes(url) && imagesInput[recallIndex] !== url && (
                                             <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                 <CheckCircle size={16} className="text-white/50" />
                                             </div>
                                         )}
                                     </button>
                                 ))}
                             </div>
                         )}

                     </div>
                 </div>

                 <div className="mt-6 flex justify-between items-center border-t border-slate-800 pt-4">
                     <button 
                         onClick={goToPrev}
                         disabled={recallIndex === 0}
                         className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                     >
                         <ChevronLeft size={20} /> {t.prev}
                     </button>

                     <div className="text-slate-500 font-mono text-sm">
                         {gameType === GameType.CARDS && t.tapCard}
                         {gameType === GameType.COLORS && t.tapColor}
                         {gameType === GameType.IMAGES && t.tapImage}
                     </div>

                     <button 
                         onClick={goToNext}
                         className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-brand-500/10"
                     >
                         {recallIndex === settings.quantity - 1 ? t.finish : t.next} <ArrowRight size={18} />
                     </button>
                 </div>
            </div>
        </div>
    );
  };

  const renderResults = () => (
    <div className="max-w-4xl mx-auto pt-10 px-4 pb-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-900 rounded-full mb-4 text-brand-400">
           <Trophy size={40} />
        </div>
        <h2 className="text-4xl font-bold text-white mb-2">{t.analysis}</h2>
        <p className="text-slate-400">{t.perf}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t.score, value: result?.score, color: 'text-brand-400' },
          { label: t.accuracy, value: `${result?.accuracy}%`, color: result && result.accuracy > 80 ? 'text-green-400' : 'text-yellow-400' },
          { label: t.mistakes, value: result?.mistakes, color: 'text-red-400' },
          { label: t.time, value: `${result?.timeUsed}s`, color: 'text-slate-300' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-center">
            <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden mb-8">
         <div className="p-4 bg-slate-800/50 border-b border-slate-800 font-bold text-slate-300 flex justify-between">
           <span>{t.comparison}</span>
           <span className="text-xs font-normal text-slate-500 uppercase">{t.correctVsInput}</span>
         </div>
         <div className="p-6 max-h-[300px] overflow-y-auto custom-scrollbar">
            {(gameType === GameType.NUMBERS || gameType === GameType.BINARIES) && (
                <div className="font-mono text-xl tracking-widest break-all">
                  {(gameType === GameType.NUMBERS ? numbersData : binariesData).split('').map((char, i) => {
                     const inputChar = (gameType === GameType.NUMBERS ? numbersInput : binariesInput)[i];
                     let color = 'text-slate-600';
                     if (inputChar === char) color = 'text-green-500';
                     else if (inputChar) color = 'text-red-500';
                     
                     return <span key={i} className={color}>{char}</span>;
                  })}
                  <div className="mt-4 pt-4 border-t border-slate-800 text-sm text-slate-500">
                    {t.yourInput} <br/>
                    <span className="text-white">{(gameType === GameType.NUMBERS ? numbersInput : binariesInput)}</span>
                  </div>
                </div>
            )}
            
            {gameType === GameType.CARDS && (
                <div className="flex flex-wrap gap-2">
                   {cardsData.map((card, i) => {
                       const inputCard = cardsInput[i];
                       const isCorrect = inputCard && inputCard.rank === card.rank && inputCard.suit === card.suit;
                       
                       return (
                           <div key={i} className={`relative p-1 border rounded ${isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                               <div className="flex flex-col items-center gap-1">
                                   <span className="text-xs text-slate-500">#{i+1}</span>
                                   <div className="flex gap-2">
                                       <div className="opacity-50 scale-75 origin-top-left"><CardView card={card} small /></div>
                                       {inputCard ? <div className="scale-75 origin-top-left"><CardView card={inputCard} small /></div> : <div className="w-8 h-10 border border-dashed border-slate-600 rounded flex items-center justify-center text-slate-600 text-xs">?</div>}
                                   </div>
                               </div>
                           </div>
                       )
                   })}
                </div>
            )}

            {gameType === GameType.IMAGES && (
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {imagesData.map((url, i) => {
                     const inputUrl = imagesInput[i];
                     const isCorrect = inputUrl === url;
                     return (
                        <div key={i} className={`p-2 border rounded ${isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                           <div className="text-xs text-slate-500 mb-1">#{i+1}</div>
                           <div className="flex gap-1">
                              <img src={url} className="w-10 h-10 object-cover rounded opacity-50" />
                              {inputUrl ? <img src={inputUrl} className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-slate-600 text-xs">?</div>}
                           </div>
                        </div>
                     )
                  })}
               </div>
            )}

            {gameType === GameType.COLORS && (
                <div className="flex flex-wrap gap-2">
                    {colorsData.map((hex, i) => {
                        const inputHex = colorsInput[i];
                        const isCorrect = inputHex === hex;
                        return (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <div className="w-8 h-8 rounded" style={{backgroundColor: hex, opacity: 0.5}}></div>
                                <div className="w-8 h-8 rounded border border-slate-700" style={{backgroundColor: inputHex || 'transparent'}}></div>
                            </div>
                        )
                    })}
                </div>
            )}

            {(gameType === GameType.WORDS || gameType === GameType.NAMES_FACES) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: settings.quantity }).map((_, i) => {
                  let correctVal = '';
                  let inputVal = '';
                  
                  if (gameType === GameType.WORDS) {
                      correctVal = wordsData[i];
                      inputVal = wordsInput[i] || '';
                  } else {
                      correctVal = namesData[i].name;
                      inputVal = namesInput[i] || '';
                  }

                  const isCorrect = inputVal.toLowerCase().trim() === correctVal.toLowerCase().trim();
                  
                  return (
                    <div key={i} className={`flex justify-between items-center p-2 rounded ${isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      <span className="text-slate-400 w-6 text-sm">{i + 1}.</span>
                      <span className="text-slate-300 flex-1">{correctVal}</span>
                      <span className={`flex-1 text-right ${isCorrect ? 'text-green-400' : 'text-red-400 line-through decoration-red-400/50'}`}>
                        {inputVal || '(empty)'}
                      </span>
                      {isCorrect ? <CheckCircle size={16} className="text-green-500 ml-2"/> : <div className="w-4 ml-2"/>}
                    </div>
                  );
                })}
              </div>
            )}
         </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-indigo-300 mb-2 flex items-center gap-2">
           <Sparkles size={20} /> {t.aiCoach}
        </h3>
        {coachTip ? (
            <p className="text-indigo-100 leading-relaxed italic">"{coachTip}"</p>
        ) : (
            <div className="text-center">
                <button 
                    onClick={getGeminiAdvice}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all"
                >
                    {loading ? t.asking : t.askCoach}
                </button>
            </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button 
          onClick={() => setGameState(GameState.MENU)}
          className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700"
        >
          {t.mainMenu}
        </button>
        <button 
          onClick={() => { setGameState(GameState.SETUP); }}
          className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20"
        >
          {t.playAgain}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-brand-500/30">
      {gameState === GameState.MENU && renderMainMenu()}
      {gameState === GameState.SETUP && renderSetup()}
      {gameState === GameState.MEMORIZE && renderMemorize()}
      {gameState === GameState.RECALL && renderRecall()}
      {gameState === GameState.RESULTS && renderResults()}
      {gameState === GameState.HISTORY && <HistoryView onBack={() => setGameState(GameState.MENU)} t={t} />}
      {gameState === GameState.GUIDE && <GuideView onBack={() => setGameState(GameState.MENU)} t={t} />}
    </div>
  );
}