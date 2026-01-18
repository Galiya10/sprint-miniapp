// Инициализация Telegram Web App
let tg = null;
let userId = null;
let isInitialized = false;

// Функция безопасной инициализации Telegram WebApp
function initTelegramWebApp() {
    return new Promise((resolve) => {
        if (window.Telegram?.WebApp) {
            tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            // Применяем тему Telegram
            applyTelegramTheme();
            
            // Включаем подтверждение закрытия
            tg.enableClosingConfirmation();
            
            // Получаем ID пользователя
            userId = tg.initDataUnsafe?.user?.id || `demo_${Date.now()}`;
            
            // Настраиваем кнопку "Назад"
            setupBackButton();
            
            isInitialized = true;
            resolve(true);
        } else {
            // Для тестирования вне Telegram
            userId = `demo_${Date.now()}`;
            console.log('Running in demo mode outside Telegram');
            resolve(false);
        }
    });
}

// Применение темы Telegram
function applyTelegramTheme() {
    if (!tg) return;
    
    const root = document.documentElement;
    const theme = tg.themeParams;
    
    if (theme.bg_color) {
        root.style.setProperty('--bg-color', theme.bg_color);
    }
    if (theme.secondary_bg_color) {
        root.style.setProperty('--card-bg', theme.secondary_bg_color);
    }
    if (theme.text_color) {
        root.style.setProperty('--text-primary', theme.text_color);
    }
    if (theme.hint_color) {
        root.style.setProperty('--text-secondary', theme.hint_color);
    }
    if (theme.button_color) {
        root.style.setProperty('--accent-color', theme.button_color);
    }
    
    // Устанавливаем цвета header
    tg.setHeaderColor(theme.bg_color || '#2C3744');
    tg.setBackgroundColor(theme.bg_color || '#2C3744');
}

// Настройка кнопки "Назад"
function setupBackButton() {
    if (!tg) return;
    
    tg.BackButton.onClick(() => {
        const pages = ['mainPage', 'habitsPage', 'statsPage'];
        const currentPage = pages.find(pageId => 
            !document.getElementById(pageId).classList.contains('hidden')
        );
        
        if (currentPage !== 'mainPage') {
            switchToPage('today');
        }
    });
}

