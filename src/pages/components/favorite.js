import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  // ✅ ถ้าคุณยังใช้ localStorage:
  const loadFavoritesFromStorage = () => {
    try {
      const token = localStorage.getItem('token');
      
      // ถ้าไม่มี token (ไม่ได้ login) ให้ล้างค่า favorites ทั้งหมด
      if (!token) {
        localStorage.removeItem('gameStates');
        localStorage.removeItem('favoriteGames');
        return [];
      }
      
      const favoriteGames = localStorage.getItem('favoriteGames');
      if (favoriteGames) {
        return JSON.parse(favoriteGames);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
    return [];
  };

  // ✅ ถ้าคุณจะใช้ API ในอนาคต (ยังไม่เปิดใช้งาน)
  /*
  const loadFavoritesFromAPI = async () => {
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${yourTokenHere}` // เพิ่ม token ถ้าจำเป็น
        }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites from API:', error);
    }
  };
  */

  // ✅ ลบเกมจาก localStorage
  const removeFavorite = (gameId) => {
    try {
      const gameStates = JSON.parse(localStorage.getItem('gameStates') || '{}');
      if (gameStates[gameId]) {
        gameStates[gameId].isFavorite = false;
        localStorage.setItem('gameStates', JSON.stringify(gameStates));
      }

      const updatedFavorites = favorites.filter(game => game.id !== gameId);
      setFavorites(updatedFavorites);
      localStorage.setItem('favoriteGames', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  // ✅ ถ้าใช้ API แทน (ยังไม่เปิดใช้งาน)
  /*
  const removeFavorite = async (gameId) => {
    try {
      const response = await fetch(`/api/favorites/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${yourTokenHere}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete favorite');
      setFavorites(prev => prev.filter(game => game.id !== gameId));
    } catch (error) {
      console.error('Error removing favorite from API:', error);
    }
  };
  */

  useEffect(() => {
    const loadedFavorites = loadFavoritesFromStorage(); // ✅ ยังใช้ localStorage
    setFavorites(loadedFavorites);

    // ✅ หากใช้ API ให้เปลี่ยนเป็น:
    // loadFavoritesFromAPI();

    const interval = setInterval(() => {
      const currentFavorites = loadFavoritesFromStorage();
      setFavorites(currentFavorites);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '40px 60px', position: 'relative' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '40px', color: '#333' }}>
        Favorites ({favorites.length})
      </h1>

      {favorites.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
          marginTop: '20px',
          marginBottom: '40px'
        }}>
          {favorites.map((game) => (
            <div
              key={game.id}
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
                boxShadow: hoveredCard === game.id ? '0px 5px 15px 9px rgba(0, 0, 0, 0.15)' : '0px 3px 5px 0px rgba(0, 0, 0, 0.35)',
                textDecoration: 'none',
                transform: hoveredCard === game.id ? 'translateY(-8px)' : 'translateY(0)',
                position: 'relative'
              }}
              onMouseEnter={() => setHoveredCard(game.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <button
                onClick={() => removeFavorite(game.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: '#ff4444',
                  transition: 'all 0.2s ease',
                  zIndex: 2
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#ff4444';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                  e.target.style.color = '#ff4444';
                }}
                title="Remove from favorites"
              >
                ×
              </button>

              <div style={{ position: 'relative', overflow: 'hidden', padding: '15px' }}>
                <div style={{ display: 'flex', paddingBottom: '10px', fontSize: '18px', fontWeight: '600' }}>
                  {game.name}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {game.tags && game.tags.map((tag, index) => (
                    <div key={index} style={{
                      background: 'linear-gradient(to right, rgba(87, 236, 223, 0.575), #ccfae3, #ccf6fa)',
                      color: '#0095FF',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      margin: '2px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {tag}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', padding: '5px 0', color: '#0303039c', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginRight: '5px', fontSize: '14px' }}>⏰</div>
                    {game.duration || game.time}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: '15px' }}>
                    <div style={{ marginRight: '5px', fontSize: '14px' }}>👥</div>
                    {game.players}
                  </div>
                </div>
              </div>

              <div>
                <img 
                  src={game.image}
                  alt={game.name}
                  style={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '16/11',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                    transform: hoveredCard === game.id ? 'scale(1.04)' : 'scale(1)'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <div style={{ marginBottom: '16px' }}>
            <Heart size={48} color="#ccc" />
          </div>
          <p style={{ marginBottom: '16px', fontSize: '18px' }}>
            No favorite games yet!
          </p>
          <p style={{ marginBottom: '16px' }}>
            Go back to the game list and click the bookmark icon to add games to your favorites.
          </p>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;