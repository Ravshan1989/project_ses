import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Message } from "./entities/message.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: {
    senderId: string;
    receiverId: string;
    content: string;
  }) {
    const message = this.messageRepository.create(createMessageDto);
    return await this.messageRepository.save(message);
  }

  async findConversation(user1Id: string, user2Id: string) {
    return await this.messageRepository.find({
      where: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
      order: { createdAt: "ASC" },
      take: 50, // Last 50 messages
    });
  }

  async markAsRead(receiverId: string, senderId: string) {
    await this.messageRepository.update(
      { receiverId, senderId, isRead: false },
      { isRead: true },
    );
  }
}
