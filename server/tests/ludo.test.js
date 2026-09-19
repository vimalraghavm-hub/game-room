import { describe, it, expect, beforeEach } from 'vitest';
import { LudoGame } from '../src/games/LudoGame.js';

describe('Ludo Game Engine', () => {
  let game;
  const players = [
    { id: 'socket_1', userId: 'u1', username: 'Red Player' },
    { id: 'socket_2', userId: 'u2', username: 'Green Player' },
  ];

  beforeEach(() => {
    game = new LudoGame();
    game.init(players);
  });

  it('should initialize player tokens in yard (-1)', () => {
    const state = game.getState();
    expect(state.status).toBe('IN_PROGRESS');
    expect(state.players.length).toBe(2);
    expect(state.players[0].tokens).toEqual([-1, -1, -1, -1]);
  });

  it('should require a 6 to open token from yard (-1 to 0)', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.0; // roll = 1

    const rollRes = game.rollDice('socket_1');
    Math.random = originalRandom;

    expect(rollRes.success).toBe(true);
    expect(rollRes.roll).toBe(1);
    expect(rollRes.validMoves).toEqual([]); // No legal moves
    expect(rollRes.autoPass).toBe(true); // Automatically passes turn
  });

  it('should allow token to enter board (step 0) when rolling a 6', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.99; // roll = 6

    const rollRes = game.rollDice('socket_1');
    Math.random = originalRandom;

    expect(rollRes.success).toBe(true);
    expect(rollRes.roll).toBe(6);
    expect(rollRes.validMoves).toEqual([0, 1, 2, 3]);

    const moveRes = game.moveToken('socket_1', 0);
    expect(moveRes.success).toBe(true);
    expect(game.players[0].tokens[0]).toBe(0); // Moved to starting square (0)
  });

  it('should capture opponent token on non-safe square and return it to yard', () => {
    // Red (colorIndex 0, startOffset 0): step 13 -> global index 13.
    // Green (colorIndex 1, startOffset 13): step 1 -> global index 14.
    // Red moves from step 13 to 14 (global 14, non-safe). Captures Green token!
    game.players[0].tokens[0] = 13; // Red token 0 at step 13 (global index 13)
    game.players[1].tokens[0] = 1;  // Green token 0 at step 1 (global index 14)

    game.currentTurnIndex = 0;
    const originalRandom = Math.random;
    Math.random = () => 0.0; // roll = 1

    game.rollDice('socket_1');
    Math.random = originalRandom;

    const moveRes = game.moveToken('socket_1', 0); // Move Red token from 13 -> 14
    expect(moveRes.success).toBe(true);
    expect(moveRes.captured).not.toBeNull();
    expect(moveRes.captured.opponent).toBe('Green Player');
    expect(game.players[1].tokens[0]).toBe(-1); // Green token returned to yard!
  });

  it('should NOT capture opponent on a safe star square', () => {
    // Star square at global common index 8
    // Red start = 0, step 8 -> global 8 (Safe star!)
    // Green start = 13, step 47 -> global 8 (Safe star!)
    game.players[0].tokens[0] = 7;
    game.players[1].tokens[0] = 47; // Green token at global 8

    game.currentTurnIndex = 0;
    const originalRandom = Math.random;
    Math.random = () => 0.0; // roll = 1 -> step 8

    game.rollDice('socket_1');
    Math.random = originalRandom;

    const moveRes = game.moveToken('socket_1', 0);
    expect(moveRes.success).toBe(true);
    expect(moveRes.captured).toBeNull();
    expect(game.players[1].tokens[0]).toBe(47); // Green token NOT sent to yard
  });

  it('should declare winner when all 4 tokens reach home (step 56)', () => {
    game.players[0].tokens = [56, 56, 56, 55]; // 3 home, 1 at step 55
    game.currentTurnIndex = 0;

    const originalRandom = Math.random;
    Math.random = () => 0.0; // roll = 1

    game.rollDice('socket_1');
    Math.random = originalRandom;

    const moveRes = game.moveToken('socket_1', 3);
    expect(moveRes.success).toBe(true);
    expect(game.players[0].tokens[3]).toBe(56);
    expect(game.players[0].isWinner).toBe(true);
    expect(game.winner.id).toBe('socket_1');
  });
});
