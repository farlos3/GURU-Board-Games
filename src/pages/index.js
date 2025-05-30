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

// Sample games data with ratings
const games = [
  {
    "name": "Werewolf",
    "image": "item_2.png",
    "tags": ["Family", "Party", "Strategy"],
    "duration": "35 min",
    "players": "3-4 players",
    "description": "qwdqdqdqwdqwdqwdqwdqwdwqdwqdwqdwqdwqdqwdqwdqwdwqdqwdq",
    "rating": 3.5
  },
  {
    "name": "Codenames",
    "image": "marisa.jpg",
    "tags": ["Puzzle", "Strategy"],
    "duration": "20 min",
    "players": "2-8 players",
    "rating": 4.2
  },
  {
    "name": "Dixit",
    "image": "defraud.png",
    "tags": ["Family", "Creative"],
    "duration": "30 min",
    "players": "3-6 players",
    "rating": 4.8
  },
  {
    "name": "Azul",
    "image": "item_2.png",
    "tags": ["Family", "Party", "Strategy"],
    "duration": "35 min",
    "players": "3-4 players",
    "rating": 2.5
  },
  {
    "name": "Ticket to Ride",
    "image": "item_2.png",
    "tags": ["Puzzle", "Strategy"],
    "duration": "20 min",
    "players": "2-8 players",
    "rating": 5.0
  },
  {
    "name": "Splendor",
    "image": "item_2.png",
    "tags": ["Family", "Creative"],
    "duration": "30 min",
    "players": "3-6 players",
    "rating": 1.5
  },
  {
    "name": "Pandemic",
    "image": "item_2.png",
    "tags": ["Family", "Creative"],
    "duration": "30 min",
    "players": "3-6 players",
    "rating": 4.0
  },
  {
    "name": "Catan",
    "image": "item_2.png",
    "tags": ["Family", "Creative"],
    "duration": "30 min",
    "players": "3-6 players",
    "rating": 3.8
  }
  
];

const images = [
  "Wolf.png",
  "karthik.jpg",
  "Wolf.png",
  "karthik.jpg",
  "Wolf.png",
  "olav-ahrens.jpg",
];

