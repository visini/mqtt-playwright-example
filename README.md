# Mocking MQTT with Playwright

This is a simple example of how to mock MQTT messages using Playwright.

## How to run

Install dependencies:

```bash
npm install
```

Run Mosquitto MQTT broker:

```bash
docker compose up
```

Run the demo page:

```bash
npm run dev
```

Run the tests (MQTT is mocked, so no need to run the broker):

```bash
npm test
```
