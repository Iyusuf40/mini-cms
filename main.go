package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
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

	e.PUT("/", updatePath)
	e.PUT("/:", updatePath)

	e.PUT("/header", updateHeader)

	e.PUT("/footer", updateFooter)

	e.GET("/siterep", getSiteRep)

	e.POST("/image/:imageId", addImage)

	e.Logger.Fatal(e.Start(":" + PORT))
}

func serveRoot(c echo.Context) error {
	// read index.html at root and send back
	// if it does not exist send empty html
	// send back index.js too
	// index.js should add to the html element a collapsible
	// to add nodes

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

	if strings.Contains(path, ".") {
		return c.File(dirWIthPath)
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

	path, ok := data["path"].(string)

	if !ok {
		response["error"] = "invalid path"
		return c.JSON(http.StatusBadRequest, response)
	}

	SITE_REP[path] = map[string]any{}

	// create directory at path
	// build index.html in path

	response["message"] = fmt.Sprintf("path: /%s created", path)

	return c.JSON(http.StatusCreated, response)
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

	if err != nil {
		response["error"] = err.Error()
		return c.JSON(http.StatusBadRequest, response)
	}

	response["message"] = fmt.Sprintf("path: %s updated", path)

	return c.JSON(http.StatusOK, response)
}

func updateHeader(c echo.Context) error {

	return nil
}

func updateFooter(c echo.Context) error {

	return nil
}

func getSiteRep(c echo.Context) error {
	return c.JSON(http.StatusOK, getSiteRepFromStore())
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

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}
