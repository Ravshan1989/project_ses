import { Controller, Get, Query, Param, Patch, UseGuards } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get("history")
  async getHistory(
    @Query("user1Id") user1Id: string,
    @Query("user2Id") user2Id: string,
  ) {
    return await this.chatService.findConversation(user1Id, user2Id);
  }

  @Patch("read/:senderId")
  async markAsRead(@Param("senderId") senderId: string, @Query("receiverId") receiverId: string) {
    return await this.chatService.markAsRead(receiverId, senderId);
  }
}
