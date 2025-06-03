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
    if (!deletePassword.trim()) {
      alert('Please enter your password to confirm deletion.');
      return;
    }

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

    setShowDeleteConfirm(false);
    setDeletePassword('');
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletePassword('');
  };

  return (
    <div style={{ 
      padding: isMobile ? '16px 12px' : '40px 60px',
      maxWidth: '100%',
      boxSizing: 'border-box',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Mobile-optimized Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isMobile ? '16px' : '40px',
        flexWrap: 'wrap',
      }}>
        <h1 style={{ 
          fontSize: isMobile ? '20px' : '32px', 
          fontWeight: 'bold', 
          color: '#1e293b',
          margin: 0,
          marginLeft: isMobile ? '10px' : 0
        }}>
          {isMobile ? 'Profile' : 'Personal Information'}
        </h1>
      </div>
      
      {/* Profile Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: isMobile ? '12px' : '16px',
        padding: '0',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        maxWidth: '100%'
      }}>
        <div style={{
          height: isMobile ? '160px' : '250px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: headerColor,
          background: `linear-gradient(135deg, ${headerColor}, ${headerColor}dd)`
        }}>
          <div 
            style={{
              position: 'absolute',
              top: isMobile ? '12px' : '16px',
              right: isMobile ? '12px' : '16px',
              cursor: 'pointer',
              fontSize: isMobile ? '20px' : '24px',
              padding: isMobile ? '6px' : '8px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(4px)',
              transition: 'all 0.2s ease'
            }}
            onClick={handleColorChange}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🎨
          </div>
          <div 
            style={{
              width: isMobile ? '100px' : '150px',
              height: isMobile ? '100px' : '150px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: isMobile ? '3px solid white' : '4px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease'
            }}
            onClick={() => document.getElementById('fileInput').click()}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
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
              <User size={isMobile ? 40 : 60} color="#64748b" />
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
          padding: isMobile ? '16px 16px 20px 16px' : '20px 40px 32px 40px',
          fontSize: isMobile ? '18px' : '24px',
          fontWeight: '600',
          color: '#1e293b'
        }}>
           {isEditing ? (
             <input 
               type="text"
               value={profileData.name}
               onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
               style={{
                 textAlign: 'center',
                 fontSize: isMobile ? '18px' : '24px',
                 fontWeight: '600',
                 color: '#1e293b',
                 border: '2px solid #e2e8f0',
                 borderRadius: '8px',
                 padding: isMobile ? '8px 12px' : '10px 16px',
                 width: '100%',
                 maxWidth: '300px',
                 boxSizing: 'border-box',
                 outline: 'none',
                 transition: 'border-color 0.2s ease'
               }}
               onFocus={(e) => {
                 e.target.style.borderColor = headerColor;
               }}
               onBlur={(e) => {
                 e.target.style.borderColor = '#e2e8f0';
               }}
             />
           ) : (
             profileData.name || 'No name set'
           )}
        </div>
      </div>

      {/* Form Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '16px' : '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '500',
            color: '#374151'
          }}>Username</label>
          <input
            type="text"
            value={profileData.username || ''}
            disabled={true}
            style={{
              width: '100%',
              padding: isMobile ? '12px 14px' : '14px 16px',
              border: '2px solid #e2e8f0',
              color: '#64748b',
              borderRadius: '8px',
              fontSize: isMobile ? '14px' : '16px',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#f8fafc',
              cursor: 'not-allowed'
            }}
            readOnly
          />
        </div>
            
        <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: '500',
            color: '#374151'
          }}>Email</label>
          <input
            type="email"
            value={profileData.email || ''}
            disabled={true}
            style={{
              width: '100%',
              padding: isMobile ? '12px 14px' : '14px 16px',
              border: '2px solid #e2e8f0',
              color: '#64748b',
              borderRadius: '8px',
              fontSize: isMobile ? '14px' : '16px',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#f8fafc',
              cursor: 'not-allowed'
            }}
            readOnly
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: isMobile ? 'center' : 'flex-end',
          gap: isMobile ? '8px' : '12px',
          marginTop: isMobile ? '20px' : '32px',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {isEditing ? (
            <>
              <button
                style={{
                  padding: isMobile ? '12px 20px' : '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  width: isMobile ? '100%' : 'auto',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                }}
                onClick={handleSave}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ✓ Save Changes
              </button>
              <button
                style={{
                  padding: isMobile ? '12px 20px' : '12px 24px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'white',
                  color: '#64748b',
                  width: isMobile ? '100%' : 'auto'
                }}
                onClick={handleCancel}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                  e.target.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                ✕ Cancel
              </button>
            </>
          ) : (
            <>
              <button
                style={{
                  padding: isMobile ? '12px 20px' : '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  width: isMobile ? '100%' : 'auto',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                }}
                onClick={handleEdit}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2563eb';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#3b82f6';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
               Edit Profile
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{
                  padding: isMobile ? '12px 20px' : '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  width: isMobile ? '100%' : 'auto',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ef4444';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Delete Account
              </button>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: isMobile ? '16px' : '20px',
          backdropFilter: 'blur(6px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: isMobile ? '20px' : '32px',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            maxWidth: isMobile ? '340px' : '450px',
            width: '100%',
            margin: '0 auto',
            position: 'relative',
            animation: 'modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* Enhanced Warning Icon */}
            <div style={{
              width: isMobile ? '50px' : '60px',
              height: isMobile ? '50px' : '60px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '3px solid #fecaca',
              animation: 'pulse 2s infinite'
            }}>
              <span style={{ fontSize: isMobile ? '24px' : '28px' }}>⚠️</span>
            </div>

            <h3 style={{ 
              marginBottom: '8px', 
              fontSize: isMobile ? '18px' : '22px', 
              color: '#1f2937',
              fontWeight: '700'
            }}>
              Delete Account Permanently?
            </h3>
            
            <p style={{ 
              marginBottom: '6px', 
              color: '#4b5563',
              fontSize: isMobile ? '14px' : '15px',
              lineHeight: '1.5'
            }}>
              This action cannot be undone.
            </p>
            
            <p style={{ 
              marginBottom: '20px', 
              color: '#dc2626',
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: '600',
              backgroundColor: '#fef2f2',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #fecaca'
            }}>
              Account <strong>{profileData.username || 'Unknown'}</strong> will be deleted forever.
            </p>

            <div style={{
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Confirm with your password:
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: isMobile ? '12px 14px' : '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#f9fafb'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#dc2626';
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: isMobile ? '8px' : '12px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <button
                style={{
                  padding: isMobile ? '14px 20px' : '14px 28px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: '140px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onClick={confirmDelete}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
                }}
              >
                Delete Forever
              </button>
              
              <button
                style={{
                  padding: isMobile ? '14px 20px' : '14px 28px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  color: '#374151',
                  width: isMobile ? '100%' : 'auto',
                  minWidth: '140px',
                  transition: 'all 0.2s ease'
                }}
                onClick={cancelDelete}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @media (max-width: 480px) {
          .modal-content {
            margin: 10px;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default PersonalInfoPage;