// TodoApp 类 - 管理整个待办清单应用
class TodoApp {
    // 类常量配置 - 集中管理所有魔法数字和字符串
    static CONFIG = {
        // localStorage 存储的键名
        STORAGE_KEY: 'todoList',

        // 任务最大长度限制
        MAX_TASK_LENGTH: 200,

        // 错误提示消息
        ERROR_MESSAGES: {
            EMPTY_TASK: '请输入任务内容！',
            WHITESPACE_ONLY: '任务内容不能只包含空格或特殊字符！',
            TASK_TOO_LONG: `任务内容不能超过200个字符！`,
            TASK_EXISTS: '该任务已存在！',
            DATA_CORRUPT: '任务数据损坏，已重置任务列表。错误：'
        },

        // 成功提示消息
        SUCCESS_MESSAGES: {
            TASK_ADDED: '任务已添加',
            TASK_DELETED: '任务已删除',
            TASK_COMPLETED: '任务标记为完成',
            TASK_UNCOMPLETED: '任务标记为未完成',
            COMPLETED_CLEARED: '已清空所有已完成任务'
        }
    };

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

    // 处理添加任务 - 增加输入验证（使用常量配置）
    handleAdd() {
        const taskText = this.elements.taskInput.value;

        // 检查是否为空
        if (taskText === '') {
            alert(TodoApp.CONFIG.ERROR_MESSAGES.EMPTY_TASK);
            this.elements.taskInput.focus();
            return;
        }

        // 检查是否只包含空白字符（空格、制表符等）
        if (!taskText.trim()) {
            alert(TodoApp.CONFIG.ERROR_MESSAGES.WHITESPACE_ONLY);
            this.elements.taskInput.value = '';
            this.elements.taskInput.focus();
            return;
        }

        // 限制任务长度（使用常量配置）
        if (taskText.length > TodoApp.CONFIG.MAX_TASK_LENGTH) {
            alert(`任务内容不能超过${TodoApp.CONFIG.MAX_TASK_LENGTH}个字符！`);
            this.elements.taskInput.focus();
            return;
        }

        // 检查是否已存在相同任务（不区分大小写）
        const normalizedText = taskText.trim();
        const existingTasks = this.elements.taskList.querySelectorAll('.task-content');
        for (let taskContent of existingTasks) {
            if (taskContent.textContent.toLowerCase() === normalizedText.toLowerCase()
                && !taskContent.classList.contains('completed')) {
                alert(TodoApp.CONFIG.ERROR_MESSAGES.TASK_EXISTS);
                this.elements.taskInput.focus();
                return;
            }
        }

        this.addTask(normalizedText);
        this.elements.taskInput.value = '';
        this.elements.taskInput.focus();
    }

    /**
     * 创建任务操作按钮
     * @private
     */
    createActionButtons(completed) {
        const container = document.createElement('div');
        container.className = 'task-actions';

        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn complete-btn';
        completeBtn.textContent = completed ? '取消' : '完成';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn delete-btn';
        deleteBtn.textContent = '删除';

        container.appendChild(completeBtn);
        container.appendChild(deleteBtn);

        return container;
    }

    /**
     * 将任务插入到列表中（根据完成状态决定位置）
     * @private
     */
    insertTaskIntoList(taskItem, completed) {
        if (completed) {
            // 已完成的任务插入到末尾（底部）
            this.elements.taskList.appendChild(taskItem);
        } else {
            // 未完成的任务插入到顶部
            this.elements.taskList.insertBefore(taskItem, this.elements.taskList.firstChild);
        }
    }

