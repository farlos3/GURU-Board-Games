import { useEffect } from 'react';
import { initActivityTracking } from '../utils/userActivity';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize activity tracking when app starts
    initActivityTracking();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
