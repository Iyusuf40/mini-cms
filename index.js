const collapsibleFieldElementTypeAction = [
    ["set content", "textarea", setContent, "text"],
    ["set url", "input:text", setUrl, "href"],
    ["add child", "button", addChild],
    ["add node before", "button", addNodeBefore],
    ["add node after", "button", addNodeAfter],
    ["duplicate", "button", duplicateNode],
    ["delete node", "button", deleteNode],
    ["add heading", "button", addHeading],
    ["add subheading", "button", addSubHeading],
    ["increase font size", "button", increaseFontSize],
    ["decrease font size", "button", decreaseFontSize],
    ["select font", `select:Arial:Verdana:Times New Roman:Roboto Mono:
        Tahoma:Trebuchet MS:Georgia:EB Garamond:
        Abhaya Libre:Courier New`, setFont],
    ["font color", "input:color", setFontColor],
    ["font weight", "input:radio:lighter:normal:bold", setFontWeight],
    ["increase width", "button", increaseWidth],
    ["decrease width", "button", decreaseWidth],
    ["width", "input:text", setWidth, "width"],
    ["increase height", "button", increaseHeight],
    ["decrease height", "button", decreaseHeight],
    ["height", "input:text", setHeight, "height"],
    ["background color", "input:color", setBackgroundColor],
    ["orientation", "input:radio:vertical:horizontal", setOrientation],
    ["gap", "input:text", setGap, "gap"],
    ["align", "input:radio:left:center:right", setTextAlignment],
    ["display", "input:radio:block:inline-block", setInlineOrBlock],
    ["position", "input:radio:start:middle:end", setSelfAlignment],
    ["shift up", "button", shiftUp],
    ["shift down", "button", shiftDown],
    ["shift left", "button", shiftLeft],
    ["shift right", "button", shiftRight],
    ["margin", "input:text", setMargin, "margin"],
    ["padding", "input:text", setPadding, "padding"],
    ["paddingTop", "input:text", setPaddingTop, "paddingTop"],
    ["paddingBottom", "input:text", setPaddingBottom, "paddingBottom"],
    ["paddingLeft", "input:text", setPaddingLeft, "paddingLeft"],
    ["paddingRight", "input:text", setPaddingRight, "paddingRight"],
    ["edgeRounding", "input:text", setEdgeRounding, "edgeRounding"],
    ["set attribute", "input:text", setCustomAttribute],
    ["make node expandable", "button", makeNodeExpandable],
    ["extend Css", "input:text", setExtendCss, "extendedStyle"],
    ["extend Html", "textarea", setExtendHtml, "extendedHtml"],
    ["add script", "textarea", addScript, "addScript"],
    ["step", "input:text", setStep, "STEP"],
    ["add path", "input:text", addPath],
    ["delete path", "button", deletePath],
]

const headerFooterDesc = [
    ["add header", "button", addHeader],
    ["add footer", "button", addFooter]
]

const mainNodeId = "0"
const headerNodeId = "-1"
const footerNodeId = "1"

const elementDescriptionElId = "elementDescriptionElId"

let STEP = 5
var SITE_REP = null
var lastColorSent = ""

let increaseMillisecondsDifference = 0

var baseUrl = "http://localhost:3000"

function diplayElementDescription(nodeId, isMainElement) {
    let elementDescriptionEl = document.createElement("div")
    elementDescriptionEl.style.position = "absolute"
    elementDescriptionEl.style.right = 0
    elementDescriptionEl.style.top = 0
    elementDescriptionEl.style.width = "fit-content" 
    elementDescriptionEl.style.zIndex = 999999999
    elementDescriptionEl.style.color = `rgb(255, 200, 100)`
    elementDescriptionEl.style.padding = "5px"
    elementDescriptionEl.style.backgroundColor = `rgba(0, 0, 100, 0.6)`
    let descriptionContainer = document.createElement("div")
    elementDescriptionEl.appendChild(descriptionContainer)
    descriptionContainer.style.display = "flex"
    descriptionContainer.style.width = "fit-content"
    descriptionContainer.style.flexDirection =  "column"
    descriptionContainer.style.right = "5px"
    descriptionContainer.style.gap = "0.5rem"

    addCloseBtn(descriptionContainer, nodeId)

    if (isMainElement) appendAddHeaderAndAddFooterToCollapsible(descriptionContainer)

    for (const collapsibleFieldDesc of collapsibleFieldElementTypeAction) {
        let [text, elementType, action, field] = collapsibleFieldDesc

        if (text === "set url") {
            if (getSiteRepNodeByNodeId(nodeId).tag !== "a") continue
        }

        let tag = elementType
        if (elementType.startsWith("input")) {
            tag = "input"
        }

        if (elementType.startsWith("select")) {
            tag = "select"
        }

        if (tag === "input") {
            let inputType = elementType.split(":")[1]
            if (inputType === "radio"){
                let radioContainer = document.createElement("div")
                radioContainer.style.display = "flex"
                radioContainer.style.gap = "0.5rem"
                let subheading = document.createElement("div")
                subheading.innerText = `${text}:`
                radioContainer.appendChild(subheading)
                elementType.split(":").splice(2).forEach(radioOption => {
                    let fieldEl = document.createElement(tag)
                    fieldEl.setAttribute("type", inputType)
                    fieldEl.setAttribute("name", text)
                    fieldEl.setAttribute("id", radioOption)
                    let label = document.createElement('label')
                    label.innerText = radioOption
                    label.setAttribute("for", radioOption)
                    radioContainer.appendChild(label)
                    radioContainer.appendChild(fieldEl)
                    fieldEl.oninput = (e) => {
                        e.preventDefault()
                        if (e.target.checked) {
                            HistoryTools.record(nodeId)
                            action(nodeId, e.target.id)
                        }
                    }
                })
                descriptionContainer.appendChild(radioContainer)
            } else {
                let fieldContainer = document.createElement("div")
                fieldContainer.style.display = "flex"
                fieldContainer.style.gap = "1rem"
                let subheading = document.createElement("div")
                subheading.innerText = `${text}:`
                fieldContainer.appendChild(subheading)
                let fieldEl = document.createElement(tag)
                fieldEl.style.display = "block"
                fieldEl.setAttribute("type", inputType)
                fieldEl.setAttribute("placeholder", text)
                fieldContainer.appendChild(fieldEl)
                descriptionContainer.appendChild(fieldContainer)
                
                if (inputType === "text") {
                    fieldEl.onclick = (e) => e.preventDefault()
                    if (field) {
                        fieldEl.value = getCurrentFieldValueFromSiteRep(nodeId, field) || ""
                        if (field === "href") {
                            fieldEl.value = fieldEl.value.replace(getProjectBasePath(), "")
                        }
                    }
                }

                fieldEl.oninput = (e) => {
                    e.preventDefault()
                    HistoryTools.record(nodeId)
                    action(nodeId, e.target.value)
                }
            }

        } else if (tag === "textarea") {
            let fieldEl = document.createElement(tag)
            fieldEl.style.display = "block"
            fieldEl.placeholder = text
            fieldEl.value = field ? getCurrentFieldValueFromSiteRep(nodeId, field) || "" : ""

            descriptionContainer.appendChild(fieldEl)

            fieldEl.onclick = (e) => e.preventDefault()
            fieldEl.oninput = (e) => {
                e.preventDefault()
                HistoryTools.record(nodeId)
                action(nodeId, e.target.value)
            }
        } else if (tag === "select") {
            let selectContainer = document.createElement("div")
            let fieldEl = document.createElement(tag)
            selectContainer.style.display = "flex"
            let subheading = document.createElement("div")
            subheading.innerText = `${text}:`
            selectContainer.appendChild(subheading)
            selectContainer.appendChild(fieldEl)
            elementType.split(":").splice(1).forEach(selectOption => {
                let option = document.createElement("option")
                option.style.width = "100px"
                option.value = selectOption
                option.innerText = selectOption
                option.style.fontFamily = selectOption
                fieldEl.appendChild(option)
            })
            fieldEl.onchange = (e) => {
                HistoryTools.record(nodeId)
                action(nodeId, e.target.value)
            }
            descriptionContainer.appendChild(selectContainer)
        } else {
            let fieldEl = document.createElement(tag)
            fieldEl.style.display = "block"
            fieldEl.innerText = text

            descriptionContainer.appendChild(fieldEl)
            // on click

            fieldEl.onclick = (e) => {
                e.preventDefault()
                if (["duplicate", "delete node"].includes(text) === false) {
                    HistoryTools.record(nodeId)
                }
                action(nodeId, STEP)
            }
        }
    }

    document.getElementById(elementDescriptionElId)?.remove()

    elementDescriptionEl.id = elementDescriptionElId

    document.querySelector("body").appendChild(elementDescriptionEl)
}

