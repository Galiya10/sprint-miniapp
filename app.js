// Инициализация Telegram Web App
const tg = window.Telegram?.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
    tg.setHeaderColor('#2C3744');
    tg.setBackgroundColor('#2C3744');
    tg.enableClosingConfirmation();
    
    // Устанавливаем кнопку "Назад" для страницы привычек
    tg.BackButton.onClick(() => {
        if (!document.getElementById('habitsPage').classList.contains('hidden')) {
            document.getElementById('habitsPage').classList.add('hidden');
            document.getElementById('mainPage').classList.remove('hidden');
            tg.BackButton.hide();
        }
    });
}

// Хранилище данных
let userHabits = JSON.parse(localStorage.getItem('userHabits')) || [];
let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let habitCompletions = JSON.parse(localStorage.getItem('habitCompletions')) || {};
let selectedHabitIndex = null;

// Получаем текущую дату
const today = new Date();
today.setHours(0, 0, 0, 0);

// Выбранная дата
let selectedDate = new Date(today);

// Текущая неделя для отображения
let currentWeekStart = getWeekStart(selectedDate);

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

// Генерируем календарь с плавным скроллом по неделям
function generateWeekCalendar() {
    const weekCalendar = document.getElementById('weekCalendar');
    const dayLabels = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    
    // Очищаем календарь
    weekCalendar.innerHTML = '';
    
    // Генерируем недели: 8 недель назад, текущая неделя, 8 недель вперед (всего 17 недель)
    const weeksToShow = 17;
    const weekOffset = -8;
    
    for (let weekNum = 0; weekNum < weeksToShow; weekNum++) {
        const weekStartDate = new Date(currentWeekStart);
        weekStartDate.setDate(currentWeekStart.getDate() + (weekOffset + weekNum) * 7);
        
        // Создаем 7 дней для каждой недели
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const date = new Date(weekStartDate);
            date.setDate(weekStartDate.getDate() + dayOffset);
            
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
                
                // Обновляем отображение привычек для выбранной даты
                renderUserHabits();
            });
        }
    }
    
    // Прокручиваем к текущей неделе с небольшой задержкой для отрисовки
    setTimeout(() => {
        scrollToCurrentWeek();
    }, 100);
}

// Плавная прокрутка к текущей неделе с центрированием
function scrollToCurrentWeek() {
    const calendarWrapper = document.getElementById('calendarWrapper');
    const dayItem = calendarWrapper.querySelector(`.day-item[data-date="${formatDate(selectedDate)}"]`);
    
    if (dayItem) {
        const itemLeft = dayItem.offsetLeft;
        const itemWidth = dayItem.offsetWidth;
        const wrapperWidth = calendarWrapper.offsetWidth;
        
        // Центрируем выбранный день
        const scrollPosition = itemLeft - (wrapperWidth / 2) + (itemWidth / 2);
        
        calendarWrapper.scrollTo({
            left: Math.max(0, scrollPosition),
            behavior: 'smooth'
        });
    }
}

// Обработка скролла календаря для динамической подгрузки недель
let scrollTimeout;
const calendarWrapper = document.getElementById('calendarWrapper');

calendarWrapper.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
        const scrollLeft = calendarWrapper.scrollLeft;
        const scrollWidth = calendarWrapper.scrollWidth;
        const clientWidth = calendarWrapper.clientWidth;
        
        // Если прокрутили близко к началу - загружаем предыдущие недели
        if (scrollLeft < 500) {
            const oldScrollWidth = scrollWidth;
            const oldScrollLeft = scrollLeft;
            currentWeekStart.setDate(currentWeekStart.getDate() - 21); // Добавляем 3 недели назад
            generateWeekCalendar();
            
            // Корректируем позицию скролла
            setTimeout(() => {
                const newScrollWidth = calendarWrapper.scrollWidth;
                calendarWrapper.scrollLeft = oldScrollLeft + (newScrollWidth - oldScrollWidth);
            }, 50);
        }
        
        // Если прокрутили близко к концу - загружаем следующие недели
        if (scrollLeft + clientWidth > scrollWidth - 500) {
            currentWeekStart.setDate(currentWeekStart.getDate() + 21); // Добавляем 3 недели вперед
            generateWeekCalendar();
        }
    }, 150);
});

// Плавный скролл по неделям при свайпе
let touchStartX = 0;
let touchEndX = 0;

calendarWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

calendarWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchStartX - touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        const direction = swipeDistance > 0 ? 1 : -1; // 1 = вправо, -1 = влево
        const weekWidth = 7 * 56; // 7 дней * (48px + 8px gap)
        const currentScroll = calendarWrapper.scrollLeft;
        const targetScroll = currentScroll + (direction * weekWidth);
        
        calendarWrapper.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    }
}

// Подсчет общего количества выполнений привычки
function getTotalCompletions(habitName) {
    let count = 0;
    for (const date in habitCompletions) {
        if (habitCompletions[date][habitName]) {
            count++;
        }
    }
    return count;
}

// Показать модальное окно со статистикой привычки
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

