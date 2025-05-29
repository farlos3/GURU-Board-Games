import React, { useState, useEffect } from 'react';
import { Heart, Clock, Users } from 'lucide-react';
import styles from '/src/styles/Favorites.module.css';

function Favorites({ favorites, setFavorites }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  const defaultBoardGames = [
    {
      id: 1,
      name: 'Werewolf',
      tags: ['Family', 'Party', 'Strategy'],
      time: '35 min',
      players: '3-4 player',
      image: 'item_2.png' // Replace with your actual image path
    },
    {
      id: 2,
      name: 'Catan',
      tags: ['Strategy', 'Trading', 'Building'],
      time: '60 min',
      players: '3-4 player',
      image: 'item_2.png' // Replace with your actual image path
    },
    {
      id: 3,
      name: 'Azul',
      tags: ['Family', 'Tile Placement', 'Abstract'],
      time: '45 min',
      players: '2-4 player',
      image: 'item_2.png' // Replace with your actual image path
    },
    {
      id: 4,
      name: 'Wingspan',
      tags: ['Strategy', 'Engine Building', 'Nature'],
      time: '70 min',
      players: '1-5 player',
      image: 'item_2.png' // Replace with your actual image path
    },
    {
      id: 5,
      name: 'Ticket to Ride',
      tags: ['Family', 'Route Building', 'Collection'],
      time: '60 min',
      players: '2-5 player',
      image: 'item_2.png' // Replace with your actual image path
    },
    {
      id: 6,
      name: 'Splendor',
      tags: ['Strategy', 'Engine Building', 'Renaissance'],
      time: '30 min',
      players: '2-4 player',
      image: 'item_2.png' // Replace with your actual image path
    }
  ];

  // Initialize favorites if empty
  useEffect(() => {
    if (favorites.length === 0) {
      setFavorites(defaultBoardGames);
    }
  }, [favorites, setFavorites]);

  const handleAddFavorite = () => {
    const newGame = {
      id: Date.now(),
      name: 'New Board Game',
      tags: ['Strategy', 'Family'],
      time: '45 min',
      players: '2-4 player',
      image: 'item_2.png'
    };
    setFavorites(prev => [...prev, newGame]);
  };

  return (
    <div className={styles.favoritesPage}>
      <h1 className={styles.title}>Favorites</h1>
      
      <div className={styles.favoritesContainer}>
        {favorites.map((game) => (
          <a
            key={game.id}
            className={`${styles.item_game} ${hoveredCard === game.id ? styles.hovered : ''}`}
            onMouseEnter={() => setHoveredCard(game.id)}
            onMouseLeave={() => setHoveredCard(null)}
            href="#"
            onClick={(e) => e.preventDefault()}
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>{game.name}</div>
              
              <div className={styles.item_game_tag_B}>
                {game.tags.map((tag, index) => (
                  <div key={index} className={styles.item_game_tag}>
                    {tag}
                  </div>
                ))}
              </div>

              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" alt="Time" />
                  {game.time}
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" alt="Players" />
                  {game.players}
                </div>
              </div>
            </div>

            <div>
              <img src={game.image} alt={game.name} />
            </div>
          </a>
        ))}
      </div>

      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <Heart size={48} color="#ccc" />
        </div>
        <p>Add more board games to your favorites!</p>
        <button 
          className={styles.addFavoriteButton}
          onClick={handleAddFavorite}
        >
          Add New Game
        </button>
      </div>
    </div>
  );
}

export default Favorites;