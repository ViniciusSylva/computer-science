import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../app';

describe('API Route Integration Tests (HTTP Layer & Validations)', () => {
  describe('Healthcheck & Global Middlewares', () => {
    it('GET /api/health should return 200 with service status', async () => {
      const response = await request(app).get('/api/health');

      assert.equal(response.status, 200);
      assert.equal(response.body.status, 'ok');
      assert.equal(response.body.service, 'restaurant-saas-api');
      assert.ok(response.body.timestamp);
    });

    it('GET /api/non-existent-route should return 404 with friendly message', async () => {
      const response = await request(app).get('/api/unknown-endpoint-xyz');

      assert.equal(response.status, 404);
      assert.equal(response.body.error, 'Rota não encontrada.');
    });
  });

  describe('Order Routes Input Validation', () => {
    it('POST /api/orders should reject request without items (400)', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ items: [] });

      assert.equal(response.status, 400);
      assert.equal(response.body.error, 'O pedido deve conter pelo menos um item.');
    });

    it('POST /api/orders should require tableId for DINE_IN orders (400)', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          type: 'DINE_IN',
          items: [{ menuItemId: 1, quantity: 1 }],
        });

      assert.equal(response.status, 400);
      assert.equal(response.body.error, 'Mesa é obrigatória para pedidos no salão.');
    });

    it('PATCH /api/orders/:id/status should reject invalid status string (400)', async () => {
      const response = await request(app)
        .patch('/api/orders/1/status')
        .send({ status: 'STATUS_INEXISTENTE' });

      assert.equal(response.status, 400);
      assert.equal(response.body.error, 'Status fornecido é inválido.');
    });
  });

  describe('Category Routes Input Validation', () => {
    it('POST /api/categories should reject category without name (400)', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ description: 'Apenas descricao' });

      assert.equal(response.status, 400);
      assert.equal(response.body.error, 'Nome da categoria é obrigatório.');
    });
  });

  describe('Menu Item Routes Input Validation', () => {
    it('POST /api/menu-items should reject item missing name, price, or category (400)', async () => {
      const response = await request(app)
        .post('/api/menu-items')
        .send({ name: 'Hambúrguer sem preco' });

      assert.equal(response.status, 400);
      assert.equal(response.body.error, 'Nome, preço e categoria são obrigatórios.');
    });
  });

  describe('Table Routes Input Validation', () => {
    it('POST /api/tables should reject table without number (400)', async () => {
      const response = await request(app)
        .post('/api/tables')
        .send({ capacity: 4 });

      assert.equal(response.status, 400);
      assert.equal(response.body.error, 'Número da mesa é obrigatório.');
    });

    it('PATCH /api/tables/:id/status should reject invalid table status (400)', async () => {
      const response = await request(app)
        .patch('/api/tables/1/status')
        .send({ status: 'STATUS_INVALIDO' });

      assert.equal(response.status, 400);
      assert.equal(response.body.error, 'Status inválido.');
    });
  });
});

