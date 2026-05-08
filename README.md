# One Horizon webhook receiver for Heroku

A small Node server for receiving One Horizon app webhooks on Heroku. It uses the One Horizon SDK types, checks the webhook key, reads the raw CloudEvents JSON body, and returns quickly.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/onehorizonai/webhook-template-heroku)

## Files to look at

- `src/server.ts`: the Node HTTP server
- `public/index.html`: the root deployment status page
- `src/webhook.ts`: key check, CloudEvents JSON parsing, SDK event typing, idempotency
- `Procfile` and `app.json`: Heroku deploy files
- `sample-payloads/`: example One Horizon events
- `src/sdk.ts`: optional `loadAttachedDocument` example using the One Horizon SDK

The server listens on `PORT` and accepts `HEAD`, `GET`, and CloudEvents JSON `POST` at `/webhook`.

## One Horizon links

- [One Horizon](https://onehorizon.ai)
- [Webhook docs](https://onehorizon.ai/docs/integrations/webhooks)
- [REST API docs](https://onehorizon.ai/docs/reference)
- [JavaScript SDK](https://www.npmjs.com/package/@onehorizon/sdk-js)

```bash
npm i @onehorizon/sdk-js@latest
```

Webhook event and payload types come from `@onehorizon/sdk-js`. Resource payloads are flat: read task events from `event.data.task`, comment events from `event.data.comment`, and bulk task IDs from `event.data.resource.taskIds`.

## Run it locally

Use Node 24. The repo includes `.nvmrc` and `.node-version`.

```bash
yarn install
cp .env.example .env
yarn dev
```

```bash
curl http://localhost:3000/webhook \
  -X POST \
  -H "content-type: application/cloudevents+json; charset=utf-8" \
  -H "x-one-webhook-key: paste-one-horizon-webhook-key-here" \
  -H "x-one-event-id: evt_task_created" \
  -H "x-one-event-type: task.created" \
  --data @sample-payloads/task-created.json
```

## Connect it to One Horizon

1. Deploy this repo to Heroku.
2. Set `ONE_WEBHOOK_KEY` in Heroku.
3. In One Horizon, open <a href="https://onehorizon.ai/app/my/settings/apps" rel="nofollow">Settings -> Apps</a>.
4. Add the deployed `/webhook` URL.
5. Pick the events you want.
6. Click **Verify**.

## Before real use

The event store is just memory. Before this does anything real, save processed event IDs in Redis, Postgres, or another durable store. Keep the handler quick; One Horizon times out after 3 seconds.

## Checks

```bash
yarn typecheck
yarn test
yarn build
```
