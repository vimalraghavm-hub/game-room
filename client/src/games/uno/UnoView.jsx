import React, { useEffect } from 'react';
import UnoBoard from './UnoBoard';
import { useSocket } from '../../context/SocketContext';
import confetti from 'canvas-confetti';

export const UnoView = ({ roomState }) => {
  const { gameState, socket, playUnoCard, drawUnoCard, callUno } = useSocket();

  useEffect(() => {
    if (gameState?.status === 'FINISHED' && gameState?.winner) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [gameState?.status, gameState?.winner]);

  const handlePlayCard = async (cardId, chosenColor) => {
    try {
      await playUnoCard(cardId, chosenColor);
    } catch (err) {
      console.error('Play card error:', err);
    }
  };

  const handleDrawCard = async () => {
    try {
      await drawUnoCard();
    } catch (err) {
      console.error('Draw card error:', err);
    }
  };

  const handleCallUno = async () => {
    try {
      await callUno();
    } catch (err) {
      console.error('Call UNO error:', err);
    }
  };

  return (
    <div className="w-full flex justify-center py-4">
      <UnoBoard
        gameState={gameState}
        myPlayerId={socket?.id}
        onPlayCard={handlePlayCard}
        onDrawCard={handleDrawCard}
        onCallUno={handleCallUno}
      />
    </div>
  );
};
