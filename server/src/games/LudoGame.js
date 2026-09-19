export class LudoGame {
  constructor(options = {}) {
    this.players = []; // [{ id, userId, username, avatar, colorIndex, color, tokens: [-1,-1,-1,-1], isWinner: false }]
    this.currentTurnIndex = 0;
    this.diceValue = null;
    this.hasRolled = false;
    this.validMoves = []; // indices of tokens that can move: [0, 1, 2, 3]
    this.status = 'WAITING'; // WAITING, IN_PROGRESS, FINISHED
    this.winner = null;
    this.rankings = [];
    this.gameLog = [];
    this.turnNumber = 0;
    this.consecutiveSixes = 0;

    // Safe global common track indices
    this.safeSquares = [0, 8, 13, 21, 26, 34, 39, 47];
  }

  init(players) {
    const colors = ['RED', 'GREEN', 'YELLOW', 'BLUE'];
    const colorHexes = ['#EF4444', '#10B981', '#F59E0B', '#3B82F6'];

    this.players = players.map((p, idx) => ({
      id: p.id,
      userId: p.userId,
      username: p.username,
      avatar: p.avatar,
      colorIndex: idx, // 0: Red, 1: Green, 2: Yellow, 3: Blue
      color: colors[idx],
      colorHex: colorHexes[idx],
      tokens: [-1, -1, -1, -1], // -1: Yard, 0: Start, 1..50: Common Track, 51..55: Home Path, 56: Home
      isWinner: false,
      rank: null,
    }));

    this.currentTurnIndex = 0;
    this.status = 'IN_PROGRESS';
    this.hasRolled = false;
    this.validMoves = [];
    this.turnNumber = 1;
    this.consecutiveSixes = 0;

    this.addLog(`Game started! ${this.getCurrentPlayer().username} (${this.getCurrentPlayer().color}) goes first.`);
  }

  getCurrentPlayer() {
    return this.players[this.currentTurnIndex];
  }

  addLog(message) {
    this.gameLog.push({
      id: Date.now() + Math.random(),
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    });
    if (this.gameLog.length > 50) {
      this.gameLog.shift();
    }
  }

  /**
   * Convert token step (0..50) to 52-tile global common track index
   */
  getGlobalTrackIndex(colorIndex, step) {
    if (step < 0 || step > 50) return null;
    const startOffset = colorIndex * 13;
    return (startOffset + step) % 52;
  }

  /**
   * Calculate legal token indices for current player given a dice roll
   */
  getValidMovesForPlayer(player, roll) {
    const valid = [];
    player.tokens.forEach((step, tokenIdx) => {
      if (step === -1) {
        // Token in Yard: Needs a 6 to open to step 0 (Starting square)
        if (roll === 6) valid.push(tokenIdx);
      } else if (step < 56) {
        // Token on board: Check if step + roll <= 56 (Exact home entry at 56)
        if (step + roll <= 56) {
          valid.push(tokenIdx);
        }
      }
    });
    return valid;
  }

  rollDice(playerSocketId) {
    if (this.status !== 'IN_PROGRESS') {
      return { success: false, error: 'Game is not in progress.' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerSocketId) {
      return { success: false, error: 'Not your turn.' };
    }

    if (this.hasRolled) {
      return { success: false, error: 'Already rolled for this turn. Select a token to move.' };
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    this.diceValue = roll;
    this.hasRolled = true;

    if (roll === 6) {
      this.consecutiveSixes++;
    } else {
      this.consecutiveSixes = 0;
    }

    // 3 consecutive 6s penalty: Turn forfeited
    if (this.consecutiveSixes === 3) {
      this.addLog(`${currentPlayer.username} rolled three consecutive 6s! Turn forfeited.`);
      this.hasRolled = false;
      this.validMoves = [];
      this.consecutiveSixes = 0;
      this.advanceTurn();
      return {
        success: true,
        roll,
        validMoves: [],
        turnForfeited: true,
        currentPlayer: this.getCurrentPlayer(),
      };
    }

    const validMoves = this.getValidMovesForPlayer(currentPlayer, roll);
    this.validMoves = validMoves;

    this.addLog(`${currentPlayer.username} rolled a ${roll}. (${validMoves.length} possible move${validMoves.length === 1 ? '' : 's'})`);

    // Auto pass turn if no legal moves possible
    if (validMoves.length === 0) {
      this.hasRolled = false;
      this.advanceTurn();
      return {
        success: true,
        roll,
        validMoves: [],
        autoPass: true,
        currentPlayer: this.getCurrentPlayer(),
      };
    }

    return {
      success: true,
      roll,
      validMoves,
      currentPlayer,
    };
  }

  moveToken(playerSocketId, tokenIndex) {
    if (this.status !== 'IN_PROGRESS') {
      return { success: false, error: 'Game is not in progress.' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerSocketId) {
      return { success: false, error: 'Not your turn.' };
    }

    if (!this.hasRolled) {
      return { success: false, error: 'Roll the dice first.' };
    }

    if (!this.validMoves.includes(tokenIndex)) {
      return { success: false, error: 'Invalid token move.' };
    }

    const currentStep = currentPlayer.tokens[tokenIndex];
    let newStep = currentStep;
    const roll = this.diceValue;

    if (currentStep === -1) {
      // Opening token onto board
      newStep = 0;
      this.addLog(`${currentPlayer.username} opened token #${tokenIndex + 1} onto the board! 🚪`);
    } else {
      newStep = currentStep + roll;
      this.addLog(`${currentPlayer.username} moved token #${tokenIndex + 1} to step ${newStep}.`);
    }

    currentPlayer.tokens[tokenIndex] = newStep;

    let captured = null;

    // Check Capture if landing on common track step (0..50)
    if (newStep >= 0 && newStep <= 50) {
      const globalSquare = this.getGlobalTrackIndex(currentPlayer.colorIndex, newStep);
      const isSafe = this.safeSquares.includes(globalSquare);

      if (!isSafe) {
        // Check opponent tokens on same global common track square
        this.players.forEach(opp => {
          if (opp.colorIndex !== currentPlayer.colorIndex) {
            opp.tokens.forEach((oppStep, oppTokenIdx) => {
              if (oppStep >= 0 && oppStep <= 50) {
                const oppGlobalSquare = this.getGlobalTrackIndex(opp.colorIndex, oppStep);
                if (oppGlobalSquare === globalSquare) {
                  // Capture opponent token!
                  opp.tokens[oppTokenIdx] = -1; // Sent back to yard
                  captured = {
                    opponent: opp.username,
                    color: opp.color,
                    tokenIndex: oppTokenIdx,
                  };
                  this.addLog(`💥 ${currentPlayer.username} CAPTURED ${opp.username}'s ${opp.color} token! Sent back to yard!`);
                }
              }
            });
          }
        });
      }
    }

    // Check if token reached Home (56)
    let tokenFinished = false;
    if (newStep === 56) {
      tokenFinished = true;
      this.addLog(`🎯 ${currentPlayer.username}'s token #${tokenIndex + 1} REACHED HOME!`);
    }

    // Check Win Condition (All 4 tokens reached Home at 56)
    const allHome = currentPlayer.tokens.every(t => t === 56);
    if (allHome && !currentPlayer.isWinner) {
      currentPlayer.isWinner = true;
      currentPlayer.rank = this.rankings.length + 1;
      this.rankings.push(currentPlayer);

      if (!this.winner) {
        this.winner = currentPlayer;
        this.addLog(`🏆 ${currentPlayer.username} WON THE LUDO MATCH! 🎉`);
      }

      // Check if match is finished
      const remainingActive = this.players.filter(p => !p.isWinner);
      if (remainingActive.length <= 1) {
        this.status = 'FINISHED';
        if (remainingActive.length === 1) {
          remainingActive[0].rank = this.rankings.length + 1;
          this.rankings.push(remainingActive[0]);
        }
      }
    }

    // Determine Extra Turn
    // Player gets extra turn if: rolled 6 OR captured opponent token OR token reached home
    const getsExtraTurn = (roll === 6 || captured !== null || tokenFinished) && !currentPlayer.isWinner && this.status === 'IN_PROGRESS';

    this.hasRolled = false;
    this.validMoves = [];

    if (getsExtraTurn) {
      let reason = 'rolling a 6';
      if (captured) reason = 'capturing an opponent token';
      else if (tokenFinished) reason = 'bringing a token home';
      this.addLog(`🎲 ${currentPlayer.username} gets an extra turn for ${reason}!`);
    } else {
      this.advanceTurn();
    }

    this.turnNumber++;

    return {
      success: true,
      movedTokenIndex: tokenIndex,
      newStep,
      captured,
      getsExtraTurn,
      currentPlayer: this.getCurrentPlayer(),
      status: this.status,
      winner: this.winner,
    };
  }

  advanceTurn() {
    if (this.status !== 'IN_PROGRESS') return;
    this.hasRolled = false;
    this.validMoves = [];
    this.consecutiveSixes = 0;

    const initialTurn = this.currentTurnIndex;
    let nextTurn = (this.currentTurnIndex + 1) % this.players.length;

    while (this.players[nextTurn].isWinner && nextTurn !== initialTurn) {
      nextTurn = (nextTurn + 1) % this.players.length;
    }

    this.currentTurnIndex = nextTurn;
  }

  getState() {
    return {
      gameType: 'LUDO',
      status: this.status,
      players: this.players,
      currentTurnIndex: this.currentTurnIndex,
      currentPlayer: this.getCurrentPlayer(),
      diceValue: this.diceValue,
      hasRolled: this.hasRolled,
      validMoves: this.validMoves,
      winner: this.winner,
      rankings: this.rankings,
      turnNumber: this.turnNumber,
      gameLog: this.gameLog,
      safeSquares: this.safeSquares,
    };
  }
}