    /**
     * 添加新任务（完整的任务创建和插入流程）
     * @param {string} text - 任务内容
     * @param {boolean} completed - 是否已完成
     * @param {string|null} id - 任务ID（从存储加载时使用）
     */
    addTask(text, completed = false, id = null) {
        // 创建任务项元素
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.dataset.id = id || Date.now();

        // 创建任务内容元素（使用 textContent 自动转义，防止 XSS）
        const taskContent = document.createElement('span');
        taskContent.className = completed ? 'task-content completed' : 'task-content';
        taskContent.textContent = text;

        // 创建操作按钮
        const actionsDiv = this.createActionButtons(completed);

        // 组装元素
        taskItem.appendChild(taskContent);
        taskItem.appendChild(actionsDiv);

        // 插入到列表（根据完成状态决定位置）
        this.insertTaskIntoList(taskItem, completed);

        // 更新UI状态
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

    /**
     * 切换任务的完成状态
     * 已完成的任务会移到底部，取消完成时会移到顶部
     * @param {HTMLElement} taskElement - 任务列表项元素
     * @param {HTMLElement} toggleButton - 被点击的完成/取消按钮
     */
    toggleComplete(taskElement, toggleButton) {
        // 使用缓存获取任务内容元素，减少 DOM 查询
        const cachedElements = this.getTaskElements(taskElement);
        const taskContentElement = cachedElements.content;
        const isCurrentlyCompleted = taskContentElement.classList.contains('completed');

        if (isCurrentlyCompleted) {
            // 取消完成状态
            taskContentElement.classList.remove('completed');
            toggleButton.textContent = '完成';
            // 将任务移到列表顶部
            this.elements.taskList.insertBefore(taskElement, this.elements.taskList.firstChild);
        } else {
            // 标记为完成
            taskContentElement.classList.add('completed');
            toggleButton.textContent = '取消';
            // 将任务移到列表底部
            this.elements.taskList.appendChild(taskElement);
        }

        this.saveTasks();
        this.updateClearButton();
    }

    // 清空所有已完成的任务 - 使用缓存的元素引用
    clearCompletedTasks() {
        // 获取所有已完成的任务内容元素
        const completedTasks = this.elements.taskList.querySelectorAll('.task-content.completed');

        // 遍历并删除每个已完成的任务项
        completedTasks.forEach(completedContent => {
            const taskItem = completedContent.parentElement;
            taskItem.remove();
        });

        // 隐藏清空按钮
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

    // 保存任务到 localStorage - 使用缓存引用提升性能
    saveTasks() {
        const tasks = [];
        const taskItems = this.elements.taskList.querySelectorAll('.task-item');

        taskItems.forEach(item => {
            // 尝试使用缓存，如果没有则查询 DOM
            const elements = item._cache || this.getTaskElements(item);
            const taskContent = elements.content;

            tasks.push({
                id: item.dataset.id,  // 保存任务ID
                text: taskContent.textContent,  // textContent 是安全的，会自动转义
                completed: taskContent.classList.contains('completed')
            });
        });

        localStorage.setItem(TodoApp.CONFIG.STORAGE_KEY, JSON.stringify(tasks));
    }

    // 从 localStorage 加载任务 - 增强数据验证和错误处理
    loadTasks() {
        const savedTasks = localStorage.getItem(TodoApp.CONFIG.STORAGE_KEY);

        if (savedTasks) {
            try {
                // 尝试解析保存的任务数据
                const tasks = JSON.parse(savedTasks);

                // 验证数据是否为数组
                if (!Array.isArray(tasks)) {
                    throw new Error('保存的任务数据格式不正确（不是数组）');
                }

                // 按原始顺序加载任务（保持未完成的在上，已完成的在下）
                // 所以需要反向遍历数组
                let validTaskCount = 0;
                let invalidTaskCount = 0;

                for (let i = tasks.length - 1; i >= 0; i--) {
                    const taskData = tasks[i];

                    // 验证每个任务的数据格式
                    if (this.isValidTaskData(taskData)) {
                        this.addTask(taskData.text, taskData.completed, taskData.id);
                        validTaskCount++;
                    } else {
                        console.warn('跳过格式不正确的任务:', taskData);
                        invalidTaskCount++;
                    }
                }

                // 如果有无效任务，提示用户
                if (invalidTaskCount > 0) {
                    console.warn(`加载完成：${validTaskCount} 个任务成功，${invalidTaskCount} 个任务格式不正确已跳过`);
                }

            } catch (error) {
                console.error('加载任务失败:', error);
                // 数据损坏时的恢复策略
                alert(TodoApp.CONFIG.ERROR_MESSAGES.DATA_CORRUPT + error.message);
                localStorage.removeItem(TodoApp.CONFIG.STORAGE_KEY);
                // 重置为空状态
                this.updateEmptyState();
                this.updateClearButton();
            }
        }

        this.updateClearButton();
    }

    /**
     * 验证任务数据格式是否正确
     * @private
     */
    isValidTaskData(taskData) {
        return (
            taskData &&
            typeof taskData === 'object' &&
            typeof taskData.text === 'string' &&
            taskData.text.trim().length > 0 &&
            typeof taskData.completed === 'boolean'
        );
    }

    /**
     * 获取任务元素 - 缓存任务相关元素引用，减少 DOM 查询
     * 使用惰性缓存策略，只在第一次访问时查询 DOM
     * @param {HTMLElement} taskItem - 任务列表项元素
     * @returns {Object} 包含任务相关元素的缓存对象
     * @private
     */
    getTaskElements(taskItem) {
        // 如果缓存已存在，直接返回
        if (!taskItem._cache) {
            // 第一次访问时查询 DOM 并缓存结果
            taskItem._cache = {
                content: taskItem.querySelector('.task-content'),
                completeBtn: taskItem.querySelector('.complete-btn'),
                deleteBtn: taskItem.querySelector('.delete-btn')
            };
        }
        return taskItem._cache;
    }
}

// 页面加载完成后启动应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
