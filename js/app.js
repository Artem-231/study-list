import { storageKey, statusOptions, sortOptions } from './data.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

document.title = 'Учебный список';
const charset = document.createElement('meta');
charset.setAttribute('charset', 'UTF-8');
const viewport = document.createElement('meta');
viewport.name = 'viewport';
viewport.content = 'width=device-width, initial-scale=1';
const style = document.createElement('link');
style.rel = 'stylesheet';
style.href = 'css/style.css';
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'images/favicon.svg';
document.head.append(charset, viewport, style, favicon);

const header = element('header', 'page-header');
header.append(element('p', 'eyebrow', 'Лабораторная работа № 2'), element('h1', '', 'Учебный список'));
const main = element('main', 'layout');
const composer = element('section', 'composer');
composer.setAttribute('aria-labelledby', 'new-heading');
const formHeading = element('h2', '', 'Добавить задачу');
formHeading.id = 'new-heading';
const form = element('form');
function field(labelText, id, type) {
  const group = element('div', 'field');
  const label = element('label', '', labelText);
  label.htmlFor = id;
  const input = document.createElement('input');
  input.id = id;
  input.name = id;
  input.type = type;
  input.required = true;
  if (type === 'text') input.maxLength = 120;
  group.append(label, input);
  return { group, input };
}
const titleField = field('Что нужно сделать', 'task-title', 'text');
const dateField = field('Срок', 'task-date', 'date');
const add = element('button', 'primary', 'Добавить');
add.type = 'submit';
add.disabled = true;
form.append(titleField.group, dateField.group, add);
composer.append(formHeading, form, element('p', 'muted', 'Название — до 120 символов. Дату можно изменить позже.'));

const workspace = element('section', 'workspace');
workspace.setAttribute('aria-labelledby', 'list-heading');
const heading = element('h2', '', 'Мои задачи');
heading.id = 'list-heading';
const summary = element('p', 'muted', 'Пока задач нет');
const status = element('p', 'status');
status.setAttribute('role', 'status');
const storageNote = element('p', 'storage-note');
storageNote.setAttribute('role', 'status');
const list = element('ol', 'task-list');
const empty = element('p', 'empty', 'Запишите первую задачу слева.');
workspace.append(heading, summary, status, storageNote, list, empty);
main.append(composer, workspace);
const footer = element('footer', 'page-footer', 'Планируйте небольшими шагами.');
document.body.append(header, main, footer);

let tasks = [];
let editingId = null;
add.disabled = false;

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T12:00:00Z');
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function checkFields(title, date) {
  title.value = title.value.trim();
  title.setCustomValidity(title.value ? '' : 'Введите название задачи.');
  date.setCustomValidity(validDate(date.value) ? '' : 'Укажите существующую дату.');
  return title.reportValidity() && date.reportValidity();
}

form.addEventListener('input', event => event.target.setCustomValidity(''));
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!checkFields(titleField.input, dateField.input)) return;
  tasks.push({
    id: crypto.randomUUID(),
    title: titleField.input.value,
    due: dateField.input.value,
    done: false
  });
  form.reset();
  commit();
  status.textContent = 'Задача добавлена.';
  titleField.input.focus();
});

