import React, { useState } from 'react';
import { Heart } from 'lucide-react';

const FavoritesPage = ({ favorites, setFavorites }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const handleAddFavorite = () => {
    const newGame = {
      id: Date.now(),
      name: 'New Board Game',
      tags: ['Strategy', 'Family'],
      time: '45 min',
      players: '2-4 player',
      image: 'https://via.placeholder.com/150x100/6b7280/white?text=New+Game'
    };
    setFavorites(prev => [...prev, newGame]);
  };

  return (
    <div style={{ padding: '40px 60px', position: 'relative' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '40px', color: '#333' }}>Favorites</h1>
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '24px',
        marginTop: '20px',
        marginBottom: '40px'
      }}>
        {favorites.map((game) => (
          <a
            key={game.id}
            href="#"
            onClick={(e) => e.preventDefault()}
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
              transform: hoveredCard === game.id ? 'translateY(-8px)' : 'translateY(0)'
            }}
            onMouseEnter={() => setHoveredCard(game.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '15px'
            }}>
              <div style={{
                display: 'flex',
                padding: '0 0 10px 0',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                {game.name}
              </div>
              
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                marginBottom: '10px'
              }}>
                {game.tags.map((tag, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'linear-gradient(to right, rgba(87, 236, 223, 0.575), #ccfae3, #ccf6fa)',
                      color: '#0095FF',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      margin: '2px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex',
                padding: '5px 0',
                color: '#0303039c',
                fontSize: '14px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{ marginRight: '5px', fontSize: '14px' }}>⏰</div>
                  {game.time}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '15px'
                }}>
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
          </a>
        ))}
      </div>

      <div style={{ 
        textAlign: 'center',
        padding: '60px 20px',
        color: '#666'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <Heart size={48} color="#ccc" />
        </div>
        <p style={{ marginBottom: '16px' }}>Add more board games to your favorites!</p>
        <button 
          onClick={handleAddFavorite}
          style={{
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            marginTop: '16px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#7c3aed'}
        >
          Add New Game
        </button>
      </div>
    </div>
  );
};

export default FavoritesPage;