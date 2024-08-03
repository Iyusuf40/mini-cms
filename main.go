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
	"github.com/Iyusuf40/goBackendUtils/storage"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

const PORT = "3000"

var defaultUserId = "default_user"

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
	siteRepListForUser, _ := siteRepStore.GetRecordsByField("userId", defaultUserId)
	if len(siteRepListForUser) != 1 {
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
	if segment, exists := siteRep[path]; exists && segment != nil {
		response["error"] = fmt.Sprintf("path: %s already exists", path)
		return c.JSON(http.StatusBadRequest, response)
	}

	updateSiteRepInStore(defaultUserId, path, newBodySiteRep)

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

	updateSiteRepInStore(defaultUserId, path, nil)

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
	payloadHeader, _ := data["header"].(map[string]any)
	prevHeader := getHeaderFromSiteRepInStore()

	payloadFooter, _ := data["footer"].(map[string]any)
	prevFooter := getFooterFromSiteRepInStore()

	updateSiteRepInStore(defaultUserId, path, data[path].(map[string]any))

	if !reflect.DeepEqual(prevHeader, payloadHeader) {
		if header, ok := data["header"].(map[string]any); ok {
			updateSiteRepInStore(defaultUserId, "header", header)
		} else {
			updateSiteRepInStore(defaultUserId, "header", nil)
		}
		rebuildAllPaths()
	} else {
		fmt.Println("did not enter")
	}

	if !reflect.DeepEqual(prevFooter, payloadFooter) {
		if footer, ok := data["footer"].(map[string]any); ok {
			updateSiteRepInStore(defaultUserId, "footer", footer)
		} else {
			updateSiteRepInStore(defaultUserId, "footer", nil)
		}
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
	siteRepListForUser, _ := siteRepStore.GetRecordsByField("userId", defaultUserId)
	if len(siteRepListForUser) == 1 {
		return siteRepListForUser[0]
	}
	panic("getSiteRepFromStore: no sitrep in db")
}

func updateSiteRepInStore(userId, field string, value map[string]any) {
	id := siteRepStore.GetIdByFieldAndValue("userId", userId)

	if id == "" {
		panic("updateSiteRepInStore: no siterep for user with userId " + userId)
	}

	siteRepStore.Update(id, storage.UpdateDesc{Field: field, Value: value})

	siteRepStore.Commit()
}

func getHeaderFromSiteRepInStore() map[string]any {
	siteRepListForUser, _ := siteRepStore.GetRecordsByField("userId", defaultUserId)
	if len(siteRepListForUser) != 1 {
		panic("getHeaderFromSiteRepInStore: no siterep in db")
	}

	siteRepForUser := siteRepListForUser[0]
	if header, ok := siteRepForUser["header"].(map[string]any); ok {
		return header
	}
	return nil
}

func getFooterFromSiteRepInStore() map[string]any {
	siteRepListForUser, _ := siteRepStore.GetRecordsByField("userId", defaultUserId)

	if len(siteRepListForUser) != 1 {
		panic("getFooterFromSiteRepInStore: no siterep in db")
	}
	siteRepForUser := siteRepListForUser[0]
	if footer, ok := siteRepForUser["footer"].(map[string]any); ok {
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
