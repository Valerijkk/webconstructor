/**
 * main.js
 * "Полный Tilda-Like" функционал, без заглушек.
 */

// Импорт методов из Go (main.go -> struct App).
// Обратите внимание: "wailsjs/go/main/App" будет реально существовать
// после запуска `wails dev` (Wails сам сгенерирует).
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

// Пример DOM-элементов (если ваш HTML для конструктора отличается,
// подгоняйте id/классы под свой интерфейс):
const folderPathEl = document.getElementById("folderPath");
const listFolderBtn = document.getElementById("listFolderBtn");
const fileListEl = document.getElementById("fileList");
const fileContentEl = document.getElementById("fileContent");
const importPageTitleEl = document.getElementById("importPageTitle");
const importPageBtn = document.getElementById("importPageBtn");

const newPageTitleEl = document.getElementById("newPageTitle");
const createPageBtn = document.getElementById("createPageBtn");
const pagesContainer = document.getElementById("pagesContainer");

let currentPageID = null;
const currentPageInfoEl = document.getElementById("currentPageInfo");

const metaField = document.getElementById("metaField");
const saveMetaBtn = document.getElementById("saveMetaBtn");
const cssField = document.getElementById("cssField");
const saveCSSBtn = document.getElementById("saveCSSBtn");
const scriptsField = document.getElementById("scriptsField");
const saveScriptsBtn = document.getElementById("saveScriptsBtn");
const logoFileEl = document.getElementById("logoFile");
const uploadLogoBtn = document.getElementById("uploadLogoBtn");
const navField = document.getElementById("navField");
const saveNavBtn = document.getElementById("saveNavBtn");
const mainField = document.getElementById("mainField");
const saveMainBtn = document.getElementById("saveMainBtn");
const articleField = document.getElementById("articleField");
const saveArticleBtn = document.getElementById("saveArticleBtn");
const asideField = document.getElementById("asideField");
const saveAsideBtn = document.getElementById("saveAsideBtn");
const footerField = document.getElementById("footerField");
const saveFooterBtn = document.getElementById("saveFooterBtn");
const contactField = document.getElementById("contactField");
const saveContactBtn = document.getElementById("saveContactBtn");
const socialField = document.getElementById("socialField");
const saveSocialBtn = document.getElementById("saveSocialBtn");
const copyrightField = document.getElementById("copyrightField");
const saveCopyrightBtn = document.getElementById("saveCopyrightBtn");

const sectionsContainer = document.getElementById("sectionsContainer");
const sectionTypeEl = document.getElementById("sectionType");
const sectionContentEl = document.getElementById("sectionContent");
const addSectionBtn = document.getElementById("addSectionBtn");
const sectionImageFileEl = document.getElementById("sectionImageFile");
const uploadImageSectionBtn = document.getElementById("uploadImageSectionBtn");

const saveDirPathEl = document.getElementById("saveDirPath");
const saveSiteBtn = document.getElementById("saveSiteBtn");

document.addEventListener("DOMContentLoaded", () => {
    console.log("Constructor main.js loaded!");

    // Пример навешивания обработчиков, если есть кнопки/поля:
    if (listFolderBtn) {
        listFolderBtn.addEventListener("click", listFolderHandler);
    }
    if (importPageBtn) {
        importPageBtn.addEventListener("click", importPageHandler);
    }
    if (createPageBtn) {
        createPageBtn.addEventListener("click", createPageHandler);
    }
    if (saveMetaBtn) {
        saveMetaBtn.addEventListener("click", () => saveField(SetMeta, metaField.value, "Meta"));
    }
    if (saveCSSBtn) {
        saveCSSBtn.addEventListener("click", () => saveField(SetCSS, cssField.value, "CSS"));
    }
    if (saveScriptsBtn) {
        saveScriptsBtn.addEventListener("click", () => saveField(SetScripts, scriptsField.value, "Scripts"));
    }
    if (uploadLogoBtn) {
        uploadLogoBtn.addEventListener("click", uploadLogoHandler);
    }
    if (saveNavBtn) {
        saveNavBtn.addEventListener("click", () => saveField(SetNav, navField.value, "Nav"));
    }
    if (saveMainBtn) {
        saveMainBtn.addEventListener("click", () => saveField(SetMain, mainField.value, "Main"));
    }
    if (saveArticleBtn) {
        saveArticleBtn.addEventListener("click", () => saveField(SetArticle, articleField.value, "Article"));
    }
    if (saveAsideBtn) {
        saveAsideBtn.addEventListener("click", () => saveField(SetAside, asideField.value, "Aside"));
    }
    if (saveFooterBtn) {
        saveFooterBtn.addEventListener("click", () => saveField(SetFooter, footerField.value, "Footer"));
    }
    if (saveContactBtn) {
        saveContactBtn.addEventListener("click", () => saveField(SetContact, contactField.value, "Contact"));
    }
    if (saveSocialBtn) {
        saveSocialBtn.addEventListener("click", () => saveField(SetSocial, socialField.value, "Social"));
    }
    if (saveCopyrightBtn) {
        saveCopyrightBtn.addEventListener("click", () => saveField(SetCopyright, copyrightField.value, "Copyright"));
    }
    if (addSectionBtn) {
        addSectionBtn.addEventListener("click", addSectionHandler);
    }
    if (uploadImageSectionBtn) {
        uploadImageSectionBtn.addEventListener("click", uploadImageSectionHandler);
    }
    if (saveSiteBtn) {
        saveSiteBtn.addEventListener("click", saveSiteHandler);
    }

    // При загрузке сразу покажем список страниц (если хотим)
    loadPages();
});

