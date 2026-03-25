import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
  namespace: "chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      console.log(`User connected: ${userId} (${client.id})`);
      // Notify all clients that a user came online
      this.server.emit("userStatusChanged", { userId, status: "online" });
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === client.id) {
        this.connectedUsers.delete(userId);
        console.log(`User disconnected: ${userId}`);
        // Notify all clients that a user went offline
        this.server.emit("userStatusChanged", { userId, status: "offline" });
        break;
      }
    }
  }

  @SubscribeMessage("sendMessage")
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { senderId: string; receiverId: string; content: string },
  ) {
    // Generate an immediate message object to bypass DB latency
    const immediateMessage = {
      ...data,
      id: `tmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRead: false,
    };

    // 1. Send to receiver immediately if online
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit("newMessage", immediateMessage);
    }

    // 2. Echo back to sender immediately for push confirmation
    client.emit("messageSent", immediateMessage);

    // 3. Persist to database in the background
    // We don't 'await' this before sending, so messages go out instantly.
    this.chatService.create(data).catch((err) => {
      console.error("Failed to save chat message to DB:", err);
      // Optional: notify sender that message might not have been saved
    });

    return immediateMessage;
  }

  @SubscribeMessage("join")
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (data.userId) {
      this.connectedUsers.set(data.userId, client.id);
      this.server.emit("userStatusChanged", {
        userId: data.userId,
        status: "online",
      });
    }
  }

  @SubscribeMessage("getOnlineUsers")
  handleGetOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }
}
