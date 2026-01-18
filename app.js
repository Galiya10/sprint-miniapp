// ============================================
// ПРИНУДИТЕЛЬНАЯ ОЧИСТКА ВСЕХ ДАННЫХ (убрать после первого запуска!)
// ============================================
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('user') || key.includes('habit') || key.includes('xp') || key.includes('Habit') || key.includes('XP'))) {
        keysToRemove.push(key);
    }
}
keysToRemove.forEach(key => localStorage.removeItem(key));
localStorage.removeItem('userHabits');
localStorage.removeItem('userXP');
localStorage.removeItem('habitCompletions');
console.log('✅ Все данные очищены. Приложение запущено с чистого листа.');

// ============================================
// Инициализация Telegram Web App
// ============================================
const tg = window.Telegram?.WebApp;
let userId = null;

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#2C3744');
    tg.setBackgroundColor('#2C3744');
    tg.enableClosingConfirmation();
    
    userId = tg.initDataUnsafe?.user?.id || 'demo_user';
    
    tg.BackButton.onClick(() => {
        if (!document.getElementById('habitsPage').classList.contains('hidden')) {
            document.getElementById('habitsPage').classList.add('hidden');
            document.getElementById('mainPage').classList.remove('hidden');
            tg.BackButton.hide();
        }
    });
} else {
    userId = 'demo_user';
}

// Функции для работы с localStorage
function getUserKey(key) {
    return `user_${userId}_${key}`;
}

function getUserData(key, defaultValue) {
    const data = localStorage.getItem(getUserKey(key));
    return data ? JSON.parse(data) : defaultValue;
}

function setUserData(key, value) {
    localStorage.setItem(getUserKey(key), JSON.stringify(value));
}

// Хранилище данных
let userHabits = getUserData('userHabits', []);
let userXP = getUserData('userXP', 0);
let habitCompletions = getUserData('habitCompletions', {});
let selectedHabitIndex = null;

console.log('📊 Загруженные данные пользователя:', { userHabits, userXP, habitCompletions });

const today = new Date();
today.setHours(0, 0, 0, 0);

let selectedDate = new Date(today);
let currentWeekIndex = 0;

function getWeekStart(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isSameDate(date1, date2) {
    return formatDate(date1) === formatDate(date2);
}

function isPast(date) {
    return date < today;
}

function isFuture(date) {
    return date > today;
}

function updateXPDisplay() {
    document.getElementById('xpCount').textContent = userXP;
}

// ИСПРАВЛЕНО: Показываем Sprint только когда НЕТ привычек
function checkSprintVisibility() {
    if (userHabits.length === 0) {
        document.getElementById('sprintCard').classList.remove('hidden');
    } else {
        document.getElementById('sprintCard').classList.add('hidden');
    }
}

function generateWeekCalendar() {
    const weekCalendar = document.getElementById('weekCalendar');
    const dayLabels = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    
    weekCalendar.innerHTML = '';
    
    const weeksToShow = 21;
    const weekOffset = -10;
    const baseWeekStart = getWeekStart(today);
    
    for (let weekNum = 0; weekNum < weeksToShow; weekNum++) {
        const weekStartDate = new Date(baseWeekStart);
        weekStartDate.setDate(baseWeekStart.getDate() + (weekOffset + weekNum) * 7);
        
        const weekContainer = document.createElement('div');
        weekContainer.className = 'week-container';
        weekContainer.dataset.weekIndex = weekOffset + weekNum;
        
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const date = new Date(weekStartDate);
            date.setDate(weekStartDate.getDate() + dayOffset);
            
            const dayItem = document.createElement('div');
            dayItem.className = 'day-item';
            dayItem.dataset.date = formatDate(date);
            
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
            dayLabel.textContent = dayLabels[dayOffset];
            
            const dayNumber = document.createElement('span');
            dayNumber.className = 'day-number';
            dayNumber.textContent = date.getDate();
            
            dayItem.appendChild(dayLabel);
            dayItem.appendChild(dayNumber);
            weekContainer.appendChild(dayItem);
            
            dayItem.addEventListener('click', () => {
                document.querySelectorAll('.day-item').forEach(item => {
                    item.classList.remove('selected');
                    const itemDate = new Date(item.dataset.date);
                    if (isSameDate(itemDate, today)) {
                        item.classList.add('today');
                    } else if (isPast(itemDate)) {
                        item.classList.add('past');
                    } else if (isFuture(itemDate)) {
                        item.classList.add('future');
                    }
                });
                
                dayItem.classList.add('selected');
                dayItem.classList.remove('today', 'past', 'future');
                selectedDate = new Date(date);
                
                if (tg?.HapticFeedback) {
                    tg.HapticFeedback.impactOccurred('light');
                }
                
                renderUserHabits();
            });
        }
        
        weekCalendar.appendChild(weekContainer);
    }
    
    setTimeout(() => {
        scrollToWeek(0);
    }, 100);
}