function makeElementDescriptionCollapsible(nodeId, isMainElement=false) {
    let collapsibleContainersContainer = document.createElement("div")
    collapsibleContainersContainer.classList.add(nodeId) // identify each node's modifier
    collapsibleContainersContainer.style.position = "absolute"
    collapsibleContainersContainer.style.right = "0px"
    collapsibleContainersContainer.style.top = "0px"
    collapsibleContainersContainer.style.display = "inline-block"

    let toggleBtn = document.createElement("button")
    toggleBtn.classList.add("toggle-button")
    if (nodeId === mainNodeId) {
        toggleBtn.style.zIndex = "100"
    }
    toggleBtn.textContent = "+"
    
    addEventListenerToToggleBtn(toggleBtn, nodeId, isMainElement)

    collapsibleContainersContainer.appendChild(toggleBtn)

    return collapsibleContainersContainer
}

function addEventListenerToToggleBtn(toggleBtn, nodeId, isMainElement) {
    toggleBtn.addEventListener('click', (event) => {
        event.preventDefault()

        if (toggleBtn.innerText === "+") {
            diplayElementDescription(nodeId, isMainElement)
            toggleBtn.textContent = '-';
        } else {
            document.getElementById(elementDescriptionElId)?.remove()
            toggleBtn.textContent = '+';
        }
    });
}

function getCurrentFieldValueFromSiteRep(nodeId, field) {
    if (field === "STEP") return `${STEP}`
    let node = getSiteRepNodeByNodeId(nodeId)
    if (node) return node[field]
}

function addCloseBtn(collapsibleContainer, nodeId) {
    let closeBtn = document.createElement("button")
    closeBtn.style.display = "block"
    closeBtn.innerText = "close"
    closeBtn.style.backgroundColor = "red"

    closeBtn.onclick = () => {
        closeCollapsible(nodeId)
    }

    collapsibleContainer.appendChild(closeBtn)
}

function appendAddHeaderAndAddFooterToCollapsible(collapsibleContainer) {
    for (const collapsibleFieldDesc of headerFooterDesc) {
        let [text, elementType, action] = collapsibleFieldDesc
        let tag = elementType
        let fieldEl = document.createElement(tag)
        fieldEl.style.display = "block"
        fieldEl.innerText = text

        collapsibleContainer.appendChild(fieldEl)
        // on click

        fieldEl.onclick = (e) => {
            e.preventDefault()
            action()
        }
    }
}

function getElementDescriptionCollapsible(nodeEl, nodeId) {
    return nodeEl.getElementsByClassName(`${nodeId}`)[0]
}

function appendElementDescriptionCollapsible(nodeEl) {
    let nodeId = nodeEl.getAttribute("nodeId")
    if (!nodeId) return
    let collapsible = makeElementDescriptionCollapsible(nodeId, nodeEl.tagName === "MAIN")
    collapsible.style.backgroundColor = nodeEl.tagName === "MAIN" ? "red" : getRandomColor()
    nodeEl.appendChild(collapsible)
    setCollapsibleToggleBtnWidthRelativeToParent(nodeId)
    nodeEl.addEventListener('contextmenu', function(e) {
        e.preventDefault()
        let collapsibleTglBtn = getCollapsibleToggleBtn(nodeId)
        collapsibleTglBtn.click()
    })
}

function removeElementDescriptionCollapsible(nodeEl) {
    let nodeId = nodeEl.getAttribute("nodeId")
    if (!nodeId) return
    let descCollapsible = getElementDescriptionCollapsible(nodeEl, nodeId)
    descCollapsible?.remove()
}

function setCollapsibleToggleBtnWidthRelativeToParent(nodeId) {
    let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)
    if (!parentNode) return

    let parentNodeCollapsibleToggleBtn = getCollapsibleToggleBtn(parentNode.nodeId)
    if (!parentNodeCollapsibleToggleBtn) return
    let parentNodeCollapsibleToggleBtnWidth = 
        getCssProp(parentNodeCollapsibleToggleBtn, "width").replace("px", "")
    let parentNodeCollapsibleToggleBtnHeight = 
        getCssProp(parentNodeCollapsibleToggleBtn, "height").replace("px", "")
    
    let nodeCollapsibleToggleBtn = getCollapsibleToggleBtn(nodeId)

    if (!nodeCollapsibleToggleBtn) return

    let smallerWidth = Math.max(16, Number(parentNodeCollapsibleToggleBtnWidth) - 3)
    let smallerHeight = Math.max(16, Number(parentNodeCollapsibleToggleBtnHeight) - 3)

    nodeCollapsibleToggleBtn.style.width = `${smallerWidth}px`
    nodeCollapsibleToggleBtn.style.height = `${smallerHeight}px`
    nodeCollapsibleToggleBtn.style.lineHeight = `${Math.round(smallerHeight / 2)}px`
    nodeCollapsibleToggleBtn.style.zIndex = `${Math.round(10000000000 / smallerWidth)}`  // the smaller the size the larger the zIndex
}

function getRandomColor() {
    const colors = ['yellow', 'green', 'blue', 'cyan'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    if (lastColorSent !== colors[randomIndex]) return colors[randomIndex]
    lastColorSent = colors[randomIndex]
    return getRandomColor()
}


function addEventListenerToNode(node) {

}

window.onload = function () {
    setSiteRep()
    .then(() => {
        document.querySelectorAll(".__node").forEach( nodeEl => {
            addEventListenerToNode(nodeEl)
            appendElementDescriptionCollapsible(nodeEl)
        })
    })
    addPublishSiteRepBtn()
}

async function setSiteRep() {
    return fetch(baseUrl + "/siterep?path=" + window.location.pathname, {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate', // HTTP/1.1
            'Pragma': 'no-cache', // HTTP/1.0
            'Expires': '0' // Proxies
        }}
    ).then(response => {
        if (response.status !== 200){
            alert("no project found")
        }
        return response.json()
    })
    .then(siterep => {
        SITE_REP = siterep
        return siterep
    })
    .catch(err => {
        alert("no project found")
    })
}

function addPublishSiteRepBtn() {
    let htmlEl = document.querySelector("html")
    let publishSiteBtn = document.createElement("button")
    publishSiteBtn.innerText = "publish"
    publishSiteBtn.style.position = "fixed"
    publishSiteBtn.style.bottom = "5px"
    publishSiteBtn.style.right = "5px"

    publishSiteBtn.onclick = () => commitSiteRep()

    htmlEl.appendChild(publishSiteBtn)
}

document.addEventListener("keydown", (e) => {
	if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
		return;
	}

	if (e.ctrlKey) {
        e.preventDefault()
        switch (e.key.toLowerCase()) {
            case "d":
                document.getElementById(elementDescriptionElId)?.remove()
                document.querySelectorAll(".toggle-button").forEach(e => {
                    e.classList.toggle("hide")
                })
                break
            case "z":
                HistoryTools.undo()
                break
            case "y":
                HistoryTools.redo()
                break
        }
	}
});

function getnodeElementByNodeId(nodeId) {
    const nodes = document.querySelectorAll("[nodeId]")
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        if (node.getAttribute("nodeId") === nodeId) return node
    }
    return null
}

