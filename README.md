# AI Hub Sellers

**Multimodal AI Telegram Mini App for E-commerce Sellers.**
SEO-генерация карточек товаров, анализ отзывов и интеграция с маркетплейсами (Ozon / Wildberries).

![AI Hub Sellers Screenshot](ai_hub_screen.png)

---

## О проекте

AI Hub Sellers — профессиональный инструмент для продавцов маркетплейсов. В отличие от обычных чат-ботов, это полноценное **Telegram Mini App (TMA)**, которое работает как самостоятельное SaaS-решение, интегрируясь с реальными API площадок.

### Бизнес-ценность

- **SEO-оптимизация**: Сокращение времени на написание карточек в 10 раз.
- **Аналитика**: Мгновенный Sentiment Analysis отзывов для работы с рейтингом.
- **Масштабируемость**: Поддержка интеграции с реальными кабинетами (Ozon/WB) через API.

### Ключевые возможности

- **Мультимодальный ИИ**: Генерация контента на основе анализа текста и изображений товара.
- **Zero-Knowledge API**: Поддержка демо-режима для оценки продукта без необходимости ввода ключей.
- **Marketplace-Ready**: Готовые схемы данных под требования WB и Ozon.

---

## Технологический стек

| Категория      | Технологии                                          |
|----------------|-----------------------------------------------------|
| Frontend       | Next.js 16 (App Router), Tailwind CSS v4, Framer Motion |
| Backend        | API Routes (Next.js), Pydantic (валидация данных)     |
| AI             | Google Gemini 3.1 Flash Lite (настройка через системные промпты) |
| Infrastructure | Turbopack, Docker (готовый конфиг)                   |

## Быстрый запуск

```bash
# Клонирование
git clone https://github.com/lazmaksim2019-ops/ai-hub-sellers.git
cd ai-hub-sellers

# Установка
npm install

# Запуск
npm run dev
```

**Важно**: Для полноценной работы скопируйте `.env.example` в `.env.local` и укажите ключи доступа. Без них приложение работает в безопасном демонстрационном режиме.

## Архитектура проекта

```
src/
├── app/
│   ├── layout.tsx              # Глобальная разметка, шрифты
│   ├── page.tsx                # Главный экран (композиция модулей)
│   └── api/
│       ├── generate-card/      # Генерация SEO-карточки через Gemini
│       ├── analyze-review/     # Анализ отзыва через Gemini
│       └── sync/               # Синхронизация с маркетплейсами
├── components/
│   ├── CardGenerator.tsx       # Модуль SEO-генерации
│   ├── SmartResponder.tsx      # Анализатор отзывов
│   ├── IntegrationTerminal.tsx # Терминал синхронизации
│   ├── Header.tsx              # Шапка с выбором маркетплейса
│   └── ImageUploader.tsx       # Загрузчик изображений
├── lib/
│   ├── gemini.ts               # Клиент Gemini API (с прокси)
│   └── marketplace.ts          # Интеграция с Ozon/WB API
├── types/
│   └── index.ts                # Типы и интерфейсы
└── data/
    └── mock.ts                 # Мок-данные (демо-режим)
```

## Переменные окружения

Создайте `.env.local` в корне проекта, скопировав из `.env.example`:

```env
# Gemini AI (обязательно для реального режима)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite

# SOCKS5 прокси (опционально)
PROXY_HOST=your_proxy_host
PROXY_PORT=your_proxy_port
PROXY_USER=your_proxy_user
PROXY_PASS=your_proxy_pass

# API маркетплейсов (опционально — для реальной интеграции)
OZON_CLIENT_ID=ozon_client_id
OZON_API_KEY=ozon_api_key
WB_API_KEY=wb_api_key
```

## Лицензия

Proprietary / Closed Source.
