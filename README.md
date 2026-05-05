# One Horizon webhooks on Heroku

Clone this when your One Horizon app needs a webhook endpoint on Heroku. It is only the Heroku version: one Node server, one shared handler, no serverless provider config.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/onehorizonai/webhook-template-heroku)

## What is inside

- `src/server.ts`: the Node HTTP server
- `src/webhook.ts`: key check, JSON parsing, event validation, idempotency hook
- `Procfile` and `app.json`: Heroku deploy files
- `sample-payloads/`: example One Horizon events
- `src/sdk.ts`: optional follow-up API calls

The endpoint accepts `HEAD`, `GET`, and JSON `POST` requests at `/webhook`.

## Run it locally

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

## Connect One Horizon

1. Deploy this repo to Heroku.
2. Add `ONE_WEBHOOK_KEY` in Heroku.
3. In One Horizon, open **Settings -> Apps**.
4. Add the deployed `/webhook` URL.
5. Pick events and click **Verify**.

## Before you ship

The in-memory event store is for the template. Replace it with Redis, Postgres, or another durable store before doing side effects. Keep the response fast; One Horizon waits 3 seconds before timing out.

## Checks

```bash
yarn typecheck
yarn test
yarn build
```
