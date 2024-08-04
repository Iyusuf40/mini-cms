package main

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/Iyusuf40/goBackendUtils"
	"github.com/Iyusuf40/goBackendUtils/storage"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

const PORT = "3000"
const imagesDirectory = "images/"

var defaultUserId = "default_user"
var defaultProjectName = "default_project"

var backendUtils = &goBackendUtils.Utils{}

var SITE_REP = make(map[string]map[string]any)
var siteRepStore, _ = backendUtils.GetDB_Engine("file", "siterep", "siterep")

var newBodySiteRep = map[string]any{
	"tag": "body",
	"children": map[string]any{
		"0": map[string]any{
			"tag":    "main",
			"nodeId": "0",
		},
	}}

func initSiteRep() {
	saveProject(defaultUserId, defaultProjectName)
}

func main() {
	wait := make(chan int)
	initSiteRep()
	createDirectoryRecursivelyIfNotExist(imagesDirectory)

	go func() {
		ServeSite()
	}()

	<-wait
}

func ServeSite() {
	e := echo.New()
	e.Use(middleware.Recover())

	e.GET("/", serveRoot)
	e.GET("/project", serveProjectRoot)
	e.GET("/:path", servePath)

	e.POST("/", addPath)
	e.POST("/:path", addPath)

	e.DELETE("/:path", deletePath)

	e.PUT("/", updatePath)
	e.PUT("/:", updatePath)

	e.GET("/siterep", getSiteRep)
	e.GET("/siterep/:path", getSiteRep)

	e.POST("/image/:imageId", addImage)

	e.Logger.Fatal(e.Start(":" + PORT))
}

func getProjectBase(c echo.Context) string {
	userId, projectName := getUserIdAndProjectFromQueryParams(c)
	return filepath.Join(string(filepath.Separator), userId, projectName)
}

func getUserIdAndProjectFromQueryParams(c echo.Context) (string, string) {
	userId := c.QueryParam("userId")
	projectName := c.QueryParam("projectName")
	if userId == "" || projectName == "" {
		return getUserIdAndProjectFromPath(c)
	}
	return userId, projectName
}

func getUserIdAndProjectFromPath(c echo.Context) (string, string) {
	return getUserIdAndProjectFromPathString(c.Request().URL.Path)
}

func getUserIdAndProjectFromPathString(path string) (string, string) {
	if strings.HasPrefix(path, "/") {
		path = strings.Replace(path, "/", "", 1)
	}

	segments := strings.Split(path, "/")

	if len(segments) < 2 {
		return "", ""
	}
	userId, projectName := segments[0], segments[1]
	return userId, projectName
}

func serveRoot(c echo.Context) error {
	return c.File(filepath.Join("index.html"))
}

func serveProjectRoot(c echo.Context) error {

	projectBase := getProjectBase(c)

	if fileExists(filepath.Join(projectBase, "index.html")) {
		return c.File(filepath.Join(projectBase, "index.html"))
	}

	userId, projectName := getUserIdAndProjectFromQueryParams(c)

	err := BuildHtml(projectBase, getSiteRepFromStore(userId, projectName))
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		return err
	}
	// serve recently built index.html
	return c.Redirect(http.StatusMovedPermanently, filepath.Join(projectBase))
}

func servePath(c echo.Context) error {
	path := c.Param("path")

	dirWIthPath, err := getAbsolutePathRelativeToCWD(path)

	if err != nil {
		return err
	}

	if fileExists(dirWIthPath) {
		return c.File(dirWIthPath)
	}

	if fileExists(path) {
		return c.File(path)
	}

	if strings.Contains(path, ".") { // css and js files
		segments := strings.Split(path, "/")
		return c.File(segments[len(segments)-1])
	}

	// look at index.html at path directory and send back
	return c.File(dirWIthPath)
}

