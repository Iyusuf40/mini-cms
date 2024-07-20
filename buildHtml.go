package main

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
)

var stylePropsAndItsCss = [][2]string{
	{"fontColor", "color"},
	{"fontSize", "font-size"},
	{"width", "width"},
	{"height", "height"},
	{"backgroundColor", "background-color"},
	{"horizontal", "display"},
	{"vertical", "display"},
	{"gap", "gap"},
	{"left", "text-align"},
	{"center", "text-align"},
	{"right", "text-align"},
	{"shiftTop", "top"},
	{"shiftBottom", "bottom"},
	{"shiftLeft", "left"},
	{"shiftRight", "right"},
	{"margin", "margin"},
	{"padding", "padding"},
	{"paddingTop", "padding-top"},
	{"paddingBottom", "padding-bottom"},
	{"paddingLeft", "padding-left"},
	{"paddingRight", "padding-right"},
	{"edgeRounding", "border-radius"},
}

var htmlAttributesToSet = []string{
	"nodeId",
	"parentNodeId",
	"src",
	"alt",
}

// used to identify nodes and add collapsible editor to it
var nodeClass = "__node"
var htmlElementNodeId = "0"

// var EgSiteRep = map[string]any{
// 	"title": "mini-cms",
// 	"children": map[string]any{
// 		"body": map[string]any{
// 			"nodeId": "timestamp_0",
// 			"children": map[string]any{
// 				"header": map[string]any{
// 					"nodeId":          "timestamp_1",
// 					"parentNodeId":    "timestamp_0",
// 					"type":            "container",
// 					"text":            "link 1",
// 					"backgroundColor": "green",
// 					"padding":         "10",
// 					"width":           "500",
// 					"vertical":        true,
// 					"children": map[string]any{
// 						"0": map[string]any{
// 							"nodeId":       "timestamp_2",
// 							"parentNodeId": "timestamp_1",
// 							"type":         "link",
// 							"url":          "http://test.com",
// 							"fontColor":    "red",
// 							"width":        "20",
// 							"height":       "20",
// 							// "backgroundColor": "black",
// 							"fontSize":   "30",
// 							"horizontal": true,
// 							"vertical":   false,
// 							"left":       true,
// 							"center":     false,
// 							"right":      false,
// 							"children": map[string]any{
// 								"0": map[string]any{
// 									"nodeId":          "timestamp_3",
// 									"parentNodeId":    "timestamp_2",
// 									"type":            "text",
// 									"url":             "http://test.com",
// 									"text":            "nested 1",
// 									"fontColor":       "cyan",
// 									"width":           "20",
// 									"height":          "20",
// 									"backgroundColor": "red",
// 									"fontSize":        "30",
// 									"horizontal":      true,
// 									"vertical":        false,
// 									"left":            true,
// 									"center":          false,
// 									"right":           false,
// 								},
// 								"1": map[string]any{
// 									"nodeId":          "timestamp_4",
// 									"parentNodeId":    "timestamp_2",
// 									"type":            "text",
// 									"url":             "http://not-test.com",
// 									"text":            "nested 2",
// 									"fontColor":       "cyan",
// 									"width":           "20",
// 									"height":          "20",
// 									"backgroundColor": "red",
// 									"fontSize":        "30",
// 									"horizontal":      true,
// 									"vertical":        false,
// 									"left":            true,
// 									"center":          false,
// 									"right":           false,
// 									"shiftTop":        "10",
// 									"shiftLeft":       "10",
// 									"paddingTop":      "10",
// 									"paddingLeft":     "10",
// 									"edgeRounding":    "20",
// 								}},
// 						},
// 						"1": map[string]any{
// 							"nodeId":          "timestamp_5",
// 							"parentNodeId":    "timestamp_1",
// 							"type":            "text",
// 							"text":            "text 1",
// 							"fontColor":       "blue",
// 							"width":           "40",
// 							"height":          "40",
// 							"backgroundColor": "yellow",
// 							"fontSize":        "30",
// 							"horizontal":      true,
// 							"vertical":        false,
// 							"left":            true,
// 							"center":          false,
// 							"right":           false,
// 						},
// 					},
// 				}},
// 		},
// 	},
// }

var EgSiteRep = map[string]any{
	"title":  "mini-cms",
	"tag":    "body",
	"nodeId": "0",
}

