import { test, expect } from '@playwright/test';

const AUTH_URL = 'https://dummyjson.com/auth/login';

test.describe('Authentication API', () => {
  test('valid credentials return a bearer token @api', async ({ request }) => {
    const response = await request.post(AUTH_URL, {
      data: { username: 'emilys', password: 'emilyspass', expiresInMins: 30 },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(20);
    expect(body.username).toBe('emilys');
  });

  test('wrong password is rejected without a token @api', async ({ request }) => {
    const response = await request.post(AUTH_URL, {
      data: { username: 'emilys', password: 'definitely-wrong' },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    const body = await response.json();
    expect(body.accessToken).toBeUndefined();
  });
});