// ====== Функции ======

async function listFolderHandler() {
    if (!folderPathEl) return;
    const dirPath = folderPathEl.value.trim();
    if (!dirPath) {
        alert("Укажите папку!");
        return;
    }
    fileListEl.innerHTML = "Загрузка...";
    try {
        const files = await ListHtmlFiles(dirPath);
        fileListEl.innerHTML = "";
        if (!files.length) {
            fileListEl.innerHTML = "<p>Нет .html файлов</p>";
            return;
        }
        files.forEach((fn) => {
            const div = document.createElement("div");
            div.textContent = fn;
            div.addEventListener("click", () => selectFile(dirPath, fn));
            fileListEl.appendChild(div);
        });
    } catch (err) {
        fileListEl.innerHTML = "Ошибка: " + err;
    }
}

async function selectFile(dirPath, fileName) {
    try {
        const content = await ReadFileContent(dirPath, fileName);
        fileContentEl.value = content;
        fileContentEl.dataset.filename = fileName;
    } catch (err) {
        fileContentEl.value = "Ошибка чтения: " + err;
    }
}

function getSelectedFileName() {
    return fileContentEl.dataset.filename || "";
}

async function importPageHandler() {
    const dirPath = folderPathEl.value.trim();
    const fileName = getSelectedFileName();
    const pageTitle = importPageTitleEl.value.trim();
    if (!fileName) {
        alert("Не выбран HTML-файл!");
        return;
    }
    if (!pageTitle) {
        alert("Введите название для новой страницы!");
        return;
    }
    try {
        const newPageID = await ImportHtmlFileAsNewPage(dirPath, fileName, pageTitle);
        alert("Импорт завершён! Создана страница " + newPageID);
        importPageTitleEl.value = "";
        loadPages();
    } catch (err) {
        alert("Ошибка импорта: " + err);
    }
}

// Создать новую страницу
async function createPageHandler() {
    const title = newPageTitleEl.value.trim();
    if (!title) {
        alert("Введите название!");
        return;
    }
    try {
        await CreatePage(title);
        newPageTitleEl.value = "";
        loadPages();
    } catch (err) {
        alert("Ошибка создания страницы: " + err);
    }
}

// Загрузить список страниц
async function loadPages() {
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
                if (currentPageInfoEl)
                    currentPageInfoEl.textContent = `Выбрана страница: ${pg.title} (${pg.id})`;
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

function clearPageEditor() {
    if (currentPageInfoEl) {
        currentPageInfoEl.textContent = "—";
    }
    if (sectionsContainer) {
        sectionsContainer.innerHTML = "";
    }
}

// Загрузить список секций страницы
async function loadSections(pageID) {
    if (!sectionsContainer) return;
    try {
        const secs = await ListSections(pageID);
        renderSections(secs);
    } catch (err) {
        sectionsContainer.innerHTML = "Ошибка при загрузке секций: " + err;
    }
}

function renderSections(sections) {
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
        editBtn.style.marginRight = "5px";
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

// Общая функция сохранения поля (Meta, CSS, Scripts и т.д.)
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

// Загрузить логотип (SetLogo)
async function uploadLogoHandler() {
    if (!currentPageID) {
        alert("Нет выбранной страницы!");
        return;
    }
    const file = logoFileEl.files[0];
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
    const stype = sectionTypeEl.value.trim();
    const scontent = sectionContentEl.value;
    if (!stype) {
        alert("Укажите тип секции!");
        return;
    }
    try {
        await AddSection(currentPageID, stype, scontent);
        sectionTypeEl.value = "";
        sectionContentEl.value = "";
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
    const file = sectionImageFileEl.files[0];
    if (!file) {
        alert("Выберите изображение!");
        return;
    }
    try {
        const base64 = await readFileAsBase64(file);
        const imageID = await UploadImage(file.name, base64);
        await AddSection(currentPageID, "image", imageID);
        alert("Секция-изображение добавлена!");
        sectionImageFileEl.value = "";
        loadSections(currentPageID);
    } catch (err) {
        alert("Ошибка секции-изображения: " + err);
    }
}

// Сохранить весь сайт в папку
async function saveSiteHandler() {
    const dirPath = saveDirPathEl.value.trim();
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
