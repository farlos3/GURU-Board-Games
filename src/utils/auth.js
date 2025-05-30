// Utility functions for authentication and token management

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    // Decode the JWT token (assuming it's in the format header.payload.signature)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  
  const user = getUserFromToken();
  if (!user) return false;
  
  // Check if token is expired
  const currentTime = Date.now() / 1000;
  return user.exp > currentTime;
};

export const requireAuth = () => {
  if (!isAuthenticated()) {
    alert('Please log in to perform this action');
    return false;
  }
  return true;
}; 