func BuildHtml(path string, siteRep map[string]any) error {
	err := createDirectoryRecursivelyIfNotExist(path)
	if err != nil {
		return err
	}
	title, _ := siteRep["title"].(string)

	html := openHtml(title)

	html = fmt.Sprintf("%s\n%s\n", html, buildHeader(siteRep))

	html = fmt.Sprintf("%s\n%s\n", html, buildPathHtml(siteRep, path))

	html = fmt.Sprintf("%s\n%s\n", html, buildFooter(siteRep))

	html = fmt.Sprintf("%s\n%s\n", html, closeHtml())

	path, err = getAbsolutePathRelativeToCWD(path)

	if err != nil {
		return err
	}

	err = writeHtmlToPath(html, path+"/index.html")
	return err
}

func createDirectoryRecursivelyIfNotExist(path string) error {

	fullPath, err := getAbsolutePathRelativeToCWD(path)

	if err != nil {
		return err
	}

	const perm = 0744

	err = os.MkdirAll(fullPath, perm)
	if err != nil {
		return err
	}

	return nil
}

func getAbsolutePathRelativeToCWD(path string) (string, error) {
	cwd, err := os.Getwd()
	if err != nil {
		return "", err
	}

	fullPath := filepath.Join(cwd, path)
	return fullPath, nil
}

func writeHtmlToPath(html, path string) error {

	err := os.WriteFile(path, []byte(html), 0644)
	if err != nil {
		return err
	}

	return nil
}

func convertNodeToHtml(node map[string]any) string {
	tag := ""
	if nodeTag, ok := node["tag"].(string); ok {
		tag = nodeTag
	}
	openTag := makeOpenTag(tag, node)
	content := getContent(node)
	children := getChildrenHtml(node)
	extendedHtml := getExtendedHtml(node)
	closeTag := makeCloseTag(tag)
	return fmt.Sprintf("%s\n%s\n%s\n%s\n%s", openTag, content, children, extendedHtml, closeTag)
}

func buildHeader(node map[string]any) string {
	if header, ok := node["header"].(map[string]any); ok {
		header["tag"] = "header"
		return convertNodeToHtml(header)
	}
	return ""
}

func buildFooter(node map[string]any) string {
	if header, ok := node["footer"].(map[string]any); ok {
		header["tag"] = "footer"
		return convertNodeToHtml(header)
	}
	return ""
}

func buildPathHtml(node map[string]any, path string) string {
	if body, ok := node[path].(map[string]any); ok {
		body["tag"] = "body"
		return convertNodeToHtml(body)
	}
	return ""
}

func getContent(node map[string]any) string {
	if text, ok := node["text"].(string); ok {
		return fmt.Sprintf(`<p>%s</p>`, text)
	}
	return ""
}

func getChildrenHtml(node map[string]any) string {
	children, ok := node["children"].(map[string]any)

	if !ok {
		return ""
	}

	sortedKeys := getSortedKeysOfMap(children)

	htmlContent := ""

	for _, key := range sortedKeys {
		childNode, ok := children[key].(map[string]any)
		if !ok {
			fmt.Fprintln(os.Stderr, "getChildrenHtml: childNode not map[string]any")
			return ""
		}
		htmlContent = fmt.Sprintf("%s\n%s", htmlContent, convertNodeToHtml(childNode))
	}

	return htmlContent
}

func getSortedKeysOfMap(mapp map[string]any) []string {
	keys := make([]string, len(mapp))

	i := 0
	for key := range mapp {
		keys[i] = key
		i++
	}

	sort.Strings(keys)

	return keys
}

func getExtendedHtml(node map[string]any) string {
	if extendedHtml, ok := node["extendedHtml"].(string); ok {
		return extendedHtml
	}
	return ""
}

func makeOpenTag(tag string, node map[string]any) string {
	if tag == "" {
		tag = `div`
	}

	elementStart := fmt.Sprintf(`<%s `, tag)
	styles := getInlineStyle(node)
	elementStart = fmt.Sprintf(`%s %s`, elementStart, styles)
	attributes := getAttributes(node)
	extendedClass, _ := node["extendedClass"].(string)
	elementStart = fmt.Sprintf(`%s %s class="%s %s">`, elementStart, attributes, nodeClass, extendedClass)
	return elementStart
}

