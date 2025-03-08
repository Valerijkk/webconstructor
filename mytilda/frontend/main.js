document.addEventListener("DOMContentLoaded", () => {
    // Указываем базовый путь для Ace
    ace.config.set('basePath', 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/');

    // Инициализация редакторов Ace
    const htmlEditor = ace.edit("htmlEditor");
    htmlEditor.setTheme("ace/theme/monokai");
    htmlEditor.session.setMode("ace/mode/html");
    htmlEditor.setValue("<html>\n<head>\n<title>Мой сайт</title>\n</head>\n<body>\n<header><h1>Добро пожаловать!</h1></header>\n<main></main>\n<footer><p>Контакты</p></footer>\n</body>\n</html>", -1);

    const cssEditor = ace.edit("cssEditor");
    cssEditor.setTheme("ace/theme/monokai");
    cssEditor.session.setMode("ace/mode/css");

    const jsEditor = ace.edit("jsEditor");
    jsEditor.setTheme("ace/theme/monokai");
    jsEditor.session.setMode("ace/mode/javascript");

    window.htmlEditor = ace.edit("htmlEditor");
    htmlEditor.setTheme("ace/theme/monokai");
    htmlEditor.session.setMode("ace/mode/html");
// Аналогично для cssEditor и jsEditor:
    window.cssEditor = ace.edit("cssEditor");
    cssEditor.setTheme("ace/theme/monokai");
    cssEditor.session.setMode("ace/mode/css");


    // Слушаем события на кнопках
    document.getElementById("newProjectBtn").addEventListener("click", () => createNewProject(htmlEditor, cssEditor, jsEditor));
    document.getElementById("saveProjectBtn").addEventListener("click", () => saveProject(htmlEditor, cssEditor, jsEditor));
    // Добавляем обработчик для предпросмотра
    document.getElementById("previewBtn").addEventListener("click", () => previewProject(htmlEditor, cssEditor, jsEditor));

    if (localStorage.getItem("htmlContent")) {
        htmlEditor.setValue(localStorage.getItem("htmlContent"), -1);
    }
    if (localStorage.getItem("cssContent")) {
        cssEditor.setValue(localStorage.getItem("cssContent"), -1);
    }
    if (localStorage.getItem("jsContent")) {
        jsEditor.setValue(localStorage.getItem("jsContent"), -1);
    }

// Автоматическое сохранение изменений в localStorage
    function saveToLocal() {
        localStorage.setItem("htmlContent", htmlEditor.getValue());
        localStorage.setItem("cssContent", cssEditor.getValue());
        localStorage.setItem("jsContent", jsEditor.getValue());
    }
    htmlEditor.session.on("change", saveToLocal);
    cssEditor.session.on("change", saveToLocal);
    jsEditor.session.on("change", saveToLocal);
});

const htmlEditor = ace.edit("htmlEditor");
// Модифицированная функция создания нового проекта
function createNewProject(htmlEditor, cssEditor, jsEditor) {
    const baseHTML = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Заголовок страницы</title>
    <link rel="stylesheet" href="./styles/style.css">

    <meta property="og:title" content="Заголовок страницы в OG">
    <meta property="og:description" content="Описание страницы в OG">
    <meta property="og:image" content="https://example.com/image.jpg">
    <meta property="og:url" content="https://example.com/">
  </head>
  <body>
    <header>
      <h1>Личный сайт</h1>
      <p>Который сделан на основе готового шаблона</p>
      <nav>
        <ul>
          <li><a href="index.html">Эта страница</a></li>
          <li><a href="catalog.html">Другая страница</a></li>
        </ul>
      </nav>
    </header>
    <main>
      <article>
        <section>
          <h2>Первая секция</h2>
          <p>Она обо мне</p>
          <img src="images/image.png" alt="Человек и пароход">
          <p>Но может быть и о семантике, я пока не решил.</p>
        </section>
        <section>
          <h2>Вторая секция</h2>
          <p>Она тоже обо мне</p>
        </section>
        <section>
          <h2>И третья</h2>
          <p>Вы уже должны были начать догадываться.</p>
        </section>
      </article>
    </main>
    <footer>
      <p>Сюда бы я вписал информацию об авторе и ссылки на другие сайты</p>
    </footer>
    <!-- сюда можно подключить jquery <script src="scripts/app.js" defer></script> -->
  </body>
</html>`;
    htmlEditor.setValue(baseHTML, -1);
    cssEditor.setValue("", -1);
    // Автоматически генерируем и устанавливаем JS с CSS правилами
    updateJsEditorWithCss();
    alert("Новый проект создан!");
}

// Функция для сохранения проекта
async function saveProject(htmlEditor, cssEditor, jsEditor) {
    const projectData = {
        html: htmlEditor.getValue(),
        css: cssEditor.getValue(),
        js: jsEditor.getValue()
    };

    try {
        // Запросить доступ к файловой системе
        const handle = await window.showDirectoryPicker();
        const projectsDir = await handle.getDirectoryHandle("проекты", { create: true });

        // Генерация уникального имени папки для проекта
        const projectName = "my_project_" + new Date().getTime();
        const projectDir = await projectsDir.getDirectoryHandle(projectName, { create: true });

        // Создание HTML файла с объединением стилей и скриптов
        const htmlFile = await projectDir.getFileHandle("index.html", { create: true });
        const htmlWritable = await htmlFile.createWritable();

        const fullHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Проект</title>
    <style>
        ${projectData.css}
    </style>
</head>
<body>
    ${projectData.html}
    <script>
        ${projectData.js}
    </script>
</body>
</html>
        `;
        await htmlWritable.write(fullHtmlContent);
        await htmlWritable.close();

        alert("Проект сохранен в папке 'проекты'!");

    } catch (err) {
        console.error(err);
        alert("Ошибка при сохранении проекта.");
    }
}


