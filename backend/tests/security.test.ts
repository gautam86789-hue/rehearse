import request from 'supertest';
import app from '../src/index.js';

// A registered account's private data must need that account's own token,
// while guests (no email) keep working by id alone.
describe('Account data access rules', () => {
  const emailA = `sec.a.${Date.now()}@example.com`;
  const emailB = `sec.b.${Date.now()}@example.com`;
  let a: { id: string; token: string };
  let b: { id: string; token: string };

  beforeAll(async () => {
    const ra = await request(app).post('/api/v1/auth/register').send({ email: emailA, password: 'Passw0rd!x', fullName: 'A' });
    const rb = await request(app).post('/api/v1/auth/register').send({ email: emailB, password: 'Passw0rd!x', fullName: 'B' });
    a = { id: ra.body.user.id, token: ra.body.token };
    b = { id: rb.body.user.id, token: rb.body.token };
  });

  test('notifications of a registered account need its token', async () => {
    const res = await request(app).get(`/api/v1/notifications?userId=${a.id}`);
    expect(res.status).toBe(401);
  });

  test('another signed-in user cannot read them (403)', async () => {
    const res = await request(app).get(`/api/v1/notifications?userId=${a.id}`).set('Authorization', `Bearer ${b.token}`);
    expect(res.status).toBe(403);
  });

  test('the owner can save and read their notifications', async () => {
    const put = await request(app)
      .put('/api/v1/notifications')
      .set('Authorization', `Bearer ${a.token}`)
      .send({
        userId: a.id,
        notifications: [{ id: 'n1', title: 'Hi', body: 'x', createdAt: new Date().toISOString(), read: false }],
        dismissedIds: []
      });
    expect(put.status).toBe(200);
    const get = await request(app).get(`/api/v1/notifications?userId=${a.id}`).set('Authorization', `Bearer ${a.token}`);
    expect(get.status).toBe(200);
    expect(get.body.notifications).toHaveLength(1);
  });

  test('renaming a registered account without its token is refused', async () => {
    const res = await request(app).put('/api/v1/auth/profile').send({ userId: a.id, name: 'Hacker' });
    expect(res.status).toBe(401);
  });

  test('the owner can rename themselves', async () => {
    const res = await request(app).put('/api/v1/auth/profile').set('Authorization', `Bearer ${a.token}`).send({ userId: a.id, name: 'Alex' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Alex');
  });

  test('guest ids (no email) still work without a token', async () => {
    const res = await request(app).get('/api/v1/notifications?userId=guest-test-123');
    expect(res.status).toBe(200);
  });
});
