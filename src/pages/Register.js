import React from 'react';
import styles from '../styles/Register.module.css'
import Link from 'next/link'
function Register() {
  
  
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
             
              <div  className={styles.Text} >Register</div>
              <br/>
              <div className={styles.info_user_text}>Usename</div>
              <input  className={styles.info_user} /> 
              <div className={styles.info_email_text} >Email</div>
              <input className={styles.info_email}  type="email" name="email" />

              <div className={styles.info_password_text}>Password</div>
              <input className={styles.info_password}  type="password" /> 
              <div className={styles.info_Cpassword_text}>Confirm password</div>
              <input className={styles.info_Cpassword}  type="password" /> 

              
              <div className={styles.B_button_login} > 
              <Link href="/Login">
                <button className={styles.button_login} >
                Register
                </button>
                </Link>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      
    );
}

export default Register;