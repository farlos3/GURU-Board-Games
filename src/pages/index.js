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
import LoginPopup from './components/LoginPopup';

const staticImages = [
  "Wolf.png",
  "AVALON.png",
  "CASHFLOW.png",
  "CATAN.png",
  "CHINA_TOWN.png",
  "SALEM.png",
];

function GameCard() {
  const [gridGames, setGridGames] = useState([]);
  const [swiperGames, setSwiperGames] = useState([]);
  const [gameStates, setGameStates] = useState({});
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
      // เพิ่มการส่ง event เพื่อให้หน้าอื่นๆ รู้ว่าข้อมูลเปลี่ยน
      window.dispatchEvent(
        new CustomEvent("gameStatesChanged", { detail: states })
      );
    } catch (error) {
      console.error('Error saving game states to localStorage:', error);
    }
  };

  // ฟังก์ชันสำหรับอัพเดตรายการ favorites ใน localStorage
  const updateFavoritesList = (newStates) => {
    try {
      const favoriteGames = gridGames.filter((game) => {
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

      // Fetch popular games for the Swiper (always top 5)
      const popularApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/recommendations/popular`;
      console.log('Fetching popular games for swiper:', popularApiUrl);
      const popularResponse = await fetch(popularApiUrl);

      if (!popularResponse.ok) {
        throw new Error(`Failed to fetch popular games: ${popularResponse.statusText}`);
      }

      const popularData = await popularResponse.json();
      console.log('Fetched popular games data:', popularData);
      const popularGames = popularData.boardgames || [];
      setSwiperGames(popularGames.slice(0, 5)); // Take top 5 for swiper

      // Fetch games for the Grid based on login status
      const token = localStorage.getItem('token');
      const user = token ? JSON.parse(atob(token.split('.')[1])) : null; // Decode user from token payload

      let gridApiUrl;
      let fetchedGridGames = [];

      if (user && user.id) { // User is logged in and has an ID
        gridApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/recommendations/behavior/${user.id}?limit=10`;
        console.log(`Fetching personalized recommendations for user ${user.id}:`, gridApiUrl);
        const gridResponse = await fetch(gridApiUrl);

        if (!gridResponse.ok) {
          throw new Error(`Failed to fetch personalized recommendations: ${gridResponse.statusText}`);
        }

        const gridData = await gridResponse.json();
        console.log('Fetched personalized recommendations data:', gridData);
        fetchedGridGames = gridData.boardgames || [];

      } else { // User is not logged in
        gridApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/recommendations/all-boardgames`;
        console.log('Fetching all boardgames for guest user:', gridApiUrl);
        const gridResponse = await fetch(gridApiUrl);

        if (!gridResponse.ok) {
          throw new Error(`Failed to fetch all boardgames: ${gridResponse.statusText}`);
        }

        const gridData = await gridResponse.json();
        console.log('Fetched all boardgames data:', gridData);

        // Shuffle
        const allGames = gridData.boardgames || [];

        // Simple shuffle function
        for (let i = allGames.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allGames[i], allGames[j]] = [allGames[j], allGames[i]]; // Swap
        }

        fetchedGridGames = allGames;
      }

      // Always display only the first 6 games in the grid
      const gamesToDisplayInGrid = fetchedGridGames.slice(0, 6);

      setGridGames(gamesToDisplayInGrid);

      // Initialize game states for fetched games (should be based on gridGames)
      const savedStates = loadGameStatesFromStorage();
      const initialStates = {};

      gamesToDisplayInGrid.forEach(game => {
        initialStates[game.id] = {
          isFavorite: savedStates[game.id]?.isFavorite || false,
          isLiked: savedStates[game.id]?.isLiked || false,
          userRating: savedStates[game.id]?.userRating || 0,
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
  }, []);

  // บันทึกข้อมูลทุกครั้งที่ gameStates เปลี่ยน
  useEffect(() => {
    if (Object.keys(gameStates).length > 0) {
      saveGameStatesToStorage(gameStates);
      updateFavoritesList(gameStates);
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

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ favorite
  const toggleFavorite = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage('Please log in to add favorites');
      setShowLoginPopup(true);
      return;
    }

    setGameStates((prev) => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        isFavorite: !prev[gameId]?.isFavorite,
      },
    }));
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ heart
  const toggleHeart = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage('Please log in to like games');
      setShowLoginPopup(true);
      return;
    }

    setGameStates((prev) => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        isLiked: !prev[gameId]?.isLiked,
      },
    }));
  };

  // ฟังก์ชันสำหรับแสดงดาว (เหมือนโค้ดแรก)
  const renderStars = (game) => {
    const gameId = game.id;
    // ลำดับความสำคัญ: userRating จาก localStorage > rating_avg จาก API
    const userRating = gameStates[gameId]?.userRating || 0;
    const apiRating = game.rating_avg || 0;
    const rating = userRating > 0 ? userRating : apiRating;

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

  // จำกัดเกมที่จะแสดงเป็น 12 อันแรก
  const displayedGames = gridGames.slice(0, 12);

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
            },
            576: {
              slidesPerView: 1,
              spaceBetween: 0,
              centeredSlides: true,
            },
            768: {
              slidesPerView: 1,
              spaceBetween: 5,
              centeredSlides: true,
            },
            992: {
              slidesPerView: 1.2,
              spaceBetween: 10,
              centeredSlides: true,
            },
            1200: {
              slidesPerView: 1.5,
              spaceBetween: 5,
              centeredSlides: true,
            },
            1400: {
              slidesPerView: 1.8,
              spaceBetween: 5,
              centeredSlides: true,
            },
          }}
        >
          {/* ใช้ static images หรือจากข้อมูล API */}
          {swiperGames.length > 0 ? (
            swiperGames.slice(0, 6).map((game) => (
              <SwiperSlide key={game.id}>
                <Link href={`/game/${game.id}`}>
                  <img
                    src={game.image_url}
                    className={styles.slide_image}
                    alt={game.title}
                    loading="lazy"
                  />
                </Link>
              </SwiperSlide>
            ))
          ) : (
            staticImages.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  className={styles.slide_image}
                  alt={`Slide ${index + 1}`}
                  loading="lazy"
                />
              </SwiperSlide>
            ))
          )}

          <div className="swiper-button-next"></div>
          <div className="swiper-button-prev"></div>
          <div className="swiper-pagination"></div>
        </Swiper>
      </div>

      <div className={styles.type_game_B}>
        <Link href="/Search?category=Cooperative" className={styles.type_game}>
          <img src="marisa.jpg" />
          <div className={styles.overlay}>Cooperative</div>
        </Link>
        <Link href="/Search?category=Adventure" className={styles.type_game}>
          <img src="Adventure.png" />
          <div className={styles.overlay}>Adventure</div>
        </Link>
        <Link href="/Search?category=Luck-based" className={styles.type_game}>
          <img src="surface-X1GZqv-F7Tw-unsplash.jpg" />
          <div className={styles.overlay}>Luck-based</div>
        </Link>
        <Link href="/Search?category=Strategy" className={styles.type_game}>
          <img src="ross.jpg" />
          <div className={styles.overlay}>Strategy</div>
        </Link>
        <Link href="/Search?category=Bluffing" className={styles.type_game}>
          <img src="defraud.png" />
          <div className={styles.overlay}>Bluffing</div>
        </Link>
        <Link href="/Search?category=Puzzle" className={styles.type_game}>
          <img src="olav-ahrens.jpg" />
          <div className={styles.overlay}>Puzzle</div>
        </Link>
      </div>

      <div className={styles.text_board_game}>Recommended for you</div>

      {isLoading ? (
        <div className={styles.loading}>Loading popular games...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : gridGames.length === 0 ? (
        <div className={styles.no_results}>
          <h3>No popular games found at the moment.</h3>
        </div>
      ) : (
        <div className={styles.show_game_all}>
          {displayedGames.map((game) => {
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
                      className={`${styles.heart_button} ${gameStates[gameId]?.isLiked ? styles.heart_active : ""
                        }`}
                      onClick={(e) => toggleHeart(gameId, e)}
                      title={gameStates[gameId]?.isLiked ? "Unlike" : "Like"}
                    >
                      {gameStates[gameId]?.isLiked ? "💖" : "🤍"}
                    </button>

                    <button
                      className={`${styles.favorite_button} ${gameStates[gameId]?.isFavorite ? styles.favorite_active : ""
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
                        fill={gameStates[gameId]?.isFavorite ? "currentColor" : "none"}
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

                  {/* แสดงดาวเหมือนโค้ดแรก */}
                  {renderStars(game)}

                  <div className={styles.item_game_tag_B}>
                    {/* Display category from API */}
                    {game.categories && (
                      <div className={styles.item_game_tag}>
                        {game.categories}
                      </div>
                    )}
                  </div>

                  <div className={styles.B_item_game_player}>
                    <div className={styles.item_game_player_1}>
                      <img src="clock-five.png" />
                      {/* Display play time from API */}
                      {game.play_time_min === game.play_time_max
                        ? `${game.play_time_min} mins`
                        : `${game.play_time_min}-${game.play_time_max} mins`}
                    </div>
                    <div className={styles.item_game_player_2}>
                      <img src="users (1).png" />
                      {/* Display players from API */}
                      {game.min_players === game.max_players
                        ? `${game.min_players} players`
                        : `${game.min_players}-${game.max_players} players`}
                    </div>
                  </div>
                </div>

                <div>
                  <img src={game.image_url} alt={game.title} />
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

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message={loginMessage}
      />
    </>
  );
}

export default GameCard;