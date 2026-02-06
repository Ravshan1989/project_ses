import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { OnEvent } from "@nestjs/event-emitter";

@WebSocketGateway({
    cors: {
        origin: "*",
    },
})
export class NotificationGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    afterInit(server: Server) {
        console.log("WebSocket Gateway initialized");
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    // UZ: Yangi hisobot kelganda eventni tinglash va hammaga xabar yuborish
    @OnEvent("submission.created")
    handleSubmissionCreatedEvent(payload: any) {
        this.server.emit("notification", {
            type: "SUBMISSION_CREATED",
            message: `Yangi hisobot: ${payload.orgName}`,
            data: payload,
        });
    }

    @SubscribeMessage("ping")
    handlePing(client: Socket, data: any): string {
        return "pong";
    }
}
