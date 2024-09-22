import React from 'react';
import { Button } from '@mui/material';
import { auth, provider, db } from '../firebase.ts';
import { signInWithPopup } from 'firebase/auth';
import { ref, set } from 'firebase/database'; // Import Realtime Database methods

const Login: React.FC = () => {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Lưu thông tin người dùng vào Realtime Database
      set(ref(db, 'users/' + user.uid), {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid
      });
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  return (
    <div className='container' style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
        <div style={{textAlign:"center", color:"white"}}>
            <h1>CHÀO MỪNG ĐẾN VỚI ỨNG DỤNG NHẮN TIN TRỰC TUYẾN</h1>
            <h1>MESSENGER</h1>

            <h3>Hãy đăng nhập để bắt đầu sử dụng ứng dụng</h3>
        </div>

      <Button variant="contained" onClick={signInWithGoogle}>
        Đăng nhập với Google
      </Button>
    </div>
  );
};

export default Login;