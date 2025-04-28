import React, { useState } from "react";
import Nav from "./components/Navbar";
import styles from "../styles/game.module.css";
import Link from 'next/link';

function Search() {
  return (
    <>
      <Nav />
      <div>
        <div className={styles.tag_back}> </div>
        <div className={styles.B_PhotoGame_details}>
          <div className={styles.B_PhotoGame}>
            {" "}
            <img src="item_2.png" />{" "}
          </div>
          <div className={styles.B_B_details}>
            <div className={styles.B_details}>
              <h1>Werewolf</h1>
              <div className={styles.details_text}>
                Uncover hidden identities and survive the tension-filled nights
                in Werewolf — a game of deduction, deception, and dramatic
                reveal. Players take on secret roles as villagers or werewolves,
                with each night bringing new danger and each day filled with
                accusations, alliances, and shocking betrayals. Work together to
                unmask the wolves — or blend in and strike from the shadows.
                With a rotating cast of roles and endless possibilities for
                bluffing and strategy, no two games are ever the same. Perfect
                for parties and group gatherings, Werewolf turns friends into
                foes and silence into suspicion.
              </div>

              <div className={styles.B_player_play_time}>
                <div className={styles.B_player}>
                  <div> Player</div>
                  3-4
                </div>
                <div className={styles.B_play_time}>
                  <div> Play Time</div>
                  35 minutes
                </div>
              </div>
              <div className={styles.B_Categories}>
                <div>Categories</div>
                <div className={styles.item_game_text_Categories}>
                  
                  <div className={styles.item_game_tag_B_Categories}>
                    <div className={styles.item_game_tag_Categories}>Family</div>
                    <div className={styles.item_game_tag_Categories}>Party</div>
                    <div className={styles.item_game_tag_Categories}>strategy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.B_Similar_games}>
            <div className={styles.text_Similar_games} > Similar Games You Might Enjoy </div>
            <div className ={styles.show_game_all}>
       <Link href="/game">
          <div
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
          </div>
        </Link>
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
              <a>Home</a>
              <a>Search Game</a>
              <a>Game</a>
            </div>
            <div className={styles.Footer_B1_S3}>
              <div> ABOUT US </div>
              <a>Line</a>
              <a>Facebook</a>
              <a>Instagram</a>
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
      </div>
    </>
  );
}
export default Search;
