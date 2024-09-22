import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase.ts';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button, TextField } from '@mui/material';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Message from './Message.tsx';

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });
    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    if (input.trim()) {
      await addDoc(collection(db, 'messages'), {
        text: input,
        timestamp: serverTimestamp(),
        uid: auth.currentUser?.uid,
        displayName: auth.currentUser?.displayName,
        photoURL: auth.currentUser?.photoURL,
      });
      setInput('');
    }
  };

  const handleFileUpload = async () => {
    if (file) {
      const storageRef = ref(storage, `files/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {},
        (error) => {
          console.error(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'messages'), {
            fileURL: downloadURL,
            timestamp: serverTimestamp(),
            uid: auth.currentUser?.uid,
            displayName: auth.currentUser?.displayName,
            photoURL: auth.currentUser?.photoURL,
          });
        }
      );
    }
  };

  return (
    <div>
      <Button onClick={() => signOut(auth)}>Đăng xuất</Button>
      <div>
        {messages.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
      </div>
      <TextField
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhập tin nhắn..."
      />
      <Button onClick={sendMessage}>Gửi</Button>
      <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
      <Button onClick={handleFileUpload}>Gửi tệp</Button>
    </div>
  );
};

export default ChatRoom;