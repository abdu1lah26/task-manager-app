const TaskCard = ({ task, onDragStart, onClick }) => {
  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626'
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={onClick}
    >
      <div className="task-card-header">
        <h4 className="task-title">{task.title}</h4>
        <span
          className="priority-badge"
          style={{ backgroundColor: priorityColors[task.priority] }}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-card-footer">
        {task.assigned_to_name && (
          <div className="task-assignee">
            <div className="assignee-avatar">
              {task.assigned_to_name.charAt(0).toUpperCase()}
            </div>
            <span>{task.assigned_to_name}</span>
          </div>
        )}

        {task.due_date && (
          <div className={`task-due-date ${isOverdue(task.due_date) ? 'overdue' : ''}`}>
            📅 {formatDate(task.due_date)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;