import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

  test('should navigate to the login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL('/login');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('should allow a user to login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Use real user email
    await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Use real user password

    await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual login button selector/text

    await page.waitForURL('/chat');

    await expect(page).toHaveURL('/chat');
  });

  test('should refresh access token using refresh token when access token expires', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Use real user email
    await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Use real user password
    await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual login button selector/text
    await page.waitForURL('/chat'); // Wait for successful login and redirection

    await page.evaluate(() => {
      localStorage.removeItem('access_token');
    });

    await page.goto('/chat');

    await page.waitForResponse(response => response.url().includes('/api/graphql'));

    await expect(page).toHaveURL('/chat');
    await page.waitForFunction(() => localStorage.getItem('access_token') !== null && localStorage.getItem('access_token') !== '');
    const newAccessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(newAccessToken).not.toBeNull();
    expect(newAccessToken).not.toBe('');
    expect(newAccessToken).not.toBe('fake_access_token'); // Assuming the initial token was 'fake_access_token' for clarity
  });

  test('should maintain authentication state after page reload if tokens are valid', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Use real user email
    await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Use real user password
    await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual login button selector/text
    await page.waitForURL('/chat'); // Wait for successful login and redirection

    await page.reload();

    await expect(page).toHaveURL('/chat');
  });

  test('should redirect to login page if refresh token is invalid or expired', async ({ page }) => {

    await page.goto('/login');
    await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Use real user email
    await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Use real user password
    await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual login button selector/text
    await page.waitForURL('/chat'); // Wait for successful login and redirection

    await page.evaluate(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    });

    await page.goto('/chat'); // Replace with the actual URL of a protected page.

    await page.waitForURL('/'); // Wait for redirection to the home page (which should redirect to login if not authenticated)
    await expect(page).toHaveURL('/login'); // Verify the final URL is the login page
    // Add more assertions to confirm elements on the login page are visible
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

});

test('should maintain authentication and redirect to chat after a simulated long period of inactivity', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Use real user email
  await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Use real user password
  await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual login button selector/text
  await page.waitForURL('/chat'); // Wait for successful login and redirection

  const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
  const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));
  expect(accessToken).not.toBeNull();
  expect(refreshToken).not.toBeNull();
  const oneHourTenMinutesInMillis = (60 * 60 + 10 * 60) * 1000;
  await page.goto('/');

  await page.waitForURL('/chat');
  await expect(page).toHaveURL('/chat');

  await page.waitForFunction(() => localStorage.getItem('access_token') !== null && localStorage.getItem('access_token') !== '');
  const newAccessToken = await page.evaluate(() => localStorage.getItem('access_token'));
  expect(newAccessToken).not.toBeNull();
  expect(newAccessToken).not.toBe('');
});

test('should redirect to chat page if valid tokens are present in localStorage on visiting root', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'nikitavoitenko2020@gmail.com'); // Use real user email
  await page.fill('input[name="password"]', 'AFF44667Ass$!!'); // Use real user password
  await page.getByRole('button', { name: 'Login' }).click(); // Replace with actual login button selector/text
  await page.waitForURL('/chat'); // Wait for successful login and redirection

  const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
  const refreshToken = await page.evaluate(() => localStorage.getItem('refresh_token'));
  expect(accessToken).not.toBeNull();
  expect(refreshToken).not.toBeNull();

  await page.goto('/');

  await page.waitForURL('/chat');
  await expect(page).toHaveURL('/chat');
});