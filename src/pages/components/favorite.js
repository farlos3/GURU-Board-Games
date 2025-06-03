import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { getToken, getUserFromToken } from '../../utils/auth';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle removing a favorite game via API
  const removeFavorite = async (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();
    if (!token || !user) {
      console.error('Cannot remove favorite, user not logged in.');
      return;
    }

    const originalFavorites = favorites;
    setFavorites(favorites.filter(game => game.boardgame_id !== gameId));

    try {
      console.log(`Attempting to remove favorite game with ID: ${gameId} for user: ${user.id}`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/removeFavorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id, game_id: gameId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to remove favorite: ${response.status} ${response.statusText}`);
      }

      console.log(`Successfully removed favorite game with ID: ${gameId}`);

    } catch (error) {
      console.error('Error removing favorite:', error);
      setError(error.message || 'Failed to remove favorite.');
      setFavorites(originalFavorites);
    }
  };

  // Effect to get user from token on mount
  useEffect(() => {
    const token = getToken();
    const currentUser = getUserFromToken(token);
    if (currentUser) {
      setUser(currentUser);
    } else {
      setIsLoading(false);
      setError("Please log in to view your favorite games.");
      setFavorites([]);
    }
  }, []);

  // Effect to fetch favorite games from API when user is available
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        setFavorites([]);
        return;
      }

      try {
        const userId = user.id;
        console.log(`Fetching favorites for user ID: ${userId}`);
        
        // ✅ Fixed: Updated API endpoint to match your backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/favorites/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch favorites: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched favorites data:', data);

        if (data && Array.isArray(data.favorites)) {
            setFavorites(data.favorites);
        } else {
            console.warn('API response does not contain a valid favorites array:', data);
            setFavorites([]);
        }

      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError(error.message || 'Failed to load favorite games.');
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchFavorites();
    }

  }, [user]);

  // Get responsive grid columns
  const getGridColumns = () => {
    if (isMobile) return '1fr';
    if (window.innerWidth <= 1200) return 'repeat(2, 1fr)';
    return 'repeat(3, 1fr)';
  };

  return (
    <div style={{ 
      padding: isMobile ? '20px 16px' : '40px 60px', 
      position: 'relative',
      maxWidth: '100%'
    }}>
      <h1 style={{ 
        fontSize: isMobile ? '24px' : '32px', 
        fontWeight: 'bold', 
        marginBottom: isMobile ? '24px' : '40px', 
        color: '#333',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        Favorites ({favorites.length})
      </h1>

      {isLoading && (
         <div style={{ textAlign: 'center', padding: '20px' }}>Loading favorite games...</div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error: {error}</div>
      )}

      {!isLoading && !error && favorites.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: getGridColumns(),
          gap: isMobile ? '16px' : '24px',
          marginTop: '20px',
          marginBottom: '40px',
          width: '100%'
        }}>
          {favorites.map((game) => (
            <Link 
              key={game.boardgame_id}
              href={`/game/${game.boardgame_id}`}
              style={{
                width: '100%',
                overflow: 'hidden',
                backgroundColor: 'rgb(252, 252, 252)',
                color: 'black',
                display: 'flex',
                flexDirection: 'column-reverse',
                borderRadius: '8px',
                transition: 'transform 0.3s ease, box-shadow 0.5s ease',
                border: 'solid hsla(0, 0%, 0%, 0.055) 1px',
                boxShadow: hoveredCard === game.boardgame_id ? '0px 5px 15px 9px rgba(0, 0, 0, 0.15)' : '0px 3px 5px 0px rgba(0, 0, 0, 0.35)',
                textDecoration: 'none',
                transform: hoveredCard === game.boardgame_id && !isMobile ? 'translateY(-8px)' : 'translateY(0)',
                position: 'relative'
              }}
              onMouseEnter={() => !isMobile && setHoveredCard(game.boardgame_id)}
              onMouseLeave={() => !isMobile && setHoveredCard(null)}
            >
              <button
                onClick={(e) => removeFavorite(game.boardgame_id, e)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: isMobile ? '32px' : '30px',
                  height: isMobile ? '32px' : '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '20px' : '18px',
                  color: '#ff4444',
                  transition: 'all 0.2s ease',
                  zIndex: 2,
                  touchAction: 'manipulation'
                }}
                onMouseOver={(e) => {
                  if (!isMobile) {
                    e.target.style.background = '#ff4444';
                    e.target.style.color = 'white';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isMobile) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.target.style.color = '#ff4444';
                  }
                }}
                title="Remove from favorites"
              >
                ×
              </button>

              <div style={{ 
                position: 'relative', 
                overflow: 'hidden', 
                padding: isMobile ? '12px' : '15px' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  paddingBottom: '10px', 
                  fontSize: isMobile ? '16px' : '18px', 
                  fontWeight: '600',
                  lineHeight: '1.3'
                }}>
                  {game.title}
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  marginBottom: '10px',
                  gap: '4px'
                }}>
                  {game.categories && game.categories.split(',').map((tag, index) => (
                    <div key={index} style={{
                      background: 'linear-gradient(to right, rgba(87, 236, 223, 0.575), #ccfae3, #ccf6fa)',
                      color: '#0095FF',
                      padding: isMobile ? '4px 8px' : '5px 12px',
                      borderRadius: '20px',
                      margin: '2px',
                      fontSize: isMobile ? '11px' : '12px',
                      fontWeight: '500'
                    }}>
                      {tag.trim()}
                    </div>
                  ))}
                </div>

                {/* ✅ Updated: Enhanced display logic matching your example */}
                <div style={{ 
                  display: 'flex', 
                  padding: '5px 0', 
                  color: '#0303039c', 
                  fontSize: isMobile ? '13px' : '14px',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  gap: isMobile ? '8px' : '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginRight: '5px', fontSize: isMobile ? '13px' : '14px' }}>⏰</div>
                    {game.play_time_min && game.play_time_max ? (
                      game.play_time_min === game.play_time_max
                        ? `${game.play_time_min} mins`
                        : `${game.play_time_min}-${game.play_time_max} mins`
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginRight: '5px', fontSize: isMobile ? '13px' : '14px' }}>👥</div>
                    {game.min_players && game.max_players ? (
                      game.min_players === game.max_players
                        ? `${game.min_players} players`
                        : `${game.min_players}-${game.max_players} players`
                    ) : (
                      'N/A'
                    )}
                  </div>
                </div>

                {/* ✅ Added: Rating display from API response */}
                {game.rating_avg && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '5px 0',
                    color: '#0303039c',
                    fontSize: isMobile ? '13px' : '14px'
                  }}>
                    <div style={{ marginRight: '5px' }}>⭐</div>
                    {game.rating_avg.toFixed(1)} ({game.rating_count} reviews)
                  </div>
                )}
              </div>

              <div>
                <img 
                  src={game.image_url}
                  alt={game.title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '16/11',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                    transform: hoveredCard === game.boardgame_id && !isMobile ? 'scale(1.04)' : 'scale(1)'
                  }}
                  onError={(e) => {
                    e.target.src = '/default-game-image.png';
                  }}
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        !isLoading && !error && (
          <div style={{ 
            textAlign: 'center', 
            padding: isMobile ? '40px 20px' : '60px 20px', 
            color: '#666' 
          }}>
            <div style={{ marginBottom: '16px' }}>
              <Heart size={isMobile ? 40 : 48} color="#ccc" />
            </div>
            <p style={{ 
              marginBottom: '16px', 
              fontSize: isMobile ? '16px' : '18px',
              lineHeight: '1.5'
            }}>
              No favorite games yet!
            </p>
            <p style={{ 
              marginBottom: '16px',
              fontSize: isMobile ? '14px' : '16px',
              lineHeight: '1.5',
              maxWidth: isMobile ? '280px' : '400px',
              margin: '0 auto'
            }}>
              Go back to the game list and click the bookmark icon to add games to your favorites.
            </p>
          </div>
        )
      )}
    </div>
  );
};

export default FavoritesPage;