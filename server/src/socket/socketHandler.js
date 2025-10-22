/**
 * Socket.IO connection handler
 * Manages real-time communication for tasks, comments, and user presence
 */

const connectedUsers = new Map();

export const handleSocketConnection = (io) => {
  io.on('connection', (socket) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ New client connected:', socket.id);
    }

    socket.on('user-connected', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      if (process.env.NODE_ENV === 'development') {
        console.log(`User ${userId} connected with socket ${socket.id}`);
      }

      io.emit('user-status-changed', {
        userId,
        status: 'online'
      });
    });

    socket.on('join-project', (projectId) => {
      socket.join(`project-${projectId}`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Socket ${socket.id} joined project-${projectId}`);
      }

      socket.to(`project-${projectId}`).emit('user-joined-project', {
        userId: socket.userId,
        projectId
      });
    });

    socket.on('leave-project', (projectId) => {
      socket.leave(`project-${projectId}`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Socket ${socket.id} left project-${projectId}`);
      }
    });

    socket.on('task-created', (data) => {
      const { projectId, task } = data;
      socket.to(`project-${projectId}`).emit('task-created', task);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Task created broadcasted to project-${projectId}`);
      }
    });

    socket.on('task-updated', (data) => {
      const { projectId, task } = data;
      socket.to(`project-${projectId}`).emit('task-updated', task);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Task updated broadcasted to project-${projectId}`);
      }
    });

    socket.on('task-deleted', (data) => {
      const { projectId, taskId } = data;
      socket.to(`project-${projectId}`).emit('task-deleted', taskId);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Task deleted broadcasted to project-${projectId}`);
      }
    });

    socket.on('task-status-changed', (data) => {
      const { projectId, taskId, newStatus } = data;
      socket.to(`project-${projectId}`).emit('task-status-changed', {
        taskId,
        newStatus
      });
      if (process.env.NODE_ENV === 'development') {
        console.log(`Task status changed broadcasted to project-${projectId}`);
      }
    });

    socket.on('comment-added', (data) => {
      const { projectId, taskId, comment } = data;
      socket.to(`project-${projectId}`).emit('comment-added', {
        taskId,
        comment
      });
      if (process.env.NODE_ENV === 'development') {
        console.log(`Comment added broadcasted to project-${projectId}`);
      }
    });

    socket.on('comment-deleted', (data) => {
      const { projectId, taskId, commentId } = data;
      socket.to(`project-${projectId}`).emit('comment-deleted', {
        taskId,
        commentId
      });
      if (process.env.NODE_ENV === 'development') {
        console.log(`Comment deleted broadcasted to project-${projectId}`);
      }
    });

    socket.on('user-typing', (data) => {
      const { projectId, taskId, userName } = data;
      socket.to(`project-${projectId}`).emit('user-typing', {
        taskId,
        userName
      });
    });

    socket.on('disconnect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Client disconnected:', socket.id);
      }

      if (socket.userId) {
        connectedUsers.delete(socket.userId);

        io.emit('user-status-changed', {
          userId: socket.userId,
          status: 'offline'
        });
      }
    });
  });
};

export const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};