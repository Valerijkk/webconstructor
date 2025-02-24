/**
 * main.js
 * "Полный Tilda-Like" функционал, без заглушек.
 */

// Импорт методов из Go (main.go -> struct App).
import {
    ListHtmlFiles,
    ReadFileContent,
    ImportHtmlFileAsNewPage,
    CreatePage,
    DeletePage,
    ListPages,
    AddSection,
    DeleteSection,
    UpdateSection,
    ListSections,
    UploadImage,
    SaveSite,
    SetMeta,
    SetCSS,
    SetScripts,
    SetLogo,
    SetNav,
    SetMain,
    SetArticle,
    SetAside,
    SetFooter,
    SetContact,
    SetSocial,
    SetCopyright
} from "../wailsjs/go/main/App";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Constructor main.js loaded!");

    // Пример навешивания обработчиков, если есть кнопки/поля:
    document.getElementById("listFolderBtn")?.addEventListener("click", listFolderHandler);
    document.getElementById("importPageBtn")?.addEventListener("click", importPageHandler);
    document.getElementById("createPageBtn")?.addEventListener("click", createPageHandler);
    document.getElementById("saveMetaBtn")?.addEventListener("click", () => saveField(SetMeta, document.getElementById("metaField").value, "Meta"));
    document.getElementById("saveCSSBtn")?.addEventListener("click", () => saveField(SetCSS, document.getElementById("cssField").value, "CSS"));
    document.getElementById("saveScriptsBtn")?.addEventListener("click", () => saveField(SetScripts, document.getElementById("scriptsField").value, "Scripts"));
    document.getElementById("uploadLogoBtn")?.addEventListener("click", uploadLogoHandler);
    document.getElementById("saveNavBtn")?.addEventListener("click", () => saveField(SetNav, document.getElementById("navField").value, "Nav"));
    document.getElementById("saveMainBtn")?.addEventListener("click", () => saveField(SetMain, document.getElementById("mainField").value, "Main"));
    document.getElementById("saveArticleBtn")?.addEventListener("click", () => saveField(SetArticle, document.getElementById("articleField").value, "Article"));
    document.getElementById("saveAsideBtn")?.addEventListener("click", () => saveField(SetAside, document.getElementById("asideField").value, "Aside"));
    document.getElementById("saveFooterBtn")?.addEventListener("click", () => saveField(SetFooter, document.getElementById("footerField").value, "Footer"));
    document.getElementById("saveContactBtn")?.addEventListener("click", () => saveField(SetContact, document.getElementById("contactField").value, "Contact"));
    document.getElementById("saveSocialBtn")?.addEventListener("click", () => saveField(SetSocial, document.getElementById("socialField").value, "Social"));
    document.getElementById("saveCopyrightBtn")?.addEventListener("click", () => saveField(SetCopyright, document.getElementById("copyrightField").value, "Copyright"));
    document.getElementById("addSectionBtn")?.addEventListener("click", addSectionHandler);
    document.getElementById("uploadImageSectionBtn")?.addEventListener("click", uploadImageSectionHandler);
    document.getElementById("saveSiteBtn")?.addEventListener("click", saveSiteHandler);

    loadPages();
});

// ====== Функции ======

// Загрузить список файлов из указанной папки
async function listFolderHandler() {
    const dirPath = document.getElementById("folderPath").value.trim();
    if (!dirPath) return alert("Укажите папку!");

    document.getElementById("fileList").innerHTML = "Загрузка...";
    try {
        const files = await ListHtmlFiles(dirPath);
        document.getElementById("fileList").innerHTML = "";
        if (!files.length) return document.getElementById("fileList").innerHTML = "<p>Нет .html файлов</p>";
        files.forEach((fn) => {
            const div = document.createElement("div");
            div.textContent = fn;
            div.addEventListener("click", () => selectFile(dirPath, fn));
            document.getElementById("fileList").appendChild(div);
        });
    } catch (err) {
        document.getElementById("fileList").innerHTML = "Ошибка: " + err;
    }
}

