"use client";
import React, { useEffect, useState } from 'react';
import styles from '../../styles/Navbar.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // เช็ก token ว่าผู้ใช้ล็อกอินหรือยัง
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // ถ้ามี token → true
  }, []);

  // ฟังก์ชันเมื่อผู้ใช้กด logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // ลบ token
    setIsLoggedIn(false); // อัปเดต state
    router.push('/Login'); // พาไปหน้า Login
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

      <div className={styles.log_sign}>
        {!isLoggedIn ? (
          <>
            <Link href="/Login">
              <div className={styles.login}>Login</div>
            </Link>
            <Link href="/Register">
              <div className={styles.sign}>Sign up</div>
            </Link>
          </>
        ) : (
          <div className={styles.login} onClick={handleLogout} style={{ cursor: 'pointer' }}>
            Logout
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
