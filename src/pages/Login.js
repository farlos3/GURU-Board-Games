"use client";
import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
  e.preventDefault();

  const fakeToken = "example_token_123";
  localStorage.setItem("token", fakeToken);
  router.push("/");
};

  return (
    <div className={styles.B_main}>
      <div className={styles.paint_over}>
        <div className={styles.B_text_logo}>
          <div className={styles.text_logo}>
            GURU
            <br />
            BOARD
            <br />
            GAME
          </div>
        </div>
        <div className={styles.B_Fill_info}>
          <div className={styles.Fill_info}>
            <div className={styles.Text}>LOGIN</div>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.info_user_text}>Email</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="/envelope (2).png" />
                  <input
                    className={styles.info_user}
                    type="email"
                    name="email"
                    placeholder="you@gmail.com"
                    required
                    pattern=".*@gmail\.com"
                    title='โปรดใส่ "@gmail.com" ในที่อยู่อีเมล เช่น "example@gmail.com"'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.info_password_text}>Password</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="/lock.png" />
                  <input
                    className={styles.info_password}
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.B_button_login}>
                <button type="submit" className={styles.button_login}>
                  Login
                </button>
              </div>
            </form>

            <div className={styles.B_Register}>
              <Link href="/Register">
                <div className={styles.Register}>Create Account</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
