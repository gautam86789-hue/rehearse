import request from 'supertest';
import app from '../src/index.js';

describe('Rehearse API Endpoints', () => {
  test('GET /api/v1/health should return healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('Rehearse API');
  });

  test('GET /api/v1/scenarios should return curated scenarios list', async () => {
    const res = await request(app).get('/api/v1/scenarios');
    expect(res.status).toBe(200);
    expect(res.body.scenarios).toBeInstanceOf(Array);
    expect(res.body.total).toBeGreaterThanOrEqual(8);
  });

  test('GET /api/v1/scenarios/archetypes should return archetype catalog', async () => {
    const res = await request(app).get('/api/v1/scenarios/archetypes');
    expect(res.status).toBe(200);
    expect(res.body.archetypes.length).toBe(7);
  });

  test('POST /api/v1/scenarios/generate should create a custom scenario', async () => {
    const res = await request(app)
      .post('/api/v1/scenarios/generate')
      .send({
        situation: 'My manager keeps overriding my technical decisions in front of the client.',
        counterpartRole: 'Engineering Manager',
        targetGoal: 'Establish alignment before client meetings'
      });

    expect(res.status).toBe(201);
    expect(res.body.scenario).toBeDefined();
    expect(res.body.scenario.brief).toBeDefined();
  }, 20000);

  test('POST /api/v1/roleplay/start, /turn, and /score flow', async () => {
    // 1. Start session
    const startRes = await request(app)
      .post('/api/v1/roleplay/start')
      .send({
        userId: 'demo-user-1',
        scenarioId: 'scenario-01-salary-raise'
      });
    // Note: this flow touches the DB layer ~8 times (start/turn/score each
    // call getUser/getSession/saveSession/etc). When SUPABASE_URL is set but
    // the schema hasn't been migrated yet, each of those calls makes a real
    // network round-trip to Supabase before falling back to the in-memory
    // store, and each step also calls the real Gemini API (falling back to
    // simulated generation on a 429/quota error) — comfortably exceeding
    // Jest's default 5s timeout, hence the generous per-test timeout below.

    expect(startRes.status).toBe(201);
    const session = startRes.body.session;
    expect(session).toBeDefined();
    const sessionId = session.id;

    // 2. Send User Turn
    const turnRes = await request(app)
      .post('/api/v1/roleplay/turn')
      .send({
        sessionId,
        userMessage: 'David, based on my 140% OKR attainment, I am proposing a base salary increase to $145k.'
      });

    expect(turnRes.status).toBe(200);
    expect(turnRes.body.userTurn).toBeDefined();
    expect(turnRes.body.counterpartTurn).toBeDefined();

    // 3. End and Score Session
    const scoreRes = await request(app)
      .post('/api/v1/roleplay/score')
      .send({ sessionId });

    expect(scoreRes.status).toBe(200);
    expect(scoreRes.body.scorecard).toBeDefined();
    expect(scoreRes.body.scorecard.overallScore).toBeGreaterThan(0);
    expect(scoreRes.body.scorecard.weakestLineRewrite).toBeDefined();
    expect(scoreRes.body.updatedUser).toBeDefined();
  }, 90000);

  test('GET /api/v1/daily/framework should return Framework of the Day', async () => {
    const res = await request(app).get('/api/v1/daily/framework');
    expect(res.status).toBe(200);
    expect(res.body.framework).toBeDefined();
    expect(res.body.framework.components).toBeInstanceOf(Array);
  });

  test('GET /api/v1/daily/puzzle & submit puzzle', async () => {
    const getRes = await request(app).get('/api/v1/daily/puzzle');
    expect(getRes.status).toBe(200);
    expect(getRes.body.puzzle).toBeDefined();
    const puzzleId = getRes.body.puzzle.id;

    const submitRes = await request(app)
      .post('/api/v1/daily/puzzle/submit')
      .send({
        userId: 'demo-user-1',
        puzzleId,
        selectedOptionId: 'opt_b'
      });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.result).toBeDefined();
    expect(submitRes.body.result.strategyLabel).toBeDefined();
  });

  test('POST /api/v1/reply-coach/generate should generate 3 strategic options', async () => {
    const res = await request(app)
      .post('/api/v1/reply-coach/generate')
      .send({
        incomingMessage: 'Can you work this weekend to finish the client slides?',
        contextOrRelationship: 'Manager',
        desiredOutcome: 'Protect weekend'
      });

    expect(res.status).toBe(201);
    expect(res.body.result.options.length).toBe(3);
    expect(res.body.result.options[0].label).toBe('The Direct Option');
    expect(res.body.result.options[1].label).toBe('The Diplomatic Option');
    expect(res.body.result.options[2].label).toBe('The Boundary-Setting Option');
  }, 20000);

  test('GET /api/v1/subscriptions/plans should return pricing tiers', async () => {
    const res = await request(app).get('/api/v1/subscriptions/plans');
    expect(res.status).toBe(200);
    expect(res.body.plans.length).toBe(2);
    expect(res.body.trialDays).toBe(5);
  });

  test('POST /api/v1/subscriptions/webhook rejects a request with the wrong Authorization secret', async () => {
    const res = await request(app)
      .post('/api/v1/subscriptions/webhook')
      .set('Authorization', 'not-the-real-secret')
      .send({ event: { type: 'INITIAL_PURCHASE', app_user_id: 'webhook-test-user', product_id: 'monthly', entitlement_ids: ['rehearse_pro'] } });

    expect(res.status).toBe(401);
  });

  test('POST /api/v1/subscriptions/webhook activates rehearse_pro on INITIAL_PURCHASE and reverts on EXPIRATION', async () => {
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
    expect(secret).toBeTruthy();

    const purchaseRes = await request(app)
      .post('/api/v1/subscriptions/webhook')
      .set('Authorization', secret as string)
      .send({
        event: {
          type: 'INITIAL_PURCHASE',
          app_user_id: 'webhook-test-user',
          product_id: 'three_month',
          entitlement_ids: ['rehearse_pro']
        }
      });
    expect(purchaseRes.status).toBe(200);

    const afterPurchase = await request(app).get('/api/v1/auth/profile?userId=webhook-test-user');
    expect(afterPurchase.body.user.subscription.status).toBe('active_three_month');
    expect(afterPurchase.body.user.subscription.planName).toBe('Three Month Pass');

    const expireRes = await request(app)
      .post('/api/v1/subscriptions/webhook')
      .set('Authorization', secret as string)
      .send({
        event: {
          type: 'EXPIRATION',
          app_user_id: 'webhook-test-user',
          product_id: 'three_month',
          entitlement_ids: ['rehearse_pro']
        }
      });
    expect(expireRes.status).toBe(200);

    const afterExpiration = await request(app).get('/api/v1/auth/profile?userId=webhook-test-user');
    expect(afterExpiration.body.user.subscription.status).toBe('expired');
  });

  describe('User Authentication & Database Tables', () => {
    const testEmail = `executive.${Date.now()}@rehearse.ai`;
    const testPassword = 'SecurePassword123!';
    let sessionToken = '';
    let createdUserId = '';

    test('POST /api/v1/auth/register should create a new user with unique ID and session token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          fullName: 'Priya Sharma',
          role: 'Engineering Director',
          experienceLevel: 'Senior',
          audience: 'new_managers'
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toMatch(/^usr_/);
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
      expect(res.body.user.fullName).toBe('Priya Sharma');
      expect(res.body.token).toMatch(/^tok_/);
      sessionToken = res.body.token;
      createdUserId = res.body.user.id;
    });

    test('POST /api/v1/auth/register should reject duplicate email with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'AnotherPassword123!'
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });

    test('POST /api/v1/auth/register should reject short password with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `short.${Date.now()}@rehearse.ai`,
          password: 'short'
        });

      expect(res.status).toBe(400);
    });

    test('POST /api/v1/auth/login should authenticate with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword
        });

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(createdUserId);
      expect(res.body.token).toBeDefined();
    });

    test('POST /api/v1/auth/login should reject incorrect password with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword999!'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password.');
    });

    test('GET /api/v1/auth/me should return authenticated user profile from Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(createdUserId);
      expect(res.body.user.email).toBe(testEmail.toLowerCase());
    });

    test('POST /api/v1/auth/logout should invalidate the session token', async () => {
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${sessionToken}`);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);
    });
  });
});

