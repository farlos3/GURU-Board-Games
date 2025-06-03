import React, { useState, useEffect } from "react";
import Nav from "../components/Navbar";
import styles from "../../styles/game.module.css";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getToken } from '../../utils/auth';
import { getUserGameStates } from '../../utils/gameStates';
import { trackGameView, trackGameLike, trackGameFavorite, trackGameRating } from '../../utils/userActivity';
import LoginPopup from '../components/LoginPopup';

function GameDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [currentGame, setCurrentGame] = useState(null);
  const [similarGames, setSimilarGames] = useState([]);
  
  // State สำหรับเก็บข้อมูล favorites, hearts และ ratings ของแต่ละเกม
  const [gameStates, setGameStates] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันสำหรับโหลดข้อมูลจาก localStorage
  const loadGameStatesFromStorage = () => {
    try {
      const token = localStorage.getItem('token');
      const savedStates = localStorage.getItem('gameStates');
      
      // ถ้าไม่มี token (ไม่ได้ login) ให้ล้างค่า states ทั้งหมด
      if (!token) {
        localStorage.removeItem('gameStates');
        localStorage.removeItem('favoriteGames');
        return {};
      }
      
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
    if (!id) return;
    
    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = getToken();
        
        const headers = {'Content-Type': 'application/json'};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgames/${id}`, {
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch game data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched game data:', data);

        setCurrentGame(data);

        // Initialize game state for the current game from fetched data
        setGameStates(prev => ({
          ...prev,
          [id]: {
            isFavorite: data.favoritedByCurrentUser || false,
            isLiked: data.likedByCurrentUser || false,
            userRating: data.currentUserRating || 0
          }
        }));

        // Note: Similar games logic needs to be updated to fetch from API as well if needed
        // For now, similarGames state will remain empty.
        setSimilarGames([]);

      } catch (error) {
        console.error('Error fetching game data:', error);
        setError('Failed to load game data. Please try again later.');
        setCurrentGame(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();

  }, [id]);

  // บันทึกข้อมูลลง localStorage ทุกครั้งที่ gameStates เปลี่ยน
  useEffect(() => {
    if (Object.keys(gameStates).length > 0) {
      saveGameStatesToStorage(gameStates);
    }
  }, [gameStates]);

  // Function to send state update to backend API
  const sendGameStateUpdate = async (gameId, updateData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Cannot send state update, user not logged in.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/games/updateState`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gameId, updateData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send state update:', errorData);
      } else {
        console.log('State update sent successfully:', { gameId, updateData });
      }
    } catch (error) {
      console.error('Error sending state update:', error);
    }
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ favorite
  const handleToggleFavorite = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage('Please log in to add favorites');
      setShowLoginPopup(true);
      return;
    }
    
    const newStates = toggleGameFavorite(gameId);
    if (newStates) {
      setGameStates(prev => {
        const updatedGameStates = {
          ...prev,
          [gameId]: {
            ...prev[gameId],
            isFavorite: !prev[gameId]?.isFavorite
          }
        };
        // Send update to backend
        sendGameStateUpdate(gameId, { isFavorite: updatedGameStates[gameId].isFavorite });
        return updatedGameStates;
      });
    }
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ heart
  const handleToggleLike = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage('Please log in to like games');
      setShowLoginPopup(true);
      return;
    }
    
    const newStates = toggleGameLike(gameId);
    if (newStates) {
      setGameStates(prev => {
        const updatedGameStates = {
          ...prev,
          [gameId]: {
            ...prev[gameId],
            isLiked: !prev[gameId]?.isLiked
          }
        };
        // Send update to backend
        sendGameStateUpdate(gameId, { isLiked: updatedGameStates[gameId].isLiked });
        return updatedGameStates;
      });
    }
  };

  // ฟังก์ชันสำหรับให้คะแนนดาว (รองรับครึ่งดาว)
  const handleStarClick = (gameId, rating, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage('Please log in to rate games');
      setShowLoginPopup(true);
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
      
      // Send update to backend
      sendGameStateUpdate(gameId, { userRating: rating });

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
    if (isLoading) {
      return (
        <>
          <Nav />
          <div>Loading game details...</div>
        </>
      );
    }
    if (error) {
      return (
        <>
          <Nav />
          <div>Error loading game details: {error.message}</div>
        </>
      );
    }
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
              <h1>{currentGame.title}</h1>

              {/* ปุ่ม Heart, Favorite และ Star Rating สำหรับเกมปัจจุบัน */}
              <div className={styles.rating_buttons}>
                <button 
                  className={`${styles.heart_button} ${gameStates[id]?.isLiked ? styles.heart_active : ''}`}
                  onClick={(e) => handleToggleLike(id, e)}
                  title={gameStates[id]?.isLiked ? "Unlike" : "Like"}
                >
                  {gameStates[id]?.isLiked ? "💖" : "🤍"}
                </button>
                
                <button 
                  className={`${styles.favorite_button} ${gameStates[id]?.isFavorite ? styles.favorite_active : ''}`}
                  onClick={(e) => handleToggleFavorite(id, e)}
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
                {currentGame.description}
              </div>

              <div className={styles.B_player_play_time}>
                <div className={styles.B_player}>
                  <div>Player</div>
                  {currentGame.min_players === currentGame.max_players
                    ? `${currentGame.min_players}`
                    : `${currentGame.min_players}-${currentGame.max_players}`}
                </div>
                <div className={styles.B_play_time}>
                  <div>Play Time</div>
                  {currentGame.play_time_min === currentGame.play_time_max 
                    ? `${currentGame.play_time_min} mins` 
                    : `${currentGame.play_time_min}-${currentGame.play_time_max} mins`}
                </div>
              </div>
              <div className={styles.B_Categories}>
                <div>Categories</div>
                <div className={styles.item_game_text_Categories}>
                  <div className={styles.item_game_tag_B_Categories}>
                    {Array.isArray(currentGame.categories) ? (
                      currentGame.categories.map((tag, index) => (
                        <div key={index} className={styles.item_game_tag_Categories}>
                          {tag}
                        </div>
                      ))
                    ) : currentGame.categories ? (
                       <div className={styles.item_game_tag_Categories}>
                         {currentGame.categories}
                       </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.B_Similar_games}>
          <div className={styles.text_Similar_games}>Similar Games You Might Enjoy</div>
          <div className={styles.show_game_all}>
            {similarGames.length === 0 && !isLoading && !error ? (
              <div>No similar games found.</div>
            ) : (
              similarGames.map((game, idx) => {
                const gameId = game.id;
                return (
                  <Link key={gameId} href={`/game/${gameId}`}>
                    <div
                      className={styles.item_game}
                      data-aos="fade-up"
                      data-aos-anchor-placement="top-bottom"
                    >
                      <div className={styles.item_game_text}>
                        <div className={styles.name_game}>{game.title}</div>

                        {/* ปุ่ม Heart, Favorite และ Star Rating สำหรับเกมที่คล้ายกัน */}
                        <div className={styles.rating_buttons}>
                          <button 
                            className={`${styles.heart_button} ${gameStates[gameId]?.isLiked ? styles.heart_active : ''}`}
                            onClick={(e) => handleToggleLike(gameId, e)}
                            title={gameStates[gameId]?.isLiked ? "Unlike" : "Like"}
                          >
                            {gameStates[gameId]?.isLiked ? "💖" : "🤍"}
                          </button>
                          
                          <button 
                            className={`${styles.favorite_button} ${gameStates[gameId]?.isFavorite ? styles.favorite_active : ''}`}
                            onClick={(e) => handleToggleFavorite(gameId, e)}
                            title={gameStates[gameId]?.isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            <svg 
                              className={styles.bookmark_icon} 
                              viewBox="0 0 24 24" 
                              fill={gameStates[gameId]?.isFavorite ? "currentColor" : "none"}
                              stroke="currentColor"
                            >
                              <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" strokeWidth="2"/>
                            </svg>
                            {gameStates[gameId]?.isFavorite ? "Saved" : "Save"}
                          </button>
                        </div>

                        <div className={styles.stars}>
                          {renderStars(gameId)}
                        </div>

                        <div className={styles.item_game_tag_B}>
                          {Array.isArray(game.categories) ? (
                            game.categories.map((tag, tagIndex) => (
                              <div key={tagIndex} className={styles.item_game_tag}>
                                {tag}
                              </div>
                            ))
                          ) : game.categories ? (
                             <div className={styles.item_game_tag}>
                               {game.categories}
                             </div>
                          ) : null}
                        </div>

                        <div className={styles.B_item_game_player}>
                          <div className={styles.item_game_player_1}>
                            <img src="/clock-five.png" alt="clock" />
                            {game.play_time_min === game.play_time_max 
                              ? `${game.play_time_min} mins` 
                              : `${game.play_time_min}-${game.play_time_max} mins`}
                          </div>
                          <div className={styles.item_game_player_2}>
                            <img src="/users (1).png" alt="users" />
                            {game.min_players === game.max_players
                              ? `${game.min_players} players`
                              : `${game.min_players}-${game.max_players} players`}
                          </div>
                        </div>
                      </div>

                      <div>
                        <img src={game.image_url} alt={game.title} />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
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
      <LoginPopup 
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message={loginMessage}
      />
    </>
  );
}

export default GameDetail;