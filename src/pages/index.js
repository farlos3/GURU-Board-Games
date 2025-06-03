import React, { useEffect, useState, useRef } from "react";
import Nav from "./components/Navbar";
import styles from "/src/styles/index.module.css";

import AOS from "aos";
import "aos/dist/aos.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Link from "next/link";
import LoginPopup from './components/LoginPopup';
import { getUserGameStates, toggleGameLike, toggleGameFavorite, getGameLikeStatus, getGameFavoriteStatus } from '../utils/gameStates';

function GameCard() {
  const [games, setGames] = useState([]);
  const [gameStates, setGameStates] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ใช้ useRef เพื่อ track การเปลี่ยนแปลงและป้องกัน multiple logs
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef(null);

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

  // ฟังก์ชันสำหรับอัพเดตรายการ favorites ใน localStorage
  const updateFavoritesList = (newStates) => {
    try {
      const favoriteGames = games.filter((game) => {
        return newStates[game.id]?.isFavorite;
      }).map(game => ({
        ...game
      }));
      localStorage.setItem('favoriteGames', JSON.stringify(favoriteGames));
    } catch (error) {
      console.error('Error updating favorites list:', error);
    }
  };

  // ฟังก์ชันสำหรับโหลดข้อมูลเกมยอดนิยมจาก API
  const fetchPopularGames = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/popular`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch popular games');
      }
      
      const data = await response.json();
      console.log('Fetched popular games data:', data);
      
      // Corrected to access data.boardgames
      const fetchedGames = data.boardgames || [];
      setGames(fetchedGames);

      // Initialize game states for fetched games
      const initialStates = {};
      fetchedGames.forEach(game => {
        initialStates[game.id] = {
          isFavorite: getGameFavoriteStatus(game.id),
          isLiked: getGameLikeStatus(game.id)
        };
      });
      setGameStates(initialStates);
      updateFavoritesList(initialStates);
      
    } catch (error) {
      console.error('Error fetching popular games:', error);
      setError('Failed to load popular games. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    });

    // Load popular games from API
    fetchPopularGames();

    // Load existing game states from localStorage (This will be updated after fetchPopularGames completes)
    const savedStates = loadGameStatesFromStorage();
    // We don't set initial game states here directly based on savedStates
    // because fetchPopularGames will do it with actual game IDs.
    // The updateFavoritesList call within fetchPopularGames will handle favorites based on new game IDs.
    
    // Mark initial load as complete
    isInitialLoad.current = false;
  }, []); // Empty dependency array means this runs once on mount

  // Use another useEffect to update favorites list when games state is updated after fetching
  useEffect(() => {
    if (games.length > 0) {
      const savedStates = loadGameStatesFromStorage();
      const initialStates = {};
      games.forEach(game => {
        initialStates[game.id] = {
          isFavorite: getGameFavoriteStatus(game.id), // Use getGameFavoriteStatus which reads from localStorage
          isLiked: getGameLikeStatus(game.id) // Use getGameLikeStatus which reads from localStorage
        };
      });
      setGameStates(initialStates);
      updateFavoritesList(initialStates);
    }
  }, [games]); // Run this effect when the 'games' state changes

  // Function to toggle favorite status
  const handleToggleFavorite = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double click
    if (e.detail > 1) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage('Please log in to add favorites');
      setShowLoginPopup(true);
      return;
    }
    
    // toggleGameFavorite updates localStorage and returns the updated state object
    const updatedStates = toggleGameFavorite(gameId);
    if (updatedStates) {
      setGameStates(updatedStates); // Update state with the returned object
      updateFavoritesList(updatedStates); // Update favorites list in localStorage
    }
  };

  // Function to toggle like status
  const handleToggleLike = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double click
    if (e.detail > 1) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage('Please log in to like games');
      setShowLoginPopup(true);
      return;
    }
    
    // toggleGameLike updates localStorage and returns the updated state object
    const updatedStates = toggleGameLike(gameId);
    if (updatedStates) {
      setGameStates(updatedStates); // Update state with the returned object
    }
  };

  // ฟังก์ชันสำหรับให้คะแนนดาว (รองรับครึ่งดาว)
  const handleStarClick = (gameId, rating, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // ป้องกัน double click
    if (e.detail > 1) return;
    
    const token = localStorage.getItem('token');
     if (!token) {
      setLoginMessage('Please log in to rate games');
      setShowLoginPopup(true);
      return;
    }

    // You might want to send this rating to your backend as well
    console.log(`Rated game ${gameId}: ${rating} stars`);

    setGameStates(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        userRating: rating
      }
    }));
    // Note: Saving rating to localStorage is not handled by toggleGameLike/Favorite
    // You would need to implement a separate function or modify updateGameState
    // if you want to persist ratings locally or sync with backend.
    
  };

  // ฟังก์ชันสำหรับ hover effect บนดาว
  const handleStarHover = (gameId, rating) => {
    setHoverRating(prev => ({
      ...prev,
      [gameId]: rating
    }));
  };

  const handleStarLeave = (gameId) => {
    setHoverRating(prev => ({
      ...prev,
      [gameId]: null
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
  const renderStars = (gameId) => {
    const currentRating = hoverRating[gameId] !== null && hoverRating[gameId] !== undefined 
      ? hoverRating[gameId] 
      : (gameStates[gameId]?.userRating || 0);
    
    return [1, 2, 3, 4, 5].map((star) => {
      const isFullStar = currentRating >= star;
      const isHalfStar = currentRating >= star - 0.5 && currentRating < star;
      
      return (
        <div 
          key={star} 
          className={styles.starContainer}
          onMouseLeave={() => handleStarLeave(gameId)}
          onMouseMove={(e) => {
            const rating = getStarRating(e, star);
            handleStarHover(gameId, rating);
          }}
          onClick={(e) => {
            const rating = getStarRating(e, star);
            handleStarClick(gameId, rating, e);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Nav />

      <div className={styles.slider_container}>
        <Swiper
          slidesPerView={1.8}
          centeredSlides={true}
          spaceBetween={5}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          navigation={true}
          pagination={{ clickable: true }}
          modules={[Autoplay, Navigation, Pagination]}
          className="mySwiper"
        >
          {games.map((game) => (
            <SwiperSlide key={game.id}>
              <img src={game.image_url} className={styles.slide_image} title={game.image_url} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className={styles.type_game_B}>
        <a className={styles.type_game}>
          <img src="marisa.jpg" alt="บอร์ดเกม ครอบครัว" />
          <div className={styles.overlay}>
            บอร์ดเกม
            <br />
            ครอบครัว
          </div>
        </a>
        <a className={styles.type_game}>
          <img src="Adventure.png" />
          <div className={styles.overlay}>
            บอร์ดเกม
            <br />
            ผจญภัย
          </div>
        </a>
        <a className={styles.type_game}>
          <img src="2h-media.jpg" />
          <div className={styles.overlay}>
            บอร์ดเกม
            <br />
            ปาร์ตี้
          </div>
        </a>
        <a className={styles.type_game}>
          <img src="ross.jpg" />
          <div className={styles.overlay}>
            บอร์ดเกม
            <br />
            วางแผน
          </div>
        </a>
        <a className={styles.type_game}>
          <img src="defraud.png" />
          <div className={styles.overlay}>
            บอร์ดเกม
            <br />
            แนวโกหก
          </div>
        </a>
        <a className={styles.type_game}>
          <img src="olav-ahrens.jpg" />
          <div className={styles.overlay}>
            บอร์ดเกม
            <br />
            แนวแก้ปริศนา
          </div>
        </a>
      </div>

      <div className={styles.text_board_game}> BOARD GAME</div>

      {isLoading ? (
        <div className={styles.loading}>Loading popular games...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : games.length === 0 ? (
        <div className={styles.no_results}>
          <h3>No popular games found at the moment.</h3>
        </div>
      ) : (
        <div className={styles.show_game_all}>
          {games.slice(0, 5).map((game) => {
            const gameId = game.id;
            
            return (
              <Link
                key={gameId}
                href={`/game/${gameId}`}
                className={styles.item_game}
                data-aos="fade-up"
              >
                <div className={styles.item_game_text}>
                  <div className={styles.name_game}>{game.title}</div>

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
                        fill={gameStates[gameId]?.isFavorite ? "white" : "none"}
                        stroke={gameStates[gameId]?.isFavorite ? "white" : "currentColor"}
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" strokeWidth="2"/>
                      </svg>
                      {gameStates[gameId]?.isFavorite ? "Saved" : "Save"}
                    </button>
                  </div>

                  <div className={styles.stars}>
                    {/* Render stars based on rating_avg from API */}
                    {[1, 2, 3, 4, 5].map((star) => {
                      const rating = game.rating_avg || 0; // Use API rating_avg
                      const isFullStar = rating >= star;
                      const isHalfStar = rating >= star - 0.5 && rating < star;
                      
                      return (
                        <div 
                          key={star} 
                          className={styles.starContainer}
                          // Hover and click handlers are for user interaction, not API rating display
                          // You might want to add separate handlers for user ratings to be sent to backend
                          onMouseLeave={() => setHoverRating(prev => ({...prev, [gameId]: null}))}
                           onMouseMove={(e) => {
                             const calculatedRating = getStarRating(e, star);
                             setHoverRating(prev => ({...prev, [gameId]: calculatedRating}));
                           }}
                           onClick={(e) => {
                             const clickedRating = getStarRating(e, star);
                             handleStarClick(gameId, clickedRating, e);
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
                           <div className={styles.starHoverIndicator}></div>
                         </div>
                      );
                    })}
                  </div>

                  <div className={styles.item_game_tag_B}>
                    {/* Display category as a single tag */}
                    {game.categories && (
                      <div className={styles.item_game_tag}>
                        {game.categories}
                      </div>
                    )}
                  </div>

                  <div className={styles.B_item_game_player}>
                    <div className={styles.item_game_player_1}>
                      <img src="clock-five.png" />
                      {/* Display play time */}
                      {game.play_time_min === game.play_time_max 
                        ? `${game.play_time_min} mins` 
                        : `${game.play_time_min}-${game.play_time_max} mins`}
                    </div>
                    <div className={styles.item_game_player_2}>
                      <img src="users (1).png" />
                      {/* Display players */}
                      {game.min_players === game.max_players
                        ? `${game.min_players} players`
                        : `${game.min_players}-${game.max_players} players`}
                    </div>
                  </div>
                </div>

                <div>
                  <img src={game.image_url} alt={game.title} title={game.image_url}/>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className={styles.Footer}>
        <div className={styles.Footer_B1}>
          <div className={styles.Footer_B1_S1}>
            GURU
            <br />
            BOARD
            <br />
            GAME{" "}
          </div>
          <div className={styles.Footer_B1_S2}>
            <div>GURU BOARD GAME</div>
            <a>Home</a>
            <a>Search Game</a>
            <a>Game</a>
          </div>
          <div className={styles.Footer_B1_S3}>
            <div> ABOUT US </div>
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
      <LoginPopup 
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message={loginMessage}
      />
    </>
  );
}

export default GameCard;