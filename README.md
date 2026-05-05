# One Horizon webhooks on Heroku

Heroku version of the One Horizon webhook starter. Plain Node server, Heroku deploy files, no serverless adapter layer.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/onehorizonai/webhook-template-heroku)

## Files to look at

- `src/server.ts`: the Node HTTP server
- `src/webhook.ts`: key check, JSON parsing, event validation, idempotency
- `Procfile` and `app.json`: Heroku deploy files
- `sample-payloads/`: example One Horizon events
- `src/sdk.ts`: optional API calls after receiving an event

The server listens on `PORT` and accepts `HEAD`, `GET`, and JSON `POST` at `/webhook`.

## One Horizon links

- [One Horizon](https://onehorizon.ai)
- [Webhook docs](https://onehorizon.ai/docs/integrations/webhooks)
- [REST API docs](https://onehorizon.ai/docs/reference)
- [JavaScript SDK](https://www.npmjs.com/package/@onehorizon/sdk-js)

```bash
npm i @onehorizon/sdk-js
```

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

## Connect it to One Horizon

1. Deploy this repo to Heroku.
2. Set `ONE_WEBHOOK_KEY` in Heroku.
3. In One Horizon, open **Settings -> Apps**.
4. Add the deployed `/webhook` URL.
5. Pick the events you want.
6. Click **Verify**.

## Replace before real use

The event store is just memory. Before this does anything real, save processed event IDs in Redis, Postgres, or another durable store. Keep the handler quick; One Horizon times out after 3 seconds.

## Checks

```bash
yarn typecheck
yarn test
yarn build
```
