import { describe, it, expect, beforeEach } from 'vitest';
import { SnakeLadderGame } from '../src/games/SnakeLadderGame.js';

describe('Snake & Ladder Game Engine', () => {
  let game;
  const players = [
    { id: 'socket_1', userId: 'u1', username: 'Player 1' },
    { id: 'socket_2', userId: 'u2', username: 'Player 2' },
  ];

  beforeEach(() => {
    game = new SnakeLadderGame();
    game.init(players);
  });

  it('should initialize game with players at square 1', () => {
    const state = game.getState();
    expect(state.status).toBe('IN_PROGRESS');
    expect(state.players.length).toBe(2);
    expect(state.players[0].position).toBe(1);
    expect(state.players[1].position).toBe(1);
    expect(state.currentTurnIndex).toBe(0);
  });

  it('should advance position correctly on dice roll', () => {
    // Force player to roll
    const res = game.rollDice('socket_1');
    expect(res.success).toBe(true);
    expect(res.roll).toBeGreaterThanOrEqual(1);
    expect(res.roll).toBeLessThanOrEqual(6);

    const player = game.players[0];
    if (res.snakeOrLadder) {
      expect(player.position).toBe(res.finalPos);
    } else {
      expect(player.position).toBe(1 + res.roll);
    }
  });

  it('should climb a ladder when landing on ladder bottom (e.g. 4 -> 25)', () => {
    // Manually set player position to 3 so rolling 1 lands on 4
    game.players[0].position = 3;
    // Mock Math.random to return 1 (roll = 1) -> 0.0 -> roll = 1
    const originalRandom = Math.random;
    Math.random = () => 0.0; // Math.floor(0 * 6) + 1 = 1

    const res = game.rollDice('socket_1');
    Math.random = originalRandom;

    expect(res.success).toBe(true);
    expect(res.roll).toBe(1);
    expect(res.snakeOrLadder.type).toBe('LADDER');
    expect(game.players[0].position).toBe(25);
  });

  it('should drop down when landing on a snake head (e.g. 99 -> 54)', () => {
    game.players[0].position = 98;
    const originalRandom = Math.random;
    Math.random = () => 0.0; // roll = 1 -> lands on 99 (snake to 54)

    const res = game.rollDice('socket_1');
    Math.random = originalRandom;

    expect(res.success).toBe(true);
    expect(res.roll).toBe(1);
    expect(res.snakeOrLadder.type).toBe('SNAKE');
    expect(game.players[0].position).toBe(54);
  });

  it('should enforce exact roll to 100 rule', () => {
    game.players[0].position = 98;
    const originalRandom = Math.random;
    Math.random = () => 0.99; // Math.floor(0.99 * 6) + 1 = 6

    const res = game.rollDice('socket_1');
    Math.random = originalRandom;

    expect(res.success).toBe(true);
    expect(res.roll).toBe(6);
    expect(game.players[0].position).toBe(98); // Remains at 98 because 98 + 6 > 100
  });

  it('should declare winner when player reaches 100', () => {
    game.players[0].position = 99;
    const originalRandom = Math.random;
    Math.random = () => 0.0; // roll = 1 (position 99 + 1 = 100)

    const res = game.rollDice('socket_1');
    Math.random = originalRandom;

    expect(res.success).toBe(true);
    expect(game.players[0].position).toBe(100);
    expect(game.players[0].isWinner).toBe(true);
    expect(game.winner.id).toBe('socket_1');
  });
});
