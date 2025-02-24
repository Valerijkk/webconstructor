package main

import (
	"embed"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

var assets embed.FS

// ---------- Структуры ----------

// Section — отдельный блок внутри страницы.
type Section struct {
	ID          string `json:"id"`
	SectionType string `json:"type"`
	Content     string `json:"content"`
}

// ExtendedPage — полная «Tilda-страница» с элементами.
type ExtendedPage struct {
	ID string `json:"id"`

	Title   string `json:"title"`
	Meta    string `json:"meta"`
	CSS     string `json:"css"`
	Scripts string `json:"scripts"`

	Logo      string `json:"logo"`
	Nav       string `json:"nav"`
	Main      string `json:"main"`
	Article   string `json:"article"`
	Aside     string `json:"aside"`
	Footer    string `json:"footer"`
	Contact   string `json:"contact"`
	Social    string `json:"social"`
	Copyright string `json:"copyright"`

	Sections []Section `json:"sections"`
}

// App — главное приложение.
type App struct {
	Pages  map[string]*ExtendedPage
	Images map[string]string
}

// NewApp — конструктор приложения.
func NewApp() *App {
	return &App{
		Pages:  make(map[string]*ExtendedPage),
		Images: make(map[string]string),
	}
}

// ---------- CRUD по страницам ----------

func (a *App) CreatePage(title string) (string, error) {
	if strings.TrimSpace(title) == "" {
		return "", errors.New("название не может быть пустым")
	}
	pageID := uuid.New().String()
	a.Pages[pageID] = &ExtendedPage{
		ID:       pageID,
		Title:    title,
		Sections: []Section{},
	}
	return pageID, nil
}

func (a *App) DeletePage(pageID string) (bool, error) {
	if _, ok := a.Pages[pageID]; !ok {
		return false, fmt.Errorf("страница '%s' не найдена", pageID)
	}
	delete(a.Pages, pageID)
	return true, nil
}

func (a *App) ListPages() []ExtendedPage {
	result := make([]ExtendedPage, 0, len(a.Pages))
	for _, p := range a.Pages {
		result = append(result, *p)
	}
	return result
}

func (a *App) getPage(pageID string) (*ExtendedPage, error) {
	p, ok := a.Pages[pageID]
	if !ok {
		return nil, fmt.Errorf("страница '%s' не найдена", pageID)
	}
	return p, nil
}

// ---------- Установка полей ----------

// Установка мета-данных, CSS, скриптов, и другие поля.
func (a *App) SetMeta(pageID, meta string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Meta = meta
	return nil
}

func (a *App) SetCSS(pageID, css string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.CSS = css
	return nil
}

func (a *App) SetScripts(pageID, scripts string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Scripts = scripts
	return nil
}

func (a *App) SetLogo(pageID, base64Logo string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Logo = base64Logo
	return nil
}

func (a *App) SetNav(pageID, navHtml string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Nav = navHtml
	return nil
}

func (a *App) SetMain(pageID, mainHtml string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Main = mainHtml
	return nil
}

func (a *App) SetArticle(pageID, articleHtml string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Article = articleHtml
	return nil
}

func (a *App) SetAside(pageID, asideHtml string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Aside = asideHtml
	return nil
}

func (a *App) SetFooter(pageID, footerHtml string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Footer = footerHtml
	return nil
}

func (a *App) SetContact(pageID, contact string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Contact = contact
	return nil
}

func (a *App) SetSocial(pageID, social string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Social = social
	return nil
}

func (a *App) SetCopyright(pageID, cpr string) error {
	p, err := a.getPage(pageID)
	if err != nil {
		return err
	}
	p.Copyright = cpr
	return nil
}

// ---------- Секции ----------

func (a *App) AddSection(pageID, sectionType, content string) (string, error) {
	p, err := a.getPage(pageID)
	if err != nil {
		return "", err
	}
	secID := uuid.New().String()
	p.Sections = append(p.Sections, Section{
		ID:          secID,
		SectionType: sectionType,
		Content:     content,
	})
	return secID, nil
}

func (a *App) DeleteSection(pageID, sectionID string) (bool, error) {
	p, err := a.getPage(pageID)
	if err != nil {
		return false, err
	}
	for i, s := range p.Sections {
		if s.ID == sectionID {
			p.Sections = append(p.Sections[:i], p.Sections[i+1:]...)
			return true, nil
		}
	}
	return false, fmt.Errorf("секция %s не найдена", sectionID)
}

func (a *App) UpdateSection(pageID, sectionID, newType, newContent string) (bool, error) {
	p, err := a.getPage(pageID)
	if err != nil {
		return false, err
	}
	for i, s := range p.Sections {
		if s.ID == sectionID {
			p.Sections[i].SectionType = newType
			p.Sections[i].Content = newContent
			return true, nil
		}
	}
	return false, fmt.Errorf("секция %s не найдена", sectionID)
}

func (a *App) ListSections(pageID string) ([]Section, error) {
	p, err := a.getPage(pageID)
	if err != nil {
		return nil, err
	}
	return p.Sections, nil
}

// ---------- Изображения ----------

func (a *App) UploadImage(filename, base64data string) (string, error) {
	if base64data == "" {
		return "", fmt.Errorf("base64 пустая")
	}
	imgID := uuid.New().String()
	a.Images[imgID] = base64data
	return imgID, nil
}

func (a *App) GetImageBase64(imageID string) (string, error) {
	data, ok := a.Images[imageID]
	if !ok {
		return "", fmt.Errorf("изображение %s не найдено", imageID)
	}
	return data, nil
}

// ---------- Публикация / Сохранение ----------

func (a *App) PublishAll() map[string]string {
	out := make(map[string]string)
	for pid, page := range a.Pages {
		out[pid] = a.generateHTML(page)
	}
	return out
}

func (a *App) SaveSite(dirPath string) error {
	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		return fmt.Errorf("не могу создать папку %s: %w", dirPath, err)
	}
	allHTML := a.PublishAll()
	for pageID, htmlData := range allHTML {
		fpath := filepath.Join(dirPath, pageID+".html")
		if err := os.WriteFile(fpath, []byte(htmlData), 0644); err != nil {
			return fmt.Errorf("ошибка записи %s: %w", fpath, err)
		}
	}
	return nil
}

