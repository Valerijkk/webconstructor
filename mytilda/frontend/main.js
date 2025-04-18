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
const jsEditor = ace.edit("jsEditor");
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
    // Собираем данные из основных редакторов
    const projectData = {
        html: htmlEditor.getValue(),
        css: cssEditor.getValue(),
        js: jsEditor.getValue()
    };

    try {
        // Выбираем корневую папку
        const handle = await window.showDirectoryPicker();
        // Создаем (или получаем) папку "проекты LocalConstructor" в выбранной директории
        const baseDir = await handle.getDirectoryHandle("проекты LocalConstructor", { create: true });
        // Генерируем уникальное имя проекта
        const projectName = "my_project_" + new Date().getTime();
        // Создаем папку для данного проекта внутри baseDir
        const projectDir = await baseDir.getDirectoryHandle(projectName, { create: true });

        // Сохраняем основной HTML (главная страница) в index.html
        const htmlFile = await projectDir.getFileHandle("index.html", { create: true });
        const htmlWritable = await htmlFile.createWritable();
        await htmlWritable.write(projectData.html);
        await htmlWritable.close();

        // Сохраняем CSS в styles.css
        const cssFile = await projectDir.getFileHandle("styles.css", { create: true });
        const cssWritable = await cssFile.createWritable();
        await cssWritable.write(projectData.css);
        await cssWritable.close();

        // Сохраняем JS в script.js
        const jsFile = await projectDir.getFileHandle("script.js", { create: true });
        const jsWritable = await jsFile.createWritable();
        await jsWritable.write(projectData.js);
        await jsWritable.close();

        // Если есть дополнительные страницы (предполагается, что они хранятся в глобальном объекте newPageEditors)
        // Для каждой создадим файл "page_ИмяСтраницы.html"
        if (window.newPageEditors) {
            for (let pageName in window.newPageEditors) {
                const editor = window.newPageEditors[pageName];
                const pageContent = editor.getValue();
                // Чтобы избежать проблем с именованием файлов, можно заменить пробелы на подчёркивания
                const safeName = pageName.replace(/\s+/g, "_");
                const pageFile = await projectDir.getFileHandle(`page_${safeName}.html`, { create: true });
                const pageWritable = await pageFile.createWritable();
                await pageWritable.write(pageContent);
                await pageWritable.close();
            }
        }

        alert("Проект сохранен в папке 'проекты LocalConstructor/" + projectName + "'!");
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


    // Полный объект с базовыми стилями для всех шаблонов
    const templateCss = {
        header: "header { background: #f5f5f5; padding: 10px; margin-bottom: 10px; }",
        footer: "footer { background: #222; color: #fff; padding: 10px; margin-top: 10px; }",
        a: "a { color: blue; text-decoration: underline; }",
        abbr: "abbr { border-bottom: 1px dotted #000; cursor: help; }",
        address: "address { font-style: normal; }",
        audio: "audio { display: block; margin: 10px 0; }",
        b: "b { font-weight: bold; }",
        blockquote: "blockquote { margin: 1em 40px; font-style: italic; }",
        canvas: "canvas { border: 1px solid #000; display: block; margin: 10px 0; }",
        caption: "caption { text-align: center; font-style: italic; }",
        code: "code { background: #eee; padding: 2px 4px; font-family: monospace; }",
        col: "col { background: #ddd; }",
        colgroup: "colgroup { background: #ccc; }",
        data: "data { color: #555; }",
        datalist: "datalist { border: 1px solid #ccc; }",
        dd: "dd { margin-left: 20px; }",
        del: "del { text-decoration: line-through; color: red; }",
        details: "details { padding: 10px; border: 1px solid #aaa; }",
        dfn: "dfn { font-style: italic; }",
        dialog: "dialog { border: 1px solid #000; padding: 10px; }",
        div: "div { margin: 10px 0; }",
        form: "form { margin: 10px 0; }",
        img: "img { max-width: 100%; height: auto; display: block; margin: 10px 0; }",
        input: "input { padding: 5px; border: 1px solid #ccc; }",
        label: "label { font-weight: bold; }",
        ol: "ol { padding-left: 20px; }",
        p: "p { margin: 10px 0; line-height: 1.5; }",
        section: "section { padding: 10px; margin: 10px 0; border: 1px solid #eee; }",
        span: "span { font-size: 1em; }",
        strong: "strong { font-weight: bold; }",
        table: "table { width: 100%; border-collapse: collapse; margin: 10px 0; } table, th, td { border: 1px solid #ccc; padding: 5px; }",
        ul: "ul { padding-left: 20px; list-style-type: disc; }",
        element: ".element { margin: 10px 0; }",
        doctype: "", // Нет стилей для DOCTYPE
        area: "area { }",
        article: "article { padding: 10px; margin: 10px 0; }",
        aside: "aside { background: #f0f0f0; padding: 10px; margin: 10px 0; }",
        base: "", // Нет отображаемых стилей
        bdi: "bdi { direction: ltr; }",
        bdo: "bdo { direction: rtl; }",
        cite: "cite { font-style: italic; }",
        dl: "dl { margin: 10px 0; } dl dt { font-weight: bold; } dl dd { margin-left: 20px; }",
        dt: "dt { font-weight: bold; }",
        em: "em { font-style: italic; }",
        embed: "embed { width: 100%; height: auto; }",
        fieldset: "fieldset { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }",
        figcaption: "figcaption { text-align: center; font-style: italic; }",
        figure: "figure { margin: 10px 0; text-align: center; }",
        h1: "h1 { font-size: 2em; margin: 0.67em 0; }",
        h2: "h2 { font-size: 1.5em; margin: 0.75em 0; }",
        h3: "h3 { font-size: 1.17em; margin: 0.83em 0; }",
        h4: "h4 { font-size: 1em; margin: 1.12em 0; }",
        h5: "h5 { font-size: 0.83em; margin: 1.5em 0; }",
        h6: "h6 { font-size: 0.75em; margin: 1.67em 0; }"
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


document.getElementById("toggleTheme").addEventListener("click", () => {
    const body = document.body;
    const isDark = body.classList.contains("dark");

    if (isDark) {
        // Переключаем на светлую тему
        body.classList.remove("dark");
        htmlEditor.setTheme("ace/theme/chrome");
        cssEditor.setTheme("ace/theme/chrome");
        jsEditor.setTheme("ace/theme/chrome");
    } else {
        // Переключаем на темную тему
        body.classList.add("dark");
        htmlEditor.setTheme("ace/theme/monokai");
        cssEditor.setTheme("ace/theme/monokai");
        jsEditor.setTheme("ace/theme/monokai");
    }
});




    // Пример массива шаблонов сайтов
const siteTemplates = [
    {
        name: "Интернет-магазин",
        html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poller+One&family=Raleway:wght@500&family=Roboto&display=swap"
      rel="stylesheet"
    />

    <title>Shopping Cart</title>
  </head>
  <body>
    <h1>STAR WARS</h1>
    <h4 class="subtitle">May the Force be with you</h4>
    <div class="flex_container">
      <div class="main_series_container">
        <div class="series_container">
          <h2 class="name">Ahsoka <br><span class="year">(2023)</span></h2>
          <p class="imdb">IMDb RATING: <span class="review">8.0</span>/10</p>
          <p class="price">€9.99</p>
          <button onclick="addToBag(this)">ADD TO BAG</button>
        </div>
        <div class="series_container">
          <h2 class="name">
            The Mandalorian <br><span class="year">(2019-2023)</span>
          </h2>
          <p class="imdb">IMDb RATING: <span class="review">8.7</span>/10</p>
          <p class="price">€29.99</p>
          <button onclick="addToBag(this)">ADD TO BAG</button>
        </div>
        <div class="series_container">
          <h2 class="name">Andor <br><span class="year">(2022)</span></h2>
          <p class="imdb">IMDb RATING: <span class="review">8.4</span>/10</p>
          <p class="price">€7.99</p>
          <button onclick="addToBag(this)" class="buy">ADD TO BAG</button>
        </div>
        <div class="series_container">
          <h2 class="name">Obi-Wan Kenobi <br><span class="year">(2022)</span></h2>
          <p class="imdb">IMDb RATING: <span class="review">7.1</span>/10</p>
          <p class="price">€7.99</p>
          <button onclick="addToBag(this)">ADD TO BAG</button>
        </div>
        <div class="series_container">
          <h2 class="name">
            The Book of Boba Fett <br><span class="year">(2021-2022)</span>
          </h2>
          <p class="imdb">IMDb RATING: <span class="review">7.2</span>/10</p>
          <p class="price">€7.99</p>
          <button onclick="addToBag(this)">ADD TO BAG</button>
        </div>
      </div>
      <div class="cart">
        <div class="added_items"></div>
        <div class="total_container">
          <p class="total">TOTAL PURCHASE</p>
          <p class="added_total">€0</p>
        </div>
      </div>
    </div>
    <script src="script.js"></script>
  </body>
</html>`,
        css: `html {
  background-image: url("https://cdn.pixabay.com/photo/2019/12/23/11/08/space-4714327_1280.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

body {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: "Roboto", sans-serif;
}

h1 {
  margin: 40px 0 30px;
  text-align: center;
  font-family: "Poller One", cursive;
  color: black;
  font-size: 60px;
  text-shadow: -1px 1px #FFE81F,
          1px 1px 0 #FFE81F,
         1px -1px 0 #FFE81F,
        -1px -1px 0 #FFE81F;
}

.subtitle {
  color: #FFE81F;
  text-align: center;
  letter-spacing: 3px;
  font-weight: 300;
  margin-bottom: 30px;
}

.flex_container {
  display: flex;
  flex-direction: column;
}

.main_series_container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}

.series_container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-between;
  color: #ffe6ff;
  width: 17%;
  border-radius: 12px;
}

.name, .imdb, .price {
  margin: 5px 0;
}

.name {
  font-size: 22px;
}

.year,
.imdb {
  color: #8c8c8c;
  font-size: 14px;
  font-weight: 200;
}

.review {
  font-size: 16px;
  color: #ffe6ff;
  font-weight:bold;
}

.price, .added_price {
  font-size: 1.5em;
  font-weight: bolder;
}

.added_price {
  color: #ffe6ff;
}

/* button */
.series_container > button {
  background-color: rgb(255, 255, 255, 0.2);
  color: #ffe6ff;
  width: 100%;
  border: none;
  font-family: "Poller One", cursive;
  font-size: 18px;
  border-radius: 12px;
  margin: 15px auto 0;
  padding: 10px 0;
  cursor: pointer;
}

.series_container > button:hover {
background-color:   rgb(255, 232, 31, 0.5);
}

button:disabled {
  background-color: rgb(255, 255, 255, 0.1);
  color: rgb(255, 255, 255, 0.3);
  pointer-events: none; /*stops hover effect*/
} 

.cart {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 450px;
  margin: 50px auto 0;
  color: #ffe6ff;
  border-radius: 12px;
  border: 2px solid rgb(255, 255, 255, 0.2);
  font-family: "Roboto", sans-serif;
}

.added_items {
  margin-top: 7px;
}

.single_added_item {
  display: flex;
  justify-content: space-between;
  margin: 2px 12px;
}

.price_del_container {
  display: flex;
  justify-content: flex-end;
}

.total_container {
  margin: 0 12px 5px;
  display: flex;
  justify-content: space-between;
}

.added_total, .total {
  margin: 5px;
  font-family: "Poller One", cursive;
  color: #FFE81F;
  font-size: 1.2em;
}
.added_total {
  margin-right: 5px;
}

.added_name, .added_price {
  margin: 5px;
  font-size: 1.2em;
  white-space: nowrap;
}

.delete {
  background-color: transparent;
  cursor: pointer;
  border: none;
  color: #8c8c8c;
}

.delete:hover {
  text-decoration: underline;
}

hr {
  width: 100%;
  margin: 0 3px 9px;
  border: none;
  border-bottom: 1px dotted #8c8c8c;
}

@media screen and (max-width: 1024px) {
  .series_container {
    width: 22%;
    margin-bottom: 30px;
  }

  .cart {
    margin: 20px auto 0;
  }
}

@media screen and (max-width: 950px) {
  .series_container {
    width: 26%;
    margin-bottom: 30px;
  }

  .cart {
    margin: 20px auto 0;
  }
}

@media screen and (max-width: 700px) {
  .series_container {
    width: 30%;
    margin-bottom: 30px;
  }

  .cart {
    margin: 20px auto 0;
  }
}

@media screen and (max-width: 600px) {
  .series_container {
    width: 35%;
    margin-bottom: 30px;
  }

  .cart {
    margin: 20px auto 0;
  }
}

@media screen and (max-width: 481px) {
  .series_container {
    width: 45%;
    margin-bottom: 30px;
  }

  .cart {
    margin: 20px auto 0;
  }

  .cart {
    width: 100%;
  }
}`,
        js: `console.log('Интернет-магазин загружен');`
    },
    {
        name: "Блог",
        html: `<!DOCTYPE html>
  <header id="site-header">
    <div class="container">
      <h1>Shopping cart <span>[</span> <em><a href="https://codepen.io/tag/rodeo-007" target="_blank">CodePen Challange</a></em> <span class="last-span is-open">]</span></h1>
    </div>
  </header>

  <div class="container">

    <section id="cart"> 
      <article class="product">
        <header>
          <a class="remove">
            <img src="http://www.astudio.si/preview/blockedwp/wp-content/uploads/2012/08/1.jpg" alt="">

            <h3>Remove product</h3>
          </a>
        </header>

        <div class="content">

          <h1>Lorem ipsum</h1>

          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, numquam quis perspiciatis ea ad omnis provident laborum dolore in atque.

          <div title="You have selected this product to be shipped in the color yellow." style="top: 0" class="color yellow"></div>
          <div style="top: 43px" class="type small">XXL</div>
        </div>

        <footer class="content">
          <span class="qt-minus">-</span>
          <span class="qt">2</span>
          <span class="qt-plus">+</span>

          <h2 class="full-price">
            29.98€
          </h2>

          <h2 class="price">
            14.99€
          </h2>
        </footer>
      </article>

      <article class="product">
        <header>
          <a class="remove">
            <img src="http://www.astudio.si/preview/blockedwp/wp-content/uploads/2012/08/3.jpg" alt="">

            <h3>Remove product</h3>
          </a>
        </header>

        <div class="content">

          <h1>Lorem ipsum dolor</h1>

          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, numquam quis perspiciatis ea ad omnis provident laborum dolore in atque.

          <div title="You have selected this product to be shipped in the color red." style="top: 0" class="color red"></div>
          <div title="You have selected this product to be shipped sized Small."  style="top: 43px" class="type small">Small</div>
        </div>

        <footer class="content">
          
          <span class="qt-minus">-</span>
          <span class="qt">1</span>
          <span class="qt-plus">+</span>

          <h2 class="full-price">
            79.99€
          </h2>

          <h2 class="price">
            79.99€
          </h2>
        </footer>
      </article>

      <article class="product">
        <header>
          <a class="remove">
            <img src="http://www.astudio.si/preview/blockedwp/wp-content/uploads/2012/08/5.jpg" alt="">

            <h3>Remove product</h3>
          </a>
        </header>

        <div class="content">

          <h1>Lorem ipsum dolor ipsdu</h1>

          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Soluta, numquam quis perspiciatis ea ad omnis provident laborum dolore in atque.

          <div title="You have selected this product to be shipped in the color blue." style="top: 0" class="color blue"></div>
          <div style="top: 43px" class="type small">Large</div>
        </div>

        <footer class="content">
          
          <span class="qt-minus">-</span>
          <span class="qt">3</span>
          <span class="qt-plus">+</span>

          <h2 class="full-price">
            53.99€
          </h2>

          <h2 class="price">
            17.99€
          </h2>
        </footer>
      </article>

    </section>

  </div>

  <footer id="site-footer">
    <div class="container clearfix">

      <div class="left">
        <h2 class="subtotal">Subtotal: <span>163.96</span>€</h2>
        <h3 class="tax">Taxes (5%): <span>8.2</span>€</h3>
        <h3 class="shipping">Shipping: <span>5.00</span>€</h3>
      </div>

      <div class="right">
        <h1 class="total">Total: <span>177.16</span>€</h1>
        <a class="btn">Checkout</a>
      </div>

    </div>
  </footer>`,
        css: `body {
  background: #eee;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.clearfix {
  content: "";
  display: table;
  clear: both;  
}

#site-header, #site-footer {
  background: #fff;
}

#site-header {
  margin: 0 0 30px 0;
}

#site-header h1 {
  font-size: 31px;
  font-weight: 300;
  padding: 40px 0;
  position: relative;
  margin: 0;
}

a {
  color: #000;
  text-decoration: none;

  -webkit-transition: color .2s linear;
  -moz-transition: color .2s linear;
  -ms-transition: color .2s linear;
  -o-transition: color .2s linear;
  transition: color .2s linear;
}

a:hover {
  color: #53b5aa;
}

#site-header h1 span {
  color: #53b5aa;
}