function getSiteRepNodeByNodeId(nodeId) {
    if (!SITE_REP) {
        alert("getSiteRepNodeByNodeId: SITE_REP should not be null")
        throw new Error("getSiteRepNodeByNodeId: SITE_REP should not be null")
    }

    if (SITE_REP.header?.nodeId === nodeId) return SITE_REP.header
    if (SITE_REP.footer?.nodeId === nodeId) return SITE_REP.footer

    let path = window.location.pathname
    if (path !== "/" && path[path.length - 1] === "/") {
        path = path.slice(0, path.length - 1)
    }

    let header = SITE_REP["header"]

    if (header) {
        let node = recursivelyFindNodeWithId(header, nodeId)
        if (node) return node
    }

    let footer = SITE_REP["footer"]

    if (footer) {
        let node = recursivelyFindNodeWithId(footer, nodeId)
        if (node) return node
    }

    let relevantNode = SITE_REP[path]
    return recursivelyFindNodeWithId(relevantNode, nodeId)
}

function updateSiteRep(nodeId, field, value) {
    let siteRepNode = getSiteRepNodeByNodeId(nodeId)
    if (!siteRepNode) {
        throw new Error(`updateSiteRep: node with nodeId: ${nodeId} doesnt exist in siterep`)
    }

    siteRepNode[field] = value
}

function updateNodeAttributes(nodeId, attribute, value) {
    let siteRepNode = getSiteRepNodeByNodeId(nodeId)
    if (!siteRepNode) {
        throw new Error(`updateNodeAttributes: node with nodeId: ${nodeId} doesnt exist in siterep`)
    }

    if (siteRepNode.attributes) {
        siteRepNode.attributes[attribute] = value
    } else {
        siteRepNode.attributes = {}
        siteRepNode.attributes[attribute] = value
    }
}

function getSiteRepNodeParentByChildNodeId(nodeId) {
    if (!SITE_REP) {
        alert("getSiteRepNodeParentByChildNodeId: SITE_REP should not be null")
        throw new Error("getSiteRepNodeParentByChildNodeId: SITE_REP should not be null")
    }

    let path = window.location.pathname
    if (path !== "/" && path[path.length - 1] === "/") {
        path = path.slice(0, path.length - 1)
    }

    let header = SITE_REP["header"]
    if (header) {
        let node = recursivelyFindNodeWithId(header, nodeId, true)
        if (node) return node
    }

    let footer = SITE_REP["footer"]
    if (footer) {
        let node = recursivelyFindNodeWithId(footer, nodeId, true)
        if (node) return node
    }

    let relevantNode = SITE_REP[path]
    return recursivelyFindNodeWithId(relevantNode, nodeId, true)
}

function recursivelyFindNodeWithId(root, nodeId, getParent=false) {
    if (!root) return null
    if (root.nodeId === nodeId) return root
    if (root.children){
        for (const node of Object.values(root.children)) {
            if (node.nodeId === nodeId && getParent) return root
            if (node.nodeId === nodeId) return node
            if (node.children) {
                let res = recursivelyFindNodeWithId(node, nodeId, getParent)
                if (res) return res
            }
        }
    }
    return null
}

function deleteNodeInSiteRep(nodeId) {
    let siteRepNode = getSiteRepNodeByNodeId(nodeId)
    if (!siteRepNode) {
        throw new Error(`deleteNodeInSiteRep: node with nodeId: ${nodeId} doesnt exist in siterep`)
    }

    let parentlessIds = [headerNodeId, footerNodeId]

    if (parentlessIds.includes(nodeId)) {
        switch (nodeId) {
            case headerNodeId:
                delete SITE_REP.header
                break
            case footerNodeId:
                delete SITE_REP.footer
        }
    } else {

        let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)
        if (!parentNode) {
            throw new Error("deleteNodeInSiteRep: parent node not found")
        }

        if (!parentNode.children[nodeId]) {
            throw new Error("deleteNodeInSiteRep: child not found in parent") 
        }
        
        // TO-DO
        // visit all nodes in subtree, if image, delete src at backend
        delete parentNode.children[nodeId]
    }
}

function setContent(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    setTextInFirstChildParagraph(nodeEl, value)
    updateSiteRep(nodeId, "text", value)
    let collapsible = getElementDescriptionCollapsible(nodeEl, nodeId)
    Array.from(collapsible.children).forEach(child => {
        if (child.textContent === "+") {
            child.click()  // open collapsible
            Array.from(collapsible.children).forEach(child => {
                let contentInput = child.querySelector("textarea")
                if (contentInput) {
                    contentInput.focus()
                    contentInput.value = value
                }
            })
        }
    })
}

function setUrl(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return

    let url = getProjectBasePath() + value
    nodeEl.setAttribute("href", url)
    updateSiteRep(nodeId, "href", url)
}

function closeCollapsible(nodeId) {
    let collapsibleToggleBtn = getCollapsibleToggleBtn(nodeId)
    if (collapsibleToggleBtn.textContent === "-") collapsibleToggleBtn.click()
}

function getCollapsibleToggleBtn(nodeId) {
    let nodeEl = getnodeElementByNodeId(nodeId)
    let toggleBtn = null

    if (!nodeEl) return
    let collapsible = getElementDescriptionCollapsible(nodeEl, nodeId)
    toggleBtn = Array.from(collapsible.children).find(child => {
        if (child.textContent === "-" || child.textContent === "+") {
            return child
        }
    })

    return toggleBtn
}

function setTextInFirstChildParagraph(nodeEl, text) {
    if (nodeEl.tagName.toLowerCase() == "p") {
        let collapsible = getElementDescriptionCollapsible(nodeEl, nodeEl.getAttribute("nodeId"))
        nodeEl.innerText = text
        nodeEl.appendChild(collapsible)
    } else {
        let firstP = nodeEl.querySelector("p")
        if (firstP) {
            firstP.innerText = text
        } else {
            firstP = document.createElement("p")
            firstP.innerText = text
            nodeEl.appendChild(firstP)
        }        
    }
}

function addChild(nodeId, value, newNodeId="", position="") {
    closeCollapsible(nodeId)
    createNodeElCreationForm({nodeId, newNodeId, position})
}

