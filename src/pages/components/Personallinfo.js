import React, { useState } from 'react';
import { User } from 'lucide-react';

const PersonalInfoPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Natthapol permkamon',
    email: 'fang@gmail.com',
    password: '••••••••••••••••',
    confirmPassword: '••••••••••••••••'
  });
  const [editData, setEditData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [headerColor, setHeaderColor] = useState('#4ecdc4');
  const [profileImage, setProfileImage] = useState(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      password: '',
      confirmPassword: ''
    });
  };

  const handleSave = () => {
    if (editData.password !== editData.confirmPassword) {
      alert('Password and Confirm Password must match!');
      return;
    }
    
    if (editData.password.trim() === '') {
      alert('Password cannot be empty!');
      return;
    }

    setProfileData(prev => ({
      ...prev,
      password: '•'.repeat(editData.password.length),
      confirmPassword: '•'.repeat(editData.confirmPassword.length)
    }));
    setIsEditing(false);
    alert('Password updated successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      password: '',
      confirmPassword: ''
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
            {profileImage ? (
              <img 
                src={profileImage} 
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
          padding: '40px',
          fontSize: '18px',
          fontWeight: '500',
          color: '#333'
        }}>{profileData.name}</div>
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
          }}>Email</label>
          <input
            type="email"
            value={profileData.email}
            disabled={isEditing}
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
              backgroundColor: isEditing ? '#f9f9f9' : 'white',
              cursor: isEditing ? 'not-allowed' : 'default'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#333'
          }}>Password</label>
          <input
            type="password"
            value={isEditing ? editData.password : profileData.password}
            disabled={!isEditing}
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
              backgroundColor: !isEditing ? '#f9f9f9' : 'white',
              cursor: !isEditing ? 'not-allowed' : 'default'
            }}
            onChange={(e) => setEditData(prev => ({...prev, password: e.target.value}))}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#333'
          }}>Confirm Password</label>
          <input
            type="password"
            value={isEditing ? editData.confirmPassword : profileData.confirmPassword}
            disabled={!isEditing}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '16px',
              color: "rgb(0, 0, 0)",
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
              backgroundColor: !isEditing ? '#f9f9f9' : 'white',
              cursor: !isEditing ? 'not-allowed' : 'default'
            }}
            onChange={(e) => setEditData(prev => ({...prev, confirmPassword: e.target.value}))}
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
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        right: '60px',
        color: '#888',
        cursor: 'pointer',
        textDecoration: 'underline',
        fontSize: '14px'
      }}>
        Remove account
      </div>
    </div>
  );
};

export default PersonalInfoPage;