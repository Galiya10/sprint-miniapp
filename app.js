// ========== ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP ==========
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Применяем цветовую схему Telegram
if (tg.themeParams.bg_color) {
    document.documentElement.style.setProperty('--bg-primary', tg.themeParams.bg_color);
}

// Получаем данные пользователя
const user = tg.initDataUnsafe.user;
const userId = user?.id || 'demo';
const userName = user?.first_name || 'Пользователь';

console.log('👤 Пользователь:', userName, 'ID:', userId);

// ========== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ==========
const state = {
    currentDate: new Date(),
    selectedDate: new Date(),
    habits: []
};

// ========== ДЕМО-ДАННЫЕ ПРИВЫЧЕК ==========
const demoHabits = [
    {
        category: 'Здоровье',
        items: [
            { name: 'Сон по режиму', reward: 10, completed: false, action: 'сон' },
            { name: 'Прием витаминов', reward: 2, completed: false, action: 'витамины' },
            { name: 'Больше воды', reward: 2, completed: false, action: 'вода' }
        ]
    },
    {
        category: 'Спорт',
        items: [
            { name: 'Прогулка', reward: 5, completed: false, action: 'прогулка' },
            { name: 'Зарядка', reward: 5, completed: false, action: 'зарядка' },
            { name: 'Тренировка', reward: 10, completed: false, action: 'тренировка' },
            { name: 'Йога/пилатес', reward: 5, completed: false, action: 'йога' }
        ]
    }
];

// ========== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', () => {
    initCalendar();
    loadHabits();
    initMascot();
    initNavigation();
    initAddHabitButton();
});

// ========== КАЛЕНДАРЬ ==========
function initCalendar() {
    const weekDays = document.querySelectorAll('.week-day');
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    
    weekDays.forEach((dayEl, index) => {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + index);
        
        const dayNumber = date.getDate();
        const isToday = isSameDate(date, today);
        const isFuture = date > today;
        
        dayEl.querySelector('.day-number').textContent = dayNumber;
        
        dayEl.classList.remove('active', 'future');
        if (isToday) {
            dayEl.classList.add('active');
        } else if (isFuture) {
            dayEl.classList.add('future');
        }
        
        // Клик по дню
        if (!isFuture) {
            dayEl.style.cursor = 'pointer';
            dayEl.addEventListener('click', () => {
                selectDate(date, dayEl);
            });
        }
    });
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function isSameDate(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}

function selectDate(date, dayEl) {
    state.selectedDate = date;
    
    // Обновляем активный день
    document.querySelectorAll('.week-day').forEach(el => {
        el.classList.remove('active');
    });
    dayEl.classList.add('active');
    
    // Вибрация
    hapticFeedback('light');
    
    // Загружаем привычки для выбранной даты
    loadHabitsForDate(date);
}

// ========== ПРИВЫЧКИ ==========
function loadHabits() {
    state.habits = demoHabits;
    renderHabits();
}

function renderHabits() {
    const container = document.getElementById('habits-list');
    container.innerHTML = '';
    
    state.habits.forEach(category => {
        const section = document.createElement('div');
        section.className = 'category-section';
        
        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category.category;
        section.appendChild(title);
        
        category.items.forEach(habit => {
            const card = createHabitCard(habit);
            section.appendChild(card);
        });
        
        container.appendChild(section);
    });
}

function createHabitCard(habit) {
    const card = document.createElement('div');
    card.className = 'habit-card';
    
    card.innerHTML = `
        <div class="habit-info">
            <span class="habit-name">${habit.name}</span>
            <span class="habit-reward">${habit.reward}🌸</span>
        </div>
        <button class="habit-check-btn ${habit.completed ? 'checked' : ''}">
            ${habit.completed ? '✓' : '+'}
        </button>
    `;
    
    const checkBtn = card.querySelector('.habit-check-btn');
    checkBtn.addEventListener('click', () => {
        toggleHabit(habit, checkBtn);
    });
    
    return card;
}

function toggleHabit(habit, button) {
    habit.completed = !habit.completed;
    
    // Обновляем UI
    button.classList.toggle('checked');
    button.textContent = habit.completed ? '✓' : '+';
    
    // Вибрация
    hapticFeedback(habit.completed ? 'success' : 'light');
    
    // Показать сообщение от Спринта
    if (habit.completed) {
        showMascotMessage(`Отлично! +${habit.reward}🌸 за "${habit.name}"`);
    }
    
    // Здесь должна быть отправка на сервер
    saveHabitToServer(habit);
}

async function saveHabitToServer(habit) {
    console.log('💾 Сохранение привычки:', habit.name, habit.completed);
    
    // TODO: Реальный API запрос к вашему боту
    // const response = await fetch(`${API_URL}/habits/toggle`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         user_id: userId,
    //         action: habit.action,
    //         date: state.selectedDate.toISOString(),
    //         completed: habit.completed
    //     })
    // });
}

function loadHabitsForDate(date) {
    console.log('📅 Загрузка привычек для:', date.toLocaleDateString('ru-RU'));
    // TODO: Загрузка с сервера для конкретной даты
}

// ========== МАСКОТ СПРИНТ ==========
function initMascot() {
    const mascot = document.getElementById('sprint-mascot');
    const closeBtn = mascot.querySelector('.mascot-close-btn');
    
    closeBtn.addEventListener('click', () => {
        mascot.classList.add('hidden');
        hapticFeedback('light');
    });
    
    // Автоскрытие через 10 секунд
    setTimeout(() => {
        mascot.classList.add('hidden');
    }, 10000);
}

function showMascotMessage(message) {
    const mascot = document.getElementById('sprint-mascot');
    const textEl = mascot.querySelector('.mascot-text');
    
    textEl.textContent = message;
    mascot.classList.remove('hidden');
    
    hapticFeedback('success');
    
    // Автоскрытие через 5 секунд
    setTimeout(() => {
        mascot.classList.add('hidden');
    }, 5000);
}

// ========== КНОПКА ДОБАВЛЕНИЯ ПРИВЫЧКИ ==========
function initAddHabitButton() {
    const addBtn = document.getElementById('add-habit-btn');
    
    addBtn.addEventListener('click', () => {
        hapticFeedback('light');
        tg.showPopup({
            title: 'Добавить привычку',
            message: 'Эта функция скоро будет доступна!',
            buttons: [{ type: 'ok' }]
        });
    });
}

// ========== НАВИГАЦИЯ ==========
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const screenName = btn.dataset.screen;
            
            // Обновляем активную кнопку
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            hapticFeedback('light');
            
            // Обновляем заголовок
            const titles = {
                'today': 'Сегодня',
                'duel': 'Дуэль',
                'garden': 'Сад',
                'stats': 'История'
            };
            document.querySelector('header h1').textContent = titles[screenName];
            
            console.log('📱 Переход на экран:', screenName);
            
            // TODO: Показать соответствующий экран
            if (screenName !== 'today') {
                tg.showAlert(`Экран "${titles[screenName]}" в разработке`);
            }
        });
    });
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function hapticFeedback(type) {
    if (tg.HapticFeedback) {
        if (type === 'success') {
            tg.HapticFeedback.notificationOccurred('success');
        } else if (type === 'light') {
            tg.HapticFeedback.impactOccurred('light');
        } else {
            tg.HapticFeedback.impactOccurred('medium');
        }
    }
}

// ========== ОТЛАДКА ==========
console.log('🚀 Mini App запущен');
console.log('📱 Платформа:', tg.platform);
console.log('🎨 Тема:', tg.colorScheme);