// Сборка финального HTML
func (a *App) generateHTML(p *ExtendedPage) string {
	var sb strings.Builder
	sb.WriteString("<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"UTF-8\"/>\n")
	if p.Meta != "" {
		sb.WriteString(p.Meta + "\n")
	}
	sb.WriteString("<title>" + escape(p.Title) + "</title>\n")
	if p.CSS != "" {
		sb.WriteString("<style>\n" + p.CSS + "\n</style>\n")
	}
	if p.Scripts != "" {
		sb.WriteString("<script>\n" + p.Scripts + "\n</script>\n")
	}
	sb.WriteString("</head>\n<body>\n")

	// HEADER
	sb.WriteString("<header>\n")
	if p.Logo != "" {
		sb.WriteString(`<img src="data:image/*;base64,` + p.Logo + `" alt="logo" style="max-height:50px;"/><br/>`)
	}
	if p.Nav != "" {
		sb.WriteString("<nav>\n" + p.Nav + "\n</nav>\n")
	}
	sb.WriteString("</header>\n")

	// MAIN
	sb.WriteString("<main>\n")
	if p.Main != "" {
		sb.WriteString("<section>\n" + p.Main + "\n</section>\n")
	}
	if p.Article != "" {
		sb.WriteString("<article>\n" + p.Article + "\n</article>\n")
	}
	if p.Aside != "" {
		sb.WriteString("<aside>\n" + p.Aside + "\n</aside>\n")
	}
	for _, s := range p.Sections {
		if s.SectionType == "image" {
			if base64img, ok := a.Images[s.Content]; ok {
				sb.WriteString(`<section class="image-section"><img src="data:image/*;base64,` + base64img + `" alt="image-section"/></section>`)
			} else {
				sb.WriteString("<section>[Image not found]</section>")
			}
		} else {
			sb.WriteString("<section>\n<h3>" + escape(s.SectionType) + "</h3>\n<div>" + s.Content + "</div>\n</section>\n")
		}
	}
	sb.WriteString("</main>\n")

	// FOOTER
	sb.WriteString("<footer>\n")
	if p.Footer != "" {
		sb.WriteString("<div class=\"footer-block\">" + p.Footer + "</div>\n")
	}
	if p.Contact != "" {
		sb.WriteString("<div class=\"contact-block\">" + p.Contact + "</div>\n")
	}
	if p.Social != "" {
		sb.WriteString("<div class=\"social-block\">" + p.Social + "</div>\n")
	}
	if p.Copyright != "" {
		sb.WriteString("<div class=\"copyright-block\">" + p.Copyright + "</div>\n")
	}
	sb.WriteString("</footer>\n")

	sb.WriteString("</body>\n</html>")
	return sb.String()
}

// ---------- Вспомогательные ----------

func escape(s string) string {
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	return s
}

func main() {
	app := NewApp()
	err := wails.Run(&options.App{
		Title:  "LocalConstructor",
		Width:  1280,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Bind: []interface{}{
			app,
		},
	})
	if err != nil {
		println("Ошибка запуска:", err.Error())
	}
}
