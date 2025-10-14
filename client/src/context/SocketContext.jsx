import { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        setIsConnected(true);

        newSocket.emit("user-connected", user.id);
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        setIsConnected(false);
      });

      newSocket.on("user-status-changed", (data) => {
        const { userId, status } = data;
        setOnlineUsers((prev) => {
          if (status === "online") {
            return [...prev.filter((id) => id !== userId), userId];
          } else {
            return prev.filter((id) => id !== userId);
          }
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  const joinProject = (projectId) => {
    if (socket && isConnected) {
      socket.emit("join-project", projectId);
      console.log(`Joined project room: ${projectId}`);
    }
  };

  const leaveProject = (projectId) => {
    if (socket && isConnected) {
      socket.emit("leave-project", projectId);
      console.log(`Left project room: ${projectId}`);
    }
  };

  const emitTaskCreated = (projectId, task) => {
    if (socket && isConnected) {
      socket.emit("task-created", { projectId, task });
    }
  };

  const emitTaskUpdated = (projectId, task) => {
    if (socket && isConnected) {
      socket.emit("task-updated", { projectId, task });
    }
  };

  const emitTaskDeleted = (projectId, taskId) => {
    if (socket && isConnected) {
      socket.emit("task-deleted", { projectId, taskId });
    }
  };

  const emitTaskStatusChanged = (projectId, taskId, newStatus) => {
    if (socket && isConnected) {
      socket.emit("task-status-changed", { projectId, taskId, newStatus });
    }
  };

  const emitCommentAdded = (projectId, taskId, comment) => {
    if (socket && isConnected) {
      socket.emit("comment-added", { projectId, taskId, comment });
    }
  };

  const emitCommentDeleted = (projectId, taskId, commentId) => {
    if (socket && isConnected) {
      socket.emit("comment-deleted", { projectId, taskId, commentId });
    }
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    joinProject,
    leaveProject,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitTaskStatusChanged,
    emitCommentAdded,
    emitCommentDeleted,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
