// Инициализация Telegram Web App с защитой от race condition
let tg = null;
let userId = null;

// Безопасная инициализация с ожиданием загрузки SDK
function initTelegramWebApp() {
    if (window.Telegram?.WebApp) {
        tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#2C3744');
        tg.setBackgroundColor('#2C3744');
        tg.enableClosingConfirmation();
        
        // Получаем ID пользователя Telegram
        userId = tg.initDataUnsafe?.user?.id || 'demo_user';
        
        // Устанавливаем кнопку "Назад" для страницы привычек
        tg.BackButton.onClick(() => {
            const habitsPage = document.getElementById('habitsPage');
            const statsPage = document.getElementById('statsPage');
            const mainPage = document.getElementById('mainPage');
            
            if (!habitsPage.classList.contains('hidden')) {
                habitsPage.classList.add('hidden');
                mainPage.classList.remove('hidden');
                tg.BackButton.hide();
                updateBottomNav('today');
            } else if (!statsPage.classList.contains('hidden')) {
                statsPage.classList.add('hidden');
                mainPage.classList.remove('hidden');
                tg.BackButton.hide();
                updateBottomNav('today');
            }
        });
    } else {
        // Для тестирования вне Telegram
        userId = 'demo_user';
        console.log('Running outside Telegram');
    }
}

// Функции для работы с localStorage с привязкой к пользователю
function getUserKey(key) {
    return `user_${userId}_${key}`;
}

function getUserData(key, defaultValue) {
    try {
        const data = localStorage.getItem(getUserKey(key));
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Error reading localStorage:', e);
        return defaultValue;
    }
}

function setUserData(key, value) {
    try {
        localStorage.setItem(getUserKey(key), JSON.stringify(value));
    } catch (e) {
        console.error('Error writing to localStorage:', e);
    }
}

// Хранилище данных (теперь привязано к пользователю)
let userHabits = [];
let userXP = 0;
let habitCompletions = {};
let selectedHabitIndex = null;

// Функция загрузки данных пользователя
function loadUserData() {
    userHabits = getUserData('userHabits', []);
    userXP = getUserData('userXP', 0);
    habitCompletions = getUserData('habitCompletions', {});
}

// Функция сохранения данных пользователя
function saveUserData() {
    setUserData('userHabits', userHabits);
    setUserData('userXP', userXP);
    setUserData('habitCompletions', habitCompletions);
}

// Получаем текущую дату
const today = new Date();
today.setHours(0, 0, 0, 0);

// Выбранная дата
let selectedDate = new Date(today);

// Текущая неделя для отображения
let currentWeekIndex = 0;

// Категории привычек с эмодзи
const categories = {
    health: { emoji: '💪', name: 'Здоровье' },
    sport: { emoji: '🏃', name: 'Спорт' },
    nutrition: { emoji: '🥗', name: 'Питание' },
    learning: { emoji: '📚', name: 'Обучение' },
    creativity: { emoji: '🎨', name: 'Творчество' },
    mindfulness: { emoji: '🧘', name: 'Медитация' },
    work: { emoji: '💼', name: 'Работа' },
    social: { emoji: '👥', name: 'Общение' },
    sleep: { emoji: '😴', name: 'Сон' },
    other: { emoji: '⭐', name: 'Другое' }
};

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
    const xpElement = document.getElementById('xpCount');
    if (xpElement) {
        xpElement.textContent = userXP;
    }
}

// Проверка, нужно ли показывать Спринта
function checkSprintVisibility() {
    const sprintCard = document.getElementById('sprintCard');
    if (sprintCard) {
        if (userHabits.length === 0) {
            sprintCard.classList.remove('hidden');
        } else {
            sprintCard.classList.add('hidden');
        }
    }
}