// Haptic feedback
function hapticFeedback(style = 'medium') {
    if (tg && tg.HapticFeedback) {
        if (style === 'success') {
            tg.HapticFeedback.notificationOccurred('success');
        } else if (style === 'error') {
            tg.HapticFeedback.notificationOccurred('error');
        } else {
            tg.HapticFeedback.impactOccurred(style); // light, medium, heavy
        }
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
        console.error('Error reading from localStorage:', e);
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

// Загрузка данных пользователя
function loadUserData() {
    userHabits = getUserData('userHabits', []);
    userXP = getUserData('userXP', 0);
    habitCompletions = getUserData('habitCompletions', {});
}

// Сохранение данных пользователя
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
    document.getElementById('xpCount').textContent = userXP;
}

// Проверка, нужно ли показывать Спринта
function checkSprintVisibility() {
    const sprintCard = document.getElementById('sprintCard');
    const sprintDismissed = getUserData('sprintDismissed', false);
    
    if (userHabits.length === 0 && !sprintDismissed) {
        sprintCard.classList.remove('hidden');
    } else {
        sprintCard.classList.add('hidden');
    }
}

// Генерируем календарь с горизонтальным скроллом по неделям
function generateWeekCalendar() {
    const weekCalendar = document.getElementById('weekCalendar');
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
            const completed = Object.values(habitCompletions).some(dates => dates.includes(dateStr));
            if (completed) {
                dayDiv.classList.add('completed');
            }
        }

        dayDiv.addEventListener('click', () => {
            if (!isFuture(date)) {
                selectedDate = new Date(date);
                generateWeekCalendar();
                renderHabits();
                hapticFeedback('light');
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
        hapticFeedback('light');
    } else {
        // Добавляем выполнение
        habitCompletions[index].push(dateStr);
        userXP += userHabits[index].xp;
        hapticFeedback('success');
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
    selectedHabitIndex = editIndex;
    
    if (editIndex !== null) {
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
    hapticFeedback('light');
}

function closeHabitModal() {
    habitModal.classList.add('hidden');
    selectedHabitIndex = null;
}

function saveHabit() {
    const name = habitNameInput.value.trim();
    const xp = parseInt(habitXPInput.value);
    const selectedCategory = document.querySelector('.category-btn.selected');
    
    if (!name) {
        alert('Введите название привычки');
        hapticFeedback('error');
        return;
    }
    
    if (!selectedCategory) {
        alert('Выберите категорию');
        hapticFeedback('error');
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
    hapticFeedback('success');
}

// Удаление привычки
function deleteHabit(index) {
    if (confirm('Удалить эту привычку?')) {
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
        hapticFeedback('success');
    }
}

// Рендер всех привычек на странице "Привычки"
function renderAllHabits() {
    const allHabitsList = document.getElementById('allHabitsList');
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
    document.getElementById('totalXP').textContent = userXP;
    document.getElementById('totalHabits').textContent = userHabits.length;

    // Выполнено сегодня
    const todayStr = formatDate(today);
    let completedToday = 0;
    Object.values(habitCompletions).forEach(dates => {
        if (dates.includes(todayStr)) completedToday++;
    });
    document.getElementById('completedToday').textContent = completedToday;

    // Текущая серия (самая длинная streak среди всех привычек)
    let maxStreak = 0;
    userHabits.forEach((habit, index) => {
        const streak = calculateStreak(index);
        if (streak > maxStreak) maxStreak = streak;
    });
    document.getElementById('currentStreak').textContent = maxStreak;

    // Прогресс по каждой привычке
    const habitsProgressList = document.getElementById('habitsProgressList');
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
        const completions = habitCompletions[index] || [];
        
        // Считаем процент выполнения за последние 30 дней
        let daysInPeriod = 0;
        let completedInPeriod = 0;
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            if (date >= new Date(habit.createdAt || today)) {
                daysInPeriod++;
                if (completions.includes(formatDate(date))) {
                    completedInPeriod++;
                }
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

// Переключение между страницами
function switchToPage(page) {
    const pages = {
        today: 'mainPage',
        habits: 'habitsPage',
        stats: 'statsPage'
    };

    // Скрываем все страницы
    Object.values(pages).forEach(pageId => {
        document.getElementById(pageId).classList.add('hidden');
    });

    // Показываем нужную страницу
    const pageId = pages[page];
    document.getElementById(pageId).classList.remove('hidden');

    // Обновляем навигацию
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Управление кнопкой "Назад" в Telegram
    if (tg) {
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

    hapticFeedback('light');
}

// Инициализация приложения
async function initApp() {
    // Инициализируем Telegram WebApp
    await initTelegramWebApp();
    
    // Загружаем данные пользователя
    loadUserData();
    
    // Инициализируем интерфейс
    updateXPDisplay();
    generateWeekCalendar();
    renderHabits();
    checkSprintVisibility();
    
    // Обработчики событий
    
    // Кнопки добавления привычки
    document.getElementById('addHabitBtn').addEventListener('click', () => {
        openHabitModal();
    });
    
    document.getElementById('addHabitBtn2').addEventListener('click', () => {
        openHabitModal();
    });
    
    // Закрытие модального окна
    document.getElementById('closeModal').addEventListener('click', closeHabitModal);
    
    // Клик вне модального окна
    habitModal.addEventListener('click', (e) => {
        if (e.target === habitModal) {
            closeHabitModal();
        }
    });
    
    // Сохранение привычки
    document.getElementById('saveHabitBtn').addEventListener('click', saveHabit);
    
    // Выбор категории
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            hapticFeedback('light');
        });
    });
    
    // Закрытие карточки Спринта
    document.getElementById('closeSprintCard').addEventListener('click', () => {
        document.getElementById('sprintCard').classList.add('hidden');
        setUserData('sprintDismissed', true);
        hapticFeedback('light');
    });
    
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
    
    calendarWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    calendarWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Свайп влево - следующая неделя
                if (currentWeekIndex < 4) { // Ограничиваем будущими неделями
                    currentWeekIndex++;
                    generateWeekCalendar();
                    hapticFeedback('light');
                }
            } else {
                // Свайп вправо - предыдущая неделя
                if (currentWeekIndex > -52) { // Ограничиваем прошлым годом
                    currentWeekIndex--;
                    generateWeekCalendar();
                    hapticFeedback('light');
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
