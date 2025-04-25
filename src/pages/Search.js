import React, { useState } from "react";
import Nav from "./components/Navbar";
import styles from "../styles/Search.module.css";

function Search() {
  const [playerCount, setPlayerCount] = useState(4);
  const [playTime, setPlayTime] = useState(60);

  return (
    <>
      <Nav />
      <div className={styles.game_Text}>
        <div>BOARDGAMES</div>
      </div>
      <div className={styles.B_Search_all}>
        <div className={styles.B_B_Search}>
          <div className={styles.B_Search}>
          <div className={styles.Text_filter}>Filter</div>
          <div className={styles.Text_search}>Search</div>
          <div className={styles.box_Search}>
            <img src="search_icon.png" />
            <div className={styles.text_box_Search}>Search game...</div>
          </div>

          {/* ✅ Player Count */}
          <div className={styles.B_plyer_count}>
            <div className={styles.text_plyer_count}>Player Count</div>

            {/* ตัวเลขแสดงค่า */}
            <div className={styles.sliderValueRow}>
              <span>{playerCount}</span>
              <span>15</span>
            </div>

            {/* แถบเลื่อน */}
            <input
              type="range"
              min="1"
              max="15"
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          {/* ✅ Play Time */}
          <div className={styles.B_time}>
            <div className={styles.text_time}>Play Time (minutes)</div>

            {/* ตัวเลขแสดงค่า */}
            <div className={styles.sliderValueRow}>
              <span>{playTime}</span>
              <span>180+</span>
            </div>

            {/* แถบเลื่อน */}
            <input
              type="range"
              min="15"
              max="180"
              value={playTime}
              onChange={(e) => setPlayTime(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          {/* <div className={styles.B_time} > 
            <div className={styles.text_time} >Time</div>
            <div className={styles.box_time} > </div>
          </div> */}
          <div className={styles.B_Categories}>
            <div className={styles.text_time}>Categories</div>
            <label>
              <input type="checkbox" name="category" value="family" />
              <div>Family</div>
            </label>

            <label>
              <input type="checkbox" name="category" value="strategy" />
              <div>Strategy</div>
            </label>

            <label>
              <input type="checkbox" name="category" value="party" />
              <div>Party</div>
            </label>

            <label>
              <input type="checkbox" name="category" value="cooperative" />
              <div>Cooperative</div>
            </label>
          </div>
        </div>
        </div>

        <div className={styles.B_item_all}>
          <a
            className={styles.item_game}
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>Werewolf</div>
              <div className={styles.item_game_tag_B}>
                <div className={styles.item_game_tag}>Family</div>
                <div className={styles.item_game_tag}>Party</div>
                <div className={styles.item_game_tag}>strategy</div>
              </div>

              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" />
                  35 min
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" />
                  3-4 player
                </div>
              </div>
            </div>

            <div>
              <img src="item_2.png" />{" "}
            </div>
          </a>

          <a
            className={styles.item_game}
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>Werewolf</div>
              <div className={styles.item_game_tag_B}>
                <div className={styles.item_game_tag}>Family</div>
                <div className={styles.item_game_tag}>Party</div>
                <div className={styles.item_game_tag}>strategy</div>
              </div>

              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" />
                  35 min
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" />
                  3-4 player
                </div>
              </div>
            </div>

            <div>
              <img src="item_2.png" />{" "}
            </div>
          </a>

          <a
            className={styles.item_game}
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>Werewolf</div>
              <div className={styles.item_game_tag_B}>
                <div className={styles.item_game_tag}>Family</div>
                <div className={styles.item_game_tag}>Party</div>
                <div className={styles.item_game_tag}>strategy</div>
              </div>

              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" />
                  35 min
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" />
                  3-4 player
                </div>
              </div>
            </div>

            <div>
              <img src="item_2.png" />{" "}
            </div>
          </a>

          <a
            className={styles.item_game}
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>Werewolf</div>
              <div className={styles.item_game_tag_B}>
                <div className={styles.item_game_tag}>Family</div>
                <div className={styles.item_game_tag}>Party</div>
                <div className={styles.item_game_tag}>strategy</div>
              </div>

              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" />
                  35 min
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" />
                  3-4 player
                </div>
              </div>
            </div>

            <div>
              <img src="item_2.png" />{" "}
            </div>
          </a>

          <a
            className={styles.item_game}
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>Werewolf</div>
              <div className={styles.item_game_tag_B}>
                <div className={styles.item_game_tag}>Family</div>
                <div className={styles.item_game_tag}>Party</div>
                <div className={styles.item_game_tag}>strategy</div>
              </div>

              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" />
                  35 min
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" />
                  3-4 player
                </div>
              </div>
            </div>

            <div>
              <img src="item_2.png" />{" "}
            </div>
          </a>

          <a
            className={styles.item_game}
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>Werewolf</div>
              <div className={styles.item_game_tag_B}>
                <div className={styles.item_game_tag}>Family</div>
                <div className={styles.item_game_tag}>Party</div>
                <div className={styles.item_game_tag}>strategy</div>
              </div>

              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" />
                  35 min
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" />
                  3-4 player
                </div>
              </div>
            </div>

            <div>
              <img src="item_2.png" />{" "}
            </div>
          </a>

          <a
            className={styles.item_game}
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>Werewolf</div>
              <div className={styles.item_game_tag_B}>
                <div className={styles.item_game_tag}>Family</div>
                <div className={styles.item_game_tag}>Party</div>
                <div className={styles.item_game_tag}>strategy</div>
              </div>

              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" />
                  35 min
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" />
                  3-4 player
                </div>
              </div>
            </div>

            <div>
              <img src="item_2.png" />{" "}
            </div>
          </a>

          <a
            className={styles.item_game}
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>Werewolf</div>
              <div className={styles.item_game_tag_B}>
                <div className={styles.item_game_tag}>Family</div>
                <div className={styles.item_game_tag}>Party</div>
                <div className={styles.item_game_tag}>strategy</div>
              </div>

              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" />
                  35 min
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" />
                  3-4 player
                </div>
              </div>
            </div>

            <div>
              <img src="item_2.png" />{" "}
            </div>
          </a>

          <a
            className={styles.item_game}
            data-aos="fade-up"
            data-aos-anchor-placement="top-bottom"
          >
            <div className={styles.item_game_text}>
              <div className={styles.name_game}>Werewolf</div>
              <div className={styles.item_game_tag_B}>
                <div className={styles.item_game_tag}>Family</div>
                <div className={styles.item_game_tag}>Party</div>
                <div className={styles.item_game_tag}>strategy</div>
              </div>

              <div className={styles.B_item_game_player}>
                <div className={styles.item_game_player_1}>
                  <img src="clock-five.png" />
                  35 min
                </div>
                <div className={styles.item_game_player_2}>
                  <img src="users (1).png" />
                  3-4 player
                </div>
              </div>
            </div>

            <div>
              <img src="item_2.png" />{" "}
            </div>
          </a>
        </div>
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
export default Search;
