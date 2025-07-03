// backend/src/webrtc-signaling.ts

import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common'; // Import Logger for logging

import { ConfigService } from '@nestjs/config'; // Import ConfigService

@WebSocketGateway({
  namespace: 'webrtc',
  cors: { // Add CORS configuration
    origin: (origin: string, callback: (err: Error | null, success: boolean) => void) => {
      // Get frontend URL(s) from environment variable, split by comma
      const frontendUrls = process.env.APP_URL ? process.env.APP_URL.split(',').map(url => url.trim()).filter(Boolean) : [];
      const allowedOrigins = [
        'http://localhost:3000', // Allow local frontend development server
        ...frontendUrls, // Spread the parsed frontend URLs
        // Add other allowed origins as needed, e.g., preview URLs
        /https:\/\/[a-zA-Z0-9-]+\.cloudworkstations\.dev$/, // Allow preview URLs from cloud workstations
      ].filter(Boolean); // Filter out any undefined or null values

      if (!origin || allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return origin === allowedOrigin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      })) {
        callback(null, true); // Allow the origin
      } else {
        callback(new Error('Not allowed by CORS'), false); // Reject the origin
      }
    },
    methods: ['GET', 'POST'], // Allowed methods for WebSocket
    credentials: true,
  },
})
export class WebrtcSignalingGateway {
  constructor(private configService: ConfigService) {} // Inject ConfigService

  private readonly logger = new Logger(WebrtcSignalingGateway.name); // Initialize Logger

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    client.on('message', (data: any) => {
      this.logger.log(`Message from ${client.id}: ${JSON.stringify(data)}`);
      this.server.emit('message', data);
    });

    client.on('disconnect', () => {
      this.logger.log(`Client disconnected: ${client.id}`);
    });

    client.on('ice-candidate', (data: any) => {
      this.logger.log(`ICE candidate from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('ice-candidate', {
        candidate: data.candidate,
        from: client.id,
      });
    });

    client.on('offer', (data: any) => {
      this.logger.log(`Offer from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('offer', {
        offer: data.offer,
        from: client.id,
      });
    });

    client.on('answer', (data: any) => {
      this.logger.log(`Answer from ${client.id}: ${JSON.stringify(data)}`);
      this.server.to(data.roomId).emit('answer', {
        answer: data.answer,
        from: client.id,
      });
    });

    client.on('join', (roomId: string) => {
      this.logger.log(`Client ${client.id} joining room ${roomId}`);
      client.join(roomId);
    });
  }

  @SubscribeMessage('qualitySettings')
  handleQualitySettings(
    client: Socket,
    data: { settings: any; roomId: string },
  ): void {
    this.logger.log(`Quality settings from ${client.id}: ${JSON.stringify(data)}`);
    this.server.to(data.roomId).emit('qualitySettings', data);
  }
}