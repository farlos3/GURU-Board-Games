import React, { useEffect, useState } from 'react';
import Nav from './components/Navbar';
import styles from '../styles/index.module.css';

import AOS from 'aos';
import 'aos/dist/aos.css';


import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Link from 'next/link';
import games from '../pages/testjoson.json';

const images = [
  'Wolf.png',
  'karthik.jpg',
  'Wolf.png',
  'karthik.jpg',
  'Wolf.png',
  'olav-ahrens.jpg'
];

 function index() {
  
  useEffect(() => {
    AOS.init({
      duration: 1500, // ความเร็วในการ animate (ms)
      once: true,     // ให้ animate แค่ครั้งแรกที่ scroll มาเจอ
    });

     // Fetch JSON data
    // fetch('../pages/testjoson.json')
    //   .then((res) => res.json())
    //   .then((data) => setGames(data));


  }, []);
  return (
    <>
    <Nav />


      {/* <div className = {styles.recommend_B} >
        <div className ={styles.recommend_B_B} >
          <img className ={styles.img_kar} src="RecommendWolf.png" />         
        </div>
      </div> */}
      <div className={styles.slider_container}>
      <Swiper
        slidesPerView={1.8} // เห็นข้างๆด้วย
        centeredSlides={true}
        spaceBetween={5}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        navigation={true}
        pagination={{ clickable: true }}
        modules={[Autoplay, Navigation, Pagination]}
        className="mySwiper"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img src={img}  className={styles.slide_image}  />
          </SwiperSlide>
        ))}
      </Swiper>
      </div>
        



      {/* <h1>หน้าแรก</h1>
      <Link to="/search">ไปที่หน้าค้นหา</Link> */}


      <div className ={styles.type_game_B} >
        <a className ={styles.type_game} > 
          <img src="marisa.jpg" alt="บอร์ดเกม ครอบครัว" />
          <div className={styles.overlay}>บอร์ดเกม<br/>ครอบครัว</div>
        </a>
        <a className ={styles.type_game}><img src="Adventure.png" />
          <div className={styles.overlay}>บอร์ดเกม<br/>ผจญภัย</div>
        </a>
        <a className ={styles.type_game}>
          <img src="2h-media.jpg" /> 
          <div className={styles.overlay}>บอร์ดเกม<br/>ปาร์ตี้</div>
        </a>
        <a className ={styles.type_game}>
          <img src="ross.jpg" /> 
          <div className={styles.overlay}>บอร์ดเกม<br/>วางแผน</div>
        </a>
        <a className ={styles.type_game}>
          <img src="defraud.png" />
          <div className={styles.overlay}>บอร์ดเกม<br/>แนวโกหก</div>
           </a>
        <a className ={styles.type_game}>
          <img src="olav-ahrens.jpg" />
          <div className={styles.overlay}>บอร์ดเกม<br/>แนวแก้ปริศนา</div>
           </a>
      </div>
      {/* <div className={styles.recommend_game_B}>
        <div className={styles.recommend_game}></div>
        <div className={styles.recommend_game}></div>
        <div className={styles.recommend_game}></div>
      </div>
      <div>
        <div>Recommended Board Games </div>
        <div>
          <div>
            <img src="nika.jpg" />
          </div>
          <div>
            <img src="nika.jpg" />
          </div>
          <div>

          </div>
        </div>
      </div> */}
      <div className ={styles.text_board_game} >  BOARD GAME</div>
      
      
      <div className ={styles.show_game_all}>
       {games.map((game, idx) => (
          <Link key={idx} href="/game" className={styles.item_game} data-aos="fade-up">
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>{game.name}</div>
              <div className={styles.item_game_tag_B}>
                {game.tags.map((tag, tagIndex) => (
                  <div key={tagIndex} className={styles.item_game_tag}>
                    {tag}
                  </div>
                ))}
              </div>
              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" />
                  {game.duration}
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" />
                  {game.players}
                </div>
              </div>
            </div>
            <div>
              <img src={game.image} />
            </div>
          </Link>
        ))}
      </div>
        
        
      
     

      <div className ={styles.Footer} >
          <div className ={styles.Footer_B1} >
            <div className ={styles.Footer_B1_S1} >GURU<br/>BOARD<br/>GAME </div>
            <div className ={styles.Footer_B1_S2} >
              <div>GURU BOARD GAME</div>
              <a>Home</a>
              <a>Search Game</a>
              <a>Game</a>
            </div>
            <div className ={styles.Footer_B1_S3} >
              <div> ABOUT US </div>
              <a>Line</a>
              <a>Facebook</a>
              <a>Instagram</a>
            </div>
          </div>
          <div className ={styles.Footer_B2}>
              <div className ={styles.Footer_B2_box}></div>
              <div className ={styles.Footer_B2_text}>
                <div>Gmail : Khawfang@gmail.com</div>
                <div>Contact : 064-457-7169</div>
              </div>
          </div>
      </div>
    </>
  );
}

export default index;
