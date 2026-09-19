import supabase from '../config/supabase.js';

export async function saveMatchHistory(room) {
  if (!supabase) {
    console.log('ℹ️ Supabase not configured; skipping persistent match history save.');
    return;
  }

  try {
    const gameState = room.gameInstance.getState();
    const winner = gameState.winner;

    // 1. Insert Game record
    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .insert({
        room_id: null, // Room record might be transient
        game_type: room.gameType,
        winner_id: winner && winner.userId.startsWith('guest_') ? null : (winner ? winner.userId : null),
        duration_seconds: Math.floor((new Date() - room.createdAt) / 1000),
      })
      .select()
      .single();

    if (gameError) {
      console.warn('⚠️ Error inserting game history:', gameError.message);
      return;
    }

    const gameId = gameData.id;

    // 2. Insert Game Players
    const playerInserts = gameState.players
      .filter(p => p.userId && !p.userId.startsWith('guest_'))
      .map(p => ({
        game_id: gameId,
        user_id: p.userId,
        rank: p.rank || 1,
        score: p.position || 0,
      }));

    if (playerInserts.length > 0) {
      await supabase.from('game_players').insert(playerInserts);

      // Update games_played and games_won on profiles
      for (const p of gameState.players) {
        if (p.userId && !p.userId.startsWith('guest_')) {
          const isWinner = winner && winner.userId === p.userId;
          
          // Increment games_played
          await supabase.rpc('increment_games_played', { user_id_param: p.userId }).catch(() => {
            // Fallback to fetch and update if RPC not present
            supabase
              .from('profiles')
              .select('games_played, games_won')
              .eq('id', p.userId)
              .single()
              .then(({ data }) => {
                if (data) {
                  supabase
                    .from('profiles')
                    .update({
                      games_played: (data.games_played || 0) + 1,
                      games_won: (data.games_won || 0) + (isWinner ? 1 : 0),
                    })
                    .eq('id', p.userId);
                }
              });
          });
        }
      }
    }

    console.log(`✅ Saved match history for Game #${gameId}`);
  } catch (err) {
    console.error('❌ Failed to save match history:', err.message);
  }
}
