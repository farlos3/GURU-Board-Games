import React, { useState } from 'react';
import { Edit2, User, Palette } from 'lucide-react';

// CSS Modules styles (inline for demo - in real project this would be in Profile.module.css)
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f5f5f5'
  },
  sidebar: {
    width: '200px',
    backgroundColor: '#2c2c2c',
    padding: '20px',
    color: 'white',
    position: 'relative'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '40px'
  },
  menuItem: {
    padding: '12px 16px',
    margin: '8px 0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '16px'
  },
  menuItemHover: {
    backgroundColor: '#7c3aed'
  },
  signOut: {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: '16px'
  },
  mainContent: {
    flex: 1,
    padding: '40px 60px',
    position: 'relative'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '40px',
    color: '#333'
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '0',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    position: 'relative'
  },
  profileHeader: {
    height: '120px',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '60px'
  },
  editIcon: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    cursor: 'pointer',
    color: '#333'
  },
  colorEditIcon: {
    position: 'absolute',
    top: '16px',
    right: '50px',
    cursor: 'pointer',
    color: '#333'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#e5e5e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
    border: '4px solid white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  userName: {
    textAlign: 'center',
    padding: '20px',
    fontSize: '18px',
    fontWeight: '500',
    color: '#333'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '16px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e5e5',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  inputFocus: {
    borderColor: '#7c3aed'
  },
  inputDisabled: {
    backgroundColor: '#f9f9f9',
    cursor: 'not-allowed'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  editButton: {
    backgroundColor: '#ef4444',
    color: 'white'
  },
  saveButton: {
    backgroundColor: '#22c55e',
    color: 'white'
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    color: 'white'
  },
  removeAccount: {
    position: 'absolute',
    bottom: '20px',
    right: '60px',
    color: '#888',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px'
  }
};

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
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
  const [headerColor, setHeaderColor] = useState('#ff6b6b');
  const [profileImage, setProfileImage] = useState(null);

  const menuItems = [
    { name: 'Home', active: false },
    { name: 'Personal info', active: true },
    { name: 'Favorites', active: false }
  ];

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
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>Porfile</div>
        
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={{
              ...styles.menuItem,
              ...(hoveredMenuItem === index ? styles.menuItemHover : {})
            }}
            onMouseEnter={() => setHoveredMenuItem(index)}
            onMouseLeave={() => setHoveredMenuItem(null)}
          >
            {item.name}
          </div>
        ))}
        
        <div style={styles.signOut}>Sing out</div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <h1 style={styles.title}>Personal information</h1>
        
        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={{...styles.profileHeader, backgroundColor: headerColor}}>
            <Palette 
              size={20} 
              style={styles.colorEditIcon}
              onClick={handleColorChange}
            />
            <Edit2 size={20} style={styles.editIcon} />
            <div style={styles.avatar} onClick={() => document.getElementById('fileInput').click()}>
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
                <User size={40} color="#666" />
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
          <div style={styles.userName}>{profileData.name}</div>
        </div>

        {/* Form Card */}
        <div style={styles.formCard}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={profileData.email}
              disabled={isEditing}
              style={{
                ...styles.input,
                ...(isEditing ? styles.inputDisabled : {})
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={isEditing ? editData.password : profileData.password}
              disabled={!isEditing}
              style={{
                ...styles.input,
                ...(isEditing ? {} : styles.inputDisabled)
              }}
              onChange={(e) => setEditData(prev => ({...prev, password: e.target.value}))}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Conframe Password</label>
            <input
              type="password"
              value={isEditing ? editData.confirmPassword : profileData.confirmPassword}
              disabled={!isEditing}
              style={{
                ...styles.input,
                ...(isEditing ? {} : styles.inputDisabled)
              }}
              onChange={(e) => setEditData(prev => ({...prev, confirmPassword: e.target.value}))}
            />
          </div>

          <div style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <button
                  style={{...styles.button, ...styles.saveButton}}
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  style={{...styles.button, ...styles.editButton}}
                  onClick={handleCancel}
                >
                  <span>Edit</span>
                  <Edit2 size={16} />
                </button>
              </>
            ) : (
              <button
                style={{...styles.button, ...styles.editButton}}
                onClick={handleEdit}
              >
                <span>Edit</span>
                <Edit2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div style={styles.removeAccount}>Remove account</div>
      </div>
    </div>
  );
}