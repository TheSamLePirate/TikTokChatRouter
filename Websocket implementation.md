# WebSocket Implementation Guide for AI Agents

This document details how AI Agents can connect to the TikTok Chat Viewer's real-time WebSocket server to receive live chat events.

## 1. Overview

The application acts as a bridge between TikTok Live and external AI agents. It connects to TikTok, filters chat messages based on a configured prefix (optional), and forwards them via a generic Socket.IO server.

**Protocol**: Socket.IO v4
**Transport**: WebSocket (preferred) over HTTP

## 2. Connection Details

To connect, you need the **Server URL** and a valid **API Key**.

-   **Base URL**: `http://localhost:3000` (or your deployed server URL)
-   **Path**: Default Socket.IO path (`/socket.io/`)

### Authentication
The server requires authentication during the handshake. You must provide an `auth` object.

```javascript
const socket = io("http://localhost:3000", {
  auth: {
    apiKey: "YOUR_API_KEY",    // Required: Must match server config
    userId: "agent-unique-id"  // Required: A unique identifier for your agent
  }
});
```

## 3. Room Management

Events are scoped to **Rooms**. You must join a room to send or receive messages.

### Joining a Room
Emit the `room:join` event immediately after connecting.

-   **Event**: `room:join`
-   **Payload**: `{ "roomId": "target-room-id" }`
-   **Callback**: Returns an acknowledgment object.

```javascript
socket.on("connect", () => {
  const roomId = "my-tiktok-room";
  
  socket.emit("room:join", { roomId }, (response) => {
    if (response.error) {
      console.error("Failed to join:", response.error);
    } else {
      console.log("Successfully joined room:", roomId);
    }
  });
});
```

## 4. Message Protocol

### Receiving Messages (Forwarded from TikTok)
The application forwards filtered TikTok chat messages to the socket room. Agents should listen for the specific event name used by the forwarder.

#### Event: `tiktok-chat`
Triggered when a new valid chat message is received from TikTok.

**Payload Structure:**
```typescript
interface TikTokChatPayload {
  uniqueId: string;          // User's unique handle (e.g., "user123")
  nickname: string;          // User's display name
  comment: string;           // The message content
  timestamp: number;         // Unix timestamp of the message
  profilePictureUrl: string; // URL to user's avatar
}
```

**Example Listener:**
```javascript
socket.on("tiktok-chat", (data) => {
  console.log(`[${data.nickname}]: ${data.comment}`);
  // AI Agent logic here...
});
```

### Sending Messages
To send a message back to the room (or to other agents/clients), use the `room:emit` envelope.

-   **Event**: `room:emit`
-   **Payload**: 
    ```json
    {
      "roomId": "target-room-id",
      "event": "event-name",
      "payload": { ...any data... }
    }
    ```

## 5. Implementation Example (Node.js)

```javascript
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000";
const API_KEY = "dev-secret";
const ROOM_ID = "main-room";

const socket = io(SERVER_URL, {
  auth: { 
    apiKey: API_KEY,
    userId: `agent-${Date.now()}` 
  }
});

socket.on("connect", () => {
  console.log("Connected to server");
  
  // Join the room
  socket.emit("room:join", { roomId: ROOM_ID }, (ack) => {
    if (ack?.error) console.error("Join error:", ack.error);
    else console.log("Joined room:", ROOM_ID);
  });
});

socket.on("tiktok-chat", (msg) => {
  console.log(`Received chat from ${msg.nickname}: ${msg.comment}`);
  // Process message...
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});
```
