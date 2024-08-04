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
    ["align", "input:radio:left:center:right", setTextAlignment],
    ["position", "input:radio:start:middle:end", setSelfAlignment],
    ["shift up", "button", shiftUp],
    ["shift down", "button", shiftDown],
    ["shift left", "button", shiftLeft],
    ["shift right", "button", shiftRight],
    ["duplicate", "button", duplicateNode],
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

var STEP  = 2
var SITE_REP = null

var baseUrl = "http://localhost:3000"

function makeElementDescriptionCollapsible(nodeId, isMainElement=false) {
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
    collapsibleContainer.style.width = "fit-content"
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

    if (isMainElement) appendAddHeaderAndAddFooterToCollapsible(collapsibleContainer)

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
                    fieldEl.oninput = (e) => {
                        e.preventDefault()
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
                
                if (inputType === "text") fieldEl.onclick = (e) => e.preventDefault()
                fieldEl.oninput = (e) => {
                    e.preventDefault()
                    action(nodeId, e.target.value)
                }
            }

        } else if (tag === "textarea") {
            let fieldEl = document.createElement(tag)
            fieldEl.style.display = "block"
            fieldEl.placeholder = "text content"

            collapsibleContainer.appendChild(fieldEl)

            fieldEl.onclick = (e) => e.preventDefault()
            fieldEl.oninput = (e) => {
                e.preventDefault()
                action(nodeId, e.target.value)
            }
        } else {
            let fieldEl = document.createElement(tag)
            fieldEl.style.display = "block"
            fieldEl.innerText = text

            collapsibleContainer.appendChild(fieldEl)
            // on click

            fieldEl.onclick = (e) => {
                e.preventDefault()
                action(nodeId, STEP)
            }
        }
    }

    return collapsibleContainersContainer
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
    nodeEl.appendChild(collapsible)
    nodeEl.addEventListener('contextmenu', function(e) {
        e.preventDefault()
        let collapsibleTglBtn = getCollapsibleToggleBtn(nodeId)
        collapsibleTglBtn.click()
    })
}

function addEventListenerToToggleBtn(toggleBtn, toggleContent) {
    toggleBtn.addEventListener('click', (event) => {
        event.preventDefault()
        let mouseX = event.clientX;
    
        // check if the form will be cut off on the right side
        if (mouseX - toggleContent.offsetWidth < 0) {
            toggleContent.style.left = "0px";
        }

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
    fetch(baseUrl + "/siterep?path=" + window.location.pathname, {
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

    if (SITE_REP.header?.nodeId === nodeId) return SITE_REP.header
    if (SITE_REP.footer?.nodeId === nodeId) return SITE_REP.footer

    let relevantNode = SITE_REP[window.location.pathname]
    return recursivelyFindNodeWithId(relevantNode, nodeId)
}

function updateSiteRep(nodeId, field, value) {
    let siteRepNode = getSiteRepNodeByNodeId(nodeId)
    if (!siteRepNode) {
        throw new Error(`updateSiteRep: node with nodeId: ${nodeId} doesnt exist in siterep`)
    }

    siteRepNode[field] = value
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

function closeCollapsible(nodeId) {
    let nodeEl = getnodeElementByNodeId(nodeId)

    if (!nodeEl) return
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

    let imageInput = document.createElement("input")
    imageInput.setAttribute("type", "file")
    imageInput.style.display = "block"
    nodeElCreationForm.appendChild(imageInput)
    
    function disableIrrelevantFields() {
        if (typeSelectorEl.value === "a") {
            linkInput.disabled = false
            textContent.disabled = true
            imageInput.disabled = true    
        } else if (typeSelectorEl.value === "img") {
            imageInput.disabled = false
            textContent.disabled = true
            linkInput.disabled = true
        } else {
            textContent.disabled = false
            linkInput.disabled = true 
            imageInput.disabled =true
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
            "a": linkInput.value,
            "img": imageInput.files?.item(0),
        }
        return possibleValues[selectOpt] ? possibleValues[selectOpt] : textContent.value
    }

    let appendChildBtn = document.createElement("button")
    appendChildBtn.innerText = "add"
    appendChildBtn.onclick = () => {
        appendContentToNodeEl(
            nodeId, 
            typeSelectorEl.value, 
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
        newNode.href = value
        newNode.text = "link"
        childEl.setAttribute("href", value)
        let p = document.createElement("p")
        value = "link"
        p.innerText = value
        childEl.style.display = "block"
        childEl.appendChild(p)
    } else if (tag === "img") {
        let newNodeId = Date.now().toString()
        appendContentToNodeEl(nodeId, "div", "", newNodeId, position)
        decreaseWidth(newNodeId, 100)
        let imageContainer = getnodeElementByNodeId(newNodeId)
        if (!imageContainer) {
            alert(`appendContentToNodeEl: element with newNodeId ${newNodeId} does not exist`)
            throw new Error(`appendContentToNodeEl: element with newNodeId ${newNodeId} does not exist`)
        }

        let childNodeId = Date.now().toString()

        let parentNode = getSiteRepNodeByNodeId(newNodeId)
    
        let childEl = document.createElement(tag)

        const imageId = Date.now().toString()
        childEl.setAttribute("id", imageId)
        childEl.setAttribute("max-width", "100%")
        childEl.setAttribute("max-height", "100%")
        childEl.setAttribute("width", "100%")
        childEl.setAttribute("height", "100%")
        childEl.style.display = "inline-block"
        childEl.style.objectFit = "contain"   // ---
        childEl.style.borderRadius = "inherit"  // ---
        let newNode = {tag, width: "100%", height: "100%", edgeRounding: "inherit"}
        newNode.nodeId = childNodeId
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
    } else {
        let p = document.createElement("p")
        p.innerText = value
        childEl.appendChild(p)
    }

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
    nodeEl.style.maxWidth = `100%`
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
    nodeEl.style.maxWidth = `100%`
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

        let newNodeId = Date.now().toString()

        nodeEl.setAttribute("nodeId", newNodeId)
        nodeEl.setAttribute("prevNodeId", nodeId)
    }
}

function setNewNodeIdsToNodeClone(cloneEl, nodeClone) {
    let prevNodeId = cloneEl.getAttribute("prevNodeId")
    let nodeId = cloneEl.getAttribute("nodeId")

    findNodeWithIdAndUpdateId(nodeClone, prevNodeId, nodeId)
    Array.from(cloneEl.children).forEach(child => {
        setNewNodeIdsToNodeClone(child, nodeClone)
    })
}

function findNodeWithIdAndUpdateId(node, prevNodeId, currentNodeId) {
    if (node.nodeId === prevNodeId) {
        node.nodeId = currentNodeId
        return
    }

    if (node.children) {
        for (let childNode of Object.keys(node.children)) {
            findNodeWithIdAndUpdateId(childNode, prevNodeId, currentNodeId)
        }
    }
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

    let relativePath = window.location.pathname + path
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
  