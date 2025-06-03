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

// Update a specific game state
export const updateGameState = (gameId, updates) => {
  const user = getUserFromToken();
  if (!user) return null;
  
  console.log('Preparing to update game state:', { gameId, updates });

  try {
    const currentStates = getUserGameStates();
    const newStates = {
      ...currentStates,
      [gameId]: {
        ...currentStates[gameId],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    };
    
    saveUserGameStates(newStates);
    return newStates;
  } catch (error) {
    console.error('Error updating game state:', error);
    return null;
  }
};

// Toggle like status for a game
export const toggleGameLike = (gameId) => {
  const user = getUserFromToken();
  if (!user) return null;
  
  try {
    const currentStates = getUserGameStates();
    const currentLikeStatus = currentStates[gameId]?.isLiked || false;
    const newStates = updateGameState(gameId, { isLiked: !currentLikeStatus });
    
    // Track the activity
    if (typeof window !== 'undefined') {
      const { trackGameLike } = require('./userActivity');
      trackGameLike(gameId, !currentLikeStatus);
    }
    
    return newStates;
  } catch (error) {
    console.error('Error toggling game like:', error);
    return null;
  }
};

// Toggle favorite status for a game
export const toggleGameFavorite = (gameId) => {
  const user = getUserFromToken();
  if (!user) return null;
  
  try {
    const currentStates = getUserGameStates();
    const currentFavoriteStatus = currentStates[gameId]?.isFavorite || false;
    const newStates = updateGameState(gameId, { isFavorite: !currentFavoriteStatus });
    
    // Update favorites list in localStorage
    const allGames = JSON.parse(localStorage.getItem('allGames')) || [];
    const favoriteGames = allGames.filter(game => {
      const gameId = game.id || `game_${allGames.indexOf(game)}`;
      return newStates[gameId]?.isFavorite;
    });
    localStorage.setItem('favoriteGames', JSON.stringify(favoriteGames));
    
    // Track the activity
    if (typeof window !== 'undefined') {
      const { trackGameFavorite } = require('./userActivity');
      trackGameFavorite(gameId, !currentFavoriteStatus);
    }
    
    return newStates;
  } catch (error) {
    console.error('Error toggling game favorite:', error);
    return null;
  }
};

// Get user's favorite games
export const getUserFavorites = () => {
  const user = getUserFromToken();
  if (!user) return [];
  
  try {
    const allGames = JSON.parse(localStorage.getItem('allGames')) || [];
    const userGameStates = getUserGameStates();
    
    return allGames.filter(game => {
      const gameId = game.id || `game_${allGames.indexOf(game)}`;
      return userGameStates[gameId]?.isFavorite;
    });
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
};

// Get like status for a game
export const getGameLikeStatus = (gameId) => {
  const user = getUserFromToken();
  if (!user) return false;
  
  try {
    const userGameStates = getUserGameStates();
    return userGameStates[gameId]?.isLiked || false;
  } catch (error) {
    console.error('Error getting game like status:', error);
    return false;
  }
};

// Get favorite status for a game
export const getGameFavoriteStatus = (gameId) => {
  const user = getUserFromToken();
  if (!user) return false;
  
  try {
    const userGameStates = getUserGameStates();
    return userGameStates[gameId]?.isFavorite || false;
  } catch (error) {
    console.error('Error getting game favorite status:', error);
    return false;
  }
}; 