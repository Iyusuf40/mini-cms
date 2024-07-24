const collapsibleFieldElementTypeAction = [
    ["content", "textarea", setContent],
    ["add child", "button", addChild],
    ["add node before", "button", addNodeBefore],
    ["add node after", "button", addNodeAfter],
    ["add heading", "button", addHeading],
    ["add subheading", "button", addSubHeading],
    ["delete node", "button", deleteNode],
    ["increase font size", "button", increaseFontSize],
    ["decrease font size", "button", decreaseFontSize],
    ["increase width", "button", increaseWidth],
    ["decrease width", "button", decreaseWidth],
    ["increase height", "button", increaseHeight],
    ["decrease height", "button", decreaseHeight],
    ["font color", "input:color", setFontColor],
    ["font weight", "input:radio:lighter:normal:bold", setFontWeight],
    ["background color", "input:color", setBackgroundColor],
    ["orientation", "input:radio:vertical:horizontal", setOrientation],
    ["gap", "input:text", setGap],
    ["position", "input:radio:left:center:right", setTextAlignment],
    ["shift up", "button", shiftUp],
    ["shift down", "button", shiftDown],
    ["shift left", "button", shiftLeft],
    ["shift right", "button", shiftRight],
    ["margin", "input:text", setMargin],
    ["padding", "input:text", setPadding],
    ["paddingTop", "input:text", setPaddingTop],
    ["paddingBottom", "input:text", setPaddingBottom],
    ["paddingLeft", "input:text", setPaddingLeft],
    ["paddingRight", "input:text", setPaddingRight],
    ["edgeRounding", "input:text", setEdgeRounding],
    ["extendCss", "input:text", setExtendCss],
    ["extendHtml", "input:text", setExtendHtml],
    ["step", "input:text", setStep],
]

var STEP  = 2
var SITE_REP = null

var baseUrl = "http://localhost:3000"

function makeElementDescriptionCollapsible(nodeId) {
    let collapsibleContainersContainer = document.createElement("div")
    collapsibleContainersContainer.classList.add(nodeId) // identify each node's modifier
    collapsibleContainersContainer.style.position = "absolute"
    collapsibleContainersContainer.style.right = "0px"
    collapsibleContainersContainer.style.top = "0px"
    collapsibleContainersContainer.style.display = "inline-block"
    collapsibleContainersContainer.style.width = "100%" 
    let collapsibleContainer = document.createElement("div")
    collapsibleContainersContainer.appendChild(collapsibleContainer)
    collapsibleContainer.style.display = "flex"
    collapsibleContainer.style.flexDirection =  "column"
    collapsibleContainer.style.right = "5px"
    collapsibleContainer.style.gap = "0.5rem"
    collapsibleContainer.classList.add("element--description--collapsible")
    collapsibleContainer.style.position = "absolute"

    let toggleBtn = document.createElement("button")
    toggleBtn.classList.add("toggle-button")
    if (nodeId === "0") {
        toggleBtn.style.zIndex = "100"
    }
    toggleBtn.textContent = "+"
    
    addEventListenerToToggleBtn(toggleBtn, collapsibleContainer)

    collapsibleContainer.classList.add("toggle-content")

    collapsibleContainersContainer.appendChild(toggleBtn)

    for (const collapsibleFieldDesc of collapsibleFieldElementTypeAction) {
        let [text, elementType, action] = collapsibleFieldDesc
        let tag = elementType
        if (elementType.startsWith("input")) {
            tag = "input"
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
                    // on input
                    fieldEl.oninput = (e) => {
                        if (e.target.checked) {
                            action(nodeId, e.target.id)
                        }
                    }
                })
                collapsibleContainer.appendChild(radioContainer)
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
                collapsibleContainer.appendChild(fieldContainer)
                // on input
                fieldEl.oninput = (e) => {
                    action(nodeId, e.target.value)
                }
            }

        } else if (tag === "textarea") {
            let fieldEl = document.createElement(tag)
            fieldEl.style.display = "block"
            fieldEl.placeholder = "text content"

            collapsibleContainer.appendChild(fieldEl)

            fieldEl.oninput = (e) => {
                action(nodeId, e.target.value)
            }
        } else {
            let fieldEl = document.createElement(tag)
            fieldEl.style.display = "block"
            fieldEl.innerText = text

            collapsibleContainer.appendChild(fieldEl)
            // on click

            fieldEl.onclick = () => {
                action(nodeId, STEP)
            }
        }
    }

    return collapsibleContainersContainer
}

function getElementDescriptionCollapsible(nodeEl, nodeId) {
    return nodeEl.getElementsByClassName(`${nodeId}`)[0]
}

function appendElementDescriptionCollapsible(nodeEl) {
    let nodeId = nodeEl.getAttribute("nodeId")
    let collapsible = makeElementDescriptionCollapsible(nodeId || "")
    nodeEl.appendChild(collapsible)
}

function addEventListenerToToggleBtn(toggleBtn, toggleContent) {
    toggleBtn.addEventListener('click', () => {
        if (toggleContent.classList.contains('open')) {
            toggleContent.classList.remove('open');
            toggleBtn.textContent = '+';
        } else {
            toggleContent.classList.add('open');
            toggleBtn.textContent = '-';
        }
    });
}

