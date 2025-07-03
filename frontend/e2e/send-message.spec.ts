import { test, expect } from '@playwright/test';

test.describe('Message Sending Flow', () => {
  // Use a beforeEach hook to log in before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Replace with your actual login credentials
    await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Replace with your email
    await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Replace with your password
    await page.click('button:has-text("Login")');

    // Wait for successful login and redirection to chat page
    await page.waitForURL('http://localhost:3000/chat');
    await expect(page).toHaveURL('http://localhost:3000/chat');
  });

  test('should allow a user to send a message to an existing chat', async ({ page }) => {
    // Assuming there's a chat list item for a user you've already chatted with
    // You might need to adjust the selector based on your actual chat list structure
    // For example, click on a chat item that contains the name "Nikits"
    await page.click('text=Nikits'); // Replace "Nikits" with the name of an existing chat/user

    // Wait for the chat messages to load (you might need a more specific selector)
    await page.waitForSelector('.chat-messages-container'); // Adjust this selector

    const messageContent = `Hello from Playwright! ${Date.now()}`;

    // Type the message
    await page.fill('textarea[placeholder="Type your message..."]', messageContent); // Adjust selector if needed

    // Click the send button
    await page.click('button:has-text("Send")'); // Adjust selector if needed

    // Wait for the message to appear in the chat (you might need a more specific selector)
    await page.waitForSelector(`.chat-message:has-text("${messageContent}")`); // Adjust this selector

    // Assert that the message is visible
    const sentMessage = page.locator(`.chat-message:has-text("${messageContent}")`);
    await expect(sentMessage).toBeVisible();

    console.log(`Successfully sent message: "${messageContent}"`);
  });

  // You can add more tests here, e.g.,
  // - sending multiple messages
  // - sending messages to a new chat
  // - checking message timestamps
});