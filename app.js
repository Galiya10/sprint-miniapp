// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#2C3744');
    tg.setBackgroundColor('#2C3744');
    tg.enableClosingConfirmation();
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

// Генерируем календарь по неделям
function generateWeekCalendar() {
    const weekCalendar = document.getElementById('weekCalendar');
    const dayLabels = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    
    // Очищаем календарь
    weekCalendar.innerHTML = '';
    
    // Генерируем 3 недели: прошлая, текущая, следующая
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 14); // 2 недели назад
    const weekStart = getWeekStart(startDate);
    
    // Создаем группы недель
    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
        const weekGroup = document.createElement('div');
        weekGroup.className = 'week-group';
        
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + (weekOffset * 7) + dayOffset);
            
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
            weekGroup.appendChild(dayItem);
            
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
        
        weekCalendar.appendChild(weekGroup);
    }
    
    // Скроллим к текущей неделе
    setTimeout(() => {
        const todayElement = document.querySelector('.day-item.today, .day-item.selected');
        if (todayElement) {
            const weekGroup = todayElement.closest('.week-group');
            if (weekGroup) {
                weekGroup.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest', 
                    inline: 'center' 
                });
            }
        }
    }, 100);
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
            <button class="user-habit-check ${isCompleted ? 'completed' : ''}" data-index="${index}">
                ${isCompleted ? '✓' : ''}
            </button>
        `;
        
        const checkBtn = habitItem.querySelector('.user-habit-check');
        checkBtn.addEventListener('click', () => toggleHabitCompletion(habit, selectedDateStr, checkBtn));
        
        habitsList.appendChild(habitItem);
    });
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
        } else {
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
            alert('Эта привычка уже добавлена!');
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
        
        // Если нажали на "сегодня" из другой вкладки
        if (page === 'today') {
            // Уже на главной странице
        }
        
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
