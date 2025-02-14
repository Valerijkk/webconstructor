package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed frontend/dist/*
var assets embed.FS

// App структура приложения
type App struct{}

// NewApp создаёт новый экземпляр App
func NewApp() *App {
	return &App{}
}

// Init инициализация приложения (вызывается перед запуском)
func (a *App) Init() error {
	return nil
}

// Greet вызывается из фронтенда
func (a *App) Greet(name string) string {
	return "Привет, " + name + "!"
}

// CreatePage создаёт новую страницу конструктора сайтов
func (a *App) CreatePage(title string) string {
	return "Создана страница: " + title
}

// AddSection добавляет секцию к странице
func (a *App) AddSection(pageID string, sectionType string) string {
	return "Добавлена секция типа " + sectionType + " к странице: " + pageID
}

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:       "Tilda-like Site Constructor",
		Width:       1024,
		Height:      768,
		AssetServer: &assetserver.Options{Assets: assets},
		Bind: []interface{}{
			app,
		},
	})
	if err != nil {
		println("Ошибка запуска:", err.Error())
	}
}
