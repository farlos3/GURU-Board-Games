import { getUserFromToken } from './auth';

// Get user-specific game states
export const getUserGameStates = () => {
  const user = getUserFromToken();
  if (!user) return {};
  
  try {
    const allGameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
    return allGameStates[user.id] || {};
  } catch (error) {
    console.error('Error loading user game states:', error);
    return {};
  }
};

// Save user-specific game states
export const saveUserGameStates = (gameStates) => {
  const user = getUserFromToken();
  if (!user) return;
  
  try {
    const allGameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
    allGameStates[user.id] = gameStates;
    localStorage.setItem('gameStates', JSON.stringify(allGameStates));
  } catch (error) {
    console.error('Error saving user game states:', error);
  }
};

// Get user's favorite games
export const getUserFavorites = () => {
  const user = getUserFromToken();
  if (!user) return [];
  
  try {
    const allGames = JSON.parse(localStorage.getItem('allGames')) || [];
    const userGameStates = getUserGameStates();
    
    return allGames.filter(game => userGameStates[game.id]?.isFavorite);
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
};

// Update a specific game state
export const updateGameState = (gameId, updates) => {
  const user = getUserFromToken();
  if (!user) return;
  
  const currentStates = getUserGameStates();
  const newStates = {
    ...currentStates,
    [gameId]: {
      ...currentStates[gameId],
      ...updates
    }
  };
  
  saveUserGameStates(newStates);
  return newStates;
}; 