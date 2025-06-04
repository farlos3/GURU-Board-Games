import { useEffect } from 'react';
import { initActivityTracking } from '../utils/userActivity';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
