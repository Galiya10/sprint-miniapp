// Инициализация Telegram Web App (используем старый API напрямую)
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#2C3744');
    tg.setBackgroundColor('#2C3744');
}

// Получаем текущую дату
const today = new Date();

// Генерируем календарь на неделю
function generateWeekCalendar() {
    const weekCalendar = document.getElementById('weekCalendar');
    const dayLabels = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    
    // Находим начало недели (понедельник)
    const currentDayOfWeek = today.getDay();
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    // Очищаем календарь
    weekCalendar.innerHTML = '';
    
    // Создаем дни недели
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        
        const dayItem = document.createElement('div');
        dayItem.className = 'day-item';
        
        if (date.toDateString() === today.toDateString()) {
            dayItem.classList.add('active');
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
            document.querySelectorAll('.day-item').forEach(item => {
                item.classList.remove('active');
            });
            dayItem.classList.add('active');
            
            // Добавляем тактильную обратную связь
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
        });
    }
}

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