// Генерируем календарь с горизонтальным скроллом по неделям
function generateWeekCalendar() {
    const weekCalendar = document.getElementById('weekCalendar');
    if (!weekCalendar) return;
    
    weekCalendar.innerHTML = '';

    const weekStart = getWeekStart(today);
    weekStart.setDate(weekStart.getDate() + (currentWeekIndex * 7));

    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);

        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';

        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = dayNames[i];

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();

        dayDiv.appendChild(dayName);
        dayDiv.appendChild(dayNumber);

        // Применяем классы
        if (isSameDate(date, selectedDate)) {
            dayDiv.classList.add('selected');
        }

        if (isFuture(date)) {
            dayDiv.classList.add('future');
        } else {
            // Проверяем, есть ли выполненные привычки в этот день
            const dateStr = formatDate(date);
            const completed = Object.values(habitCompletions).some(dates => 
                Array.isArray(dates) && dates.includes(dateStr)
            );
            if (completed) {
                dayDiv.classList.add('completed');
            }
        }

        dayDiv.addEventListener('click', () => {
            if (!isFuture(date)) {
                selectedDate = new Date(date);
                generateWeekCalendar();
                renderHabits();
            }
        });

        weekCalendar.appendChild(dayDiv);
    }

    // Автоскролл к выбранному дню
    setTimeout(() => {
        const selectedDay = weekCalendar.querySelector('.calendar-day.selected');
        if (selectedDay) {
            selectedDay.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, 100);
}

// Рендер привычек по категориям
function renderHabits() {
    const habitsList = document.getElementById('habitsList');
    if (!habitsList) return;
    
    habitsList.innerHTML = '';

    if (userHabits.length === 0) {
        habitsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌱</div>
                <p class="empty-state-text">Пока нет привычек.<br>Добавьте свою первую привычку!</p>
            </div>
        `;
        return;
    }

    // Группируем привычки по категориям
    const groupedHabits = {};
    userHabits.forEach((habit, index) => {
        if (!groupedHabits[habit.category]) {
            groupedHabits[habit.category] = [];
        }
        groupedHabits[habit.category].push({ ...habit, index });
    });

    // Рендерим каждую категорию
    Object.keys(groupedHabits).forEach(categoryKey => {
        const category = categories[categoryKey];
        if (!category) return;
        
        const habits = groupedHabits[categoryKey];

        const section = document.createElement('div');
        section.className = 'category-section';

        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
            <span class="category-emoji">${category.emoji}</span>
            <span>${category.name}</span>
        `;
        section.appendChild(header);

        habits.forEach(habit => {
            const card = document.createElement('div');
            card.className = 'habit-card';

            const dateStr = formatDate(selectedDate);
            const isCompleted = habitCompletions[habit.index]?.includes(dateStr) || false;
            const isFutureDate = isFuture(selectedDate);

            card.innerHTML = `
                <div class="habit-info">
                    <div class="habit-name">${habit.name}</div>
                    <div class="habit-xp">+${habit.xp} XP</div>
                </div>
                <div class="habit-checkbox ${isCompleted ? 'checked' : ''} ${isFutureDate ? 'disabled' : ''}" data-index="${habit.index}"></div>
            `;

            section.appendChild(card);
        });

        habitsList.appendChild(section);
    });

    // Добавляем обработчики для чекбоксов
    document.querySelectorAll('.habit-checkbox:not(.disabled)').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            toggleHabit(index);
        });
    });
}

// Переключение состояния привычки
function toggleHabit(index) {
    const dateStr = formatDate(selectedDate);
    
    if (!habitCompletions[index]) {
        habitCompletions[index] = [];
    }

    const completedIndex = habitCompletions[index].indexOf(dateStr);
    
    if (completedIndex > -1) {
        // Убираем выполнение
        habitCompletions[index].splice(completedIndex, 1);
        userXP -= userHabits[index].xp;
    } else {
        // Добавляем выполнение
        habitCompletions[index].push(dateStr);
        userXP += userHabits[index].xp;
    }

    saveUserData();
    updateXPDisplay();
    renderHabits();
    generateWeekCalendar();
}

// Модальное окно для добавления/редактирования привычки
const habitModal = document.getElementById('habitModal');
const modalTitle = document.getElementById('modalTitle');
const habitNameInput = document.getElementById('habitName');
const habitXPInput = document.getElementById('habitXP');

function openHabitModal(editIndex = null) {
    if (!habitModal) return;
    
    selectedHabitIndex = editIndex;
    
    if (editIndex !== null && userHabits[editIndex]) {
        const habit = userHabits[editIndex];
        modalTitle.textContent = 'Редактировать привычку';
        habitNameInput.value = habit.name;
        habitXPInput.value = habit.xp;
        
        // Выбираем категорию
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.category === habit.category) {
                btn.classList.add('selected');
            }
        });
    } else {
        modalTitle.textContent = 'Новая привычка';
        habitNameInput.value = '';
        habitXPInput.value = '10';
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }
    
    habitModal.classList.remove('hidden');
}

