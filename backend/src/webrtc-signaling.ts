// backend/src/webrtc-signaling.ts

import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'webrtc' })
export class WebrtcSignalingGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    client.on('message', (data: any) => {
      console.log(`Message from ${client.id}: ${JSON.stringify(data)}`);
      this.server.emit('message', data);
    });

    client.on('disconnect', () => {
      console.log(`Client disconnected: ${client.id}`);
    });

    client.on('ice-candidate', (data: any) => {
      console.log(`ICE candidate from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('ice-candidate', {
        candidate: data.candidate,
        from: client.id,
      });
    });

    client.on('offer', (data: any) => {
      console.log(`Offer from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('offer', {
        offer: data.offer,
        from: client.id,
      });
    });

    client.on('answer', (data: any) => {
      console.log(`Answer from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('answer', {
        answer: data.answer,
        from: client.id,
      });
    });

    client.on('join', (roomId: string) => {
      console.log(`Client ${client.id} joining room ${roomId}`);
      client.join(roomId);
    });
  }

  @SubscribeMessage('qualitySettings')
  handleQualitySettings(
    client: Socket,
    data: { settings: any; roomId: string },
  ): void {
    console.log(`Quality settings from ${client.id}: ${JSON.stringify(data)}`);
    this.server.to(data.roomId).emit('qualitySettings', data);
  }
}