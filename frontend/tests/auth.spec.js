import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:8080/api/auth';

test.describe('Authentication - Register', () => {

  test('TC_REG_01: Should register successfully', async ({ page }) => {
    console.log('Starting TC_REG_01');
    const email = `test.user.${Date.now()}@example.com`;
    // Password must be > 6 chars. 
    const password = 'Password@123';
    const displayName = 'Test User';

    await page.goto(`${BASE_URL}/register`);
    console.log('Navigated to /register');

    // Use placeholder locators which are unique and verified
    await page.getByPlaceholder('email@example.com').fill(email);
    await page.getByPlaceholder('Tối thiểu 6 ký tự').fill(password);
    await page.getByPlaceholder('Nhập tên của bạn').fill(displayName);
    await page.getByPlaceholder('Nhập lại mật khẩu').fill(password);

    console.log('Filled form');

    // Setup listener
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/register') && response.status() === 200
    );

    // Click submit
    await page.getByRole('button', { name: 'Đăng ký' }).click();
    console.log('Clicked Register');

    // Wait for response
    const response = await responsePromise;
    console.log('Received API Response');
    
    expect(response.status()).toBe(200);
  });

});
