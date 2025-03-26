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

    client.on('stream', (data: any) => {
      console.log(`Stream from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('stream', {
        stream: data,
        from: client.id,
      });
    });

    client.on('call-state', (data: any) => {
      console.log(`Call state from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('call-state', {
        state: data.state,
        from: client.id,
      });
    });

    client.on('mute-audio', (data: any) => {
      console.log(`Mute audio from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('mute-audio', {
        muted: data.muted,
        from: client.id,
      });
    });

    client.on('enable-video', (data: any) => {
      console.log(`Enable video from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('enable-video', {
        enabled: data.enabled,
        from: client.id,
      });
    });

    client.on('end-call', (data: any) => {
      console.log(`End call from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('end-call', {
        from: client.id,
      });
    });

    client.on('incoming-call', (data: any) => {
      console.log(`Incoming call from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('incoming-call', {
        from: client.id,
        offer: data.offer,
      });
    });

    client.on('conference-call', (data: any) => {
      console.log(`Conference call from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('conference-call', {
        participants: data.participants,
        from: client.id,
      });
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