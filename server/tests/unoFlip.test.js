import { describe, it, expect, beforeEach } from 'vitest';
import UnoGame from '../src/games/UnoGame.js';

describe('UNO FLIP Game Engine', () => {
  let game;
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
  ];

  beforeEach(() => {
    game = new UnoGame(players, { mode: 'FLIP', startingHandSize: 7, turnTimerDuration: 30 });
  });

  it('should initialize UNO FLIP deck and starting cards on Light Side', () => {
    const initialState = game.start();
    expect(initialState.mode).toBe('FLIP');
    expect(initialState.status).toBe('PLAYING');
    expect(initialState.activeSide).toBe('light');
    expect(initialState.players[0].cardCount).toBe(7);
    expect(initialState.players[1].cardCount).toBe(7);
  });

  it('should flip table from Light Side to Dark Side when FLIP card is played', () => {
    game.start();
    const p1 = game.players[0];
    game.currentColor = 'red';

    const flipCard = {
      id: 'flip_test_1',
      lightSide: { color: 'red', value: 'flip', type: 'flip' },
      darkSide: { color: 'pink', value: 'flip', type: 'flip' }
    };
    p1.hand.push(flipCard);

    const res = game.playCard('p1', 'flip_test_1');
    expect(res.success).toBe(true);
    expect(game.activeSide).toBe('dark');
    expect(game.currentColor).toBe('pink');
  });

  it('should handle Dark Side Skip Everyone action (skip_all)', () => {
    game.start();
    game.activeSide = 'dark';
    game.currentColor = 'pink';
    const p1 = game.players[0];

    const skipAllCard = {
      id: 'skip_all_test',
      lightSide: { color: 'red', value: 'skip', type: 'skip' },
      darkSide: { color: 'pink', value: 'skip_all', type: 'skip_all' }
    };
    p1.hand.push(skipAllCard);

    const res = game.playCard('p1', 'skip_all_test');
    expect(res.success).toBe(true);
    // Turn stays with p1
    expect(game.getState().currentTurnPlayerId).toBe('p1');
  });

  it('should handle Dark Side Draw 5 action (draw5)', () => {
    game.start();
    game.activeSide = 'dark';
    game.currentColor = 'teal';
    const p1 = game.players[0];
    const initialP2Hand = game.players[1].hand.length;

    const draw5Card = {
      id: 'draw5_test',
      lightSide: { color: 'green', value: 'draw1', type: 'draw1' },
      darkSide: { color: 'teal', value: 'draw5', type: 'draw5' }
    };
    p1.hand.push(draw5Card);

    const res = game.playCard('p1', 'draw5_test');
    expect(res.success).toBe(true);
    expect(game.players[1].hand.length).toBe(initialP2Hand + 5);
  });

  it('should auto-pass turn when turn timer expires', () => {
    game.start();
    game.turnTimerDuration = 1; // 1 second
    game.turnStartTime = Date.now() - 2000; // 2 seconds ago

    const expired = game.checkTurnTimer();
    expect(expired).toBe(true);
    expect(game.getState().currentTurnPlayerId).toBe('p2');
  });
});