// Выбор файла для отображения
async function selectFile(dirPath, fileName) {
    try {
        const content = await ReadFileContent(dirPath, fileName);
        document.getElementById("fileContent").value = content;
        document.getElementById("fileContent").dataset.filename = fileName;
    } catch (err) {
        document.getElementById("fileContent").value = "Ошибка чтения: " + err;
    }
}

// Импортировать страницу
async function importPageHandler() {
    const dirPath = document.getElementById("folderPath").value.trim();
    const fileName = document.getElementById("fileContent").dataset.filename;
    const pageTitle = document.getElementById("importPageTitle").value.trim();
    if (!fileName) return alert("Не выбран HTML-файл!");
    if (!pageTitle) return alert("Введите название для новой страницы!");

    try {
        const newPageID = await ImportHtmlFileAsNewPage(dirPath, fileName, pageTitle);
        alert("Импорт завершён! Создана страница " + newPageID);
        document.getElementById("importPageTitle").value = "";
        loadPages();
    } catch (err) {
        alert("Ошибка импорта: " + err);
    }
}

// Создать новую страницу
async function createPageHandler() {
    const title = document.getElementById("newPageTitle").value.trim();
    if (!title) return alert("Введите название!");

    try {
        await CreatePage(title);
        document.getElementById("newPageTitle").value = "";
        loadPages();
    } catch (err) {
        alert("Ошибка создания страницы: " + err);
    }
}

// Загрузить список страниц
async function loadPages() {
    const pagesContainer = document.getElementById("pagesContainer");
    if (!pagesContainer) return;

    pagesContainer.innerHTML = "Загрузка...";
    try {
        const pages = await ListPages();
        if (!pages.length) {
            pagesContainer.innerHTML = "<p>Пока нет страниц</p>";
            clearPageEditor();
            return;
        }
        pagesContainer.innerHTML = "";
        pages.forEach((pg) => {
            const div = document.createElement("div");
            div.className = "pageItem";
            div.textContent = `${pg.title} (${pg.id})`;
            div.addEventListener("click", () => {
                currentPageID = pg.id;
                document.getElementById("currentPageInfo").textContent = `Выбрана страница: ${pg.title} (${pg.id})`;
                loadSections(pg.id);
            });
            const delBtn = document.createElement("button");
            delBtn.textContent = "X";
            delBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                if (confirm("Удалить страницу?")) {
                    try {
                        await DeletePage(pg.id);
                        loadPages();
                        if (pg.id === currentPageID) {
                            currentPageID = null;
                            clearPageEditor();
                        }
                    } catch (err) {
                        alert("Ошибка удаления: " + err);
                    }
                }
            });
            div.appendChild(delBtn);
            pagesContainer.appendChild(div);
        });
    } catch (err) {
        pagesContainer.innerHTML = "Ошибка: " + err;
    }
}

// Очистка редактора страницы
function clearPageEditor() {
    document.getElementById("currentPageInfo").textContent = "—";
    document.getElementById("sectionsContainer").innerHTML = "";
}

// Загрузить список секций страницы
async function loadSections(pageID) {
    const sectionsContainer = document.getElementById("sectionsContainer");
    if (!sectionsContainer) return;
    try {
        const secs = await ListSections(pageID);
        renderSections(secs);
    } catch (err) {
        sectionsContainer.innerHTML = "Ошибка при загрузке секций: " + err;
    }
}

