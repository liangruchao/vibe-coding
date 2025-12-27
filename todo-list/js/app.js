// 获取DOM元素 - 这些是我们需要操作的页面元素
const taskInput = document.getElementById('taskInput');  // 输入框
const addBtn = document.getElementById('addBtn');  // 添加按钮
const taskList = document.querySelector('.task-list');  // 任务列表容器
const clearCompletedBtn = document.querySelector('.clear-completed-btn');  // 清空已完成按钮

// 保存任务到 localStorage - 数据持久化
function saveTasks() {
    // 获取所有任务项
    const taskItems = document.querySelectorAll('.task-item');
    // 创建一个数组来存储所有任务数据
    const tasks = [];

    // 遍历每个任务项，提取任务信息
    taskItems.forEach(item => {
        const taskContent = item.querySelector('.task-content');
        const taskText = taskContent.textContent;  // 任务内容
        const isCompleted = taskContent.classList.contains('completed');  // 完成状态

        // 将任务信息添加到数组中
        tasks.push({
            text: taskText,
            completed: isCompleted
        });
    });

    // 将任务数组转换为 JSON 字符串并保存到 localStorage
    localStorage.setItem('todoList', JSON.stringify(tasks));
    // 中文注释：JSON.stringify() 把 JavaScript 对象转换成字符串，这样才能保存到 localStorage
}

// 从 localStorage 加载任务 - 页面加载时调用
function loadTasks() {
    // 从 localStorage 读取保存的任务数据
    const savedTasks = localStorage.getItem('todoList');

    if (savedTasks) {
        // 如果有保存的数据，解析 JSON 字符串为 JavaScript 数组
        const tasks = JSON.parse(savedTasks);
        // 中文注释：JSON.parse() 把字符串转换回 JavaScript 对象

        // 遍历所有任务，重新创建任务列表
        tasks.forEach(taskData => {
            // 创建新的任务项元素
            const newTaskItem = document.createElement('li');
            newTaskItem.className = 'task-item';

            // 根据完成状态设置不同的样式和按钮文字
            const completedClass = taskData.completed ? 'completed' : '';
            const buttonText = taskData.completed ? '取消' : '完成';

            // 设置任务项的 HTML 内容
            newTaskItem.innerHTML = `
                <span class="task-content ${completedClass}">${taskData.text}</span>
                <div class="task-actions">
                    <button class="btn complete-btn">${buttonText}</button>
                    <button class="btn delete-btn">删除</button>
                </div>
            `;

            // 将任务添加到列表中
            // 如果是已完成的任务，直接添加到末尾（底部）
            // 如果是未完成的任务，添加到顶部
            if (taskData.completed) {
                taskList.appendChild(newTaskItem);
            } else {
                taskList.insertBefore(newTaskItem, taskList.firstChild);
            }
        });
    }
}

// 删除任务函数 - 从列表中移除单个任务
function deleteTask(deleteButton) {
    // deleteButton 是被点击的删除按钮
    // parentElement 是按钮所在的任务项（<li class="task-item">）
    const taskItem = deleteButton.parentElement.parentElement;
    // 从任务列表中移除这个任务项
    taskItem.remove();

    // 删除后也保存数据
    saveTasks();
}

// 为所有删除按钮添加事件监听 - 包括已有的和新建的
function setupDeleteButtons() {
    // 选择所有的删除按钮
    const deleteButtons = document.querySelectorAll('.delete-btn');

    // 为每个删除按钮添加点击事件
    deleteButtons.forEach(button => {
        // 如果已经添加了事件监听，先移除（防止重复）
        button.removeEventListener('click', handleDeleteClick);
        // 添加新的点击事件
        button.addEventListener('click', handleDeleteClick);
    });
}

// 删除按钮点击处理函数
function handleDeleteClick(event) {
    // 调用删除任务函数，传入被点击的按钮
    deleteTask(event.target);
    // 删除后更新清空按钮显示状态
    updateClearCompletedButton();
}

// 更新清空已完成按钮的显示状态
function updateClearCompletedButton() {
    // 选择所有已完成的任务（有completed类的元素）
    const completedTasks = document.querySelectorAll('.task-content.completed');

    if (completedTasks.length > 0) {
        // 如果有已完成的任务，显示按钮
        clearCompletedBtn.classList.add('show');
    } else {
        // 如果没有已完成的任务，隐藏按钮
        clearCompletedBtn.classList.remove('show');
    }
}

