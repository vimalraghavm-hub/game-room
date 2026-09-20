/**
 * Snake & Ladder AI decision helper
 * Automatically rolls dice on AI turn after natural delay.
 */
export function getSnakeLadderAiDelay(difficulty = 'Normal') {
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
