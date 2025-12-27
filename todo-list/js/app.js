// TodoApp 类 - 管理整个待办清单应用
class TodoApp {
    constructor() {
        // 获取所有需要的DOM元素
        this.elements = {
            taskInput: document.getElementById('taskInput'),
            addBtn: document.getElementById('addBtn'),
            taskList: document.querySelector('.task-list'),
            clearCompletedBtn: document.querySelector('.clear-completed-btn'),
            emptyState: null  // 将在后面创建
        };

        // 初始化应用
        this.init();
    }

    // 初始化应用
    init() {
        this.createEmptyState();
        this.bindEvents();
        this.loadTasks();
        this.updateEmptyState();
    }

    // 创建空状态提示
    createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-icon">📋</div>
            <p>暂无任务，添加一个开始吧！</p>
        `;
        this.elements.emptyState = emptyState;
        this.elements.taskList.parentNode.insertBefore(emptyState, this.elements.taskList);
    }

    // 绑定所有事件监听器（使用事件委托）
    bindEvents() {
        // 添加按钮点击
        this.elements.addBtn.addEventListener('click', () => this.handleAdd());

        // 输入框回车
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAdd();
            }
        });

        // 任务列表点击（事件委托）
        this.elements.taskList.addEventListener('click', (e) => {
            const target = e.target;
            const taskItem = target.closest('.task-item');

            if (!taskItem) return;

            // 删除按钮
            if (target.classList.contains('delete-btn')) {
                this.deleteTask(taskItem);
            }
            // 完成按钮
            else if (target.classList.contains('complete-btn')) {
                this.toggleComplete(taskItem, target);
            }
        });

        // 清空已完成按钮
        this.elements.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompletedTasks();
        });
    }

    // 处理添加任务
    handleAdd() {
        const taskText = this.elements.taskInput.value.trim();

        if (taskText === '') {
            alert('请输入任务内容！');
            this.elements.taskInput.focus();
            return;
        }

        this.addTask(taskText);
        this.elements.taskInput.value = '';
        this.elements.taskInput.focus();
    }

    // 添加新任务
    addTask(text, completed = false, id = null) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.dataset.id = id || Date.now(); // 使用传入的ID或生成新的

        const buttonText = completed ? '取消' : '完成';
        const completedClass = completed ? 'completed' : '';

        taskItem.innerHTML = `
            <span class="task-content ${completedClass}">${text}</span>
            <div class="task-actions">
                <button class="btn complete-btn">${buttonText}</button>
                <button class="btn delete-btn">删除</button>
            </div>
        `;

        // 根据完成状态决定插入位置
        if (completed) {
            this.elements.taskList.appendChild(taskItem);
        } else {
            this.elements.taskList.insertBefore(taskItem, this.elements.taskList.firstChild);
        }

        this.saveTasks();
        this.updateEmptyState();
        this.updateClearButton();
    }

    // 删除任务
    deleteTask(taskItem) {
        taskItem.remove();
        this.saveTasks();
        this.updateEmptyState();
        this.updateClearButton();
    }

    // 切换任务完成状态
    toggleComplete(taskItem, button) {
        const taskContent = taskItem.querySelector('.task-content');
        const isCompleted = taskContent.classList.contains('completed');

        if (isCompleted) {
            // 取消完成
            taskContent.classList.remove('completed');
            button.textContent = '完成';
            // 将任务移到顶部
            this.elements.taskList.insertBefore(taskItem, this.elements.taskList.firstChild);
        } else {
            // 标记完成
            taskContent.classList.add('completed');
            button.textContent = '取消';
            // 将任务移到底部
            this.elements.taskList.appendChild(taskItem);
        }

        this.saveTasks();
        this.updateClearButton();
    }

    // 清空所有已完成的任务
    clearCompletedTasks() {
        const completedTasks = this.elements.taskList.querySelectorAll('.task-content.completed');

        completedTasks.forEach(completedContent => {
            const taskItem = completedContent.parentElement;
            taskItem.remove();
        });

        this.elements.clearCompletedBtn.classList.remove('show');
        this.saveTasks();
        this.updateEmptyState();
    }

    // 更新清空按钮显示状态
    updateClearButton() {
        const hasCompleted = this.elements.taskList.querySelector('.task-content.completed') !== null;
        this.elements.clearCompletedBtn.classList.toggle('show', hasCompleted);
    }

    // 更新空状态显示
    updateEmptyState() {
        const hasTasks = this.elements.taskList.children.length > 0;
        this.elements.emptyState.style.display = hasTasks ? 'none' : 'block';
    }

    // 保存任务到 localStorage
    saveTasks() {
        const tasks = [];
        const taskItems = this.elements.taskList.querySelectorAll('.task-item');

        taskItems.forEach(item => {
            const taskContent = item.querySelector('.task-content');
            tasks.push({
                id: item.dataset.id,  // 保存任务ID
                text: taskContent.textContent,
                completed: taskContent.classList.contains('completed')
            });
        });

        localStorage.setItem('todoList', JSON.stringify(tasks));
    }

    // 从 localStorage 加载任务
    loadTasks() {
        const savedTasks = localStorage.getItem('todoList');

        if (savedTasks) {
            try {
                const tasks = JSON.parse(savedTasks);
                // 按原始顺序加载任务（保持未完成的在上，已完成的在下）
                // 所以需要反向遍历数组
                for (let i = tasks.length - 1; i >= 0; i--) {
                    const taskData = tasks[i];
                    this.addTask(taskData.text, taskData.completed, taskData.id);
                }
            } catch (error) {
                console.error('加载任务失败:', error);
            }
        }

        this.updateClearButton();
    }
}

// 页面加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
