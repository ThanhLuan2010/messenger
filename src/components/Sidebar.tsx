import {
  Avatar,
  Badge,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import { onValue, ref, set } from "firebase/database";
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase.ts";
import { signOut } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";

interface SidebarProps {
  setConversationId: (conversationId: string) => void; // Truyền conversationId cho ChatWindow
  setUserInChat:(userInChat:any)=>void
}

const Sidebar: React.FC<SidebarProps> = ({ setConversationId,setUserInChat }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>(
    {}
  );

  const [selectedUser, setSelectedUser] = useState<any>({})

  useEffect(() => {
    const usersRef = ref(db, "users/");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(Object.values(data));
      }
    });
  }, []);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Lấy số lượng tin nhắn chưa đọc cho mỗi cuộc hội thoại
    users.forEach((user) => {
      if (user.uid !== currentUser.uid) {
        const conversationId = [currentUser.uid, user.uid].sort().join("_");
        const conversationRef = ref(
          db,
          `conversations/${conversationId}/messages`
        );
        const lastReadRef = ref(
          db,
          `conversations/${conversationId}/lastRead/${currentUser.uid}`
        );

        onValue(conversationRef, (snapshot) => {
          const messages = snapshot.val();
          if (!messages) return;

          // Lấy lastRead time
          onValue(lastReadRef, (lastReadSnapshot) => {
            const lastReadTime = lastReadSnapshot.val();
            const unreadCount = Object.values(messages).filter(
              (message: any) => {
                return message.timestamp > lastReadTime;
              }
            ).length;

            setUnreadCounts((prevCounts) => ({
              ...prevCounts,
              [user.uid]: unreadCount,
            }));
          });
        });
      }
    });
  }, [users]);

  // Hàm xử lý khi nhấn vào người dùng
  const handleSelectUser = async (selectedUser: any) => {
    setSelectedUser(selectedUser)
    setUserInChat(selectedUser)
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Tạo ID dựa trên UID của người dùng hiện tại và người dùng được chọn (đảm bảo unique)
    const conversationId = [currentUser.uid, selectedUser.uid].sort().join("_");

    // Kiểm tra nếu cuộc trò chuyện đã tồn tại
    const conversationRef = ref(db, `conversations/${conversationId}`);
    setConversationId(conversationId);

    // Cập nhật trạng thái "đã đọc" cho người dùng hiện tại
    const lastReadRef = ref(
      db,
      `conversations/${conversationId}/lastRead/${currentUser.uid}`
    );
    set(lastReadRef, serverTimestamp());

    // Nếu chưa có cuộc hội thoại, tạo một cuộc hội thoại mới
    onValue(conversationRef, (snapshot) => {
      if (!snapshot.exists()) {
        set(conversationRef, {
          participants: {
            [currentUser.uid]: true,
            [selectedUser.uid]: true,
          },
        });
      }
    });
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  return (
    <div
      style={{
        width: "250px",
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
        // backgroundColor: "#1c2b33",
      }}
    >
      <List style={{ flex: 1 }}>
        {users.map((user, index) => (
          <React.Fragment key={index}>
            <ListItem
              sx={{ cursor: "pointer", backgroundColor: selectedUser.uid === user.uid ? "#333" : "transparent" }}
              onClick={() => handleSelectUser(user)}
            >
              <ListItemAvatar>
                <Avatar src={user.photoURL} />
              </ListItemAvatar>
              <ListItemText style={{color:"white"}} primary={user.displayName} />

              {unreadCounts[user.uid] > 0 && (
                <Badge
                  badgeContent={unreadCounts[user.uid]}
                  color="secondary"
                />
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogout}
        style={{ margin: "10px" }}
      >
        Đăng xuất
      </Button>
    </div>
  );
};

export default Sidebar;
