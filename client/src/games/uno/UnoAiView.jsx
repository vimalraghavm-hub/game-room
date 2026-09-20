import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import UnoBoard from './UnoBoard';
import { chooseUnoMove, getUnoAiDelay, getCardFace } from '../../utils/ai/unoAI';
import confetti from 'canvas-confetti';

const LIGHT_COLORS = ['red', 'yellow', 'green', 'blue'];
const DARK_COLORS = ['pink', 'teal', 'orange', 'purple'];
const COLOR_MAP_LIGHT_TO_DARK = { red: 'pink', yellow: 'orange', green: 'teal', blue: 'purple' };
const COLOR_MAP_DARK_TO_LIGHT = { pink: 'red', orange: 'yellow', teal: 'green', purple: 'blue' };

const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const BOT_NAMES = ['🤖 Apex', '🤖 Bolt', '🤖 Cyra', '🤖 Dynamo'];

export default function UnoAiView(props) {
  const [searchParams] = useSearchParams();
  const difficulty = props.difficulty || searchParams.get('difficulty') || 'Normal';
  const aiCount = props.aiCount || parseInt(searchParams.get('aiCount') || '1', 10);
  const mode = props.mode || searchParams.get('mode') || 'CLASSIC'; // 'CLASSIC' or 'FLIP'
  const startingHandSize = parseInt(searchParams.get('startingHandSize') || '7', 10);
  const turnTimerDuration = parseInt(searchParams.get('turnTimerDuration') || '30', 10);

  const [gameState, setGameState] = useState(null);
  const aiTimeoutRef = useRef(null);

  useEffect(() => {
    initGame();
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [difficulty, aiCount, mode, startingHandSize, turnTimerDuration]);

  function initGame() {
    let deck = [];

    if (mode === 'FLIP') {
      for (let cIdx = 0; cIdx < 4; cIdx++) {
        const lColor = LIGHT_COLORS[cIdx];
        const dColor = DARK_COLORS[cIdx];

        NUMBERS.forEach(num => {
          for (let k = 1; k <= 2; k++) {
            deck.push({
              id: `flip_${lColor}_${dColor}_${num}_${k}`,
              lightSide: { color: lColor, value: num, type: 'number' },
              darkSide: { color: dColor, value: num, type: 'number' }
            });
          }
        });

        for (let k = 1; k <= 2; k++) {
          deck.push({
            id: `flip_action_skip_${lColor}_${k}`,
            lightSide: { color: lColor, value: 'skip', type: 'skip' },
            darkSide: { color: dColor, value: 'skip_all', type: 'skip_all' }
          });
          deck.push({
            id: `flip_action_rev_${lColor}_${k}`,
            lightSide: { color: lColor, value: 'reverse', type: 'reverse' },
            darkSide: { color: dColor, value: 'reverse', type: 'reverse' }
          });
          deck.push({
            id: `flip_action_draw_${lColor}_${k}`,
            lightSide: { color: lColor, value: 'draw1', type: 'draw1' },
            darkSide: { color: dColor, value: 'draw5', type: 'draw5' }
          });
          deck.push({
            id: `flip_action_flip_${lColor}_${k}`,
            lightSide: { color: lColor, value: 'flip', type: 'flip' },
            darkSide: { color: dColor, value: 'flip', type: 'flip' }
          });
        }
      }

      for (let i = 1; i <= 4; i++) {
        deck.push({
          id: `flip_wild_${i}`,
          lightSide: { color: 'wild', value: 'wild', type: 'wild' },
          darkSide: { color: 'wild', value: 'wild', type: 'wild' }
        });
        deck.push({
          id: `flip_wild_draw_${i}`,
          lightSide: { color: 'wild', value: 'draw2', type: 'draw2' },
          darkSide: { color: 'wild', value: 'draw_color', type: 'draw_color' }
        });
      }
    } else {
      LIGHT_COLORS.forEach(color => {
        deck.push({
          id: `${color}_0_0`,
          lightSide: { color, value: '0', type: 'number' },
          darkSide: { color, value: '0', type: 'number' }
        });
        NUMBERS.forEach(num => {
          deck.push({
            id: `${color}_${num}_1`,
            lightSide: { color, value: num, type: 'number' },
            darkSide: { color, value: num, type: 'number' }
          });
          deck.push({
            id: `${color}_${num}_2`,
            lightSide: { color, value: num, type: 'number' },
            darkSide: { color, value: num, type: 'number' }
          });
        });
        ['skip', 'reverse', 'draw2'].forEach(action => {
          deck.push({
            id: `${color}_${action}_1`,
            lightSide: { color, value: action, type: action },
            darkSide: { color, value: action, type: action }
          });
          deck.push({
            id: `${color}_${action}_2`,
            lightSide: { color, value: action, type: action },
            darkSide: { color, value: action, type: action }
          });
        });
      });

      for (let i = 1; i <= 4; i++) {
        deck.push({
          id: `wild_${i}`,
          lightSide: { color: 'wild', value: 'wild', type: 'wild' },
          darkSide: { color: 'wild', value: 'wild', type: 'wild' }
        });
        deck.push({
          id: `wild_draw4_${i}`,
          lightSide: { color: 'wild', value: 'draw4', type: 'draw4' },
          darkSide: { color: 'wild', value: 'draw4', type: 'draw4' }
        });
      }
    }

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const players = [
      { id: 'p_human', name: 'You', avatar: '🎮', hand: [], isAi: false, hasCalledUno: false }
    ];

    for (let i = 1; i <= aiCount; i++) {
      players.push({
        id: `p_ai_${i}`,
        name: BOT_NAMES[(i - 1) % BOT_NAMES.length],
        avatar: '🤖',
        hand: [],
        isAi: true,
        hasCalledUno: false
      });
    }

    players.forEach(p => {
      p.hand = deck.splice(0, startingHandSize);
    });

    let initialCard = deck.pop();
    while (initialCard.lightSide.type !== 'number') {
      deck.unshift(initialCard);
      initialCard = deck.pop();
    }

    setGameState({
      mode,
      status: 'PLAYING',
      currentTurnIndex: 0,
      direction: 1,
      activeSide: 'light',
      currentColor: initialCard.lightSide.color,
      topDiscardCard: initialCard,
      drawPile: deck,
      discardPile: [initialCard],
      lastAction: `Match started (${mode === 'FLIP' ? 'UNO FLIP' : 'CLASSIC'})! Top card is ${initialCard.lightSide.color.toUpperCase()} ${initialCard.lightSide.value}`,
      winner: null,
      turnStartTime: Date.now(),
      turnTimerDuration,
      startingHandSize,
      players
    });
  }

  // AI Turn Automation
  useEffect(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (currentPlayer && currentPlayer.isAi) {
      const delay = getUnoAiDelay(difficulty);
      aiTimeoutRef.current = setTimeout(() => {
        handleAiTurn();
      }, delay);
    }
  }, [gameState, difficulty]);

  function handleAiTurn() {
    setGameState(prev => {
      if (!prev || prev.status !== 'PLAYING') return prev;

      const players = prev.players.map(p => ({ ...p, hand: [...p.hand] }));
      const currentPlayer = players[prev.currentTurnIndex];
      if (!currentPlayer || !currentPlayer.isAi) return prev;

      const opponents = players.filter((_, idx) => idx !== prev.currentTurnIndex).map(p => ({ cardCount: p.hand.length }));
      const decision = chooseUnoMove(currentPlayer.hand, prev.currentColor, prev.topDiscardCard, opponents, difficulty, prev.activeSide);

      let drawPile = [...prev.drawPile];
      let discardPile = [...prev.discardPile];
      let direction = prev.direction;
      let activeSide = prev.activeSide;
      let currentColor = prev.currentColor;
      let currentTurnIndex = prev.currentTurnIndex;
      let status = prev.status;
      let winner = prev.winner;
      let lastAction = prev.lastAction;

      const advanceTurn = (steps = 1) => {
        const n = players.length;
        currentTurnIndex = (currentTurnIndex + (direction * steps) % n + n) % n;
      };

      const drawCards = (count) => {
        const drawn = [];
        for (let i = 0; i < count; i++) {
          if (drawPile.length === 0 && discardPile.length > 1) {
            const top = discardPile.pop();
            drawPile = discardPile;
            discardPile = [top];
            for (let k = drawPile.length - 1; k > 0; k--) {
              const j = Math.floor(Math.random() * (k + 1));
              [drawPile[k], drawPile[j]] = [drawPile[j], drawPile[k]];
            }
          }
          if (drawPile.length > 0) drawn.push(drawPile.pop());
        }
        return drawn;
      };

      if (decision.action === 'DRAW') {
        const drawn = drawCards(1);
        if (drawn.length > 0) {
          currentPlayer.hand.push(drawn[0]);
          currentPlayer.hasCalledUno = false;
          lastAction = `${currentPlayer.name} drew a card`;
        }
        advanceTurn(1);
      } else if (decision.action === 'PLAY' && decision.card) {
        const cardIndex = currentPlayer.hand.findIndex(c => c.id === decision.card.id);
        if (cardIndex !== -1) {
          const card = currentPlayer.hand.splice(cardIndex, 1)[0];
          discardPile.push(card);
          const face = getCardFace(card, activeSide);

          if (face.color === 'wild' || face.type === 'wild' || face.type === 'draw2' || face.type === 'draw4' || face.type === 'draw_color') {
            currentColor = decision.chosenColor || (activeSide === 'dark' ? 'pink' : 'red');
          } else {
            currentColor = face.color;
          }

          lastAction = `${currentPlayer.name} played ${face.color.toUpperCase()} ${face.value.toUpperCase()}`;

          if (currentPlayer.hand.length === 1) {
            currentPlayer.hasCalledUno = true;
            lastAction = `🔥 ${currentPlayer.name} called UNO!`;
          }

          if (currentPlayer.hand.length === 0) {
            status = 'FINISHED';
            winner = currentPlayer;
            lastAction = `🎉 ${currentPlayer.name} won the match!`;
          } else {
            if (face.type === 'flip') {
              activeSide = activeSide === 'light' ? 'dark' : 'light';
              currentColor = activeSide === 'dark' ? (COLOR_MAP_LIGHT_TO_DARK[currentColor] || 'pink') : (COLOR_MAP_DARK_TO_LIGHT[currentColor] || 'red');
              lastAction += ` — 🔄 FLIPPED TO THE ${activeSide.toUpperCase()} SIDE!`;
              advanceTurn(1);
            } else if (face.type === 'skip') {
              advanceTurn(2);
            } else if (face.type === 'skip_all') {
              // Turn stays with player
            } else if (face.type === 'reverse') {
              direction *= -1;
              if (players.length === 2) advanceTurn(2);
              else advanceTurn(1);
            } else if (face.type === 'draw1') {
              advanceTurn(1);
              players[currentTurnIndex].hand.push(...drawCards(1));
              advanceTurn(1);
            } else if (face.type === 'draw2') {
              advanceTurn(1);
              players[currentTurnIndex].hand.push(...drawCards(2));
              advanceTurn(1);
            } else if (face.type === 'draw4') {
              advanceTurn(1);
              players[currentTurnIndex].hand.push(...drawCards(4));
              advanceTurn(1);
            } else if (face.type === 'draw5') {
              advanceTurn(1);
              players[currentTurnIndex].hand.push(...drawCards(5));
              advanceTurn(1);
            } else if (face.type === 'draw_color') {
              advanceTurn(1);
              const target = players[currentTurnIndex];
              let count = 0;
              let drawnCard = null;
              do {
                const d = drawCards(1);
                if (d.length === 0) break;
                drawnCard = d[0];
                target.hand.push(drawnCard);
                count++;
              } while (getCardFace(drawnCard, activeSide).color !== currentColor && count < 10);
              advanceTurn(1);
            } else {
              advanceTurn(1);
            }
          }
        }
      }

      return {
        ...prev,
        status,
        currentTurnIndex,
        direction,
        activeSide,
        currentColor,
        topDiscardCard: discardPile[discardPile.length - 1],
        drawPile,
        discardPile,
        lastAction,
        turnStartTime: Date.now(),
        winner,
        players
      };
    });
  }

  // Human Actions
  const handlePlayCard = (cardId, chosenColor) => {
    if (!gameState || gameState.status !== 'PLAYING') return;

    setGameState(prev => {
      const players = prev.players.map(p => ({ ...p, hand: [...p.hand] }));
      const currentPlayer = players[prev.currentTurnIndex];
      if (!currentPlayer || currentPlayer.id !== 'p_human') return prev;

      const cardIndex = currentPlayer.hand.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;

      const card = currentPlayer.hand.splice(cardIndex, 1)[0];
      let discardPile = [...prev.discardPile, card];
      let drawPile = [...prev.drawPile];
      let activeSide = prev.activeSide;
      let face = getCardFace(card, activeSide);
      let currentColor = (face.color === 'wild' || face.type === 'wild' || face.type === 'draw2' || face.type === 'draw4' || face.type === 'draw_color') ? chosenColor : face.color;
      let direction = prev.direction;
      let currentTurnIndex = prev.currentTurnIndex;
      let status = prev.status;
      let winner = prev.winner;
      let lastAction = `${currentPlayer.name} played ${face.color.toUpperCase()} ${face.value.toUpperCase()}`;

      const advanceTurn = (steps = 1) => {
        const n = players.length;
        currentTurnIndex = (currentTurnIndex + (direction * steps) % n + n) % n;
      };

      const drawCards = (count) => {
        const drawn = [];
        for (let i = 0; i < count; i++) {
          if (drawPile.length === 0 && discardPile.length > 1) {
            const top = discardPile.pop();
            drawPile = discardPile;
            discardPile = [top];
          }
          if (drawPile.length > 0) drawn.push(drawPile.pop());
        }
        return drawn;
      };

      if (currentPlayer.hand.length === 0) {
        status = 'FINISHED';
        winner = currentPlayer;
        lastAction = `🎉 You won the match!`;
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } else {
        if (face.type === 'flip') {
          activeSide = activeSide === 'light' ? 'dark' : 'light';
          currentColor = activeSide === 'dark' ? (COLOR_MAP_LIGHT_TO_DARK[currentColor] || 'pink') : (COLOR_MAP_DARK_TO_LIGHT[currentColor] || 'red');
          lastAction += ` — 🔄 FLIPPED TO THE ${activeSide.toUpperCase()} SIDE!`;
          advanceTurn(1);
        } else if (face.type === 'skip') {
          advanceTurn(2);
        } else if (face.type === 'skip_all') {
          // Turn stays with human
        } else if (face.type === 'reverse') {
          direction *= -1;
          if (players.length === 2) advanceTurn(2);
          else advanceTurn(1);
        } else if (face.type === 'draw1') {
          advanceTurn(1);
          players[currentTurnIndex].hand.push(...drawCards(1));
          advanceTurn(1);
        } else if (face.type === 'draw2') {
          advanceTurn(1);
          players[currentTurnIndex].hand.push(...drawCards(2));
          advanceTurn(1);
        } else if (face.type === 'draw4') {
          advanceTurn(1);
          players[currentTurnIndex].hand.push(...drawCards(4));
          advanceTurn(1);
        } else if (face.type === 'draw5') {
          advanceTurn(1);
          players[currentTurnIndex].hand.push(...drawCards(5));
          advanceTurn(1);
        } else if (face.type === 'draw_color') {
          advanceTurn(1);
          const target = players[currentTurnIndex];
          let count = 0;
          let drawnCard = null;
          do {
            const d = drawCards(1);
            if (d.length === 0) break;
            drawnCard = d[0];
            target.hand.push(drawnCard);
            count++;
          } while (getCardFace(drawnCard, activeSide).color !== currentColor && count < 10);
          advanceTurn(1);
        } else {
          advanceTurn(1);
        }
      }

      return {
        ...prev,
        status,
        currentTurnIndex,
        direction,
        activeSide,
        currentColor,
        topDiscardCard: card,
        drawPile,
        discardPile,
        lastAction,
        turnStartTime: Date.now(),
        winner,
        players
      };
    });
  };

  const handleDrawCard = () => {
    if (!gameState || gameState.status !== 'PLAYING') return;

    setGameState(prev => {
      const players = prev.players.map(p => ({ ...p, hand: [...p.hand] }));
      const currentPlayer = players[prev.currentTurnIndex];
      if (!currentPlayer || currentPlayer.id !== 'p_human') return prev;

      let drawPile = [...prev.drawPile];
      let discardPile = [...prev.discardPile];

      if (drawPile.length === 0 && discardPile.length > 1) {
        const top = discardPile.pop();
        drawPile = discardPile;
        discardPile = [top];
      }

      if (drawPile.length > 0) {
        const drawn = drawPile.pop();
        currentPlayer.hand.push(drawn);
        currentPlayer.hasCalledUno = false;
      }

      const n = players.length;
      const nextTurnIndex = (prev.currentTurnIndex + (prev.direction * 1) % n + n) % n;

      return {
        ...prev,
        currentTurnIndex: nextTurnIndex,
        drawPile,
        discardPile,
        lastAction: `You drew a card`,
        turnStartTime: Date.now(),
        players
      };
    });
  };

  const handleCallUno = () => {
    setGameState(prev => {
      const players = prev.players.map(p => ({ ...p }));
      const human = players.find(p => p.id === 'p_human');
      if (human && human.hand.length === 1) {
        human.hasCalledUno = true;
      }
      return { ...prev, players };
    });
  };

  const sanitizedBoardState = gameState ? {
    mode: gameState.mode,
    status: gameState.status,
    activeSide: gameState.activeSide,
    currentTurnPlayerId: gameState.players[gameState.currentTurnIndex]?.id,
    direction: gameState.direction,
    currentColor: gameState.currentColor,
    topDiscardCard: gameState.topDiscardCard,
    drawPileCount: gameState.drawPile.length,
    lastAction: gameState.lastAction,
    turnStartTime: gameState.turnStartTime,
    turnTimerDuration: gameState.turnTimerDuration,
    startingHandSize: gameState.startingHandSize,
    winner: gameState.winner,
    players: gameState.players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      cardCount: p.hand.length,
      hasCalledUno: p.hasCalledUno,
      hand: p.id === 'p_human' ? p.hand : []
    }))
  } : null;

  return (
    <div className="w-full flex flex-col items-center py-4 font-mono">
      <div className="mb-2 text-xs font-bold text-[var(--accent)] bg-[var(--panel-bg)] border border-[var(--border)] px-3 py-1 uppercase tracking-wider">
        SINGLE PLAYER VS AI ({mode === 'FLIP' ? '🔄 UNO FLIP' : '🃏 CLASSIC UNO'} // {difficulty.toUpperCase()} DIFFICULTY)
      </div>
      <UnoBoard
        gameState={sanitizedBoardState}
        myPlayerId="p_human"
        onPlayCard={handlePlayCard}
        onDrawCard={handleDrawCard}
        onCallUno={handleCallUno}
      />
    </div>
  );
}
