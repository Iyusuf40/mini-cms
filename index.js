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
    ["step", "input:text", setStep]
]

var STEP  = 2
var SITE_REP = null

var baseUrl = "http://localhost:3000"

function makeElementDescriptionCollapsible(nodeId) {
    let collapsibleContainer = document.createElement("div")
    collapsibleContainer.style.display = "flex"
    collapsibleContainer.style.flexDirection =  "column"
    collapsibleContainer.style.gap = "0.5rem"
    collapsibleContainer.classList.add("element--description--collapsible")
    collapsibleContainer.style.position = "absolute"

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
                            action(nodeId, STEP)
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

    return collapsibleContainer
}

function appendElementDescriptionCollapsible(nodeEl) {
    let nodeId = nodeEl.getAttribute("nodeId")
    let collapsible = makeElementDescriptionCollapsible(nodeId || "")
    nodeEl.appendChild(collapsible)
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

function getNodeByNodeId(nodeId) {
    const nodes = document.querySelectorAll(".__node")
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        if (node.getAttribute("nodeId") === nodeId) return node
    }
    return null
}

function updateSiteRep(nodeId, field, value) {

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
}

function addSubHeading(nodeId, value) {

}

function deleteNode(nodeI, value) {

}

function increaseFontSize(nodeId, STEP) {
    let nodeEl = getNodeByNodeId(nodeId)

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
    let nodeEl = getNodeByNodeId(nodeId)

    if (!nodeEl) return
    let prevFontSize = getFontSize(nodeEl)
    let updatedValue = prevFontSize - Number(STEP)
    nodeEl.style.fontSize = `${updatedValue}px`
    updateSiteRep(nodeId, "fontSize", `${updatedValue}`)
}

function setFontColor(nodeId, value) {

}

function setFontWeight(nodeId, value) {

}

function setBackgroundColor(nodeId, value) {
    let nodeEL = getNodeByNodeId(nodeId)

    if (!nodeEL) return
    nodeEL.style.backgroundColor = value
    updateSiteRep(nodeId, "backgroundColor", value)
}

function setOrientation(nodeId, value) {

}

function setTextAlignment(nodeId, value) {

}

function shiftUp(nodeId, value){
    // mess with shiftBottom
    // shiftBottom maps to backend siterep
}

function shiftDown(nodeId, value){
    // mess with shiftTop
    // shiftTop maps to backend siterep
}

function shiftLeft(nodeId, value) {
    // mess with shiftRight
}

function shiftRight(nodeId, value) {
    // mess with shiftLeft
}

function setMargin(nodeId, value) {

}

function setPadding(nodeId, value) {

}

function setPaddingTop(nodeId, value) {

}

function setPaddingBottom(nodeId, value) {

}

function setPaddingLeft(nodeId, value) {

}

function setPaddingRight(nodeId, value) {

}

function setEdgeRounding(nodeId, value) {
    
}

function setStep(nodeId, value) {
    let numValue = Number(value)
    if (numValue || numValue === 0) {
        STEP = numValue
    }
}


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
  