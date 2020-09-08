const photoFile = document.querySelector('#photo-file')
let photoPreview = document.getElementById('photo-preview')
let image;
let photoName;

document.querySelector('#select-image')
.onclick = function () {
    photoFile.click()
}

window.addEventListener('DOMContentLoaded', () => {
    photoFile.addEventListener('change', () => {
        let file = photoFile.files.item(0)
        photoName = file.name;
        // read the file
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function(event) {
            image = new Image();
            image.src = event.target.result
            image.onload = onLoadImage
        }
    })
})

// select tool
const selection = document.getElementById('selection-tool')

let startX, startY, relativeStartX, relativeStartY, endX, endY, relativeEndX, relativeEndY
let startSelection = false

const events = {
    mouseover(){
        this.style.cursor = 'crosshair'
    },
    mousedown(){
        const {clientX, clientY, offsetX, offsetY} = event
        // console.table({
        //     'client': [clientX, clientY],
        //     'offset': [offsetX, offsetY]
        // })

        startX = clientX
        startY = clientY
        relativeStartX = offsetX
        relativeStartY = offsetY

        startSelection = true
    },
    mousemove(){
        endX = event.clientX
        endY = event.clientY

        if(startSelection) {
            selection.style.display = 'initial';
            selection.style.top = startY + 'px';
            selection.style.left = startX + 'px';

            selection.style.width = (endX - startX) + 'px';
            selection.style.height = (endY - startY) + 'px';
        }

    },
    mouseup(){
        startSelection = false;

        relativeEndX = event.layerX;
        relativeEndY = event.layerY;

        // show crop button 
        cropButton.style.display = 'initial'
    },
}

Object.keys(events)
.forEach(eventName => {
    // addEventListener('mouseover', events.mouseover)
    photoPreview.addEventListener(eventName, events[eventName])
})

// Canvas

let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

function onLoadImage() {
    const { width, height } = image
    canvas.width = width;
    canvas.height = height;

    // clean the contex
    ctx.clearRect(0, 0, width, height)

    // draw the image on the context
    ctx.drawImage(image, 0, 0)

    photoPreview.src = canvas.toDataURL()
}

// crop image
const cropButton = document.getElementById('crop-image')
cropButton.onclick = () => {
    const {width: imgW, height: imgH} = image
    const {width: previewW, height: previewH} = photoPreview

    const [ widthFactor, heightFactor ] = [ 
        +(imgW / previewW), 
        +(imgH / previewH)
    ]

    const [ selectionWidth, selectionHeight ] = [
        +selection.style.width.replace('px', ''),
        +selection.style.height.replace('px', '')
    ]

    const [ croppedWidth, croppedHeight ] = [
        +(selectionWidth * widthFactor),
        +(selectionHeight * heightFactor)
    ]

    const [actualX, actualY] = [
        +( relativeStartX * widthFactor ),
        +( relativeStartY * heightFactor )
    ]


    // get from ctx the cropped image 
    const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight)

    // clean ctx
    ctx.clearRect(0, 0, ctx.width, ctx.height)

    // proportions adjustment
    image.width = canvas.width = croppedWidth;
    image.height = canvas.height = croppedHeight;

    // add the cropped image to canvas ctx
    ctx.putImageData(croppedImage, 0, 0)

    // hide the selection tool
    selection.style.display = 'none'

    // update the image preview
    photoPreview.src = canvas.toDataURL()

    // show download button 
    downloadButton.style.display = 'initial'
}

// download
const downloadButton = document.getElementById('download')
downloadButton.onclick = function() {
    const a = document.createElement('a')
    a.download = photoName + '-cropped.png';
    a.href = canvas.toDataURL();
    a.click()
}