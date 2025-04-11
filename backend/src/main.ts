import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts'; // Import middleware

    async function bootstrap() {
      const app = await NestFactory.create(AppModule);


      // Enable CORS with the specific frontend origin
      // Get frontend URL from environment variable
      const frontendUrl = process.env.APP_URL;
      if (!frontendUrl) {
        console.warn('WARN: APP_URL environment variable not set. CORS might not work correctly.');
      }

      app.enableCors({
        origin: frontendUrl || true, // Use env variable or allow any origin if not set (less secure, for dev only)
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, Origin, X-Requested-With',
        credentials: true,
        preflightContinue: false, // Let NestJS handle OPTIONS
        optionsSuccessStatus: 204 // Standard success status for preflight
      });

      // Add graphql-upload middleware AFTER CORS setup
      app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }));

      const port = process.env.PORT ?? 4000;
      await app.listen(port, '0.0.0.0'); // Listen on all interfaces
      console.log(`Nest application is listening on port ${port}`); // Add confirmation log
    }
    bootstrap();
