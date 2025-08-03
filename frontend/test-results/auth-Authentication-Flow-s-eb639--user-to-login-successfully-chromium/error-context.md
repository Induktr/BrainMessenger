# Test info

- Name: Authentication Flow >> should allow a user to login successfully
- Location: /home/induktr/Storage/Projects/BrainMessenger/frontend/e2e/auth.spec.ts:16:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

    at /home/induktr/Storage/Projects/BrainMessenger/frontend/e2e/auth.spec.ts:18:16
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Authentication Flow', () => {
   4 |
   5 |   test('should navigate to the login page', async ({ page }) => {
   6 |     // Navigate directly to the login page
   7 |     await page.goto('/login');
   8 |
   9 |     // The URL should be "/login"
   10 |     await expect(page).toHaveURL('/login');
   11 |
   12 |     // The page should contain a heading with "Login"
   13 |     await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
   14 |   });
   15 |
   16 |   test('should allow a user to login successfully', async ({ page }) => {
   17 |     // Navigate to the login page
>  18 |     await page.goto('/login');
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/login
   19 |
   20 |     // Fill in the login form (replace with actual selectors and test credentials)
   21 |     await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Use real user email
   22 |     await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Use real user password
   23 |
   24 |     // Click the login button (replace with actual button selector/text)
   25 |     await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual login button selector/text
   26 |
   27 |     // Wait for redirection to a protected page (e.g., chat page)
   28 |     // Replace '/chat' with the actual URL of a page accessible after login
   29 |     await page.waitForURL('/chat');
   30 |
   31 |     // Verify that the user is on the protected page
   32 |     await expect(page).toHaveURL('/chat');
   33 |     // Add more assertions to verify successful login, e.g., checking for elements visible only to logged-in users
   34 |     // await expect(page.getByText('Welcome, Test User')).toBeVisible(); // Example assertion
   35 |   });
   36 |
   37 |   test('should refresh access token using refresh token when access token expires', async ({ page }) => {
   38 |     // This test requires a way to simulate an expired access token but a valid refresh token.
   39 |     // A common approach in E2E is to log in, then manually clear the access token from localStorage,
   40 |     // and then perform an action that requires authentication. The application's Apollo Link
   41 |     // should then use the refresh token to get a new access token.
   42 |
   43 |     // 1. Log in to get initial tokens
   44 |     await page.goto('/login');
   45 |     await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Use real user email
   46 |     await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Use real user password
   47 |     await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual login button selector/text
   48 |     await page.waitForURL('/chat'); // Wait for successful login and redirection
   49 |
   50 |     // 2. Manually clear the access token from localStorage
   51 |     await page.evaluate(() => {
   52 |       localStorage.removeItem('access_token');
   53 |       // Keep the refresh_token in localStorage
   54 |     });
   55 |
   56 |     // 3. Perform an action that requires authentication
   57 |     // This could be navigating to a protected page again, or interacting with an element
   58 |     // that triggers an authenticated API call (e.g., sending a message in chat).
   59 |     // For this example, let's try navigating to the chat page again.
   60 |     // Replace '/chat' with the actual URL of a protected page.
   61 |     await page.goto('/chat');
   62 |
   63 |     // Wait for a GraphQL response after navigating to the protected page.
   64 |     // This response should trigger the token refresh logic if the access token is expired/missing.
   65 |     await page.waitForResponse(response => response.url().includes('/api/graphql'));
   66 |
   67 |     // 4. Verify that the page loads successfully, indicating a successful token refresh.
   68 |     // If the refresh failed, the user would likely be redirected back to the login page.
   69 |     await expect(page).toHaveURL('/chat');
   70 |     // Add more assertions to confirm the page content is loaded correctly for an authenticated user.
   71 |     // await expect(page.getByText('Chat Messages')).toBeVisible(); // Example assertion
   72 |
   73 |     // Optional: Verify that a new access token is now present in localStorage
   74 |     // Wait for the access token to appear in localStorage
   75 |     await page.waitForFunction(() => localStorage.getItem('access_token') !== null && localStorage.getItem('access_token') !== '');
   76 |     const newAccessToken = await page.evaluate(() => localStorage.getItem('access_token'));
   77 |     expect(newAccessToken).not.toBeNull();
   78 |     expect(newAccessToken).not.toBe('');
   79 |     expect(newAccessToken).not.toBe('fake_access_token'); // Assuming the initial token was 'fake_access_token' for clarity
   80 |   });
   81 |
   82 |   test('should maintain authentication state after page reload if tokens are valid', async ({ page }) => {
   83 |     // 1. Log in to get initial tokens
   84 |     await page.goto('/login');
   85 |     await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Use real user email
   86 |     await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Use real user password
   87 |     await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual login button selector/text
   88 |     await page.waitForURL('/chat'); // Wait for successful login and redirection
   89 |
   90 |     // 2. Reload the page
   91 |     await page.reload();
   92 |
   93 |     // 3. Verify that the user is still on the protected page or redirected back to it
   94 |     // This checks if the AuthContext correctly reads tokens from localStorage on load
   95 |     await expect(page).toHaveURL('/chat');
   96 |     // Add more assertions to confirm the page content is loaded correctly for an authenticated user.
   97 |     // await expect(page.getByText('Chat Messages')).toBeVisible(); // Example assertion
   98 |   });
   99 |
  100 |   test('should redirect to login page if refresh token is invalid or expired', async ({ page }) => {
  101 |     // This test simulates a scenario where both access and refresh tokens are effectively invalid.
  102 |     // In a real scenario, the refresh token might have expired on the backend,
  103 |     // or it might have been manually cleared from localStorage.
  104 |
  105 |     // 1. Log in to get initial tokens
  106 |     await page.goto('/login');
  107 |     await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Use real user email
  108 |     await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Use real user password
  109 |     await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual login button selector/text
  110 |     await page.waitForURL('/chat'); // Wait for successful login and redirection
  111 |
  112 |     // 2. Manually clear both access and refresh tokens from localStorage
  113 |     await page.evaluate(() => {
  114 |       localStorage.removeItem('access_token');
  115 |       localStorage.removeItem('refresh_token');
  116 |     });
  117 |
  118 |     // 3. Attempt to access a protected page
```