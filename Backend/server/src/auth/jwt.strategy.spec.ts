import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('returns id and role from payload', async () => {
    const s = new JwtStrategy();
    const payload = { id: 5, role: 'ADMIN' } as any;
    const validated = await s.validate(payload);
    expect(validated).toEqual({ id: 5, role: 'ADMIN' });
  });
});
