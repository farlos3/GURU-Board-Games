import React, { useState, useEffect } from "react";
import styles from "/src/styles/HowToPlay.module.css";
import Nav from "/src/pages/components/Navbar";
import Link from "next/link";
import { useRouter } from "next/router";
import games from "/src/pages/Real-data.json"; // ใช้ข้อมูลเกมหลัก


const HowToPlay = () => {
  const router = useRouter();
  const { id } = router.query; // รับ ID จาก URL
  const [currentGame, setCurrentGame] = useState(null);
  const [gameHowToPlay, setGameHowToPlay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (id) {
    try {
      const gameId = parseInt(id);
      const game = games[gameId];

      if (game) {
        setCurrentGame(game);
        setGameHowToPlay({
          id: gameId,
          name: game.name,
          howToplay: game.howToplay || [],
        });
      }
    } catch (error) {
      console.error("Error loading game data:", error);
    } finally {
      setLoading(false);
    }
  }
}, [id]);


  const handleBackClick = () => {
    // ย้อนกลับไปหน้ารายละเอียดเกมที่เคยกดมา
    router.push(`/game/${id}`);
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Nav />
        <div className={styles.container}>
          <div>Loading game instructions...</div>
        </div>
      </>
    );
  }

  // ถ้าไม่พบเกม
  if (!currentGame) {
    return (
      <>
        <Nav />
        <div className={styles.container}>
          <div>Game not found!</div>
          <Link href="/">
            <button>Back to Home</button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />

      {/* ปุ่มย้อนกลับ */}
      <div className={styles.backButtonContainer}>
        <button onClick={handleBackClick} className={styles.backButton}>
          <svg
            className={styles.backIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </button>
      </div>

      {/* ส่วนเนื้อหาหลัก */}
      <div className={styles.container}>
        <img
          src={`/${currentGame.image}`} // ใช้รูปจากข้อมูลเกมหลัก
          alt={currentGame.name}
          className={styles.headerImage}
        />

        <div className={styles.content}>
          <h1 className={styles.nameborad}>
            <strong>{currentGame.name}</strong>
          </h1>

          <h2><br />How to play board games {currentGame.name}</h2>
          
          {/* แสดงข้อมูลพื้นฐานของเกม */}
          <br/>
          <div className={styles.gameBasicInfo}>
            <div className={styles.gameInfoItem}>
              <strong>Players:</strong> {currentGame.players}
            </div>
            <div className={styles.gameInfoItem}>
              <strong>Duration:</strong> {currentGame.duration}
            </div>
            <div className={styles.gameInfoItem}>
              <strong>Categories:</strong> {currentGame.tags.join(", ")}
            </div>
          </div>

          {/* แสดงวิธีการเล่น */}
          {gameHowToPlay && gameHowToPlay.howToplay && gameHowToPlay.howToplay.length > 0 ? (
            gameHowToPlay.howToplay.map((section, index) => (
              <div key={index}>
                <h3><br />{section.title}</h3>
                <ol className={styles.htp}> 
                  {section.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            ))
          ) : (
            /* ถ้าไม่มีข้อมูลวิธีการเล่น แสดงข้อความเริ่มต้น */
            <div className={styles.noInstructions}>
                <br/>
              <p>Game instructions are being prepared. Please check back later!</p>
              <p>In the meantime, you can explore other games or contact us for more information.</p>
            </div>
          )}
        </div>
      </div>

      {/* ส่วน Footer */}
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
    </>
  );
};

export default HowToPlay;