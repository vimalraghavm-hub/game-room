const COLORS = ['red', 'yellow', 'green', 'blue'];
const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTIONS = ['skip', 'reverse', 'draw2'];

class UnoGame {
  constructor(players) {
    this.players = players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar || '👤',
      hand: [],
      hasCalledUno: false
    }));

    this.drawPile = [];
    this.discardPile = [];
    this.currentTurnIndex = 0;
    this.direction = 1; // 1 = Clockwise, -1 = Counter-Clockwise
    this.currentColor = null;
    this.status = 'WAITING'; // WAITING, PLAYING, FINISHED
    this.winner = null;
    this.pendingColorChoice = false;
    this.lastAction = 'Game initialized';

    this.initDeck();
  }

  initDeck() {
    this.drawPile = [];
    
    // Build 108 card deck
    COLORS.forEach(color => {
      // One '0' per color
      this.drawPile.push({ id: `${color}_0_0`, color, value: '0', type: 'number' });

      // Two '1' through '9' per color
      NUMBERS.slice(1).forEach(num => {
        this.drawPile.push({ id: `${color}_${num}_1`, color, value: num, type: 'number' });
        this.drawPile.push({ id: `${color}_${num}_2`, color, value: num, type: 'number' });
      });

      // Two of each Action card per color
      ACTIONS.forEach(action => {
        this.drawPile.push({ id: `${color}_${action}_1`, color, value: action, type: action });
        this.drawPile.push({ id: `${color}_${action}_2`, color, value: action, type: action });
      });
    });

    // 4 Wild cards and 4 Wild Draw 4 (+4) cards
    for (let i = 1; i <= 4; i++) {
      this.drawPile.push({ id: `wild_${i}`, color: 'wild', value: 'wild', type: 'wild' });
      this.drawPile.push({ id: `wild_draw4_${i}`, color: 'wild', value: 'draw4', type: 'draw4' });
    }

    this.shuffle(this.drawPile);
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  start() {
    this.status = 'PLAYING';
    
    // Deal 7 cards to each player
    this.players.forEach(p => {
      p.hand = this.drawCardsFromPile(7);
      p.hasCalledUno = false;
    });

    // Draw top card to start discard pile (ensure it is a standard number card, not an action or wild card)
    let initialCard = this.drawCardsFromPile(1)[0];
    while (initialCard.type !== 'number') {
      this.drawPile.push(initialCard);
      this.shuffle(this.drawPile);
      initialCard = this.drawCardsFromPile(1)[0];
    }

    this.discardPile.push(initialCard);
    this.currentColor = initialCard.color;
    this.lastAction = `Game started! Top card is ${initialCard.color.toUpperCase()} ${initialCard.value}`;

    return this.getState();
  }

  drawCardsFromPile(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length <= 1) break; // No cards left to draw
        
        // Save top discard card and reshuffle rest
        const topDiscard = this.discardPile.pop();
        this.drawPile = this.discardPile;
        this.discardPile = [topDiscard];
        
        // Reset wild colors in reshuffled pile
        this.drawPile.forEach(c => {
          if (c.type === 'wild' || c.type === 'draw4') {
            c.color = 'wild';
          }
        });
        this.shuffle(this.drawPile);
      }
      if (this.drawPile.length > 0) {
        drawn.push(this.drawPile.pop());
      }
    }
    return drawn;
  }

  getCurrentPlayer() {
    return this.players[this.currentTurnIndex];
  }

  advanceTurn(steps = 1) {
    const n = this.players.length;
    this.currentTurnIndex = (this.currentTurnIndex + (this.direction * steps) % n + n) % n;
  }

  canPlayCard(card) {
    const topCard = this.discardPile[this.discardPile.length - 1];
    
    if (card.type === 'wild' || card.type === 'draw4') {
      return true;
    }
    
    return card.color === this.currentColor || card.value === topCard.value;
  }

  playCard(playerId, cardId, chosenColor = null) {
    if (this.status !== 'PLAYING') return { success: false, error: 'Game not in progress' };
    
    const player = this.getCurrentPlayer();
    if (player.id !== playerId) return { success: false, error: 'Not your turn' };

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { success: false, error: 'Card not in hand' };

    const card = player.hand[cardIndex];
    if (!this.canPlayCard(card)) return { success: false, error: 'Invalid card play' };

    if ((card.type === 'wild' || card.type === 'draw4') && !chosenColor) {
      return { success: false, error: 'Must select a color for wild card' };
    }

    // Remove card from hand
    player.hand.splice(cardIndex, 1);
    this.discardPile.push(card);

    // Update current color
    if (card.type === 'wild' || card.type === 'draw4') {
      this.currentColor = chosenColor;
    } else {
      this.currentColor = card.color;
    }

    this.lastAction = `${player.name} played ${card.color.toUpperCase()} ${card.value.toUpperCase()}`;

    // UNO check: Reset UNO call status if player hand > 1
    if (player.hand.length !== 1) {
      player.hasCalledUno = false;
    }

    // Check Win Condition
    if (player.hand.length === 0) {
      this.status = 'FINISHED';
      this.winner = player;
      this.lastAction = `🎉 ${player.name} won the UNO game!`;
      return { success: true, state: this.getState() };
    }

    // Apply Action Cards & Advance Turn
    if (card.type === 'skip') {
      this.lastAction += ` — Skip applied!`;
      this.advanceTurn(2);
    } else if (card.type === 'reverse') {
      this.direction *= -1;
      this.lastAction += ` — Direction reversed!`;
      if (this.players.length === 2) {
        this.advanceTurn(2);
      } else {
        this.advanceTurn(1);
      }
    } else if (card.type === 'draw2') {
      this.advanceTurn(1);
      const nextPlayer = this.getCurrentPlayer();
      const drawn = this.drawCardsFromPile(2);
      nextPlayer.hand.push(...drawn);
      this.lastAction += ` — ${nextPlayer.name} drew 2 cards and was skipped!`;
      this.advanceTurn(1);
    } else if (card.type === 'draw4') {
      this.advanceTurn(1);
      const nextPlayer = this.getCurrentPlayer();
      const drawn = this.drawCardsFromPile(4);
      nextPlayer.hand.push(...drawn);
      this.lastAction += ` — ${nextPlayer.name} drew 4 cards and was skipped! New color: ${chosenColor.toUpperCase()}`;
      this.advanceTurn(1);
    } else {
      this.advanceTurn(1);
    }

    return { success: true, state: this.getState() };
  }

  drawCard(playerId) {
    if (this.status !== 'PLAYING') return { success: false, error: 'Game not in progress' };
    
    const player = this.getCurrentPlayer();
    if (player.id !== playerId) return { success: false, error: 'Not your turn' };

    const drawn = this.drawCardsFromPile(1);
    if (drawn.length > 0) {
      player.hand.push(drawn[0]);
      player.hasCalledUno = false;
      this.lastAction = `${player.name} drew a card`;
    }

    // Turn advances to next player after drawing
    this.advanceTurn(1);

    return { success: true, state: this.getState() };
  }

  callUno(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { success: false, error: 'Player not found' };

    if (player.hand.length === 1) {
      player.hasCalledUno = true;
      this.lastAction = `🔥 ${player.name} called UNO!`;
      return { success: true, state: this.getState() };
    } else {
      return { success: false, error: 'Can only call UNO with 1 card remaining' };
    }
  }

  getState(forPlayerId = null) {
    const topCard = this.discardPile[this.discardPile.length - 1] || null;

    return {
      status: this.status,
      currentTurnPlayerId: this.getCurrentPlayer().id,
      direction: this.direction,
      currentColor: this.currentColor,
      topDiscardCard: topCard,
      drawPileCount: this.drawPile.length,
      discardPileCount: this.discardPile.length,
      lastAction: this.lastAction,
      winner: this.winner ? { id: this.winner.id, name: this.winner.name } : null,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        cardCount: p.hand.length,
        hasCalledUno: p.hasCalledUno,
        // Hand content is ONLY revealed to the owner for online security
        hand: forPlayerId === null || forPlayerId === p.id ? p.hand : []
      }))
    };
  }
}

module.exports = UnoGame;
