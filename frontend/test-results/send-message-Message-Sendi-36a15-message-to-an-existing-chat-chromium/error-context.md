# Test info

- Name: Message Sending Flow >> should allow a user to send a message to an existing chat
- Location: /home/induktr/Storage/Projects/BrainMessenger/frontend/e2e/send-message.spec.ts:18:7

# Error details

```
Error: page.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('text=Nikits')

    at /home/induktr/Storage/Projects/BrainMessenger/frontend/e2e/send-message.spec.ts:22:16
```

# Page snapshot

```yaml
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 2 Issue
- button "Collapse issues badge":
  - img
- textbox "Search"
- button "Burger Menu":
  - img "Burger Menu"
- paragraph: "Error loading chats: Cannot read properties of undefined (reading 'id')"
- text: Communication starts here, start with us!
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Message Sending Flow', () => {
   4 |   // Use a beforeEach hook to log in before each test
   5 |   test.beforeEach(async ({ page }) => {
   6 |     await page.goto('http://localhost:3000/login');
   7 |
   8 |     // Replace with your actual login credentials
   9 |     await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Replace with your email
  10 |     await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Replace with your password
  11 |     await page.click('button:has-text("Login")');
  12 |
  13 |     // Wait for successful login and redirection to chat page
  14 |     await page.waitForURL('http://localhost:3000/chat');
  15 |     await expect(page).toHaveURL('http://localhost:3000/chat');
  16 |   });
  17 |
  18 |   test('should allow a user to send a message to an existing chat', async ({ page }) => {
  19 |     // Assuming there's a chat list item for a user you've already chatted with
  20 |     // You might need to adjust the selector based on your actual chat list structure
  21 |     // For example, click on a chat item that contains the name "Nikits"
> 22 |     await page.click('text=Nikits'); // Replace "Nikits" with the name of an existing chat/user
     |                ^ Error: page.click: Test timeout of 60000ms exceeded.
  23 |
  24 |     // Wait for the chat messages to load (you might need a more specific selector)
  25 |     await page.waitForSelector('.chat-messages-container'); // Adjust this selector
  26 |
  27 |     const messageContent = `Hello from Playwright! ${Date.now()}`;
  28 |
  29 |     // Type the message
  30 |     await page.fill('textarea[placeholder="Type your message..."]', messageContent); // Adjust selector if needed
  31 |
  32 |     // Click the send button
  33 |     await page.click('button:has-text("Send")'); // Adjust selector if needed
  34 |
  35 |     // Wait for the message to appear in the chat (you might need a more specific selector)
  36 |     await page.waitForSelector(`.chat-message:has-text("${messageContent}")`); // Adjust this selector
  37 |
  38 |     // Assert that the message is visible
  39 |     const sentMessage = page.locator(`.chat-message:has-text("${messageContent}")`);
  40 |     await expect(sentMessage).toBeVisible();
  41 |
  42 |     console.log(`Successfully sent message: "${messageContent}"`);
  43 |   });
  44 |
  45 |   // You can add more tests here, e.g.,
  46 |   // - sending multiple messages
  47 |   // - sending messages to a new chat
  48 |   // - checking message timestamps
  49 | });
```