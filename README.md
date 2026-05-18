# MAX Recipe Bot

AI-powered recipe bot for MAX messenger using Google Gemini 1.5 Flash.

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd max-recipe-bot
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your keys
```

### 3. Run locally

```bash
npm run dev
```

### 4. Test health endpoint

```bash
curl http://localhost:3000/health
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (default: 3000) | Server port |
| `NODE_ENV` | No | `development` or `production` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `MAX_BOT_TOKEN` | Yes | MAX Bot API access token |
| `MAX_WEBHOOK_SECRET` | No | Webhook verification secret |

---

## Gemini API Setup

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy key to `GEMINI_API_KEY` in `.env`
4. Free tier: 15 RPM, 1 million TPM

---

## MAX Bot Setup

1. Open MAX messenger
2. Find @PrismBot (bot creation bot)
3. Send `/newbot` and follow instructions
4. Copy the access token to `MAX_BOT_TOKEN`

### Register Webhook

```bash
curl -X POST "https://botapi.max.ru/subscriptions?access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook", "version": "0.1.2"}'
```

---

## Local Testing with ngrok

1. Install ngrok: https://ngrok.com/download
2. Start tunnel:
   ```bash
   ngrok http 3000
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Register webhook with ngrok URL
5. Send message to your bot in MAX

### Example Webhook Payload (MAX sends this to your server)

```json
{
  "update_type": "message_created",
  "timestamp": 1716134400000,
  "message": {
    "sender": {
      "user_id": 12345678,
      "name": "John"
    },
    "recipient": {
      "chat_id": 87654321
    },
    "body": {
      "text": "How do I make pasta carbonara?"
    }
  }
}
```

### Example Bot Reply

```
🍝 Pasta Carbonara

⏱ Time: 20 minutes

🛒 Ingredients (2 servings):
- 200g spaghetti
- 100g guanciale or pancetta
- 2 eggs + 1 yolk
- 50g Pecorino Romano
- Black pepper, salt

📋 Steps:
1. Cook pasta in salted boiling water until al dente
2. Fry guanciale until crispy, reserve fat
3. Mix eggs, cheese, pepper in bowl
4. Drain pasta, reserve 1 cup pasta water
5. Off heat, toss pasta with guanciale and fat
6. Add egg mixture, toss with pasta water to create creamy sauce

🔄 Substitutions:
- Guanciale → pancetta or thick bacon
- Pecorino → Parmesan
- No cream needed — pasta water creates the sauce
```

---

## Koyeb Deployment

1. Push code to GitHub
2. Go to [Koyeb](https://koyeb.com) → New Service → GitHub
3. Select repo, set build: Docker
4. Set environment variables in Koyeb dashboard
5. Deploy — Koyeb assigns a `*.koyeb.app` domain
6. Register webhook with your Koyeb domain:
   ```bash
   curl -X POST "https://botapi.max.ru/subscriptions?access_token=YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-app.koyeb.app/webhook"}'
   ```

### Free Tier Limits (Koyeb)
- 2 nano instances (512MB RAM, 0.1 vCPU)
- Instance sleeps after inactivity — first request may be slow

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/webhook` | Webhook verification |
| `POST` | `/webhook` | Receive MAX events |

---

## Rate Limits

- 10 requests/minute per IP
- 3 second cooldown per user
- 500 character message limit
- Duplicate messages ignored
