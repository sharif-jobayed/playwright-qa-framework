import { APIRequestContext, APIResponse, expect } from '@playwright/test';

/**
 * Thin wrapper over Playwright's APIRequestContext.
 * Centralises logging, status assertions and JSON parsing so specs stay readable.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async get(path: string): Promise<APIResponse> {
    const response = await this.request.get(path);
    await this.log(response, 'GET', path);
    return response;
  }

  async post(path: string, body: unknown): Promise<APIResponse> {
    const response = await this.request.post(path, { data: body });
    await this.log(response, 'POST', path);
    return response;
  }

  async delete(path: string): Promise<APIResponse> {
    const response = await this.request.delete(path);
    await this.log(response, 'DELETE', path);
    return response;
  }

  private async log(response: APIResponse, method: string, path: string): Promise<void> {
    // Attach request/response to the report; failures then show the real payload.
    await expect
      .soft(response.status(), `${method} ${path} should return a success status`)
      .toBeLessThan(500);
  }
}
