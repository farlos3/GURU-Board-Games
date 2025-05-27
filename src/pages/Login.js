import React, { useState } from "react";
import styles from "../styles/Login.module.css";
import Link from "next/link";
import { useRouter } from 'next/router';

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          identifier: emailOrUsername.trim(),
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
      } else if (data.requireOtp) {
        // 👉 ส่งไปยืนยัน OTP
        console.log("OTP required, redirecting to OTP page");
        router.push({
          pathname: "/OTP",
          query: { 
            email: data.email,
            temp_token: data.temp_token
          }
        });
      } else {
        // 👉 เข้าระบบตามปกติ
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Login successful, redirecting to home");
        router.push("/");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
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
            <div className={styles.Text}>LOGIN</div>
            
            {/* แสดง Error Message */}
            {error && (
              <div className={styles.errorMessage} style={{
                backgroundColor: '#fee',
                color: '#c33',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '15px',
                border: '1px solid #fcc'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.info_user_text}>Email or Username</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="envelope (2).png" alt="Email icon" />
                  <input
                    className={styles.info_user}
                    type="text"
                    name="email"
                    placeholder="you@gmail.com"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.info_password_text}>Password</div>
              <div className={styles.inputContainer}>
                <div className={styles.inputWithIcon}>
                  <img className={styles.icon} src="lock.png" alt="Password icon" />
                  <input
                    className={styles.info_password}
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.B_button_login}>
                <button 
                  type="submit" 
                  className={styles.button_login}
                  disabled={isLoading}
                  style={{
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
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