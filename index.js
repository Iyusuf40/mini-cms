function makeElementDescriptionCollapsible() {

}

function makeNode(tag) {
    if (!tag) {
        tag = "div"
    }


}

function appendElementDescriptionCollapsible(node) {

}

function addEventListenerToNode(node) {

}

window.onload = function () {
    document.querySelectorAll(".__node").forEach( node => {
        addEventListenerToNode(node)
        appendElementDescriptionCollapsible(node)
    })
}