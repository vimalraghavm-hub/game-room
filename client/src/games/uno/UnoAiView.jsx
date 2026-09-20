import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import UnoBoard from './UnoBoard';
import { chooseUnoMove, getUnoAiDelay } from '../../utils/ai/unoAI';
import confetti from 'canvas-confetti';

const COLORS = ['red', 'yellow', 'green', 'blue'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTIONS = ['skip', 'reverse', 'draw2'];
const AVATARS = ['🤖 Apex', '🤖 Bolt', '🤖 Cyra', '🤖 Dynamo'];

export default function UnoAiView(props) {
  const [searchParams] = useSearchParams();
  const difficulty = props.difficulty || searchParams.get('difficulty') || 'Normal';
  const aiCount = props.aiCount || parseInt(searchParams.get('aiCount') || '1', 10);
  const [gameState, setGameState] = useState(null);
  const aiTimeoutRef = useRef(null);

  // Initialize Local AI Game
  useEffect(() => {
    initGame();
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [difficulty, aiCount]);

  function initGame() {
    // Deck creation
    let deck = [];
    COLORS.forEach(color => {
      deck.push({ id: `${color}_0_0`, color, value: '0', type: 'number' });
      NUMBERS.slice(1).forEach(num => {
        deck.push({ id: `${color}_${num}_1`, color, value: num, type: 'number' });
        deck.push({ id: `${color}_${num}_2`, color, value: num, type: 'number' });
      });
      ACTIONS.forEach(action => {
        deck.push({ id: `${color}_${action}_1`, color, value: action, type: action });
        deck.push({ id: `${color}_${action}_2`, color, value: action, type: action });
      });
    });

    for (let i = 1; i <= 4; i++) {
      deck.push({ id: `wild_${i}`, color: 'wild', value: 'wild', type: 'wild' });
      deck.push({ id: `wild_draw4_${i}`, color: 'wild', value: 'draw4', type: 'draw4' });
    }

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Players list: Human player (p_human) + AI opponents (p_ai_1, p_ai_2, etc.)
    const players = [
      { id: 'p_human', name: 'You', avatar: '🎮', hand: [], isAi: false, hasCalledUno: false },
    ];

    for (let i = 1; i <= aiCount; i++) {
      players.push({
        id: `p_ai_${i}`,
        name: AVATARS[(i - 1) % AVATARS.length],
        avatar: '🤖',
        hand: [],
        isAi: true,
        hasCalledUno: false,
      });
    }

    // Deal 7 cards to each player
    players.forEach(p => {
      p.hand = deck.splice(0, 7);
    });

    // Draw top discard card (ensure number card)
    let initialCard = deck.pop();
    while (initialCard.type !== 'number') {
      deck.unshift(initialCard);
      initialCard = deck.pop();
    }

    setGameState({
      status: 'PLAYING',
      currentTurnIndex: 0,
      direction: 1,
      currentColor: initialCard.color,
      topDiscardCard: initialCard,
      drawPile: deck,
      discardPile: [initialCard],
      lastAction: `Match started! Top card is ${initialCard.color.toUpperCase()} ${initialCard.value}`,
      winner: null,
      players,
    });
  }

  // AI Turn Effect Loop
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
      const decision = chooseUnoMove(currentPlayer.hand, prev.currentColor, prev.topDiscardCard, opponents, difficulty);

      let drawPile = [...prev.drawPile];
      let discardPile = [...prev.discardPile];
      let direction = prev.direction;
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
            drawPile.forEach(c => {
              if (c.type === 'wild' || c.type === 'draw4') c.color = 'wild';
            });
            // Shuffle draw pile
            for (let k = drawPile.length - 1; k > 0; k--) {
              const j = Math.floor(Math.random() * (k + 1));
              [drawPile[k], drawPile[j]] = [drawPile[j], drawPile[k]];
            }
          }
          if (drawPile.length > 0) {
            drawn.push(drawPile.pop());
          }
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

          if (card.color === 'wild' || card.type === 'wild' || card.type === 'draw4') {
            currentColor = decision.chosenColor || 'red';
          } else {
            currentColor = card.color;
          }

          lastAction = `${currentPlayer.name} played ${card.color.toUpperCase()} ${card.value.toUpperCase()}`;

          // AI Auto-Calls UNO
          if (currentPlayer.hand.length === 1) {
            currentPlayer.hasCalledUno = true;
            lastAction = `🔥 ${currentPlayer.name} called UNO!`;
          }

          // Winner Check
          if (currentPlayer.hand.length === 0) {
            status = 'FINISHED';
            winner = currentPlayer;
            lastAction = `🎉 ${currentPlayer.name} won the UNO match!`;
          } else {
            // Apply Actions
            if (card.type === 'skip') {
              advanceTurn(2);
            } else if (card.type === 'reverse') {
              direction *= -1;
              if (players.length === 2) advanceTurn(2);
              else advanceTurn(1);
            } else if (card.type === 'draw2') {
              advanceTurn(1);
              const nextP = players[currentTurnIndex];
              nextP.hand.push(...drawCards(2));
              advanceTurn(1);
            } else if (card.type === 'draw4') {
              advanceTurn(1);
              const nextP = players[currentTurnIndex];
              nextP.hand.push(...drawCards(4));
              advanceTurn(1);
            } else {
              advanceTurn(1);
            }
          }
        }
      }

      return {
        status,
        currentTurnIndex,
        direction,
        currentColor,
        topDiscardCard: discardPile[discardPile.length - 1],
        drawPile,
        discardPile,
        lastAction,
        winner,
        players,
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
      let currentColor = (card.color === 'wild' || card.type === 'wild' || card.type === 'draw4') ? chosenColor : card.color;
      let direction = prev.direction;
      let currentTurnIndex = prev.currentTurnIndex;
      let status = prev.status;
      let winner = prev.winner;
      let lastAction = `${currentPlayer.name} played ${card.color.toUpperCase()} ${card.value.toUpperCase()}`;

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
            drawPile.forEach(c => { if (c.type === 'wild' || c.type === 'draw4') c.color = 'wild'; });
          }
          if (drawPile.length > 0) drawn.push(drawPile.pop());
        }
        return drawn;
      };

      if (currentPlayer.hand.length === 0) {
        status = 'FINISHED';
        winner = currentPlayer;
        lastAction = `🎉 You won the UNO match!`;
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } else {
        if (card.type === 'skip') {
          advanceTurn(2);
        } else if (card.type === 'reverse') {
          direction *= -1;
          if (players.length === 2) advanceTurn(2);
          else advanceTurn(1);
        } else if (card.type === 'draw2') {
          advanceTurn(1);
          players[currentTurnIndex].hand.push(...drawCards(2));
          advanceTurn(1);
        } else if (card.type === 'draw4') {
          advanceTurn(1);
          players[currentTurnIndex].hand.push(...drawCards(4));
          advanceTurn(1);
        } else {
          advanceTurn(1);
        }
      }

      return {
        status,
        currentTurnIndex,
        direction,
        currentColor,
        topDiscardCard: card,
        drawPile,
        discardPile,
        lastAction,
        winner,
        players,
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
        players,
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

  // Convert internal state to board view format
  const sanitizedBoardState = gameState ? {
    status: gameState.status,
    currentTurnPlayerId: gameState.players[gameState.currentTurnIndex]?.id,
    direction: gameState.direction,
    currentColor: gameState.currentColor,
    topDiscardCard: gameState.topDiscardCard,
    drawPileCount: gameState.drawPile.length,
    lastAction: gameState.lastAction,
    winner: gameState.winner,
    players: gameState.players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      cardCount: p.hand.length,
      hasCalledUno: p.hasCalledUno,
      hand: p.id === 'p_human' ? p.hand : [],
    })),
  } : null;

  return (
    <div className="w-full flex flex-col items-center py-4">
      <div className="mb-2 text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
        Single Player vs AI ({difficulty} Difficulty)
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