function closeHabitModal() {
    if (habitModal) {
        habitModal.classList.add('hidden');
    }
    selectedHabitIndex = null;
}

function saveHabit() {
    const name = habitNameInput.value.trim();
    const xp = parseInt(habitXPInput.value) || 10;
    const selectedCategory = document.querySelector('.category-btn.selected');
    
    if (!name) {
        alert('Введите название привычки');
        return;
    }
    
    if (!selectedCategory) {
        alert('Выберите категорию');
        return;
    }
    
    const category = selectedCategory.dataset.category;
    
    const habit = { name, xp, category };
    
    if (selectedHabitIndex !== null) {
        userHabits[selectedHabitIndex] = habit;
    } else {
        userHabits.push(habit);
    }
    
    saveUserData();
    closeHabitModal();
    renderHabits();
    renderAllHabits();
    checkSprintVisibility();
}

// Удаление привычки
function deleteHabit(index) {
    if (!confirm('Удалить эту привычку?')) return;
    
    userHabits.splice(index, 1);
    delete habitCompletions[index];
    
    // Перенумеровываем completions
    const newCompletions = {};
    Object.keys(habitCompletions).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
            newCompletions[numKey - 1] = habitCompletions[key];
        } else if (numKey < index) {
            newCompletions[numKey] = habitCompletions[key];
        }
    });
    habitCompletions = newCompletions;
    
    saveUserData();
    renderHabits();
    renderAllHabits();
    checkSprintVisibility();
}

// Рендер всех привычек на странице "Привычки"
function renderAllHabits() {
    const allHabitsList = document.getElementById('allHabitsList');
    if (!allHabitsList) return;
    
    allHabitsList.innerHTML = '';

    if (userHabits.length === 0) {
        allHabitsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌱</div>
                <p class="empty-state-text">Пока нет привычек.<br>Добавьте свою первую привычку!</p>
            </div>
        `;
        return;
    }

    userHabits.forEach((habit, index) => {
        const category = categories[habit.category];
        if (!category) return;
        
        const item = document.createElement('div');
        item.className = 'habit-item';

        item.innerHTML = `
            <div class="habit-item-info">
                <div class="habit-item-name">${category.emoji} ${habit.name}</div>
                <div class="habit-item-details">${category.name} • ${habit.xp} XP</div>
            </div>
            <div class="habit-actions">
                <button class="edit-btn" data-index="${index}">✏️</button>
                <button class="delete-btn" data-index="${index}">🗑️</button>
            </div>
        `;

        allHabitsList.appendChild(item);
    });

    // Обработчики для кнопок редактирования и удаления
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            openHabitModal(index);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteHabit(index);
        });
    });
}

// Рендер статистики
function renderStats() {
    // Общая статистика
    const totalXPElement = document.getElementById('totalXP');
    const totalHabitsElement = document.getElementById('totalHabits');
    const completedTodayElement = document.getElementById('completedToday');
    const currentStreakElement = document.getElementById('currentStreak');
    
    if (totalXPElement) totalXPElement.textContent = userXP;
    if (totalHabitsElement) totalHabitsElement.textContent = userHabits.length;

    // Выполнено сегодня
    const todayStr = formatDate(today);
    let completedToday = 0;
    Object.values(habitCompletions).forEach(dates => {
        if (Array.isArray(dates) && dates.includes(todayStr)) completedToday++;
    });
    if (completedTodayElement) completedTodayElement.textContent = completedToday;

    // Текущая серия (самая длинная streak среди всех привычек)
    let maxStreak = 0;
    userHabits.forEach((habit, index) => {
        const streak = calculateStreak(index);
        if (streak > maxStreak) maxStreak = streak;
    });
    if (currentStreakElement) currentStreakElement.textContent = maxStreak;

    // Прогресс по каждой привычке
    const habitsProgressList = document.getElementById('habitsProgressList');
    if (!habitsProgressList) return;
    
    habitsProgressList.innerHTML = '';

    if (userHabits.length === 0) {
        habitsProgressList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <p class="empty-state-text">Добавьте привычки, чтобы увидеть статистику</p>
            </div>
        `;
        return;
    }

    userHabits.forEach((habit, index) => {
        const category = categories[habit.category];
        if (!category) return;
        
        const completions = habitCompletions[index] || [];
        
        // Считаем процент выполнения за последние 30 дней
        let daysInPeriod = 0;
        let completedInPeriod = 0;
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            daysInPeriod++;
            if (Array.isArray(completions) && completions.includes(formatDate(date))) {
                completedInPeriod++;
            }
        }
        
        const percentage = daysInPeriod > 0 ? Math.round((completedInPeriod / daysInPeriod) * 100) : 0;

        const item = document.createElement('div');
        item.className = 'progress-item';

        item.innerHTML = `
            <div class="progress-header">
                <div class="progress-habit-name">${category.emoji} ${habit.name}</div>
                <div class="progress-percentage">${percentage}%</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        `;

        habitsProgressList.appendChild(item);
    });
}

