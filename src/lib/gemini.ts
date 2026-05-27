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

async function geminiFetch(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const { status, body } = await httpsRequest(url, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
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

export async function generateCardSEO(params: {
  name: string;
  category: string;
  marketplace: string;
}): Promise<{ description: string; tags: string[] }> {
  const prompt = `Ты — AI-копирайтер для маркетплейсов. Сгенерируй SEO-контент для карточки товара.

Товар: ${params.name}
Категория: ${params.category}
Маркетплейс: ${params.marketplace}

Ответ должен быть строго в формате JSON без markdown-разметки:
{
  "description": "SEO-описание (3-5 предложений, без эмодзи, для маркетплейса ${params.marketplace})",
  "tags": ["тег1", "тег2", "тег3", "тег4", "тег5"]
}

Верни только JSON, никакого другого текста.`;

  const raw = await geminiFetch(prompt);
  return JSON.parse(raw);
}

export async function analyzeReview(text: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  suggestedReply: string;
}> {
  const prompt = `Ты — AI-ассистент для работы с отзывами на маркетплейсах. Проанализируй отзыв покупателя и предложи ответ продавца.

Отзыв: "${text}"

Ответ должен быть строго в формате JSON без markdown-разметки:
{
  "sentiment": "positive" | "negative" | "neutral",
  "suggestedReply": "Текст ответа от имени продавца (вежливо, профессионально, 2-4 предложения)"
}

Верни только JSON, никакого другого текста.`;

  const raw = await geminiFetch(prompt);
  return JSON.parse(raw);
}

export async function getRecommendedPrice(productName: string, category: string, marketplace: string): Promise<number> {
  const prompt = `Ты — аналитик цен на маркетплейсах. На основе названия товара, категории и маркетплейса определи рекомендуемую цену в рублях.

Товар: ${productName}
Категория: ${category}
Маркетплейс: ${marketplace}

Ответ должен быть строго в формате JSON без markdown-разметки:
{
  "price": число (только цифры, без форматирования)
}

Верни только JSON, никакого другого текста.`;

  const raw = await geminiFetch(prompt);
  const data = JSON.parse(raw);
  return data.price;
}
