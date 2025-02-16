package main

import (
	"embed"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

// Встраиваем скомпилированный фронтенд (папка "frontend/dist")
//
//go:embed frontend/dist/*
var assets embed.FS

// Section — структура отдельной секции на странице
type Section struct {
	ID          string `json:"id"`
	SectionType string `json:"type"`
	Content     string `json:"content"`
}

// Page — структура страницы
type Page struct {
	ID       string    `json:"id"`
	Title    string    `json:"title"`
	Sections []Section `json:"sections"`
}

// App — основная структура приложения
type App struct {
	Pages map[string]*Page
}

// NewApp — конструктор App
func NewApp() *App {
	return &App{
		Pages: make(map[string]*Page),
	}
}

// ---------- Методы управления страницами ----------

// CreatePage — создаём новую страницу
func (a *App) CreatePage(title string) (string, error) {
	if title == "" {
		return "", fmt.Errorf("title не может быть пустым")
	}
	pageID := uuid.New().String()
	a.Pages[pageID] = &Page{
		ID:       pageID,
		Title:    title,
		Sections: []Section{},
	}
	return pageID, nil
}

// DeletePage — удаляем страницу
func (a *App) DeletePage(pageID string) (bool, error) {
	if _, ok := a.Pages[pageID]; !ok {
		return false, fmt.Errorf("страница %s не найдена", pageID)
	}
	delete(a.Pages, pageID)
	return true, nil
}

// ListPages — возвращает список всех страниц
func (a *App) ListPages() []Page {
	pages := make([]Page, 0, len(a.Pages))
	for _, p := range a.Pages {
		pages = append(pages, *p)
	}
	return pages
}

// ---------- Методы управления секциями ----------

// AddSection — добавляем секцию к странице
func (a *App) AddSection(pageID, sectionType, content string) (string, error) {
	page, ok := a.Pages[pageID]
	if !ok {
		return "", fmt.Errorf("страница %s не найдена", pageID)
	}
	secID := uuid.New().String()
	section := Section{
		ID:          secID,
		SectionType: sectionType,
		Content:     content,
	}
	page.Sections = append(page.Sections, section)
	return secID, nil
}

// DeleteSection — удаляем секцию с указанной страницы
func (a *App) DeleteSection(pageID, sectionID string) (bool, error) {
	page, ok := a.Pages[pageID]
	if !ok {
		return false, fmt.Errorf("страница %s не найдена", pageID)
	}
	for i, sec := range page.Sections {
		if sec.ID == sectionID {
			// удаляем элемент из слайса
			page.Sections = append(page.Sections[:i], page.Sections[i+1:]...)
			return true, nil
		}
	}
	return false, fmt.Errorf("секция %s на странице %s не найдена", sectionID, pageID)
}

// UpdateSection — изменяем данные секции (тип/контент)
func (a *App) UpdateSection(pageID, sectionID, newType, newContent string) (bool, error) {
	page, ok := a.Pages[pageID]
	if !ok {
		return false, fmt.Errorf("страница %s не найдена", pageID)
	}
	for i, sec := range page.Sections {
		if sec.ID == sectionID {
			page.Sections[i].SectionType = newType
			page.Sections[i].Content = newContent
			return true, nil
		}
	}
	return false, fmt.Errorf("секция %s на странице %s не найдена", sectionID, pageID)
}

// ListSections — получить список секций заданной страницы
func (a *App) ListSections(pageID string) ([]Section, error) {
	page, ok := a.Pages[pageID]
	if !ok {
		return nil, fmt.Errorf("страница %s не найдена", pageID)
	}
	return page.Sections, nil
}

// ---------- Публикация (простая генерация HTML) ----------

// PublishSite — генерирует общий HTML всех страниц
func (a *App) PublishSite() string {
	var sb strings.Builder
	sb.WriteString("<!DOCTYPE html><html><head><meta charset='UTF-8'><title>My Site</title></head><body>\n")
	sb.WriteString("<h1>Мой Сайт</h1>\n")
	for _, p := range a.Pages {
		sb.WriteString(fmt.Sprintf("<h2>Страница: %s</h2>\n", p.Title))
		for _, s := range p.Sections {
			sb.WriteString(fmt.Sprintf("<div class='section' data-id='%s'>\n", s.ID))
			sb.WriteString(fmt.Sprintf("<h3>%s</h3>\n", s.SectionType))
			sb.WriteString(fmt.Sprintf("<p>%s</p>\n", s.Content))
			sb.WriteString("</div>\n")
		}
	}
	sb.WriteString("</body></html>")
	return sb.String()
}

// ---------- main ----------

func main() {
	app := NewApp()
	err := wails.Run(&options.App{
		Title:  "Tilda-like Site Constructor",
		Width:  1280,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets, // Подключаем встроенные файлы фронтенда
		},
		Bind: []interface{}{
			app,
		},
	})
	if err != nil {
		println("Ошибка запуска:", err.Error())
	}
}