function createNodeElCreationForm({nodeId, nodeCreationTypeOptions = [
    {type: "container", value: "div"},
    {type: "paragraph", value: "p"},
    {type: "heading", value: "h1"},
    {type: "subheading", value: "h3"},
    {type: "link", value: "a"},
    {type: "image", value: "img"},
    {type: "other", value: "other"},
], newNodeId="", position=""}) {
    let body = document.querySelector("body")
    let nodeElCreationForm = document.createElement("div")
    nodeElCreationForm.style.position = "fixed"
    nodeElCreationForm.style.display = "flex"
    nodeElCreationForm.style.flexDirection = "column"
    nodeElCreationForm.style.gap = "1rem"
    nodeElCreationForm.style.top = "5rem"
    nodeElCreationForm.style.padding = "2rem"
    nodeElCreationForm.style.border = "1px solid"

    let label = document.createElement("label")
    label.innerText = "type:"
    nodeElCreationForm.appendChild(label)

    let typeSelectorEl = document.createElement("select")
    typeSelectorEl.style.display = "block"
    typeSelectorEl.setAttribute("id", "nodeTypeSelector")

    nodeCreationTypeOptions.forEach(option => {
        let optionEl = document.createElement('option');
        optionEl.setAttribute('value', option.value);
        optionEl.textContent = option.type;
        typeSelectorEl.appendChild(optionEl);
    });

    nodeElCreationForm.appendChild(typeSelectorEl)

    let textContent = document.createElement("textarea")
    textContent.placeholder = "text content"
    textContent.style.display = "block"
    nodeElCreationForm.appendChild(textContent)

    let linkInput = document.createElement("input")
    linkInput.placeholder = "url"
    linkInput.style.display = "block"
    nodeElCreationForm.appendChild(linkInput)

    let tagInput = document.createElement("input")
    tagInput.placeholder = "tag"
    tagInput.style.display = "block"
    nodeElCreationForm.appendChild(tagInput)

    let imageInput = document.createElement("input")
    imageInput.setAttribute("type", "file")
    imageInput.style.display = "block"
    nodeElCreationForm.appendChild(imageInput)
    
    function disableIrrelevantFields() {
        if (typeSelectorEl.value === "a") {
            linkInput.disabled = false
            textContent.disabled = false
            imageInput.disabled = true
            tagInput.disabled = true    
        } else if (typeSelectorEl.value === "img") {
            imageInput.disabled = false
            textContent.disabled = true
            linkInput.disabled = true
            tagInput.disabled = true
        } else if (typeSelectorEl.value === "other") {
            tagInput.disabled = false
            imageInput.disabled = true
            textContent.disabled = true
            linkInput.disabled = true
        } else {
            textContent.disabled = false
            linkInput.disabled = true 
            imageInput.disabled =true
            tagInput.disabled = true
        }
    }

    disableIrrelevantFields()

    typeSelectorEl.addEventListener('change', disableIrrelevantFields)

    let cancelBtn = document.createElement("button")
    cancelBtn.innerText = "cancel"
    cancelBtn.onclick = () => {
        typeSelectorEl.removeEventListener('change', disableIrrelevantFields)
        nodeElCreationForm.remove()
    }

    const getFormValue = (selectOpt) => {
        let possibleValues = {
            "a": `${linkInput.value}:${textContent.value}`,
            "img": imageInput.files?.item(0),
        }
        return possibleValues[selectOpt] ? possibleValues[selectOpt] : textContent.value
    }

    let appendChildBtn = document.createElement("button")
    appendChildBtn.innerText = "add"
    appendChildBtn.onclick = () => {
        let tag = typeSelectorEl.value
        if (tag === "other") {
            tag = tagInput.value
        }
        appendContentToNodeEl(
            nodeId, 
            tag, 
            getFormValue(typeSelectorEl.value), 
            newNodeId, 
            position
        )
        typeSelectorEl.removeEventListener('change', disableIrrelevantFields)
        nodeElCreationForm.remove()
    }

    nodeElCreationForm.appendChild(cancelBtn)
    nodeElCreationForm.appendChild(appendChildBtn)

    body.appendChild(nodeElCreationForm)
    return nodeElCreationForm
}

function appendContentToNodeEl(nodeId, tag, value, newNodeId="", position="") {
    let nodeEl = getnodeElementByNodeId(nodeId)
    if (!nodeEl) {
        alert(`appendContentToNodeEl: element with nodeId ${nodeId} does not exist`)
        throw new Error(`appendContentToNodeEl: element with nodeId ${nodeId} does not exist`)
    }

    let newNode = {tag, text: value}
    let childNodeId = newNodeId || Date.now().toString()
    newNode.nodeId = childNodeId
    let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)

    // update ui
    let childEl = document.createElement(tag)

    if (tag === "a") {
        let [hrefTop, textContent] = value.split(":")
        let href = getProjectBasePath() + hrefTop
        newNode.href = href
        newNode.text = textContent
        childEl.setAttribute("href", href)
        let p = document.createElement("p")
        p.innerText = textContent
        childEl.style.display = "block"
        childEl.appendChild(p)
    } else if (tag === "img") {
        let passiveParentNodeId = Date.now().toString()
        appendContentToNodeEl(nodeId, "div", "", passiveParentNodeId, position)
        let imageContainer = getnodeElementByNodeId(passiveParentNodeId)
        if (!imageContainer) {
            alert(`appendContentToNodeEl: element with newNodeId ${passiveParentNodeId} does not exist`)
            throw new Error(`appendContentToNodeEl: element with newNodeId ${passiveParentNodeId} does not exist`)
        }

        let childNodeId = Date.now().toString()

        let parentNode = getSiteRepNodeByNodeId(passiveParentNodeId)
        parentNode.isPassiveParent = true
        parentNode.delegateTo = childNodeId
    
        let childEl = document.createElement(tag)

        const imageId = Date.now().toString()
        childEl.setAttribute("id", imageId)
        childEl.setAttribute("nodeId", childNodeId)
        childEl.setAttribute("max-width", "100%")
        childEl.setAttribute("max-height", "100%")
        childEl.setAttribute("width", "100%")
        childEl.setAttribute("height", "100%")
        childEl.style.display = "inline-block"
        childEl.style.objectFit = "contain"
        childEl.style.borderRadius = "inherit"
        let newNode = {tag, width: "100%", height: "100%", edgeRounding: "inherit"}
        newNode.nodeId = childNodeId
        newNode.activeChildNodeId = childNodeId
        imageContainer.appendChild(childEl)
        displayImage(value, imageId)
        // TO-DO
        // queue images in a map keyed by imageId and upload all to backend on commit
        // delete queued image by its id if it node is deleted in siterep
        get_SHA256_Hash(value)
        .then(function(hash) {
            handleFileUpload(value, hash)
            newNode.src = baseUrl + "/images/" + hash
            addChildToSiteRep(parentNode.nodeId, newNode)
        })
        return
    } else if (tag === "input" || tag === "textarea") {
        let passiveParentNodeId = Date.now().toString()
        appendContentToNodeEl(nodeId, "div", "", passiveParentNodeId, position)
        let newNodeContainer = getnodeElementByNodeId(passiveParentNodeId)
        if (!newNodeContainer) {
            alert(`appendContentToNodeEl: element with newNodeId ${passiveParentNodeId} does not exist`)
            throw new Error(`appendContentToNodeEl: element with newNodeId ${passiveParentNodeId} does not exist`)
        }

        let childNodeId = Date.now().toString()

        let parentNode = getSiteRepNodeByNodeId(passiveParentNodeId)
        parentNode.isPassiveParent = true
        parentNode.delegateTo = childNodeId
    
        let childEl = document.createElement(tag)

        childEl.setAttribute("nodeId", childNodeId)
        childEl.style.width = "100%"
        childEl.style.height = "100%"
        childEl.style.display = "inline-block"
        childEl.style.borderRadius = "inherit"
        let newNode = {tag, width: "100%", height: "100%", edgeRounding: "inherit"}
        newNode.nodeId = childNodeId
        newNode.activeChildNodeId = childNodeId
        newNodeContainer.appendChild(childEl)
        addChildToSiteRep(parentNode.nodeId, newNode)
        return
    } else {
        if (tag !== "p") {
            let p = document.createElement("p")
            p.innerText = value
            childEl.appendChild(p)
        } else {
            childEl.innerText = value
        }
    }

    childEl.classList.add("__node")

    childEl.setAttribute("nodeId", childNodeId)
    switch (position) {
        case "before":
            addChildToSiteRep(parentNode.nodeId, newNode)
            appendElementDescriptionCollapsible(childEl)
            nodeEl.before(childEl)
            break
        case "after":
            addChildToSiteRep(parentNode.nodeId, newNode)
            appendElementDescriptionCollapsible(childEl)
            nodeEl.after(childEl)
            break
        case "start":
            addChildToSiteRep(nodeId, newNode)
            appendElementDescriptionCollapsible(childEl)
            nodeEl.prepend(childEl)
            break
        default:
            nodeEl.appendChild(childEl) 
            addChildToSiteRep(nodeId, newNode)
            appendElementDescriptionCollapsible(childEl)
    }
    return childNodeId
}

function getProjectBasePath() {
    let [userId, projectName] = window.location.pathname.split("/").filter(seg => seg !== "").slice(0, 2)
    if (!userId || !projectName) {
        throw new Error("getProjectBasePath: unable to retrieve userId and or projectName")
    }
    return `/${userId}/${projectName}/`
}

