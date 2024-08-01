package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"strings"

	"github.com/Iyusuf40/goBackendUtils"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

const PORT = "3000"

var backendUtils = &goBackendUtils.Utils{}

var SITE_REP = make(map[string]map[string]any)
var siteRepStore, _ = backendUtils.GetDB_Engine("file", "siterep", "siterep")

func initSiteRep() {
	updatedSiteRepList, _ := siteRepStore.GetRecordsByField("updated", true)
	if len(updatedSiteRepList) != 1 {
		updatedSiteRepList, _ = siteRepStore.GetRecordsByField("title", "mini-cms")
	}
	if len(updatedSiteRepList) != 1 {
		siteRepStore.Save(DefaultSiteRep)
		siteRepStore.Commit()
	}
}

func main() {
	wait := make(chan int)
	initSiteRep()
	createDirectoryRecursivelyIfNotExist("images")

	go func() {
		ServeSite()
	}()

	<-wait
}

func ServeSite() {
	e := echo.New()
	e.Use(middleware.Recover())

	e.GET("/", serveRoot)
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

func serveRoot(c echo.Context) error {

	if fileExists("./index.html") {
		return c.File("index.html")
	}

	err := BuildHtml("/", getSiteRepFromStore())
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		return err
	}
	return c.File("index.html")
}

func servePath(c echo.Context) error {
	path := c.Param("path")

	dirWIthPath, err := getAbsolutePathRelativeToCWD(path)

	if err != nil {
		return err
	}

	if strings.Contains(path, ".") { // css and js files
		segments := strings.Split(path, "/")
		return c.File(segments[len(segments)-1])
	}

	if fileExists(dirWIthPath) {
		return c.File(dirWIthPath)
	}

	if fileExists(path) {
		return c.File(path)
	}

	// look at index.html at path directory and send back
	return c.File(dirWIthPath + "/index.html")
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

	siteRep := getSiteRepFromStore()
	if _, exists := siteRep[path]; exists {
		response["error"] = fmt.Sprintf("path: %s already exists", path)
		return c.JSON(http.StatusBadRequest, response)
	}

	updateSiteRepInStore(path, map[string]any{
		"tag": "body",
		"children": map[string]any{
			"0": map[string]any{
				"tag":    "main",
				"nodeId": "0",
			},
		}},
	)

	siteRep = getSiteRepFromStore()

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

	siteRep := getSiteRepFromStore()
	if _, exists := siteRep[path]; !exists {
		response["error"] = fmt.Sprintf("path: %s does not exists", path)
		return c.JSON(http.StatusBadRequest, response)
	}

	updateSiteRepInStore(path, nil)

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

	err := BuildHtml(path, data)
	delete(data, "path")
	updateSiteRepInStore(path, data[path].(map[string]any))

	prevHeader := getHeaderFromSiteRepInStore()
	if header, ok := data["header"].(map[string]any); ok {
		if prevHeader == nil || !reflect.DeepEqual(prevHeader, header) {
			updateSiteRepInStore("header", header)
			rebuildAllPaths()
		}
	} else if prevHeader != nil { // header deleted
		updateSiteRepInStore("header", nil)
		rebuildAllPaths()
	}

	prevFooter := getFooterFromSiteRepInStore()
	if footer, ok := data["footer"].(map[string]any); ok {
		if prevFooter == nil || !reflect.DeepEqual(prevFooter, footer) {
			updateSiteRepInStore("footer", footer)
			rebuildAllPaths()
		}
	} else if prevFooter != nil { // footer deleted
		updateSiteRepInStore("footer", nil)
		rebuildAllPaths()
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

	siterep := getSiteRepFromStore()

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

func getSiteRepFromStore() map[string]any {
	updatedSiteRepList, _ := siteRepStore.GetRecordsByField("updated", true)
	if len(updatedSiteRepList) == 1 {
		return updatedSiteRepList[0]
	}
	updatedSiteRepList, _ = siteRepStore.GetRecordsByField("title", "mini-cms")
	if len(updatedSiteRepList) == 1 {
		return updatedSiteRepList[0]
	}
	panic("getSiteRepFromStore: no sitrep in db")
}

func updateSiteRepInStore(field string, value map[string]any) {
	updatedSiteRepList, _ := siteRepStore.GetRecordsByField("updated", true)
	if len(updatedSiteRepList) != 1 {
		updatedSiteRepList, _ = siteRepStore.GetRecordsByField("title", "mini-cms")
	}
	if len(updatedSiteRepList) != 1 {
		panic("updateSiteRepInStore: no siterep in db")
	}
	updatedSiteRep := updatedSiteRepList[0]
	updatedSiteRep[field] = value

	if value == nil {
		delete(updatedSiteRep, field)
	}

	updatedSiteRep["updated"] = true
	deletePreviousSiteRep()
	siteRepStore.Save(updatedSiteRep)
	siteRepStore.Commit()
}

func deletePreviousSiteRep() {
	id := siteRepStore.GetIdByFieldAndValue("updated", true)
	if id == "" {
		id = siteRepStore.GetIdByFieldAndValue("title", "mini-cms")
	}
	if id == "" {
		panic("deletePreviousSiteRep: no sitrep in db")
	}
	siteRepStore.Delete(id)
}

func getHeaderFromSiteRepInStore() map[string]any {
	updatedSiteRepList, _ := siteRepStore.GetRecordsByField("updated", true)
	if len(updatedSiteRepList) != 1 {
		updatedSiteRepList, _ = siteRepStore.GetRecordsByField("title", "mini-cms")
	}
	if len(updatedSiteRepList) != 1 {
		panic("getHeaderFromSiteRepInStore: no siterep in db")
	}
	updatedSiteRep := updatedSiteRepList[0]
	if header, ok := updatedSiteRep["header"].(map[string]any); ok {
		return header
	}
	return nil
}

func getFooterFromSiteRepInStore() map[string]any {
	updatedSiteRepList, _ := siteRepStore.GetRecordsByField("updated", true)
	if len(updatedSiteRepList) != 1 {
		updatedSiteRepList, _ = siteRepStore.GetRecordsByField("title", "mini-cms")
	}
	if len(updatedSiteRepList) != 1 {
		panic("getFooterFromSiteRepInStore: no siterep in db")
	}
	updatedSiteRep := updatedSiteRepList[0]
	if footer, ok := updatedSiteRep["footer"].(map[string]any); ok {
		return footer
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
