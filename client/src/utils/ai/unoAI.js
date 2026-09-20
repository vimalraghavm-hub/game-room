/**
 * UNO AI Decision Engine
 * Evaluates playable cards and chooses strategic moves & wild colors.
 */

const COLORS = ['red', 'yellow', 'green', 'blue'];

export function canPlayCard(card, currentColor, topCard) {
  if (!card) return false;
  if (card.color === 'wild' || card.type === 'wild' || card.type === 'draw4') return true;
  return card.color === currentColor || (topCard && card.value === topCard.value);
}

export function chooseUnoMove(hand, currentColor, topDiscardCard, opponents = [], difficulty = 'Normal') {
  const playable = hand.filter(card => canPlayCard(card, currentColor, topDiscardCard));

  if (playable.length === 0) {
    return { action: 'DRAW' };
  }

  if (difficulty === 'Easy') {
    const card = playable[Math.floor(Math.random() * playable.length)];
    const chosenColor = (card.color === 'wild' || card.type === 'wild' || card.type === 'draw4')
      ? COLORS[Math.floor(Math.random() * COLORS.length)]
      : null;
    return { action: 'PLAY', card, chosenColor };
  }

  // Count colors in hand to determine dominant color
  const colorCounts = { red: 0, yellow: 0, green: 0, blue: 0 };
  hand.forEach(c => {
    if (COLORS.includes(c.color)) {
      colorCounts[c.color]++;
    }
  });

  const dominantColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b, 'red');

  // Hard AI: check if any opponent is close to winning (1 or 2 cards)
  const scaryOpponent = difficulty === 'Hard' && opponents.some(opp => opp.cardCount <= 2);

  let chosenCard = null;

  if (scaryOpponent) {
    // Try playing +4, +2, Skip, Reverse first to disrupt leading opponent
    chosenCard = playable.find(c => c.type === 'draw4') ||
                 playable.find(c => c.type === 'draw2') ||
                 playable.find(c => c.type === 'skip') ||
                 playable.find(c => c.type === 'reverse');
  }

  if (!chosenCard) {
    // Prefer non-wild matching color/value over wild cards
    const nonWildPlayable = playable.filter(c => c.color !== 'wild' && c.type !== 'wild' && c.type !== 'draw4');
    
    if (nonWildPlayable.length > 0) {
      // Prefer dominant color in hand
      chosenCard = nonWildPlayable.find(c => c.color === dominantColor) || nonWildPlayable[0];
    } else {
      // Must play Wild
      chosenCard = playable[0];
    }
  }

  const chosenColor = (chosenCard.color === 'wild' || chosenCard.type === 'wild' || chosenCard.type === 'draw4')
    ? dominantColor
    : null;

  return { action: 'PLAY', card: chosenCard, chosenColor };
}

export function getUnoAiDelay(difficulty = 'Normal') {
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
