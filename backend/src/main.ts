import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts'; // Import middleware

    async function bootstrap() {
      const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn'], // Only log errors and warnings
      });


      // Enable CORS with the specific frontend origin
      // Get frontend URL from environment variable
      const frontendUrl = process.env.APP_URL;
      // if (!frontendUrl) {
      //   console.warn('WARN: APP_URL environment variable not set. CORS might not work correctly.'); // Removed console.warn
      // }

      const allowedOrigins = [
        'http://localhost:3000', // Allow local frontend development server
        frontendUrl, // Allow the configured APP_URL
        // Add other allowed origins as needed, e.g., preview URLs
        /https:\/\/[a-zA-Z0-9-]+\.cloudworkstations\.dev$/, // Allow preview URLs from cloud workstations
      ].filter(Boolean); // Filter out any undefined or null values

      app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Accept, Authorization, Origin, X-Requested-With, x-apollo-operation-name',
        credentials: true,
        preflightContinue: false, // Let NestJS handle OPTIONS
        optionsSuccessStatus: 204 // Standard success status for preflight
      });

      // Add graphql-upload middleware AFTER CORS setup
      app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 })); // Enable for file uploads, increased maxFiles

      const port = process.env.PORT ?? 4000;
      await app.listen(port, '0.0.0.0'); // Listen on all interfaces
      // console.log(`Nest application is listening on port ${port}`); // Removed console.log
    }
    bootstrap();
