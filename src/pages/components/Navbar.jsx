"use client";

import React, { useEffect, useState } from 'react';
import styles from '../../styles/Navbar.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false); // Close menu after logout
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
                  <span className={styles.menuIcon}>👤</span>
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
    </>
  );
}

export default Navbar;