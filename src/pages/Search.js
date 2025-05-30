import React, { useState, useEffect } from "react";
import Nav from "./components/Navbar";
import Link from "next/link";
import styles from "../styles/Search.module.css";
import gamesData from "/src/pages/testjoson.json"; // Import JSON data

function Search() {
  const [games, setGames] = useState([]);
  const [playerCount, setPlayerCount] = useState(4);
  const [playTime, setPlayTime] = useState(60);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);

  // เพิ่ม state สำหรับ pagination
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 9;

  // State สำหรับเก็บข้อมูล favorites, hearts และ ratings ของแต่ละเกม (แยกอิสระ)
  const [gameStates, setGameStates] = useState({});

  // ฟังก์ชันสำหรับโหลดข้อมูลจาก localStorage
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

  // ฟังก์ชันสำหรับบันทึกข้อมูลลง localStorage
  const saveGameStatesToStorage = (states) => {
    try {
      localStorage.setItem("gameStates", JSON.stringify(states));
      // Dispatch custom event เพื่อให้หน้าอื่นๆ รู้ว่าข้อมูลเปลี่ยน
      window.dispatchEvent(
        new CustomEvent("gameStatesChanged", { detail: states })
      );
    } catch (error) {
      console.error("Error saving game states to localStorage:", error);
    }
  };

  // โหลดข้อมูลเกมจาก JSON
  // แทนที่ useEffect ตัวแรกในไฟล์ paste-2.txt (บรรทัดที่ 50-69) ด้วยโค้ดนี้
  useEffect(() => {
    setGames(gamesData);
    setFilteredGames(gamesData);

    // โหลดข้อมูลจาก localStorage (เฉพาะ favorite และ heart)
    const savedStates = loadGameStatesFromStorage();

    const updatedStates = { ...savedStates };

    gamesData.forEach((game, index) => {
      if (!updatedStates[index]) {
        updatedStates[index] = {
          isFavorite: false,
          isLiked: false,
          // ลบ userRating และ hoverRating ออก - ใช้ข้อมูลจาก JSON แทน
        };
      } else {
        // ถ้ามีข้อมูลเก่าอยู่แล้ว ให้ลบ userRating และ hoverRating ออก
        delete updatedStates[index].userRating;
        delete updatedStates[index].hoverRating;
      }
    });

    setGameStates(updatedStates);
  }, []);

  // บันทึกข้อมูลลง localStorage ทุกครั้งที่ gameStates เปลี่ยน
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

  // ฟังก์ชันการกรองเกม
  useEffect(() => {
    let filtered = games.filter((game) => {
      // กรองตามชื่อเกม
      const matchesSearch = game.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // กรองตามหมวดหมู่
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((category) =>
          game.tags.some((tag) => tag.toLowerCase() === category.toLowerCase())
        );

      // กรองตามจำนวนผู้เล่น (สมมติว่า players เป็น "2-4 players")
      const playerRange = game.players.match(/(\d+)-(\d+)/);
      const matchesPlayerCount =
        !playerRange ||
        (parseInt(playerRange[1]) <= playerCount &&
          playerCount <= parseInt(playerRange[2]));

      // กรองตามเวลาเล่น (สมมติว่า duration เป็น "45 min")
      const gameTime = parseInt(game.duration.match(/\d+/)?.[0] || 0);
      const matchesPlayTime = gameTime <= playTime;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPlayerCount &&
        matchesPlayTime
      );
    });

    setFilteredGames(filtered);
    setCurrentPage(1); // รีเซ็ตกลับไปหน้าแรกเมื่อกรองข้อมูลใหม่
  }, [searchQuery, selectedCategories, playerCount, playTime, games]);

  // คำนวณข้อมูลสำหรับ pagination
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

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ favorite (แยกเฉพาะ gameId)
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

  // ฟังก์ชันสำหรับเปลี่ยนสถานะ heart (แยกเฉพาะ gameId)
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

  // แทนที่ฟังก์ชัน renderStars ด้วยฟังก์ชันใหม่
  const renderStars = (game) => {
    // ใช้คะแนนจาก JSON (สมมติว่าใน JSON มี field ชื่อ rating)
    const rating = game.rating || 0;

    return [1, 2, 3, 4, 5].map((star) => {
      const isFullStar = rating >= star;
      const isHalfStar = rating >= star - 0.5 && rating < star;

      return (
        <div key={star} className={styles.starContainer}>
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
  // ดึง categories ที่ไม่ซ้ำกันจากข้อมูล
  const getAllCategories = () => {
    const allTags = games.flatMap((game) => game.tags);
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
            {currentGames.map((game, index) => {
              // คำนวณ gameIndex ที่แท้จริงในข้อมูลทั้งหมด
              const actualGameIndex = startIndex + index;
              const currentGameState = gameStates[actualGameIndex] || {};

              return (
                <Link key={actualGameIndex} href={`/game/${actualGameIndex}`}>
                  <div
                    className={styles.item_game}
                    data-aos="fade-up"
                    data-aos-anchor-placement="top-bottom"
                  >
                    <div className={styles.item_game_text}>
                      <div className={styles.name_game}>{game.name}</div>

                      <div className={styles.rating_buttons}>
                        <button
                          className={`${styles.heart_button} ${
                            currentGameState.isLiked ? styles.heart_active : ""
                          }`}
                          onClick={(e) => toggleHeart(actualGameIndex, e)}
                          title={currentGameState.isLiked ? "Unlike" : "Like"}
                        >
                          {currentGameState.isLiked ? "💖" : "🤍"}
                        </button>

                        <button
                          className={`${styles.favorite_button} ${
                            currentGameState.isFavorite
                              ? styles.favorite_active
                              : ""
                          }`}
                          onClick={(e) => toggleFavorite(actualGameIndex, e)}
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
                        {renderStars(game)}
                        <span className={styles.rating_text}>
                          {(game.rating || 0).toFixed(1)} / 5
                        </span>
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
                </Link>
              );
            })}

            {filteredGames.length === 0 && (
              <div className={styles.no_results}>
                <h3>No games found that match the search criteria.</h3>
                <p>
                  Please try adjusting the search filters or using different
                  keywords.
                </p>
              </div>
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
                      className={`${styles.pagination_btn} ${
                        styles.pagination_number
                      } ${
                        currentPage === pageNumber
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
