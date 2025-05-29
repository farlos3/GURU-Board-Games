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

  const router = useRouter();

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
    <div style={{ padding: '40px 60px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '40px', color: '#333' }}>Personal information</h1>
      
      {/* Profile Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '0',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          height: '250px',
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
              top: '10px',
              right: '16px',
              cursor: 'pointer',
              color: 'white',
              fontSize: '30px'
            }}
            onClick={handleColorChange}
          >
            🎨
          </div>
          <div 
            style={{
              width: '150px',
              height: '150px',
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
              <User size={60} color="#666" />
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
          padding: '20px 40px 40px 40px',
          fontSize: '24px',
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
                 fontSize: '24px',
                 fontWeight: 'bold',
                 color: '#333',
                 border: '2px solid #e5e5e5',
                 borderRadius: '8px',
                 padding: '8px',
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
        padding: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#333'
          }}>Username</label>
          <input
            type="text"
            value={profileData.username}
            disabled={true}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e5e5',
              color: "rgb(0, 0, 0)",
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
              backgroundColor: '#f9f9f9',
              cursor: 'not-allowed'
            }}
            readOnly
          />
        </div>
            
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#333'
          }}>Email</label>
          <input
            type="email"
            value={profileData.email}
            disabled={true}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e5e5',
              color: "rgb(0, 0, 0)",
              borderRadius: '8px',
              fontSize: '16px',
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
          marginTop: '24px'
        }}>
          {isEditing ? (
            <>
              <button
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#22c55e',
                  color: 'white'
                }}
                onClick={handleSave}
              >
                Save
              </button>
              <button
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#6b7280',
                  color: 'white'
                }}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: '#ef4444',
                color: 'white'
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
          position: 'absolute',
          bottom: '-20px',
          right: '60px',
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
            <h3 style={{ marginBottom: '16px', fontSize: '20px', color: '#333' }}>Confirm Account Deletion</h3>
            <p style={{ marginBottom: '16px', color: '#666' }}>Please enter your password to confirm account deletion.</p>
            <input
               type="password"
               placeholder="Enter your password"
               value={deletePassword}
               onChange={(e) => setDeletePassword(e.target.value)}
               style={{
                 width: '100%',
                 padding: '10px',
                 marginBottom: '24px',
                 border: '1px solid #ccc',
                 borderRadius: '4px',
                 boxSizing: 'border-box',
               }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: '#ef4444',
                  color: 'white',
                }}
                onClick={confirmDelete}
              >
                Confirm Delete
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