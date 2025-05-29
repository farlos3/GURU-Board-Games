import React, { useState, useEffect } from 'react';
import { Home, Heart, User, LogOut } from 'lucide-react';
import FavoritesPage from './components/favorite';
import PersonalInfoPage from './components/Personallinfo';
import { useRouter } from 'next/router';

const App = () => {
  // เปลี่ยนจาก 'home' เป็น 'personal' เพื่อให้เริ่มต้นที่หน้า Personal Info
  const [currentPage, setCurrentPage] = useState('personal');
  const [favorites, setFavorites] = useState([]);
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Default board games data
  const defaultBoardGames = [
    {
      id: 1,
      name: 'Werewolf',
      tags: ['Family', 'Party', 'Strategy'],
      time: '35 min',
      players: '3-4 player',
      image: 'https://via.placeholder.com/150x100/4f46e5/white?text=Werewolf'
    },
    {
      id: 2,
      name: 'Catan',
      tags: ['Strategy', 'Trading', 'Building'],
      time: '60 min',
      players: '3-4 player',
      image: 'https://via.placeholder.com/150x100/059669/white?text=Catan'
    },
    {
      id: 3,
      name: 'Monopoly',
      tags: ['Classic', 'Family', 'Economic'],
      time: '90 min',
      players: '2-6 player',
      image: 'https://via.placeholder.com/150x100/dc2626/white?text=Monopoly'
    }
  ];

  // Load default games on component mount
  useEffect(() => {
    setFavorites(defaultBoardGames);
  }, []);

  // Handle going back to main website
  const handleGoHome = () => {
    if (window.confirm('คุณต้องการกลับไปหน้าหลักของเว็บไซต์หรือไม่?')) {
      // ในความเป็นจริง คุณจะทำการ redirect ไปหน้าหลัก
      alert('กำลังกลับไปหน้าหลักของเว็บไซต์...');
      // window.location.href = '/'; // หรือใช้ router ของ framework ที่ใช้
    }
  };

  // Handle logout
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutConfirm(false);
    router.push('/Login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Menu items configuration
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, action: 'home' }, // เปลี่ยนเป็น Back to Main Site
    { id: 'personal', label: 'Personal Info', icon: User, action: 'page' },
    { id: 'favorites', label: 'Favorites', icon: Heart, action: 'page' },
    
  ];

  const handleMenuClick = (item) => {
    if (item.action === 'home') {
      window.location.href = '/';
    } else {
      setCurrentPage(item.id);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Left Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#2d3748',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 1000
      }}>
        {/* Logo/Title */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #4a5568',
          fontSize: '30px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Profile
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

      {/* Main Content */}
      <div style={{ 
        marginLeft: '250px', 
        flex: 1,
        minHeight: '100vh'
      }}>
        {/* Render different pages based on current selection */}
        {currentPage === 'favorites' && (
          <FavoritesPage favorites={favorites} setFavorites={setFavorites} />
        )}
        {currentPage === 'personal' && <PersonalInfoPage />}
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
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#333' }}>Confirm Logout</h3>
            <p style={{ marginBottom: '24px', color: '#666' }}>Are you sure you want to log out?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: '#dc2626',
                  color: 'white',
                }}
                onClick={confirmLogout}
              >
                Confirm Logout
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: '#6b7280',
                  color: 'white',
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