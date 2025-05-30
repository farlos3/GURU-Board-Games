import React, { useState, useEffect, useCallback } from "react";
import Nav from "./components/Navbar";
import styles from "../styles/Search.module.css";
import gamesData from "/src/pages/testjoson.json"; // Import JSON data
import { trackGameSearch, trackGameFilter } from '../utils/userActivity';
import LoginPopup from './components/LoginPopup';

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
  
  // State สำหรับเก็บข้อมูล favorites, hearts และ ratings ของแต่ละเกม (แยกอิสระ)
  const [gameStates, setGameStates] = useState({});
  const [hoverRating, setHoverRating] = useState({}); // แยกเฉพาะ gameId
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  // โหลดข้อมูลเกมจาก JSON
  useEffect(() => {
    setGames(gamesData);
    setFilteredGames(gamesData);
    
    // Load user's game states using token as ID
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const gameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
        setGameStates(gameStates[token] || {});
      } catch (error) {
        console.error('Error loading user states:', error);
      }
    }
  }, []);

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
      // กรองตามชื่อเกม
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // กรองตามหมวดหมู่
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.some(category => 
          game.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
        );
      
      // กรองตามจำนวนผู้เล่น
      const playerRange = game.players.match(/(\d+)-(\d+)/);
      const matchesPlayerCount = !playerRange || 
        (parseInt(playerRange[1]) <= playerCount && playerCount <= parseInt(playerRange[2]));
      
      // กรองตามเวลาเล่น
      const gameTime = parseInt(game.duration.match(/\d+/)?.[0] || 0);
      const matchesPlayTime = gameTime <= playTime;
      
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

  // ดึง categories ที่ไม่ซ้ำกันจากข้อมูล
  const getAllCategories = () => {
    const allTags = games.flatMap(game => game.tags);
    return [...new Set(allTags)];
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
          {filteredGames.map((game) => {
            const currentGameState = gameStates[game.id] || {};
            
            return (
              <div
                key={game.id}
                className={styles.item_game}
                data-aos="fade-up"
                data-aos-anchor-placement="top-bottom"
              >
                <div className={styles.item_game_text}>
                  <div className={styles.name_game}>{game.name}</div>

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
                    {game.tags.map((tag, tagIndex) => (
                      <div key={tagIndex} className={styles.item_game_tag}>
                        {tag}
                      </div>
                    ))}
                  </div>

                  <div className={styles.B_item_game_player}>
                    <div className={styles.item_game_player_1}>
                      <img src="clock-five.png" alt="time" />
                      {game.duration}
                    </div>
                    <div className={styles.item_game_player_2}>
                      <img src="users (1).png" alt="players" />
                      {game.players}
                    </div>
                  </div>
                </div>

                <div>
                  <img src={game.image} alt={game.name} />
                </div>
              </div>
            );
          })}
          
          {filteredGames.length === 0 && (
            <div className={styles.no_results}>
              <h3>ไม่พบเกมที่ตรงกับเงื่อนไขการค้นหา</h3>
              <p>ลองปรับเปลี่ยนเงื่อนไขการค้นหาหรือใช้คำค้นหาอื่น</p>
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