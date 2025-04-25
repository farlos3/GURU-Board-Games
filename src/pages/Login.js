import React from 'react';
import styles from '../styles/Login.module.css';
import Link from 'next/link';
function Login() {
  
  
    return (
      
      <div className={styles.B_main} >
        <div className={styles.paint_over}>
          <div className={styles.B_text_logo}>
            
            <div className={styles.text_logo}>
              
              GURU<br/>BOARD<br/>GAME
              
            </div>

          </div>
          <div className={styles.B_Fill_info} >
            
            <div  className={styles.Fill_info} >
             
              <div  className={styles.Text} >LOGIN</div>
              <br/>
              <div className={styles.info_user_text}>Usename</div>
              <input  className={styles.info_user} /> 
              
              <div className={styles.info_password_text}>Password</div>
              <input className={styles.info_password}  type="password" /> 
              <div className={styles.B_Register} >
                <Link href="/Register">
                  <div className={styles.Register}>Register</div>
                </Link>
              </div>
              
              
              <div className={styles.B_button_login} > 
                <button className={styles.button_login} >
                Login
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      
    );
}

export default Login;