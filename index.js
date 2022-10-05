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

const url = "http://localhost:3000/bathRooms"
const currentRoomInfo = new roomInfo()
const room = document.getElementById("room")
const ctx = room.getContext('2d')
const drawnItems = []
const dragStartDetails = {
    xOffset: 0,
    yOffset: 0
}

const loadForm = document.getElementById("room-loader")
loadForm.onsubmit = (e) => {
    e.preventDefault()
    console.log(e.target["existing-rooms"].value)
    const lclUrl = url + "/" + e.target["existing-rooms"].value
    drawnItems.length = 0
    let imageCount = 0
    fetch(lclUrl).then(res => {
        const r = res.json()
        return r
    })
    .then(room => {
        resizeRoom(room.width, room.length)
        room.elements.forEach(e => {
            imageCount++
            console.log(imageCount, "+")
            const image = new Image()
            console.log(e.imageSrc)
            image.onload = function(){
                imageCount--
                console.log(imageCount, "-")
                const element = new drawnImage(image, e.imageSrc, e.xPos, e.yPos, e.name)
                element.rotation = e.rotation
                drawnItems.push(element)
            }
            image.src = e.imageSrc
        })
        // while(imageCount != 0) { 
        //     setTimeout(() => {}, 100)
        // }
        // reDraw()
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
    console.log(currentRoomInfo)
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

const reDraw = () => {
    clearRoom()

    let i = 0
    drawnItems.forEach(d => {
        console.log(d)
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
            // ctx.rect(rX, rY, d.xSize, d.ySize)
            // ctx.strokeStyle = "black"
            // ctx.stroke()
            ctx.restore()
            // ctx.rotate(resetRad)
            addItemToTable(d, d.name)
        }
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

//#region /* draggable icons */
const toilet = document.getElementById("toilet-icon")
toilet.ondragend = (e) => {
    dragged(e, "/imgs/toilet.png", "Toilet")
}
toilet.ondragstart = (e) => {
    console.log(e)
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
//#endregion

room.addEventListener("mousedown", (e) => {
    e.preventDefault()
    console.log(e.clientX, e.clientY)
    return false
})
room.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    return false;
});

loadRooms()