func makeCloseTag(tag string) string {
	if tag == "" {
		tag = `div`
	}

	return fmt.Sprintf(`</%s>`, tag)
}

func getInlineStyle(node map[string]any) string {

	stylesAndValues := ``

	for _, stylePropAndItsCss := range stylePropsAndItsCss {
		styleProp := stylePropAndItsCss[0]
		itsCss := stylePropAndItsCss[1]
		if value, ok := node[styleProp].(string); ok {
			switch styleProp {
			case "width", "height":
				stylesAndValues = fmt.Sprintf(`%s min-%s: %spx;`, stylesAndValues, itsCss, addPxIfNotSet(value))
				stylesAndValues = fmt.Sprintf(`%s %s: fit-content;`, stylesAndValues, itsCss)
			case "shiftTop", "shiftBottom", "shiftRight", "shiftLeft",
				"paddingTop", "paddingBottom", "paddingRight", "paddingLeft",
				"edgeRounding", "padding", "margin", "gap":
				stylesAndValues = fmt.Sprintf(`%s %s: %spx;`, stylesAndValues, itsCss, addPxIfNotSet(value))
			default:
				stylesAndValues = fmt.Sprintf(`%s %s: %s;`, stylesAndValues, itsCss, value)
			}

		} else if value, ok := node[styleProp].(bool); ok && value {
			switch styleProp {
			case "horizontal":
				stylesAndValues = fmt.Sprintf(`%s %s: %s;`, stylesAndValues, itsCss, "flex")
				stylesAndValues = fmt.Sprintf(`%s flex-direction: %s;`, stylesAndValues, "row")
				stylesAndValues = fmt.Sprintf(`%s %s: %s;`, stylesAndValues, "gap", "1rem")
				stylesAndValues = fmt.Sprintf(`%s %s: %s;`, stylesAndValues, "flex-wrap", "wrap")
			case "vertical":
				stylesAndValues = fmt.Sprintf(`%s %s: %s;`, stylesAndValues, itsCss, "flex")
				stylesAndValues = fmt.Sprintf(`%s flex-direction: %s;`, stylesAndValues, "column")
				stylesAndValues = fmt.Sprintf(`%s %s: %s;`, stylesAndValues, "gap", "1rem")
				stylesAndValues = fmt.Sprintf(`%s %s: %s;`, stylesAndValues, "flex-wrap", "wrap")
			case "left":
				stylesAndValues = fmt.Sprintf(`%s %s: %s;`, stylesAndValues, itsCss, "left")
			case "right":
				stylesAndValues = fmt.Sprintf(`%s %s: %s;`, stylesAndValues, itsCss, "right")
			case "center":
				stylesAndValues = fmt.Sprintf(`%s %s: %s;`, stylesAndValues, itsCss, "center")
			}
		}
	}

	if extendedStyle, ok := node["extendedStyle"].(string); ok {
		stylesAndValues = fmt.Sprintf(`%s %s;`, stylesAndValues, extendedStyle)
	}

	style := fmt.Sprintf(`style="position: relative; %s"`, stylesAndValues)

	return style
}

func addPxIfNotSet(cssVal string) string {
	_, err := strconv.Atoi(cssVal)
	if err != nil {
		return cssVal
	}
	return fmt.Sprintf("%spx", cssVal)
}

func getAttributes(node map[string]any) string {
	attr := ``

	for _, attribute := range htmlAttributesToSet {
		if value, ok := node[attribute].(string); ok {
			attr = fmt.Sprintf(`%s %s="%s"`, attr, attribute, value)
		}
	}

	return attr
}

func openHtml(title string) string {
	// TO-DO
	// add web site desc e.g
	// <meta
	// 		name="description"
	// 		content="Web app used to keep records"
	// />

	// TO-DO
	// update favicon.ico path
	return fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="/favicon.ico" />
		<link rel="stylesheet" href="styles.css">
		<meta name="viewport" content="width=device-width, initial-scale=1" />

		<title>%s</title>
	</head>
	<body nodeId="%s" class="%s">`,
		title, htmlElementNodeId, nodeClass)
}

func closeHtml() string {
	return "\t</body>\n<script src=\"index.js\"></script>\n</html>"
}
