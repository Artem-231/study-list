
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