#site-header h1 span.last-span {
  background: #fff;
  padding-right: 150px;
  position: absolute;
  left: 217px;

  -webkit-transition: all .2s linear;
  -moz-transition: all .2s linear;
  -ms-transition: all .2s linear;
  -o-transition: all .2s linear;
  transition: all .2s linear;
}

#site-header h1:hover span.last-span, #site-header h1 span.is-open {
  left: 363px;
}

#site-header h1 em {
  font-size: 16px;
  font-style: normal;
  vertical-align: middle;
}

.container {
  font-family: 'Open Sans', sans-serif;
  margin: 0 auto;
  width: 980px;
}

#cart {
  width: 100%;
}

#cart h1 {
  font-weight: 300;
}

#cart a {
  color: #53b5aa;
  text-decoration: none;

  -webkit-transition: color .2s linear;
  -moz-transition: color .2s linear;
  -ms-transition: color .2s linear;
  -o-transition: color .2s linear;
  transition: color .2s linear;
}

#cart a:hover {
  color: #000;
}

.product.removed {
  margin-left: 980px !important;
  opacity: 0;
}

.product {
  border: 1px solid #eee;
  margin: 20px 0;
  width: 100%;
  height: 195px;
  position: relative;

  -webkit-transition: margin .2s linear, opacity .2s linear;
  -moz-transition: margin .2s linear, opacity .2s linear;
  -ms-transition: margin .2s linear, opacity .2s linear;
  -o-transition: margin .2s linear, opacity .2s linear;
  transition: margin .2s linear, opacity .2s linear;
}

