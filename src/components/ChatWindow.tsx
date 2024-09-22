import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import { Avatar, IconButton, TextField, Typography } from "@mui/material";
import EmojiPicker from "emoji-picker-react";
import { onValue, push, ref, serverTimestamp } from "firebase/database";
import moment from "moment";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useEffect, useRef, useState } from "react";
import { auth, db, storage } from "../firebase.ts";

interface ChatWindowProps {
  conversationId: string;
  userInChat: any;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  userInChat,
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!conversationId) return;
    const messagesRef = ref(db, `conversations/${conversationId}/messages`);
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.values(data));
      } else {
        setMessages([]);
      }
      scrollToBottom();
    });
  }, [conversationId]);
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  // Gửi tin nhắn văn bản
  const sendMessage = () => {
    if (!conversationId || input.trim() === "") return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const messagesRef = ref(db, `conversations/${conversationId}/messages`);
    push(messagesRef, {
      text: input,
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      timestamp: serverTimestamp(),
    });

    setInput("");
  };
  // Gửi file ngay lập tức sau khi chọn
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const currentUser = auth.currentUser;
      if (!currentUser || !conversationId) return;

      const storageReference = storageRef(storage, `files/${file.name}`);
      const uploadTask = uploadBytesResumable(storageReference, file);

      // Khi file upload hoàn thành, lấy URL và gửi tin nhắn chứa file
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const messagesRef = ref(
            db,
            `conversations/${conversationId}/messages`
          );
          await push(messagesRef, {
            fileURL: downloadURL,
            fileName: file.name,
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            timestamp: serverTimestamp(),
          });
        }
      );
    }
  };
  // Thêm biểu tượng cảm xúc
  const handleEmojiClick = (emojiObject: any) => {
    // Thêm biểu tượng cảm xúc vào input nếu tồn tại emojiObject
    if (emojiObject.emoji) {
      setInput(input + emojiObject.emoji);
    } else {
      console.error("Emoji object is undefined:", emojiObject);
    }
  };

  // Lọc những tin nhắn có file hình ảnh
  const imageMessages = messages.filter((message) => {
    return message.fileName && message.fileName.match(/\.(jpeg|jpg|gif|png)$/); // Kiểm tra đuôi file hình ảnh
  });

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Phần thông tin người dùng đã chọn */}

      <div style={{ display: "flex", flexDirection: "row", height: "90vh" }}>
        <div style={{ flex: 3, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Avatar src={userInChat?.photoURL} />
            <div style={{ marginLeft: "10px" }}>
              <div style={{ fontWeight: "bold" }}>
                {userInChat?.displayName}
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                {userInChat?.email}
              </div>
            </div>
          </div>
          <div
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
            }}
          >
            {messages.map((message, index) => {
                console.log(message)
              return (
                <div
                  key={index}
                  style={{
                    marginBottom: "10px",
                    alignItems:
                      message.uid === auth.currentUser?.uid
                        ? "flex-end"
                        : "flex-start",
                    display: "flex",
                    flexDirection: "column",
                    textAlign:
                      message.uid === auth.currentUser?.uid ? "right" : "left",
                  }}
                >
                    <div style={{fontSize:"12px", color:"#888", marginBottom:"5px"}}>{moment(message.timestamp).format("HH:mm")}</div>
                  {message.text && (
                    <div
                      style={{
                        display: "inline-block",
                        padding: "10px",
                        backgroundColor:
                          message.uid === auth.currentUser?.uid
                            ? "#0078FF"
                            : "#e0e0e0",
                        color:
                          message.uid === auth.currentUser?.uid
                            ? "white"
                            : "black",
                        borderRadius: "10px",
                        maxWidth: "40vw",
                      }}
                    >
                      {message.text}
                    </div>
                  )}
                  {message.fileURL && (
                    <div
                      style={{
                        maxWidth: "40vw",
                      }}
                    >
                      {message?.fileName?.toLowerCase()?.includes("png") ||
                      message?.fileName?.toLowerCase()?.includes("jpg") ||
                      message?.fileName?.toLowerCase()?.includes("jpeg") ? (
                        <img
                          src={message.fileURL}
                          alt="file"
                          style={{ width: "40%", height: "auto" }}
                        />
                      ) : (
                        <div
                          style={{
                            backgroundColor: "gray",
                            alignSelf: "flex-end",
                            padding: "10px",
                            borderRadius: "10px",
                          }}
                        >
                          <a
                            href={message.fileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "block", color: "white" }}
                          >
                            {message.fileName}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatEndRef}></div>
          </div>
          <div
            style={{
              padding: "10px",
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid #ddd",
              backgroundColor: "#1c2b33",
            }}
          >
            {/* Gửi biểu tượng cảm xúc */}
            <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              😀
            </IconButton>
            {showEmojiPicker && (
              <div style={{ position: "absolute", bottom: "60px" }}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <IconButton component="span">
                <AttachFileIcon color="primary" />
              </IconButton>
            </label>

            {/* Gửi tin nhắn văn bản */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              style={{
                color: "white",
                backgroundColor: "white",
                borderRadius: "50px",
              }}
            />
            <IconButton onClick={sendMessage}>
              <SendIcon color="primary" />
            </IconButton>
          </div>
        </div>
        {/* Phần cột chứa hình ảnh đã gửi */}
        <div
          style={{
            flex: 1,
            borderLeft: "1px solid #ddd",
            overflowY: "auto",
            padding: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              borderBottom: "1px solid #ddd",
              paddingBottom: "10px",
            }}
          >
            <img
              src={userInChat?.photoURL}
              alt="bg"
              style={{
                width: "50%",
                height: "auto",
                objectFit: "cover",
                borderRadius: "1000px",
              }}
            />
            <Typography variant="h6" style={{ color: "white" }}>
              {userInChat?.displayName}
            </Typography>
            <Typography variant="body1" style={{ color: "white" }}>
              {userInChat?.email}
            </Typography>
          </div>
          <h4 style={{ color: "white" }}>Hình ảnh đã gửi</h4>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {imageMessages.map((message, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <img
                  src={message.fileURL}
                  alt="sent"
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
