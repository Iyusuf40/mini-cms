// - collapsible
//     - add child
//     - add node_before
//     - add node_after
//         - on click
//         - present form with fields
//             - type
//             - content
//             - image picker
//             - ---- may include files in the future
//     - add heading
//     - add subheading
//     - delete node
//     - increase font size
//     - decrease font size
//     - font color
//     - font weight - [thin, normal, bold]
//     - background color
//     - orientation - [vertical, horizontal]
//     - position - [left, center, right]
//     - shiftTop
//     - shiftLeft
//     - shiftBottom
//     - shiftRight
//     - padding
//     - paddingTop
//     - paddingLeft
//     - paddingBottom
//     - paddingRight
//     - edgeRounding
//     - margin

const collapsibleFieldElementTypeAction = [
    ["add child", "button", addChild],
    ["add node before", "button", addNodeBefore],
    ["add node after", "button", addNodeAfter],
    ["add heading", "button", addHeading],
    ["add subheading", "button", addSubHeading],
    ["delete node", "button", deleteNode],
    ["increase font size", "button", increaseFontSize],
    ["decrease font size", "button", decreaseFontSize],
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
    collapsibleContainersContainer.style.position = "relative"
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

    // check if root html is the required node
    if (SITE_REP.nodeId === nodeId) return SITE_REP

    let relevantNode = SITE_REP[window.location.pathname]
    return recursivelyFindNodeWithId(relevantNode, nodeId)
}

function recursivelyFindNodeWithId(root, nodeId) {
    if (!root) return null
    if (root.nodeId === nodeId) return root
    if (root.children){
        for (const node of Object.values(root.children)) {
            if (node.nodeId === nodeId) return node
            if (node.children) {
                let res = recursivelyFindNodeWithId(node, nodeId)
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

    let path = window.location.pathname

    if (!siteRepNode[path] && path === "/") 
        siteRepNode[path] = {}
    else if (!siteRepNode[path])
        throw new Error(`updateSiteRep: node at path ${path} does not exist`)
    
    siteRepNode[path][field] = value
}

function addChild(nodeId, value) {
    
}

function addNodeBefore(nodeId, value) {
    // pull up form to enter node details
}

function addNodeAfter(nodeId, value) {

}

function addHeading(nodeId, value) {
    // pull up form to enter heading details
    // add child
}

function addSubHeading(nodeId, value) {

}

function deleteNode(nodeI, value) {
    
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
    const postOptLocal = { ...postOpt, body: data }
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
    const putOptLocal = { ...putOpt, body: data }
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