.product img {
  width: 100%;
  height: 100%;
}

.product header, .product .content {
  background-color: #fff;
  border: 1px solid #ccc;
  border-style: none none solid none;
  float: left;
}

.product header {
  background: #000;
  margin: 0 1% 20px 0;
  overflow: hidden;
  padding: 0;
  position: relative;
  width: 24%;
  height: 195px;
}

.product header:hover img {
  opacity: .7;
}

.product header:hover h3 {
  bottom: 73px;
}

.product header h3 {
  background: #53b5aa;
  color: #fff;
  font-size: 22px;
  font-weight: 300;
  line-height: 49px;
  margin: 0;
  padding: 0 30px;
  position: absolute;
  bottom: -50px;
  right: 0;
  left: 0;

  -webkit-transition: bottom .2s linear;
  -moz-transition: bottom .2s linear;
  -ms-transition: bottom .2s linear;
  -o-transition: bottom .2s linear;
  transition: bottom .2s linear;
}

.remove {
  cursor: pointer;
}

.product .content {
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  height: 140px;
  padding: 0 20px;
  width: 75%;
}

.product h1 {
  color: #53b5aa;
  font-size: 25px;
  font-weight: 300;
  margin: 17px 0 20px 0;
}

.product footer.content {
  height: 50px;
  margin: 6px 0 0 0;
  padding: 0;
}