// Вставка шаблонов
function insertTemplate(templateName) {
    let content = '';
    switch (templateName) {
        case 'header':
            content = `<header><h1>Мой Хедер</h1></header>`;
            break;
        case 'footer':
            content = `<footer><p>Мой Футер</p></footer>`;
            break;
        case 'a':
            content = `<a href="#">Ссылка</a>`;
            break;
        case 'abbr':
            content = `<abbr title="HTML">HTML</abbr>`;
            break;
        case 'address':
            content = `<address>Контактные данные: email@example.com</address>`;
            break;
        case 'audio':
            content = `<audio controls><source src="audio.mp3" type="audio/mp3">Ваш браузер не поддерживает аудио.</audio>`;
            break;
        case 'b':
            content = `<b>Полужирный текст</b>`;
            break;
        case 'blockquote':
            content = `<blockquote>Это цитата из какого-то источника.</blockquote>`;
            break;
        case 'canvas':
            content = `<canvas id="myCanvas" width="500" height="500">Ваш браузер не поддерживает canvas.</canvas>`;
            break;
        case 'caption':
            content = `<caption>Подпись таблицы</caption>`;
            break;
        case 'code':
            content = `<code>console.log("Hello World!");</code>`;
            break;
        case 'col':
            content = `<col>`;
            break;
        case 'colgroup':
            content = `<colgroup><col></colgroup>`;
            break;
        case 'data':
            content = `<data value="123">Число</data>`;
            break;
        case 'datalist':
            content = `<datalist id="dataList"><option value="Option 1"><option value="Option 2"></datalist>`;
            break;
        case 'dd':
            content = `<dd>Описание термина</dd>`;
            break;
        case 'del':
            content = `<del>Удаленный текст</del>`;
            break;
        case 'details':
            content = `<details><summary>Дополнительные детали</summary><p>Текст, который будет скрыт</p></details>`;
            break;
        case 'dfn':
            content = `<dfn>Термин</dfn>`;
            break;
        case 'dialog':
            content = `<dialog>Диалоговое окно</dialog>`;
            break;
        case 'div':
            content = `<div>Контейнер</div>`;
            break;
        case 'form':
            content = `<form><label for="name">Имя:</label><input type="text" id="name" name="name"></form>`;
            break;
        case 'img':
            content = `<img src="image.jpg" alt="Изображение" />`;
            break;
        case 'input':
            content = `<input type="text" placeholder="Введите текст">`;
            break;
        case 'label':
            content = `<label for="inputField">Метка</label>`;
            break;
        case 'ol':
            content = `<ol><li>Первый элемент</li><li>Второй элемент</li></ol>`;
            break;
        case 'p':
            content = `<p>Параграф текста</p>`;
            break;
        case 'section':
            content = `<section><h3>Секция</h3><p>Контент секции</p></section>`;
            break;
        case 'span':
            content = `<span>Текст в span</span>`;
            break;
        case 'strong':
            content = `<strong>Жирный текст</strong>`;
            break;
        case 'table':
            content = `<table><tr><th>Заголовок</th><td>Данные</td></tr></table>`;
            break;
        case 'ul':
            content = `<ul><li>Первый пункт</li><li>Второй пункт</li></ul>`;
            break;
        case 'element':
            content = `<div>Комментарии</div>`;
            break;
        case 'doctype':
            content = `<!DOCTYPE html>`;
            break;
        case 'area':
            content = `<area shape="rect" coords="34,44,270,350" alt="Область карты" href="https://example.com" />`;
            break;
        case 'article':
            content = `<article>Статья</article>`;
            break;
        case 'aside':
            content = `<aside>Побочный контент</aside>`;
            break;
        case 'base':
            content = `<base href="https://example.com" />`;
            break;
        case 'bdi':
            content = `<bdi>Изолированное направление</bdi>`;
            break;
        case 'bdo':
            content = `<bdo dir="rtl">Направление текста</bdo>`;
            break;
        case 'cite':
            content = `<cite>Источник цитирования</cite>`;
            break;
        case 'colgroup':
            content = `<colgroup><col span="1" /></colgroup>`;
            break;
        case 'data':
            content = `<data value="123">Данные</data>`;
            break;
        case 'datalist':
            content = `<datalist id="dataList"><option value="Option 1"><option value="Option 2"></datalist>`;
            break;
        case 'dd':
            content = `<dd>Описание</dd>`;
            break;
        case 'del':
            content = `<del>Удаленный текст</del>`;
            break;
        case 'details':
            content = `<details><summary>Детали</summary><p>Скрытый текст</p></details>`;
            break;
        case 'dfn':
            content = `<dfn>Термин</dfn>`;
            break;
        case 'dialog':
            content = `<dialog>Диалог</dialog>`;
            break;
        case 'div':
            content = `<div>Контейнер</div>`;
            break;
        case 'dl':
            content = `<dl><dt>Термин</dt><dd>Описание</dd></dl>`;
            break;
        case 'dt':
            content = `<dt>Термин списка</dt>`;
            break;
        case 'em':
            content = `<em>Акцент на важности</em>`;
            break;
        case 'embed':
            content = `<embed src="example.swf" type="application/x-shockwave-flash" />`;
            break;
        case 'fieldset':
            content = `<fieldset><legend>Группировка формы</legend></fieldset>`;
            break;
        case 'figcaption':
            content = `<figcaption>Подпись изображения</figcaption>`;
            break;
        case 'figure':
            content = `<figure><img src="image.jpg" alt="Изображение" /><figcaption>Подпись</figcaption></figure>`;
            break;
        case 'footer':
            content = `<footer>Футер</footer>`;
            break;
        case 'form':
            content = `<form><input type="text" placeholder="Введите текст" /></form>`;
            break;
        case 'h1':
            content = `<h1>Заголовок 1</h1>`;
            break;
        case 'h2':
            content = `<h2>Заголовок 2</h2>`;
            break;
        case 'h3':
            content = `<h3>Заголовок 3</h3>`;
            break;
        case 'h4':
            content = `<h4>Заголовок 4</h4>`;
            break;
        case 'h5':
            content = `<h5>Заголовок 5</h5>`;
            break;
        case 'h6':
            content = `<h6>Заголовок 6</h6>`;
            break;
        default:
            content = ''; // Если шаблон не найден, не вставляем ничего
            break;
    }


    const templateCss = {
        header: "header { background: #f5f5f5; padding: 10px; margin-bottom: 10px; }",
        footer: "footer { background: #222; color: #fff; padding: 10px; margin-top: 10px; }",
        a: "a { color: blue; text-decoration: underline; }",
        abbr: "abbr { border-bottom: 1px dotted #000; cursor: help; }",
        address: "address { font-style: normal; }",
        audio: "audio { display: block; margin: 10px 0; }",
        b: "b { font-weight: bold; }",
        blockquote: "blockquote { margin: 1em 40px; }",
        canvas: "canvas { border: 1px solid #000; }",
        caption: "caption { text-align: center; font-style: italic; }",
        code: "code { background: #eee; padding: 2px 4px; }"
    };


    // Получаем текущую позицию курсора
    const cursorPosition = htmlEditor.getCursorPosition();

    // Вставляем шаблон на текущую позицию курсора
    htmlEditor.session.insert(cursorPosition, content);

    // После вставки перемещаем курсор в конец вставленного текста
    const newPosition = {
        row: cursorPosition.row,
        column: cursorPosition.column + content.length // Сдвигаем курсор после вставки
    };
    htmlEditor.moveCursorTo(newPosition.row, newPosition.column);

    // Если для вставляемого шаблона определены базовые стили, добавляем их в CSS редактор
    if (templateCss.hasOwnProperty(templateName)) {
        const cssRule = templateCss[templateName];
        if (!cssEditor.getValue().includes(cssRule)) {
            cssEditor.session.insert({ row: cssEditor.session.getLength(), column: 0 }, "\n" + cssRule);
        }
    }
}