// Закрыть модальное окно
function closeModal() {
    document.getElementById('habitStatsModal').classList.add('hidden');
    selectedHabitIndex = null;
}

// Удаление привычки из модального окна
function deleteHabitFromModal() {
    if (selectedHabitIndex !== null) {
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('warning');
        }
        
        userHabits.splice(selectedHabitIndex, 1);
        localStorage.setItem('userHabits', JSON.stringify(userHabits));
        
        closeModal();
        renderUserHabits();
        checkSprintVisibility();
    }
}

// Отображение привычек пользователя с группировкой по категориям
function renderUserHabits() {
    const habitsList = document.getElementById('habitsList');
    habitsList.innerHTML = '';
    
    const selectedDateStr = formatDate(selectedDate);
    
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
            
            // Клик по привычке открывает статистику
            habitItem.addEventListener('click', (e) => {
                // Если кликнули не по кнопке чекбокса
                if (!e.target.closest('.user-habit-check')) {
                    showHabitStats(habit, index);
                }
            });
            
            // Клик по чекбоксу отмечает выполнение
            checkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleHabitCompletion(habit, selectedDateStr, checkBtn);
            });
            
            categoryGroup.appendChild(habitItem);
        });
        
        habitsList.appendChild(categoryGroup);
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
    
    // Показываем кнопку "Назад" в Telegram
    if (tg?.BackButton) {
        tg.BackButton.show();
    }
});

// Обработчик для закрытия карточки Спринта
document.getElementById('closeSprintCard').addEventListener('click', () => {
    const sprintCard = document.getElementById('sprintCard');
    sprintCard.classList.add('hidden');
    
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
});

// Обработчики для модального окна
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('deleteHabitBtn').addEventListener('click', deleteHabitFromModal);

document.getElementById('editHabitBtn').addEventListener('click', () => {
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    // Здесь можно добавить функционал редактирования
    if (tg?.showAlert) {
        tg.showAlert('Функция редактирования будет добавлена в следующей версии!');
    }
});

// Закрытие модального окна по клику на overlay
document.getElementById('habitStatsModal').addEventListener('click', (e) => {
    if (e.target.id === 'habitStatsModal') {
        closeModal();
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
            
            if (tg?.BackButton) {
                tg.BackButton.hide();
            }
        } else {
            if (tg?.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('error');
            }
            if (tg?.showAlert) {
                tg.showAlert('Эта привычка уже добавлена!');
            }
        }
    });
});

// Обработчики для кнопок "добавить свою привычку"
document.querySelectorAll('.add-category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const category = btn.dataset.category;
        const maxXP = parseInt(btn.dataset.maxXp);
        
        if (tg?.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
        
        // Запрашиваем название привычки у пользователя
        const habitName = prompt(`Введите название привычки для категории "${category}":`);
        
        if (habitName && habitName.trim()) {
            const customHabit = {
                name: habitName.trim(),
                xp: maxXP,
                category: category
            };
            
            // Проверяем, не добавлена ли уже эта привычка
            const exists = userHabits.some(h => h.name === customHabit.name);
            if (!exists) {
                addHabit(customHabit);
                
                // Возвращаемся на главную страницу
                document.getElementById('habitsPage').classList.add('hidden');
                document.getElementById('mainPage').classList.remove('hidden');
                
                if (tg?.BackButton) {
                    tg.BackButton.hide();
                }
            } else {
                if (tg?.showAlert) {
                    tg.showAlert('Привычка с таким названием уже существует!');
                }
            }
        }
    });
});

// Обработчик для кнопки "Своя категория"
document.getElementById('addOwnCategory').addEventListener('click', () => {
    if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
    
    const categoryName = prompt('Введите название новой категории:');
    
    if (categoryName && categoryName.trim()) {
        const habitName = prompt(`Введите название привычки для категории "${categoryName.trim()}":`);
        
        if (habitName && habitName.trim()) {
            const xpAmount = prompt('Введите количество XP (от 1 до 10):');
            const xp = parseInt(xpAmount);
            
            if (xp && xp >= 1 && xp <= 10) {
                const customHabit = {
                    name: habitName.trim(),
                    xp: xp,
                    category: categoryName.trim()
                };
                
                // Проверяем, не добавлена ли уже эта привычка
                const exists = userHabits.some(h => h.name === customHabit.name);
                if (!exists) {
                    addHabit(customHabit);
                    
                    // Возвращаемся на главную страницу
                    document.getElementById('habitsPage').classList.add('hidden');
                    document.getElementById('mainPage').classList.remove('hidden');
                    
                    if (tg?.BackButton) {
                        tg.BackButton.hide();
                    }
                } else {
                    if (tg?.showAlert) {
                        tg.showAlert('Привычка с таким названием уже существует!');
                    }
                }
            } else {
                if (tg?.showAlert) {
                    tg.showAlert('Неверное количество XP! Введите число от 1 до 10.');
                }
            }
        }
    }
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
            
            if (tg?.BackButton) {
                tg.BackButton.hide();
            }
            
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