// Отобразить секции
function renderSections(sections) {
    const sectionsContainer = document.getElementById("sectionsContainer");
    sectionsContainer.innerHTML = "";
    sections.forEach((sec) => {
        const div = document.createElement("div");
        div.className = "sectionItem";
        div.innerHTML = `
            <strong>Type:</strong> ${sec.type}<br/>
            <strong>Content:</strong> ${sec.content}
        `;
        const btnWrap = document.createElement("div");
        btnWrap.className = "sectionButtons";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => editSection(sec.id, sec.type, sec.content));

        const delBtn = document.createElement("button");
        delBtn.textContent = "Del";
        delBtn.addEventListener("click", () => deleteSection(sec.id));

        btnWrap.appendChild(editBtn);
        btnWrap.appendChild(delBtn);
        div.appendChild(btnWrap);
        sectionsContainer.appendChild(div);
    });
}

// Редактировать секцию
async function editSection(secID, oldType, oldContent) {
    const newType = prompt("Новый type секции:", oldType);
    if (newType === null) return;
    const newContent = prompt("Новый контент секции:", oldContent);
    if (newContent === null) return;
    try {
        await UpdateSection(currentPageID, secID, newType, newContent);
        loadSections(currentPageID);
    } catch (err) {
        alert("Ошибка обновления: " + err);
    }
}

// Удалить секцию
async function deleteSection(secID) {
    if (!confirm("Удалить секцию?")) return;
    try {
        await DeleteSection(currentPageID, secID);
        loadSections(currentPageID);
    } catch (err) {
        alert("Ошибка удаления: " + err);
    }
}

// Сохранить поле (например, Meta, CSS, Scripts)
function saveField(goMethod, value, fieldName) {
    if (!currentPageID) {
        alert("Сначала выберите страницу!");
        return;
    }
    goMethod(currentPageID, value)
        .then(() => {
            alert(`${fieldName} сохранено.`);
        })
        .catch((err) => {
            alert(`Ошибка сохранения ${fieldName}: ` + err);
        });
}

// Загрузить логотип
async function uploadLogoHandler() {
    if (!currentPageID) {
        alert("Нет выбранной страницы!");
        return;
    }
    const file = document.getElementById("logoFile").files[0];
    if (!file) {
        alert("Выберите файл логотипа!");
        return;
    }
    try {
        const base64 = await readFileAsBase64(file);
        await SetLogo(currentPageID, base64);
        alert("Логотип установлен!");
    } catch (err) {
        alert("Ошибка загрузки логотипа: " + err);
    }
}

// Добавить секцию
async function addSectionHandler() {
    if (!currentPageID) {
        alert("Сначала выберите страницу!");
        return;
    }
    const stype = document.getElementById("sectionType").value.trim();
    const scontent = document.getElementById("sectionContent").value;
    if (!stype) {
        alert("Укажите тип секции!");
        return;
    }
    try {
        await AddSection(currentPageID, stype, scontent);
        document.getElementById("sectionType").value = "";
        document.getElementById("sectionContent").value = "";
        loadSections(currentPageID);
    } catch (err) {
        alert("Ошибка добавления секции: " + err);
    }
}

// Загрузить картинку как секцию
async function uploadImageSectionHandler() {
    if (!currentPageID) {
        alert("Нет выбранной страницы!");
        return;
    }
    const file = document.getElementById("sectionImageFile").files[0];
    if (!file) {
        alert("Выберите изображение!");
        return;
    }
    try {
        const base64 = await readFileAsBase64(file);
        const imageID = await UploadImage(file.name, base64);
        await AddSection(currentPageID, "image", imageID);
        alert("Секция-изображение добавлена!");
        document.getElementById("sectionImageFile").value = "";
        loadSections(currentPageID);
    } catch (err) {
        alert("Ошибка секции-изображения: " + err);
    }
}

// Сохранить сайт в папку
async function saveSiteHandler() {
    const dirPath = document.getElementById("saveDirPath").value.trim();
    if (!dirPath) {
        alert("Укажите папку для сохранения!");
        return;
    }
    try {
        await SaveSite(dirPath);
        alert("Сайт сохранён в папку " + dirPath);
    } catch (err) {
        alert("Ошибка сохранения сайта: " + err);
    }
}

// Прочитать файл в base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}