function getElementAfterNewNodeId(nodeId, newNodeId) {
    let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)
    if (!parentNode) return null
    let parentNodeEl = getnodeElementByNodeId(parentNode.nodeId)

    if (!parentNodeEl) return null

    let childNodes = Array.from(parentNodeEl.querySelectorAll(".__node") || [])
    let nodeIds = childNodes.map(node => node.getAttribute("nodeId"))
    let sortedNodeIds = sortStringList(nodeIds)
    let sortedNodeIdsNumber = sortedNodeIds.map(id => Number(id))
    let newNodeIdNumber = Number(newNodeId)
    for (let i = 0; i < sortedNodeIdsNumber.length; i++) {
        if (sortedNodeIdsNumber[i] > newNodeIdNumber){
            let requiredNodeId = sortedNodeIds[i]
            for (let j = 0; j < childNodes.length; j++) {
                if (childNodes[j].getAttribute("nodeId") === requiredNodeId)
                    return childNodes[j]
            }
            break
        }
    }
    return null
}

function getElementBeforeNewNodeId(nodeId, newNodeId) {
    let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)
    if (!parentNode) return null
    let parentNodeEl = getnodeElementByNodeId(parentNode.nodeId)

    if (!parentNodeEl) return null

    let childNodes = Array.from(parentNodeEl.querySelectorAll(".__node") || [])
    let nodeIds = childNodes.map(node => node.getAttribute("nodeId"))
    let sortedNodeIds = sortStringList(nodeIds)
    let sortedNodeIdsNumber = sortedNodeIds.map(id => Number(id))
    let newNodeIdNumber = Number(newNodeId)
    for (let i = 0; i < sortedNodeIdsNumber.length; i++) {
        if (sortedNodeIdsNumber[i] > newNodeIdNumber){
            if (i == 0) return null
            let requiredNodeId = sortedNodeIds[i - 1]
            for (let j = 0; j < childNodes.length; j++) {
                if (childNodes[j].getAttribute("nodeId") === requiredNodeId)
                    return childNodes[j]
            }
            break
        }
    }

    for (let j = 0; j < childNodes.length; j++) {
        if (childNodes[j].getAttribute("nodeId") === sortedNodeIds[sortedNodeIds.length - 1])
            return childNodes[j]
    }
    return null
}

function sortStringList(list) {
    list.sort((a, b) => Number(a) - Number(b))
    return list
}

function addChildToSiteRep(nodeId, child) {
    if (child.tag === "header" || child.tag === "footer") {
        SITE_REP[child.tag] = child
        return
    }

    let node = getSiteRepNodeByNodeId(nodeId)
    if (!node) {
        alert(`addChildToSiteRep: node with nodeId ${nodeId} not in site rep`)
        throw new Error(`addChildToSiteRep: node with nodeId ${nodeId} not in site rep`)
    }

    if (!node.children) node.children = {}

    if (!child.nodeId) {
        alert(`addChildToSiteRep: child node has no id`)
        throw new Error(`addChildToSiteRep: child node has no id`)
    }
    node.children[child.nodeId] = child
}

function addNodeBefore(nodeId, value) {
    closeCollapsible(nodeId)
    addChild(nodeId, "", reduceDateTimeNodeId(nodeId), "before")
}

function addNodeAfter(nodeId, value) {
    closeCollapsible(nodeId)
    addChild(nodeId, "", increaseDateTimeNodeId(nodeId), "after")
}

function addHeading(nodeId, value) {
    closeCollapsible(nodeId)
    createNodeElCreationForm({nodeId, nodeCreationTypeOptions: [{type: "heading", value: "h1"}]})
}

function addSubHeading(nodeId, value) {
    closeCollapsible(nodeId)
    createNodeElCreationForm({nodeId, nodeCreationTypeOptions: [{type: "subheading", value: "h3"}]})
}

function addHeader() {
    let header = document.querySelector("header")
    if (header) return alert("header already exists, cannot have 2 headers")
    closeCollapsible(mainNodeId)
    const position = "before"
    const newNodeId = headerNodeId
    createNodeElCreationForm({nodeId: mainNodeId, position, newNodeId, nodeCreationTypeOptions: [
        {type: "header", value: "header"},
    ]})
}

function addFooter() {
    let footer = document.querySelector("footer")
    if (footer) return alert("footer already exists, cannot have 2 footers")
    closeCollapsible(mainNodeId)
    const position = "after"
    const newNodeId = footerNodeId
    createNodeElCreationForm({nodeId: mainNodeId, position, newNodeId, nodeCreationTypeOptions: [
        {type: "footer", value: "footer"},
    ]})
}

function deleteNode(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    if (nodeEl.tagName.toLowerCase() === "main") {
        alert("you cannot delete the root element")
        return
    }
    closeCollapsible(nodeId)
    nodeEl.remove()
    deleteNodeInSiteRep(nodeId)   
}

function makeNodeExpandable(nodeId, value) {

    let nodeEl = getnodeElementByNodeId(nodeId)
    if (!nodeEl) return

    let node = getSiteRepNodeByNodeId(nodeId)
    if (!node) throw new Error(`makeNodeExpandable: node 
        with nodeId ${nodeId} does not exist in siterep`)

    let hambugerNodeId = Date.now().toString()

    if (node.children) {
        let nodeIds = Object.keys(node.children)
        let sortedNodeIds = sortStringList(nodeIds)
        hambugerNodeId = `${Number(sortedNodeIds[0]) - 1000}`
    }

    let parentNodeId = getSiteRepNodeParentByChildNodeId(nodeId).nodeId

    appendContentToNodeEl(parentNodeId, "div", "=", hambugerNodeId, "start")

    let expandBtn = getnodeElementByNodeId(hambugerNodeId)
    expandBtn.style.fontSize = "40px"
    updateSiteRep(hambugerNodeId, "fontSize", "40px")

    expandBtn.classList.add("hambuger")
    updateSiteRep(hambugerNodeId, "extendedClass", "hambuger")
    updateSiteRep(hambugerNodeId, "position", "absolute")

    expandBtn.onclick = () => {
        let nodeEl = getnodeElementByNodeId(nodeId)
        // TO-DO: Make animated in both places ie onclick text below

        if (nodeEl.classList.contains("open")) {
            let parentNodeId = getSiteRepNodeParentByChildNodeId(nodeId).nodeId
            let parentNodeEl = getnodeElementByNodeId(parentNodeId)
            parentNodeEl.insertBefore(expandBtn, nodeEl)
            expandBtn.style.left = nodeEl.style.left
            expandBtn.style.right = nodeEl.style.right
            expandBtn.style.position = "absolute"
            nodeEl.classList.remove("open")
        } else {
            expandBtn.style.position = ""
            nodeEl.prepend(expandBtn)
            nodeEl.style.display = "flex"
            nodeEl.classList.add("open")
        }
    }

    let onclick = `
    window.addEventListener('load', function() {
        let expandBtn = getnodeElementByNodeId("${hambugerNodeId}");
        expandBtn.onclick = () => {
            let nodeEl = getnodeElementByNodeId("${nodeId}")

            if (nodeEl.classList.contains("open")) {
                let parentNodeId = getSiteRepNodeParentByChildNodeId("${nodeId}").nodeId
                let parentNodeEl = getnodeElementByNodeId("${parentNodeId}")
                parentNodeEl.insertBefore(expandBtn, nodeEl)
                expandBtn.style.left = nodeEl.style.left
                expandBtn.style.right = nodeEl.style.right
                expandBtn.style.position = "absolute"
                nodeEl.classList.remove("open")
            } else {
                expandBtn.style.position = ""
                nodeEl.prepend(expandBtn)
                nodeEl.style.display = "flex"
                nodeEl.classList.add("open")
            }
        }

    });`

    updateSiteRep(hambugerNodeId, "addScript", onclick)

    alignHambugerSign(nodeEl, hambugerNodeId)
    let [left, right] = adjustExpandableElementPosition(nodeEl)

    nodeEl.classList.add("expand-by-width")
    updateSiteRep(nodeId, "extendedClass", "expand-by-width")
    updateSiteRep(nodeId, "shiftLeft", left)
    updateSiteRep(nodeId, "shiftRight", right)
    nodeEl.style.position = "absolute"
    updateSiteRep(nodeId, "position", "absolute")

    setOrientation(nodeId, "vertical")
    closeCollapsible(nodeId)

    let parentNodeEl = getnodeElementByNodeId(parentNodeId)
    parentNodeEl.insertBefore(expandBtn, nodeEl)
    expandBtn.click()
}