.product footer .price {
  background: #fcfcfc;
  color: #000;
  float: right;
  font-size: 15px;
  font-weight: 300;
  line-height: 49px;
  margin: 0;
  padding: 0 30px;
}

.product footer .full-price {
  background: #53b5aa;
  color: #fff;
  float: right;
  font-size: 22px;
  font-weight: 300;
  line-height: 49px;
  margin: 0;
  padding: 0 30px;

  -webkit-transition: margin .15s linear;
  -moz-transition: margin .15s linear;
  -ms-transition: margin .15s linear;
  -o-transition: margin .15s linear;
  transition: margin .15s linear;
}

.qt, .qt-plus, .qt-minus {
  display: block;
  float: left;
}

.qt {
  font-size: 19px;
  line-height: 50px;
  width: 70px;
  text-align: center;
}

.qt-plus, .qt-minus {
  background: #fcfcfc;
  border: none;
  font-size: 30px;
  font-weight: 300;
  height: 100%;
  padding: 0 20px;
  -webkit-transition: background .2s linear;
  -moz-transition: background .2s linear;
  -ms-transition: background .2s linear;
  -o-transition: background .2s linear;
  transition: background .2s linear;
}

.qt-plus:hover, .qt-minus:hover {
  background: #53b5aa;
  color: #fff;
  cursor: pointer;
}

