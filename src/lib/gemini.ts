import https from 'https';
import { SocksProxyAgent } from 'socks-proxy-agent';

function getAgent() {
  const host = process.env.PROXY_HOST;
  const port = process.env.PROXY_PORT;
  const user = process.env.PROXY_USER;
  const pass = process.env.PROXY_PASS;

  if (host && port) {
    const auth = user && pass ? `${user}:${pass}@` : '';
    return new SocksProxyAgent(`socks5://${auth}${host}:${port}`);
  }
  return undefined;
}

function httpsRequest(url: string, body: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const agent = getAgent();
    const u = new URL(url);

    const options: https.RequestOptions = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body)),
      },
    };

    if (agent) {
      options.agent = agent;
    }

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString();
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function geminiFetch(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const { status, body } = await httpsRequest(url, {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });

  if (status !== 200) {
    const msg = typeof body === 'object' ? JSON.stringify(body) : body;
    throw new Error(`Gemini API error (${status}): ${msg}`);
  }

  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  return text.trim();
}

const SYSTEM_PROMPT_WB = `Ты — эксперт по SEO-оптимизации карточек товаров для Wildberries.
Проанализируй товар по названию и категории. Верни СТРОГО только JSON без пояснений в формате:

{
  "seoTitle": "Заголовок до 60 символов, без спама и дублирования слов, строгий минимализм",
  "seoDescription": "Оптимизированное описание до 3000 символов. Вплети популярные поисковые запросы и синонимы (например: свитер, джемпер, пуловер, кофта) органично в читаемый текст. Избегай спама ключей через запятую.",
  "infographicsTriggers": ["Триггер 1 для обложки (макс 25 символов)", "Триггер 2", "Триггер 3"],
  "marketingTips": "Советы по улучшению продаж на Wildberries",
  "recommendedPrice": число (целое, без копеек, в рублях — строго в пределах указанного диапазона)
}`;

const SYSTEM_PROMPT_OZON = `Ты — эксперт по SEO-оптимизации карточек товаров для Ozon.
Проанализируй товар по названию и категории. Верни СТРОГО только JSON без пояснений в формате:

{
  "seoTitle": "Длинное богатое наименование по формуле (Тип + Бренд + Особенности) до 200 символов",
  "seoDescription": "Маркетинговое описание для покупателя до 3000 символов. Упор на выгоды, преимущества и коммерческие аргументы. Для SEO на Ozon важнее характеристики и Rich-контент, а не текст.",
  "infographicsTriggers": ["Триггер 1 для обложки (макс 25 символов)", "Триггер 2", "Триггер 3"],
  "marketingTips": "Советы по улучшению продаж на Ozon",
  "recommendedPrice": число (целое, без копеек, в рублях — строго в пределах указанного диапазона)
}`;

const PRICE_RANGES: Record<string, Record<string, { min: number; max: number }>> = {
  ozon: {
    'Электроника': { min: 500, max: 150000 },
    'Одежда и аксессуары': { min: 300, max: 30000 },
    'Товары для дома': { min: 200, max: 15000 },
    'Красота и здоровье': { min: 150, max: 10000 },
    'Спорт и фитнес': { min: 300, max: 50000 },
    'Детские товары': { min: 200, max: 20000 },
    'Автотовары': { min: 200, max: 30000 },
    'Зоотовары': { min: 150, max: 15000 },
    'Продукты питания': { min: 50, max: 5000 },
    'Канцелярия': { min: 50, max: 5000 },
  },
  wildberries: {
    'Электроника': { min: 300, max: 100000 },
    'Одежда и аксессуары': { min: 200, max: 15000 },
    'Товары для дома': { min: 150, max: 10000 },
    'Красота и здоровье': { min: 100, max: 8000 },
    'Спорт и фитнес': { min: 200, max: 30000 },
    'Детские товары': { min: 150, max: 15000 },
    'Автотовары': { min: 150, max: 20000 },
    'Зоотовары': { min: 100, max: 10000 },
    'Продукты питания': { min: 30, max: 3000 },
    'Канцелярия': { min: 30, max: 3000 },
  },
};

export async function generateCardSEO(params: {
  name: string;
  category: string;
  marketplace: string;
}): Promise<{
  seoTitle: string;
  seoDescription: string;
  infographicsTriggers: string[];
  marketingTips: string;
  recommendedPrice: number;
}> {
  const systemPrompt = params.marketplace === 'wildberries' ? SYSTEM_PROMPT_WB : SYSTEM_PROMPT_OZON;
  const range = PRICE_RANGES[params.marketplace]?.[params.category];

  const userPrompt = range
    ? `Товар: ${params.name}\nКатегория: ${params.category}\nМаркетплейс: ${params.marketplace}\n\nЦеновой диапазон для этой категории: от ${range.min} до ${range.max} ₽. Выбери конкретную цену в этом диапазоне, соответствующую товару.`
    : `Товар: ${params.name}\nКатегория: ${params.category}\nМаркетплейс: ${params.marketplace}\n\nОпредели цену самостоятельно.`;

  const raw = await geminiFetch(systemPrompt, userPrompt);
  return JSON.parse(raw);
}

export async function analyzeReview(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestedReply: string;
}> {
  const systemPrompt = 'Ты — ассистент для работы с отзывами на маркетплейсах. Анализируй тональность и предлагай ответ продавца.';

  const userPrompt = `Отзыв: "${text}"

Ответ должен быть строго в формате JSON без markdown-разметки:
{
  "sentiment": "positive" | "negative" | "neutral",
  "suggestedReply": "Текст ответа от имени продавца (вежливо, профессионально, 2-4 предложения)"
}

Верни только JSON, никакого другого текста.`;

  const raw = await geminiFetch(systemPrompt, userPrompt);
  return JSON.parse(raw);
}
