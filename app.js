// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#2C3744');
    tg.setBackgroundColor('#2C3744');
    tg.enableClosingConfirmation();
}

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

// Генерируем календарь на несколько недель для скролла
function generateWeekCalendar() {
    const weekCalendar = document.getElementById('weekCalendar');
    const dayLabels = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    
    // Очищаем календарь
    weekCalendar.innerHTML = '';
    
    // Генерируем 3 недели: прошлая, текущая, следующая
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 14); // 2 недели назад
    const weekStart = getWeekStart(startDate);
    
    let scrollToElement = null;
    
    // Создаем дни для 4 недель
    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
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
            
            // Запоминаем элемент сегодняшнего дня для скролла
            if (isSameDate(date, today) && !scrollToElement) {
                scrollToElement = dayItem;
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
                
                console.log('Selected date:', formatDate(date));
            });
        }
    }
    
    // Скроллим к сегодняшнему дню
    if (scrollToElement) {
        setTimeout(() => {
            scrollToElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' 
            });
        }, 100);
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

// Обработчик для кнопки "Назад"
document.getElementById('backBtn').addEventListener('click', () => {
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    // Возвращаемся на главную страницу
    document.getElementById('habitsPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
});

// Обработчик для кнопки наград
document.querySelector('.rewards-btn').addEventListener('click', () => {
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    console.log('Открыть награды');
});

// Обработчик для закрытия карточки Спринта
document.getElementById('closeSprintCard').addEventListener('click', () => {
    const sprintCard = document.getElementById('sprintCard');
    sprintCard.classList.add('hidden');
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
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
