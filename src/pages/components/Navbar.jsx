"use client";

import React, { useEffect, useState } from 'react';
import styles from '../../styles/Navbar.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token'); // assuming the token is stored as 'token'
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setShowLogoutConfirm(false);
    setIsMobileMenuOpen(false);
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={styles.navbar}>
        {/* Mobile Hamburger Button */}
        <button 
          className={styles.hamburger}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>

        <div className={styles.logo}>GURU BOARD GAME</div>

        {/* Desktop Navigation Links */}
        <div className={styles.Link_All}>
          <Link href="/">
            <div className={styles.navLink}>HOME</div>
          </Link>
          <Link href="/Search">
            <div className={styles.navLink}>SEARCH GAME</div>
          </Link>
        </div>
        
        {/* Desktop Login/Logout */}
        <div className={styles.log_sign}>
          {isLoggedIn ? (
            <>
              <Link href="/profile_user">
                <div className={styles.navLink}>Profile</div>
              </Link>
              <button 
                onClick={handleLogout} 
                className={styles.navLink} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/Login">
                <div className={styles.login}>Login</div>
              </Link>
              <Link href="/Register">
                <div className={styles.sign}>Sign up</div>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <div className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.active : ''}`} onClick={closeMobileMenu}></div>
      
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <div className={styles.mobileMenuLogo}>GURU BOARD GAME</div>
          <button className={styles.closeButton} onClick={closeMobileMenu}>
            ×
          </button>
        </div>
        
        <div className={styles.mobileMenuContent}>
          {/* Navigation Items */}
          <Link href="/" onClick={closeMobileMenu}>
            <div className={styles.mobileMenuItem}>
              HOME
            </div>
          </Link>
          
          <Link href="/Search" onClick={closeMobileMenu}>
            <div className={styles.mobileMenuItem}>
              SEARCH GAME
            </div>
          </Link>
          
          {/* Profile section - only show if logged in */}
          {isLoggedIn && (
            <>
              <div className={styles.mobileMenuDivider}></div>
              <Link href="/profile_user" onClick={closeMobileMenu}>
                <div className={styles.mobileMenuItem}>
                  
                  Profile
                </div>
              </Link>
            </>
          )}
        </div>
        
        {/* Auth Section at Bottom */}
        <div className={styles.mobileMenuFooter}>
          {isLoggedIn ? (
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/Login" onClick={closeMobileMenu}>
                <div className={styles.mobileLoginButton}>
                  Login
                </div>
              </Link>
              <Link href="/Register" onClick={closeMobileMenu}>
                <div className={styles.mobileSignupButton}>
                  Sign up
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Custom Logout Confirmation Pop-up (Copied from profile_user.js with minor adjustments) */}
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
        }} onClick={cancelLogout}
        >
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%',
            margin: '0 auto'
          }} onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              marginBottom: '16px', 
              fontSize: '20px', 
              color: '#333' 
            }}>
              Confirm Logout
            </h3>
            <p style={{ 
              marginBottom: '24px', 
              color: '#666',
              fontSize: '16px'
            }}>
              Are you sure you want to log out?
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px',
              flexDirection: 'row'
            }}>
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
                  width: 'auto'
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
                  width: 'auto'
                }}
                onClick={cancelLogout}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;