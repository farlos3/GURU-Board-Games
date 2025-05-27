import React, { useState } from "react";
import styles from "../styles/Register.module.css";
import Link from "next/link";
import { useRouter } from 'next/router';

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");

    try {
      console.log("Fetching URL:", `${process.env.NEXT_PUBLIC_API_URL}/auth/register`);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          username,
          email,
          password
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to OTP page with email parameter
        router.push({
          pathname: '/OTP',
          query: { email: email }
        });
      } else {
        setPasswordError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setPasswordError("Something went wrong. Please try again.");
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
              <div className={styles.info_user_text}>Full Name</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="user.png" />
                  <input
                    className={styles.info_user}
                    type="text"
                    name="fullName"
                    placeholder="Natthapol Premkamon"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.info_username_text}>Username</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="user.png" />
                  <input
                    className={styles.info_username}
                    type="text"
                    name="username"
                    placeholder="natthapol123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    name="password"
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
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* 🔴 แสดงข้อความแจ้งเตือนถ้ารหัสไม่ตรงกัน */}
              {passwordError && (
                <div style={{ color: "red", marginBottom: "1rem", marginLeft: "2.5rem" }}>
                  {passwordError}
                </div>
              )}

              <div className={styles.B_button_login}>
                <button type="submit" className={styles.button_login}>
                  Register
                </button>
              </div>
            </form>

            <div className={styles.B_Register}>
              <div className={styles.Register}>
                <span className={styles.Register_text}>
                  Already have an account?{" "}
                  <Link href="/Login">
                    <span className={styles.Register_sign_in}>Sign in</span>
                  </Link>
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}