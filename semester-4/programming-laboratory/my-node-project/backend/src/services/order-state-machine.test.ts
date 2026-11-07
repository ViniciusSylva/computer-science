import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { OrderStatus } from '@prisma/client';
import { OrderStateMachine } from './order-state-machine';

describe('OrderStateMachine - State Flow & Transitions', () => {
  describe('canTransition', () => {
    it('should allow valid sequential progression: RECEIVED -> PREPARING -> READY -> DELIVERED', () => {
      assert.equal(OrderStateMachine.canTransition(OrderStatus.RECEIVED, OrderStatus.PREPARING), true);
      assert.equal(OrderStateMachine.canTransition(OrderStatus.PREPARING, OrderStatus.READY), true);
      assert.equal(OrderStateMachine.canTransition(OrderStatus.READY, OrderStatus.DELIVERED), true);
    });

    it('should allow cancellation before order is delivered', () => {
      assert.equal(OrderStateMachine.canTransition(OrderStatus.RECEIVED, OrderStatus.CANCELED), true);
      assert.equal(OrderStateMachine.canTransition(OrderStatus.PREPARING, OrderStatus.CANCELED), true);
      assert.equal(OrderStateMachine.canTransition(OrderStatus.READY, OrderStatus.CANCELED), true);
    });

    it('should disallow invalid forward leaps', () => {
      // Skipping preparation
      assert.equal(OrderStateMachine.canTransition(OrderStatus.RECEIVED, OrderStatus.READY), false);
      // Skipping preparation and ready directly to delivered
      assert.equal(OrderStateMachine.canTransition(OrderStatus.RECEIVED, OrderStatus.DELIVERED), false);
      // Skipping ready from preparing to delivered
      assert.equal(OrderStateMachine.canTransition(OrderStatus.PREPARING, OrderStatus.DELIVERED), false);
    });

    it('should disallow backward transitions', () => {
      assert.equal(OrderStateMachine.canTransition(OrderStatus.PREPARING, OrderStatus.RECEIVED), false);
      assert.equal(OrderStateMachine.canTransition(OrderStatus.READY, OrderStatus.PREPARING), false);
      assert.equal(OrderStateMachine.canTransition(OrderStatus.READY, OrderStatus.RECEIVED), false);
      assert.equal(OrderStateMachine.canTransition(OrderStatus.DELIVERED, OrderStatus.READY), false);
      assert.equal(OrderStateMachine.canTransition(OrderStatus.DELIVERED, OrderStatus.RECEIVED), false);
    });

    it('should disallow any transition once order is in terminal states (DELIVERED or CANCELED)', () => {
      const allStatuses = Object.values(OrderStatus);
      for (const next of allStatuses) {
        assert.equal(OrderStateMachine.canTransition(OrderStatus.DELIVERED, next), false);
        assert.equal(OrderStateMachine.canTransition(OrderStatus.CANCELED, next), false);
      }
    });

    it('should disallow transition to the exact same status', () => {
      assert.equal(OrderStateMachine.canTransition(OrderStatus.RECEIVED, OrderStatus.RECEIVED), false);
      assert.equal(OrderStateMachine.canTransition(OrderStatus.PREPARING, OrderStatus.PREPARING), false);
    });
  });

  describe('validateTransition', () => {
    it('should throw an error when transitioning to the current status', () => {
      assert.throws(
        () => OrderStateMachine.validateTransition(OrderStatus.RECEIVED, OrderStatus.RECEIVED),
        /O pedido já está no status "RECEIVED"/
      );
    });

    it('should throw an error with allowed transitions on invalid jump', () => {
      assert.throws(
        () => OrderStateMachine.validateTransition(OrderStatus.RECEIVED, OrderStatus.DELIVERED),
        /Transição inválida de "RECEIVED" para "DELIVERED"/
      );
    });

    it('should throw when attempting to transition out of terminal status DELIVERED', () => {
      assert.throws(
        () => OrderStateMachine.validateTransition(OrderStatus.DELIVERED, OrderStatus.CANCELED),
        /Transição inválida de "DELIVERED" para "CANCELED"/
      );
    });

    it('should pass cleanly without error on valid transition', () => {
      assert.doesNotThrow(() => {
        OrderStateMachine.validateTransition(OrderStatus.RECEIVED, OrderStatus.PREPARING);
      });
      assert.doesNotThrow(() => {
        OrderStateMachine.validateTransition(OrderStatus.PREPARING, OrderStatus.READY);
      });
      assert.doesNotThrow(() => {
        OrderStateMachine.validateTransition(OrderStatus.READY, OrderStatus.DELIVERED);
      });
    });
  });

  describe('getNextStatus (KDS pipeline helper)', () => {
    it('should return the correct next production status in the pipeline', () => {
      assert.equal(OrderStateMachine.getNextStatus(OrderStatus.RECEIVED), OrderStatus.PREPARING);
      assert.equal(OrderStateMachine.getNextStatus(OrderStatus.PREPARING), OrderStatus.READY);
      assert.equal(OrderStateMachine.getNextStatus(OrderStatus.READY), OrderStatus.DELIVERED);
    });

    it('should return null for terminal states', () => {
      assert.equal(OrderStateMachine.getNextStatus(OrderStatus.DELIVERED), null);
      assert.equal(OrderStateMachine.getNextStatus(OrderStatus.CANCELED), null);
    });
  });
});
