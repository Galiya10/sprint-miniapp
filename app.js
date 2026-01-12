import React, { useState, useEffect } from 'react';
import { SDKProvider, useMiniApp, useThemeParams } from '@telegram-apps/sdk-react';
import './App.css';

function MainApp() {
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const [selectedDay, setSelectedDay] = useState(8); // Current day (Friday)

  useEffect(() => {
    miniApp.ready();
    miniApp.setHeaderColor('#2C3E50');
  }, [miniApp]);

  const daysOfWeek = [
    { label: 'пн', date: 4 },
    { label: 'вт', date: 5 },
    { label: 'ср', date: 6 },
    { label: 'чт', date: 7 },
    { label: 'пт', date: 8 },
    { label: 'сб', date: 9 },
    { label: 'вс', date: 10 },
  ];

  const handleAddHabit = () => {
    // Handle adding new habit
    console.log('Add new habit clicked');
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <div className="header-section">
        <h1 className="title">Сегодня</h1>
        <div className="reward-icon">
          <img 
            src="https://raw.githubusercontent.com/Galiya10/sprint-miniapp/5667a2728ab6c2289516169acbe3e71ce53b602e/images/%D1%86%D0%B2%D0%B5%D1%82%D0%BE%D0%BA_xp.png" 
            alt="Reward"
            className="reward-img"
          />
        </div>
      </div>

      {/* Week Calendar */}
      <div className="week-calendar">
        {daysOfWeek.map((day) => (
          <div
            key={day.label}
            className={`day-item ${selectedDay === day.date ? 'day-selected' : ''}`}
            onClick={() => setSelectedDay(day.date)}
          >
            <div className="day-label">{day.label}</div>
            <div className={`day-date ${selectedDay === day.date ? 'date-selected' : ''}`}>
              {day.date}
            </div>
          </div>
        ))}
      </div>

      {/* Add Habit Button */}
      <button className="add-habit-button" onClick={handleAddHabit}>
        + добавить новую привычку
      </button>

      {/* Mascot Section */}
      <div className="mascot-section">
        <div className="mascot-container">
          <img 
            src="https://raw.githubusercontent.com/Galiya10/sprint-miniapp/5667a2728ab6c2289516169acbe3e71ce53b602e/images/%D0%BB%D0%B5%D0%BD%D0%B8%D0%B2%D0%B5%D1%86.png"
            alt="Sprint mascot"
            className="mascot-img"
          />
        </div>
        <div className="mascot-bubble">
          <div className="mascot-name">Спринт</div>
          <div className="mascot-message">
            Привет! Я Спринт, твой садовник привычек. Посади свою первую привычку - поливать будем вместе
          </div>
        </div>
        <button className="close-bubble">×</button>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className="nav-item nav-active">
          <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.5 9.09H20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.9955 13.7H12.0045" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.29431 13.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.29431 16.7H8.30329" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="nav-label">сегодня</span>
        </button>

        <button className="nav-item">
          <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9.16 10.87C9.06 10.86 8.94 10.86 8.83 10.87C6.45 10.79 4.56 8.84 4.56 6.44C4.56 3.99 6.54 2 9 2C11.45 2 13.44 3.99 13.44 6.44C13.43 8.84 11.54 10.79 9.16 10.87Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.41 4C18.35 4 19.91 5.57 19.91 7.5C19.91 9.39 18.41 10.93 16.54 11C16.46 10.99 16.37 10.99 16.28 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.16 14.56C1.74 16.18 1.74 18.82 4.16 20.43C6.91 22.27 11.42 22.27 14.17 20.43C16.59 18.81 16.59 16.17 14.17 14.56C11.43 12.73 6.92 12.73 4.16 14.56Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.34 20C19.06 19.85 19.74 19.56 20.3 19.13C21.86 17.96 21.86 16.03 20.3 14.86C19.75 14.44 19.08 14.16 18.37 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="nav-label">дуэль</span>
        </button>

        <button className="nav-item">
          <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 22C17 22 21 17 21 12C21 7 17 2 12 2C7 2 3 7 3 12C3 17 7 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19C14.7614 19 17 16.7614 17 14C17 11.2386 14.7614 9 12 9C9.23858 9 7 11.2386 7 14C7 16.7614 9.23858 19 12 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="nav-label">сад</span>
        </button>

        <button className="nav-item">
          <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 22H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.59998 8.38H4C3.45 8.38 3 8.83 3 9.38V18C3 18.55 3.45 19 4 19H5.59998C6.14998 19 6.59998 18.55 6.59998 18V9.38C6.59998 8.83 6.14998 8.38 5.59998 8.38Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.8 5.19H11.2C10.65 5.19 10.2 5.64 10.2 6.19V18C10.2 18.55 10.65 19 11.2 19H12.8C13.35 19 13.8 18.55 13.8 18V6.19C13.8 5.64 13.35 5.19 12.8 5.19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20 2H18.4C17.85 2 17.4 2.45 17.4 3V18C17.4 18.55 17.85 19 18.4 19H20C20.55 19 21 18.55 21 18V3C21 2.45 20.55 2 20 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="nav-label">история</span>
        </button>
      </nav>
    </div>
  );
}

function App() {
  return (
    <SDKProvider acceptCustomStyles>
      <MainApp />
    </SDKProvider>
  );
}

export default App;
