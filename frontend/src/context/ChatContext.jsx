import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const socket = io(API_URL);

const ChatContext = createContext();

// Persistent ID so refreshing the browser doesn't break the room
const getPersistentUserId = () => {
  let id = localStorage.getItem("calidro_chat_id");
  if (!id) {
    id = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("calidro_chat_id", id);
  }
  return id;
};

export const ChatProvider = ({ children }) => {
  const [userId] = useState(getPersistentUserId());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const handleConnect = () => {
      // User joins their persistent room ID
      socket.emit("join_chat", userId);
    };

    socket.on("connect", handleConnect);
    if (socket.connected) handleConnect();

    socket.on("receive_message", (data) => {
      setMessagesByRoom((prev) => {
        const room = data.room;
        const currentRoomMessages = prev[room] || [];
        if (currentRoomMessages.find((m) => m.id === data.id)) return prev;
        return { ...prev, [room]: [...currentRoomMessages, data] };
      });
    });

    socket.on("load_history", ({ room, history }) => {
      setMessagesByRoom((prev) => ({ ...prev, [room]: history }));
    });

    socket.on("update_user_list", (list) => {
      setUserList(list);
    });

    return () => {
      socket.off("receive_message");
      socket.off("load_history");
      socket.off("update_user_list");
    };
  }, [userId]);

  const sendMessage = useCallback(
    (text, sender, isSystem = false) => {
      const targetRoom = sender === "admin" ? activeRoom : userId;
      if (!targetRoom) return;

      const newMessage = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        sender,
        isSystem,
        room: targetRoom,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Optimistic Update (Show message immediately for the sender)
      setMessagesByRoom((prev) => ({
        ...prev,
        [targetRoom]: [...(prev[targetRoom] || []), newMessage],
      }));

      socket.emit("send_message", newMessage);
    },
    [activeRoom, userId],
  );

  const startLiveChat = () => {
    setIsAdminMode(true); // Disable bot auto-replies
    sendMessage("SYSTEM: User is requesting live assistance.", "user", true);
  };

  const joinSupportRoom = (targetRoomId) => {
    setActiveRoom(targetRoomId);
    setIsAdminMode(true);
    socket.emit("join_chat", targetRoomId);
  };

  const currentMessages =
    isAdminMode && activeRoom
      ? messagesByRoom[activeRoom] || []
      : messagesByRoom[userId] || [];

  return (
    <ChatContext.Provider
      value={{
        isChatOpen,
        setIsChatOpen,
        messages: currentMessages,
        sendMessage,
        isAdminMode,
        setIsAdminMode,
        startLiveChat,
        joinSupportRoom,
        activeRoom,
        userList,
        userId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