.qt-plus {
  line-height: 50px;
}

.qt-minus {
  line-height: 47px;
}

#site-footer {
  margin: 30px 0 0 0;
}

#site-footer {
  padding: 40px;
}

#site-footer h1 {
  background: #fcfcfc;
  border: 1px solid #ccc;
  border-style: none none solid none;
  font-size: 24px;
  font-weight: 300;
  margin: 0 0 7px 0;
  padding: 14px 40px;
  text-align: center;
}

#site-footer h2 {
  font-size: 24px;
  font-weight: 300;
  margin: 10px 0 0 0;
}

#site-footer h3 {
  font-size: 19px;
  font-weight: 300;
  margin: 15px 0;
}

.left {
  float: left;
}

.right {
  float: right;
}

.btn {
  background: #53b5aa;
  border: 1px solid #999;
  border-style: none none solid none;
  cursor: pointer;
  display: block;
  color: #fff;
  font-size: 20px;
  font-weight: 300;
  padding: 16px 0;
  width: 290px;
  text-align: center;

  -webkit-transition: all .2s linear;
  -moz-transition: all .2s linear;
  -ms-transition: all .2s linear;
  -o-transition: all .2s linear;
  transition: all .2s linear;
}

.btn:hover {
  color: #fff;
  background: #429188;
}

