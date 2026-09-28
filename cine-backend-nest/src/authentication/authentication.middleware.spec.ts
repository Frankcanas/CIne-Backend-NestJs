import { AuthenticationMiddleware } from './authentication.middleware.js';

describe('AuthenticationMiddleware', () => {
  it('should be defined', () => {
    expect(new AuthenticationMiddleware()).toBeDefined();
  });
});
