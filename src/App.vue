<script setup lang="ts">
import { ref } from "vue";
import mqtt from "mqtt";

const brokerUrl = "ws://localhost:8080";
const topic = "demo-broadcaster/messages";
const messages = ref<string[]>([]);
const inputMessage = ref<string>("");

const client = mqtt.connect(brokerUrl);

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe(topic, (err) => {
    if (err) {
      console.error("Failed to subscribe to topic:", err);
    }
  });
});

client.on("message", (_topic, message) => {
  messages.value.push(message.toString());
});

const sendMessage = () => {
  if (inputMessage.value.trim() !== "") {
    client.publish(topic, inputMessage.value);
    inputMessage.value = ""; // Clear the input
  }
};
</script>

<template>
  <div>
    <h1>MQTT Message Broadcaster</h1>
    <p style="max-width: 450px">
      Enter a message in the input field below to broadcast it to all
      subscribers. The messages will be displayed below, since this client is
      also subscribed to the same topic.
    </p>
    <div>
      <input
        v-model="inputMessage"
        type="text"
        placeholder="Type your message"
        data-test="message-input"
      />
      <button @click="sendMessage" data-test="send-button">Send</button>
    </div>
    <div>
      <h2>Received Messages:</h2>
      <ul v-if="messages.length">
        <li
          v-for="(message, index) in messages"
          :key="index"
          :data-test="`message-${index + 1}`"
        >
          {{ message }}
        </li>
      </ul>
      <div v-else>
        <p data-test="no-messages">No messages yet</p>
      </div>
    </div>
  </div>
</template>