function adjustExpandableElementPosition(element) {
    const rect = element.getBoundingClientRect();
    
    const windowWidth = window.innerWidth;

    const center = (rect.left + rect.right) / 2
    
    // Check if it's closer to the left or right
    if (center < (windowWidth /  2)) {
        element.style.left = '0px';
        element.style.right = 'auto';
        return ["0px", "auto"]
    } else {
        element.style.right = '0px';
        element.style.left = 'auto';
        return ["auto", "0px"]
    }
}

function alignHambugerSign(nodeEl, hambugerNodeId) {
    const rect = nodeEl.getBoundingClientRect();
    const hambuger = getnodeElementByNodeId(hambugerNodeId)
    
    const windowWidth = window.innerWidth;

    const center = (rect.left + rect.right) / 2
    
    // Check if it's closer to the left or right
    if (center < (windowWidth /  2)) {
        setTextAlignment(hambugerNodeId, "right")
        hambuger.style.left = "0px"
        updateSiteRep(hambugerNodeId, "shiftLeft", "0px")
        updateSiteRep(hambugerNodeId, "shiftRight", "auto")
    } else {
        setTextAlignment(hambugerNodeId, "left")
        hambuger.style.right = "0px"
        updateSiteRep(hambugerNodeId, "shiftRight", "0px")
        updateSiteRep(hambugerNodeId, "shiftLeft", "auto")
    }
}

function increaseFontSize(nodeId, STEP) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevFontSize = getFontSize(nodeEl)
    let updatedValue = Number(STEP) + prevFontSize
    nodeEl.style.fontSize = `${updatedValue}px`
    updateSiteRep(nodeId, "fontSize", `${updatedValue}`)
}

function getFontSize(el) {
    let fontSize = window.getComputedStyle(el, null).getPropertyValue('font-size')
    return parseFloat(fontSize)
}

function decreaseFontSize(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevFontSize = getFontSize(nodeEl)
    let updatedValue = prevFontSize - Number(STEP)
    nodeEl.style.fontSize = `${updatedValue}px`
    updateSiteRep(nodeId, "fontSize", `${updatedValue}`)
}

function setFont(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.fontFamily = value
    updateSiteRep(nodeId, "font", value)
}


function increaseWidth(nodeId, STEP) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevWidth = nodeEl.offsetWidth
    let updatedValue = Number(STEP) + prevWidth
    nodeEl.style.width = `${updatedValue}px`
    nodeEl.style.maxWidth = `100%`
    updateSiteRep(nodeId, "width", `${updatedValue}`)
}

function decreaseWidth(nodeId, STEP) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevWidth = nodeEl.offsetWidth 
    let updatedValue = prevWidth - Number(STEP)
    nodeEl.style.width = `${updatedValue}px`
    nodeEl.style.maxWidth = `100%`
    updateSiteRep(nodeId, "width", `${updatedValue}`)
}

function setWidth(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let updatedValue = value
    if (Number(value)) {
        updatedValue = `${value}px`
    }
    nodeEl.style.width = updatedValue
    nodeEl.style.maxWidth = `100%`
    updateSiteRep(nodeId, "width", `${updatedValue}`)
}

function increaseHeight(nodeId, STEP) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevHeight = nodeEl.offsetHeight
    let updatedValue = Number(STEP) + prevHeight
    nodeEl.style.height = `${updatedValue}px`
    updateSiteRep(nodeId, "height", `${updatedValue}`)
}

function decreaseHeight(nodeId, STEP) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevHeight = nodeEl.offsetHeight
    let updatedValue = prevHeight - Number(STEP)
    nodeEl.style.height = `${updatedValue}px`
    updateSiteRep(nodeId, "height", `${updatedValue}`)
}

function setHeight(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let updatedValue = value
    if (Number(value)) {
        updatedValue = `${value}px`
    }
    nodeEl.style.height = updatedValue
    updateSiteRep(nodeId, "height", `${updatedValue}`)
}

function setFontColor(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.color = value
    updateSiteRep(nodeId, "fontColor", value)
}

function setFontWeight(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.fontWeight = value
    updateSiteRep(nodeId, "fontWeight", value)
}

function setBackgroundColor(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.backgroundColor = value
    updateSiteRep(nodeId, "backgroundColor", value)
}

function setOrientation(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.display = "flex"
    nodeEl.style.flexWrap = "wrap"
    nodeEl.style.gap = "1rem"
    nodeEl.style.flexDirection = value === "horizontal" ? "row" : "column"
    updateSiteRep(nodeId, value, true)

    let opposite = value === "horizontal" ? "vertical" : "horizontal"
    updateSiteRep(nodeId, opposite, false)
}

function setGap(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.gap = addPxMeasure(value)
    updateSiteRep(nodeId, "gap", value)
}

function setTextAlignment(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return

    let possibleValues = ["left", "center", "right"]
    possibleValues.forEach(val => {
        if (val === value) {
            nodeEl.style.textAlign = val
            updateSiteRep(nodeId, val, true)
        } else {
            updateSiteRep(nodeId, val, false)
        }
    })
}

function setInlineOrBlock(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return

    let possibleValues = ["inline-block", "block"]
    possibleValues.forEach(val => {
        if (val === value) {
            nodeEl.style.display = val
            updateSiteRep(nodeId, val, true)
        } else {
            updateSiteRep(nodeId, val, false)
        }
    })
}

function setSelfAlignment(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return

    let possiblePropsAndValues = [
        ["start", "marginRight", "auto"], 
        ["middle", "", ""], 
        ["end", "marginLeft", "auto"]
    ]
    let margins = ["marginRight", "marginLeft", "margin"]

    margins.forEach(margin => {
        nodeEl.style[margin] = ""
    })

    possiblePropsAndValues.forEach((val) => {
        let [prop, cssProp, cssVal] = val
        updateSiteRep(nodeId, prop, false) // update all to false initially
        if (prop === value && prop !== "middle") {
            nodeEl.style[cssProp] = cssVal
            updateSiteRep(nodeId, prop, true)
        } else if (prop === value && prop === "middle") {
            nodeEl.style.marginLeft = "auto"
            nodeEl.style.marginRight = "auto"
            updateSiteRep(nodeId, prop, true)
        }
    })
}

function shiftUp(nodeId, value){
    // mess with shiftTop only
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevTopString = window.getComputedStyle(nodeEl, null).getPropertyValue("top")
    let prevTop = prevTopString.slice(0, prevTopString.indexOf("p"))
    let updatedValue = `${Number(prevTop) - Number(STEP)}`
    nodeEl.style.top = `${updatedValue}px`
    updateSiteRep(nodeId, "shiftTop", updatedValue)
}

function getCssProp(nodeEl, prop) {
    return window.getComputedStyle(nodeEl, null).getPropertyValue(prop)
}

function shiftDown(nodeId, value){
    // mess with shiftTop only
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevTopString = window.getComputedStyle(nodeEl, null).getPropertyValue("top")
    let prevTop = prevTopString.slice(0, prevTopString.indexOf("p"))    
    let updatedValue = `${Number(prevTop) + Number(STEP)}`
    nodeEl.style.top = `${updatedValue}px`
    updateSiteRep(nodeId, "shiftTop", updatedValue)
}

function shiftLeft(nodeId, value) {
    // mess with shiftLeft
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevLeftString = window.getComputedStyle(nodeEl, null).getPropertyValue("left")
    let prevLeft = prevLeftString.slice(0, prevLeftString.indexOf("p"))
    let updatedValue = `${Number(prevLeft) - Number(STEP)}`
    nodeEl.style.left = `${updatedValue}px`
    updateSiteRep(nodeId, "shiftLeft", updatedValue)
}

