import { init, miniApp, themeParams, viewport } from '@telegram-apps/sdk';

// Инициализация Telegram Mini App SDK
try {
    init();
    
    // Включаем полноэкранный режим
    if (viewport.mount.isAvailable()) {
        viewport.mount();
        viewport.expand();
    }
    
    // Применяем тему Telegram
    if (themeParams.mount.isAvailable()) {
        themeParams.mount();
    }
    
    // Настраиваем Mini App
    if (miniApp.mount.isAvailable()) {
        miniApp.mount();
        miniApp.setHeaderColor('#2C3744');
        miniApp.setBackgroundColor('#2C3744');
    }
    
    // Готовность приложения
    if (miniApp.ready.isAvailable()) {
        miniApp.ready();
    }
    
} catch (error) {
    console.error('Ошибка инициализации Telegram SDK:', error);
}

// Получаем текущую дату
const today = new Date();
const currentDay = today.getDate();

// Генерируем календарь на неделю
function generateWeekCalendar() {
    const weekCalendar = document.querySelector('.week-calendar');
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
            
            // Здесь можно добавить логику загрузки привычек для выбранного дня
            if (miniApp.hapticFeedback?.impactOccurred.isAvailable()) {
                miniApp.hapticFeedback.impactOccurred('light');
            }
        });
    }
}

// Обработчик для кнопки добавления привычки
document.querySelector('.add-habit-btn').addEventListener('click', () => {
    if (miniApp.hapticFeedback?.impactOccurred.isAvailable()) {
        miniApp.hapticFeedback.impactOccurred('medium');
    }
    
    // Здесь добавьте логику открытия формы создания привычки
    console.log('Добавить новую привычку');
});

// Обработчик для кнопки наград
document.querySelector('.rewards-btn').addEventListener('click', () => {
    if (miniApp.hapticFeedback?.impactOccurred.isAvailable()) {
        miniApp.hapticFeedback.impactOccurred('light');
    }
    
    // Здесь добавьте логику открытия экрана наград
    console.log('Открыть награды');
});

// Обработчики для навигации
document.querySelectorAll('.nav-item').forEach((navItem, index) => {
    navItem.addEventListener('click', () => {
        if (miniApp.hapticFeedback?.impactOccurred.isAvailable()) {
            miniApp.hapticFeedback.impactOccurred('light');
        }
        
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navItem.classList.add('active');
        
        // Здесь добавьте логику навигации
        const labels = ['сегодня', 'дуэль', 'сад', 'история'];
        console.log(`Навигация: ${labels[index]}`);
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
