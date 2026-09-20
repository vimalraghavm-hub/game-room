/**
 * UNO & UNO FLIP AI Decision Engine
 * Evaluates playable cards across Light and Dark sides for AI turns.
 */

const LIGHT_COLORS = ['red', 'yellow', 'green', 'blue'];
const DARK_COLORS = ['pink', 'teal', 'orange', 'purple'];

export function getCardFace(card, activeSide = 'light') {
  if (!card) return null;
  return activeSide === 'dark' ? (card.darkSide || card.lightSide || card) : (card.lightSide || card);
}

export function canPlayCard(card, currentColor, topDiscardCard, activeSide = 'light') {
  const face = getCardFace(card, activeSide);
  const topFace = topDiscardCard ? getCardFace(topDiscardCard, activeSide) : null;

  if (!face) return false;
  if (face.color === 'wild' || face.type === 'wild' || face.type === 'draw2' || face.type === 'draw4' || face.type === 'draw_color') return true;

  return face.color === currentColor || (topFace && face.value === topFace.value);
}

export function chooseUnoMove(hand, currentColor, topDiscardCard, opponents = [], difficulty = 'Normal', activeSide = 'light') {
  const availableColors = activeSide === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  const playable = hand.filter(card => canPlayCard(card, currentColor, topDiscardCard, activeSide));

  if (playable.length === 0) {
    return { action: 'DRAW' };
  }

  if (difficulty === 'Easy') {
    const card = playable[Math.floor(Math.random() * playable.length)];
    const face = getCardFace(card, activeSide);
    const chosenColor = (face.color === 'wild' || face.type === 'wild' || face.type === 'draw2' || face.type === 'draw4' || face.type === 'draw_color')
      ? availableColors[Math.floor(Math.random() * availableColors.length)]
      : null;
    return { action: 'PLAY', card, chosenColor };
  }

  // Count colors in AI hand for active side
  const colorCounts = {};
  availableColors.forEach(c => colorCounts[c] = 0);
  hand.forEach(c => {
    const face = getCardFace(c, activeSide);
    if (availableColors.includes(face.color)) {
      colorCounts[face.color]++;
    }
  });

  const dominantColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b, availableColors[0]);
  const scaryOpponent = difficulty === 'Hard' && opponents.some(opp => opp.cardCount <= 2);

  let chosenCard = null;

  if (scaryOpponent) {
    // Attack leading player with aggressive action cards (+5, +4, +2, +1, skip_all, skip, flip)
    chosenCard = playable.find(c => getCardFace(c, activeSide).type === 'draw5') ||
                 playable.find(c => getCardFace(c, activeSide).type === 'draw4') ||
                 playable.find(c => getCardFace(c, activeSide).type === 'draw_color') ||
                 playable.find(c => getCardFace(c, activeSide).type === 'draw2') ||
                 playable.find(c => getCardFace(c, activeSide).type === 'draw1') ||
                 playable.find(c => getCardFace(c, activeSide).type === 'skip_all') ||
                 playable.find(c => getCardFace(c, activeSide).type === 'skip') ||
                 playable.find(c => getCardFace(c, activeSide).type === 'flip');
  }

  if (!chosenCard) {
    const nonWildPlayable = playable.filter(c => {
      const f = getCardFace(c, activeSide);
      return f.color !== 'wild' && f.type !== 'wild' && f.type !== 'draw2' && f.type !== 'draw4' && f.type !== 'draw_color';
    });

    if (nonWildPlayable.length > 0) {
      chosenCard = nonWildPlayable.find(c => getCardFace(c, activeSide).color === dominantColor) || nonWildPlayable[0];
    } else {
      chosenCard = playable[0];
    }
  }

  const chosenFace = getCardFace(chosenCard, activeSide);
  const chosenColor = (chosenFace.color === 'wild' || chosenFace.type === 'wild' || chosenFace.type === 'draw2' || chosenFace.type === 'draw4' || chosenFace.type === 'draw_color')
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
