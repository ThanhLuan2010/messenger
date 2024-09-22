import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase.ts';
import ChatWindow from './components/ChatWindow.tsx';
import Sidebar from './components/Sidebar.tsx';
import Login from './components/Login.tsx';
import { CssBaseline } from '@mui/material';

const App: React.FC = () => {
  const [user] = useAuthState(auth);
  const [conversationId, setConversationId] = useState<string>(''); // Lưu trạng thái của conversationId
  const [userInChat, setUserInChat] = useState<string>(''); // Lưu trạng thái của conversationId

  return (
    <>
      <CssBaseline />
      {user ? (
        <div className="container" style={{ display: 'flex', }}>
          <Sidebar setUserInChat={setUserInChat} setConversationId={setConversationId} />
          {conversationId && <ChatWindow userInChat={userInChat} conversationId={conversationId} />}
        </div>
      ) : (
        <Login />
      )}
    </>
  );
};

export default App;