function makeNode(tag) {
    if (!tag) {
        tag = "div"
    }

}

function addEventListenerToNode(node) {

}

window.onload = function () {
    document.querySelectorAll(".__node").forEach( nodeEl => {
        addEventListenerToNode(nodeEl)
        appendElementDescriptionCollapsible(nodeEl)
    })
    setSiteRep()
    addPublishSiteRepBtn()
}

async function setSiteRep() {
    fetch(baseUrl + "/siterep")
    .then(response => {
        if (response.status !== 200){
            alert("no project found")
        }
        return response.json()
    })
    .then(siterep => {
        SITE_REP = siterep
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

function getnodeElementByNodeId(nodeId) {
    const nodes = document.querySelectorAll(".__node")
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

    let relevantNode = SITE_REP[window.location.pathname]
    return recursivelyFindNodeWithId(relevantNode, nodeId)
}

function getSiteRepNodeParentByChildNodeId(nodeId) {
    if (!SITE_REP) {
        alert("getSiteRepNodeParentByChildNodeId: SITE_REP should not be null")
        throw new Error("getSiteRepNodeParentByChildNodeId: SITE_REP should not be null")
    }

    let relevantNode = SITE_REP[window.location.pathname]
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

function updateSiteRep(nodeId, field, value) {
    let siteRepNode = getSiteRepNodeByNodeId(nodeId)
    if (!siteRepNode) {
        throw new Error(`updateSiteRep: node with nodeId: ${nodeId} doesnt exist in siterep`)
    }

    siteRepNode[field] = value
}

function deleteNodeInSiteRep(nodeId) {
    let siteRepNode = getSiteRepNodeByNodeId(nodeId)
    if (!siteRepNode) {
        throw new Error(`deleteNodeInSiteRep: node with nodeId: ${nodeId} doesnt exist in siterep`)
    }

    let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)
    if (!parentNode) {
        throw new Error("deleteNodeInSiteRep: parent node not found")
    }

    if (!parentNode.children[nodeId]) {
        throw new Error("deleteNodeInSiteRep: child not found in parent") 
    }
    
    delete parentNode.children[nodeId]
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

function setTextInFirstChildParagraph(nodeEl, text) {
    let firstP = nodeEl.querySelector("p")
    if (!firstP) {
        let p = document.createElement("p")
        p.innerText = text
        nodeEl.appendChild(p)
    } else {
        firstP.innerText = text
    }
}

function addChild(nodeId, value, newNodeId="", position="") {
    createNodeElCreationForm({nodeId, newNodeId, position})
}

function createNodeElCreationForm({nodeId, nodeCreationTypeOptions = [
    {type: "container", value: "div"},
    {type: "paragraph", value: "p"},
    {type: "heading", value: "h1"},
    {type: "subheading", value: "h3"},
    // {type: "image", value: "img"},
], newNodeId="", position=""}) {
    let body = document.querySelector("body")
    let nodeElCreationForm = document.createElement("div")
    nodeElCreationForm.style.position = "absolute"
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

    let cancelBtn = document.createElement("button")
    cancelBtn.innerText = "cancel"
    cancelBtn.onclick = () => nodeElCreationForm.remove()

    let appendChildBtn = document.createElement("button")
    appendChildBtn.innerText = "add"
    appendChildBtn.onclick = () => {
        appendContentToNodeEl(nodeId, typeSelectorEl.value, textContent.value, newNodeId, position)
        nodeElCreationForm.remove()
    }

    nodeElCreationForm.appendChild(cancelBtn)
    nodeElCreationForm.appendChild(appendChildBtn)

    body.appendChild(nodeElCreationForm)
    return nodeElCreationForm
}

function appendContentToNodeEl(nodeId, tag, text, newNodeId="", position="") {
    let nodeEl = getnodeElementByNodeId(nodeId)
    if (!nodeEl) {
        alert(`appendContentToNodeEl: element with nodeId ${nodeId} does not exist`)
        throw new Error(`appendContentToNodeEl: element with nodeId ${nodeId} does not exist`)
    }

    let newNode = {tag, text}
    let childNodeId = newNodeId || Date.now().toString()
    newNode.nodeId = childNodeId
    let parentNode = getSiteRepNodeParentByChildNodeId(nodeId)

    // update ui
    let childEl = document.createElement(tag)
    childEl.innerText = text // to-do: use p tag for text?
    childEl.classList.add("__node")
    childEl.setAttribute("nodeId", childNodeId)
    appendElementDescriptionCollapsible(childEl)
    switch (position) {
        case "before":
            addChildToSiteRep(parentNode.nodeId, newNode)
            nodeEl.before(childEl)
            break
        case "after":
            addChildToSiteRep(parentNode.nodeId, newNode)
            nodeEl.after(childEl)
            break
        default:
            nodeEl.appendChild(childEl) 
            addChildToSiteRep(nodeId, newNode)
    } 
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
    list.sort((a, b) => Number(b) - Number(a))
    return list
}
function addChildToSiteRep(nodeId, child) {
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
    addChild(nodeId, "", reduceDateTimeNodeId(nodeId), "before")
}

function addNodeAfter(nodeId, value) {
    addChild(nodeId, "", increaseDateTimeNodeId(nodeId), "after")
}

function addHeading(nodeId, value) {
    createNodeElCreationForm({nodeId, nodeCreationTypeOptions: [{type: "heading", value: "h1"}]})
}

function addSubHeading(nodeId, value) {
    createNodeElCreationForm({nodeId, nodeCreationTypeOptions: [{type: "subheading", value: "h3"}]})
}

function deleteNode(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.remove()
    deleteNodeInSiteRep(nodeId)   
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


function increaseWidth(nodeId, STEP) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevWidth = nodeEl.offsetWidth 
        - Number(getCssProp(nodeEl, "padding-left").replace("px", "") || 0)
        - Number(getCssProp(nodeEl, "padding-right").replace("px", "") || 0)
    let updatedValue = Number(STEP) + prevWidth
    nodeEl.style.width = `${updatedValue}px`
    updateSiteRep(nodeId, "width", `${updatedValue}`)
}

function decreaseWidth(nodeId, STEP) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevWidth = nodeEl.offsetWidth 
        - Number(getCssProp(nodeEl, "padding-left").replace("px", "") || 0)
        - Number(getCssProp(nodeEl, "padding-right").replace("px", "") || 0)
    let updatedValue = prevWidth - Number(STEP)
    nodeEl.style.width = `${updatedValue}px`
    updateSiteRep(nodeId, "width", `${updatedValue}`)
}

function increaseHeight(nodeId, STEP) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevHeight = nodeEl.offsetHeight
        - Number(getCssProp(nodeEl, "padding-top").replace("px", "") || 0)
        - Number(getCssProp(nodeEl, "padding-bottom").replace("px", "") || 0)
    let updatedValue = Number(STEP) + prevHeight
    nodeEl.style.height = `${updatedValue}px`
    updateSiteRep(nodeId, "height", `${updatedValue}`)
}

function decreaseHeight(nodeId, STEP) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    let prevHeight = nodeEl.offsetHeight
        - Number(getCssProp(nodeEl, "padding-top").replace("px", "") || 0)
        - Number(getCssProp(nodeEl, "padding-bottom").replace("px", "") || 0)
    let updatedValue = prevHeight - Number(STEP)
    nodeEl.style.height = `${updatedValue}px`
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
    nodeEl.style.gap = "1rem"
    nodeEl.style.flexDirection = value === "horizontal" ? "row" : "column"
    updateSiteRep(nodeId, value, true)

    let opposite = value === "horizontal" ? "vertical" : "horizontal"
    updateSiteRep(nodeId, opposite, false)
}

function setGap(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.gap = `${value}px`
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

function setMargin(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.margin = `${value}px`
    updateSiteRep(nodeId, "margin", value)
}

function setPadding(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.padding = `${value}px`
    updateSiteRep(nodeId, "padding", value)
}

function setPaddingTop(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.paddingTop = `${value}px`
    updateSiteRep(nodeId, "paddingTop", value)
}

function setPaddingBottom(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.paddingBottom = `${value}px`
    updateSiteRep(nodeId, "paddingBottom", value)
}

function setPaddingLeft(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.paddingLeft = `${value}px`
    updateSiteRep(nodeId, "paddingLeft", value)
}

function setPaddingRight(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.paddingRight = `${value}px`
    updateSiteRep(nodeId, "paddingRight", value)
}

function setEdgeRounding(nodeId, value) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
    nodeEl.style.borderRadius = `${value}px`
    updateSiteRep(nodeId, "edgeRounding", value)
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
            console.log([cssProp, cssVal])
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
    nodeEl.insertAdjacentHTML('beforeend', value);
    updateSiteRep(nodeId, "extendedHtml", value)
}

function setStep(nodeId, value) {
    let numValue = Number(value)
    if (numValue || numValue === 0) {
        STEP = numValue
    }
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
    if (!SITE_REP[path]) return
    
    // prevent each path from having root properties
    let pathSiteRep = {}
    // allow buildPathHtml at Backend
    pathSiteRep[path] = SITE_REP[path]
    pathSiteRep["path"] = path
    pathSiteRep.title = SITE_REP.title
    pathSiteRep.footer = SITE_REP.footer

    // TO-DO check if changed so as not to traverse network

    const url = baseUrl + "/"

    let res = await putData(url, {data: pathSiteRep})
    if (res.error) {
        alert(res.error)
    }
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
    if (indexOfRefNodeId === 0) return `${sortedNodeIdsNumber[indexOfRefNodeId] - 10000}`
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
    
    if (indexOfRefNodeId === 0) return Date.now().toString()

    if (indexOfRefNodeId < sortedNodeIdsNumber.length - 1) {
        return `${(sortedNodeIdsNumber[indexOfRefNodeId] + sortedNodeIdsNumber[indexOfRefNodeId + 1]) / 2}`
    }
    return Date.now().toString()   
}