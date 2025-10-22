import { createContext, useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

/**
 * Socket Context - Real-Time Communication Setup
 *
 * This file handles WebSocket connections for real-time features:
 * - When someone creates/updates a task, everyone sees it instantly
 * - Like how WhatsApp shows messages in real-time
 *
 * Socket.IO = Library that makes real-time communication easy
 */

// Create context to share socket connection across components
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  // State to store socket connection
  const [socket, setSocket] = useState(null);

  // Track if socket is connected
  const [isConnected, setIsConnected] = useState(false);

  // Track which users are online
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Get user info from AuthContext
  const { user, isAuthenticated } = useContext(AuthContext);

  /**
   * Setup socket connection when user logs in
   * This runs automatically when user or isAuthenticated changes
   */
  useEffect(() => {
    // Only connect if user is logged in
    if (isAuthenticated && user) {
      // Create new socket connection to backend
      const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
        transports: ["websocket", "polling"], // Ways to connect (websocket is faster)
        reconnection: true, // Auto-reconnect if connection drops
        reconnectionDelay: 1000, // Wait 1 second before reconnecting
        reconnectionAttempts: 5, // Try 5 times to reconnect
      });

      /**
       * EVENT: When socket connects successfully
       */
      newSocket.on("connect", () => {
        // Only log in development (not in production)
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Socket connected:", newSocket.id);
        }

        setIsConnected(true); // Update connection status

        // Tell server this user is online
        newSocket.emit("user-connected", user.id);
      });

      /**
       * EVENT: When socket disconnects
       */
      newSocket.on("disconnect", () => {
        if (process.env.NODE_ENV === "development") {
          console.log("❌ Socket disconnected");
        }
        setIsConnected(false);
      });

      /**
       * EVENT: When connection fails
       */
      newSocket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        setIsConnected(false);
      });

      /**
       * EVENT: When someone's online status changes
       * Server sends this event when users go online/offline
       */
      newSocket.on("user-status-changed", (data) => {
        const { userId, status } = data;

        // Update online users list
        setOnlineUsers((prev) => {
          if (status === "online") {
            // Add user to online list (remove duplicates first)
            return [...prev.filter((id) => id !== userId), userId];
          } else {
            // Remove user from online list
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
      if (process.env.NODE_ENV === "development") {
        console.log(`Joined project room: ${projectId}`);
      }
    }
  };

  const leaveProject = (projectId) => {
    if (socket && isConnected) {
      socket.emit("leave-project", projectId);
      if (process.env.NODE_ENV === "development") {
        console.log(`Left project room: ${projectId}`);
      }
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
