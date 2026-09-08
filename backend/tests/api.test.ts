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
    expect(res.body.archetypes.length).toBe(5);
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
  });

  test('POST /api/v1/roleplay/start, /turn, and /score flow', async () => {
    // 1. Start session
    const startRes = await request(app)
      .post('/api/v1/roleplay/start')
      .send({
        userId: 'demo-user-1',
        scenarioId: 'scenario-01-salary-raise'
      });

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
  });

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
  });

  test('GET /api/v1/subscriptions/plans should return pricing tiers', async () => {
    const res = await request(app).get('/api/v1/subscriptions/plans');
    expect(res.status).toBe(200);
    expect(res.body.plans.length).toBe(2);
    expect(res.body.trialDays).toBe(5);
  });
});
