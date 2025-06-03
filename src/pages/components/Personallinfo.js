import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { useRouter } from 'next/router';

const PersonalInfoPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    username: '',
  });
  const [editData, setEditData] = useState({
  });
  const [headerColor, setHeaderColor] = useState('#4ecdc4');
  const [profileImage, setProfileImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const router = useRouter();

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Define fetchUserProfile outside of useEffect
  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfileData(prev => ({
        ...prev,
        name: data.fullName || data.name || '',
        email: data.email || '',
        username: data.username || '',
        avatarUrl: data.avatarUrl || null,
      }));

    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    // Check for token on mount and redirect if not found
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/Login');
    }

    // Call fetchUserProfile here to load data on mount
    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
    });
  };

  const handleSave = async () => {
    const updateData = {
      username: profileData.username,
      email: profileData.email,
      fullName: profileData.name,
      avatarUrl: profileImage || profileData.avatarUrl,
    };

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for update.');
      alert('You need to be logged in to update your profile.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, Message: ${errorData.message || response.statusText}`);
      }

      // Call fetchUserProfile here to refresh data after saving
      await fetchUserProfile();
      setIsEditing(false);
      // alert('Profile updated successfully!');

    } catch (error) {
      console.error('Error updating profile data:', error);
      alert(`Failed to update profile. ${error.message}`);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
    });
  };

  const handleColorChange = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
    const currentIndex = colors.indexOf(headerColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setHeaderColor(colors[nextIndex]);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setDeletePassword('');

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to be logged in to delete your account.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: profileData.username,
          email: profileData.email,
          password: deletePassword,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/Login';

    } catch (error) {
      console.error('Error deleting account:', error);
      alert(`Failed to delete account: ${error.message}`);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletePassword('');
  };

  return (
    <div style={{ 
      padding: isMobile ? '20px 16px' : '40px 60px',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ 
        fontSize: isMobile ? '24px' : '32px', 
        fontWeight: 'bold', 
        marginBottom: isMobile ? '20px' : '40px', 
        color: '#333',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        Personal information
      </h1>
      
      {/* Profile Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '0',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        maxWidth: '100%'
      }}>
        <div style={{
          height: isMobile ? '200px' : '250px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: headerColor
        }}>
          <div 
            size={20} 
            style={{
              position: 'absolute',
              top: isMobile ? '8px' : '10px',
              right: isMobile ? '12px' : '16px',
              cursor: 'pointer',
              color: 'white',
              fontSize: isMobile ? '24px' : '30px'
            }}
            onClick={handleColorChange}
          >
            🎨
          </div>
          <div 
            style={{
              width: isMobile ? '120px' : '150px',
              height: isMobile ? '120px' : '150px',
              borderRadius: '50%',
              backgroundColor: '#e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '4px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {profileImage || profileData.avatarUrl ? (
              <img 
                src={profileImage || profileData.avatarUrl} 
                alt="Profile" 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <User size={isMobile ? 50 : 60} color="#666" />
            )}
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '16px 20px 24px 20px' : '20px 40px 40px 40px',
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: 'bold',
          color: '#333'
        }}>
           {isEditing ? (
             <input 
               type="text"
               value={profileData.name}
               onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
               style={{
                 textAlign: 'center',
                 fontSize: isMobile ? '20px' : '24px',
                 fontWeight: 'bold',
                 color: '#333',
                 border: '2px solid #e5e5e5',
                 borderRadius: '8px',
                 padding: isMobile ? '6px' : '8px',
                 width: '100%',
                 boxSizing: 'border-box'
               }}
             />
           ) : (
             profileData.name
           )}
        </div>
      </div>

      {/* Form Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: isMobile ? '20px' : '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: isMobile ? '20px' : '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '500',
            color: '#333'
          }}>Username</label>
          <input
            type="text"
            value={profileData.username}
            disabled={true}
            style={{
              width: '100%',
              padding: isMobile ? '10px 14px' : '12px 16px',
              border: '2px solid #e5e5e5',
              color: "rgb(0, 0, 0)",
              borderRadius: '8px',
              fontSize: isMobile ? '14px' : '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
              backgroundColor: '#f9f9f9',
              cursor: 'not-allowed'
            }}
            readOnly
          />
        </div>
            
        <div style={{ marginBottom: isMobile ? '20px' : '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '500',
            color: '#333'
          }}>Email</label>
          <input
            type="email"
            value={profileData.email}
            disabled={true}
            style={{
              width: '100%',
              padding: isMobile ? '10px 14px' : '12px 16px',
              border: '2px solid #e5e5e5',
              color: "rgb(0, 0, 0)",
              borderRadius: '8px',
              fontSize: isMobile ? '14px' : '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
              backgroundColor: '#f9f9f9',
              cursor: 'not-allowed'
            }}
            readOnly
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: isMobile ? '20px' : '24px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {isEditing ? (
            <>
              <button
                style={{
                  padding: isMobile ? '12px 20px' : '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  width: isMobile ? '100%' : 'auto'
                }}
                onClick={handleSave}
              >
                Save
              </button>
              <button
                style={{
                  padding: isMobile ? '12px 20px' : '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  width: isMobile ? '100%' : 'auto'
                }}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              style={{
                padding: isMobile ? '12px 20px' : '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                backgroundColor: '#ef4444',
                color: 'white',
                width: isMobile ? '100%' : 'auto'
              }}
              onClick={handleEdit}
            >
              <span>Edit</span>
              <span style={{ fontSize: '14px' }}>✏️</span>
            </button>
          )}
        </div>
      </div>

      {/* Remove account link */}
      <div 
        style={{
          position: isMobile ? 'static' : 'absolute',
          bottom: isMobile ? 'auto' : '-20px',
          right: isMobile ? 'auto' : '60px',
          marginTop: isMobile ? '20px' : '0',
          textAlign: isMobile ? 'center' : 'right',
          color: '#888',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontSize: '14px'
        }}
        onClick={handleDeleteAccount}
      >
        Delete account
      </div>

      {/* Custom Delete Confirmation Pop-up */}
      {showDeleteConfirm && (
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
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: isMobile ? '20px' : '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%',
            margin: '0 auto'
          }}>
            <h3 style={{ 
              marginBottom: '16px', 
              fontSize: isMobile ? '18px' : '20px', 
              color: '#333' 
            }}>
              Confirm Account Deletion
            </h3>
            <p style={{ 
              marginBottom: '16px', 
              color: '#666',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              Please enter your password to confirm account deletion.
            </p>
            <input
               type="password"
               placeholder="Enter your password"
               value={deletePassword}
               onChange={(e) => setDeletePassword(e.target.value)}
               style={{
                 width: '100%',
                 padding: isMobile ? '12px' : '10px',
                 marginBottom: '24px',
                 border: '1px solid #ccc',
                 borderRadius: '4px',
                 boxSizing: 'border-box',
                 fontSize: isMobile ? '14px' : '16px'
               }}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                style={{
                  padding: isMobile ? '12px 20px' : '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  width: isMobile ? '100%' : 'auto'
                }}
                onClick={confirmDelete}
              >
                Confirm Delete
              </button>
              <button
                style={{
                  padding: isMobile ? '12px 20px' : '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  width: isMobile ? '100%' : 'auto'
                }}
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoPage;