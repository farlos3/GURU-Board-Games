"use client";
import React from 'react';
import styles from '../../styles/Navbar.module.css';
import Link from 'next/link';


function Navbar() {
  
  return (
    <nav className={styles.navbar}>
      <div  className={styles.logo} >GURU BOARD GAME</div>

      <div className={styles.Link_All}>
        <Link href="/"> 
        <div className={styles.navLink} >HOME</div>
        </Link>
        <a href="#" className={styles.navLink} >GAME POPULAR</a>
        <Link href="/Search">
          <div className={styles.navLink} >SEARCH GAME</div>
        </Link>
      </div>
      
      <div  className={styles.log_sign}>
        <Link href="/Login">
          <div className={styles.login} >Login</div>
        </Link>
        <Link href="/Register">
          <div className={styles.sign} >Sign up</div>
        </Link>
        </div>
    </nav>
  )
}

export default Navbar