function scrollToWeek(weekIndex) {
    const calendarWrapper = document.getElementById('calendarWrapper');
    const weekContainers = document.querySelectorAll('.week-container');
    const targetWeek = Array.from(weekContainers).find(
        container => parseInt(container.dataset.weekIndex) === weekIndex
    );
    
    if (targetWeek) {
        const containerLeft = targetWeek.offsetLeft - (calendarWrapper.offsetWidth - targetWeek.offsetWidth) / 2;
        calendarWrapper.scrollTo({
            left: containerLeft,
            behavior: 'smooth'
        });
        currentWeekIndex = weekIndex;
    }
}

const calendarWrapper = document.getElementById('calendarWrapper');
let touchStartX = 0;
let touchEndX = 0;
let scrollStartX = 0;
let isScrolling = false;

calendarWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    scrollStartX = calendarWrapper.scrollLeft;
    isScrolling = false;
}, { passive: true });

calendarWrapper.addEventListener('touchmove', (e) => {
    isScrolling = true;
}, { passive: true });

calendarWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    if (isScrolling) {
        handleWeekSwipe();
    }
}, { passive: true });

function handleWeekSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0) {
            scrollToWeek(currentWeekIndex + 1);
        } else {
            scrollToWeek(currentWeekIndex - 1);
        }
        
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    } else {
        scrollToWeek(currentWeekIndex);
    }
}

let scrollTimeout;
calendarWrapper.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const scrollLeft = calendarWrapper.scrollLeft;
        const weekContainers = document.querySelectorAll('.week-container');
        
        let closestWeek = null;
        let closestDistance = Infinity;
        
        weekContainers.forEach(container => {
            const containerCenter = container.offsetLeft + container.offsetWidth / 2;
            const wrapperCenter = scrollLeft + calendarWrapper.offsetWidth / 2;
            const distance = Math.abs(containerCenter - wrapperCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestWeek = container;
            }
        });
        
        if (closestWeek) {
            const weekIndex = parseInt(closestWeek.dataset.weekIndex);
            scrollToWeek(weekIndex);
        }
    }, 150);
});

function getTotalCompletions(habitName) {
    let count = 0;
    for (const date in habitCompletions) {
        if (habitCompletions[date][habitName]) {
            count++;
        }
    }
    return count;
}

function showHabitStats(habit, index) {
    selectedHabitIndex = index;
    
    const modal = document.getElementById('habitStatsModal');
    document.getElementById('modalHabitName').textContent = habit.name;
    document.getElementById('totalCompletions').textContent = getTotalCompletions(habit.name);
    document.getElementById('habitXP').textContent = habit.xp;
    
    modal.classList.remove('hidden');
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

function closeModal() {
    document.getElementById('habitStatsModal').classList.add('hidden');
    selectedHabitIndex = null;
}

function deleteHabitFromModal() {
    if (selectedHabitIndex !== null) {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('warning');
        }
        
        userHabits.splice(selectedHabitIndex, 1);
        setUserData('userHabits', userHabits);
        
        closeModal();
        renderUserHabits();
        checkSprintVisibility();
    }
}

