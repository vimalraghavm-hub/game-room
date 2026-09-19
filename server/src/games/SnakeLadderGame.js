export class SnakeLadderGame {
  constructor(options = {}) {
    this.ladders = options.ladders || {
      4: 25,
      13: 46,
      33: 49,
      42: 63,
      50: 69,
      62: 81,
      74: 92,
    };

    this.snakes = options.snakes || {
      99: 54,
      95: 72,
      89: 68,
      64: 36,
      47: 26,
      39: 10,
      23: 5,
    };

    this.players = []; // [{ id, userId, username, avatar, color, position: 0/1, rank: null }]
    this.currentTurnIndex = 0;
    this.diceValue = null;
    this.lastAction = null;
    this.status = 'WAITING'; // WAITING, IN_PROGRESS, FINISHED
    this.winner = null;
    this.rankings = [];
    this.turnNumber = 0;
    this.gameLog = [];
  }

  init(players) {
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B']; // Red, Blue, Green, Yellow
    this.players = players.map((p, idx) => ({
      id: p.id,
      userId: p.userId,
      username: p.username,
      avatar: p.avatar,
      color: p.color || colors[idx % colors.length],
      position: 1, // Start at square 1
      rank: null,
      isWinner: false,
    }));
    this.currentTurnIndex = 0;
    this.status = 'IN_PROGRESS';
    this.turnNumber = 1;
    this.addLog(`Game started! ${this.players[this.currentTurnIndex].username}'s turn.`);
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

  rollDice(playerSocketId) {
    if (this.status !== 'IN_PROGRESS') {
      return { success: false, error: 'Game is not in progress.' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerSocketId) {
      return { success: false, error: 'Not your turn.' };
    }

    // Server generates dice 1-6
    const roll = Math.floor(Math.random() * 6) + 1;
    this.diceValue = roll;

    let eventType = 'MOVE';
    let previousPos = currentPlayer.position;
    let targetPos = previousPos + roll;
    let finalPos = targetPos;
    let snakeOrLadder = null;

    if (targetPos > 100) {
      // Exact roll rule: Cannot move
      eventType = 'BLOCKED';
      this.addLog(`${currentPlayer.username} rolled ${roll}, but needs exact roll to land on 100.`);
    } else {
      // Check for Ladder or Snake
      if (this.ladders[targetPos]) {
        finalPos = this.ladders[targetPos];
        snakeOrLadder = { type: 'LADDER', from: targetPos, to: finalPos };
        this.addLog(`${currentPlayer.username} rolled ${roll} to ${targetPos} and CLIMBED A LADDER to ${finalPos}! 🪜`);
      } else if (this.snakes[targetPos]) {
        finalPos = this.snakes[targetPos];
        snakeOrLadder = { type: 'SNAKE', from: targetPos, to: finalPos };
        this.addLog(`${currentPlayer.username} rolled ${roll} to ${targetPos} and WAS BITTEN BY A SNAKE down to ${finalPos}! 🐍`);
      } else {
        this.addLog(`${currentPlayer.username} rolled ${roll} and moved to ${finalPos}.`);
      }

      currentPlayer.position = finalPos;

      // Check Win Condition
      if (finalPos === 100) {
        currentPlayer.isWinner = true;
        currentPlayer.rank = this.rankings.length + 1;
        this.rankings.push(currentPlayer);

        if (!this.winner) {
          this.winner = currentPlayer;
          this.addLog(`🏆 ${currentPlayer.username} reached 100 and WON THE GAME! 🎉`);
        } else {
          this.addLog(`🏆 ${currentPlayer.username} reached 100 (Rank ${currentPlayer.rank})!`);
        }

        // Check if game is finished (if only 1 active player left or all completed)
        const activePlayers = this.players.filter(p => !p.isWinner);
        if (activePlayers.length <= 1 || this.players.length === 1) {
          this.status = 'FINISHED';
          if (activePlayers.length === 1) {
            activePlayers[0].rank = this.rankings.length + 1;
            this.rankings.push(activePlayers[0]);
          }
        }
      }
    }

    // Determine extra turn rule: Rolling a 6 gives another turn (unless won/finished)
    const getsExtraTurn = roll === 6 && !currentPlayer.isWinner && this.status === 'IN_PROGRESS';
    if (!getsExtraTurn && this.status === 'IN_PROGRESS') {
      this.advanceTurn();
    } else if (getsExtraTurn) {
      this.addLog(`${currentPlayer.username} rolled a 6 and gets another turn! 🎲`);
    }

    this.turnNumber++;

    return {
      success: true,
      roll,
      previousPos,
      targetPos,
      finalPos,
      snakeOrLadder,
      getsExtraTurn,
      currentPlayer,
      status: this.status,
      winner: this.winner,
    };
  }

  advanceTurn() {
    if (this.status !== 'IN_PROGRESS') return;
    const initialTurn = this.currentTurnIndex;
    let nextTurn = (this.currentTurnIndex + 1) % this.players.length;

    // Skip players who have already completed the game
    while (this.players[nextTurn].isWinner && nextTurn !== initialTurn) {
      nextTurn = (nextTurn + 1) % this.players.length;
    }

    this.currentTurnIndex = nextTurn;
  }

  getState() {
    return {
      gameType: 'SNAKE_LADDER',
      status: this.status,
      players: this.players,
      currentTurnIndex: this.currentTurnIndex,
      currentPlayer: this.getCurrentPlayer(),
      diceValue: this.diceValue,
      winner: this.winner,
      rankings: this.rankings,
      snakes: this.snakes,
      ladders: this.ladders,
      turnNumber: this.turnNumber,
      gameLog: this.gameLog,
    };
  }
}
