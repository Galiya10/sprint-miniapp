// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Применяем тему Telegram
document.body.style.backgroundColor = tg.themeParams.bg_color || '#2C3E50';

// Получаем данные пользователя
const user = tg.initDataUnsafe.user;
const userId = user?.id || 'demo';
const userName = user?.first_name || 'Пользователь';

console.log('User:', userName, 'ID:', userId);

// API endpoint (замените на ваш реальный URL)
const API_URL = 'https://your-backend.com/api';

// Состояние приложения
const state = {
    currentDate: new Date(),
    selectedDate: new Date(),
    habits: [],
    userProgress: {}
};

// ============= ИНИЦИАЛИЗАЦИЯ =============
document.addEventListener('DOMContentLoaded', () => {
    initCalendar();
    loadHabits();
    initNavigation();
    initModal();
    initMascot();
});

// ============= КАЛЕНДАРЬ =============
function initCalendar() {
    const weekDays = document.querySelectorAll('.week-day');
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    
    weekDays.forEach((dayEl, index) => {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + index);
        
        const dayNumber = date.getDate();
        const isToday = date.toDateString() === today.toDateString();
        const isFuture = date > today;
        
        dayEl.querySelector('.day-number').textContent = dayNumber;
        
        if (isToday) {
            dayEl.classList.add('active');
        } else if (isFuture) {
            dayEl.classList.add('future');
        }
        
        // Кликабельность для прошлых и сегодняшнего дня
        if (!isFuture) {
            dayEl.style.cursor = 'pointer';
            dayEl.addEventListener('click', () => selectDate(date));
        }
    });
}

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Понедельник
    return new Date(d.setDate(diff));
}

function selectDate(date) {
    state.selectedDate = date;
    
    // Обновляем визуально
    document.querySelectorAll('.week-day').forEach(el => {
        el.classList.remove('active');
    });
    
    // Загружаем привычки для выбранной даты
    loadHabitsForDate(date);
}

// ============= ЗАГРУЗКА ПРИВЫЧЕК =============
async function loadHabits() {
    try {
        // Здесь должен быть реальный API запрос
        // const response = await fetch(`${API_URL}/habits?user_id=${userId}`);
        // const data = await response.json();
        
        // Демо данные из вашего дизайна
        const demoHabits = [
            {
                category: 'Здоровье',
                habits: [
                    { name: 'Сон по режиму', reward: 10, completed: false, action: 'зарядка' },
                    { name: 'Прием витаминов', reward: 2, completed: false, action: 'витамины' },
                    { name: 'Больше воды', reward: 2, completed: false, action: 'вода' }
                ]
            },
            {
                category: 'Спорт',
                habits: [
                    { name: 'Прогулка', reward: 5, completed: false, action: 'прогулка' },
                    { name: 'Зарядка', reward: 5, completed: false, action: 'зарядка' },
                    { name: 'Тренировка', reward: 10, completed: false, action: 'тренировка' },
                    { name: 'Йога/пилатес', reward: 5, completed: false, action: 'йога' }
                ]
            }
        ];
        
        state.habits = demoHabits;
        renderHabits();
        
    } catch (error) {
        console.error('Ошибка загрузки привычек:', error);
        tg.showAlert('Не удалось загрузить привычки');
    }
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
        
        category.habits.forEach(habit => {
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
        <div class="habit-main">
            <span class="habit-name">${habit.name}</span>
            <span class="habit-reward">${habit.reward}🌸</span>
        </div>
        <button class="habit-check ${habit.completed ? 'checked' : ''}">
            ${habit.completed ? '✓' : '+'}
        </button>
    `;
    
    const checkBtn = card.querySelector('.habit-check');
    checkBtn.addEventListener('click', () => toggleHabit(habit, checkBtn));
    
    return card;
}

async function toggleHabit(habit, button) {
    habit.completed = !habit.completed;
    
    // Анимация
    button.classList.toggle('checked');
    button.textContent = habit.completed ? '✓' : '+';
    
    // Вибрация
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    // Отправка на сервер
    try {
        // await fetch(`${API_URL}/habits/toggle`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         user_id: userId,
        //         action: habit.action,
        //         date: state.selectedDate.toISOString(),
        //         completed: habit.completed
        //     })
        // });
        
        console.log('Habit toggled:', habit.name, habit.completed);
        
        // Показать сообщение от Спринта при первом выполнении
        if (habit.completed) {
            showMascotMessage(`Отлично! +${habit.reward}🌸 за "${habit.name}"`);
        }
        
    } catch (error) {
        console.error('Ошибка сохранения привычки:', error);
        habit.completed = !habit.completed; // Откат
        button.classList.toggle('checked');
        button.textContent = habit.completed ? '✓' : '+';
    }
}

// ============= МОДАЛЬНОЕ ОКНО =============
function initModal() {
    const addBtn = document.getElementById('add-habit-btn');
    const modal = document.getElementById('habit-modal');
    const closeBtn = modal.querySelector('.modal-close');
    
    addBtn.addEventListener('click', () => {
        modal.classList.add('active');
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Обработка добавления привычек из модального окна
    const addButtons = modal.querySelectorAll('.habit-add-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const habitItem = this.closest('.habit-item');
            const habitName = habitItem.querySelector('.habit-name').textContent;
            const habitReward = habitItem.querySelector('.habit-reward').textContent;
            
            addHabitToList(habitName, habitReward);
            modal.classList.remove('active');
            
            if (tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }
            
            showMascotMessage(`Добавлена привычка "${habitName}"! Теперь поливай её каждый день 🌱`);
        });
    });
}

function addHabitToList(name, reward) {
    // Логика добавления новой привычки
    console.log('Adding habit:', name, reward);
    
    // Отправка на сервер
    // await fetch(`${API_URL}/habits/add`, {...});
    
    // Перезагрузка списка
    loadHabits();
}

// ============= МАСКОТ СПРИНТ =============
function initMascot() {
    const mascot = document.getElementById('sprint-mascot');
    const closeBtn = mascot.querySelector('.mascot-close');
    
    closeBtn.addEventListener('click', () => {
        mascot.classList.add('hidden');
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
    
    // Автоскрытие через 5 секунд
    setTimeout(() => {
        mascot.classList.add('hidden');
    }, 5000);
}

// ============= НАВИГАЦИЯ =============
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    const screens = document.querySelectorAll('.screen');
    
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const screenName = btn.dataset.screen;
            
            // Обновляем активную кнопку
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Показываем нужный экран
            screens.forEach(s => s.classList.remove('active'));
            document.getElementById(`screen-${screenName}`).classList.add('active');
            
            // Обновляем заголовок
            const titles = {
                'today': 'Сегодня',
                'duel': 'Дуэль',
                'garden': 'Сад',
                'stats': 'История'
            };
            document.getElementById('page-title').textContent = titles[screenName];
            
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
        });
    });
}

// ============= РАБОТА С ДАТОЙ =============
async function loadHabitsForDate(date) {
    // Загрузка привычек для конкретной даты
    console.log('Loading habits for:', date.toLocaleDateString('ru-RU'));
    // Реализация загрузки с сервера
}

// Отправка данных при закрытии приложения
window.addEventListener('beforeunload', () => {
    // Сохранение состояния
    console.log('Saving state before close');
});
