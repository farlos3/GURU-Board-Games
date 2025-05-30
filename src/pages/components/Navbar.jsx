"use client";

import React, { useEffect, useState } from 'react';
import styles from '../../styles/Navbar.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token'); // assuming the token is stored as 'token'
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    window.location.reload(); // Refresh the current page
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>GURU BOARD GAME</div>

      <div className={styles.Link_All}>
        <Link href="/">
          <div className={styles.navLink}>HOME</div>
        </Link>
        {/* <a href="#" className={styles.navLink}>GAME POPULAR</a> */}
        <Link href="/Search">
          <div className={styles.navLink}>SEARCH GAME</div>
        </Link>
      </div>
      
      <div  className={styles.log_sign}>
        {isLoggedIn ? (
          <>
            <Link href="/profile_user">
              <div className={styles.navLink}>Profile</div>
            </Link>
            <button onClick={handleLogout} className={styles.navLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/Login">
              <div className={styles.login} >Login</div>
            </Link>
            <Link href="/Register">
              <div className={styles.sign} >Sign up</div>
            </Link>
          </>
        )}
        </div>
    </nav>
  );
}

export default Navbar;
