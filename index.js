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
        console.log(roomsDD)
        rooms.forEach(r => {
            console.log(r)
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
        console.log(d)
        if (d.deleted === false) {
            ctx.save()
            console.log(ctx)
            var rad = d.rotation * Math.PI / 180;
            ctx.translate(d.xPos + d.xSize / 2, d.yPos + d.ySize / 2)
            ctx.rotate(rad)
            ctx.translate(-1 * d.xPos + d.xSize / 2, -1 * d.yPos + d.ySize / 2)
            console.log("draw", i)
            ctx.drawImage(d.image, d.xPos - d.xSize, d.yPos, d.xSize, d.ySize)
            // ctx.drawImage(d.image, 0,0, d.xSize, d.ySize)
            ctx.restore()
            console.log(ctx)
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
    console.log(roomCont.right, roomCont.left, e.offsetX)
    console.log(e)
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
    console.log(dragStartDetails)
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