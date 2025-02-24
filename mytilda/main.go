package main

import (
	"embed"
	"fmt"
	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"os"
)

// Встраиваем папку с активами фронтенда в Go
//
//go:embed frontend/dist/*
var assets embed.FS

// Project - структура для проекта
type Project struct {
	ID   string `json:"id"`
	HTML string `json:"html"`
	CSS  string `json:"css"`
	JS   string `json:"js"`
}

// App - основное приложение
type App struct {
	Projects map[string]Project
}

// NewApp - конструктор приложения
func NewApp() *App {
	return &App{
		Projects: make(map[string]Project),
	}
}

// SaveProjectData - сохранение проекта
func (a *App) SaveProjectData(projectData map[string]string) {
	// Генерация нового ID
	id := uuid.New().String()

	// Создаем новый проект
	project := Project{
		ID:   id,
		HTML: projectData["html"],
		CSS:  projectData["css"],
		JS:   projectData["js"],
	}

	// Добавляем проект в коллекцию
	a.Projects[id] = project

	// Создаем директорию для проекта
	projectDir := fmt.Sprintf("./projects/%s", id)
	err := os.MkdirAll(projectDir, os.ModePerm)
	if err != nil {
		fmt.Println("Ошибка при создании папки проекта:", err)
		return
	}

	// Записываем HTML файл проекта
	htmlFilePath := fmt.Sprintf("%s/index.html", projectDir)
	htmlFile, err := os.Create(htmlFilePath)
	if err != nil {
		fmt.Println("Ошибка при создании HTML файла:", err)
		return
	}
	defer htmlFile.Close()

	// Генерация содержимого HTML
	htmlContent := fmt.Sprintf("<html>\n<head>\n<title>%s</title>\n<style>%s</style>\n<script>%s</script>\n</head>\n<body>%s</body>\n</html>",
		"Project", project.CSS, project.JS, project.HTML)
	htmlFile.WriteString(htmlContent)

	// Выводим информацию
	fmt.Println("Проект сохранен с ID:", id)
}

// Main функция
func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "Constructor",
		Width:  1280,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets, // Используем встроенные активы
		},
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		fmt.Println("Ошибка при запуске:", err.Error())
	}
}
