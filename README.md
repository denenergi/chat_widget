# JediDesk Widget

React-віджет чату JediDesk з покращеними анімаціями та UX.

## Локальний запуск

```bash
npm install
cp .env.example .env   # або створи .env вручну
npm start
```

Відкрий [http://localhost:3000](http://localhost:3000)

> Потрібен **Node.js 14** (див. `.nvmrc`). На Node 16+ `node-sass` може не зібратись.

## Змінні середовища

Скопіюй `.env.example` → `.env`:

| Змінна | Опис |
|--------|------|
| `REACT_APP_SOCKET_URL` | WebSocket API |
| `REACT_APP_BASE_DOMAIN_URL` | URL, звідки беруться `mysite.css` і звуки |
| `REACT_APP_JD_DOMAIN_URL` | API JediDesk |
| `REACT_APP_JD_STATUS` | `dev` або `prod` |

**Важливо для деплою:** `REACT_APP_BASE_DOMAIN_URL` має дорівнювати URL твого деплою (наприклад `https://jedidesk-widget.vercel.app`), інакше стилі підвантажаться з іншого домену.

## GitHub + Vercel (перегляд по URL)

### 1. Репозиторій на GitHub

1. [github.com/new](https://github.com/new) → створи репо (наприклад `jedidesk-widget`), **без** README
2. У папці проєкту:

```bash
git init
git add .
git commit -m "JediDesk widget: animations and UX improvements"
git branch -M main
git remote add origin https://github.com/ТВІЙ_ЛОГІН/jedidesk-widget.git
git push -u origin main
```

### 2. Деплой на Vercel (безкоштовний URL)

1. [vercel.com](https://vercel.com) → увійти через GitHub
2. **Add New Project** → імпортуй репозиторій
3. **Environment Variables** (для Production):

```
REACT_APP_SOCKET_URL=wss://app.jedidesk.com/wss
REACT_APP_JD_DOMAIN_URL=https://app.jedidesk.com/
REACT_APP_JD_STATUS=prod
REACT_APP_BASE_DOMAIN_URL=https://ТВІЙ-ПРОЕКТ.vercel.app
```

> Після першого деплою Vercel покаже URL — встав його в `REACT_APP_BASE_DOMAIN_URL` і натисни **Redeploy**.

4. **Deploy** → отримаєш URL типу `https://jedidesk-widget.vercel.app`

Віджет відкривається прямо на цій сторінці (`public/index.html` з тестовим токеном).

### Альтернатива: Netlify

1. [netlify.com](https://netlify.com) → Import from Git
2. Build command: `npm run build`
3. Publish directory: `build`
4. Node version: **14** (Site settings → Environment → `NODE_VERSION=14`)
5. Ті самі `REACT_APP_*` змінні

## Збірка

```bash
npm run build
npm install -g serve
serve -s build
```
