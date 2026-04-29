document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // Save Tasks to LocalStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Add Task
    const addTask = () => {
        const text = taskInput.value.trim();
        if (text) {
            const newTask = {
                id: Date.now().toString(),
                text: text,
                completed: false
            };
            tasks.push(newTask);
            taskInput.value = '';
            saveTasks();
            renderTasks();
        }
    };

    addTaskBtn.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Render Tasks
    const renderTasks = () => {
        taskList.innerHTML = '';
        
        let filteredTasks = [...tasks];
        
        // Sort so completed tasks move to the bottom
        filteredTasks.sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });

        if (currentFilter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks found.</p>
                </div>
            `;
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
                <div class="task-content">
                    <span class="task-text">${escapeHTML(task.text)}</span>
                </div>
                <div class="task-actions">
                    ${!task.completed ? `
                    <button class="complete-text-btn" aria-label="Mark as complete">
                        <i class="fas fa-check"></i> Complete
                    </button>
                    ` : ''}
                    <button class="delete-btn" aria-label="Delete task">
                        <i class="fas fa-trash-alt"></i> <span>Delete</span>
                    </button>
                </div>
            `;

            // Mark Complete (one-way)
            if (!task.completed) {
                const completeBtn = li.querySelector('.complete-text-btn');
                const taskContent = li.querySelector('.task-content');
                
                const markComplete = () => {
                    task.completed = true;
                    saveTasks();
                    renderTasks();
                };

                completeBtn.addEventListener('click', markComplete);
                taskContent.addEventListener('click', markComplete);
            }

            // Delete Task
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Add fade out animation before removing
                li.style.animation = 'fadeIn 0.3s ease reverse forwards';
                
                setTimeout(() => {
                    tasks = tasks.filter(t => t.id !== task.id);
                    saveTasks();
                    renderTasks();
                }, 300);
            });

            taskList.appendChild(li);
        });
    };

    // Filter Tasks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active class
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Helper to prevent XSS
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // Initial render
    renderTasks();
});