function shiftRight(nodeId, value) {
    // mess with shiftLeft
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevLeftString = window.getComputedStyle(nodeEl, null).getPropertyValue("left")
    let prevLeft = prevLeftString.slice(0, prevLeftString.indexOf("p"))
    let updatedValue = `${Number(prevLeft) + Number(STEP)}`
    nodeEl.style.left = `${updatedValue}px`
    updateSiteRep(nodeId, "shiftLeft", updatedValue)
}

function duplicateNode(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)
    let cannotDuplicateNodeIds = [headerNodeId, mainNodeId, footerNodeId]
    if (cannotDuplicateNodeIds.includes(nodeId)) {
        return alert("cannot duplicate any of header, main or footer elements")
    }

    let node = getSiteRepNodeByNodeId(nodeId)

    if (!nodeEl || !node) return

    
    let nodeClone = JSON.parse(JSON.stringify(node))

    const cloneEl = nodeEl.cloneNode(true)
    recursivelyReAttachCollapsibleToNodeElAndItsChildren(cloneEl)

    setNewNodeIdsToNodeClone(cloneEl, nodeClone)

    if (!nodeClone.nodeId) throw new Error("duplicateNode: nodeId should be set")
    
    let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)

    // update site rep
    addChildToSiteRep(parentNode.nodeId, nodeClone)

    nodeEl.after(cloneEl)
    closeCollapsible(nodeId)
}

function recursivelyReAttachCollapsibleToNodeElAndItsChildren(nodeEl) {
    visitAllElements(nodeEl, resetNodeIds)
    visitAllElements(nodeEl, appendElementDescriptionCollapsible)
}

function visitAllElements(nodeEl, operation) {
    operation(nodeEl)
    Array.from(nodeEl.children).forEach(child => visitAllElements(child, operation));
}


function resetNodeIds(nodeEl) {
    let nodeId = nodeEl.getAttribute("nodeId")
    if (nodeId) {
        let collapsibleContainersContainer = Array.from(nodeEl.children).find(child => child.classList.contains(nodeId))
        collapsibleContainersContainer?.remove()

        let newNodeId = `${Date.now() + increaseMillisecondsDifference}`
        increaseMillisecondsDifference += 10

        nodeEl.setAttribute("nodeId", newNodeId)
        nodeEl.setAttribute("prevNodeId", nodeId)
    }
}

function setNewNodeIdsToNodeClone(cloneEl, nodeClone) {
    let prevNodeId = cloneEl.getAttribute("prevNodeId")
    let nodeId = cloneEl.getAttribute("nodeId")

    findNodeWithIdAndUpdateId(nodeClone, prevNodeId, nodeId, nodeClone)
    Array.from(cloneEl.children).forEach(childEl => {
        setNewNodeIdsToNodeClone(childEl, nodeClone)
    })
}

function findNodeWithIdAndUpdateId(node, prevNodeId, currentNodeId, parent) {
    if (node.nodeId === prevNodeId) {
        node.nodeId = currentNodeId
        if (parent !== node) {
            parent.children[currentNodeId] = node
            delete parent.children[prevNodeId]
        }
        if (node.activeChildNodeId && parent.isPassiveParent) {
            parent.delegateTo = currentNodeId
            node.activeChildNodeId =  currentNodeId
        }
        return
    }

    if (node.children) {
        for (let childNode of Object.values(node.children)) {
            findNodeWithIdAndUpdateId(childNode, prevNodeId, currentNodeId, node)
        }
    }
}

function addPxMeasure(value) {
    let strVal = `${value}`
    if (strVal.endsWith("px") || strVal.endsWith("em") || strVal.endsWith("rem")) {
        return strVal
    }
    return `${value}px`
}

function setMargin(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.margin = addPxMeasure(value)
    updateSiteRep(nodeId, "margin", value)
}

function setPadding(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.padding = addPxMeasure(value)
    updateSiteRep(nodeId, "padding", value)
}

function setPaddingTop(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.paddingTop = addPxMeasure(value)
    updateSiteRep(nodeId, "paddingTop", value)
}

function setPaddingBottom(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.paddingBottom = addPxMeasure(value)
    updateSiteRep(nodeId, "paddingBottom", value)
}

function setPaddingLeft(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.paddingLeft = addPxMeasure(value)
    updateSiteRep(nodeId, "paddingLeft", value)
}

function setPaddingRight(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.paddingRight = addPxMeasure(value)
    updateSiteRep(nodeId, "paddingRight", value)
}

function setEdgeRounding(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.borderRadius = addPxMeasure(value)
    updateSiteRep(nodeId, "edgeRounding", value)
}

function setCustomAttribute(nodeId, desc) {
    if (!desc.endsWith("::done")) return
    desc = desc.replace("::done", "")
    let attributeValuePairs = desc.split(",").map(d => d.split(":"))

    let node = getSiteRepNodeByNodeId(nodeId)
    if (node.isPassiveParent) {
        node = getSiteRepNodeByNodeId(node.delegateTo)
    }

    let nodeEl = getnodeElementByNodeId(node.nodeId)

    if (!nodeEl) return

    attributeValuePairs.map(([attr, value]) => {
        if (!attr || !value) return
        attr = attr.trim()
        value = value.trim()
        nodeEl.setAttribute(attr, value)
        updateNodeAttributes(node.nodeId, attr, value)
    })
    closeCollapsible(nodeId)
}

function setExtendCss(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let startIndex = 0
    let endIndex = 0
    if (value[value.length - 1] !== ";") return

    for (;endIndex < value.length; endIndex++) {
        if (value[endIndex] === ";") {
            let currentCssDescription = value.slice(startIndex, endIndex)
            let [cssProp, cssVal] = currentCssDescription.split(":")
            if (cssProp.includes("-")) {
                cssProp = convertToCamelCase(cssProp).trim()
            }
            nodeEl.style[cssProp] = cssVal
            startIndex = endIndex + 1
        }
    }
    updateSiteRep(nodeId, "extendedStyle", value)
}

function convertToCamelCase(separatedByHyphen) {

    function titleCase(section){
        return section[0].toUpperCase() + section.slice(1).toLowerCase();
    }

    return separatedByHyphen.split("-").map((section, index) => {
        if (index == 0) return section
        return titleCase(section)
    }).join("")
}

function setExtendHtml(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)
    if (!nodeEl) return
    if (!value.endsWith("::done")) return
    value = value.replace("::done", "")
    if (value) nodeEl.insertAdjacentHTML('beforeend', value);
    else {
        Array.from(nodeEl.children).forEach(c => {
            if (!c.classList.contains(nodeId)) {
                c.remove()
            }
        })
    }
    updateSiteRep(nodeId, "extendedHtml", value)
    closeCollapsible(nodeId)
}

function addScript(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)
    if (!nodeEl) return
    if (!value.endsWith("::done")) return
    value = value.replace("::done", "")
    value = value.replace("<script>", "").replace("</script>", "")
    // allow script targeted at current node
    // TO-DO: make more powerful by matching pattern to substitute vars
    value = value.replace(/nodeId/g, `"${nodeId}"`)
    let script = document.createElement("script")
    let storedValue = `window.addEventListener('load', function() {
        ${value}
    });`
    script.innerHTML = value
    nodeEl.appendChild(script);
    updateSiteRep(nodeId, "addScript", storedValue)
    closeCollapsible(nodeId)
}

function replaceAllOccurrences(str, find, replace) {
    const regex = new RegExp(find, 'g');
    return str.replace(regex, replace);
}

function setStep(nodeId, value) {
    let numValue = Number(value)
    if (numValue || numValue === 0) {
        STEP = numValue
    }
}

function addPath(nodeId, value) {
    if (!value.endsWith("::done")) return
    value = value.replace("::done", "")
    if (value[0] !== "/") value = `/${value}`
    let path = value
    makeAddPathRequest(path)
}