.type {
  background: #fcfcfc;
  font-size: 13px;
  padding: 10px 16px;
  left: 100%;
}

.type, .color {
  border: 1px solid #ccc;
  border-style: none none solid none;
  position: absolute;
}

.color {
  width: 40px;
  height: 40px;
  right: -40px;
}

.red {
  background: #cb5a5e;
}

.yellow {
  background: #f1c40f;
}

.blue {
  background: #3598dc;
}

.minused {
  margin: 0 50px 0 0 !important;
}

.added {
  margin: 0 -50px 0 0 !important;
}`,
        js: `console.log('Магазин загружен');`
    },
    {
        name: "Корпоративный сайт",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Корпоративный сайт</title>
</head>
<body>
  <header><h1>Корпоративный сайт</h1></header>
  <main>
    <section>
      <h2>О компании</h2>
      <p>Информация о компании</p>
    </section>
  </main>
  <footer><p>Контакты компании</p></footer>
</body>
</html>`,
        css: `body { margin: 0; padding: 0; font-family: Arial; }
header { background: #eee; padding: 10px; }
main { padding: 20px; }
footer { background: #333; color: #fff; padding: 10px; text-align: center; }`,
        js: `console.log('Корпоративный сайт загружен');`
    },
    {
        name: "Landing Page",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Landing Page</title>
</head>
<body>
  <section class="hero">
    <h1>Уникальное торговое предложение</h1>
    <p>Небольшое пояснение, почему ваш продукт лучший</p>
    <button>Купить</button>
  </section>
</body>
</html>`,
        css: `.hero {
  background: #f5f5f5;
  text-align: center;
  padding: 50px;
}
button {
  padding: 10px 20px;
  background: #007acc;
  color: #fff;
  border: none;
  cursor: pointer;
}`,
        js: `console.log('Landing Page загружен');`
    },
    {
        name: "Портфолио",
        html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Портфолио</title>
</head>
<body>
  <header><h1>Мое Портфолио</h1></header>
  <section class="works">
    <div class="work-item">Проект 1</div>
    <div class="work-item">Проект 2</div>
    <div class="work-item">Проект 3</div>
  </section>
</body>
</html>`,
        css: `body { margin:0; padding:0; font-family: sans-serif; }
header { background:#333; color:#fff; padding:20px; text-align:center; }
.works { display:flex; justify-content:space-around; margin:20px; }
.work-item { background:#eee; padding:20px; width:100px; text-align:center; }`,
        js: `console.log('Портфолио загружено');`
    },
    {
        name: "Новостной сайт",
        html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Новостной сайт</title>
</head>
<body>
  <header><h1>Главные новости</h1></header>
  <article>
    <h2>Первая новость</h2>
    <p>Содержимое первой новости...</p>
  </article>
  <article>
    <h2>Вторая новость</h2>
    <p>Содержимое второй новости...</p>
  </article>
</body>
</html>`,
        css: `body { margin:0; padding:0; font-family: sans-serif; }
header { background:#444; color:#fff; padding:15px; text-align:center; }
article { border-bottom:1px solid #ccc; padding:10px 20px; }`,
        js: `console.log('Новостной сайт загружен');`
    },
    {
        name: "Ресторан",
        html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Ресторан</title>
</head>
<body>
  <header><h1>Наш Ресторан</h1></header>
  <section class="menu">
    <h2>Меню</h2>
    <ul>
      <li>Блюдо 1</li>
      <li>Блюдо 2</li>
      <li>Блюдо 3</li>
    </ul>
  </section>
</body>
</html>`,
        css: `body { margin:0; padding:0; font-family: Georgia, serif; }
header { background:#cc0000; color:#fff; padding:15px; text-align:center; }
.menu { padding:20px; }
ul { list-style-type: circle; }`,
        js: `console.log('Ресторанный шаблон загружен');`
    },
    {
        name: "Фотогалерея",
        html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Фотогалерея</title>
</head>
<body>
  <header><h1>Моя Галерея</h1></header>
  <div class="gallery">
    <div class="photo">Фото 1</div>
    <div class="photo">Фото 2</div>
    <div class="photo">Фото 3</div>
  </div>
</body>
</html>`,
        css: `body { margin:0; padding:0; font-family: sans-serif; }
header { background:#444; color:#fff; padding:20px; text-align:center; }
.gallery { display:flex; justify-content:space-around; margin:20px; }
.photo { width:100px; height:100px; background:#ccc; display:flex; align-items:center; justify-content:center; }`,
        js: `console.log('Фотогалерея загружена');`
    },
    {
        name: "Фитнес",
        html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Фитнес</title>
</head>
<body>
  <header><h1>Фитнес Центр</h1></header>
  <section>
    <h2>Наши программы</h2>
    <ul>
      <li>Силовые тренировки</li>
      <li>Кардио</li>
      <li>Йога</li>
    </ul>
  </section>
</body>
</html>`,
        css: `body { margin:0; padding:0; font-family: Arial, sans-serif; }
header { background:#2f4f4f; color:#fff; padding:20px; text-align:center; }
section { padding:20px; }`,
        js: `console.log('Фитнес шаблон загружен');`
    },
    {
        name: "Обучающий сайт",
        html: `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Обучающий сайт</title>
</head>
<body>
  <header><h1>Онлайн Академия</h1></header>
  <section class="lessons">
    <h2>Уроки</h2>
    <p>Здесь будут представлены уроки и материалы</p>
  </section>
</body>
</html>`,
        css: `body { margin:0; padding:0; font-family: sans-serif; }
header { background:#003366; color:#fff; padding:15px; text-align:center; }
.lessons { margin:20px; }`,
        js: `console.log('Обучающий сайт загружен');`
    }
];

    // Открытие модального окна
    function openTemplatesModal() {
    document.getElementById("templatesModal").classList.remove("hidden");
    // Можно добавить body.style.overflow = "hidden"; чтобы заблокировать прокрутку фона
}

    // Закрытие модального окна
    function closeTemplatesModal() {
    document.getElementById("templatesModal").classList.add("hidden");
    // Можно вернуть body.style.overflow = "auto"; чтобы разблокировать прокрутку
}

    // Применить выбранный шаблон (вставить в редакторы)
    function applyTemplate(index) {
    const tpl = siteTemplates[index];
    // Вставляем в редакторы (предполагается, что htmlEditor, cssEditor, jsEditor глобальны)
    htmlEditor.setValue(tpl.html, -1);
    cssEditor.setValue(tpl.css, -1);
    jsEditor.setValue(tpl.js, -1);

    // Закрыть модальное окно
    closeTemplatesModal();
}

// Навешиваем обработчик на кнопку "Шаблоны сайтов"
document.getElementById("openTemplatesBtn").addEventListener("click", openTemplatesModal);




// Глобальный объект для хранения новых HTML-редакторов для дополнительных страниц
var newPageEditors = {};

// Функция для скрытия главного HTML-редактора и всех динамически добавленных
function hideAllHTMLEditors() {
    // Скрываем главный редактор
    document.getElementById("htmlEditor").classList.add("hidden");
    // Скрываем редакторы новых страниц
    for (var name in newPageEditors) {
        var div = document.getElementById("htmlEditor_" + name);
        if (div) {
            div.classList.add("hidden");
        }
    }
}

// Функция для создания нового редактора и вкладки для новой страницы
function createPageEditor(pageName, content) {
    // Создаем новый контейнер для редактора внутри контейнера с id="editorContainer"
    var container = document.getElementById("editorContainer");
    var newDiv = document.createElement("div");
    newDiv.id = "htmlEditor_" + pageName;
    newDiv.className = "absolute inset-0 overflow-auto hidden"; // по умолчанию скрыт
    container.appendChild(newDiv);

    // Инициализируем Ace Editor для нового контейнера
    var editor = ace.edit(newDiv);
    editor.setTheme("ace/theme/monokai");
    editor.session.setMode("ace/mode/html");
    editor.setValue(content || "", -1);
    newPageEditors[pageName] = editor;

    // Добавляем новую вкладку для переключения на этот редактор
    // Предполагается, что контейнер вкладок имеет id "pageTabs"
    var tabContainer = document.getElementById("pageTabs");
    var newTab = document.createElement("button");
    newTab.textContent = pageName;
    newTab.className = "text-gray-400 hover:text-gray-200 px-3 py-1";
    newTab.addEventListener("click", function() {
        hideAllHTMLEditors();
        newDiv.classList.remove("hidden");
    });
    tabContainer.appendChild(newTab);
}

// Функция для обработки кнопки "Добавить страницу"
function addNewPage() {
    var pageName = prompt("Введите название новой страницы:");
    if (!pageName) return;
    if (newPageEditors[pageName]) {
        alert("Страница с таким названием уже существует!");
        return;
    }
    createPageEditor(pageName, "");
    hideAllHTMLEditors();
    // Отображаем только созданный редактор новой страницы
    document.getElementById("htmlEditor_" + pageName).classList.remove("hidden");
}

// Привязываем обработчик к кнопке "Добавить страницу"
document.getElementById("addPageBtn").addEventListener("click", addNewPage);

// Для переключения на главный HTML-редактор добавьте обработчик для кнопки "tab-html"
document.getElementById("tab-html").addEventListener("click", function() {
    // Показываем главный редактор
    document.getElementById("htmlEditor").classList.remove("hidden");
    // Скрываем все динамические редакторы
    for (var name in newPageEditors) {
        var div = document.getElementById("htmlEditor_" + name);
        if (div) {
            div.classList.add("hidden");
        }
    }
});


//кнопка полезных материалов
document.getElementById("litBtn").addEventListener("click", () => {
    window.open("https://developer.mozilla.org/en-US/docs/Web", "_blank");
});



//кнопка помощь ии
document.getElementById("aiHelpBtn").addEventListener("click", () => {
    window.open("https://www.blackbox.ai/", "_blank");
});


