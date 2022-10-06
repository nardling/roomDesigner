class drawnImage {
    constructor(_image, _imgSrc, _xPos, _yPos, _name) {
        this.id = 0
        this.image = _image
        this.imageSrc = _imgSrc
        this.xPos = _xPos
        this.yPos = _yPos
        this.rotation = 0
        this.deleted = false
        this.name = _name
        this.xSize = 100
        this.ySize = 100
        this.selected = false
    }
}

class roomInfo {
    constructor() {
        this.id = 0
        this.length = 0
        this.width = 0
        this.elements = []
        this.roomName = ""
    }

    validate = () => {
        if (this.items.length > 0 && this.length > 0 && this.width > 0)
            return true
    }
}

let selectedImage = {}
const url = "http://localhost:3000/bathRooms"
const currentRoomInfo = new roomInfo()
const room = document.getElementById("room")
const roomCont = room.getBoundingClientRect()
const ctx = room.getContext('2d')
let drawnItems = []
const dragStartDetails = {
    xOffset: 0,
    yOffset: 0
}

const loadForm = document.getElementById("room-loader")
loadForm.onsubmit = (e) => {
    e.preventDefault()
    const lclUrl = url + "/" + e.target["existing-rooms"].value
    drawnItems = []
    let imageCount = 0
    fetch(lclUrl).then(res => {
        const r = res.json()
        return r
    })
    .then(room => {
        resizeRoom(room.width, room.length)
        room.elements.forEach(e => {
            imageCount++
            const image = new Image()
            image.onload = function(){
                imageCount--
                const element = new drawnImage(image, e.imageSrc, e.xPos, e.yPos, e.name)
                element.rotation = parseInt(e.rotation)
                drawnItems.push(element)
                drawItem(element)
            }
            image.src = e.imageSrc
        })
    })
}

const loadRooms = () => {
    fetch(url).
    then(res => res.json()).
    then(rooms => {
        const roomsDD = document.getElementById("existing-rooms")
        rooms.forEach(r => {
            const newElement = document.createElement("option")
            newElement.value = r.id
            newElement.textContent = r.roomName
            roomsDD.appendChild(newElement)
        })
    })
}

const resizeRoom = (w, l) => {
    let ratio = w/l
    currentRoomInfo.width = w
    currentRoomInfo.length = l
    if (ratio > 1)
    {
        ratio = 1 / ratio
        currentRoomInfo.width = l
        currentRoomInfo.length = w
    }
    room.width = 500
    room.height = 500 * ratio
    document.getElementById("room-parent").style.display="block"
}

const sizerForm = document.getElementById("room-sizer")
sizerForm.onsubmit = (e) => {
    e.preventDefault()
    clearRoom()
    const wid = e.target["width"].value
    const len = e.target["length"].value
    resizeRoom(wid, len)
}

const newRoomForm = document.getElementById("room-saver")
newRoomForm.onsubmit = (e) => {
    e.preventDefault()
    currentRoomInfo.elements = drawnItems
    const inputName = e.target["new-room-name"].value
    currentRoomInfo.roomName = inputName
    fetch(url, {
        method:'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentRoomInfo)
    }).then(res=>res.json())
    .then(jr => console.log(jr))
    .catch(e => console.log(e))
}

const clearRoom = () =>
{
    ctx.clearRect(0,0,room.width,room.height)
    document.getElementById("item-list-body").innerHTML = ''
}

const drawItem = item => {
    if (item.deleted === false) {
        ctx.save()
        var rad = item.rotation * Math.PI / 180;
        var resetRad = (2 * Math.PI) - rad
        ctx.rotate(rad)
        if (item.rotation == 90) {
            rX = item.yPos
            rY = (item.xPos + item.xSize) * -1
        } else if (item.rotation == 180) {
            rX = item.xPos * (-1) - item.xSize
            rY = item.yPos * (-1) - item.ySize
        } else if (item.rotation == 270) {
            rX = (item.yPos + item.ySize) * (-1)
            rY = item.xPos
        } else {
            item.rotation = 0
            rX = item.xPos
            rY = item.yPos
        }
        ctx.drawImage(item.image, rX, rY, item.xSize, item.ySize)
        // ctx.rect(rX, rY, d.xSize, d.ySize)
        // ctx.strokeStyle = "black"
        // ctx.stroke()
        ctx.restore()
        // ctx.rotate(resetRad)
        addItemToTable(item, item.name)
    }
}

const reDraw = () => {
    clearRoom()

    let i = 0
    drawnItems.forEach(d => {
        drawItem(d)
    })
}

const resizeItem = (image, width, length) => {
    image.xSize = (width / currentRoomInfo.width) * room.width
    image.ySize = (length / currentRoomInfo.length) * room.height
}

