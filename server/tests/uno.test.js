import { describe, it, expect, beforeEach } from 'vitest';
import UnoGame from '../src/games/UnoGame.js';

describe('UNO Game Engine', () => {
  let game;
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
  ];

  beforeEach(() => {
    game = new UnoGame(players);
  });

  it('should build a 108 card deck and deal 7 cards per player', () => {
    const initialState = game.start();
    expect(initialState.status).toBe('PLAYING');
    expect(initialState.players[0].cardCount).toBe(7);
    expect(initialState.players[1].cardCount).toBe(7);
    expect(initialState.topDiscardCard).not.toBeNull();
  });

  it('should enforce turn order', () => {
    game.start();
    const p2Id = 'p2';
    const fakeCard = { id: 'test_card', color: 'red', value: '1', type: 'number' };
    game.players[1].hand.push(fakeCard);
    
    // Player 2 trying to play on Player 1's turn
    const res = game.playCard(p2Id, 'test_card');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Not your turn');
  });

  it('should allow playing matching color card', () => {
    game.start();
    const p1 = game.players[0];
    game.currentColor = 'red';
    
    const validCard = { id: 'red_5_test', color: 'red', value: '5', type: 'number' };
    p1.hand.push(validCard);

    const res = game.playCard('p1', 'red_5_test');
    expect(res.success).toBe(true);
    expect(game.currentColor).toBe('red');
  });

  it('should allow drawing a card on turn', () => {
    game.start();
    const initialHandCount = game.players[0].hand.length;
    
    const res = game.drawCard('p1');
    expect(res.success).toBe(true);
    expect(game.players[0].hand.length).toBe(initialHandCount + 1);
    expect(game.getState().currentTurnPlayerId).toBe('p2');
  });

  it('should handle Skip action card', () => {
    game.start();
    const p1 = game.players[0];
    game.currentColor = 'blue';

    const skipCard = { id: 'blue_skip_test', color: 'blue', value: 'skip', type: 'skip' };
    p1.hand.push(skipCard);

    const res = game.playCard('p1', 'blue_skip_test');
    expect(res.success).toBe(true);
    // Skips p2, so turn comes back to p1
    expect(game.getState().currentTurnPlayerId).toBe('p1');
  });

  it('should handle Wild card with color selection', () => {
    game.start();
    const p1 = game.players[0];
    const wildCard = { id: 'wild_test', color: 'wild', value: 'wild', type: 'wild' };
    p1.hand.push(wildCard);

    const res = game.playCard('p1', 'wild_test', 'green');
    expect(res.success).toBe(true);
    expect(game.currentColor).toBe('green');
  });

  it('should declare winner when hand is empty', () => {
    game.start();
    const p1 = game.players[0];
    game.currentColor = 'yellow';
    
    const lastCard = { id: 'yellow_9_last', color: 'yellow', value: '9', type: 'number' };
    p1.hand = [lastCard];

    const res = game.playCard('p1', 'yellow_9_last');
    expect(res.success).toBe(true);
    expect(game.status).toBe('FINISHED');
    expect(game.winner.id).toBe('p1');
  });
});
