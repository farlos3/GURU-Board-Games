import React, { useState, useEffect, useCallback } from "react";
import Nav from "./components/Navbar";
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
  
  // State สำหรับเก็บข้อมูล favorites, hearts และ ratings ของแต่ละเกม (แยกอิสระ)
  const [gameStates, setGameStates] = useState({});
  const [hoverRating, setHoverRating] = useState({}); // แยกเฉพาะ gameId
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

    // Load user's game states using token as ID (This will be updated after fetchAllBoardgames completes)
    const savedStates = loadGameStatesFromStorage();
    // We don't set initial game states here directly based on savedStates
    // because fetchAllBoardgames will do it with actual game IDs.
    
  }, []); // Empty dependency array means this runs once on mount

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
  }, [games]); // Run this effect when the 'games' state changes

  // ฟังก์ชันสำหรับโหลดข้อมูล boardgame ทั้งหมดจาก API
  const fetchAllBoardgames = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/all-boardgames`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch all boardgames: ${response.status} ${response.statusText}`);
      }
      
      console.log('API Response Status:', response.status);
      const data = await response.json();
      console.log('Fetched all boardgames data:', data);
      
      // Assuming the API returns an array of games in data.boardgames
      const fetchedGames = data.boardgames || [];
      setGames(fetchedGames);
      setFilteredGames(fetchedGames); // Initially show all fetched games

      // Load user's game states using token as ID and initialize for fetched games (Moved to a separate useEffect)
      
    } catch (error) {
      console.error('Error in fetchAllBoardgames:', error);
      setError('Failed to load boardgames. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // สร้าง debounced functions สำหรับ search และ filter
  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query) {
        trackGameSearch(query);
      }
    }, 1000),
    []
  );

  const debouncedFilter = useCallback(
    debounce((filters) => {
      trackGameFilter(filters);
    }, 1000),
    []
  );

  // Update search query handling with debounce
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Update filter handling with debounce
  useEffect(() => {
    const filters = {
      categories: selectedCategories,
      playerCount,
      playTime
    };
    debouncedFilter(filters);
  }, [selectedCategories, playerCount, playTime, debouncedFilter]);

  // ฟังก์ชันการกรองเกม (แยกออกมาเพื่อให้เรียกใช้ได้โดยตรง)
  const filterGames = useCallback(() => {
    let filtered = games.filter(game => {
      // กรองตามชื่อเกม (ใช้ game.title แทน game.name)
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // กรองตามหมวดหมู่ (ปรับให้รองรับ categories ที่เป็น string หรือ array)
      const gameCategories = Array.isArray(game.categories) 
        ? game.categories.map(cat => cat.toLowerCase())
        : (game.categories ? game.categories.split(',').map(cat => cat.trim().toLowerCase()) : []);
      
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.some(selectedCat => 
          gameCategories.includes(selectedCat.toLowerCase())
        );
      
      // กรองตามจำนวนผู้เล่น (ใช้ min_players และ max_players)
      const matchesPlayerCount = game.min_players <= playerCount && playerCount <= game.max_players;
      
      // กรองตามเวลาเล่น (ใช้ play_time_min และ play_time_max)
      // Assuming playTime slider value is in minutes
      const matchesPlayTime = game.play_time_min <= playTime && playTime <= game.play_time_max; // Consider games fully within the selected playTime range, or adjust logic as needed
      
      return matchesSearch && matchesCategory && matchesPlayerCount && matchesPlayTime;
    });
    
    setFilteredGames(filtered);
  }, [games, searchQuery, selectedCategories, playerCount, playTime]);

  // ใช้ debounce สำหรับการ filter เกม
  const debouncedFilterGames = useCallback(
    debounce(() => {
      filterGames();
    }, 300),
    [filterGames]
  );

  // เรียกใช้ debounced filter เมื่อมีการเปลี่ยนแปลง filter
  useEffect(() => {
    debouncedFilterGames();
  }, [searchQuery, selectedCategories, playerCount, playTime, debouncedFilterGames]);

  // ฟังก์ชันจัดการ checkbox category
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
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
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  // Handle star rating with token as user ID
  const handleStarClick = (gameId, rating, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to rate games');
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
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  // ฟังก์ชันสำหรับ hover effect บนดาว (แยกเฉพาะ gameId)
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

  // ฟังก์ชันสำหรับแสดงดาว (ใช้ hoverRating ของแต่ละ gameId แยกจากกัน)
  const renderStars = (gameId) => {
    const gameState = gameStates[gameId] || {};
    const currentRating = gameState.hoverRating !== null && gameState.hoverRating !== undefined 
      ? gameState.hoverRating 
      : (gameState.userRating || 0);
    
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
            <span className={`${styles.star} ${styles.starBackground}`}>
              ★
            </span>
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
    });
  };

  // ดึง categories ที่ไม่ซ้ำกันจากข้อมูล (ปรับให้รองรับ categories ที่เป็น string หรือ array)
  const getAllCategories = () => {
    const allCategories = games.flatMap(game => 
      Array.isArray(game.categories) 
        ? game.categories 
        : (game.categories ? game.categories.split(',').map(cat => cat.trim()) : [])
    );
    return [...new Set(allCategories)].sort(); // Sort categories alphabetically
  };

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
                onChange={(e) => setSearchQuery(e.target.value)}
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
              {getAllCategories().map(category => (
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

        <div className={styles.B_item_all}>
          {isLoading ? (
            <div className={styles.loading}>Loading boardgames...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : filteredGames.length === 0 && !isLoading && !error ? (
            <div className={styles.no_results}>
              <h3>ไม่พบเกมที่ตรงกับเงื่อนไขการค้นหา</h3>
              <p>ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือใช้คำค้นหาอื่น</p>
            </div>
          ) : (
            filteredGames.map((game) => {
              const currentGameState = gameStates[game.id] || {};
              
              return (
                <div
                  key={game.id}
                  className={styles.item_game}
                  data-aos="fade-up"
                  data-aos-anchor-placement="top-bottom"
                >
                  <div className={styles.item_game_text}>
                    <div className={styles.name_game}>{game.title}</div>

                    <div className={styles.rating_buttons}>
                      <button 
                        className={`${styles.heart_button} ${currentGameState.isLiked ? styles.heart_active : ''}`}
                        onClick={(e) => toggleHeart(game.id, e)}
                        title={currentGameState.isLiked ? "Unlike" : "Like"}
                      >
                        {currentGameState.isLiked ? "💖" : "🤍"}
                      </button>
                      
                      <button 
                        className={`${styles.favorite_button} ${currentGameState.isFavorite ? styles.favorite_active : ''}`}
                        onClick={(e) => toggleFavorite(game.id, e)}
                        title={currentGameState.isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <svg 
                          className={styles.bookmark_icon} 
                          viewBox="0 0 24 24" 
                          fill={currentGameState.isFavorite ? "currentColor" : "none"}
                          stroke="currentColor"
                        >
                          <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" strokeWidth="2"/>
                        </svg>
                        {currentGameState.isFavorite ? "Saved" : "Save"}
                      </button>
                    </div>

                    <div className={styles.stars}>
                      {renderStars(game.id)}
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

export default Search;