// 清空所有已完成的任务
function clearCompletedTasks() {
    // 选择所有已完成的任务项（<li class="task-item">）
    const completedTaskItems = document.querySelectorAll('.task-list .task-content.completed');

    // 遍历每个已完成的任务，删除其所在的任务项
    completedTaskItems.forEach(completedContent => {
        const taskItem = completedContent.parentElement; // 获取任务项
        taskItem.remove(); // 删除任务项
    });

    // 删除后隐藏按钮
    clearCompletedBtn.classList.remove('show');

    // 保存数据到 localStorage
    saveTasks();
}

// 切换任务完成状态 - 标记为已完成或取消完成
function toggleComplete(completeButton) {
    // completeButton 是被点击的完成/取消按钮
    // 找到任务项（<li class="task-item">）
    const taskItem = completeButton.parentElement.parentElement;
    // 找到任务内容元素（<span class="task-content">）
    const taskContent = taskItem.querySelector('.task-content');
    // 检查任务是否已完成（是否有completed类）
    const isCompleted = taskContent.classList.contains('completed');

    if (isCompleted) {
        // 如果已完成，则取消完成
        taskContent.classList.remove('completed');  // 移除删除线和灰色
        completeButton.textContent = '完成';  // 按钮文字变回"完成"
    } else {
        // 如果未完成，则标记为完成
        taskContent.classList.add('completed');  // 添加删除线和灰色
        completeButton.textContent = '取消';  // 按钮文字变成"取消"

        // 将已完成的任务移到列表底部
        // appendChild 会将已存在的元素移动到末尾
        taskList.appendChild(taskItem);
    }

    // 更新清空按钮显示状态
    updateClearCompletedButton();

    // 保存任务状态到 localStorage
    saveTasks();
}

// 为所有完成按钮添加事件监听
function setupCompleteButtons() {
    // 选择所有的完成按钮
    const completeButtons = document.querySelectorAll('.complete-btn');

    // 为每个完成按钮添加点击事件
    completeButtons.forEach(button => {
        // 移除已有的事件监听（防止重复）
        button.removeEventListener('click', handleCompleteClick);
        // 添加新的点击事件
        button.addEventListener('click', handleCompleteClick);
    });
}

// 完成按钮点击处理函数
function handleCompleteClick(event) {
    // 调用切换完成状态函数，传入被点击的按钮
    toggleComplete(event.target);
}

// 添加按钮点击事件 - 当用户点击"添加"按钮时执行
addBtn.addEventListener('click', function() {
    // 获取输入框的内容，并去除首尾空格
    const taskText = taskInput.value.trim();

    // 检查输入是否为空 - 如果为空就不添加任务
    if (taskText === '') {
        // 提示用户输入内容
        alert('请输入任务内容！');
        // 让输入框获得焦点，方便用户直接输入
        taskInput.focus();
        return;  // 停止执行后续代码
    }

    // 创建新的任务项元素 - 每个任务都是一个<li>
    const newTaskItem = document.createElement('li');
    newTaskItem.className = 'task-item';  // 添加CSS类名

    // 设置任务项的HTML内容 - 包含任务文本和操作按钮
    newTaskItem.innerHTML = `
        <span class="task-content">${taskText}</span>
        <div class="task-actions">
            <button class="btn complete-btn">完成</button>
            <button class="btn delete-btn">删除</button>
        </div>
    `;

    // 将新任务添加到任务列表的最顶部 - 在未完成任务之前
    // insertBefore(新元素, 第一个子元素) 会将新元素插入到第一个子元素之前
    taskList.insertBefore(newTaskItem, taskList.firstChild);

    // 为新添加的任务设置删除功能 - 重新设置所有删除按钮
    setupDeleteButtons();
    // 为新添加的任务设置完成功能 - 重新设置所有完成按钮
    setupCompleteButtons();

    // 清空输入框 - 方便用户添加下一个任务
    taskInput.value = '';

    // 让输入框重新获得焦点 - 提升用户体验
    taskInput.focus();

    // 保存任务到 localStorage
    saveTasks();
});

// 回车键添加任务 - 用户按回车也能添加任务
taskInput.addEventListener('keypress', function(event) {
    // 检查是否按下了回车键（keyCode 13）
    if (event.key === 'Enter' || event.keyCode === 13) {
        addBtn.click();  // 模拟点击添加按钮
    }
});

// 清空已完成按钮点击事件
clearCompletedBtn.addEventListener('click', function() {
    clearCompletedTasks();  // 清空所有已完成的任务
});

// 页面加载时，从 localStorage 读取并显示之前保存的任务
loadTasks();

// 初始化 - 为页面已有的任务设置功能
setupDeleteButtons();  // 设置删除功能
setupCompleteButtons();  // 设置完成功能
updateClearCompletedButton();  // 更新清空按钮显示状态
