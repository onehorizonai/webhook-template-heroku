# One Horizon webhook template for Heroku

Use this repo if you want a One Horizon webhook receiver on Heroku. No Vercel, Netlify, or Cloudflare files.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/onehorizonai/webhook-template-heroku)

## Included

- Node server at `src/server.ts`
- `/webhook` endpoint
- webhook key checks
- JSON validation with a 256 KB limit
- retry-safe event ID handling
- Sample payloads
- optional SDK helper in `src/sdk.ts`
- `Procfile` and `app.json`

## Run locally

```bash
yarn install
cp .env.example .env
yarn dev
```

```bash
curl http://localhost:3000/webhook \
  -X POST \
  -H "content-type: application/json" \
  -H "x-one-webhook-key: paste-one-horizon-webhook-key-here" \
  -H "x-one-event-id: evt_task_created" \
  -H "x-one-event-type: task.created" \
  --data @sample-payloads/task-created.json
```

## Configure One Horizon

1. Add your deployed `/webhook` URL in **Settings -> Apps**.
2. Set `ONE_WEBHOOK_KEY` in Heroku.
3. Choose events.
4. Click **Verify**.

## Before production

- Keep `ONE_WEBHOOK_KEY` secret.
- Return `2xx` quickly.
- Store event IDs in Redis, Postgres, or another durable store before doing side effects.
- Queue slow work. One Horizon delivery requests time out after 3 seconds.

## Checks

```bash
yarn typecheck
yarn test
yarn build
```
