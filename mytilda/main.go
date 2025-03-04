package main

import (
	"embed"
	"fmt"
	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"os"
	"path/filepath"
)

// Встраиваем папку с активами фронтенда в Go
//
//go:embed frontend/dist/*
//go:embed frontend/dist/**/*
//go:embed frontend/*.html
//go:embed frontend/*.js
//go:embed frontend/*.css
//go:embed frontend/logo-valera.png
//go:embed frontend/image_2025-02-26_14-29-11.png
//go:embed frontend/logo.png
//go:embed frontend/appicon.png
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
func (a *App) SaveProjectData(projectData map[string]string) error {
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
		return fmt.Errorf("Ошибка при создании папки проекта: %v", err)
	}

	// Создаем HTML файл проекта с объединением стилей и скриптов
	htmlFilePath := filepath.Join(projectDir, "index.html")
	htmlFile, err := os.Create(htmlFilePath)
	if err != nil {
		return fmt.Errorf("Ошибка при создании HTML файла: %v", err)
	}
	defer htmlFile.Close()

	// Генерация содержимого HTML с включением стилей и скриптов
	htmlContent := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Проект</title>
    <style>
        %s
    </style>
</head>
<body>
    %s
    <script>
        %s
    </script>
</body>
</html>`, project.CSS, project.HTML, project.JS)

	_, err = htmlFile.WriteString(htmlContent)
	if err != nil {
		return fmt.Errorf("Ошибка при записи в HTML файл: %v", err)
	}

	// Выводим информацию
	fmt.Println("Проект сохранен с ID:", id)
	return nil
}

// Main функция
func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "LocalConstructor",
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
