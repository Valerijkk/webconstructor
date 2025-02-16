/*
  Импортируем функции Go, которые Wails автоматически сгенерирует
  на основе наших методов в структуре App (main.go).
*/
import {
    CreatePage,
    DeletePage,
    ListPages,
    AddSection,
    DeleteSection,
    UpdateSection,
    ListSections,
    PublishSite
} from "../wailsjs/go/main/App";

let currentSelectedPage = null; // ID текущей выбранной страницы

const pageListEl = document.getElementById("pageList");
const sectionsListEl = document.getElementById("sectionsList");
const currentPageEl = document.getElementById("currentPage");
const newPageTitleEl = document.getElementById("newPageTitle");
const createPageBtn = document.getElementById("createPageBtn");

const sectionTypeEl = document.getElementById("sectionType");
const sectionContentEl = document.getElementById("sectionContent");
const addSectionBtn = document.getElementById("addSectionBtn");

const publishBtn = document.getElementById("publishBtn");
const publishResultEl = document.getElementById("publishResult");

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", init);

function init() {
    loadPages();

    createPageBtn.addEventListener("click", async () => {
        const title = newPageTitleEl.value.trim();
        if (!title) {
            alert("Введите название страницы!");
            return;
        }
        try {
            await CreatePage(title);
            newPageTitleEl.value = "";
            loadPages();
        } catch (err) {
            alert("Ошибка создания страницы: " + err);
        }
    });

    addSectionBtn.addEventListener("click", async () => {
        if (!currentSelectedPage) {
            alert("Сначала выберите страницу!");
            return;
        }
        const sType = sectionTypeEl.value.trim();
        const sContent = sectionContentEl.value.trim();
        if (!sType) {
            alert("Укажите тип секции!");
            return;
        }
        try {
            await AddSection(currentSelectedPage, sType, sContent);
            sectionTypeEl.value = "";
            sectionContentEl.value = "";
            loadSections(currentSelectedPage);
        } catch (err) {
            alert("Ошибка добавления секции: " + err);
        }
    });

    publishBtn.addEventListener("click", async () => {
        try {
            const html = await PublishSite();
            publishResultEl.value = html;
        } catch (err) {
            alert("Ошибка публикации: " + err);
        }
    });
}

// Загрузить список страниц и обновить UI
async function loadPages() {
    try {
        const pages = await ListPages();
        renderPageList(pages);
        // Если текущая выбранная страница уже не существует — сбросить
        if (currentSelectedPage && !pages.find(p => p.id === currentSelectedPage)) {
            currentSelectedPage = null;
            currentPageEl.textContent = "Нет выбранной страницы";
            sectionsListEl.innerHTML = "";
        }
    } catch (err) {
        alert("Ошибка при загрузке страниц: " + err);
    }
}

// Отрендерить список страниц в боковой панели
function renderPageList(pages) {
    pageListEl.innerHTML = "";
    pages.forEach(page => {
        const item = document.createElement("div");
        item.className = "page-item";
        item.textContent = page.title ? page.title : "(Без названия)";
        item.addEventListener("click", () => {
            currentSelectedPage = page.id;
            currentPageEl.textContent = `Страница: ${page.title}`;
            loadSections(page.id);
        });
        pageListEl.appendChild(item);

        // Кнопка удаления страницы
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.style.float = "right";
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (confirm(`Удалить страницу "${page.title}"?`)) {
                try {
                    await DeletePage(page.id);
                    loadPages();
                    if (page.id === currentSelectedPage) {
                        currentSelectedPage = null;
                        currentPageEl.textContent = "Нет выбранной страницы";
                        sectionsListEl.innerHTML = "";
                    }
                } catch (err) {
                    alert("Ошибка удаления страницы: " + err);
                }
            }
        });
        item.appendChild(deleteBtn);
    });
}

// Загрузить и отобразить секции выбранной страницы
async function loadSections(pageID) {
    try {
        const sections = await ListSections(pageID);
        renderSectionsList(pageID, sections);
    } catch (err) {
        alert("Ошибка при загрузке секций: " + err);
    }
}

function renderSectionsList(pageID, sections) {
    sectionsListEl.innerHTML = "";
    sections.forEach(sec => {
        const secEl = document.createElement("div");
        secEl.className = "section-item";
        secEl.innerHTML = `
      <div><strong>Тип:</strong> ${sec.type}</div>
      <div><strong>Контент:</strong> ${sec.content || ""}</div>
    `;

        // Кнопки редактирования и удаления
        const btnContainer = document.createElement("div");
        btnContainer.className = "section-buttons";

        const editBtn = document.createElement("button");
        editBtn.textContent = "Редактировать";
        editBtn.style.marginRight = "5px";
        editBtn.addEventListener("click", () => {
            editSection(pageID, sec.id, sec.type, sec.content);
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "Удалить";
        delBtn.addEventListener("click", async () => {
            if (confirm("Удалить эту секцию?")) {
                try {
                    await DeleteSection(pageID, sec.id);
                    loadSections(pageID);
                } catch (err) {
                    alert("Ошибка удаления секции: " + err);
                }
            }
        });

        btnContainer.appendChild(editBtn);
        btnContainer.appendChild(delBtn);
        secEl.appendChild(btnContainer);
        sectionsListEl.appendChild(secEl);
    });
}

function editSection(pageID, sectionID, oldType, oldContent) {
    const newType = prompt("Введите новый тип секции:", oldType);
    if (newType === null) return; // пользователь отменил
    const newContent = prompt("Введите новый контент секции:", oldContent);
    if (newContent === null) return;

    UpdateSection(pageID, sectionID, newType, newContent)
        .then(() => loadSections(pageID))
        .catch(err => alert("Ошибка обновления секции: " + err));
}
