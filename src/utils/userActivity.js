// User Activity Tracking Service
import { getUserFromToken } from './auth';

// Activity types
export const ActivityType = {
  VIEW_GAME_START: 'VIEW_GAME_START',
  VIEW_GAME_END: 'VIEW_GAME_END',
  LIKE_GAME: 'LIKE_GAME',
  FAVORITE_GAME: 'FAVORITE_GAME',
  RATE_GAME: 'RATE_GAME',
  SEARCH_GAME: 'SEARCH_GAME',
  FILTER_GAME: 'FILTER_GAME'
};

// Debounce timers
const debounceTimers = {};

// Get user ID from token
const getUserId = () => {
  const user = getUserFromToken();
  if (!user || !user.id) {
    // console.log('⚠️ No user ID found in token'); // Suppress frequent logging
    return null;
  }
  return user.id;
};

// Generate unique session ID
const generateSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Initialize activity tracking
export const initActivityTracking = () => {
  console.log('🔄 Initializing activity tracking... (Debounced/Immediate Mode)');
  
  const userId = getUserId();
  if (userId) {
    console.log('👤 User ID:', userId);
    generateSessionId(); // Ensure session ID is generated
    console.log('🔑 Session ID:', localStorage.getItem('sessionId'));
  }
  
  // Check if the backend API URL is configured
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error('❌ NEXT_PUBLIC_API_URL environment variable is not set. Activity tracking disabled.');
    console.error('Please set NEXT_PUBLIC_API_URL to your Go Backend URL.');
  } else {
    console.log('📡 Activity tracking enabled. Sending to:', process.env.NEXT_PUBLIC_API_URL);
  }

  console.log('✅ Activity tracking initialized.');
};

// Send a single activity immediately
const sendActivityImmediately = async (type, data) => {
  const token = localStorage.getItem('token');
  const userId = getUserId();
  const sessionId = generateSessionId();
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!backendUrl) {
    // Error message already shown during initialization
    return;
  }

  if (!token || !userId) {
    console.log('⚠️ User not logged in or invalid token, activity not sent immediately:', { type, data });
    return;
  }

  const activity = {
    type,
    data,
    timestamp: new Date().toISOString(),
    userId,
    sessionId
  };

  try {
    const response = await fetch(`${backendUrl}/user/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      // Send a single activity object
      body: JSON.stringify(activity)
    });

    if (!response.ok) {
      console.error('❌ Failed to send activity immediately:', {
        status: response.status,
        type,
        userId
      });
      // For immediate sends, we typically don't retry automatically unless critical.
      // Logging the error is usually sufficient.
      // throw new Error('Failed to send activity immediately'); // Removed throw to prevent uncaught promise warning
    }

    console.log('✅ Activity sent immediately successfully:', { type, userId });
  } catch (error) {
    console.error('❌ Error sending activity immediately:', {
      error,
      type,
      userId
    });
  }
};

// Debounce and send activity after a delay
const debounceSendActivity = (key, delay, type, data) => {
  const userId = getUserId();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!backendUrl || !userId) {
     // Error message shown during initialization or user not logged in
     return;
  }

  // Clear existing timer for this key
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
  }

  console.log(`⏳ Debouncing activity '${type}' for ${delay / 1000}s (Key: ${key})`, { data, userId });

  // Set a new timer
  debounceTimers[key] = setTimeout(() => {
    console.log(`⏰ Debounce finished for '${type}' (Key: ${key}), sending activity.`);
    sendActivityImmediately(type, data);
    delete debounceTimers[key]; // Clean up the timer reference
  }, delay);
};

// Track game view duration (Send Both START and END Only on Exit)
export const trackGameView = (gameId) => {
  const userId = getUserId();
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!backendUrl || !userId) return { stop: () => {} }; // Don't track if not logged in or URL not set

  const startTimestamp = new Date().toISOString();

  // Return stop function
  return {
    stop: () => {
      const userId = getUserId(); // Re-check userId on stop
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;

       if (!backendUrl || !userId) {
        console.log('⚠️ User not logged in or URL not set on exit, view data not sent.');
        return; // Don't send if user logged out or URL not set
      }

      const endTimestamp = new Date().toISOString();
      const duration = Math.floor((new Date(endTimestamp) - new Date(startTimestamp)) / 1000);

      console.log('⏱️ Game view ended - Sending both START and END:', {
        gameId,
        userId,
        startTimestamp,
        endTimestamp,
        duration: `${duration}s`
      });

      // Send VIEW_GAME_START when exiting the page (with original start time)
      sendActivityImmediately(ActivityType.VIEW_GAME_START, {
        gameId,
        startTimestamp
      });

      // Send VIEW_GAME_END when exiting the page
      sendActivityImmediately(ActivityType.VIEW_GAME_END, {
        gameId,
        startTimestamp,
        endTimestamp,
        duration
      });
    }
  };
};

// Helper functions for specific activities (Debounced Send)
const LIKE_FAV_RATING_DELAY = 10000; // 10 seconds
const SEARCH_FILTER_DELAY = 5000; // 5 seconds

export const trackGameLike = (gameId, isLiked) => {
  console.log(`👍 Tracking LIKE_GAME for game ${gameId}: ${isLiked}`);
  // Use gameId as key for debounce to track per-game actions
  const key = `gameAction_${gameId}`;
  // Debounce sending the LIKE_GAME activity for this game.
  // Note: This sends only the LIKE state after debounce. If you need combined
  // state (like, fav, rating) after any of these actions, more complex state
  // management within the debounce is needed.
  debounceSendActivity(key, LIKE_FAV_RATING_DELAY, ActivityType.LIKE_GAME, { gameId, isLiked });
};

export const trackGameFavorite = (gameId, isFavorite) => {
  console.log(`⭐ Tracking FAVORITE_GAME for game ${gameId}: ${isFavorite}`);
  const key = `gameAction_${gameId}`;
  debounceSendActivity(key, LIKE_FAV_RATING_DELAY, ActivityType.FAVORITE_GAME, { gameId, isFavorite });
};

export const trackGameRating = (gameId, rating) => {
  console.log(`🌟 Tracking RATE_GAME for game ${gameId}: ${rating}`);
  const key = `gameAction_${gameId}`;
  debounceSendActivity(key, LIKE_FAV_RATING_DELAY, ActivityType.RATE_GAME, { gameId, rating });
};

// These will use the debounced sending mechanism
export const trackGameSearch = (searchQuery) => {
  const key = 'search'; // Use a single key for search debounce
  debounceSendActivity(key, SEARCH_FILTER_DELAY, ActivityType.SEARCH_GAME, { searchQuery });
};

export const trackGameFilter = (filters) => {
  const key = 'filter'; // Use a single key for filter debounce
  debounceSendActivity(key, SEARCH_FILTER_DELAY, ActivityType.FILTER_GAME, { filters });
};