function deletePath(nodeId, value) {
    let path = window.location.pathname

    if (path === "/") return alert("cannot delete root path")

    if (path[path.length - 1] === "/") {
        path = path.slice(0, path.length - 1)
    }

    let confirm = prompt("are you sure you want to delete this route? [y]/[n]")
    if (confirm.toLowerCase().trim() !== "y") return
    makeDeletePathRequest(path)
    closeCollapsible(nodeId)
}


// utility function starts from here

const postOpt = {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    // body: REMEMBER TO USE SPREAD SYNTAX TO INCLUDE BODY
}
  
const putOpt = {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    // body: REMEMBER TO USE SPREAD SYNTAX TO INCLUDE BODY
}

async function postData(url, data) {
    const postOptLocal = {...postOpt, body: JSON.stringify(data)}
    return fetch(url, postOptLocal)
      .then(data => {
        return data.json()
      })
      .then((data) => {
        return data
      })
      .catch((err) => {
        console.error(err)
        return null
      })
}

async function putData(url, data) {
    const putOptLocal = {...putOpt, body: JSON.stringify(data)}
    return fetch(url, putOptLocal)
      .then(data => {
        return data.json()
      })
      .then((data) => {
        return data
      })
      .catch((err) => {
        console.error(err)
        return null
      })
}

async function commitSiteRep() {
    let path = window.location.pathname
    if (path !== "/" && path[path.length - 1] === "/") {
        path = path.slice(0, path.length - 1)
    }
    if (!SITE_REP[path]) return
    
    // prevent each path from having root properties
    let pathSiteRep = {}
    // allow buildPathHtml at Backend
    pathSiteRep[path] = SITE_REP[path]
    pathSiteRep["path"] = path
    pathSiteRep.title = SITE_REP.title
    pathSiteRep.footer = SITE_REP.footer
    pathSiteRep.header = SITE_REP.header

    // TO-DO check if changed so as not to traverse network

    const url = baseUrl + path

    let res = await putData(url, {data: pathSiteRep})
    if (res.error) {
        alert(res.error)
    }
}

async function makeAddPathRequest(path) {

    let relativePath = getProjectBasePath() + path
    relativePath = relativePath.replace(/\/\//g, "/")

    let url = baseUrl + relativePath
    
    let reqPayload = {path: relativePath}

    let res = await postData(url, {data: reqPayload})
    if (res.error) {
        alert(res.error)
        window.location.href = '/'
    } else {
        window.location = baseUrl + relativePath
    }
}

async function makeDeletePathRequest(path) {
    let url = baseUrl + path
    let data = {data: {path}}
    fetch(url, {
        method: 'DELETE',
        body: JSON.stringify(data)
    })
    .then(response => {
        return response.json(); // or response.text() depending on the response type
    })
    .then(data => {
        if (data.error) console.error(data.error)
        else window.location.href = '/'
    })
}

function reduceDateTimeNodeId(nodeId) {
    let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)

    if (!parentNode) throw new Error("reduceDateTimeNodeId: parentNode can not be empty")
    let childrenNodeIds = Object.keys(parentNode.children)
    let sortedNodeIds = sortStringList(childrenNodeIds)
    let sortedNodeIdsNumber = sortedNodeIds.map(id => Number(id))
    let refNodeIdNumber = Number(nodeId)
    let indexOfRefNodeId = sortedNodeIdsNumber.indexOf(refNodeIdNumber)

    if (indexOfRefNodeId === -1) throw new Error("reduceDateTimeNodeId: indexOfRefNodeId can not be -1")
    if (indexOfRefNodeId === 0) return `${refNodeIdNumber - 10000}`
    if (indexOfRefNodeId <= sortedNodeIdsNumber.length - 1) {
        return `${(sortedNodeIdsNumber[indexOfRefNodeId] + sortedNodeIdsNumber[indexOfRefNodeId - 1]) / 2}`
    }
    throw new Errow("reduceDateTimeNodeId: we should not get here")
}

function increaseDateTimeNodeId(nodeId) {
    let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)

    if (!parentNode) throw new Error("increaseDateTimeNodeId: parentNode can not be empty")
    let childrenNodeIds = Object.keys(parentNode.children)
    let sortedNodeIds = sortStringList(childrenNodeIds)
    let sortedNodeIdsNumber = sortedNodeIds.map(id => Number(id))
    let refNodeIdNumber = Number(nodeId)
    let indexOfRefNodeId = sortedNodeIdsNumber.indexOf(refNodeIdNumber)

    if (indexOfRefNodeId === -1) throw new Error("increaseDateTimeNodeId: indexOfRefNodeId can not be -1")
    
    if (indexOfRefNodeId === 0) return `${refNodeIdNumber + 2000}`

    if (indexOfRefNodeId < sortedNodeIdsNumber.length - 1) {
        return `${(sortedNodeIdsNumber[indexOfRefNodeId] + sortedNodeIdsNumber[indexOfRefNodeId + 1]) / 2}`
    }
    return Date.now().toString()   
}

function displayImage(image, imageId) {
    if (!image) return
  
    if (image.size > 5000000) {
      alert("Error: maximum image size limit is 5MB")
      return
    }
  
    const reader = new FileReader()
    reader.readAsDataURL(image)
    reader.onload = (e) => {
      const imageEl = document.getElementById(imageId)
      if (!imageEl || !e.target) return
      imageEl.src = e.target.result
      imageEl.style.display = "block"
    };
}
  
async function handleFileUpload(file, fileSHA256HexString) {
    if (!file) return {error: "no file file in payload"}
    const formData = new FormData()
    formData.append("image", file)

    const url = baseUrl + `/image/` + fileSHA256HexString
    return fetch(url, {
      method: "POST",
      body: formData,
    })
    .then(d => d.json())
    .then(res => res)
}

// content is assumed to be a blob
async function get_SHA256_Hash(content) {
    const hash = await crypto.subtle.digest('SHA-256', await content.arrayBuffer());

    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

class HistoryTools {
	static redoStack = [];
	static undoStack = [];

	static redo() {
		if (HistoryTools.redoStack.length > 0) {
			const prevState = HistoryTools.redoStack.pop();

            let {node, nodeEl} = prevState

            let nodeCopy = JSON.parse(JSON.stringify(node))
            let nodeElCopy = nodeEl.cloneNode(true)
    
            HistoryTools.undoStack.push({node: nodeCopy, nodeEl: nodeElCopy});

            HistoryTools.resetState(node, nodeEl)
		}
	}

	static undo() {
		if (!HistoryTools.undoStack.length) return;
        let newestState = HistoryTools.undoStack.pop()

        let {node, nodeEl} = newestState
        let nodeCopy = JSON.parse(JSON.stringify(node))
        let nodeElCopy = nodeEl.cloneNode(true)

        HistoryTools.redoStack.push({node: nodeCopy, nodeEl: nodeElCopy});

        HistoryTools.resetState(node, nodeEl)
	}

    static resetState(node, nodeEl) {
        // reset node
        let nodeId = node.nodeId
        let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)
        parentNode.children[nodeId] = node

        // reset nodeEl
        let parentNodeEl = getnodeElementByNodeId(parentNode.nodeId)
        let currentNodeEl = getnodeElementByNodeId(nodeId)
        parentNodeEl.insertBefore(nodeEl, currentNodeEl)
        currentNodeEl.remove()

        visitAllElements(nodeEl, removeElementDescriptionCollapsible)
        visitAllElements(nodeEl, appendElementDescriptionCollapsible)
        
        closeCollapsible(nodeId)
    }

	static record(nodeId) {
        let nodeEl = getnodeElementByNodeId(nodeId).cloneNode(true)
        let node = JSON.parse(JSON.stringify(getSiteRepNodeByNodeId(nodeId)))
		HistoryTools.undoStack.push({node, nodeEl});
		HistoryTools.redoStack.length = 0;
	}
}
  