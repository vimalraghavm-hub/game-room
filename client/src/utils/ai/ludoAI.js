/**
 * Ludo AI Decision Engine
 * Supports Easy, Normal, and Hard difficulty heuristics.
 */

// Helper to calculate global board index from step
function getGlobalPosition(playerIndex, step) {
  if (step < 0 || step > 51) return null;
  const START_OFFSETS = [0, 13, 26, 39];
  return (START_OFFSETS[playerIndex] + step) % 52;
}

const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

export function chooseLudoMove(validMoves, gameState, playerIndex, roll, difficulty = 'Normal') {
  if (!validMoves || validMoves.length === 0) return null;
  if (validMoves.length === 1) return validMoves[0];

  if (difficulty === 'Easy') {
    // Pick random valid move
    const randIdx = Math.floor(Math.random() * validMoves.length);
    return validMoves[randIdx];
  }

  const playerTokens = gameState.players[playerIndex].tokens;
  const opponents = gameState.players.filter((_, idx) => idx !== playerIndex);

  const moveScores = validMoves.map(tokenIndex => {
    let score = 0;
    const currentStep = playerTokens[tokenIndex];
    const newStep = currentStep === -1 ? 0 : currentStep + roll;

    // 1. Reaching home
    if (newStep === 56) {
      score += 400;
    }

    // 2. Exiting yard
    if (currentStep === -1 && newStep === 0) {
      score += 300;
    }

    // 3. Capturing opponent
    if (newStep >= 0 && newStep <= 51) {
      const newGlobalPos = getGlobalPosition(playerIndex, newStep);
      const isSafe = SAFE_SQUARES.includes(newGlobalPos);

      if (!isSafe) {
        opponents.forEach(opp => {
          opp.tokens.forEach(oppStep => {
            if (oppStep >= 0 && oppStep <= 51) {
              const oppGlobalPos = getGlobalPosition(opp.colorIndex, oppStep);
              if (oppGlobalPos === newGlobalPos) {
                score += difficulty === 'Hard' ? 500 : 350;
              }
            }
          });
        });
      }

      // Safe star placement bonus
      if (isSafe && difficulty === 'Hard') {
        score += 150;
      }
    }

    // 4. Moving closest to home vs farthest
    if (difficulty === 'Hard') {
      score += newStep * 3; // Bonus for pushing leading token
    } else {
      score += newStep;
    }

    return { tokenIndex, score };
  });

  moveScores.sort((a, b) => b.score - a.score);
  return moveScores[0].tokenIndex;
}

export function getLudoAiDelay(difficulty = 'Normal') {
  switch (difficulty) {
    case 'Easy':
      return 1200;
    case 'Hard':
      return 600;
    case 'Normal':
    default:
      return 900;
  }
}