// Вычисление текущей серии для привычки
function calculateStreak(habitIndex) {
    const completions = habitCompletions[habitIndex] || [];
    if (!Array.isArray(completions)) return 0;
    
    let streak = 0;
    const checkDate = new Date(today);

    while (true) {
        const dateStr = formatDate(checkDate);
        if (completions.includes(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

// Обновление нижней навигации
function updateBottomNav(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });
}

// Переключение между страницами
function switchToPage(page) {
    const pages = {
        today: 'mainPage',
        habits: 'habitsPage',
        stats: 'statsPage'
    };

    // Скрываем все страницы
    Object.values(pages).forEach(pageId => {
        const element = document.getElementById(pageId);
        if (element) element.classList.add('hidden');
    });

    // Показываем нужную страницу
    const pageId = pages[page];
    const pageElement = document.getElementById(pageId);
    if (pageElement) {
        pageElement.classList.remove('hidden');
    }

    // Обновляем навигацию
    updateBottomNav(page);

    // Управление кнопкой "Назад" в Telegram
    if (tg && tg.BackButton) {
        if (page === 'today') {
            tg.BackButton.hide();
        } else {
            tg.BackButton.show();
        }
    }

    // Рендерим контент для соответствующей страницы
    if (page === 'habits') {
        renderAllHabits();
    } else if (page === 'stats') {
        renderStats();
    }
}

// Инициализация приложения
function initApp() {
    // Инициализируем Telegram WebApp
    initTelegramWebApp();
    
    // Загружаем данные пользователя
    loadUserData();
    
    // Инициализируем интерфейс
    updateXPDisplay();
    generateWeekCalendar();
    renderHabits();
    checkSprintVisibility();
    
    // Обработчики событий
    
    // Кнопки добавления привычки
    const addHabitBtn = document.getElementById('addHabitBtn');
    const addHabitBtn2 = document.getElementById('addHabitBtn2');
    
    if (addHabitBtn) {
        addHabitBtn.addEventListener('click', () => openHabitModal());
    }
    
    if (addHabitBtn2) {
        addHabitBtn2.addEventListener('click', () => openHabitModal());
    }
    
    // Закрытие модального окна
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeHabitModal);
    }
    
    // Клик вне модального окна
    if (habitModal) {
        habitModal.addEventListener('click', (e) => {
            if (e.target === habitModal) {
                closeHabitModal();
            }
        });
    }
    
    // Сохранение привычки
    const saveHabitBtn = document.getElementById('saveHabitBtn');
    if (saveHabitBtn) {
        saveHabitBtn.addEventListener('click', saveHabit);
    }
    
    // Выбор категории
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
        });
    });
    
    // Закрытие карточки Спринта
    const closeSprintCard = document.getElementById('closeSprintCard');
    if (closeSprintCard) {
        closeSprintCard.addEventListener('click', () => {
            const sprintCard = document.getElementById('sprintCard');
            if (sprintCard) {
                sprintCard.classList.add('hidden');
            }
        });
    }
    
    // Навигация
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            switchToPage(page);
        });
    });
    
    // Свайп для переключения недель
    let touchStartX = 0;
    let touchEndX = 0;
    
    const calendarWrapper = document.getElementById('calendarWrapper');
    
    if (calendarWrapper) {
        calendarWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        calendarWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Свайп влево - следующая неделя
                if (currentWeekIndex < 4) {
                    currentWeekIndex++;
                    generateWeekCalendar();
                }
            } else {
                // Свайп вправо - предыдущая неделя
                if (currentWeekIndex > -52) {
                    currentWeekIndex--;
                    generateWeekCalendar();
                }
            }
        }
    }
    
    console.log('App initialized successfully');
}

// Запускаем приложение после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
