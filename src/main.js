import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rssForm');
  const input = document.getElementById('rssInput');
  const content = document.getElementById('content');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = input.value.trim();

    if (!url) return;

    const block = document.createElement('div');
    block.classList.add('alert', 'alert-success', 'mt-4');
    block.textContent = `RSS успешно добавлен: ${url}`;
    content.prepend(block);

    input.value = '';
  });
});
