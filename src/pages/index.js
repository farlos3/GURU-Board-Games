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
import games from "../pages/testjoson.json";

const images = [
  "Wolf.png",
  "karthik.jpg",
  "Wolf.png",
  "karthik.jpg",
  "Wolf.png",
  "olav-ahrens.jpg",
];

function GameCard() {
  const [gameStates, setGameStates] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  
  // ใช้ useRef เพื่อ track การเปลี่ยนแปลงและป้องกัน multiple logs
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef(null);

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

  // ฟังก์ชันสำหรับอัพเดตรายการ favorites ใน localStorage
  const updateFavoritesList = (newStates) => {
    try {
      const favoriteGames = games.filter((game, index) => {
        const gameId = game.id || `game_${index}`;
        return newStates[gameId]?.isFavorite;
      }).map((game, index) => ({
        ...game,
        id: game.id || `game_${index}`
      }));
      localStorage.setItem('favoriteGames', JSON.stringify(favoriteGames));
    } catch (error) {
      console.error('Error updating favorites list:', error);
    }
  };

  // ฟังก์ชัน unified สำหรับอัพเดต game state
  const updateGameState = (gameId, updates) => {
    const token = localStorage.getItem('token');
    if (!token && (updates.isFavorite !== undefined || updates.isLiked !== undefined)) {
      const action = updates.isFavorite !== undefined ? 'add favorites' : 'like games';
      alert(`Please log in to ${action}`);
      return;
    }

    setGameStates(prev => {
      // Check if there's actually a change
      const currentState = prev[gameId] || {};
      let hasChanges = false;
      
      for (const key in updates) {
        if (currentState[key] !== updates[key]) {
          hasChanges = true;
          break;
        }
      }
      
      // If no changes, don't update
      if (!hasChanges) {
        return prev;
      }
      
      const newStates = {
        ...prev,
        [gameId]: {
          ...currentState,
          ...updates
        }
      };
      
      // Log เฉพาะเมื่อมีการเปลี่ยนแปลงจริงๆ และไม่ใช่ initial load
      if (!isInitialLoad.current) {
        console.log(`Game ${gameId} updated:`, newStates[gameId]);
      }
      
      // Debounce การบันทึกเพื่อป้องกัน multiple saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveGameStatesToStorage(newStates);
        updateFavoritesList(newStates);
      }, 100);
      
      return newStates;
    });
  };

  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    });

    // Store all games data in localStorage
    localStorage.setItem('allGames', JSON.stringify(games));

    // Load existing game states from localStorage
    const savedStates = loadGameStatesFromStorage();
    
    // Initialize game states with unique IDs
    const initialStates = {};
    games.forEach((game, index) => {
      const gameId = game.id || `game_${index}`;
      initialStates[gameId] = {
        isFavorite: savedStates[gameId]?.isFavorite || false,
        isLiked: savedStates[gameId]?.isLiked || false,
        userRating: savedStates[gameId]?.userRating || 0
      };
    });
    
    setGameStates(initialStates);
    updateFavoritesList(initialStates);
    
    // Mark initial load as complete
    isInitialLoad.current = false;
  }, []);

  // Function to toggle favorite status
  const toggleFavorite = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // ป้องกัน double click
    if (e.detail > 1) return;
    
    const currentState = gameStates[gameId];
    updateGameState(gameId, {
      isFavorite: !currentState?.isFavorite
    });
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ heart
  const toggleHeart = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // ป้องกัน double click
    if (e.detail > 1) return;
    
    const currentState = gameStates[gameId];
    updateGameState(gameId, {
      isLiked: !currentState?.isLiked
    });
  };

  // ฟังก์ชันสำหรับให้คะแนนดาว (รองรับครึ่งดาว)
  const handleStarClick = (gameId, rating, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // ป้องกัน double click
    if (e.detail > 1) return;
    
    updateGameState(gameId, {
      userRating: rating
    });
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
          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <img src={img} className={styles.slide_image} />
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

      <div className={styles.show_game_all}>
        {games.map((game, idx) => {
          const gameId = game.id || `game_${idx}`;
          
          return (
            <Link
              key={gameId}
              href={`/game/${idx}`}
              className={styles.item_game}
              data-aos="fade-up"
            >
              <div className={styles.item_game_text}>
                <div className={styles.name_game}>{game.name}</div>

                <div className={styles.rating_buttons}>
                  <button 
                    className={`${styles.heart_button} ${gameStates[gameId]?.isLiked ? styles.heart_active : ''}`}
                    onClick={(e) => toggleHeart(gameId, e)}
                    title={gameStates[gameId]?.isLiked ? "Unlike" : "Like"}
                  >
                    {gameStates[gameId]?.isLiked ? "💖" : "🤍"}
                  </button>
                  
                  <button 
                    className={`${styles.favorite_button} ${gameStates[gameId]?.isFavorite ? styles.favorite_active : ''}`}
                    onClick={(e) => toggleFavorite(gameId, e)}
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
                  {renderStars(gameId)}
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
                    <img src="clock-five.png" />
                    {game.duration}
                  </div>
                  <div className={styles.item_game_player_2}>
                    <img src="users (1).png" />
                    {game.players}
                  </div>
                </div>
              </div>

              <div>
                <img src={game.image} />
              </div>
            </Link>
          );
        })}
      </div>

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
    </>
  );
}

export default GameCard;