function GameCard() {
  // State สำหรับเก็บข้อมูล favorites และ hearts ของแต่ละเกม (เอา rating ออก)
  const [gameStates, setGameStates] = useState({});

  // จำกัดเกมที่จะแสดงเป็น 12 อันแรก
  const displayedGames = games.slice(0, 12);

  // ฟังก์ชันสำหรับโหลดข้อมูลจาก localStorage (ใช้ JavaScript variables แทน)
  const loadGameStatesFromStorage = () => {
    // ใน Claude.ai artifacts ไม่สามารถใช้ localStorage ได้
    // ใช้ state เก็บข้อมูลแทน
    return {};
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูล (placeholder function)
  const saveGameStatesToStorage = (states) => {
    // ใน Claude.ai artifacts ไม่สามารถใช้ localStorage ได้
    // ข้อมูลจะอยู่ใน memory เท่านั้น
    console.log("Game states updated:", states);
  };

  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: true,
    });

    // โหลดข้อมูลจาก storage
    const savedStates = loadGameStatesFromStorage();

    // ใช้ข้อมูลที่มีอยู่แล้วใน savedStates แทนการสร้างใหม่
    // เพิ่มเฉพาะเกมที่ยังไม่มีใน savedStates (เฉพาะ 12 อันแรก)
    const updatedStates = { ...savedStates };

    displayedGames.forEach((game, idx) => {
      if (!updatedStates[idx]) {
        updatedStates[idx] = {
          isFavorite: false,
          isLiked: false,
          // เอา userRating ออก เพราะจะใช้ rating จาก JSON เท่านั้น
        };
      }
    });

    setGameStates(updatedStates);
  }, []);

  // บันทึกข้อมูลทุกครั้งที่ gameStates เปลี่ยน
  useEffect(() => {
    if (Object.keys(gameStates).length > 0) {
      saveGameStatesToStorage(gameStates);
    }
  }, [gameStates]);

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ favorite
  const toggleFavorite = (gameIndex, e) => {
    e.preventDefault();
    e.stopPropagation();

    setGameStates((prev) => ({
      ...prev,
      [gameIndex]: {
        ...prev[gameIndex],
        isFavorite: !prev[gameIndex]?.isFavorite,
      },
    }));
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ heart
  const toggleHeart = (gameIndex, e) => {
    e.preventDefault();
    e.stopPropagation();

    setGameStates((prev) => ({
      ...prev,
      [gameIndex]: {
        ...prev[gameIndex],
        isLiked: !prev[gameIndex]?.isLiked,
      },
    }));
  };

  // ฟังก์ชันสำหรับแสดงดาว (แสดงเฉพาะคะแนนจาก JSON - ไม่สามารถคลิกได้)
  const renderStars = (gameIndex) => {
    const game = displayedGames[gameIndex];
    const rating = game?.rating || 0;

    return (
      <div className={styles.starsDisplay}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFullStar = rating >= star;
          const isHalfStar = rating >= star - 0.5 && rating < star;

          return (
            <div key={star} className={styles.starDisplayContainer}>
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
        })}
        <span className={styles.ratingText}>
          {rating.toFixed(1)} / 5
        </span>
      </div>
    );
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
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          pagination={{
            clickable: true,
            hideOnClick: false,
            el: ".swiper-pagination",
          }}
          modules={[Autoplay, Navigation, Pagination]}
          className="mySwiper"
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 0,
              centeredSlides: true,
              navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              },
              pagination: {
                clickable: true,
                el: ".swiper-pagination",
              },
            },
            576: {
              slidesPerView: 1,
              spaceBetween: 0,
              centeredSlides: true,
              navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              },
              pagination: {
                clickable: true,
                el: ".swiper-pagination",
              },
            },
            768: {
              slidesPerView: 1,
              spaceBetween: 5,
              centeredSlides: true,
              navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              },
              pagination: {
                clickable: true,
                el: ".swiper-pagination",
              },
            },
            992: {
              slidesPerView: 1.2,
              spaceBetween: 10,
              centeredSlides: true,
              navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              },
              pagination: {
                clickable: true,
                el: ".swiper-pagination",
              },
            },
            1200: {
              slidesPerView: 1.5,
              spaceBetween: 5,
              centeredSlides: true,
              navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              },
              pagination: {
                clickable: true,
                el: ".swiper-pagination",
              },
            },
            1400: {
              slidesPerView: 1.8,
              spaceBetween: 5,
              centeredSlides: true,
              navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
              },
              pagination: {
                clickable: true,
                el: ".swiper-pagination",
              },
            },
          }}
        >
          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={img}
                className={styles.slide_image}
                alt={`Slide ${index + 1}`}
                loading="lazy"
              />
            </SwiperSlide>
          ))}

          <div className="swiper-button-next"></div>
          <div className="swiper-button-prev"></div>
          <div className="swiper-pagination"></div>
        </Swiper>
      </div>
      
      <div className={styles.type_game_B}>
        <a className={styles.type_game}>
          <img src="marisa.jpg" alt="บอร์ดเกม ครอบครัว" />
          <div className={styles.overlay}>Strategy</div>
        </a>
        <a className={styles.type_game}>
          <img src="Adventure.png" />
          <div className={styles.overlay}>Puzzle</div>
        </a>
        <a className={styles.type_game}>
          <img src="2h-media.jpg" />
          <div className={styles.overlay}>Adventure</div>
        </a>
        <a className={styles.type_game}>
          <img src="ross.jpg" />
          <div className={styles.overlay}>Cooperative</div>
        </a>
        <a className={styles.type_game}>
          <img src="defraud.png" />
          <div className={styles.overlay}>Bluffing</div>
        </a>
        <a className={styles.type_game}>
          <img src="olav-ahrens.jpg" />
          <div className={styles.overlay}>Luck-based</div>
        </a>
      </div>
      
      <div className={styles.text_board_game}>BOARD GAME</div>
      
      <div className={styles.show_game_all}>
        {displayedGames.map((game, idx) => (
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
                  className={`${styles.heart_button} ${
                    gameStates[idx]?.isLiked ? styles.heart_active : ""
                  }`}
                  onClick={(e) => toggleHeart(idx, e)}
                  title={gameStates[idx]?.isLiked ? "Unlike" : "Like"}
                >
                  {gameStates[idx]?.isLiked ? "💖" : "🤍"}
                </button>

                <button
                  className={`${styles.favorite_button} ${
                    gameStates[idx]?.isFavorite ? styles.favorite_active : ""
                  }`}
                  onClick={(e) => toggleFavorite(idx, e)}
                  title={
                    gameStates[idx]?.isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <svg
                    className={styles.bookmark_icon}
                    viewBox="0 0 24 24"
                    fill={gameStates[idx]?.isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                  >
                    <path
                      d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z"
                      strokeWidth="2"
                    />
                  </svg>
                  {gameStates[idx]?.isFavorite ? "Saved" : "Save"}
                </button>
              </div>

              {/* แสดงดาวจาก JSON (ไม่สามารถคลิกได้) */}
              {renderStars(idx)}

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
            <Link href="/">Home</Link>
            <Link href="/Search">Search Game</Link>
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