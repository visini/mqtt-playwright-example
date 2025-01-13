import { test, expect } from "@playwright/test";
import mqttPacket from "mqtt-packet";

const brokerUrl = "ws://localhost:8080";

test("sanity check", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveText("MQTT Message Broadcaster");
});

const mockMQTT = async (page: any) => {
  // Mock the WebSocket connection
  await page.routeWebSocket(brokerUrl, (ws) => {
    const parser = mqttPacket.parser({ protocolVersion: 5 });
    const generator = mqttPacket.generate;

    // Parse incoming MQTT packets from the vue client
    parser.on("packet", (packet: any) => {
      if (packet.cmd === "connect") {
        // Respond with CONNACK to confirm connection
        const connack = generator({
          cmd: "connack",
          returnCode: 0,
          sessionPresent: false,
        });
        ws.send(connack);
      } else if (packet.cmd === "subscribe") {
        // Respond with SUBACK to confirm subscription
        const suback = generator({
          cmd: "suback",
          messageId: packet.messageId,
          granted: [0], // QoS 0
        });
        ws.send(suback);
      } else if (packet.cmd === "publish") {
        // Echo the PUBLISH back to the client.
        // This simulates the broker sending the same message to all subscribers (including this client).
        const publishBack = generator({
          cmd: "publish",
          topic: packet.topic,
          payload: packet.payload,
          qos: 0,
          dup: false,
          retain: false,
        });
        ws.send(publishBack);
      }
    });

    // Every time the client sends a WebSocket message, parse it as MQTT
    ws.onMessage((message: any) => {
      try {
        parser.parse(message);
      } catch (error) {
        // console.error("Error parsing MQTT message:", error);
      }
    });

    ws.onClose(() => {
      // console.log("Mocked WebSocket connection closed");
    });
  });
};

test("MQTT connection", async ({ page }) => {
  await mockMQTT(page);
  await page.goto("/");

  const messageInput = page.locator('input[data-test="message-input"]');
  const sendButton = page.locator('button[data-test="send-button"]');

  // No messages yet
  await expect(page.locator("h1")).toHaveText("MQTT Message Broadcaster");
  await expect(page.locator("ul li")).toHaveCount(0);
  await expect(page.locator("p[data-test='no-messages']")).toHaveText(
    "No messages yet"
  );

  // First message
  await messageInput.fill("This is a test message");
  await sendButton.click();

  await expect(page.locator("ul li")).toHaveCount(1);
  await expect(page.locator('li[data-test="message-1"]')).toHaveText(
    "This is a test message"
  );

  // Second message
  await messageInput.fill("Another test message");
  await sendButton.click();

  await expect(page.locator("ul li")).toHaveCount(2);
  await expect(page.locator('li[data-test="message-2"]')).toHaveText(
    "Another test message"
  );
});
