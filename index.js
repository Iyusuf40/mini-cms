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
    ["font weight", "input:radio", setFontWeight],
    ["background color", "input:color", setBackgroundColor],
    ["orientation", "input:radio", setOrientation],
    ["position", "input:radio", setTextAlignment],
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
    ["edgeRounding", "input:text", setEdgeRounding]
]

function makeElementDescriptionCollapsible(nodeId) {
    let collapsibleContainer = document.createElement("div")
    collapsibleContainer.classList.add("element--description--collapsible")
    collapsibleContainer.style.position = "absolute"

    for (const collapsibleFieldDesc of collapsibleFieldElementTypeAction) {
        let [text, elementType, action] = collapsibleFieldDesc
        let tag = elementType
        let inputType = ""
        if (elementType.startsWith("input")) {
            inputType = elementType.split(":")[1]
            tag = "input"
        }
        let fieldEl = document.createElement(tag)
        fieldEl.style.display = "block"
        fieldEl.innerText = text
        if (tag === "input") {
            fieldEl.setAttribute("type", inputType)
            // on change
        } else {
            // on click
        }
        collapsibleContainer.appendChild(fieldEl)
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
}

function addChild(nodeId) {

}

function addNodeBefore(nodeId) {
    // pull up form to enter node details
}

function addNodeAfter(nodeId) {

}

function addHeading(nodeId) {
    // pull up form to enter heading details
}

function addSubHeading(nodeId) {

}

function deleteNode(nodeI) {

}

function increaseFontSize(nodeId) {

}

function decreaseFontSize(nodeId) {

}

function setFontColor(nodeId) {

}

function setFontWeight(nodeId) {

}

function setBackgroundColor(nodeId) {

}

function setOrientation(nodeId) {

}

function setTextAlignment(nodeId) {

}

function shiftUp(nodeId){
    // mess with shiftBottom
    // shiftBottom maps to backend siterep
}

function shiftDown(nodeId){
    // mess with shiftTop
    // shiftTop maps to backend siterep
}

function shiftLeft(nodeId) {
    // mess with shiftRight
}

function shiftRight(nodeId) {
    // mess with shiftLeft
}

function setMargin(nodeId) {

}

function setPadding(nodeId) {

}

function setPaddingTop(nodeId) {

}

function setPaddingBottom(nodeId) {

}

function setPaddingLeft(nodeId) {

}

function setPaddingRight(nodeId) {

}

function setEdgeRounding(nodeId) {
    
}
