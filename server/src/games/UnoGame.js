const LIGHT_COLORS = ['red', 'yellow', 'green', 'blue'];
const DARK_COLORS = ['pink', 'teal', 'orange', 'purple'];

const COLOR_MAP_LIGHT_TO_DARK = { red: 'pink', yellow: 'orange', green: 'teal', blue: 'purple' };
const COLOR_MAP_DARK_TO_LIGHT = { pink: 'red', orange: 'yellow', teal: 'green', purple: 'blue' };

const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default class UnoGame {
  constructor(players, options = {}) {
    this.players = players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar || '👤',
      hand: [],
      hasCalledUno: false
    }));

    this.mode = options.mode || 'CLASSIC'; // 'CLASSIC' or 'FLIP'
    this.startingHandSize = options.startingHandSize || 7;
    this.turnTimerDuration = options.turnTimerDuration || 30; // seconds

    this.drawPile = [];
    this.discardPile = [];
    this.currentTurnIndex = 0;
    this.direction = 1; // 1 = Clockwise, -1 = Counter-Clockwise
    this.activeSide = 'light'; // 'light' or 'dark'
    this.currentColor = null;
    this.status = 'WAITING'; // WAITING, PLAYING, FINISHED
    this.winner = null;
    this.lastAction = 'Game initialized';
    this.turnStartTime = Date.now();

    this.initDeck();
  }

  initDeck() {
    this.drawPile = [];

    if (this.mode === 'FLIP') {
      // Build 112 dual-sided UNO FLIP deck
      for (let cIdx = 0; cIdx < 4; cIdx++) {
        const lColor = LIGHT_COLORS[cIdx];
        const dColor = DARK_COLORS[cIdx];

        // Numbers 1-9 (2 per color)
        NUMBERS.forEach(num => {
          for (let k = 1; k <= 2; k++) {
            this.drawPile.push({
              id: `flip_${lColor}_${dColor}_${num}_${k}`,
              lightSide: { color: lColor, value: num, type: 'number' },
              darkSide: { color: dColor, value: num, type: 'number' }
            });
          }
        });

        // Action Cards (2 per color)
        // Light: skip, reverse, draw1, flip
        // Dark: skip_all, reverse, draw5, flip
        for (let k = 1; k <= 2; k++) {
          this.drawPile.push({
            id: `flip_action_skip_${lColor}_${k}`,
            lightSide: { color: lColor, value: 'skip', type: 'skip' },
            darkSide: { color: dColor, value: 'skip_all', type: 'skip_all' }
          });
          this.drawPile.push({
            id: `flip_action_rev_${lColor}_${k}`,
            lightSide: { color: lColor, value: 'reverse', type: 'reverse' },
            darkSide: { color: dColor, value: 'reverse', type: 'reverse' }
          });
          this.drawPile.push({
            id: `flip_action_draw_${lColor}_${k}`,
            lightSide: { color: lColor, value: 'draw1', type: 'draw1' },
            darkSide: { color: dColor, value: 'draw5', type: 'draw5' }
          });
          this.drawPile.push({
            id: `flip_action_flip_${lColor}_${k}`,
            lightSide: { color: lColor, value: 'flip', type: 'flip' },
            darkSide: { color: dColor, value: 'flip', type: 'flip' }
          });
        }
      }

      // 4 Wild Cards per side
      for (let i = 1; i <= 4; i++) {
        this.drawPile.push({
          id: `flip_wild_${i}`,
          lightSide: { color: 'wild', value: 'wild', type: 'wild' },
          darkSide: { color: 'wild', value: 'wild', type: 'wild' }
        });
        this.drawPile.push({
          id: `flip_wild_draw_${i}`,
          lightSide: { color: 'wild', value: 'draw2', type: 'draw2' },
          darkSide: { color: 'wild', value: 'draw_color', type: 'draw_color' }
        });
      }
    } else {
      // Classic 108 card deck
      LIGHT_COLORS.forEach(color => {
        this.drawPile.push({
          id: `${color}_0_0`,
          lightSide: { color, value: '0', type: 'number' },
          darkSide: { color, value: '0', type: 'number' }
        });

        NUMBERS.forEach(num => {
          this.drawPile.push({
            id: `${color}_${num}_1`,
            lightSide: { color, value: num, type: 'number' },
            darkSide: { color, value: num, type: 'number' }
          });
          this.drawPile.push({
            id: `${color}_${num}_2`,
            lightSide: { color, value: num, type: 'number' },
            darkSide: { color, value: num, type: 'number' }
          });
        });

        ['skip', 'reverse', 'draw2'].forEach(action => {
          this.drawPile.push({
            id: `${color}_${action}_1`,
            lightSide: { color, value: action, type: action },
            darkSide: { color, value: action, type: action }
          });
          this.drawPile.push({
            id: `${color}_${action}_2`,
            lightSide: { color, value: action, type: action },
            darkSide: { color, value: action, type: action }
          });
        });
      });

      for (let i = 1; i <= 4; i++) {
        this.drawPile.push({
          id: `wild_${i}`,
          lightSide: { color: 'wild', value: 'wild', type: 'wild' },
          darkSide: { color: 'wild', value: 'wild', type: 'wild' }
        });
        this.drawPile.push({
          id: `wild_draw4_${i}`,
          lightSide: { color: 'wild', value: 'draw4', type: 'draw4' },
          darkSide: { color: 'wild', value: 'draw4', type: 'draw4' }
        });
      }
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
    this.activeSide = 'light';
    
    // Deal starting hand cards
    const dealCount = Math.min(this.startingHandSize, Math.floor((this.drawPile.length - 10) / this.players.length));
    this.players.forEach(p => {
      p.hand = this.drawCardsFromPile(dealCount);
      p.hasCalledUno = false;
    });

    // Initial discard card (ensure number card)
    let initialCard = this.drawCardsFromPile(1)[0];
    while (initialCard.lightSide.type !== 'number') {
      this.drawPile.push(initialCard);
      this.shuffle(this.drawPile);
      initialCard = this.drawCardsFromPile(1)[0];
    }

    this.discardPile.push(initialCard);
    this.currentColor = initialCard.lightSide.color;
    this.lastAction = `Match started! Top card is ${initialCard.lightSide.color.toUpperCase()} ${initialCard.lightSide.value}`;
    this.turnStartTime = Date.now();

    return this.getState();
  }

  drawCardsFromPile(count) {
    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length <= 1) break;
        
        const topDiscard = this.discardPile.pop();
        this.drawPile = this.discardPile;
        this.discardPile = [topDiscard];
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
    this.turnStartTime = Date.now();
  }

  getCardFace(card) {
    if (!card) return null;
    if (this.activeSide === 'dark') {
      return card.darkSide || card.lightSide || card;
    }
    return card.lightSide || card;
  }

  canPlayCard(card) {
    const cardFace = this.getCardFace(card);
    const topCardFace = this.getCardFace(this.discardPile[this.discardPile.length - 1]);

    if (!cardFace) return false;
    if (cardFace.color === 'wild' || cardFace.type === 'wild' || cardFace.type === 'draw2' || cardFace.type === 'draw4' || cardFace.type === 'draw_color') {
      return true;
    }

    return cardFace.color === this.currentColor || (topCardFace && cardFace.value === topCardFace.value);
  }

  playCard(playerId, cardId, chosenColor = null) {
    if (this.status !== 'PLAYING') return { success: false, error: 'Game not in progress' };

    const player = this.getCurrentPlayer();
    if (player.id !== playerId) return { success: false, error: 'Not your turn' };

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return { success: false, error: 'Card not in hand' };

    const card = player.hand[cardIndex];
    const cardFace = this.getCardFace(card);

    if (!this.canPlayCard(card)) return { success: false, error: 'Invalid card play' };

    if ((cardFace.color === 'wild' || cardFace.type === 'wild' || cardFace.type === 'draw2' || cardFace.type === 'draw4' || cardFace.type === 'draw_color') && !chosenColor) {
      return { success: false, error: 'Must select a color for wild card' };
    }

    // Remove from hand and push to discard
    player.hand.splice(cardIndex, 1);
    this.discardPile.push(card);

    if (cardFace.color === 'wild' || cardFace.type === 'wild' || cardFace.type === 'draw2' || cardFace.type === 'draw4' || cardFace.type === 'draw_color') {
      this.currentColor = chosenColor;
    } else {
      this.currentColor = cardFace.color;
    }

    this.lastAction = `${player.name} played ${cardFace.color.toUpperCase()} ${cardFace.value.toUpperCase()}`;

    // UNO call reset check
    if (player.hand.length !== 1) {
      player.hasCalledUno = false;
    }

    // Check Victory
    if (player.hand.length === 0) {
      this.status = 'FINISHED';
      this.winner = player;
      this.lastAction = `🎉 ${player.name} won the UNO match!`;
      return { success: true, state: this.getState() };
    }

    // Handle Actions
    if (cardFace.type === 'flip') {
      // TOGGLE FLIP SIDE
      this.activeSide = this.activeSide === 'light' ? 'dark' : 'light';
      if (this.activeSide === 'dark') {
        this.currentColor = COLOR_MAP_LIGHT_TO_DARK[this.currentColor] || 'pink';
      } else {
        this.currentColor = COLOR_MAP_DARK_TO_LIGHT[this.currentColor] || 'red';
      }
      this.lastAction += ` — 🔄 EVERYTHING FLIPPED TO THE ${this.activeSide.toUpperCase()} SIDE!`;
      this.advanceTurn(1);
    } else if (cardFace.type === 'skip') {
      this.lastAction += ` — Skip applied!`;
      this.advanceTurn(2);
    } else if (cardFace.type === 'skip_all') {
      this.lastAction += ` — ⊘ Everyone skipped! Extra turn for ${player.name}`;
      // Turn stays with player (0 step advance)
      this.turnStartTime = Date.now();
    } else if (cardFace.type === 'reverse') {
      this.direction *= -1;
      this.lastAction += ` — Direction reversed!`;
      if (this.players.length === 2) this.advanceTurn(2);
      else this.advanceTurn(1);
    } else if (cardFace.type === 'draw1') {
      this.advanceTurn(1);
      const target = this.getCurrentPlayer();
      target.hand.push(...this.drawCardsFromPile(1));
      this.lastAction += ` — ${target.name} drew 1 card and was skipped!`;
      this.advanceTurn(1);
    } else if (cardFace.type === 'draw2') {
      this.advanceTurn(1);
      const target = this.getCurrentPlayer();
      target.hand.push(...this.drawCardsFromPile(2));
      this.lastAction += ` — ${target.name} drew 2 cards and was skipped!`;
      this.advanceTurn(1);
    } else if (cardFace.type === 'draw4') {
      this.advanceTurn(1);
      const target = this.getCurrentPlayer();
      target.hand.push(...this.drawCardsFromPile(4));
      this.lastAction += ` — ${target.name} drew 4 cards and was skipped!`;
      this.advanceTurn(1);
    } else if (cardFace.type === 'draw5') {
      this.advanceTurn(1);
      const target = this.getCurrentPlayer();
      target.hand.push(...this.drawCardsFromPile(5));
      this.lastAction += ` — 💥 ${target.name} drew 5 cards and was skipped!`;
      this.advanceTurn(1);
    } else if (cardFace.type === 'draw_color') {
      this.advanceTurn(1);
      const target = this.getCurrentPlayer();
      let count = 0;
      let drawnCard = null;
      do {
        const d = this.drawCardsFromPile(1);
        if (d.length === 0) break;
        drawnCard = d[0];
        target.hand.push(drawnCard);
        count++;
      } while (this.getCardFace(drawnCard).color !== chosenColor && count < 10);
      this.lastAction += ` — 🎨 ${target.name} drew ${count} cards until matching ${chosenColor.toUpperCase()}!`;
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

  checkTurnTimer() {
    if (this.status !== 'PLAYING') return false;

    const elapsedSeconds = (Date.now() - this.turnStartTime) / 1000;
    if (elapsedSeconds >= this.turnTimerDuration) {
      // Auto draw & pass turn
      const player = this.getCurrentPlayer();
      const drawn = this.drawCardsFromPile(1);
      if (drawn.length > 0) player.hand.push(drawn[0]);
      this.lastAction = `⏱️ ${player.name}'s turn timed out (auto-drew card).`;
      this.advanceTurn(1);
      return true;
    }
    return false;
  }

  getState(forPlayerId = null) {
    const topCardRaw = this.discardPile[this.discardPile.length - 1] || null;
    const topCard = topCardRaw ? {
      id: topCardRaw.id,
      lightSide: topCardRaw.lightSide,
      darkSide: topCardRaw.darkSide,
      activeFace: this.getCardFace(topCardRaw)
    } : null;

    return {
      mode: this.mode,
      status: this.status,
      activeSide: this.activeSide,
      currentTurnPlayerId: this.getCurrentPlayer().id,
      direction: this.direction,
      currentColor: this.currentColor,
      topDiscardCard: topCard,
      drawPileCount: this.drawPile.length,
      discardPileCount: this.discardPile.length,
      lastAction: this.lastAction,
      turnStartTime: this.turnStartTime,
      turnTimerDuration: this.turnTimerDuration,
      startingHandSize: this.startingHandSize,
      winner: this.winner ? { id: this.winner.id, name: this.winner.name } : null,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        cardCount: p.hand.length,
        hasCalledUno: p.hasCalledUno,
        hand: forPlayerId === null || forPlayerId === p.id ? p.hand.map(c => ({
          id: c.id,
          lightSide: c.lightSide,
          darkSide: c.darkSide,
          activeFace: this.getCardFace(c)
        })) : []
      }))
    };
  }
}