// Функция для предпросмотра
function previewProject(htmlEditor, cssEditor, jsEditor) {
    const htmlContent = htmlEditor.getValue();
    const cssContent = cssEditor.getValue();
    const jsContent = jsEditor.getValue();

    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Предпросмотр проекта</title>
    <style>
        ${cssContent}
    </style>
</head>
<body>
    ${htmlContent}
    <script>
        ${jsContent}
    </script>
</body>
</html>
    `;

    const previewWindow = window.open("", "_blank");
    previewWindow.document.write(fullHtml);
    previewWindow.document.close();
}
function showEditor(editorId) {
    document.getElementById("htmlEditor").classList.add("hidden");
    document.getElementById("cssEditor").classList.add("hidden");
    document.getElementById("jsEditor").classList.add("hidden");
    document.getElementById(editorId).classList.remove("hidden");
}
document.getElementById("tab-html").addEventListener("click", () => showEditor("htmlEditor"));
document.getElementById("tab-css").addEventListener("click", () => showEditor("cssEditor"));
document.getElementById("tab-js").addEventListener("click", () => showEditor("jsEditor"));


function updateJsEditorWithCss() {
    const cssContent = cssEditor.getValue();
    const jsTemplate = `(function(){
    var style = document.createElement('style');
    style.innerHTML = \`${cssContent}\`;
    document.head.appendChild(style);
})();`;
    jsEditor.setValue(jsTemplate, -1);
}