import React, { useEffect, useState } from "react";
import Nav from "./components/Navbar";
import styles from "/src/styles/index.module.css";
import gamesData from "/src/pages/Real-data.json"; // Import JSON data

import AOS from "aos";
import "aos/dist/aos.css";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Link from "next/link";

const images = [
  "Wolf.png",
  "AVALON.png",
  "CASHFLOW.png",
  "CATAN.png",
  "CHINA_TOWN.png",
  "SALEM.png",
];

function GameCard() {
  const [games, setGames] = useState([]);
  // State สำหรับเก็บข้อมูล favorites, hearts และ ratings ของแต่ละเกม
  const [gameStates, setGameStates] = useState({});

  // ฟังก์ชันสำหรับโหลดข้อมูลจาก localStorage (ใช้ JavaScript variables แทนใน Claude.ai)
  const loadGameStatesFromStorage = () => {
  try {
    const savedStates = localStorage.getItem("gameStates");
    if (savedStates) {
      return JSON.parse(savedStates);
    }
  } catch (error) {
    console.error("Error loading game states from localStorage:", error);
  }
  return {};
};

const saveGameStatesToStorage = (states) => {
  try {
    localStorage.setItem("gameStates", JSON.stringify(states));
    // เพิ่มการส่ง event เพื่อให้หน้าอื่นๆ รู้ว่าข้อมูลเปลี่ยน
    window.dispatchEvent(
      new CustomEvent("gameStatesChanged", { detail: states })
    );
  } catch (error) {
    console.error("Error saving game states to localStorage:", error);
  }
};

  // โหลดข้อมูลเกมจาก JSON
  useEffect(() => {
    setGames(gamesData);
    
    AOS.init({
      duration: 1500,
      once: true,
    });

    // โหลดข้อมูลจาก storage
    const savedStates = loadGameStatesFromStorage();

    // สร้าง state สำหรับเกมทั้งหมด
    const updatedStates = { ...savedStates };

    gamesData.forEach((game, index) => {
      if (!updatedStates[index]) {
        updatedStates[index] = {
          isFavorite: false,
          isLiked: false,
          userRating: 0, // เพิ่ม userRating
        };
      } else {
        // ถ้ามีข้อมูลเก่าอยู่แล้ว ให้เก็บ userRating ไว้
        if (!updatedStates[index].hasOwnProperty('userRating')) {
          updatedStates[index].userRating = 0;
        }
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

  // Listen for changes from other pages
  useEffect(() => {
  const handleGameStatesChange = (event) => {
    setGameStates(event.detail);
  };

  window.addEventListener("gameStatesChanged", handleGameStatesChange);
  return () => {
    window.removeEventListener("gameStatesChanged", handleGameStatesChange);
  };
}, []);

  // จำกัดเกมที่จะแสดงเป็น 12 อันแรก
  const displayedGames = games.slice(0, 12);

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

  // ฟังก์ชันสำหรับแสดงดาว (เหมือนหน้า Search)
  const renderStars = (game, gameIndex) => {
    // ลำดับความสำคัญ: userRating จาก localStorage > rating จาก JSON
    const userRating = gameStates[gameIndex]?.userRating || 0;
    const jsonRating = game.rating || 0;
    const rating = userRating > 0 ? userRating : jsonRating;

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
          {getDisplayRating(game, gameIndex).toFixed(1)} / 5
        </span>
      </div>
    );
  };

  // ฟังก์ชันแสดงคะแนนที่ใช้งาน
  const getDisplayRating = (game, gameIndex) => {
    const userRating = gameStates[gameIndex]?.userRating || 0;
    const jsonRating = game.rating || 0;
    return userRating > 0 ? userRating : jsonRating;
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
          <img src="marisa.jpg "  />
          <div className={styles.overlay}>Cooperative </div>
        </a>
        <a className={styles.type_game}>
          <img src="Adventure.png" />
          <div className={styles.overlay}>Adventure</div>
        </a>
        <a className={styles.type_game}>
          <img src="surface-X1GZqv-F7Tw-unsplash.jpg" />
          <div className={styles.overlay}>Luck-based </div>
        </a>
        <a className={styles.type_game}>
          <img src="ross.jpg" />
          <div className={styles.overlay}>Strategy</div>
        </a>
        <a className={styles.type_game}>
          <img src="defraud.png" />
          <div className={styles.overlay}>Bluffing</div>
        </a>
        <a className={styles.type_game}>
          <img src="olav-ahrens.jpg" />
          <div className={styles.overlay}>Puzzle</div>
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

              {/* แสดงดาวเหมือนหน้า Search */}
              {renderStars(game, idx)}

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
    </>
  );
}

export default GameCard;