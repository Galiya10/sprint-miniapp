// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#2C3744');
    tg.setBackgroundColor('#2C3744');
    tg.enableClosingConfirmation();
    
    // Устанавливаем кнопку "Назад" для страницы привычек
    tg.BackButton.onClick(() => {
        if (!document.getElementById('habitsPage').classList.contains('hidden')) {
            document.getElementById('habitsPage').classList.add('hidden');
            document.getElementById('mainPage').classList.remove('hidden');
            tg.BackButton.hide();
        }
    });
}

// Хранилище данных
let userHabits = JSON.parse(localStorage.getItem('userHabits')) || [];
let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let habitCompletions = JSON.parse(localStorage.getItem('habitCompletions')) || {};

// Получаем текущую дату
const today = new Date();
today.setHours(0, 0, 0, 0);

// Выбранная дата
let selectedDate = new Date(today);

// Функция для получения начала недели (понедельник)
function getWeekStart(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

// Функция для форматирования даты в YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Функция для проверки, одинаковые ли даты
function isSameDate(date1, date2) {
    return formatDate(date1) === formatDate(date2);
}

// Функция для проверки, является ли дата прошедшей
function isPast(date) {
    return date < today;
}

// Функция для проверки, является ли дата будущей
function isFuture(date) {
    return date > today;
}

// Обновление счетчика XP
function updateXPDisplay() {
    document.getElementById('xpCount').textContent = userXP;
}

// Проверка, нужно ли показывать Спринта
function checkSprintVisibility() {
    if (userHabits.length === 0) {
        document.getElementById('sprintCard').classList.remove('hidden');
    } else {
        document.getElementById('sprintCard').classList.add('hidden');
    }
}

// Генерируем календарь на неделю
function generateWeekCalendar() {
    const weekCalendar = document.getElementById('weekCalendar');
    const dayLabels = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    
    // Очищаем календарь
    weekCalendar.innerHTML = '';
    
    // Находим начало текущей недели
    const weekStart = getWeekStart(selectedDate);
    
    // Создаем 7 дней недели
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayOffset);
        
        const dayItem = document.createElement('div');
        dayItem.className = 'day-item';
        dayItem.dataset.date = formatDate(date);
        
        // Применяем стили в зависимости от даты
        if (isSameDate(date, selectedDate)) {
            dayItem.classList.add('selected');
        } else if (isSameDate(date, today)) {
            dayItem.classList.add('today');
        } else if (isPast(date)) {
            dayItem.classList.add('past');
        } else if (isFuture(date)) {
            dayItem.classList.add('future');
        }
        
        const dayLabel = document.createElement('span');
        dayLabel.className = 'day-label';
        dayLabel.textContent = dayLabels[(dayOffset + 1) % 7];
        
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        
        dayItem.appendChild(dayLabel);
        dayItem.appendChild(dayNumber);
        weekCalendar.appendChild(dayItem);
        
        // Добавляем обработчик клика
        dayItem.addEventListener('click', () => {
            // Снимаем выделение со всех дней
            document.querySelectorAll('.day-item').forEach(item => {
                item.classList.remove('selected');
                const itemDate = new Date(item.dataset.date);
                
                // Восстанавливаем правильные классы
                if (isSameDate(itemDate, today)) {
                    item.classList.add('today');
                } else if (isPast(itemDate)) {
                    item.classList.add('past');
                } else if (isFuture(itemDate)) {
                    item.classList.add('future');
                }
            });
            
            // Выделяем выбранный день
            dayItem.classList.add('selected');
            dayItem.classList.remove('today', 'past', 'future');
            
            selectedDate = new Date(date);
            
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
            
            // Обновляем отображение привычек для выбранной даты
            renderUserHabits();
        });
    }
}

// Отображение привычек пользователя
function renderUserHabits() {
    const habitsList = document.getElementById('habitsList');
    habitsList.innerHTML = '';
    
    const selectedDateStr = formatDate(selectedDate);
    
    userHabits.forEach((habit, index) => {
        const habitItem = document.createElement('div');
        habitItem.className = 'user-habit-item';
        
        const isCompleted = habitCompletions[selectedDateStr]?.[habit.name] || false;
        
        habitItem.innerHTML = `
            <div class="user-habit-info">
                <span class="user-habit-name">${habit.name}</span>
                <div class="user-habit-xp">
                    <span>${habit.xp}</span>
                    <img src="https://raw.githubusercontent.com/Galiya10/sprint-miniapp/5667a2728ab6c2289516169acbe3e71ce53b602e/images/%D1%86%D0%B2%D0%B5%D1%82%D0%BE%D0%BA_xp.png" alt="XP" class="xp-flower">
                </div>
            </div>
            <div class="user-habit-actions">
                <button class="user-habit-delete" data-index="${index}">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7.08331 4.14167L7.26665 3.05001C7.39998 2.25834 7.49998 1.66667 8.90831 1.66667H11.0916C12.5 1.66667 12.6083 2.29167 12.7333 3.05834L12.9166 4.14167" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M15.7084 7.61667L15.1667 16.0083C15.075 17.3167 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3167 4.83335 16.0083L4.29169 7.61667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="user-habit-check ${isCompleted ? 'completed' : ''}" data-index="${index}">
                    ${isCompleted ? '✓' : ''}
                </button>
            </div>
        `;
        
        const checkBtn = habitItem.querySelector('.user-habit-check');
        const deleteBtn = habitItem.querySelector('.user-habit-delete');
        
        checkBtn.addEventListener('click', () => toggleHabitCompletion(habit, selectedDateStr, checkBtn));
        deleteBtn.addEventListener('click', () => deleteHabit(index, habitItem));
        
        habitsList.appendChild(habitItem);
    });
}

