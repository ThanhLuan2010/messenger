import React from 'react';
import { auth } from '../firebase.ts';

interface MessageProps {
  message: any;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isCurrentUser = message.uid === auth.currentUser?.uid;

  return (
    <div style={{ textAlign: isCurrentUser ? 'right' : 'left' }}>
      <p>{message.displayName}</p>
      {message.text && <p>{message.text}</p>}
      {message.fileURL && (
        <a href={message.fileURL} target="_blank" rel="noreferrer">
          Tải file
        </a>
      )}
    </div>
  );
};

export default Message;
