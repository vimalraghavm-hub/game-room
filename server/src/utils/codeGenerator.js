/**
 * Generate a short random room code (e.g. AB7KQ)
 * @param {number} length 
 * @returns {string}
 */
export function generateRoomCode(length = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded easily confused chars like I, O, 0, 1
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
