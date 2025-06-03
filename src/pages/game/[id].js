import React, { useState, useEffect } from "react";
import Nav from "../components/Navbar";
import styles from "../../styles/game.module.css";
import Link from "next/link";
import { useRouter } from "next/router";
import { getToken, getUserFromToken } from '../../utils/auth';
import LoginPopup from '../components/LoginPopup';

function GameDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [currentGame, setCurrentGame] = useState(null);
  const [similarGames, setSimilarGames] = useState([]);

  // State สำหรับเก็บข้อมูล favorites, hearts และ ratings ของแต่ละเกม
  const [gameStates, setGameStates] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  
  // Authentication & UI states
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  
  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ฟังก์ชันสำหรับโหลดข้อมูลจาก localStorage
  const loadGameStatesFromStorage = () => {
    try {
      const token = getToken();
      const savedStates = localStorage.getItem("gameStates");
      
      if (!token) {
        localStorage.removeItem('gameStates');
        localStorage.removeItem('favoriteGames');
        return {};
      }
      
      if (savedStates) {
        // ตรวจสอบว่าเป็น JSON ที่ถูกต้อง
        try {
          return JSON.parse(savedStates);
        } catch (parseError) {
          console.error("Invalid JSON in localStorage:", parseError);
          // ล้างค่าเก่าที่ไม่ถูกต้อง
          localStorage.removeItem('gameStates');
          return {};
        }
      }
    } catch (error) {
      console.error("Error loading game states from localStorage:", error);
    }
    return {};
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูลลง localStorage
  const saveGameStatesToStorage = (states) => {
    try {
      const token = getToken();
      if (token) {
        // ตรวจสอบว่า states เป็น object ที่ถูกต้อง
        if (typeof states === 'object' && states !== null) {
          localStorage.setItem("gameStates", JSON.stringify(states));
          window.dispatchEvent(
            new CustomEvent("gameStatesChanged", { detail: states })
          );
        }
      }
    } catch (error) {
      console.error("Error saving game states to localStorage:", error);
    }
  };

  // ฟังก์ชันสำหรับส่งข้อมูลไป backend
  const syncGameStateToBackend = async (gameId, updateData) => {
    const token = getToken();
    if (!token) {
      console.error('Cannot sync state, user not logged in.');
      return false;
    }

    try {
      // ดึง user_id จาก token
      const user = getUserFromToken(token);
      if (!user) {
        console.error('Cannot get user from token');
        return false;
      }

      // สร้าง payload สำหรับ update game state
      const payload = {
        user_id: user.id,
        game_id: gameId,
        state: {
          is_favorite: updateData.isFavorite,
          is_liked: updateData.isLiked,
          userRating: updateData.userRating || 0
        }
      };

      console.log('Final Payload:', payload);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/updateState`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('=== Error Response from Backend ===');
        console.error('Status:', response.status);
        console.error('Error Data:', errorData);
        return false;
      }

      // อัพเดท localStorage หลังจากส่งข้อมูลสำเร็จ
      const savedStates = JSON.parse(localStorage.getItem('gameStates')) || {};
      const userGameStates = savedStates[token] || {};
      
      const newGameState = {
        ...userGameStates[gameId],
        ...payload.state
      };
      
      const newUserGameStates = {
        ...userGameStates,
        [gameId]: newGameState
      };
      
      const newSavedStates = {
        ...savedStates,
        [token]: newUserGameStates
      };
      
      localStorage.setItem('gameStates', JSON.stringify(newSavedStates));

      console.log('Success Response from Backend: Status:', response.status);
      return true;
    } catch (error) {
      console.error('Error in syncGameStateToBackend');
      console.error('Error:', error);
      return false;
    }
  };

  // เพิ่มฟังก์ชันนี้
  const clearInvalidGameStates = () => {
    try {
      const savedStates = localStorage.getItem("gameStates");
      if (savedStates) {
        try {
          JSON.parse(savedStates);
        } catch (e) {
          localStorage.removeItem('gameStates');
        }
      }
    } catch (error) {
      console.error("Error clearing invalid game states:", error);
    }
  };

  // Main data fetching effect
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

        // Fetch current game data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/boardgames/${id}`, {
          headers: headers,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch game data: ${response.status} ${response.statusText}`);
        }

        const gameData = await response.json();
        console.log('Fetched game data:', gameData);

        setCurrentGame(gameData);

        // โหลดข้อมูลจาก localStorage
        const savedStates = loadGameStatesFromStorage();

        // Initialize game states
        const updatedStates = { ...savedStates };

        // เกมปัจจุบัน - รวมข้อมูลจาก API และ localStorage
        updatedStates[id] = {
          isFavorite: gameData.favoritedByCurrentUser || savedStates[id]?.isFavorite || false,
          isLiked: gameData.likedByCurrentUser || savedStates[id]?.isLiked || false,
          userRating: gameData.currentUserRating || savedStates[id]?.userRating || 0,
        };

        setGameStates(updatedStates);

      } catch (error) {
        console.error('Error fetching game data:', error);
        setError(error.message || 'Failed to load game data. Please try again later.');
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

  // Listen for gameStatesChanged events from other pages
  useEffect(() => {
    const handleGameStatesChange = (event) => {
      setGameStates(event.detail);
    };

    window.addEventListener("gameStatesChanged", handleGameStatesChange);
    return () => {
      window.removeEventListener("gameStatesChanged", handleGameStatesChange);
    };
  }, []);

  // Listen for logout events to clear data
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('gameStates');
      localStorage.removeItem('favoriteGames');
      setGameStates({});
    };

    window.addEventListener("userLoggedOut", handleLogout);
    return () => {
      window.removeEventListener("userLoggedOut", handleLogout);
    };
  }, []);

  // เรียกใช้ใน useEffect
  useEffect(() => {
    clearInvalidGameStates();
  }, []);

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ favorite
  const toggleFavorite = async (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();
    if (!token) {
      setLoginMessage('Please log in to add favorites');
      setShowLoginPopup(true);
      return;
    }

    // ใช้ค่า state จาก React state แทน localStorage
    const currentGameState = gameStates[gameId] || {};
    const newFavoriteState = !currentGameState.isFavorite;
    
    // Update local state immediately for better UX
    setGameStates((prev) => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        isFavorite: newFavoriteState,
        isLiked: currentGameState.isLiked || false
      },
    }));

    // Sync to backend with both states
    const success = await syncGameStateToBackend(gameId, { 
      isFavorite: newFavoriteState,
      isLiked: currentGameState.isLiked || false
    });

    // If backend sync failed, revert the change
    if (!success) {
      setGameStates((prev) => ({
        ...prev,
        [gameId]: {
          ...prev[gameId],
          isFavorite: !newFavoriteState,
          isLiked: currentGameState.isLiked || false
        },
      }));
    }
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ heart
  const toggleHeart = async (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();
    if (!token) {
      setLoginMessage('Please log in to like games');
      setShowLoginPopup(true);
      return;
    }

    // ใช้ค่า state จาก React state แทน localStorage
    const currentGameState = gameStates[gameId] || {};
    const newLikedState = !currentGameState.isLiked;
    
    // Update local state immediately for better UX
    setGameStates((prev) => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        isLiked: newLikedState,
        isFavorite: currentGameState.isFavorite || false
      },
    }));

    // Sync to backend with both states
    const success = await syncGameStateToBackend(gameId, { 
      isLiked: newLikedState,
      isFavorite: currentGameState.isFavorite || false
    });

    // If backend sync failed, revert the change
    if (!success) {
      setGameStates((prev) => ({
        ...prev,
        [gameId]: {
          ...prev[gameId],
          isLiked: !newLikedState,
          isFavorite: currentGameState.isFavorite || false
        },
      }));
    }
  };

  // ฟังก์ชันสำหรับให้คะแนนดาว (รองรับครึ่งดาว)
  const handleStarClick = async (gameId, rating, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = getToken();
    if (!token) {
      setLoginMessage('Please log in to rate games');
      setShowLoginPopup(true);
      return;
    }

    // ใช้ค่า state จาก React state
    const currentGameState = gameStates[gameId] || {};
    const previousRating = currentGameState.userRating || 0;
    
    // Update local state immediately for better UX
    setGameStates((prev) => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        userRating: rating,
        isFavorite: currentGameState.isFavorite || false,
        isLiked: currentGameState.isLiked || false
      },
    }));

    // Sync to backend with all states
    const success = await syncGameStateToBackend(gameId, { 
      userRating: rating,
      isFavorite: currentGameState.isFavorite || false,
      isLiked: currentGameState.isLiked || false
    });

    // If backend sync failed, revert the change
    if (!success) {
      setGameStates((prev) => ({
        ...prev,
        [gameId]: {
          ...prev[gameId],
          userRating: previousRating,
          isFavorite: currentGameState.isFavorite || false,
          isLiked: currentGameState.isLiked || false
        },
      }));
    }
  };

  // ฟังก์ชันสำหรับ hover effect บนดาว
  const handleStarHover = (gameIndex, rating) => {
    setHoverRating((prev) => ({
      ...prev,
      [gameIndex]: rating,
    }));
  };

  const handleStarLeave = (gameIndex) => {
    setHoverRating((prev) => ({
      ...prev,
      [gameIndex]: null,
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
    const currentRating =
      hoverRating[gameIndex] !== null && hoverRating[gameIndex] !== undefined
        ? hoverRating[gameIndex]
        : gameStates[gameIndex]?.userRating || 0;

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
            <span className={`${styles.star} ${styles.starBackground}`}>★</span>

            {/* Foreground star (filled) */}
            <span
              className={`${styles.star} ${styles.starForeground}`}
              style={{
                clipPath: isFullStar
                  ? "inset(0 0 0 0)"
                  : isHalfStar
                  ? "inset(0 50% 0 0)"
                  : "inset(0 100% 0 0)",
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

  // ฟังก์ชันสำหรับแสดงดาวแบบอ่านอย่างเดียว
  const renderStarsReadOnly = (game) => {
    const rating = game.average_rating || game.rating || 0;
    return [1, 2, 3, 4, 5].map((star) => {
      const isFullStar = rating >= star;
      const isHalfStar = rating >= star - 0.5 && rating < star;

      return (
        <div key={star} className={styles.starContainer}>
          <div className={styles.starWrapper}>
            {/* Background star (empty) */}
            <span className={`${styles.star} ${styles.starBackground}`}>★</span>

            {/* Foreground star (filled) */}
            <span
              className={`${styles.star} ${styles.starForeground}`}
              style={{
                clipPath: isFullStar
                  ? "inset(0 0 0 0)"
                  : isHalfStar
                  ? "inset(0 50% 0 0)"
                  : "inset(0 100% 0 0)",
              }}
            >
              ★
            </span>
          </div>
        </div>
      );
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Nav />
        <div className={styles.loading_container}>
          <div className={styles.loading_spinner}></div>
          <div>Loading game details...</div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Nav />
        <div className={styles.error_container}>
          <div className={styles.error_message}>
            <h2>Error Loading Game</h2>
            <p>{error}</p>
            <button 
              className={styles.retry_button}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  // Game not found
  if (!currentGame) {
    return (
      <>
        <Nav />
        <div className={styles.not_found_container}>
          <h2>Game Not Found</h2>
          <p>The game you're looking for doesn't exist.</p>
          <Link href="/">
            <button className={styles.home_button}>Go Home</button>
          </Link>
        </div>
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
            <img 
              src={currentGame.image_url || `/${currentGame.image}`} 
              alt={currentGame.title || currentGame.name}
              onError={(e) => {
                e.target.src = '/default-game-image.png'; // fallback image
              }}
            />
          </div>
          <div className={styles.B_B_details}>
            <div className={styles.B_details}>
              <h1>{currentGame.title || currentGame.name}</h1>
              
              {/* ปุ่ม Heart, Favorite และ Star Rating สำหรับเกมปัจจุบัน */}
              <div className={styles.rating_buttons}>
                <button
                  className={`${styles.heart_button} ${
                    gameStates[id]?.isLiked ? styles.heart_active : ""
                  }`}
                  onClick={(e) => toggleHeart(id, e)}
                  title={gameStates[id]?.isLiked ? "Unlike" : "Like"}
                >
                  {gameStates[id]?.isLiked ? "💖" : "🤍"}
                </button>

                <button
                  className={`${styles.favorite_button} ${
                    gameStates[id]?.isFavorite ? styles.favorite_active : ""
                  }`}
                  onClick={(e) => toggleFavorite(id, e)}
                  title={
                    gameStates[id]?.isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <svg
                    className={styles.bookmark_icon}
                    viewBox="0 0 24 24"
                    fill={gameStates[id]?.isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                  >
                    <path
                      d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z"
                      strokeWidth="2"
                    />
                  </svg>
                  {gameStates[id]?.isFavorite ? "Saved" : "Save"}
                </button>
              </div>

              <div className={styles.details_text}>
                {currentGame.description ||
                  "Uncover hidden identities and survive the tension-filled nights in this game — a game of deduction, deception, and dramatic reveal. Players take on secret roles, with each night bringing new danger and each day filled with accusations, alliances, and shocking betrayals. Work together to achieve your goal — or blend in and strike from the shadows. With a rotating cast of roles and endless possibilities for bluffing and strategy, no two games are ever the same. Perfect for parties and group gatherings."}
              </div>

              <div className={styles.B_HowToPlay}>
                <Link href={`/HowToPlay/${id}`}>
                  <button className={styles.howToPlayButton}>
                    How to Play
                  </button>
                </Link>
              </div>
              
              <div className={styles.B_player_play_time}>
                <div className={styles.B_player}>
                  <div>Player</div>
                  {currentGame.min_players && currentGame.max_players ? (
                    currentGame.min_players === currentGame.max_players
                      ? `${currentGame.min_players}`
                      : `${currentGame.min_players}-${currentGame.max_players}`
                  ) : (
                    currentGame.players || "N/A"
                  )}
                </div>
                <div className={styles.B_play_time}>
                  <div>Play Time</div>
                  {currentGame.play_time_min && currentGame.play_time_max ? (
                    currentGame.play_time_min === currentGame.play_time_max 
                      ? `${currentGame.play_time_min} mins` 
                      : `${currentGame.play_time_min}-${currentGame.play_time_max} mins`
                  ) : (
                    currentGame.duration || "N/A"
                  )}
                </div>
              </div>
              
              <div className={styles.B_Categories}>
                <div>Categories</div>
                <div className={styles.item_game_text_Categories}>
                  <div className={styles.item_game_tag_B_Categories}>
                    {Array.isArray(currentGame.categories) ? (
                      currentGame.categories.map((tag, index) => (
                        <div
                          key={index}
                          className={styles.item_game_tag_Categories}
                        >
                          {tag}
                        </div>
                      ))
                    ) : Array.isArray(currentGame.tags) ? (
                      currentGame.tags.map((tag, index) => (
                        <div
                          key={index}
                          className={styles.item_game_tag_Categories}
                        >
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
              
              {/* เพิ่มส่วน Review หลังจาก Categories */}
              <div className={styles.B_Review}>
                <div>Review</div>
                <div className={styles.review_content}>
                  <div className={styles.stars_large}>{renderStars(id)}</div>
                  <div className={styles.rating_display}>
                    {gameStates[id]?.userRating ? (
                      <span className={styles.rating_text}>
                        Your Rating: {gameStates[id].userRating} / 5 stars
                      </span>
                    ) : (
                      <span className={styles.rating_text_empty}>
                        Click to rate this game
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.B_Similar_games}>
          <div className={styles.text_Similar_games}>
            Similar Games You Might Enjoy
          </div>
          <div className={styles.show_game_all}>
            {similarGames.length === 0 ? (
              <div className={styles.no_similar_games}>
                No similar games found.
              </div>
            ) : (
              similarGames.map((game) => {
                const gameId = game.id;
                return (
                  <Link key={gameId} href={`/game/${gameId}`}>
                    <div
                      className={styles.item_game}
                      data-aos="fade-up"
                      data-aos-anchor-placement="top-bottom"
                    >
                      <div className={styles.item_game_text}>
                        <div className={styles.name_game}>
                          {game.title || game.name}
                        </div>

                        {/* ปุ่ม Heart และ Favorite เหมือนเดิม */}
                        <div className={styles.rating_buttons}>
                          <button
                            className={`${styles.heart_button} ${
                              gameStates[gameId]?.isLiked
                                ? styles.heart_active
                                : ""
                            }`}
                            onClick={(e) => toggleHeart(gameId, e)}
                            title={
                              gameStates[gameId]?.isLiked ? "Unlike" : "Like"
                            }
                          >
                            {gameStates[gameId]?.isLiked ? "💖" : "🤍"}
                          </button>

                          <button
                            className={`${styles.favorite_button} ${
                              gameStates[gameId]?.isFavorite
                                ? styles.favorite_active
                                : ""
                            }`}
                            onClick={(e) => toggleFavorite(gameId, e)}
                            title={
                              gameStates[gameId]?.isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <svg
                              className={styles.bookmark_icon}
                              viewBox="0 0 24 24"
                              fill={
                                gameStates[gameId]?.isFavorite
                                  ? "currentColor"
                                  : "none"
                              }
                              stroke="currentColor"
                            >
                              <path
                                d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z"
                                strokeWidth="2"
                              />
                            </svg>
                            {gameStates[gameId]?.isFavorite ? "Saved" : "Save"}
                          </button>
                        </div>

                        {/* แก้ส่วนดาว - ใช้ renderStarsReadOnly แทน renderStars */}
                        <div className={styles.stars}>
                          {renderStarsReadOnly(game)}
                          <span className={styles.rating_text}>
                            {(game.average_rating || game.rating || 0).toFixed(1)} / 5
                          </span>
                        </div>

                        <div className={styles.item_game_tag_B}>
                          {Array.isArray(game.categories) ? (
                            game.categories.map((tag, tagIndex) => (
                              <div key={tagIndex} className={styles.item_game_tag}>
                                {tag}
                              </div>
                            ))
                          ) : Array.isArray(game.tags) ? (
                            game.tags.map((tag, tagIndex) => (
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
                            {game.play_time_min && game.play_time_max ? (
                              game.play_time_min === game.play_time_max 
                                ? `${game.play_time_min} mins` 
                                : `${game.play_time_min}-${game.play_time_max} mins`
                            ) : (
                              game.duration || "N/A"
                            )}
                          </div>
                          <div className={styles.item_game_player_2}>
                            <img src="/users (1).png" alt="users" />
                            {game.min_players && game.max_players ? (
                              game.min_players === game.max_players
                                ? `${game.min_players}`
                                : `${game.min_players}-${game.max_players}`
                            ) : (
                              game.players || "N/A"
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <img 
                          src={game.image_url || `/${game.image}`} 
                          alt={game.title || game.name}
                          onError={(e) => {
                            e.target.src = '/default-game-image.png';
                          }}
                        />
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
              <Link href="/">Home</Link>
              <Link href="/Search">Search Game</Link>
            </div>
            <div className={styles.Footer_B1_S3}>
              <div>ABOUT US</div>
              <a href="https://line.me">Line</a>
              <a href="https://facebook.com">Facebook</a>
              <a href="https://www.instagram.com/khaw_fang/">Instagram</a>
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