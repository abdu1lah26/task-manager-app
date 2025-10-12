import { useState } from 'react';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { useSocket } from '../../hooks/useSocket';

const TaskBoard = ({ tasks, projectId, onTaskUpdate, onTaskDelete, projectMembers }) => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const { emitTaskStatusChanged } = useSocket();

  // Group tasks by status
  const columns = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    review: tasks.filter(t => t.status === 'review'),
    completed: tasks.filter(t => t.status === 'completed')
  };

  const columnTitles = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    completed: 'Completed'
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
  e.preventDefault();
  
  if (draggedTask && draggedTask.status !== newStatus) {
    await onTaskUpdate(draggedTask.id, { status: newStatus });
    emitTaskStatusChanged(projectId, draggedTask.id, newStatus);
  }
  
  setDraggedTask(null);
};

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  return (
    <>
      <div className="task-board">
        {Object.keys(columns).map((status) => (
          <div
            key={status}
            className="task-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="column-header">
              <h3>{columnTitles[status]}</h3>
              <span className="task-count">{columns[status].length}</span>
            </div>

            <div className="column-content">
              {columns[status].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  onClick={() => handleTaskClick(task)}
                />
              ))}

              {columns[status].length === 0 && (
                <div className="empty-column">
                  <p>No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          projectMembers={projectMembers}
          onClose={handleCloseModal}
          onUpdate={onTaskUpdate}
          onDelete={onTaskDelete}
        />
      )}
    </>
  );
};

export default TaskBoard;