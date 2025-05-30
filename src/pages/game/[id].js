import React, { useState, useEffect } from "react";
import Nav from "../components/Navbar";
import styles from "../../styles/game.module.css";
import Link from 'next/link';
import { useRouter } from 'next/router';
import games from '../testjoson.json';
import { trackGameView, trackGameLike, trackGameFavorite, trackGameRating } from '../../utils/userActivity';

function GameDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [currentGame, setCurrentGame] = useState(null);
  const [similarGames, setSimilarGames] = useState([]);
  
  // State สำหรับเก็บข้อมูล favorites, hearts และ ratings ของแต่ละเกม
  const [gameStates, setGameStates] = useState({});
  const [hoverRating, setHoverRating] = useState({});

  // ฟังก์ชันสำหรับโหลดข้อมูลจาก localStorage
  const loadGameStatesFromStorage = () => {
    try {
      const savedStates = localStorage.getItem('gameStates');
      if (savedStates) {
        return JSON.parse(savedStates);
      }
    } catch (error) {
      console.error('Error loading game states from localStorage:', error);
    }
    return {};
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูลลง localStorage
  const saveGameStatesToStorage = (states) => {
    try {
      localStorage.setItem('gameStates', JSON.stringify(states));
    } catch (error) {
      console.error('Error saving game states to localStorage:', error);
    }
  };

  useEffect(() => {
    if (id && games[id]) {
      const game = games[id];
      setCurrentGame(game);
      
      // Start tracking game view
      const viewTracker = trackGameView(id);
      
      // หาเกมที่คล้ายกัน (เกมที่มี tag เหมือนกัน แต่ไม่ใช่เกมปัจจุบัน)
      const similar = games.filter((g, index) => 
        index != id && 
        g.tags.some(tag => game.tags.includes(tag))
      ).slice(0, 4);
      
      setSimilarGames(similar);

      // โหลดข้อมูลจาก localStorage
      const savedStates = loadGameStatesFromStorage();
      
      // Initialize game states
      const initialStates = {};
      
      // เกมปัจจุบัน
      initialStates[id] = {
        isFavorite: savedStates[id]?.isFavorite || false,
        isLiked: savedStates[id]?.isLiked || false,
        userRating: savedStates[id]?.userRating || 0
      };

      // เกมที่คล้ายกัน
      similar.forEach((game) => {
        const gameIndex = games.findIndex(g => g.name === game.name);
        initialStates[gameIndex] = {
          isFavorite: savedStates[gameIndex]?.isFavorite || false,
          isLiked: savedStates[gameIndex]?.isLiked || false,
          userRating: savedStates[gameIndex]?.userRating || 0
        };
      });
      
      setGameStates(initialStates);

      // Cleanup function to stop tracking when component unmounts
      return () => {
        viewTracker.stop();
      };
    }
  }, [id]);

  // บันทึกข้อมูลลง localStorage ทุกครั้งที่ gameStates เปลี่ยน
  useEffect(() => {
    if (Object.keys(gameStates).length > 0) {
      saveGameStatesToStorage(gameStates);
    }
  }, [gameStates]);

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ favorite
  const toggleFavorite = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add favorites');
      return;
    }
    
    setGameStates(prev => {
      const newState = {
        ...prev,
        [gameId]: {
          ...prev[gameId],
          isFavorite: !prev[gameId]?.isFavorite
        }
      };
      
      // Track the favorite action
      trackGameFavorite(gameId, newState[gameId].isFavorite);
      
      return newState;
    });
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ heart
  const toggleHeart = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to like games');
      return;
    }
    
    setGameStates(prev => {
      const newState = {
        ...prev,
        [gameId]: {
          ...prev[gameId],
          isLiked: !prev[gameId]?.isLiked
        }
      };
      
      // Track the like action
      trackGameLike(gameId, newState[gameId].isLiked);
      
      return newState;
    });
  };

  // ฟังก์ชันสำหรับให้คะแนนดาว (รองรับครึ่งดาว)
  const handleStarClick = (gameId, rating, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to rate games');
      return;
    }
    
    setGameStates(prev => {
      const newState = {
        ...prev,
        [gameId]: {
          ...prev[gameId],
          userRating: rating
        }
      };
      
      // Track the rating action
      trackGameRating(gameId, rating);
      
      return newState;
    });
  };

  // ฟังก์ชันสำหรับ hover effect บนดาว
  const handleStarHover = (gameIndex, rating) => {
    setHoverRating(prev => ({
      ...prev,
      [gameIndex]: rating
    }));
  };

  const handleStarLeave = (gameIndex) => {
    setHoverRating(prev => ({
      ...prev,
      [gameIndex]: null
    }));
  };

  // คำนวณตำแหน่งของเมาส์เพื่อกำหนดครึ่งดาว
  const getStarRating = (e, starIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const halfWidth = width / 2;
    
    if (x <= halfWidth) {
      return starIndex - 0.5;
    } else {
      return starIndex;
    }
  };

  // ฟังก์ชันสำหรับแสดงดาว (รองรับครึ่งดาว)
  const renderStars = (gameIndex) => {
    const currentRating = hoverRating[gameIndex] !== null && hoverRating[gameIndex] !== undefined 
      ? hoverRating[gameIndex] 
      : (gameStates[gameIndex]?.userRating || 0);
    
    return [1, 2, 3, 4, 5].map((star) => {
      const isFullStar = currentRating >= star;
      const isHalfStar = currentRating >= star - 0.5 && currentRating < star;
      
      return (
        <div 
          key={star} 
          className={styles.starContainer}
          onMouseLeave={() => handleStarLeave(gameIndex)}
          onMouseMove={(e) => {
            const rating = getStarRating(e, star);
            handleStarHover(gameIndex, rating);
          }}
          onClick={(e) => {
            const rating = getStarRating(e, star);
            handleStarClick(gameIndex, rating, e);
          }}
        >
          <div className={styles.starWrapper}>
            {/* Background star (empty) */}
            <span className={`${styles.star} ${styles.starBackground}`}>
              ★
            </span>
            
            {/* Foreground star (filled) */}
            <span 
              className={`${styles.star} ${styles.starForeground}`}
              style={{
                clipPath: isFullStar 
                  ? 'inset(0 0 0 0)' 
                  : isHalfStar 
                    ? 'inset(0 50% 0 0)' 
                    : 'inset(0 100% 0 0)'
              }}
            >
              ★
            </span>
          </div>
          
          {/* Hover indicator */}
          <div className={styles.starHoverIndicator}></div>
        </div>
      );
    });
  };

  if (!currentGame) {
    return (
      <>
        <Nav />
        <div>Loading...</div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div>
        <div className={styles.tag_back}> </div>
        <div className={styles.B_PhotoGame_details}>
          <div className={styles.B_PhotoGame}>
            <img src={`/${currentGame.image}`} alt={currentGame.name} />
          </div>
          <div className={styles.B_B_details}>
            <div className={styles.B_details}>
              <h1>{currentGame.name}</h1>

              {/* ปุ่ม Heart, Favorite และ Star Rating สำหรับเกมปัจจุบัน */}
              <div className={styles.rating_buttons}>
                <button 
                  className={`${styles.heart_button} ${gameStates[id]?.isLiked ? styles.heart_active : ''}`}
                  onClick={(e) => toggleHeart(id, e)}
                  title={gameStates[id]?.isLiked ? "Unlike" : "Like"}
                >
                  {gameStates[id]?.isLiked ? "💖" : "🤍"}
                </button>
                
                <button 
                  className={`${styles.favorite_button} ${gameStates[id]?.isFavorite ? styles.favorite_active : ''}`}
                  onClick={(e) => toggleFavorite(id, e)}
                  title={gameStates[id]?.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <svg 
                    className={styles.bookmark_icon} 
                    viewBox="0 0 24 24" 
                    fill={gameStates[id]?.isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                  >
                    <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" strokeWidth="2"/>
                  </svg>
                  {gameStates[id]?.isFavorite ? "Saved" : "Save"}
                </button>
              </div>

              <div className={styles.stars}>
                {renderStars(id)}
              </div>

              <div className={styles.details_text}>
                {currentGame.description || "Uncover hidden identities and survive the tension-filled nights in this game — a game of deduction, deception, and dramatic reveal. Players take on secret roles, with each night bringing new danger and each day filled with accusations, alliances, and shocking betrayals. Work together to achieve your goal — or blend in and strike from the shadows. With a rotating cast of roles and endless possibilities for bluffing and strategy, no two games are ever the same. Perfect for parties and group gatherings."}
              </div>

              <div className={styles.B_player_play_time}>
                <div className={styles.B_player}>
                  <div>Player</div>
                  {currentGame.players}
                </div>
                <div className={styles.B_play_time}>
                  <div>Play Time</div>
                  {currentGame.duration}
                </div>
              </div>
              <div className={styles.B_Categories}>
                <div>Categories</div>
                <div className={styles.item_game_text_Categories}>
                  <div className={styles.item_game_tag_B_Categories}>
                    {currentGame.tags.map((tag, index) => (
                      <div key={index} className={styles.item_game_tag_Categories}>
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.B_Similar_games}>
          <div className={styles.text_Similar_games}>Similar Games You Might Enjoy</div>
          <div className={styles.show_game_all}>
            {similarGames.map((game, idx) => {
              const gameIndex = games.findIndex(g => g.name === game.name);
              return (
                <Link key={idx} href={`/game/${gameIndex}`}>
                  <div
                    className={styles.item_game}
                    data-aos="fade-up"
                    data-aos-anchor-placement="top-bottom"
                  >
                    <div className={styles.item_game_text}>
                      <div className={styles.name_game}>{game.name}</div>

                      {/* ปุ่ม Heart, Favorite และ Star Rating สำหรับเกมที่คล้ายกัน */}
                      <div className={styles.rating_buttons}>
                        <button 
                          className={`${styles.heart_button} ${gameStates[gameIndex]?.isLiked ? styles.heart_active : ''}`}
                          onClick={(e) => toggleHeart(gameIndex, e)}
                          title={gameStates[gameIndex]?.isLiked ? "Unlike" : "Like"}
                        >
                          {gameStates[gameIndex]?.isLiked ? "💖" : "🤍"}
                        </button>
                        
                        <button 
                          className={`${styles.favorite_button} ${gameStates[gameIndex]?.isFavorite ? styles.favorite_active : ''}`}
                          onClick={(e) => toggleFavorite(gameIndex, e)}
                          title={gameStates[gameIndex]?.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <svg 
                            className={styles.bookmark_icon} 
                            viewBox="0 0 24 24" 
                            fill={gameStates[gameIndex]?.isFavorite ? "currentColor" : "none"}
                            stroke="currentColor"
                          >
                            <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" strokeWidth="2"/>
                          </svg>
                          {gameStates[gameIndex]?.isFavorite ? "Saved" : "Save"}
                        </button>
                      </div>

                      <div className={styles.stars}>
                        {renderStars(gameIndex)}
                      </div>

                      <div className={styles.item_game_tag_B}>
                        {game.tags.map((tag, tagIndex) => (
                          <div key={tagIndex} className={styles.item_game_tag}>
                            {tag}
                          </div>
                        ))}
                      </div>

                      <div className={styles.B_item_game_player}>
                        <div className={styles.item_game_player_1}>
                          <img src="/clock-five.png" alt="clock" />
                          {game.duration}
                        </div>
                        <div className={styles.item_game_player_2}>
                          <img src="/users (1).png" alt="users" />
                          {game.players}
                        </div>
                      </div>
                    </div>

                    <div>
                      <img src={`/${game.image}`} alt={game.name} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className={styles.Footer}>
          <div className={styles.Footer_B1}>
            <div className={styles.Footer_B1_S1}>
              GURU
              <br />
              BOARD
              <br />
              GAME
            </div>
            <div className={styles.Footer_B1_S2}>
              <div>GURU BOARD GAME</div>
              <a>Home</a>
              <a>Search Game</a>
              <a>Game</a>
            </div>
            <div className={styles.Footer_B1_S3}>
              <div>ABOUT US</div>
              <a>Line</a>
              <a>Facebook</a>
              <a>Instagram</a>
            </div>
          </div>
          <div className={styles.Footer_B2}>
            <div className={styles.Footer_B2_box}></div>
            <div className={styles.Footer_B2_text}>
              <div>Gmail : Khawfang@gmail.com</div>
              <div>Contact : 064-457-7169</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default GameDetail;