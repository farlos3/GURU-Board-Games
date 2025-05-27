import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/OTP.module.css";
import Link from "next/link";
import { useRouter } from 'next/router';

export default function OTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(300);
  
  const inputRefs = useRef([]);
  const router = useRouter();
  const { email } = router.query;

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        
        // Focus last filled input or next empty one
        const lastIndex = Math.min(digits.length - 1, 5);
        inputRefs.current[lastIndex]?.focus();
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          otp: otpCode
        })
      });

      const data = await res.json();

      if (res.ok) {
        // OTP verified successfully
        router.push("/Login");
      } else {
        setError(data.message || "Invalid OTP code");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      });

      const data = await res.json();

      if (res.ok) {
        setCanResend(false);
        setCountdown(300);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.otpCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Verify Your Email</h1>
          <p className={styles.subtitle}>
            We've sent a 6-digit verification code to
          </p>
          <p className={styles.email}>{email || "your email"}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.otpInputContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={styles.otpInput}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.verifyButton}
            disabled={isLoading || otp.join("").length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className={styles.resendSection}>
            <p className={styles.resendText}>
              Didn't receive the code?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className={styles.resendButton}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              ) : (
                <span className={styles.countdown}>
                  Resend in {countdown}s
                </span>
              )}
            </p>
          </div>

          <div className={styles.backToLogin}>
            <Link href="/Login" className={styles.backLink}>
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}