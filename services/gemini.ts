import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to clean Markdown from JSON string
const cleanJson = (text: string): string => {
  if (!text) return "[]";
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const generateWordsList = async (count: number, lang: 'en' | 'uk' = 'en'): Promise<string[]> => {
  const langInstruction = lang === 'uk' ? 'in Ukrainian language (Cyrillic)' : 'in English';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of ${count} distinct, concrete, visualizeable nouns suitable for memory sports training ${langInstruction}. Return ONLY the words as a JSON array of strings. Avoid abstract concepts.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(cleanJson(text)) as string[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback list
    const fallbackEn = ["Apple", "Bicycle", "Cat", "Dog", "Elephant", "Feather", "Guitar", "House", "Ice", "Jacket", "Kite", "Lamp", "Moon", "Notebook", "Orange", "Piano", "Queen", "Robot", "Sun", "Tree"];
    const fallbackUk = ["Яблуко", "Велосипед", "Кіт", "Собака", "Слон", "Перо", "Гітара", "Будинок", "Лід", "Куртка", "Змій", "Лампа", "Місяць", "Зошит", "Апельсин", "Піаніно", "Королева", "Робот", "Сонце", "Дерево"];
    
    const fallback = lang === 'uk' ? fallbackUk : fallbackEn;
    const result = [];
    for(let i=0; i<count; i++) result.push(fallback[i % fallback.length]);
    return result;
  }
};

export const generateNamesList = async (count: number, lang: 'en' | 'uk' = 'en'): Promise<string[]> => {
  const langInstruction = lang === 'uk' ? 'using Ukrainian names (Cyrillic)' : 'from various cultures (Latin script)';
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a list of ${count} diverse, realistic full names (First Last) ${langInstruction}. Return ONLY the names as a JSON array of strings.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(cleanJson(text)) as string[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    const fallbackEn = ["John Smith", "Maria Garcia", "Wei Chen", "Ahmed Khan", "Sarah Jones", "Dmitry Ivanov", "Yuki Tanaka", "Emma Wilson", "Carlos Rodriguez", "Fatima Al-Sayed"];
    const fallbackUk = ["Іван Петренко", "Марія Коваль", "Олександр Бойко", "Тетяна Шевченко", "Андрій Мельник", "Ольга Ткаченко", "Микола Бондар", "Юлія Кравченко", "Сергій Олійник", "Наталія Лисенко"];
    
    const fallback = lang === 'uk' ? fallbackUk : fallbackEn;
    const result = [];
    for(let i=0; i<count; i++) result.push(fallback[i % fallback.length]);
    return result;
  }
};

export const getMnemonicCoachTip = async (items: string[], type: string, lang: 'en' | 'uk' = 'en'): Promise<string> => {
    try {
        const itemsStr = items.join(', ');
        const langInstruction = lang === 'uk' ? 'Respond in Ukrainian language.' : 'Respond in English.';
        
        const prompt = `
        I am training for memory sports. 
        I just tried to memorize this sequence of ${type}: [${itemsStr}].
        
        Provide a brief, creative mnemonic strategy to memorize this specific sequence using the "Memory Palace" or "Link Method" technique. 
        Keep it concise (under 100 words) and encouraging. ${langInstruction}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || (lang === 'uk' ? "Продовжуйте тренуватися! Спробуйте візуалізувати взаємодію між предметами." : "Keep practicing! Try visualizing interaction between items.");
    } catch (error) {
        console.error("Gemini Coach Error:", error);
        return lang === 'uk' ? "Візуалізація - це ключ. Спробуйте пов'язати кожен елемент з наступним за допомогою яскравої дії." : "Visualization is key. Try to link each item to the next with a vivid action.";
    }
}