// ИСПРАВЛЕНО: Добавлено приветственное сообщение для пустого состояния
function renderUserHabits() {
    const habitsList = document.getElementById('habitsList');
    habitsList.innerHTML = '';
    
    const selectedDateStr = formatDate(selectedDate);
    
    if (userHabits.length === 0) {
        // Приветственное сообщение
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-content">
                <img src="https://raw.githubusercontent.com/Galiya10/sprint-miniapp/5667a2728ab6c2289516169acbe3e71ce53b602e/images/%D0%BB%D0%B5%D0%BD%D0%B8%D0%B2%D0%B5%D1%86.png" alt="Sprint" class="empty-state-image">
                <h2 class="empty-state-title">Добро пожаловать! 👋</h2>
                <p class="empty-state-text">Начните отслеживать свои привычки, чтобы зарабатывать XP и выращивать сад</p>
            </div>
        `;
        habitsList.appendChild(emptyState);
        
        const addButton = document.createElement('button');
        addButton.className = 'add-habit-btn';
        addButton.innerHTML = `<span class="plus-icon">+</span> <span>Добавить первую привычку</span>`;
        addButton.addEventListener('click', openHabitsPage);
        habitsList.appendChild(addButton);
        return;
    }
    
    // Группируем привычки по категориям
    const habitsByCategory = {};
    userHabits.forEach((habit, index) => {
        const category = habit.category || 'Другое';
        if (!habitsByCategory[category]) {
            habitsByCategory[category] = [];
        }
        habitsByCategory[category].push({ habit, index });
    });
    
    // Отображаем привычки по категориям
    Object.keys(habitsByCategory).forEach(category => {
        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'habit-category-group';
        
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'habit-category-title';
        categoryTitle.textContent = category;
        categoryGroup.appendChild(categoryTitle);
        
        habitsByCategory[category].forEach(({ habit, index }) => {
            const isCompleted = habitCompletions[selectedDateStr]?.[habit.name] || false;
            
            const habitItem = document.createElement('div');
            habitItem.className = 'user-habit-item';
            
            habitItem.innerHTML = `
                <div class="user-habit-info">
                    <div class="user-habit-name">${habit.name}</div>
                    <div class="user-habit-xp">
                        <img src="https://i.ibb.co/wLvqLjH/flower.png" alt="XP" class="xp-flower">
                        ${habit.xp}
                    </div>
                </div>
                <button class="user-habit-check ${isCompleted ? 'completed' : ''}">
                    ${isCompleted ? '✓' : ''}
                </button>
            `;
            
            habitItem.querySelector('.user-habit-info').addEventListener('click', () => {
                showHabitStats(habit, index);
            });
            
            const checkbox = habitItem.querySelector('.user-habit-check');
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleHabitCompletion(habit, checkbox, selectedDateStr);
            });
            
            categoryGroup.appendChild(habitItem);
        });
        
        habitsList.appendChild(categoryGroup);
    });
    
    // Кнопка добавления новой привычки
    const addButton = document.createElement('button');
    addButton.className = 'add-habit-btn';
    addButton.innerHTML = `<span class="plus-icon">+</span>`;
    addButton.addEventListener('click', openHabitsPage);
    habitsList.appendChild(addButton);
}

function toggleHabitCompletion(habit, checkbox, dateStr) {
    const checkDate = new Date(dateStr);
    
    if (checkDate > today) {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
        return;
    }
    
    if (!habitCompletions[dateStr]) {
        habitCompletions[dateStr] = {};
    }
    
    const isCurrentlyCompleted = habitCompletions[dateStr][habit.name] || false;
    
    if (isCurrentlyCompleted) {
        habitCompletions[dateStr][habit.name] = false;
        checkbox.classList.remove('completed');
        checkbox.textContent = '';
        userXP -= habit.xp;
        
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    } else {
        habitCompletions[dateStr][habit.name] = true;
        checkbox.classList.add('completed');
        checkbox.textContent = '✓';
        userXP += habit.xp;
        
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
        }
    }
    
    setUserData('habitCompletions', habitCompletions);
    setUserData('userXP', userXP);
    updateXPDisplay();
}

function openHabitsPage() {
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('habitsPage').classList.remove('hidden');
    
    if (tg?.BackButton) {
        tg.BackButton.show();
    }
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

function addHabitFromCatalog(habitName, habitXP, category) {
    const existingHabit = userHabits.find(h => h.name === habitName && h.category === category);
    
    if (existingHabit) {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('warning');
        }
        return;
    }
    
    userHabits.push({
        name: habitName,
        xp: habitXP,
        category: category
    });
    
    setUserData('userHabits', userHabits);
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
    }
    
    document.getElementById('habitsPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
    
    if (tg?.BackButton) {
        tg.BackButton.hide();
    }
    
    renderUserHabits();
    checkSprintVisibility();
}

function closeSprintCard() {
    document.getElementById('sprintCard').classList.add('hidden');
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Экспорт для HTML
window.openHabitsPage = openHabitsPage;
window.addHabitFromCatalog = addHabitFromCatalog;
window.closeModal = closeModal;
window.deleteHabitFromModal = deleteHabitFromModal;
window.closeSprintCard = closeSprintCard;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    generateWeekCalendar();
    renderUserHabits();
    updateXPDisplay();
    checkSprintVisibility();
});
