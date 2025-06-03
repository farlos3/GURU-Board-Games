import React, { useState, useEffect } from 'react';
import { Home, Heart, User, LogOut, Menu, X } from 'lucide-react';
import FavoritesPage from './components/favorite';
import PersonalInfoPage from './components/Personallinfo';
import { useRouter } from 'next/router';
import { isAuthenticated, getUserFromToken } from '../utils/auth';
import { getUserFavorites } from '../utils/gameStates';

const App = () => {
  const [currentPage, setCurrentPage] = useState('personal');
  const [favorites, setFavorites] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [gameStates, setGameStates] = useState({});
  const router = useRouter();

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load favorites when component mounts
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/Login');
      return;
    }

    const loadFavorites = () => {
      const userFavorites = getUserFavorites();
      setFavorites(userFavorites);
      
      // Load game states
      const token = localStorage.getItem('token');
      const allGameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
      const userGameStates = allGameStates[token] || {};
      setGameStates(userGameStates);
    };

    loadFavorites();
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutConfirm(false);
    window.location.href = '/Login';
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Menu items configuration
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, action: 'home' },
    { id: 'personal', label: 'Personal Info', icon: User, action: 'page' },
    { id: 'favorites', label: 'Favorites', icon: Heart, action: 'page' },
  ];

  const handleMenuClick = (item) => {
    if (item.action === 'home') {
      router.push('/');
    } else {
      setCurrentPage(item.id);
    }
    // Close mobile menu after selection
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle Like function
  const toggleLike = (gameId, gameName = 'Unknown Game') => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ User not logged in - cannot toggle like');
      return;
    }

    try {
      const allGameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
      const userGameStates = allGameStates[token] || {};
      
      const currentLikeState = userGameStates[gameId]?.isLiked || false;
      const newLikeState = !currentLikeState;

      // Update game states
      const newUserGameStates = {
        ...userGameStates,
        [gameId]: {
          ...userGameStates[gameId],
          isLiked: newLikeState,
          gameName: gameName, // Store game name for reference
          lastUpdated: new Date().toISOString()
        }
      };

      allGameStates[token] = newUserGameStates;
      localStorage.setItem('gameStates', JSON.stringify(allGameStates));
      setGameStates(newUserGameStates);

      // Console logging
      console.log('🎯 === LIKE ACTION ===');
      console.log('Action Type:', 'LIKE');
      console.log('Game ID:', gameId);
      console.log('Game Name:', gameName);
      console.log('Previous State:', currentLikeState ? 'LIKED' : 'NOT_LIKED');
      console.log('New State:', newLikeState ? 'LIKED' : 'NOT_LIKED');
      console.log('User Token:', token.substring(0, 20) + '...');
      console.log('Timestamp:', new Date().toISOString());
      console.log('=====================');

      // Prepare API format
      const apiPayload = prepareApiPayload(gameId, 'like', newLikeState, gameName);
      console.log('📡 API Payload Ready:', apiPayload);

      // Sync to backend
      syncGameStateToBackend(gameId, { isLiked: newLikeState }, gameName);

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("gameStatesChanged", { detail: newUserGameStates })
      );
    } catch (error) {
      console.error('❌ Error toggling like:', error);
    }
  };

  // Toggle Favorite function
  const toggleFavorite = (gameId, gameName = 'Unknown Game') => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ User not logged in - cannot toggle favorite');
      return;
    }
    
    try {
      const allGameStates = JSON.parse(localStorage.getItem('gameStates')) || {};
      const userGameStates = allGameStates[token] || {};
      
      const currentFavoriteState = userGameStates[gameId]?.isFavorite || false;
      const newFavoriteState = !currentFavoriteState;

      // Update game states
      const newUserGameStates = {
        ...userGameStates,
        [gameId]: {
          ...userGameStates[gameId],
          isFavorite: newFavoriteState,
          gameName: gameName, // Store game name for reference
          lastUpdated: new Date().toISOString()
        }
      };
      
      allGameStates[token] = newUserGameStates;
      localStorage.setItem('gameStates', JSON.stringify(allGameStates));
      setGameStates(newUserGameStates);

      // Console logging
      console.log('⭐ === FAVORITE ACTION ===');
      console.log('Action Type:', 'FAVORITE');
      console.log('Game ID:', gameId);
      console.log('Game Name:', gameName);
      console.log('Previous State:', currentFavoriteState ? 'FAVORITED' : 'NOT_FAVORITED');
      console.log('New State:', newFavoriteState ? 'FAVORITED' : 'NOT_FAVORITED');
      console.log('User Token:', token.substring(0, 20) + '...');
      console.log('Timestamp:', new Date().toISOString());
      console.log('==========================');

      // Prepare API format
      const apiPayload = prepareApiPayload(gameId, 'favorite', newFavoriteState, gameName);
      console.log('📡 API Payload Ready:', apiPayload);

      // Update favorites list
      const updatedFavorites = getUserFavorites();
      setFavorites(updatedFavorites);

      // Sync to backend
      syncGameStateToBackend(gameId, { isFavorite: newFavoriteState }, gameName);
      
      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("gameStatesChanged", { detail: newUserGameStates })
      );
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
    }
  };

  // Prepare API payload format
  const prepareApiPayload = (gameId, actionType, actionValue, gameName) => {
    const token = localStorage.getItem('token');
    const user = getUserFromToken(token);
    
    return {
      user_id: user?.id || null,
      boardgame_id: gameId,
      game_name: gameName,
      action_type: actionType, // 'like' or 'favorite'
      action_value: actionValue ? 1.0 : 0.0, // 1.0 for true, 0.0 for false
      timestamp: new Date().toISOString(),
      platform: 'web',
      session_id: token?.substring(0, 16) || 'unknown'
    };
  };

  // Sync game state to backend
  const syncGameStateToBackend = async (gameId, updateData, gameName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ Cannot sync state, user not logged in.');
      return false;
    }

    try {
      const user = getUserFromToken(token);
      if (!user) {
        console.error('❌ Cannot get user from token');
        return false;
      }

      // Determine action type and value
      let actionType, actionValue;
      if (updateData.isFavorite !== undefined) {
        actionType = 'favorite';
        actionValue = updateData.isFavorite ? 1.0 : 0.0;
      } else if (updateData.isLiked !== undefined) {
        actionType = 'like';
        actionValue = updateData.isLiked ? 1.0 : 0.0;
      }

      const payload = {
        user_id: user.id,
        boardgame_id: gameId,
        game_name: gameName,
        action_type: actionType,
        action_value: actionValue,
        timestamp: new Date().toISOString()
      };

      console.log('🚀 === BACKEND SYNC ===');
      console.log('Endpoint:', `${process.env.NEXT_PUBLIC_API_URL}/recommendations/actions`);
      console.log('Method:', 'POST');
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 20)}...`
      });
      console.log('Payload:', payload);
      console.log('======================');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ === BACKEND ERROR ===');
        console.error('Status:', response.status);
        console.error('Error Data:', errorData);
        console.error('========================');
        return false;
      }

      const responseData = await response.json();
      console.log('✅ === BACKEND SUCCESS ===');
      console.log('Status:', response.status);
      console.log('Response:', responseData);
      console.log('Action synced successfully for game:', gameName);
      console.log('===========================');
      return true;
    } catch (error) {
      console.error('❌ === BACKEND SYNC ERROR ===');
      console.error('Error:', error);
      console.error('==============================');
      return false;
    }
  };

  // Listen for game state changes
  useEffect(() => {
    const handleGameStatesChange = (event) => {
      setGameStates(event.detail);
    };

    window.addEventListener("gameStatesChanged", handleGameStatesChange);
    return () => {
      window.removeEventListener("gameStatesChanged", handleGameStatesChange);
    };
  }, []);

  // Sidebar component
  const Sidebar = ({ isOpen, onClose }) => (
    <div style={{
      width: isMobile ? '100%' : '250px',
      maxWidth: isMobile ? '280px' : '250px',
      backgroundColor: '#2d3748',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      left: isMobile ? (isOpen ? 0 : '-100%') : 0,
      top: 0,
      zIndex: 1000,
      transition: isMobile ? 'left 0.3s ease-in-out' : 'none',
      boxShadow: isMobile ? '2px 0 8px rgba(0,0,0,0.1)' : 'none'
    }}>
      {/* Header with close button for mobile */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #4a5568',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: isMobile ? '24px' : '30px',
          fontWeight: 'bold'
        }}>
          Profile
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, padding: '20px 0' }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id && item.action === 'page';
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              style={{
                width: '100%',
                padding: '12px 20px',
                backgroundColor: isActive ? '#7c3aed' : 'transparent',
                color: 'white',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '16px',
                transition: 'background-color 0.2s',
                marginBottom: '4px'
              }}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = '#4a5568';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <IconComponent size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div style={{ padding: '20px', borderTop: '1px solid #4a5568' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '16px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative'
    }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1001,
            backgroundColor: '#2d3748',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content */}
      <div style={{ 
        marginLeft: isMobile ? 0 : '250px', 
        flex: 1,
        minHeight: '100vh',
        paddingTop: isMobile ? '80px' : '0',
        width: isMobile ? '100%' : 'calc(100% - 250px)'
      }}>
        {/* Content Container with responsive padding */}
        <div style={{
          padding: isMobile ? '20px 16px' : '40px',
          maxWidth: '100%',
          margin: '0 auto'
        }}>

          {/* Render different pages based on current selection */}
          {currentPage === 'favorites' && (
            <FavoritesPage 
              favorites={favorites} 
              setFavorites={setFavorites}
              gameStates={gameStates}
              toggleLike={toggleLike}
              toggleFavorite={toggleFavorite}
              onFavoriteUpdate={(updatedFavorites) => {
                setFavorites(updatedFavorites);
              }}
            />
          )}
          {currentPage === 'personal' && <PersonalInfoPage />}
        </div>
      </div>

      {/* Custom Logout Confirmation Pop-up */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1002,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: isMobile ? '20px' : '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%',
            margin: '0 auto'
          }}>
            <h3 style={{ 
              marginBottom: '16px', 
              fontSize: isMobile ? '18px' : '20px', 
              color: '#333' 
            }}>
              Confirm Logout
            </h3>
            <p style={{ 
              marginBottom: '24px', 
              color: '#666',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Are you sure you want to log out?
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                style={{
                  padding: isMobile ? '12px 20px' : '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  width: isMobile ? '100%' : 'auto'
                }}
                onClick={confirmLogout}
              >
                Confirm Logout
              </button>
              <button
                style={{
                  padding: isMobile ? '12px 20px' : '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  width: isMobile ? '100%' : 'auto'
                }}
                onClick={cancelLogout}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;