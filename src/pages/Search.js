import React, { useState, useEffect, useCallback } from "react";
import Nav from "./components/Navbar";
import Link from "next/link";
import styles from "../styles/Search.module.css";
import { trackGameSearch, trackGameFilter } from '../utils/userActivity';
import LoginPopup from './components/LoginPopup';
import AOS from 'aos';

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function Search() {
  const [games, setGames] = useState([]);
  const [playerCount, setPlayerCount] = useState(4);
  const [playTime, setPlayTime] = useState(60);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // เพิ่ม state สำหรับ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 9;

  // State สำหรับเก็บข้อมูล favorites, hearts และ ratings ของแต่ละเกม (แยกอิสระ)
  const [gameStates, setGameStates] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  useEffect(() => {
    console.log('Search page initial useEffect running');
    AOS.init({
      duration: 1500,
      once: true,
    });

    // Load all boardgames from API
    fetchAllBoardgames();

    // Cleanup function
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, []);

  // Use another useEffect to update game states when games data is updated after fetching
  useEffect(() => {
    console.log('Games state updated, initializing game states for fetched games');
    if (games.length > 0) {
      const savedStates = loadGameStatesFromStorage();
      const initialStates = {};
      const token = localStorage.getItem('token');
      const userGameStates = token ? (JSON.parse(localStorage.getItem('gameStates')) || {})[token] || {} : {};

      games.forEach(game => {
        initialStates[game.id] = userGameStates[game.id] || { isFavorite: false, isLiked: false, userRating: 0 };
      });
      setGameStates(initialStates);
    }
  }, [games]);

  // ฟังก์ชันสำหรับโหลดข้อมูล boardgame ทั้งหมดจาก API
  const fetchAllBoardgames = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching all boardgames from:', `${process.env.NEXT_PUBLIC_API_URL}/recommendations/all-boardgames`);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/all-boardgames`);

      if (!response.ok) {
        throw new Error(`Failed to fetch all boardgames: ${response.status} ${response.statusText}`);
      }

      console.log('API Response Status:', response.status);
      const data = await response.json();
      console.log('Fetched all boardgames data:', data);

      const fetchedGames = (data.boardgames || []).filter(game => game);
      setGames(fetchedGames);
      setFilteredGames(fetchedGames);

    } catch (error) {
      console.error('Error in fetchAllBoardgames:', error);
      setError('Failed to load boardgames. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const performFuzzySearch = async (query) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        query: query,
        playerCount: playerCount,
        playTime: playTime,
        ...(selectedCategories.length > 0 && {
          categories: JSON.stringify(selectedCategories)
        })
      });

      console.log('Search API Request:', {
        url: `${process.env.NEXT_PUBLIC_API_URL}/api/search?${params}`,
        params: {
          query,
          playerCount,
          playTime,
          categories: selectedCategories.length > 0 ? selectedCategories : null
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?${params}`);
      const data = await response.json();
      console.log('Search API Response:', data);

      // แก้ไขการ process ข้อมูล - เช็คโครงสร้างข้อมูลที่แตกต่างกัน
      let searchResults = [];

      if (Array.isArray(data)) {
        // กรณีที่ response เป็น array โดยตรง
        searchResults = data.map(item => {
          // ถ้ามี _source ให้ใช้ _source
          if (item._source) {
            return item._source;
          }
          // ถ้าไม่มี _source ให้ใช้ item เลย (แต่ต้องกรองข้อมูลที่ไม่ต้องการออก)
          else {
            // กรอง highlights และ _search_score ออก แล้วเก็บเฉพาะข้อมูลเกม
            const { highlights, _search_score, ...gameData } = item;
            return gameData;
          }
        }).filter(game => game && game.id); // กรองเฉพาะที่มี id
      } else if (data.hits && Array.isArray(data.hits)) {
        // กรณีที่ response มี structure แบบ Elasticsearch
        searchResults = data.hits.map(hit => hit._source).filter(game => game && game.id);
      } else if (data.boardgames && Array.isArray(data.boardgames)) {
        // กรณีที่ response มี structure แบบเดียวกับ all-boardgames
        searchResults = data.boardgames.filter(game => game && game.id);
      } else {
        console.warn('Unexpected API response structure:', data);
        searchResults = [];
      }

      console.log('Processed search results:', searchResults);
      setGames(searchResults);
      setFilteredGames(searchResults);
      setCurrentPage(1); // รีเซ็ตหน้าเป็นหน้าแรก

    } catch (error) {
      console.error('Error in fuzzy search:', error);
      setError('Failed to search boardgames. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // แก้ไขการจัดการ input search
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // ล้าง timeout เก่าถ้ามี
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // ถ้าช่องค้นหาว่าง ให้โหลดข้อมูลทั้งหมด
    if (!value.trim()) {
      fetchAllBoardgames();
      return;
    }

    // ตั้ง timeout ใหม่สำหรับ fuzzy search
    const timeout = setTimeout(() => {
      performFuzzySearch(value);
    }, 1500); // รอ 1.5 วินาที

    setSearchTimeout(timeout);
  };

  // คำนวณข้อมูลสำหรับ pagination - ใช้ filteredGames ที่มาจาก API โดยตรง
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  // ฟังก์ชันเปลี่ยนหน้า
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    // เลื่อนกลับไปด้านบนเมื่อเปลี่ยนหน้า
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // ฟังก์ชันจัดการ checkbox category
  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Toggle favorite with token as user ID
  const toggleFavorite = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage('Please log in to add favorites');
      setShowLoginPopup(true);
      return;
    }

    try {
      const allGameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
      const userGameStates = allGameStates[token] || {};

      const newUserGameStates = {
        ...userGameStates,
        [gameId]: {
          ...userGameStates[gameId],
          isFavorite: !userGameStates[gameId]?.isFavorite
        }
      };

      allGameStates[token] = newUserGameStates;
      localStorage.setItem('gameStates', JSON.stringify(allGameStates));
      setGameStates(newUserGameStates);

      // Dispatch custom event เพื่อให้หน้าอื่นๆ รู้ว่าข้อมูลเปลี่ยน
      window.dispatchEvent(
        new CustomEvent("gameStatesChanged", { detail: newUserGameStates })
      );
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  // Toggle heart with token as user ID
  const toggleHeart = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage('Please log in to like games');
      setShowLoginPopup(true);
      return;
    }

    try {
      const allGameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
      const userGameStates = allGameStates[token] || {};

      const newUserGameStates = {
        ...userGameStates,
        [gameId]: {
          ...userGameStates[gameId],
          isLiked: !userGameStates[gameId]?.isLiked
        }
      };

      allGameStates[token] = newUserGameStates;
      localStorage.setItem('gameStates', JSON.stringify(allGameStates));
      setGameStates(newUserGameStates);

      // Dispatch custom event เพื่อให้หน้าอื่นๆ รู้ว่าข้อมูลเปลี่ยน
      window.dispatchEvent(
        new CustomEvent("gameStatesChanged", { detail: newUserGameStates })
      );
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

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

  // Handle star rating with token as user ID
  const handleStarClick = (gameId, rating, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage('Please log in to rate games');
      setShowLoginPopup(true);
      return;
    }

    try {
      const allGameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
      const userGameStates = allGameStates[token] || {};

      const newUserGameStates = {
        ...userGameStates,
        [gameId]: {
          ...userGameStates[gameId],
          userRating: rating
        }
      };

      allGameStates[token] = newUserGameStates;
      localStorage.setItem('gameStates', JSON.stringify(allGameStates));
      setGameStates(newUserGameStates);

      // Dispatch custom event เพื่อให้หน้าอื่นๆ รู้ว่าข้อมูลเปลี่ยน
      window.dispatchEvent(
        new CustomEvent("gameStatesChanged", { detail: newUserGameStates })
      );
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  // ฟังก์ชันสำหรับ hover effect บนดาว
  const handleStarHover = (gameId, rating) => {
    setGameStates(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        hoverRating: rating
      }
    }));
  };

  const handleStarLeave = (gameId) => {
    setGameStates(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        hoverRating: null
      }
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

  // แก้ไขฟังก์ชัน renderStars ให้ใช้คะแนนจาก localStorage หากมี หรือใช้จาก API หากไม่มี
  const renderStars = (game, gameId) => {
    const gameState = gameStates[gameId] || {};
    const userRating = gameState.userRating || 0;
    const apiRating = game.rating || 0;
    const hoverRating = gameState.hoverRating;

    // ลำดับความสำคัญ: hoverRating > userRating > rating จาก API
    const rating = hoverRating !== null && hoverRating !== undefined
      ? hoverRating
      : (userRating > 0 ? userRating : apiRating);

    return [1, 2, 3, 4, 5].map((star) => {
      const isFullStar = rating >= star;
      const isHalfStar = rating >= star - 0.5 && rating < star;

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
            <span className={`${styles.star} ${styles.starBackground}`}>★</span>
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

  // ฟังก์ชันแสดงคะแนนที่ใช้งาน
  const getDisplayRating = (game, gameId) => {
    const gameState = gameStates[gameId] || {};
    const userRating = gameState.userRating || 0;
    const apiRating = game.rating || 0;
    return userRating > 0 ? userRating : apiRating;
  };

  // ดึง categories ที่ไม่ซ้ำกันจากข้อมูล (ปรับให้รองรับ categories ที่เป็น string หรือ array)
  const getAllCategories = () => {
    const allCategories = games
      .filter(game => game) // Ensure game is not null or undefined
      .flatMap(game =>
        Array.isArray(game.categories)
          ? game.categories
          : (game.categories ? game.categories.split(',').map(cat => cat.trim()) : [])
      );
    return [...new Set(allCategories)].sort(); // Sort categories alphabetically
  };

  // ฟังก์ชันสำหรับโหลดข้อมูลจาก localStorage
  const loadGameStatesFromStorage = () => {
    try {
      // เปลี่ยนจาก JSON.parse เป็น getItem ธรรมดา
      const token = localStorage.getItem('token');
      const savedStates = localStorage.getItem('gameStates');

      // ถ้าไม่มี token (ไม่ได้ login) ให้ล้างค่า states ทั้งหมด
      if (!token) {
        localStorage.removeItem('gameStates');
        localStorage.removeItem('favoriteGames');
        return {};
      }

      if (savedStates) {
        try {
          return JSON.parse(savedStates);
        } catch (parseError) {
          console.error("Invalid JSON in localStorage:", parseError);
          localStorage.removeItem('gameStates');
          return {};
        }
      }
    } catch (error) {
      console.error("Error loading game states from localStorage:", error);
    }
    return {};
  };

  return (
    <>
      <Nav />
      <div className={styles.game_Text}>
        <div>BOARDGAMES</div>
      </div>
      <div className={styles.B_Search_all}>
        <div className={styles.B_B_Search}>
          <div className={styles.B_Search}>
            <div className={styles.Text_filter}>Filter</div>
            <div className={styles.Text_search}>Search</div>

            <div className={styles.box_Search}>
              <img src="search_icon.png" alt="search" />
              <input
                type="text"
                placeholder="Search game..."
                className={styles.input_Search}
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Player Count */}
            <div className={styles.B_plyer_count}>
              <div className={styles.text_plyer_count}>Player Count</div>
              <div className={styles.sliderValueRow}>
                <span>{playerCount}</span>
                <span>15</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            {/* Play Time */}
            <div className={styles.B_time}>
              <div className={styles.text_time}>Play Time (minutes)</div>
              <div className={styles.sliderValueRow}>
                <span>{playTime}</span>
                <span>180+</span>
              </div>
              <input
                type="range"
                min="15"
                max="180"
                value={playTime}
                onChange={(e) => setPlayTime(Number(e.target.value))}
                className={styles.slider}
              />
            </div>

            {/* Categories */}
            <div className={styles.B_Categories}>
              <div className={styles.text_time}>Categories</div>
              {getAllCategories().map((category) => (
                <label key={category}>
                  <input
                    type="checkbox"
                    name="category"
                    value={category.toLowerCase()}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  <div>{category}</div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.B_games_section}>
          {/* แสดงข้อมูลจำนวนเกมและหน้าปัจจุบัน */}
          <div className={styles.games_info}>
            <p>
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredGames.length)} of{" "}
              {filteredGames.length} games (page {currentPage} of {totalPages})
            </p>
          </div>

          <div className={styles.B_item_all}>
            {isLoading ? (
              <div className={styles.loading}>Loading boardgames...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : currentGames.length === 0 && !isLoading && !error ? (
              <div className={styles.no_results}>
                <h3>No games found that match the search criteria.</h3>
                <p>
                  Please try adjusting the search filters or using different
                  keywords.
                </p>
              </div>
            ) : (
              currentGames.map((game) => {
                const currentGameState = gameStates[game.id] || {};

                return (
                  <Link key={game.id} href={`/game/${game.id}`}>
                    <div
                      className={styles.item_game}
                      data-aos="fade-up"
                      data-aos-anchor-placement="top-bottom"
                    >
                      <div className={styles.item_game_text}>
                        <div className={styles.name_game}>{game.title}</div>

                        <div className={styles.rating_buttons}>
                          <button
                            className={`${styles.heart_button} ${currentGameState.isLiked ? styles.heart_active : ""
                              }`}
                            onClick={(e) => toggleHeart(game.id, e)}
                            title={currentGameState.isLiked ? "Unlike" : "Like"}
                          >
                            {currentGameState.isLiked ? "💖" : "🤍"}
                          </button>

                          <button
                            className={`${styles.favorite_button} ${currentGameState.isFavorite
                                ? styles.favorite_active
                                : ""
                              }`}
                            onClick={(e) => toggleFavorite(game.id, e)}
                            title={
                              currentGameState.isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <svg
                              className={styles.bookmark_icon}
                              viewBox="0 0 24 24"
                              fill={
                                currentGameState.isFavorite
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
                            {currentGameState.isFavorite ? "Saved" : "Save"}
                          </button>
                        </div>

                        <div className={styles.stars}>
                          {renderStars(game, game.id)}
                          <span className={styles.rating_text}>
                            {getDisplayRating(game, game.id).toFixed(1)} / 5
                          </span>
                        </div>

                        <div className={styles.item_game_tag_B}>
                          {/* Display category/categories */}
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
                            <img src="clock-five.png" alt="time" />
                            {/* Display play time */}
                            {game.play_time_min === game.play_time_max
                              ? `${game.play_time_min} mins`
                              : `${game.play_time_min}-${game.play_time_max} mins`}
                          </div>
                          <div className={styles.item_game_player_2}>
                            <img src="users (1).png" alt="players" />
                            {/* Display players */}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={`${styles.pagination_btn} ${styles.pagination_prev}`}
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className={styles.pagination_numbers}>
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      className={`${styles.pagination_btn} ${styles.pagination_number
                        } ${currentPage === pageNumber
                          ? styles.pagination_active
                          : ""
                        }`}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                className={`${styles.pagination_btn} ${styles.pagination_next}`}
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
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

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message={loginMessage}
      />
    </>
  );
}

export default Search;