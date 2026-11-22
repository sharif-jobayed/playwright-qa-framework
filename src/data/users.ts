export interface TestUser {
  username: string;
  password: string;
}

/**
 * Demo accounts published by saucedemo.com.
 * Kept in one module so credentials are never scattered through specs.
 */
export const users = {
  standard: { username: 'standard_user', password: 'secret_sauce' } satisfies TestUser,
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' } satisfies TestUser,
} as const;

export const invalidCredentials = {
  username: 'standard_user',
  password: 'wrong_password',
} satisfies TestUser;
