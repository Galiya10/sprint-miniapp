// Простая логика переключения табов и подсветки календаря
document.querySelectorAll('.nav-item').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.querySelectorAll('.day-cell').forEach(cell=>{
  cell.addEventListener('click', ()=>{
    document.querySelectorAll('.day-cell').forEach(c=>c.classList.remove('active'));
    cell.classList.add('active');
  });
});

document.querySelector('.add-btn').addEventListener('click', ()=>{
  // В мини-приложении Telegram здесь обычно вызывают WebApp API.
  // Для демо — простое всплытие
  alert('Добавить новую привычку');
});
