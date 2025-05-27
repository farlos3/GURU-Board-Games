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
  const [error, setError] = useState(""); // ✅ เพิ่ม error state
  const [isLoading, setIsLoading] = useState(false); // ✅ เพิ่ม loading state

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบ password ก่อน
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsLoading(true); // ✅ เริ่ม loading

    try {
      console.log("Registering user...");
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
      console.log("Registration response:", data); // ✅ Debug log

      if (res.ok) {
        // ✅ Registration สำเร็จ - ไปหน้า OTP
        console.log("Registration successful, redirecting to OTP...");
        router.push({
          pathname: "/OTP",
          query: { 
            email: email, // ใช้ email จาก state
            type: 'register' // ✅ เพิ่ม type parameter
          }
        });
      } else {
        // ✅ Registration ไม่สำเร็จ - แสดง error
        setError(data.error || data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // ✅ จบ loading
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
                  <img className={styles.icon} src="user.png" alt="user icon" />
                  <input
                    className={styles.info_user}
                    type="text"
                    name="fullName"
                    placeholder="Natthapol Premkamon"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className={styles.info_username_text}>Username</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="user.png" alt="user icon" />
                  <input
                    className={styles.info_username}
                    type="text"
                    name="username"
                    placeholder="natthapol123"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className={styles.info_email_text}>Email</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="envelope (2).png" alt="email icon" />
                  <input
                    className={styles.info_email}
                    type="email"
                    name="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className={styles.info_password_text}>Password</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="lock.png" alt="lock icon" />
                  <input
                    className={styles.info_password}
                    type="password"
                    name="password"
                    placeholder="Password (min 6 characters)"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.info_Cpassword_text}>Confirm Password</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="lock.png" alt="lock icon" />
                  <input
                    className={styles.info_Cpassword}
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* ✅ แสดง error message */}
              {error && (
                <div style={{ 
                  color: "red", 
                  marginBottom: "1rem", 
                  marginLeft: "2.5rem",
                  fontSize: "0.9rem"
                }}>
                  {error}
                </div>
              )}

              <div className={styles.B_button_login}>
                <button 
                  type="submit" 
                  className={styles.button_login}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
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