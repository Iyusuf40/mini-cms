package main

import (
	"fmt"
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

func main() {
	wait := make(chan int)

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

	e.GET("/siterep", getSiteRep)

	e.Logger.Fatal(e.Start(":" + PORT))
}

func serveRoot(c echo.Context) error {
	// read index.html at root and send back
	// if it does not exist send empty html
	// send back index.js too
	// index.js should add to the html element a collapsible
	// to add nodes

	// err := BuildHtml("/", EgSiteRep)
	// if err != nil {
	// 	fmt.Fprintln(os.Stderr, err.Error())
	// 	return err
	// }
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

	// look at index.html at path directory and send back
	return c.File(dirWIthPath + "/index.html")
}

func addPath(c echo.Context) error {
	body := backendUtils.GetBodyInMap(c)
	path, ok := body["data"].(map[string]any)["path"].(string)

	response := map[string]any{}

	if !ok {
		response["error"] = "Invalid path"
		return c.JSON(http.StatusBadRequest, response)
	}

	SITE_REP[path] = map[string]any{}

	// create directory at path
	// build index.html in path

	response["message"] = fmt.Sprintf("path: /%s created", path)

	return c.JSON(http.StatusCreated, response)
}

func updatePath(c echo.Context) error {
	// if update is at header or footer recursively rebuild changed
	// section to all nested paths
	return nil
}

func getSiteRep(c echo.Context) error {
	return c.JSON(http.StatusOK, SITE_REP)
}

func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}
