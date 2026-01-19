import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(new Reflector());
  });

  it('allows when no roles metadata present', () => {
    // when no roles metadata, guard should allow
    const ctx: any = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({}) }),
    };
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('blocks when user missing', () => {
    const reflector: any = {
      getAllAndOverride: () => ['ADMIN'],
    };
    const g = new RolesGuard(reflector as Reflector);
    const ctx: any = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({}) }),
    };
    expect(g.canActivate(ctx)).toBe(false);
  });

  it('allows when user role matches', () => {
    const reflector: any = {
      getAllAndOverride: () => ['ADMIN'],
    };
    const g = new RolesGuard(reflector as Reflector);
    const ctx: any = {
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'ADMIN' } }) }),
    };
    expect(g.canActivate(ctx)).toBe(true);
  });
});