function button(text, action) {
  const node = element('button', 'small-button', text);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

function commit() {
  save();
  render();
}

function render() {
  const focused = document.activeElement.id;
  list.replaceChildren();
  let shown = tasks;
  shown = selectedTasks();
  for (const task of shown) {
    const row = element('li', 'task-row');
    row.dataset.id = task.id;
    row.classList.toggle('done', task.done);
    if (editingId === task.id) {
      const editor = element('form', 'inline-editor');
      const name = field('Название', 'edit-title', 'text');
      const due = field('Срок', 'edit-date', 'date');
      name.input.value = task.title;
      due.input.value = task.due;
      const submit = element('button', 'primary', 'Сохранить');
      submit.type = 'submit';
      const cancel = button('Отмена', () => {
        editingId = null;
        render();
        document.getElementById('edit-' + task.id).focus();
      });
      editor.append(name.group, due.group, submit, cancel);
      editor.addEventListener('input', event => event.target.setCustomValidity(''));
      editor.addEventListener('submit', event => {
        event.preventDefault();
        if (!checkFields(name.input, due.input)) return;
        task.title = name.input.value;
        task.due = due.input.value;
        editingId = null;
        commit();
        status.textContent = 'Изменения сохранены.';
        const editButton = document.getElementById('edit-' + task.id);
        (editButton || heading).focus();
      });
      row.append(editor);
    } else {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'done-' + task.id;
      checkbox.checked = task.done;
      checkbox.setAttribute('aria-label', 'Выполнено: ' + task.title);
      checkbox.addEventListener('change', () => {
        task.done = checkbox.checked;
        commit();
        status.textContent = task.done ? 'Задача выполнена.' : 'Задача возвращена в работу.';
      });
      const content = element('div', 'task-content');
      const title = element('h3', 'task-name', task.title);
      const date = element('time', 'muted', task.due.split('-').reverse().join('.'));
      date.dateTime = task.due;
      content.append(title, date);
      const actions = element('div', 'row-actions');
      const edit = button('Изменить', () => {
        editingId = task.id;
        render();
        document.getElementById('edit-title').focus();
      });
      edit.id = 'edit-' + task.id;
      const remove = button('Удалить', () => {
        tasks = tasks.filter(item => item.id !== task.id);
        commit();
        status.textContent = 'Задача удалена.';
        heading.focus();
      });
      actions.append(edit, remove);
      row.append(checkbox, content, actions);
    }
    list.append(row);
  }
  const doneCount = tasks.filter(task => task.done).length;
  summary.textContent = 'Всего: ' + tasks.length + '. Выполнено: ' + doneCount + '. Показано: ' + shown.length + '.';
  empty.hidden = shown.length > 0;
  empty.textContent = tasks.length ? 'По этим условиям задач нет.' : 'Запишите первую задачу слева.';
  const previous = document.getElementById(focused);
  if (previous && !previous.disabled) previous.focus();
  else if (focused.startsWith('done-')) heading.focus();
}
heading.tabIndex = -1;

const filters = element('div', 'filters');
function selectField(labelText, id, choices) {
  const group = element('div', 'field');
  const label = element('label', '', labelText);
  label.htmlFor = id;
  const select = document.createElement('select');
  select.id = id;
  for (const [value, text] of choices) {
    const option = element('option', '', text);
    option.value = value;
    select.append(option);
  }
  group.append(label, select);
  return { group, select };
}
const search = field('Найти по названию', 'search', 'search');
const day = field('На дату', 'filter-date', 'date');
search.input.required = false;
day.input.required = false;
const filter = selectField('Состояние', 'filter-status', statusOptions);
const order = selectField('Порядок', 'sort', sortOptions);
const reset = button('Сбросить условия', () => {
  search.input.value = '';
  day.input.value = '';
  filter.select.value = 'all';
  order.select.value = 'manual';
  editingId = null;
  render();
});
filters.append(search.group, day.group, filter.group, order.group, reset);
workspace.insertBefore(filters, summary);
filters.addEventListener('input', () => { editingId = null; render(); });
filters.addEventListener('change', () => { editingId = null; render(); });

function selectedTasks() {
  const query = search.input.value.trim().toLocaleLowerCase('ru');
  const result = tasks.filter(task => {
    const matchesStatus = filter.select.value === 'all' || task.done === (filter.select.value === 'done');
    const matchesTitle = task.title.toLocaleLowerCase('ru').includes(query);
    const matchesDate = !day.input.value || task.due === day.input.value;
    return matchesStatus && matchesTitle && matchesDate;
  });
  if (order.select.value === 'soon') result.sort((a, b) => a.due.localeCompare(b.due));
  if (order.select.value === 'later') result.sort((a, b) => b.due.localeCompare(a.due));
  return result;
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    storageNote.textContent = '';
  } catch (error) {
    console.warn('Запись учебного списка не удалась:', error);
    storageNote.textContent = 'Сохранение недоступно. После обновления изменения могут потеряться.';
  }
}

function restore() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === null) return;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) throw new Error('Ожидался массив задач');
    const seen = new Set();
    let skipped = 0;
    for (const item of saved) {
      const valid = item
        && typeof item.id === 'string'
        && /^[a-zA-Z0-9-]{1,80}$/.test(item.id)
        && typeof item.title === 'string'
        && item.title.trim().length > 0
        && item.title.length <= 120
        && validDate(item.due)
        && typeof item.done === 'boolean';
      if (!valid || seen.has(item.id)) {
        skipped += 1;
        continue;
      }
      seen.add(item.id);
      tasks.push({ id: item.id, title: item.title.trim(), due: item.due, done: item.done });
    }
    if (skipped) storageNote.textContent = 'Пропущено повреждённых записей: ' + skipped + '.';
  } catch (error) {
    console.warn('Чтение учебного списка не удалось:', error);
    storageNote.textContent = 'Не удалось восстановить задачи. Можно начать новый список.';
  }
}
restore();


render();
