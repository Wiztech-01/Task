import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState({});

  useEffect(() => {
    fetch('https://taskify-8h37.onrender.com/tasks')
      .then(response => response.json())
      .then(data => {
        setTasks(data);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
  }, []);

  const fetchComments = (taskId) => {
    fetch(`https://taskify-8h37.onrender.com/tasks/${taskId}/comments`)
      .then(response => response.json())
      .then(data => {
        setComments(prevState => ({
          ...prevState,
          [taskId]: data
        }));
      })
      .catch(error => {
        console.error('Error fetching comments:', error);
      });
  };

  const handleTaskClick = (taskId) => {
    if (selectedTask === taskId) {
      setSelectedTask(null);
    } else {
      setSelectedTask(taskId);
      fetchComments(taskId);
    }
  };

  const handleCommentChange = (e) => {
    setCommentInput(e.target.value);
  };

  const handleCommentSubmit = (taskId) => {
    fetch(`https://taskify-8h37.onrender.com/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment: commentInput })
    })
      .then(response => response.json())
      .then(data => {
        setComments(prevState => ({
          ...prevState,
          [taskId]: [...prevState[taskId], data]
        }));
        setCommentInput('');
      })
      .catch(error => {
        console.error('Error submitting comment:', error);
      });
  };

  const handleDeleteComment = (taskId, commentId) => {
    fetch(`https://taskify-8h37.onrender.com/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE'
    })
      .then(() => {
        setComments(prevState => ({
          ...prevState,
          [taskId]: prevState[taskId].filter(comment => comment.id !== commentId)
        }));
      })
      .catch(error => {
        console.error('Error deleting comment:', error);
      });
  };

  const handleDeleteTask = (taskId) => {
    fetch(`https://taskify-8h37.onrender.com/tasks/${taskId}`, {
      method: 'DELETE'
    })
      .then(() => {
        setTasks(tasks.filter(task => task.id !== taskId));
      })
      .catch(error => {
        console.error('Error deleting task:', error);
      });
  };

  const handleUpdateTask = (taskId, updatedTaskData) => {
    fetch(`https://taskify-8h37.onrender.com/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedTaskData)
    })
      .then(() => {
        const updatedTasks = tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, ...updatedTaskData };
          }
          return task;
        });
        setTasks(updatedTasks);
      })
      .catch(error => {
        console.error('Error updating task:', error);
      });
  };

  return (
    <div className='container'>
      <h2>Task List</h2>
      {tasks.map(task => (
        <div key={task.id} style={{ marginBottom: '20px', border: '1px solid black', padding: '10px' }}>
          <h3 onClick={() => handleTaskClick(task.id)} style={{ cursor: 'pointer' }}>{task.title}</h3>
          {selectedTask === task.id &&
            <div>
              <p>Description: {task.description}</p>
              <p>Category: {task.category}</p>
              <p>Due Date: {task.due_date}</p>
              <p>Priority: {task.priority}</p>
              <p>Status: {task.status}</p>
              <p>Reminder Date: {task.reminder_date}</p>
              <p>Recurrence Pattern: {task.recurrence_pattern}</p>
              <h4>Comments:</h4>
              {comments[task.id] && comments[task.id].map(comment => (
                <div key={comment.id}>
                  <p>{comment.comment}</p>
                  <button onClick={() => handleDeleteComment(task.id, comment.id)}>Delete Comment</button>
                </div>
              ))}
              <input type="text" value={commentInput} onChange={handleCommentChange} />
              <button onClick={() => handleCommentSubmit(task.id)}>Add Comment</button>
              <button onClick={() => handleDeleteTask(task.id)}>Delete Task</button>
              <Link to={`/updatetask/${task.id}`}>
                <button>Update Task</button>
              </Link>
            </div>
          }
        </div>
      ))}
      <Link to="/taskform">Create New Task</Link>
    </div>
  );
};

export default TaskList;
