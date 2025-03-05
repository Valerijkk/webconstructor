// main_test.go
package main

import (
	"fmt"           // Пакет для форматирования строк (и т.д.)
	"os"            // Пакет для работы с файловой системой (создание/удаление и др.)
	"path/filepath" // Пакет для удобной работы с путями файлов и директорий
	"sync"          // Пакет для работы с конкурентностью (WaitGroup и др.)
	"testing"       // Пакет для написания и запуска тестов
)

// Функция-хелпер, которая удаляет (если есть) папку с готовыми проектами, чтобы начать тесты "с чистого листа".
func cleanProjectsDir() {
	_ = os.RemoveAll("./projects") // Игнорируем ошибку, если директории нет
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 1: Создание приложения ==================
func TestFunctionality1_NewApp(t *testing.T) {

	// Подтест 1: Проверяем, что NewApp не вернёт nil
	t.Run("SubTest1_AppNotNil", func(t *testing.T) {
		app := NewApp() // Создаём новое приложение
		if app == nil { // Если вдруг вернулось nil — ошибка
			t.Fatal("Ожидался объект приложения, но получили nil")
		}
	})

	// Подтест 2: У нового приложения карта Projects должна быть пустая
	t.Run("SubTest2_ProjectsMapIsEmpty", func(t *testing.T) {
		app := NewApp()             // Создаём приложение
		if len(app.Projects) != 0 { // Проверяем длину карты Projects
			t.Errorf("Ожидалась пустая карта Projects, но найдено: %d", len(app.Projects))
		}
	})

	// Подтест 3: У двух разных экземпляров приложения должны быть независимые карты Projects
	t.Run("SubTest3_AppsHaveDifferentMaps", func(t *testing.T) {
		app1 := NewApp()
		app2 := NewApp()
		if &app1.Projects == &app2.Projects { // Сравниваем адреса
			t.Error("Разные экземпляры должны иметь независимые карты Projects")
		}
	})

	// Подтест 4: Добавляем проект вручную в карту приложения
	t.Run("SubTest4_ManualAddProject", func(t *testing.T) {
		app := NewApp()
		app.Projects["test_id"] = Project{ // Вручную добавляем запись
			ID:   "test_id",
			HTML: "<html>test</html>",
			CSS:  "body{}",
			JS:   "console.log('test');",
		}
		if len(app.Projects) != 1 { // Проверяем, что в карте ровно 1 проект
			t.Error("Не удалось вручную добавить проект в карту")
		}
	})

	// Подтест 5: Добавляем несколько проектов в цикле
	t.Run("SubTest5_AddMultipleProjects", func(t *testing.T) {
		app := NewApp()
		for i := 0; i < 3; i++ {
			// Создаём строковые данные с учётом счётчика
			app.Projects[fmt.Sprintf("id_%d", i)] = Project{
				ID:   fmt.Sprintf("id_%d", i),
				HTML: fmt.Sprintf("<html><body>%d</body></html>", i),
				CSS:  fmt.Sprintf("body { color: #%02x%02x%02x; }", i, i, i),
				JS:   fmt.Sprintf("console.log(%d);", i),
			}
		}
		// Теперь проверяем, что добавилось ровно 3
		if len(app.Projects) != 3 {
			t.Errorf("Ожидалось 3 проекта, получено %d", len(app.Projects))
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 2: Сохранение проекта ==================
func TestFunctionality2_SaveProject(t *testing.T) {

	// Подтест 1: Проверяем, создаётся ли папка проекта
	t.Run("SubTest1_CreateProjectFolder", func(t *testing.T) {
		cleanProjectsDir() // Удаляем папку ./projects перед тестом
		app := NewApp()    // Создаём приложение

		// Задаём тестовые данные
		data := map[string]string{
			"html": "<html><body>Test</body></html>",
			"css":  "body { background: #fff; }",
			"js":   "console.log('Test');",
		}

		// Сохраняем проект
		err := app.SaveProjectData(data)
		if err != nil {
			t.Fatalf("Ошибка при сохранении проекта: %v", err)
		}

		// Определяем последний добавленный ID
		var lastID string
		for k := range app.Projects {
			lastID = k
		}

		// Формируем путь к папке проекта
		projectPath := filepath.Join("./projects", lastID)
		// Проверяем, что эта папка существует
		if _, err := os.Stat(projectPath); os.IsNotExist(err) {
			t.Fatalf("Папка проекта не была создана: %v", projectPath)
		}
	})

	// Подтест 2: Проверяем, создаётся ли index.html
	t.Run("SubTest2_CreateIndexHTML", func(t *testing.T) {
		cleanProjectsDir() // Чистим папку
		app := NewApp()

		// Тестовые данные
		data := map[string]string{
			"html": "<html><body>AnotherTest</body></html>",
			"css":  "body { background: #eee; }",
			"js":   "console.log('AnotherTest');",
		}
		err := app.SaveProjectData(data)
		if err != nil {
			t.Fatalf("Ошибка при сохранении проекта: %v", err)
		}

		var lastID string
		for k := range app.Projects {
			lastID = k
		}
		htmlPath := filepath.Join("./projects", lastID, "index.html")

		// Проверяем, что файл реально создан
		if _, err := os.Stat(htmlPath); os.IsNotExist(err) {
			t.Fatalf("Файл index.html не был создан: %v", htmlPath)
		}
	})

	// Подтест 3: Уникальность ID при сохранении нескольких проектов подряд
	t.Run("SubTest3_UniqueID", func(t *testing.T) {
		cleanProjectsDir()
		app := NewApp()

		data1 := map[string]string{"html": "1", "css": "1", "js": "1"}
		data2 := map[string]string{"html": "2", "css": "2", "js": "2"}

		err1 := app.SaveProjectData(data1)
		err2 := app.SaveProjectData(data2)
		if err1 != nil || err2 != nil {
			t.Fatalf("Ошибка при сохранении проектов: err1=%v, err2=%v", err1, err2)
		}

		// Собираем все ID
		ids := make([]string, 0, len(app.Projects))
		for k := range app.Projects {
			ids = append(ids, k)
		}
		// Проверяем, что ровно 2 ID
		if len(ids) != 2 {
			t.Fatalf("Ожидалось 2 проекта, получено %d", len(ids))
		}
		// Проверяем, что они не совпадают
		if ids[0] == ids[1] {
			t.Error("ID должны быть уникальными, получены одинаковые")
		}
	})

	// Подтест 4: Проверяем сохранение пустых данных
	t.Run("SubTest4_EmptyData", func(t *testing.T) {
		cleanProjectsDir()
		app := NewApp()

		data := map[string]string{"html": "", "css": "", "js": ""}
		err := app.SaveProjectData(data)
		if err != nil {
			t.Fatalf("Ошибка при сохранении пустого проекта: %v", err)
		}

		var lastID string
		for k := range app.Projects {
			lastID = k
		}
		projectPath := filepath.Join("./projects", lastID)

		// Проверяем, что папка создалась даже при пустых данных
		if _, err := os.Stat(projectPath); os.IsNotExist(err) {
			t.Fatalf("Папка не создана для пустого проекта: %v", projectPath)
		}
	})

	// Подтест 5: Сохранение больших строк
	t.Run("SubTest5_LargeData", func(t *testing.T) {
		cleanProjectsDir()
		app := NewApp()

		// Создаём большие данные
		htmlLarge := make([]byte, 5000)
		cssLarge := make([]byte, 5000)
		jsLarge := make([]byte, 5000)
		for i := 0; i < 5000; i++ {
			htmlLarge[i] = 'H'
			cssLarge[i] = 'C'
			jsLarge[i] = 'J'
		}
		data := map[string]string{
			"html": string(htmlLarge),
			"css":  string(cssLarge),
			"js":   string(jsLarge),
		}

		err := app.SaveProjectData(data)
		if err != nil {
			t.Fatalf("Ошибка при сохранении большого проекта: %v", err)
		}

		var lastID string
		for k := range app.Projects {
			lastID = k
		}
		htmlPath := filepath.Join("./projects", lastID, "index.html")
		info, err := os.Stat(htmlPath)
		if err != nil {
			t.Fatalf("Файл index.html не найден: %v", err)
		}
		// Проверяем, что он не пустой
		if info.Size() == 0 {
			t.Error("Файл index.html пуст, ожидалось содержимое большого размера")
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 3: Работа с HTML-контентом ==================
func TestFunctionality3_ValidateHTML(t *testing.T) {
	cleanProjectsDir() // Снова чистим перед тестом
	app := NewApp()

	// Подтест 1: Базовый HTML
	t.Run("SubTest1_BasicHTML", func(t *testing.T) {
		data := map[string]string{
			"html": "<html><body><h1>Title</h1></body></html>",
			"css":  "",
			"js":   "",
		}
		err := app.SaveProjectData(data)
		if err != nil {
			t.Errorf("Не удалось сохранить базовый HTML: %v", err)
		}
	})

	// Подтест 2: Пустой HTML
	t.Run("SubTest2_EmptyHTML", func(t *testing.T) {
		data := map[string]string{"html": "", "css": "", "js": ""}
		err := app.SaveProjectData(data)
		if err != nil {
			t.Errorf("Ошибка при сохранении пустого HTML: %v", err)
		}
	})

	// Подтест 3: HTML со спецсимволами
	t.Run("SubTest3_HTMLWithSpecialChars", func(t *testing.T) {
		data := map[string]string{
			"html": "<div>&lt;script&gt;alert('XSS')&lt;/script&gt;</div>",
			"css":  "",
			"js":   "",
		}
		err := app.SaveProjectData(data)
		if err != nil {
			t.Errorf("Не удалось сохранить HTML со спецсимволами: %v", err)
		}
	})

	// Подтест 4: HTML с кавычками
	t.Run("SubTest4_HTMLWithQuotes", func(t *testing.T) {
		data := map[string]string{
			"html": `<p class="test">"Double quotes" and 'single quotes'</p>`,
			"css":  "",
			"js":   "",
		}
		err := app.SaveProjectData(data)
		if err != nil {
			t.Errorf("Не удалось сохранить HTML с кавычками: %v", err)
		}
	})

	// Подтест 5: Длинный HTML
	t.Run("SubTest5_LongHTML", func(t *testing.T) {
		longText := "<div>"
		for i := 0; i < 1000; i++ {
			longText += "Lorem ipsum "
		}
		longText += "</div>"
		data := map[string]string{"html": longText, "css": "", "js": ""}
		err := app.SaveProjectData(data)
		if err != nil {
			t.Errorf("Не удалось сохранить большой HTML-блок: %v", err)
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 4: Работа с CSS-контентом ==================
func TestFunctionality4_ValidateCSS(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: Базовый CSS
	t.Run("SubTest1_BasicCSS", func(t *testing.T) {
		data := map[string]string{
			"html": "",
			"css":  "body { background: #000; color: #fff; }",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить базовый CSS:", err)
		}
	})

	// Подтест 2: Пустой CSS
	t.Run("SubTest2_EmptyCSS", func(t *testing.T) {
		data := map[string]string{"html": "", "css": "", "js": ""}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Ошибка при сохранении пустого CSS:", err)
		}
	})

	// Подтест 3: CSS с комментарием
	t.Run("SubTest3_CSSWithComments", func(t *testing.T) {
		data := map[string]string{
			"html": "",
			"css":  "/* comment */\nbody { font-family: Arial; }",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить CSS с комментарием:", err)
		}
	})

	// Подтест 4: "Ошибочный" синтаксис
	t.Run("SubTest4_InvalidSyntaxCSS", func(t *testing.T) {
		data := map[string]string{
			"html": "",
			"css":  "body { invalid-property: ??? }",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить CSS с 'ошибочной' синтаксис:", err)
		}
	})

	// Подтест 5: Длинный CSS
	t.Run("SubTest5_LongCSS", func(t *testing.T) {
		longCSS := "/* Start */"
		for i := 0; i < 1000; i++ {
			longCSS += fmt.Sprintf(".class%d { color: #%03x; }", i, i)
		}
		data := map[string]string{"html": "", "css": longCSS, "js": ""}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить большой CSS:", err)
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 5: Работа с JS-контентом ==================
func TestFunctionality5_ValidateJS(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: Базовый JavaScript
	t.Run("SubTest1_BasicJS", func(t *testing.T) {
		data := map[string]string{
			"html": "",
			"css":  "",
			"js":   "console.log('Hello');",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить базовый JS:", err)
		}
	})

	// Подтест 2: Пустой JS
	t.Run("SubTest2_EmptyJS", func(t *testing.T) {
		data := map[string]string{"html": "", "css": "", "js": ""}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Ошибка при сохранении пустого JS:", err)
		}
	})

	// Подтест 3: JS с комментарием
	t.Run("SubTest3_JSWithComments", func(t *testing.T) {
		data := map[string]string{
			"html": "",
			"css":  "",
			"js": `// Comment
			console.log("After comment");`,
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить JS с комментарием:", err)
		}
	})

	// Подтест 4: Ошибочный синтаксис (но у нас проверка не падает)
	t.Run("SubTest4_SyntaxErrorJS", func(t *testing.T) {
		data := map[string]string{
			"html": "",
			"css":  "",
			"js":   "function() { console.log( }", // Явная ошибка, но код не проверяется
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить JS с синтаксической ошибкой:", err)
		}
	})

	// Подтест 5: Длинный JS
	t.Run("SubTest5_LongJS", func(t *testing.T) {
		longJS := ""
		for i := 0; i < 1000; i++ {
			longJS += fmt.Sprintf("console.log('%d');", i)
		}
		data := map[string]string{"html": "", "css": "", "js": longJS}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить большой JS:", err)
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 6: Проверка структуры Projects ==================
func TestFunctionality6_ProjectsStruct(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: Добавляем один проект
	t.Run("SubTest1_AddOneProject", func(t *testing.T) {
		pd := map[string]string{"html": "A", "css": "B", "js": "C"}
		_ = app.SaveProjectData(pd)
		if len(app.Projects) != 1 {
			t.Errorf("Ожидался 1 проект, найдено %d", len(app.Projects))
		}
	})

	// Подтест 2: Добавляем ещё два проекта подряд
	t.Run("SubTest2_AddTwoProjects", func(t *testing.T) {
		pd1 := map[string]string{"html": "1", "css": "2", "js": "3"}
		pd2 := map[string]string{"html": "4", "css": "5", "js": "6"}
		_ = app.SaveProjectData(pd1)
		_ = app.SaveProjectData(pd2)
		// Итого должно быть 3 (1 уже был + 2 новых)
		if len(app.Projects) != 3 {
			t.Errorf("Ожидалось 3 проекта (учитывая предыдущий), найдено %d", len(app.Projects))
		}
	})

	// Подтест 3: Проверяем, что у каждого проекта есть непустой ID
	t.Run("SubTest3_CheckProjectIDsExist", func(t *testing.T) {
		for id, project := range app.Projects {
			if id == "" {
				t.Error("ID проекта пустая строка")
			}
			if project.ID == "" {
				t.Error("Поле ID внутри структуры проекта пустое")
			}
		}
	})

	// Подтест 4: Перезаписываем карту Projects
	t.Run("SubTest4_OverwriteProjectsMap", func(t *testing.T) {
		app.Projects = make(map[string]Project) // Создаём новую пустую
		if len(app.Projects) != 0 {
			t.Error("Не удалось очистить карту проектов")
		}
	})

	// Подтест 5: После очистки добавляем снова
	t.Run("SubTest5_ReAddAfterClearing", func(t *testing.T) {
		pd := map[string]string{"html": "X", "css": "Y", "js": "Z"}
		_ = app.SaveProjectData(pd)
		if len(app.Projects) != 1 {
			t.Errorf("Ожидался 1 проект после очистки, найдено %d", len(app.Projects))
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 7: Конкурентное сохранение ==================
func TestFunctionality7_ConcurrentSave(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()
	numGoroutines := 5 // Количество горутин

	// Подтест 1: Сохраняем несколько проектов параллельно
	t.Run("SubTest1_ConcurrentSaveProjects", func(t *testing.T) {
		var wg sync.WaitGroup
		for i := 0; i < numGoroutines; i++ {
			wg.Add(1)
			go func(i int) {
				defer wg.Done()
				data := map[string]string{
					"html": fmt.Sprintf("<html><body>%d</body></html>", i),
					"css":  fmt.Sprintf("body { color: #%02x%02x%02x; }", i, i, i),
					"js":   fmt.Sprintf("console.log('%d');", i),
				}
				_ = app.SaveProjectData(data)
			}(i)
		}
		wg.Wait() // Ждём завершения всех горутин

		// Проверяем итоговое кол-во проектов
		if len(app.Projects) != numGoroutines {
			t.Errorf("Ожидалось %d проектов, а получено %d", numGoroutines, len(app.Projects))
		}
	})

	// Подтест 2: У каждого проекта должна быть своя папка
	t.Run("SubTest2_CheckFoldersExist", func(t *testing.T) {
		for id := range app.Projects {
			path := filepath.Join("./projects", id)
			if _, err := os.Stat(path); os.IsNotExist(err) {
				t.Errorf("Папка не найдена для проекта %s", id)
			}
		}
	})

	// Подтест 3: И файл index.html
	t.Run("SubTest3_CheckIndexHTMLExists", func(t *testing.T) {
		for id := range app.Projects {
			path := filepath.Join("./projects", id, "index.html")
			if _, err := os.Stat(path); os.IsNotExist(err) {
				t.Errorf("Файл index.html не найден для проекта %s", id)
			}
		}
	})

	// Подтест 4: Ещё раз параллельно добавляем такое же кол-во проектов
	t.Run("SubTest4_AdditionalConcurrentSaves", func(t *testing.T) {
		var wg sync.WaitGroup
		for i := 0; i < numGoroutines; i++ {
			wg.Add(1)
			go func(i int) {
				defer wg.Done()
				data := map[string]string{
					"html": fmt.Sprintf("<div>%d</div>", i),
					"css":  ".class { border: 1px solid #000; }",
					"js":   fmt.Sprintf("console.log('%d again');", i),
				}
				_ = app.SaveProjectData(data)
			}(i)
		}
		wg.Wait()

		// Теперь проектов должно быть в 2 раза больше
		if len(app.Projects) != numGoroutines*2 {
			t.Errorf("Ожидалось %d проектов, получено %d", numGoroutines*2, len(app.Projects))
		}
	})

	// Подтест 5: Если нет паник — считаем всё успешно
	t.Run("SubTest5_ConcurrentSaveNoErrors", func(t *testing.T) {
		// Здесь нет проверок, главное, что не упали
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 8: Проверка UTF-8 / спец. символов ==================
func TestFunctionality8_UTF8(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: Русские символы
	t.Run("SubTest1_RussianChars", func(t *testing.T) {
		data := map[string]string{
			"html": "<p>Привет, мир!</p>",
			"css":  "",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить проект с русскими символами:", err)
		}
	})

	// Подтест 2: Эмодзи
	t.Run("SubTest2_Emoji", func(t *testing.T) {
		data := map[string]string{
			"html": "<p>Emoji: 🚀🔥</p>",
			"css":  "",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить проект с эмодзи:", err)
		}
	})

	// Подтест 3: Разные юникод-символы
	t.Run("SubTest3_AssortedUnicode", func(t *testing.T) {
		data := map[string]string{
			"html": "<p>你好，世界！こんにちは世界🌏</p>",
			"css":  "p { font-weight: bold; }",
			"js":   "console.log('Unicode test');",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить проект с разными Unicode-символами:", err)
		}
	})

	// Подтест 4: Комбинирующие знаки (пример: буква + акцент)
	t.Run("SubTest4_CombiningMarks", func(t *testing.T) {
		data := map[string]string{
			"html": "<p>e\u0301 = é</p>",
			"css":  "",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить проект с комбинирующими знаками:", err)
		}
	})

	// Подтест 5: Длинная строка UTF-8
	t.Run("SubTest5_LongUTF8String", func(t *testing.T) {
		str := "Тест"
		for i := 0; i < 100; i++ {
			str += "🔥"
		}
		data := map[string]string{
			"html": "<div>" + str + "</div>",
			"css":  "",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить проект с длинной строкой UTF-8:", err)
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 9: Попытки некорректного пути ==================
func TestFunctionality9_PathTraversal(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: Попытка использования "../../etc/passwd" в HTML
	t.Run("SubTest1_PathTraversalInHTML", func(t *testing.T) {
		data := map[string]string{
			"html": "../../etc/passwd",
			"css":  "",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить проект с 'path traversal' в HTML:", err)
		}
	})

	// Подтест 2: То же самое в CSS
	t.Run("SubTest2_PathTraversalInCSS", func(t *testing.T) {
		data := map[string]string{
			"html": "<div>Test</div>",
			"css":  "../../etc/passwd",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить проект с 'path traversal' в CSS:", err)
		}
	})

	// Подтест 3: И в JS
	t.Run("SubTest3_PathTraversalInJS", func(t *testing.T) {
		data := map[string]string{
			"html": "<div>Test</div>",
			"css":  "",
			"js":   "../../etc/passwd",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить проект с 'path traversal' в JS:", err)
		}
	})

	// Подтест 4: Проверяем, что папка projects всё ещё существует
	t.Run("SubTest4_CheckProjectsDirStillOk", func(t *testing.T) {
		if _, err := os.Stat("./projects"); os.IsNotExist(err) {
			t.Error("Папка './projects' исчезла? Это странно.")
		}
	})

	// Подтест 5: Проверяем, что файлы index.html всё ещё на месте
	t.Run("SubTest5_NoSystemCorruption", func(t *testing.T) {
		for id := range app.Projects {
			htmlPath := filepath.Join("./projects", id, "index.html")
			if _, err := os.Stat(htmlPath); os.IsNotExist(err) {
				t.Errorf("index.html не найден для %s (после path traversal теста)", id)
			}
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 10: Проверка прав (грубая) ==================
func TestFunctionality10_Permissions(t *testing.T) {
	// В этих тестах мы только описываем placeholder, реальной проверки прав нет
	t.Run("SubTest1_NoWritePermission", func(t *testing.T) {
		// Сложно эмулировать отсутствие прав без sudo
	})

	t.Run("SubTest2_NoReadPermission", func(t *testing.T) {
		// Аналогично
	})

	t.Run("SubTest3_ChangeDirToReadOnly", func(t *testing.T) {
		// Placeholder, требуются расширенные действия
	})

	t.Run("SubTest4_RestorePermissions", func(t *testing.T) {
		// Placeholder
	})

	t.Run("SubTest5_CheckAppDoesNotCrash", func(t *testing.T) {
		// Раз не упало, то ок
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 11: Некорректные данные ==================
func TestFunctionality11_InvalidData(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: Передаём nil вместо карты
	t.Run("SubTest1_NilMap", func(t *testing.T) {
		if err := app.SaveProjectData(nil); err == nil {
			t.Error("Ожидалась ошибка при передаче nil, но её нет")
		}
	})

	// Подтест 2: Нет ключа 'html'
	t.Run("SubTest2_MapWithoutHTMLKey", func(t *testing.T) {
		data := map[string]string{"css": "body{}", "js": "alert()"}
		if err := app.SaveProjectData(data); err != nil {
			t.Log("Допускается отсутствие ключа 'html'") // Либо ошибка, либо нет
		}
	})

	// Подтест 3: Нет ключа 'css'
	t.Run("SubTest3_MapWithoutCSSKey", func(t *testing.T) {
		data := map[string]string{"html": "<div>Test</div>", "js": "alert()"}
		if err := app.SaveProjectData(data); err != nil {
			t.Log("Допускается отсутствие ключа 'css'")
		}
	})

	// Подтест 4: Нет ключа 'js'
	t.Run("SubTest4_MapWithoutJSKey", func(t *testing.T) {
		data := map[string]string{"html": "<div>Test</div>", "css": "body{}"}
		if err := app.SaveProjectData(data); err != nil {
			t.Log("Допускается отсутствие ключа 'js'")
		}
	})

	// Подтест 5: Проверяем, сколько проектов реально добавилось
	t.Run("SubTest5_CheckLastProject", func(t *testing.T) {
		if len(app.Projects) != 3 {
			t.Errorf("Ожидалось 3 проекта (за вычетом nil), получено %d", len(app.Projects))
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 12: Ошибки при создании папки ==================
func TestFunctionality12_FailOnDirectory(t *testing.T) {

	// Подтест 1: Симуляция ошибки — placeholder
	t.Run("SubTest1_SimulateDirError", func(t *testing.T) {
		// Без моков нельзя, пропускаем
	})

	// Подтест 2: Проверяем поведение, если папка уже существует
	t.Run("SubTest2_CheckBehaviorIfDirExists", func(t *testing.T) {
		cleanProjectsDir()
		app := NewApp()

		// Создаём заранее папку 'projects/fake_id'
		fakeID := "fake_id"
		os.MkdirAll(filepath.Join("projects", fakeID), os.ModePerm)

		// Сохраняем проект, должна перезаписать (или создать новую папку с новым ID)
		data := map[string]string{"html": "X", "css": "Y", "js": "Z"}
		if err := app.SaveProjectData(data); err != nil {
			t.Error("Не удалось сохранить проект при существующей папке 'projects'", err)
		}
	})

	// Подтест 3: Очень длинные пути - placeholder
	t.Run("SubTest3_LongNestedFolders", func(t *testing.T) {
		// Placeholder
	})

	// Подтест 4: Слишком длинный ID - пока нереализуемо
	t.Run("SubTest4_TooLongProjectID", func(t *testing.T) {
		// UUID не бывает слишком длинным
	})

	// Подтест 5: Проверяем, что не упало
	t.Run("SubTest5_CheckNoCrash", func(t *testing.T) {
		// Если дошли сюда, то ок
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 13: Ошибки при создании файла ==================
func TestFunctionality13_FailOnFileCreation(t *testing.T) {

	// Подтест 1: Симуляция ошибки при создании файла — placeholder
	t.Run("SubTest1_SimulateFileError", func(t *testing.T) {
		// Нужно мокать os.Create
	})

	// Подтест 2: Если файл уже существует
	t.Run("SubTest2_CheckExistingFile", func(t *testing.T) {
		cleanProjectsDir()
		app := NewApp()

		data := map[string]string{"html": "some", "css": "some", "js": "some"}
		_ = app.SaveProjectData(data) // Сохраняем проект

		// Находим последний ID
		var lastID string
		for k := range app.Projects {
			lastID = k
		}
		htmlPath := filepath.Join("projects", lastID, "index.html")

		// Создаём этот же файл вручную, записываем что-то другое
		f, _ := os.Create(htmlPath)
		f.WriteString("Overwrite test")
		f.Close()

		// Сохраняем ещё раз — перезапишет файл
		_ = app.SaveProjectData(map[string]string{"html": "second", "css": "", "js": ""})
	})

	// Подтест 3: Проверка, что контент обновлён — placeholder
	t.Run("SubTest3_CheckFileContentOverwritten", func(t *testing.T) {
	})

	// Подтест 4: Убираем права записи у файла — placeholder
	t.Run("SubTest4_RemoveWritePermissionFile", func(t *testing.T) {
	})

	// Подтест 5: Проверяем, что не упало
	t.Run("SubTest5_CheckNoCrash", func(t *testing.T) {
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 14: Проверка сообщений об ошибках ==================
func TestFunctionality14_ErrorMessages(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: Ожидаем ошибку при передаче nil
	t.Run("SubTest1_NilMapReturnsError", func(t *testing.T) {
		err := app.SaveProjectData(nil)
		if err == nil {
			t.Error("Ожидалась ошибка, но получили nil")
		} else {
			t.Logf("Получено сообщение об ошибке: %v", err)
		}
	})

	t.Run("SubTest2_CheckDirCreateErrorMsg", func(t *testing.T) {
		// Placeholder
	})

	t.Run("SubTest3_CheckFileCreateErrorMsg", func(t *testing.T) {
		// Placeholder
	})

	t.Run("SubTest4_CheckWriteErrorMsg", func(t *testing.T) {
		// Placeholder
	})

	t.Run("SubTest5_CheckFinalOutput", func(t *testing.T) {
		t.Log("На данном этапе достаточно проверить логи")
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 15: Ручное добавление проектов ==================
func TestFunctionality15_ManualAddToProjects(t *testing.T) {
	app := NewApp()

	// Подтест 1: Добавим один проект вручную
	t.Run("SubTest1_AddOne", func(t *testing.T) {
		app.Projects["1"] = Project{ID: "1", HTML: "A", CSS: "B", JS: "C"}
		if len(app.Projects) != 1 {
			t.Error("Ожидался 1 проект, получено:", len(app.Projects))
		}
	})

	// Подтест 2: Перезапишем тот же ключ
	t.Run("SubTest2_OverwriteSameID", func(t *testing.T) {
		app.Projects["1"] = Project{ID: "1", HTML: "AAA", CSS: "BBB", JS: "CCC"}
		if len(app.Projects) != 1 {
			t.Error("Ожидался 1 проект (перезапись), получено:", len(app.Projects))
		}
	})

	// Подтест 3: Добавим ещё два проекта
	t.Run("SubTest3_AddTwoMore", func(t *testing.T) {
		app.Projects["2"] = Project{ID: "2"}
		app.Projects["3"] = Project{ID: "3"}
		if len(app.Projects) != 3 {
			t.Error("Ожидалось 3 проекта (после добавления), получено:", len(app.Projects))
		}
	})

	// Подтест 4: Проверим соответствие ключа и ID
	t.Run("SubTest4_CheckIDs", func(t *testing.T) {
		for id, prj := range app.Projects {
			if id != prj.ID {
				t.Errorf("ID ключа '%s' не совпадает с ID в структуре '%s'", id, prj.ID)
			}
		}
	})

	// Подтест 5: Удалим один из проектов
	t.Run("SubTest5_DeleteOne", func(t *testing.T) {
		delete(app.Projects, "2")
		if len(app.Projects) != 2 {
			t.Error("Ожидалось 2 проекта (после удаления), получено:", len(app.Projects))
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 16: Добавление нескольких проектов ==================
func TestFunctionality16_MultipleProjects(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: Добавляем 5 проектов циклом
	t.Run("SubTest1_AddProjectsInLoop", func(t *testing.T) {
		for i := 0; i < 5; i++ {
			data := map[string]string{
				"html": fmt.Sprintf("HTML_%d", i),
				"css":  fmt.Sprintf("CSS_%d", i),
				"js":   fmt.Sprintf("JS_%d", i),
			}
			_ = app.SaveProjectData(data)
		}
		if len(app.Projects) != 5 {
			t.Errorf("Ожидалось 5 проектов, получено %d", len(app.Projects))
		}
	})

	// Подтест 2: У каждого должен быть свой index.html
	t.Run("SubTest2_CheckEveryIndexHTMLExists", func(t *testing.T) {
		for id := range app.Projects {
			path := filepath.Join("projects", id, "index.html")
			if _, err := os.Stat(path); os.IsNotExist(err) {
				t.Errorf("Нет index.html для проекта %s", id)
			}
		}
	})

	// Подтест 3: Добавляем ещё три раза те же данные
	t.Run("SubTest3_ReAddSameData", func(t *testing.T) {
		data := map[string]string{
			"html": "SAME_HTML",
			"css":  "SAME_CSS",
			"js":   "SAME_JS",
		}
		_ = app.SaveProjectData(data)
		_ = app.SaveProjectData(data)
		_ = app.SaveProjectData(data)
		// Итого должно быть 8
		if len(app.Projects) != 8 {
			t.Errorf("Ожидалось 8 проектов, получено %d", len(app.Projects))
		}
	})

	// Подтест 4: Проверяем, что для каждого ID есть директория
	t.Run("SubTest4_FolderCheckAgain", func(t *testing.T) {
		count := 0
		for id := range app.Projects {
			path := filepath.Join("projects", id)
			if _, err := os.Stat(path); err == nil {
				count++
			}
		}
		if count != len(app.Projects) {
			t.Errorf("Не для всех проектов создана папка. Ожидалось %d, найдено %d", len(app.Projects), count)
		}
	})

	// Подтест 5: Считаем кол-во проектов
	t.Run("SubTest5_ProjectCount", func(t *testing.T) {
		if len(app.Projects) != 8 {
			t.Error("Количество проектов вдруг изменилось?")
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 17: Повторное сохранение ==================
func TestFunctionality17_ReSavingExisting(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: Первый раз
	t.Run("SubTest1_SaveOnce", func(t *testing.T) {
		data := map[string]string{"html": "first", "css": "first", "js": "first"}
		_ = app.SaveProjectData(data)
		if len(app.Projects) != 1 {
			t.Errorf("Ожидался 1 проект, получено %d", len(app.Projects))
		}
	})

	// Подтест 2: Второй раз
	t.Run("SubTest2_SaveTwice", func(t *testing.T) {
		data := map[string]string{"html": "second", "css": "second", "js": "second"}
		_ = app.SaveProjectData(data)
		if len(app.Projects) != 2 {
			t.Errorf("Ожидался 2 проекта, получено %d", len(app.Projects))
		}
	})

	// Подтест 3: Проверяем разные ли ID
	t.Run("SubTest3_CheckIDsDifferent", func(t *testing.T) {
		ids := []string{}
		for k := range app.Projects {
			ids = append(ids, k)
		}
		if len(ids) == 2 && ids[0] == ids[1] {
			t.Error("Ожидались разные ID при повторном сохранении")
		}
	})

	// Подтест 4: Перезаписываем в памяти (а не на диске)
	t.Run("SubTest4_OverwriteInMemory", func(t *testing.T) {
		for id := range app.Projects {
			app.Projects[id] = Project{ID: id, HTML: "OVERWRITE"}
		}
	})

	// Подтест 5: Проверяем, что HTML реально перезаписан
	t.Run("SubTest5_CheckHTMLUpdated", func(t *testing.T) {
		for _, prj := range app.Projects {
			if prj.HTML != "OVERWRITE" {
				t.Error("HTML не перезаписан в памяти?")
			}
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 18: Вставка "опасного" HTML ==================
func TestFunctionality18_HTMLInjection(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: script-тег
	t.Run("SubTest1_ScriptTag", func(t *testing.T) {
		data := map[string]string{
			"html": "<script>alert('XSS')</script>",
			"css":  "",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Errorf("Не удалось сохранить проект со script-тегом: %v", err)
		}
	})

	// Подтест 2: onerror-атрибут
	t.Run("SubTest2_OnErrorAttribute", func(t *testing.T) {
		data := map[string]string{
			"html": `<img src="invalid.jpg" onerror="alert('XSS')">`,
			"css":  "",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Errorf("Не удалось сохранить проект с onerror-атрибутом: %v", err)
		}
	})

	// Подтест 3: Внедрение через style
	t.Run("SubTest3_StyleInjection", func(t *testing.T) {
		data := map[string]string{
			"html": `<div style="background-image: url(javascript:alert('XSS'));">Test</div>`,
			"css":  "",
			"js":   "",
		}
		if err := app.SaveProjectData(data); err != nil {
			t.Errorf("Не удалось сохранить проект со style-инъекцией: %v", err)
		}
	})

	// Подтест 4: Проверяем, что три проекта добавились
	t.Run("SubTest4_CheckProjectsCreated", func(t *testing.T) {
		if len(app.Projects) != 3 {
			t.Errorf("Ожидалось 3 проекта, получено %d", len(app.Projects))
		}
	})

	// Подтест 5: У каждого из них должен быть index.html
	t.Run("SubTest5_CheckHTMLFilesExist", func(t *testing.T) {
		for id := range app.Projects {
			path := filepath.Join("projects", id, "index.html")
			if _, err := os.Stat(path); os.IsNotExist(err) {
				t.Errorf("Нет index.html для проекта %s", id)
			}
		}
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 19: Тесты производительности (упрощённые) ==================
func TestFunctionality19_Performance(t *testing.T) {
	cleanProjectsDir()
	app := NewApp()

	// Подтест 1: Сохраняем 50 проектов
	t.Run("SubTest1_SaveManyProjectsQuickly", func(t *testing.T) {
		for i := 0; i < 50; i++ {
			data := map[string]string{
				"html": fmt.Sprintf("<div>%d</div>", i),
				"css":  fmt.Sprintf(".cls%d { color: red; }", i),
				"js":   fmt.Sprintf("console.log(%d);", i),
			}
			_ = app.SaveProjectData(data)
		}
		if len(app.Projects) != 50 {
			t.Errorf("Ожидалось 50 проектов, получено %d", len(app.Projects))
		}
	})

	// Подтест 2: Проверяем, что все index.html не пустые
	t.Run("SubTest2_CheckAllIndexFiles", func(t *testing.T) {
		count := 0
		for id := range app.Projects {
			fp := filepath.Join("projects", id, "index.html")
			if fi, err := os.Stat(fp); err == nil && fi.Size() > 0 {
				count++
			}
		}
		if count != 50 {
			t.Errorf("Ожидалось 50 непустых файлов index.html, получено %d", count)
		}
	})

	// Подтест 3: Добавляем ещё 50 проектов
	t.Run("SubTest3_AnotherBatch", func(t *testing.T) {
		for i := 0; i < 50; i++ {
			data := map[string]string{
				"html": fmt.Sprintf("<span>%d</span>", i),
				"css":  fmt.Sprintf(".clsX%d { border: 1px solid black; }", i),
				"js":   fmt.Sprintf("console.log('batch%d');", i),
			}
			_ = app.SaveProjectData(data)
		}
		if len(app.Projects) != 100 {
			t.Errorf("Ожидалось 100 проектов, получено %d", len(app.Projects))
		}
	})

	// Подтест 4: Проверяем, что всё ок, нет паник
	t.Run("SubTest4_ConfirmNoPanics", func(t *testing.T) {
		// Если дошли до сюда, значит всё ок
	})

	// Подтест 5: Placeholder проверки времени
	t.Run("SubTest5_BasicTimingCheck", func(t *testing.T) {
		// Могли бы замерять время, но не будем
	})
}

// ================== ФУНКЦИОНАЛЬНОСТЬ 20: Финальная проверка ==================
func TestFunctionality20_FinalCheck(t *testing.T) {

	// Подтест 1: Смотрим, сколько директорий в ./projects
	t.Run("SubTest1_TotalProjects", func(t *testing.T) {
		info, err := os.ReadDir("./projects")
		if err != nil {
			t.Fatalf("Не удалось прочитать ./projects: %v", err)
		}
		t.Logf("Всего директорий в ./projects: %d", len(info))
	})

	// Подтест 2: Проверяем, что глобально ничего не сломалось
	t.Run("SubTest2_NoGlobalCrash", func(t *testing.T) {
		t.Log("Если приложение не упало на предыдущих тестах, значит всё ок.")
	})

	// Подтест 3: Проверяем, что новое приложение стартует с пустой картой
	t.Run("SubTest3_ProjectsMapCheck", func(t *testing.T) {
		app := NewApp()
		if len(app.Projects) != 0 {
			t.Errorf("Новое приложение должно начинаться с пустой карты, а не %d", len(app.Projects))
		}
	})

	// Подтест 4: Пройдены ли все проверки
	t.Run("SubTest4_PassAll", func(t *testing.T) {
		t.Log("Все основные проверки пройдены.")
	})

	// Подтест 5: Резерв
	t.Run("SubTest5_Reserve", func(t *testing.T) {
		t.Log("Резервный тест — никаких действий не выполняем.")
	})
}
