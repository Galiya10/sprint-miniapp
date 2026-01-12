// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#2C3744');
    tg.setBackgroundColor('#2C3744');
}

// Текущая отображаемая неделя
let currentWeekStart = new Date();

// Получаем текущую дату
const today = new Date();

// Функция для получения начала недели (понедельник)
function getWeekStart(date) {
    const d = new Date(date);
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

// Функция для проверки, является ли дата сегодняшней
function isToday(date) {
    return formatDate(date) === formatDate(today);
}

// Функция для проверки, является ли дата прошедшей
function isPast(date) {
    return date < today && !isToday(date);
}

// Функция для проверки, является ли дата будущей
function isFuture(date) {
    return date > today && !isToday(date);
}

// Генерируем календарь на неделю
function generateWeekCalendar() {
    const weekCalendar = document.getElementById('weekCalendar');
    const dayLabels = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    
    // Находим начало недели (понедельник)
    const weekStart = getWeekStart(currentWeekStart);
    
    // Очищаем календарь
    weekCalendar.innerHTML = '';
    
    // Создаем дни недели
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        
        const dayItem = document.createElement('div');
        dayItem.className = 'day-item';
        
        // Применяем стили в зависимости от даты
        if (isToday(date)) {
            dayItem.classList.add('today');
        } else if (isPast(date)) {
            dayItem.classList.add('past');
        } else if (isFuture(date)) {
            dayItem.classList.add('future');
        }
        
        const dayLabel = document.createElement('span');
        dayLabel.className = 'day-label';
        dayLabel.textContent = dayLabels[(i + 1) % 7];
        
        const dayNumber = document.createElement('span');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        
        dayItem.appendChild(dayLabel);
        dayItem.appendChild(dayNumber);
        weekCalendar.appendChild(dayItem);
        
        // Добавляем обработчик клика
        dayItem.addEventListener('click', () => {
            // Здесь можно добавить логику загрузки привычек для выбранного дня
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
            console.log('Selected date:', formatDate(date));
        });
    }
}

// Обработчик для кнопки "Предыдущая неделя"
document.getElementById('prevWeek').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    generateWeekCalendar();
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
});

// Обработчик для кнопки "Следующая неделя"
document.getElementById('nextWeek').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    generateWeekCalendar();
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
});

// Обработчик для кнопки добавления привычки
document.querySelector('.add-habit-btn').addEventListener('click', () => {
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
    
    // Здесь добавьте логику открытия формы создания привычки
    console.log('Добавить новую привычку');
});

// Обработчик для кнопки наград
document.querySelector('.rewards-btn').addEventListener('click', () => {
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    // Здесь добавьте логику открытия экрана наград
    console.log('Открыть награды');
});

// Обработчик для закрытия карточки Спринта
document.getElementById('closeSprintCard').addEventListener('click', () => {
    const sprintCard = document.getElementById('sprintCard');
    sprintCard.classList.add('hidden');
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    // Сохраняем состояние в localStorage
    localStorage.setItem('sprintCardHidden', 'true');
});

// Проверяем, была ли карточка скрыта ранее
if (localStorage.getItem('sprintCardHidden') === 'true') {
    document.getElementById('sprintCard').classList.add('hidden');
}

// Обработчики для навигации
document.querySelectorAll('.nav-item').forEach((navItem) => {
    navItem.addEventListener('click', () => {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');
        
        // Здесь добавьте логику навигации
        const page = navItem.getAttribute('data-page');
        console.log(`Навигация: ${page}`);
    });
});

// Инициализируем календарь
generateWeekCalendar();

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
