import * as dotenv from 'dotenv';
dotenv.config();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { graphqlUploadExpress } from 'graphql-upload-ts'; // Import middleware

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend development
  app.enableCors({
    origin: 'http://localhost:3000', // Allow requests from frontend origin
    credentials: true,
  });

  // Add graphql-upload middleware
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 })); // Example limits: 10MB, 1 file

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0'); // Listen on all interfaces
  console.log(`Nest application is listening on port ${port}`); // Add confirmation log
}
bootstrap();