func addImage(c echo.Context) error {
	fileSHA256HexString := c.Param("imageId")
	// Read form file
	file, err := c.FormFile("image")
	if err != nil {
		return err
	}

	// Source
	image, err := file.Open()
	if err != nil {
		return err
	}
	defer image.Close()

	dst, err := os.Create("images/" + fileSHA256HexString)
	if err != nil {
		return err
	}

	defer dst.Close()

	// Copy
	if fileSize, err := io.Copy(dst, image); err != nil || fileSize > 5000000 { //5MB
		if err == nil {
			return c.JSON(http.StatusBadRequest, echo.Map{
				"error": "Image too large",
			})
		}
		return err
	}

	return c.JSON(http.StatusOK, echo.Map{
		"message": "Image uploaded successfully",
	})
}

func addPath(c echo.Context) error {
	body := backendUtils.GetBodyInMap(c)
	data, ok := body["data"].(map[string]any)

	response := map[string]any{}

	if !ok {
		response["error"] = "data not in payload"
		return c.JSON(http.StatusBadRequest, response)
	}

	path, _ := data["path"].(string)

	if path == "" {
		response["error"] = "path cannot be empty"
		return c.JSON(http.StatusBadRequest, response)
	}

	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	userId, projectName := getUserIdAndProjectFromQueryParams(c)

	if !strings.HasPrefix(path, getProjectBase(c)) {
		panic("addPath: project base - path mismatch")
	}

	siteRep := getSiteRepFromStore(userId, projectName)
	if segment, exists := siteRep[path]; exists && segment != nil {
		response["error"] = fmt.Sprintf("path: %s already exists", path)
		return c.JSON(http.StatusBadRequest, response)
	}

	updateSiteRepInStore(userId, projectName, path, newBodySiteRep)

	siteRep = getSiteRepFromStore(userId, projectName)

	BuildHtml(path, siteRep)

	response["message"] = fmt.Sprintf("path: /%s created", path)

	return c.JSON(http.StatusCreated, response)
}

func deletePath(c echo.Context) error {
	body := backendUtils.GetBodyInMap(c)
	data, ok := body["data"].(map[string]any)

	response := map[string]any{}

	if !ok {
		response["error"] = "data not in payload"
		return c.JSON(http.StatusBadRequest, response)
	}

	path, _ := data["path"].(string)

	if path == "" || path == "/" || strings.Contains(path, ".") {
		response["error"] = "invalid path"
		return c.JSON(http.StatusBadRequest, response)
	}

	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	userId, projectName := getUserIdAndProjectFromQueryParams(c)

	if !strings.HasPrefix(path, getProjectBase(c)) {
		panic("deletePath: project base - path mismatch")
	}

	siteRep := getSiteRepFromStore(userId, projectName)
	if _, exists := siteRep[path]; !exists {
		response["error"] = fmt.Sprintf("path: %s does not exists", path)
		return c.JSON(http.StatusBadRequest, response)
	}

	updateSiteRepInStore(userId, projectName, path, nil)

	cwd, _ := os.Getwd()

	os.RemoveAll(filepath.Join(cwd, path))

	response["message"] = fmt.Sprintf("path: /%s deleted", path)

	return c.JSON(http.StatusOK, response)
}

func updatePath(c echo.Context) error {

	body := backendUtils.GetBodyInMap(c)
	data, ok := body["data"].(map[string]any)

	response := map[string]any{}

	if !ok {
		response["error"] = "data not in payload"
		return c.JSON(http.StatusBadRequest, response)
	}

	path, ok := data["path"].(string)

	if !ok {
		response["error"] = "invalid path"
		return c.JSON(http.StatusBadRequest, response)
	}

	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}

	userId, projectName := getUserIdAndProjectFromQueryParams(c)

	if !strings.HasPrefix(path, getProjectBase(c)) {
		panic("addPath: project base - path mismatch")
	}

	err := BuildHtml(path, data)
	delete(data, "path")

	payloadHeader, _ := data["header"].(map[string]any)
	prevHeader := getHeaderFromSiteRepInStore(userId, projectName)

	payloadFooter, _ := data["footer"].(map[string]any)
	prevFooter := getFooterFromSiteRepInStore(userId, projectName)

	updateSiteRepInStore(userId, projectName, path, data[path].(map[string]any))

	if !reflect.DeepEqual(prevHeader, payloadHeader) {
		if header, ok := data["header"].(map[string]any); ok {
			updateSiteRepInStore(userId, projectName, "header", header)
		} else {
			updateSiteRepInStore(userId, projectName, "header", nil)
		}
		rebuildAllPaths(userId, projectName)
	}

	if !reflect.DeepEqual(prevFooter, payloadFooter) {
		if footer, ok := data["footer"].(map[string]any); ok {
			updateSiteRepInStore(userId, projectName, "footer", footer)
		} else {
			updateSiteRepInStore(userId, projectName, "footer", nil)
		}
		rebuildAllPaths(userId, projectName)
	}

	if err != nil {
		response["error"] = err.Error()
		return c.JSON(http.StatusBadRequest, response)
	}

	response["message"] = fmt.Sprintf("path: %s updated", path)

	return c.JSON(http.StatusOK, response)
}

