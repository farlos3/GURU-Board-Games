import React, { useState } from "react";
import styles from "../styles/Register.module.css";
import Link from "next/link";

function Register() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // กันไม่ให้ฟอร์มส่งก่อนเวลาอันควร

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
    } else {
      setPasswordError("");
      // ฟอร์มถูกต้อง ส่งไปหน้า Login
      window.location.href = "/Login";
    }
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
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.Text}>Register</div>
              <br />

              <div className={styles.info_user_text}>Full Name</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="user.png" />
                  <input
                    className={styles.info_user}
                    placeholder="Natthapol Premkamon"
                    required
                  />
                </div>
              </div>

              <div className={styles.info_email_text}>Email</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="envelope (2).png" />
                  <input
                    className={styles.info_email}
                    type="email"
                    name="email"
                    placeholder="you@gmail.com"
                    required
                    pattern=".*@gmail\.com"
                    title='โปรดใส่ "@gmail.com" ในที่อยู่อีเมล เช่น "example@gmail.com"'
                  />
                </div>
              </div>

              <div className={styles.info_password_text}>Password</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="lock.png" />
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

              <div className={styles.info_Cpassword_text}>Confirm Password</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="lock.png" />
                  <input
                    className={styles.info_Cpassword}
                    type="password"
                    placeholder="Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* 🔴 แสดงข้อความแจ้งเตือนถ้ารหัสไม่ตรงกัน */}
              {passwordError && (
                <div style={{ color: "red", marginBottom: "1rem", marginLeft: "2.5rem" , }}>
                  {passwordError}
                </div>
              )}
              {/* ⚠ */}
              <div className={styles.B_button_login}>
                <button type="submit" className={styles.button_login}>
                  Register
                </button>
              </div>
            </form>

            <div className={styles.B_Register}>
              <div className={styles.Register}>
                <div className={styles.Register_text}>
                  Already have an account?
                  <Link href="/Login">
                    <div className={styles.Register_sign_in}> Sign in </div>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
