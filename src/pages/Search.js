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
  // Core search states
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [playerCount, setPlayerCount] = useState(0);
  const [playTime, setPlayTime] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 9;

  // User interaction states
  const [gameStates, setGameStates] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  // Timeout states for debouncing
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [filterTimeout, setFilterTimeout] = useState(null);

  // Initialize component
  useEffect(() => {
    console.log('Search page initializing...');
    AOS.init({
      duration: 1500,
      once: true,
    });

    // เรียกฟังก์ชันใหม่ที่จะโหลดหมวดหมู่ทั้งหมดก่อน
    fetchAllCategoriesFirst();

    // Check URL parameters for initial category filter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      console.log('Found category parameter from URL:', categoryParam);
      setSelectedCategories([categoryParam]);
    }

    // Cleanup function
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (filterTimeout) {
        clearTimeout(filterTimeout);
      }
    };
  }, []);

  const fetchAllCategoriesFirst = async () => {
    try {
      // เรียก API เพื่อดึงเกมทั้งหมดโดยไม่มีการกรอง
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const allGames = processSearchResults(data);

      // ดึงหมวดหมู่ทั้งหมดจากเกมทั้งหมด
      extractCategories(allGames);

      // จากนั้นค่อยโหลดเกมตามฟิลเตอร์
      fetchAllBoardgames();
    } catch (error) {
      console.error('Error fetching categories:', error);
      // หากเกิดข้อผิดพลาด ให้โหลดเกมปกติ
      fetchAllBoardgames();
    }
  };

  // Initialize game states when games are loaded
  useEffect(() => {
    if (games.length > 0) {
      initializeGameStates();
    }
  }, [games]);

  // Handle filter changes with debounce
  useEffect(() => {
    // Clear existing timeout
    if (filterTimeout) {
      clearTimeout(filterTimeout);
    }

    // Set new timeout for debounced filter execution
    const timeout = setTimeout(() => {
      console.log('Filters changed - updating results');
      if (searchQuery.trim()) {
        performFuzzySearch(searchQuery);
      } else {
        fetchAllBoardgames();
      }
    }, 300); // 300ms debounce for filters

    setFilterTimeout(timeout);

    // Cleanup function
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [playerCount, playTime, selectedCategories]);

  // Listen for game state changes from other components
  useEffect(() => {
    const handleGameStatesChange = (event) => {
      setGameStates(event.detail);
    };

    window.addEventListener("gameStatesChanged", handleGameStatesChange);
    return () => {
      window.removeEventListener("gameStatesChanged", handleGameStatesChange);
    };
  }, []);

  // Initialize game states from localStorage
  const initializeGameStates = useCallback(() => {
    console.log('Initializing game states...');
    const token = localStorage.getItem('token');
    if (!token) return;

    const savedStates = loadGameStatesFromStorage();
    const userGameStates = savedStates[token] || {};
    const initialStates = {};

    games.forEach(game => {
      initialStates[game.id] = userGameStates[game.id] || {
        isFavorite: false,
        isLiked: false,
        userRating: 0
      };
    });

    setGameStates(initialStates);
  }, [games]);

  // Fetch all boardgames with filters
  const fetchAllBoardgames = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      // If no filters are applied, use the recommendations route
      if (!playerCount && !playTime && selectedCategories.length === 0 && !searchQuery) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/all-boardgames`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Fetch all error:', errorText);
          throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Fetch all response:', data);

        const fetchedGames = processSearchResults(data);
        setGames(fetchedGames);
        setFilteredGames(fetchedGames);
        setCurrentPage(1);
        console.log(`Loaded ${fetchedGames.length} games`);
        return;
      }

      // If filters are applied, use the search route
      const searchParams = {
        query: '',
        ...buildFilters()
      };
  
      console.log('Fetch all params:', searchParams);
  
      const apiUrl = buildApiUrl('/api/search', searchParams);
      console.log('Fetch all URL:', apiUrl);
  
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch all error:', errorText);
        throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Fetch all response:', data);
  
      const fetchedGames = processSearchResults(data);
  
      setGames(fetchedGames);
      setFilteredGames(fetchedGames);
      setCurrentPage(1);
  
      console.log(`Loaded ${fetchedGames.length} games`);
  
    } catch (error) {
      console.error('Error fetching boardgames:', error);
      setError(`Failed to load boardgames: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [playerCount, playTime, selectedCategories, searchQuery]);

  const performFuzzySearch = useCallback(async (query) => {
    try {
      setIsLoading(true);
      setError(null);
  
      const searchParams = {
        SearchQuery: query,
        ...buildFilters() // เรียกใช้ regular function
      };
  
      console.log('Search params:', searchParams); // Debug log
  
      const apiUrl = buildApiUrl('/api/search', searchParams);
      console.log('Calling API URL:', apiUrl); // Debug log
  
      const response = await fetch(apiUrl);
      
      console.log('Response status:', response.status); // Debug log
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText); // Debug log
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      console.log('API Response data:', data); // Debug log
  
      const searchResults = processSearchResults(data);
  
      setGames(searchResults);
      setFilteredGames(searchResults);
      setCurrentPage(1);
  
      // Track search activity
      if (typeof trackGameSearch === 'function') {
        trackGameSearch(query, searchResults.length);
      }
  
      console.log(`Search completed: ${searchResults.length} results`);
  
    } catch (error) {
      console.error('Search error details:', error); // Debug log
      setError(`Failed to search boardgames: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [playerCount, playTime, selectedCategories]);

  function buildFilters() {
    return {
      playerCount: playerCount > 0 ? playerCount : null,
      playTime: playTime > 0 ? playTime : null,
      categories: selectedCategories.length > 0 ? selectedCategories : null
    };
  }  

  // Build filters object
  const buildApiUrl = (endpoint, params) => {
    const urlParams = new URLSearchParams();
  
    console.log('Building API URL with params:', params); // Debug log
  
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        let paramName = key;
        if (key === 'searchQuery' || key === 'query') {
          paramName = 'SearchQuery';
        }
  
        if (Array.isArray(value)) {
          urlParams.append(paramName, value.join(','));
        } else {
          urlParams.append(paramName, value.toString());
        }
      }
    });
  
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
    const queryString = urlParams.toString();
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    console.log('Final API URL:', finalUrl); // Debug log
    return finalUrl;
  };

  // Process search results from different API response formats
  const processSearchResults = (data) => {
    let searchResults = [];
  
    if (Array.isArray(data)) {
      searchResults = data.map(item => {
        if (item._source) return item._source;
        const { highlights, _search_score, ...gameData } = item;
        return gameData;
      }).filter(game => game && game.id);
    } else if (data.hits && Array.isArray(data.hits)) {
      searchResults = data.hits.map(hit => hit._source).filter(game => game && game.id);
    } else if (data.boardgames && Array.isArray(data.boardgames)) {
      searchResults = data.boardgames.filter(game => game && game.id);
    }
  
    return searchResults;
  };

  // Extract unique categories from games
  const extractCategories = (gamesList) => {
    const categories = [...new Set(
      gamesList
        .filter(Boolean)
        .flatMap(game =>
          Array.isArray(game.categories)
            ? game.categories
            : (game.categories ? game.categories.split(',').map(cat => cat.trim()) : [])
        )
    )].sort();

    setAllCategories(categories);
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query) => {
      console.log('Debounced search executed with query:', query);
      if (query.trim()) {
        console.log('Calling performFuzzySearch with:', query);
        performFuzzySearch(query);
      } else {
        console.log('Empty query, calling fetchAllBoardgames');
        fetchAllBoardgames();
      }
    }, 500),
    [performFuzzySearch, fetchAllBoardgames]
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    console.log('Search input value:', value);
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Handle filter changes
  const handlePlayerCountChange = (e) => {
    const value = Number(e.target.value);
    setPlayerCount(value);
    trackFilter('playerCount', value);
  };

  const handlePlayTimeChange = (e) => {
    const value = Number(e.target.value);
    setPlayTime(value);
    trackFilter('playTime', value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(category);
      const newCategories = isSelected
        ? prev.filter(c => c !== category)
        : [...prev, category];

      trackFilter('category', category, !isSelected);
      return newCategories;
    });
  };

  // Track filter usage
  const trackFilter = (type, value, isActive = true) => {
    if (typeof trackGameFilter === 'function') {
      trackGameFilter(type, value, isActive);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  };

  // User interaction handlers
  const toggleFavorite = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    updateGameState(gameId, 'isFavorite', 'Please log in to add favorites');
  };

  const toggleHeart = (gameId, e) => {
    e.preventDefault();
    e.stopPropagation();
    updateGameState(gameId, 'isLiked', 'Please log in to like games');
  };

  const handleStarClick = (gameId, rating, e) => {
    e.preventDefault();
    e.stopPropagation();
    updateGameState(gameId, 'userRating', 'Please log in to rate games', rating);
  };

  // Update game state in localStorage
  const updateGameState = (gameId, property, loginMessage, value = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoginMessage(loginMessage);
      setShowLoginPopup(true);
      return;
    }

    try {
      const allGameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
      const userGameStates = allGameStates[token] || {};

      const currentState = userGameStates[gameId] || {};
      const newValue = value !== null ? value : !currentState[property];

      const newUserGameStates = {
        ...userGameStates,
        [gameId]: {
          ...currentState,
          [property]: newValue
        }
      };

      allGameStates[token] = newUserGameStates;
      localStorage.setItem('gameStates', JSON.stringify(allGameStates));
      setGameStates(newUserGameStates);

      // Notify other components
      window.dispatchEvent(
        new CustomEvent("gameStatesChanged", { detail: newUserGameStates })
      );
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  };

  // Star rating helpers
  const handleStarHover = (gameId, rating) => {
    setGameStates(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId], hoverRating: rating }
    }));
  };

  const handleStarLeave = (gameId) => {
    setGameStates(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId], hoverRating: null }
    }));
  };

  const getStarRating = (e, starIndex) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const halfWidth = rect.width / 2;
    return x <= halfWidth ? starIndex - 0.5 : starIndex;
  };

  // Render star rating component
  const renderStars = (game, gameId) => {
    const gameState = gameStates[gameId] || {};
    const userRating = gameState.userRating || 0;
    const apiRating = game.rating || 0;
    const hoverRating = gameState.hoverRating;

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

  // Get display rating
  const getDisplayRating = (game, gameId) => {
    const gameState = gameStates[gameId] || {};
    const userRating = gameState.userRating || 0;
    const apiRating = game.rating || 0;
    return userRating > 0 ? userRating : apiRating;
  };

  // Load game states from localStorage
  const loadGameStatesFromStorage = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.removeItem('gameStates');
        localStorage.removeItem('favoriteGames');
        return {};
      }

      const savedStates = localStorage.getItem('gameStates');
      if (savedStates) {
        return JSON.parse(savedStates);
      }
    } catch (error) {
      console.error("Error loading game states:", error);
      localStorage.removeItem('gameStates');
    }
    return {};
  };

  // Render main component
  return (
    <>
      <Nav />
      <div className={styles.game_Text}>
        <div>BOARDGAMES</div>
      </div>

      <div className={styles.B_Search_all}>
        {/* Filters Section */}
        <div className={styles.B_B_Search}>
          <div className={styles.B_Search}>
            <div className={styles.Text_filter}>Filter</div>
            <div className={styles.Text_search}>Search</div>

            {/* Search Input */}
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

            {/* Player Count Filter */}
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
                onChange={handlePlayerCountChange}
                className={styles.slider}
              />
            </div>

            {/* Play Time Filter */}
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
                onChange={handlePlayTimeChange}
                className={styles.slider}
              />
            </div>

            {/* Categories Filter */}
            <div className={styles.B_Categories}>
              <div className={styles.text_time}>Categories</div>
              {allCategories.map((category) => (
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

        {/* Games Section */}
        <div className={styles.B_games_section}>
          {/* Results Info */}
          <div className={styles.games_info}>
            <p>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredGames.length)} of{" "}
              {filteredGames.length} games (page {currentPage} of {totalPages})
            </p>
          </div>

          {/* Games Grid */}
          <div className={styles.B_item_all}>
            {isLoading ? (
              <div className={styles.loading}>Loading boardgames...</div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : currentGames.length === 0 ? (
              <div className={styles.no_results}>
                <h3>No games found that match the search criteria.</h3>
                <p>Please try adjusting the search filters or using different keywords.</p>
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
                            className={`${styles.favorite_button} ${currentGameState.isFavorite ? styles.favorite_active : ""
                              }`}
                            onClick={(e) => toggleFavorite(game.id, e)}
                            title={
                              currentGameState.isFavorite
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                          >
                            <svg className={styles.bookmark_icon} viewBox="0 0 24 24" fill={currentGameState.isFavorite ? "currentColor" : "none"} stroke="currentColor">
                              <path d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z" strokeWidth="2" />
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
                            {game.play_time_min === game.play_time_max
                              ? `${game.play_time_min} mins`
                              : `${game.play_time_min}-${game.play_time_max} mins`}
                          </div>
                          <div className={styles.item_game_player_2}>
                            <img src="users (1).png" alt="players" />
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

          {/* Pagination */}
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
                      className={`${styles.pagination_btn} ${styles.pagination_number} ${currentPage === pageNumber ? styles.pagination_active : ""
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

      {/* Footer */}
      <div className={styles.Footer}>
        <div className={styles.Footer_B1}>
          <div className={styles.Footer_B1_S1}>
            GURU<br />BOARD<br />GAME{" "}
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