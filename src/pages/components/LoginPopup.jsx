import React from 'react';
import { useRouter } from 'next/router';

const LoginPopup = ({ isOpen, onClose, message }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    router.push('/Login');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%',
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#333' }}>Login Required</h3>
        <p style={{ marginBottom: '24px', color: '#666' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              backgroundColor: '#7c3aed',
              color: 'white',
              transition: 'background-color 0.2s'
            }}
            onClick={handleLogin}
            onMouseOver={(e) => e.target.style.backgroundColor = '#6d28d9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#7c3aed'}
          >
            Login Now
          </button>
          <button
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              backgroundColor: '#6b7280',
              color: 'white',
              transition: 'background-color 0.2s'
            }}
            onClick={onClose}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup; 