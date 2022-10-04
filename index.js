class drawnImage {
    constructor(_image, _xPos, _yPos, _name) {
        this.id = 0
        this.image = _image
        this.xPos = _xPos
        this.yPos = _yPos
        this.rotation = 0
        this.deleted = false
        this.name = _name
        this.xSize = 100
        this.ySize = 100
    }
}

const room = document.getElementById("room")
const ctx = room.getContext('2d')
const drawnItems = []
const dragStartDetails = {
    xOffset: 0,
    yOffset: 0
}

const loadRooms = () => {
    fetch("http://localhost:3000/bathRooms").
    then(res => res.json()).
    then(rooms => {
        const roomsDD = document.getElementById("existing-rooms")
        rooms.forEach(r => {
            const newElement = document.createElement("option")
            newElement.value = r.roomName
            newElement.textContent = r.roomName
            roomsDD.appendChild(newElement)
        })
    })
}

const resizeRoom = (w, l) => {
    let ratio = w/l
    if (ratio > 1)
    {
        ratio = 1 / ratio
    }
    room.width = 500
    room.height = 500 * ratio
}

const sizerForm = document.getElementById("room-sizer")
sizerForm.onsubmit = (e) => {
    document.getElementById("room-parent").style.display="block"
    e.preventDefault()
    const wid = e.target["width"].value
    const len = e.target["length"].value
    resizeRoom(wid, len)
}

const newRoomForm = document.getElementById("room-saver")
newRoomForm.onsubmit = (e) => {

}

const clearRoom = () =>
{
    ctx.clearRect(0,0,room.width,room.height)
    document.getElementById("item-list-body").innerHTML = ''
}

const reDraw = () => {
    clearRoom()

    // Non-rotated rectangle
// ctx.fillStyle = 'gray';
// ctx.fillRect(80, 60, 140, 30);

// // Matrix transformation
// ctx.translate(150, 75);
// ctx.rotate(Math.PI / 2);
// // ctx.translate(-150, -75);
// // Rotated rectangle
// ctx.fillStyle = 'red';
// ctx.fillRect(80, 60, 140, 30);
// ctx.translate(-150, -75);

    let i = 0
    drawnItems.forEach(d => {
        ++i
        if (d.deleted === false) {
            ctx.save()
            var rad = d.rotation * Math.PI / 180;
            var resetRad = (2 * Math.PI) - rad
            ctx.rotate(rad)
            if (d.rotation == 90) {
                rX = d.yPos
                rY = (d.xPos + d.xSize) * -1
            } else if (d.rotation == 180) {
                rX = d.xPos * (-1) - d.xSize
                rY = d.yPos * (-1) - d.ySize
            } else if (d.rotation == 270) {
                rX = (d.yPos + d.ySize) * (-1)
                rY = d.xPos
            } else if (d.rotation == 360){
                d.rotation = 0
                rX = d.xPos
                rY = d.yPos
            }
            ctx.drawImage(d.image, rX, rY, d.xSize, d.ySize)
            ctx.restore()
            // ctx.rotate(resetRad)
            addItemToTable(d, d.name)
        }
    })
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
    const newResizeButton = document.createElement("button")
    newResizeButton.textContent = "Resize"
    const newRemoveButton = document.createElement("button")
    newRemoveButton.textContent = "Remove"
    newRemoveButton.onclick = (e) => {
        drawnImage.deleted = true
        reDraw()
    }
    newRow.appendChild(newData)
    newRow.appendChild(newRotateButton)
    newRow.appendChild(newResizeButton)
    newRow.appendChild(newRemoveButton)
    itemTable.appendChild(newRow)
}

const dragged = (e, imgSrc, itemName) => {
    const roomCont = room.getBoundingClientRect()
    const ctx = room.getContext('2d')
    const image = new Image()
    xPos = e.offsetX - roomCont.left - dragStartDetails.xOffset
    yPos = e.offsetY - roomCont.top - dragStartDetails.yOffset
    image.onload = function(){
        ctx.drawImage(image, xPos, yPos, 100, 100)
    }
    image.src = imgSrc
    newDrawnImage = new drawnImage(image, xPos, yPos, itemName)
    addItemToTable(newDrawnImage, itemName)
    drawnItems.push(newDrawnImage)
}

const tub = document.getElementById("tub-icon")
tub.ondragend = (e) => {
    dragged(e, "/imgs/bathtub.png", "Bath Tub")
}
tub.ondragstart = (e) => {
    dragStartDetails.xOffset = e.clientX
    dragStartDetails.yOffset = e.clientY
}

room.addEventListener("mousedown", (e) => {
    e.preventDefault()
    return false
})
room.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
});

loadRooms()