// Удаление привычки
function deleteHabit(index, habitElement) {
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('warning');
    }
    
    // Анимация удаления
    habitElement.classList.add('deleting');
    
    setTimeout(() => {
        userHabits.splice(index, 1);
        localStorage.setItem('userHabits', JSON.stringify(userHabits));
        renderUserHabits();
        checkSprintVisibility();
    }, 300);
}

// Переключение выполнения привычки
function toggleHabitCompletion(habit, dateStr, btnElement) {
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    if (!habitCompletions[dateStr]) {
        habitCompletions[dateStr] = {};
    }
    
    const isCurrentlyCompleted = habitCompletions[dateStr][habit.name] || false;
    
    if (!isCurrentlyCompleted) {
        // Отмечаем как выполненную
        habitCompletions[dateStr][habit.name] = true;
        userXP += habit.xp;
        btnElement.classList.add('completed');
        btnElement.textContent = '✓';
    } else {
        // Отменяем выполнение
        habitCompletions[dateStr][habit.name] = false;
        userXP -= habit.xp;
        btnElement.classList.remove('completed');
        btnElement.textContent = '';
    }
    
    // Сохраняем в localStorage
    localStorage.setItem('habitCompletions', JSON.stringify(habitCompletions));
    localStorage.setItem('userXP', userXP.toString());
    
    updateXPDisplay();
}

// Добавление привычки
function addHabit(habitData) {
    userHabits.push(habitData);
    localStorage.setItem('userHabits', JSON.stringify(userHabits));
    renderUserHabits();
    checkSprintVisibility();
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
}

// Обработчик для кнопки добавления привычки
document.getElementById('addHabitBtn').addEventListener('click', () => {
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    // Показываем страницу с привычками
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('habitsPage').classList.remove('hidden');
    
    // Показываем кнопку "Назад" в Telegram
    if (tg?.BackButton) {
        tg.BackButton.show();
    }
});

// Обработчик для закрытия карточки Спринта
document.getElementById('closeSprintCard').addEventListener('click', () => {
    const sprintCard = document.getElementById('sprintCard');
    sprintCard.classList.add('hidden');
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
});

// Обработчики кнопок добавления привычек
document.querySelectorAll('.habit-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const habitItem = e.target.closest('.habit-item');
        const habitData = JSON.parse(habitItem.dataset.habit);
        
        // Проверяем, не добавлена ли уже эта привычка
        const exists = userHabits.some(h => h.name === habitData.name);
        if (!exists) {
            addHabit(habitData);
            
            // Возвращаемся на главную страницу
            document.getElementById('habitsPage').classList.add('hidden');
            document.getElementById('mainPage').classList.remove('hidden');
            
            if (tg?.BackButton) {
                tg.BackButton.hide();
            }
        } else {
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
            if (tg?.showAlert) {
                tg.showAlert('Эта привычка уже добавлена!');
            }
        }
    });
});

// Обработчики для кнопок "добавить свою привычку"
document.querySelectorAll('.add-category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const category = btn.dataset.category;
        const maxXP = parseInt(btn.dataset.maxXp);
        
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
        
        // Запрашиваем название привычки у пользователя
        const habitName = prompt(`Введите название привычки для категории "${category}":`);
        
        if (habitName && habitName.trim()) {
            const customHabit = {
                name: habitName.trim(),
                xp: maxXP,
                category: category
            };
            
            // Проверяем, не добавлена ли уже эта привычка
            const exists = userHabits.some(h => h.name === customHabit.name);
            if (!exists) {
                addHabit(customHabit);
                
                // Возвращаемся на главную страницу
                document.getElementById('habitsPage').classList.add('hidden');
                document.getElementById('mainPage').classList.remove('hidden');
                
                if (tg?.BackButton) {
                    tg.BackButton.hide();
                }
            } else {
                if (tg?.showAlert) {
                    tg.showAlert('Привычка с таким названием уже существует!');
                }
            }
        }
    });
});

// Обработчики для навигации на главной странице
document.querySelectorAll('#mainPage .nav-item').forEach((navItem) => {
    navItem.addEventListener('click', () => {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
        
        document.querySelectorAll('#mainPage .nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');
        
        const page = navItem.getAttribute('data-page');
        console.log(`Навигация: ${page}`);
    });
});

// Обработчики для навигации на странице привычек
document.querySelectorAll('#habitsPage .nav-item').forEach((navItem) => {
    navItem.addEventListener('click', () => {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
        
        const page = navItem.getAttribute('data-page');
        
        // Если нажали на "сегодня"
        if (page === 'today') {
            document.getElementById('habitsPage').classList.add('hidden');
            document.getElementById('mainPage').classList.remove('hidden');
            
            if (tg?.BackButton) {
                tg.BackButton.hide();
            }
            
            // Активируем правильный пункт навигации на главной странице
            document.querySelectorAll('#mainPage .nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-page') === 'today') {
                    item.classList.add('active');
                }
            });
        }
        
        console.log(`Навигация: ${page}`);
    });
});

// Инициализация
generateWeekCalendar();
renderUserHabits();
updateXPDisplay();
checkSprintVisibility();

// Предотвращаем масштабирование на iOS
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

// Предотвращаем двойное нажатие для масштабирования
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
