import React, { useState, useEffect } from "react";
import Nav from "./components/Navbar";
import styles from "../styles/Search.module.css";
import gamesData from "/src/pages/testjoson.json"; // Import JSON data

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

  // โหลดข้อมูลเกมจาก JSON
  useEffect(() => {
    setGames(gamesData);
    setFilteredGames(gamesData);
    
    // Initialize game states - แต่ละเกมจะมี state แยกจากกัน
    const initialStates = {};
    gamesData.forEach((game) => {
      initialStates[game.id] = {
        isFavorite: false,
        isLiked: false,
        userRating: 0,
        hoverRating: null // เพิ่ม hoverRating เฉพาะแต่ละการ์ด
      };
    });
    setGameStates(initialStates);
  }, []);

  // ฟังก์ชันการกรองเกม
  useEffect(() => {
    let filtered = games.filter(game => {
      // กรองตามชื่อเกม
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // กรองตามหมวดหมู่
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.some(category => 
          game.tags.some(tag => tag.toLowerCase() === category.toLowerCase())
        );
      
      // กรองตามจำนวนผู้เล่น (สมมติว่า players เป็น "2-4 players")
      const playerRange = game.players.match(/(\d+)-(\d+)/);
      const matchesPlayerCount = !playerRange || 
        (parseInt(playerRange[1]) <= playerCount && playerCount <= parseInt(playerRange[2]));
      
      // กรองตามเวลาเล่น (สมมติว่า duration เป็น "45 min")
      const gameTime = parseInt(game.duration.match(/\d+/)?.[0] || 0);
      const matchesPlayTime = gameTime <= playTime;
      
      return matchesSearch && matchesCategory && matchesPlayerCount && matchesPlayTime;
    });
    
    setFilteredGames(filtered);
  }, [searchQuery, selectedCategories, playerCount, playTime, games]);

  // ฟังก์ชันจัดการ checkbox category
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ favorite (แยกเฉพาะ gameId)
  const toggleFavorite = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setGameStates(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        isFavorite: !prev[gameId]?.isFavorite
      }
    }));
  };

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ heart (แยกเฉพาะ gameId)
  const toggleHeart = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setGameStates(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        isLiked: !prev[gameId]?.isLiked
      }
    }));
  };

  // ฟังก์ชันสำหรับให้คะแนนดาว (แยกเฉพาะ gameId)
  const handleStarClick = (gameId, rating, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setGameStates(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        userRating: rating
      }
    }));
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
            // ดึง state ของเกมนี้โดยเฉพาะ
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
    </>
  );
}

export default Search;