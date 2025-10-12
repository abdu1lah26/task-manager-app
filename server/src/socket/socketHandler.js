const connectedUsers = new Map(); // userId -> socketId

export const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);

    // User joins with their ID
    socket.on('user-connected', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} connected with socket ${socket.id}`);
      
      // Broadcast to all that this user is online
      io.emit('user-status-changed', {
        userId,
        status: 'online'
      });
    });

    // User joins a project room
    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
      console.log(`Socket ${socket.id} joined project-${projectId}`);
      
      // Notify others in the project
      socket.to(`project-${projectId}`).emit('user-joined-project', {
        userId: socket.userId,
        projectId
      });
    });

    // User leaves a project room
    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      console.log(`Socket ${socket.id} left project-${projectId}`);
    });

    // Task created
    socket.on('task-created', (data) => {
      const { projectId, task } = data;
      socket.to(`project-${projectId}`).emit('task-created', task);
      console.log(`Task created broadcasted to project-${projectId}`);
    });

    // Task updated
    socket.on('task-updated', (data) => {
      const { projectId, task } = data;
      socket.to(`project-${projectId}`).emit('task-updated', task);
      console.log(`Task updated broadcasted to project-${projectId}`);
    });

    // Task deleted
    socket.on('task-deleted', (data) => {
      const { projectId, taskId } = data;
      socket.to(`project-${projectId}`).emit('task-deleted', taskId);
      console.log(`Task deleted broadcasted to project-${projectId}`);
    });

    // Task status changed (drag & drop)
    socket.on('task-status-changed', (data) => {
      const { projectId, taskId, newStatus } = data;
      socket.to(`project-${projectId}`).emit('task-status-changed', {
        taskId,
        newStatus
      });
      console.log(`Task status changed broadcasted to project-${projectId}`);
    });

    // Comment added
    socket.on('comment-added', (data) => {
      const { projectId, taskId, comment } = data;
      socket.to(`project-${projectId}`).emit('comment-added', {
        taskId,
        comment
      });
      console.log(`Comment added broadcasted to project-${projectId}`);
    });

    // Comment deleted
    socket.on('comment-deleted', (data) => {
      const { projectId, taskId, commentId } = data;
      socket.to(`project-${projectId}`).emit('comment-deleted', {
        taskId,
        commentId
      });
      console.log(`Comment deleted broadcasted to project-${projectId}`);
    });

    // User is typing
    socket.on('user-typing', (data) => {
      const { projectId, taskId, userName } = data;
      socket.to(`project-${projectId}`).emit('user-typing', {
        taskId,
        userName
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        
        // Broadcast to all that this user is offline
        io.emit('user-status-changed', {
          userId: socket.userId,
          status: 'offline'
        });
      }
    });
  });
};

// Get online users
export const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};