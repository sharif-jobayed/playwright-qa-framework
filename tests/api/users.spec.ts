import { test, expect } from '@playwright/test';
import { ApiClient } from '../../src/api/ApiClient';

test.describe('Users API', () => {
  test('lists users with the documented schema @api @smoke', async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.get('/users');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveLength(10);
    expect(body[0]).toMatchObject({
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.stringContaining('@'),
    });
  });

  test('returns a single user by id', async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.get('/users/1');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(1);
    expect(body.username).toBeTruthy();
  });

  test('unknown id returns 404', async ({ request }) => {
    const api = new ApiClient(request);
    const response = await api.get('/users/9999');

    expect(response.status()).toBe(404);
  });

  test('creating a post echoes the submitted payload', async ({ request }) => {
    const api = new ApiClient(request);
    const payload = { title: 'regression check', body: 'automation', userId: 1 };

    const response = await api.post('/posts', payload);

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject(payload);
    expect(body.id).toBeGreaterThan(0);
  });
});
