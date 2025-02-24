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

    // Слушаем события на кнопках
    document.getElementById("newProjectBtn").addEventListener("click", () => createNewProject(htmlEditor, cssEditor, jsEditor));
    document.getElementById("saveProjectBtn").addEventListener("click", () => saveProject(htmlEditor, cssEditor, jsEditor));
});

// Функция для создания нового проекта
function createNewProject(htmlEditor, cssEditor, jsEditor) {
    const baseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Новый проект</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
    </style>
</head>
<body>
    <header>
        <h1>Мой новый проект</h1>
    </header>
    <main>
        <p>Контент будет вставляться здесь.</p>
    </main>
    <footer>
        <p>&copy; 2025 Мой сайт</p>
    </footer>
</body>
</html>`;
    htmlEditor.setValue(baseHTML, -1);
    cssEditor.setValue("/* CSS content */", -1);
    jsEditor.setValue("// JS content", -1);
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
        const projectDir = await handle.getDirectoryHandle("web_project", { create: true });

        // Сохранение HTML
        const htmlFile = await projectDir.getFileHandle("index.html", { create: true });
        const htmlWritable = await htmlFile.createWritable();
        await htmlWritable.write(projectData.html);
        await htmlWritable.close();

        // Сохранение CSS
        const cssFile = await projectDir.getFileHandle("styles.css", { create: true });
        const cssWritable = await cssFile.createWritable();
        await cssWritable.write(projectData.css);
        await cssWritable.close();

        // Сохранение JS
        const jsFile = await projectDir.getFileHandle("script.js", { create: true });
        const jsWritable = await jsFile.createWritable();
        await jsWritable.write(projectData.js);
        await jsWritable.close();

        alert("Проект сохранен в выбранной папке!");
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
        case 'img':
            content = `<img src="image.jpg" alt="Изображение" />`;
            break;
        case 'table':
            content = `<table><tr><th>Заголовок</th><td>Данные</td></tr></table>`;
            break;
        case 'form':
            content = `<form><label for="name">Имя:</label><input type="text" id="name" name="name"></form>`;
            break;
        case 'nav':
            content = `<nav><ul><li>Главная</li><li>О нас</li><li>Контакты</li></ul></nav>`;
            break;
        case 'article':
            content = `<article><h2>Заголовок статьи</h2><p>Текст статьи...</p></article>`;
            break;
        case 'section':
            content = `<section><h3>Секция</h3><p>Контент секции</p></section>`;
            break;
        default:
            break;
    }
    // Вставляем шаблон в редактор
    htmlEditor.setValue(content, -1);
}
