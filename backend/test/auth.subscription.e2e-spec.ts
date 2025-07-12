import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createClient, Client } from 'graphql-ws';
import * as WebSocket from 'ws';

// Increase the default timeout for all tests in this file
jest.setTimeout(30000);

// A simple promise wrapper to wait for a connection event
const waitForConnection = (client: Client): Promise<void> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = client.on('connected', () => {
      unsubscribe();
      resolve();
    });
    // Add a timeout to prevent tests from hanging
    setTimeout(() => reject(new Error('Connection timeout')), 30000); // Increased timeout for stability
  });
};

describe('GraphQL Subscriptions Authentication (e2e)', () => {
  let app: INestApplication;
  let httpServer: any;
  let wsUrl: string;
  let validToken: string;
  const clients: Client[] = [];

  beforeAll(async () => {
    console.log(`[e2e test] NODE_ENV: ${process.env.NODE_ENV}`); // Add this line
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.listen(0);

    const serverAddress = app.getHttpServer().address();
    httpServer = app.getHttpServer();
    wsUrl = `ws://localhost:${serverAddress.port}/graphql`;

    const testUser = {
      email: `test.user.${Date.now()}@example.com`,
      password: 'Password123!',
      name: 'Test User',
      username: `testuser${Date.now()}`,
    };

    const registerMutation = `
      mutation Register($email: String!, $password: String!, $name: String!, $username: String!) {
        register(registerInput: { email: $email, password: $password, name: $name, username: $username }) { id }
      }`;
    await request(httpServer).post('/graphql').send({ query: registerMutation, variables: testUser });

    const loginMutation = `
      mutation Login($email: String!, $password: String!) {
        login(loginInput: { email: $email, password: $password }) { access_token }
      }`;
    const loginResponse = await request(httpServer).post('/graphql').send({ query: loginMutation, variables: { email: testUser.email, password: testUser.password } });
    validToken = loginResponse.body.data?.login?.access_token;
    if (!validToken) {
      throw new Error('Could not obtain access token for e2e tests after registration.');
    }
  });

  afterEach(async () => {
    // Dispose all clients after each test
    for (const client of clients) {
      await client.dispose();
    }
    clients.length = 0; // Clear the array
  });

  afterAll(async () => {
    await app.close();
  });

  const createTrackedClient = (connectionParams?: any): Client => {
    console.log(`[e2e test] Creating client with wsUrl: ${wsUrl} and connectionParams: ${JSON.stringify(connectionParams)}`);
    const client = createClient({ url: wsUrl, webSocketImpl: WebSocket, connectionParams });
    clients.push(client);

    client.on('error', (err: Error) => { // Explicitly type 'err' as Error
      console.error(`[e2e test] WebSocket client error: ${err.message}`);
    });
    client.on('closed', (event: { code: number; reason: string }) => { // Explicitly type 'event'
      console.log(`[e2e test] WebSocket client closed: Code=${event.code}, Reason=${event.reason}`);
    });
    client.on('connected', () => {
      console.log('[e2e test] WebSocket client connected.');
    });

    return client;
  };

  it('should REJECT subscription operation without an auth token', async () => {
    const client = createTrackedClient();
    const result: any = await new Promise((resolve) => {
      client.subscribe(
        { query: `subscription { typingStatus(chatId: "any") { isTyping } }` },
        {
          next: (data) => resolve(data),
          error: (err) => resolve(err),
          complete: () => resolve({}),
        },
      );
    });
    expect(result.errors).toBeDefined();
    expect(result.errors[0].message).toContain('Authentication failed');
  });

  it('should ACCEPT subscription connection with a valid auth token', async () => {
    const client = createTrackedClient({ Authorization: `Bearer ${validToken}` });
    await expect(waitForConnection(client)).resolves.not.toThrow();
  });

  it('should EXECUTE a subscription after authenticating', async () => {
    const client = createTrackedClient({ Authorization: `Bearer ${validToken}` });
    const result: any = await new Promise((resolve) => {
      client.subscribe(
        {
          query: `subscription OnTypingStatus($chatId: ID!) { typingStatus(chatId: $chatId) { isTyping } }`,
          variables: { chatId: 'some-chat-id' },
        },
        {
          next: (data) => resolve(data),
          error: (err) => resolve(err),
          complete: () => resolve({}),
        },
      );
      // In a real app, we'd trigger a mutation. Here, we just check for no immediate error.
      // The server sends a "next" message on successful subscription setup.
    });
    // A successful subscription will have a `data` field and no `errors` field.
    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
  });
});