const addItemToTable = (drawnImage, itemName) => {
    const itemTable = document.getElementById("item-list-body")
    const newRow = document.createElement("tr")
    const newData = document.createElement("td")
    newData.textContent = itemName
    
    const newRotateButton = document.createElement("button")
    newRotateButton.textContent = "Rotate"
    newRotateButton.onclick = (e) => {
        drawnImage.rotation += 90
        reDraw()
    }
    newRotateButton.style.margin = "10px"

    const newResizeButton = document.createElement("button")
    newResizeButton.textContent = "Resize"
    newResizeButton.onclick = (e) => {
        const resizeForm = document.getElementById("resize-form")
        resizeForm.style.display="block"
        resizeForm.onsubmit = (e) => {
            e.preventDefault()
            const wid = e.target["new-item-width"].value
            const len = e.target["new-item-length"].value
            resizeItem(drawnImage, wid, len)
            reDraw()
        }
    }
    newResizeButton.style.margin = "10px"
    
    const newRemoveButton = document.createElement("button")
    newRemoveButton.textContent = "Remove"
    newRemoveButton.onclick = (e) => {
        drawnImage.deleted = true
        reDraw()
    }
    newRemoveButton.style.margin = "10px"

    newRow.appendChild(newData)
    newRow.appendChild(newRotateButton)
    newRow.appendChild(newResizeButton)
    newRow.appendChild(newRemoveButton)

    // newRow.onclick = (e) => {
    //     console.log(e)
    //     if (e.target.nodeName == 'TR')
    //     {
    //         drawnImage.selected = true
    //         selectedImage = drawnImage
    //         reDraw()
    //     }
    // }

    if (drawnImage.selected)
    {
        newRow.style.background = "pink"
    }
    else
    {
        newRow.style.background = "white"
    }
    itemTable.appendChild(newRow)
}

const dragged = (e, imgSrc, itemName) => {
    const roomCont = room.getBoundingClientRect()
    const ctx = room.getContext('2d')
    const image = new Image()
    if (e.offsetX > roomCont.left && e.offsetX < roomCont.right
        && e.offsetY > roomCont.top && e.offsetY < roomCont.bottom
        && document.getElementById("room-parent").style.display == "block")
    {
        xPos = e.offsetX - roomCont.left - dragStartDetails.xOffset
        yPos = e.offsetY - roomCont.top - dragStartDetails.yOffset
        image.onload = function(){
            ctx.drawImage(image, xPos, yPos, 100, 100)
            ctx.rect(xPos, yPos, 100, 100)
            ctx.strokeStyle = "black"
            ctx.stroke()
        }
        image.src = imgSrc
        image.style.border = "solid"
        const newDrawnImage = new drawnImage(image, imgSrc, xPos, yPos, itemName)
        addItemToTable(newDrawnImage, itemName)
        drawnItems.push(newDrawnImage)
    }
}

//#region /* draggable icons */
const toilet = document.getElementById("toilet-icon")
toilet.ondragend = (e) => {
    dragged(e, "/imgs/toilet.png", "Toilet")
}
toilet.ondragstart = (e) => {
    dragStartDetails.xOffset = e.offsetX
    dragStartDetails.yOffset = e.offsetY
}

const tub = document.getElementById("tub-icon")
tub.ondragend = (e) => {
    dragged(e, "/imgs/bathtub.png", "Bath Tub")
}
tub.ondragstart = (e) => {
    dragStartDetails.xOffset = e.offsetX
    dragStartDetails.yOffset = e.offsetY
}

const shower = document.getElementById("shower-icon")
shower.ondragend = (e) => {
    dragged(e, "/imgs/shower.png", "Shower")
}
shower.ondragstart = (e) => {
    dragStartDetails.xOffset = e.offsetX
    dragStartDetails.yOffset = e.offsetY
}

const sink = document.getElementById("sink-icon")
sink.ondragend = (e) => {
    dragged(e, "/imgs/sink.png", "Sink")
}
sink.ondragstart = (e) => {
    dragStartDetails.xOffset = e.offsetX
    dragStartDetails.yOffset = e.offsetY
}
//#endregion

const findImage = (x, y) => {
    const roomCont = room.getBoundingClientRect()
    drawnItems.forEach(element => {
        elementAbsPos = {
            x: element.xPos + roomCont.left,
            y: element.yPos + roomCont.top
        }
        
        if (x > elementAbsPos.x && x < (elementAbsPos.x + 100) &&
            y > elementAbsPos.y && y < (elementAbsPos.y + 100))
        {
            selectedImage.selected = false
            selectedImage = element;
            selectedImage.selected = true
            reDraw()
        }
    });
}

room.addEventListener("mousedown", (e) => {
    e.preventDefault()
    findImage(e.clientX, e.clientY)
    return false
})
room.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
});

const arrowUp = 38
const arrowDown = 40
const arrowLeft = 37
const arrowRight = 39
document.onkeydown = (e) => {
    if (typeof(selectedImage.name) != "undefined")
    {
        if (e.key == "ArrowRight")
        {
            selectedImage.xPos += 5
            reDraw()
        }
        else if (e.key == "ArrowLeft")
        {
            selectedImage.xPos -= 5
            reDraw()
        }
        else if (e.key == "ArrowUp")
        {
            selectedImage.yPos -= 5
            reDraw()
        }
        else if (e.key == "ArrowDown")
        {
            selectedImage.yPos += 5
            reDraw()
        }
        else if (e.key == "Enter")
        {
            selectedImage.selected = false
            selectedImage = {}
            reDraw()
        }
    }
}

loadRooms()