func getSiteRep(c echo.Context) error {
	path := c.QueryParam("path")

	siteRepOfPath := map[string]map[string]any{}

	userId, projectName := getUserIdAndProjectFromPathString(path)

	siterep := getSiteRepFromStore(userId, projectName)

	if segment, ok := siterep[path].(map[string]any); ok {
		siteRepOfPath[path] = segment
	}

	if footer, ok := siterep["footer"].(map[string]any); ok {
		siteRepOfPath["footer"] = footer
	}

	if header, ok := siterep["header"].(map[string]any); ok {
		siteRepOfPath["header"] = header
	}

	c.Response().Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	return c.JSON(http.StatusOK, siteRepOfPath)
}

func getSiteRepFromStore(userId, projectName string) map[string]any {
	project, err := getProject(userId, projectName)
	if err == nil {
		return project
	}
	fmt.Fprintln(os.Stderr, err.Error())
	panic("getSiteRepFromStore: got error: " + err.Error())
}

func updateSiteRepInStore(userId, projectName, field string, value map[string]any) {
	id := siteRepStore.GetIdByFieldAndValue("userIdProjectName",
		fmt.Sprintf("%s-%s", userId, projectName))

	if id == "" {
		panic("updateSiteRepInStore: no siterep for user with userId " + userId)
	}

	siteRepStore.Update(id, storage.UpdateDesc{Field: field, Value: value})

	siteRepStore.Commit()
}

func getHeaderFromSiteRepInStore(userId, projectName string) map[string]any {
	siteRep := getSiteRepFromStore(userId, projectName)
	if len(siteRep) == 0 {
		panic("getHeaderFromSiteRepInStore: no siterep in db")
	}

	if header, ok := siteRep["header"].(map[string]any); ok {
		return header
	}
	return nil
}

func getFooterFromSiteRepInStore(userId, projectName string) map[string]any {
	siteRep := getSiteRepFromStore(userId, projectName)

	if len(siteRep) == 1 {
		panic("getFooterFromSiteRepInStore: no siterep in db")
	}

	if footer, ok := siteRep["footer"].(map[string]any); ok {
		return footer
	}
	return nil
}

func saveProject(userId, projectName string) error {
	project, _ := getProject(userId, projectName)

	if len(project) != 0 {
		return errors.New("saveProject: project with name " + projectName + " already exists")
	}

	save := func() {
		siterep := getDefaultSiteRep(userId, projectName)
		siterep["userId"] = userId
		siterep["projectName"] = projectName
		siterep["userIdProjectName"] = fmt.Sprintf("%s-%s", userId, projectName)
		siteRepStore.Save(siterep)
		siteRepStore.Commit()
	}

	save()
	return nil
}

func getProject(userId, projectName string) (map[string]any, error) {
	projectListForUser, _ := siteRepStore.GetRecordsByField("userIdProjectName",
		fmt.Sprintf("%s-%s", userId, projectName))
	project := findProjectWithProjectName(projectListForUser, projectName)

	if len(project) == 0 {
		return nil, errors.New("getProject: no project found for" + userId + " " + projectName)
	}

	return project, nil
}

func findProjectWithProjectName(projects []map[string]any, projectName string) map[string]any {
	for _, project := range projects {
		if project["projectName"].(string) == projectName {
			return project
		}
	}
	return nil
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}
