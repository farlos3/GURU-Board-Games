import React, { useEffect, useState } from "react";
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
    AOS.init({
      duration: 1500,
      once: true,
    });

    // โหลดข้อมูลจาก localStorage
    const savedStates = loadGameStatesFromStorage();
    
    // Initialize game states
    const initialStates = {};
    games.forEach((game, idx) => {
      initialStates[idx] = {
        isFavorite: savedStates[idx]?.isFavorite || false,
        isLiked: savedStates[idx]?.isLiked || false,
        userRating: savedStates[idx]?.userRating || 0
      };
    });
    setGameStates(initialStates);
  }, []);

  // บันทึกข้อมูลลง localStorage ทุกครั้งที่ gameStates เปลี่ยน
  useEffect(() => {
    if (Object.keys(gameStates).length > 0) {
      saveGameStatesToStorage(gameStates);
    }
  }, [gameStates]);

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ favorite
  const toggleFavorite = (gameIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setGameStates(prev => ({
      ...prev,
      [gameIndex]: {
        ...prev[gameIndex],
        isFavorite: !prev[gameIndex]?.isFavorite
      }
    }));
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ heart
  const toggleHeart = (gameIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setGameStates(prev => ({
      ...prev,
      [gameIndex]: {
        ...prev[gameIndex],
        isLiked: !prev[gameIndex]?.isLiked
      }
    }));
  };

  // ฟังก์ชันสำหรับให้คะแนนดาว (รองรับครึ่งดาว)
  const handleStarClick = (gameIndex, rating, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setGameStates(prev => ({
      ...prev,
      [gameIndex]: {
        ...prev[gameIndex],
        userRating: rating
      }
    }));
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
        {games.map((game, idx) => (
          <Link
            key={idx}
            href={`/game/${idx}`}
            className={styles.item_game}
            data-aos="fade-up"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>{game.name}</div>

              <div className={styles.rating_buttons}>
                <button 
                  className={`${styles.heart_button} ${gameStates[idx]?.isLiked ? styles.heart_active : ''}`}
                  onClick={(e) => toggleHeart(idx, e)}
                  title={gameStates[idx]?.isLiked ? "Unlike" : "Like"}
                >
                  {gameStates[idx]?.isLiked ? "💖" : "🤍"}
                </button>
                
                <button 
                  className={`${styles.favorite_button} ${gameStates[idx]?.isFavorite ? styles.favorite_active : ''}`}
                  onClick={(e) => toggleFavorite(idx, e)}
                  title={gameStates[idx]?.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <svg 
                    className={styles.bookmark_icon} 
                    viewBox="0 0 24 24" 
                    fill={gameStates[idx]?.isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                  >
                    <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" strokeWidth="2"/>
                  </svg>
                  {gameStates[idx]?.isFavorite ? "Saved" : "Save"}
                </button>
              </div>

              <div className={styles.stars}>
                {renderStars(idx)}
                {/* <span className={styles.ratingText}>
                  {gameStates[idx]?.userRating || 0} / 5
                </span> */}
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
        ))}
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