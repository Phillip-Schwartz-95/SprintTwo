'use strict'

var gElCanvas
var gCtx

function onInit() {
    gElCanvas = document.querySelector('.meme-canvas')
    gCtx = gElCanvas.getContext('2d')

    const imgObj = getImageById(gMeme.selectedImgId);
    if (!imgObj) {
        renderGallery()
        renderMeme()
        return
    }

    //Format aspect ratio of photo on canvas
    const img = new Image()
    img.src = imgObj.url

    img.onload = () => {
        const canvasWidth = 400 // chosen width
        const canvasHeight = (img.naturalHeight * canvasWidth) / img.naturalWidth // Aspect ratio formula

        gElCanvas.width = canvasWidth
        gElCanvas.height = canvasHeight

        renderGallery()
        renderMeme()
    }
}

function renderMeme() {
    const meme = getMeme() // Retrieve from memeService

    const img = new Image()
    img.src = getImageById(meme.selectedImgId).url

    img.onload = () => {
        // Clear canvas before render
        gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)

        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)

        // All text lines from gMeme
        meme.lines.forEach((line, idx) => {
            gCtx.font = `${line.size}px Arial`
            const textMeasure = gCtx.measureText(line.txt)

            // update line object width and height
            line.width = textMeasure.width
            line.height = textMeasure.actualBoundingBoxAscent + textMeasure.actualBoundingBoxDescent // measures height of text

            // drawing text
            gCtx.fillStyle = line.color
            gCtx.textAlign = 'center'
            gCtx.fillText(line.txt, line.x, line.y)

            //highlight selected text with frame
            if (idx === meme.selectedLineIdx) {
                gCtx.strokeStyle = 'white'
                gCtx.linewidth = 2
                gCtx.strokeRect(line.x - 100, line.y - 20, 200, 40) //rectangle shape
            }
        })
    }
}

function onLineTxtChange() {
    const textInput = document.querySelector('.meme-text').value

    setLineTxt(textInput) // Update meme text
    renderMeme() // Re-render the meme
}

document.addEventListener('DOMContentLoaded', () => {
    window.toggleEditor = function (showEditor) {
        const gallery = document.querySelector('.image-gallery')
        const editor = document.querySelector('.meme-editor')

        if (showEditor) {
            gallery.classList.add('hidden')
            editor.classList.remove('hidden')
        } else {
            gallery.classList.remove('hidden')
            editor.classList.add('hidden')
        }
    }
})

function onDownloadMeme(elLink) {
    const imgContent = gElCanvas.toDataURL('image/jpeg') // Convert canvas to image URL
    elLink.href = imgContent // Set the href of the link to the image URL
    elLink.download = "meme.jpg" //download attribute
}

function onSetColor() {
    const colorInput = document.querySelector('.text-color-picker').value
    setColor(colorInput)

    //change font color without re-rendering image
    const meme = getMeme()
    meme.lines.forEach((line, idx) => {
        gCtx.fillStyle = line.color
        gCtx.font = `${line.size}px Arial`
        gCtx.textAlign = 'center'
        gCtx.fillText(line.txt, gElCanvas.width / 2, (idx + 1) * 50)
    })
}

function onFontSizeChange() {
    const fontSize = document.querySelector('#font-size-meter').value

    setFontSize(Number(fontSize)) // Update font size in gMeme
    renderMeme()
}

function onAddLine() {
    const lastLine= gMeme.lines[gMeme.lines.length-1]
    const newY = lastLine.y + 60

    gMeme.lines.push({
        txt: 'New Line',
        size: 20,
        color: 'black',
        x: 200,
        y: newY
    })

    renderMeme()
}

function onSwitchLine() {
    gMeme.selectedLineIdx = (gMeme.selectedLineIdx + 1) % gMeme.lines.length // Cycle through lines
    renderMeme()
}

function updateEditor(line) {
    document.querySelector('.meme-text').value = line.txt
    document.querySelector('.text-color-picker').value = line.color
    document.querySelector('#font-size-meter').value = line.size
}


function onCanvasClick(ev) {
    const { offsetX, offsetY } = getEvPos(ev) // Adjust click position

    gMeme.lines.forEach((line, idx) => {
        if (
            offsetX >= line.x - line.width / 2 &&
            offsetX <= line.x + line.width / 2 &&
            offsetY >= line.y - line.height / 2 &&
            offsetY <= line.y + line.height / 2
        ) {
            gMeme.selectedLineIdx = idx // Select the clicked line
            updateEditor(line) // Update editor input
            renderMeme() // Refresh canvas
            console.log('Line clicked')
        }
    })
}

function getEvPos(ev) {
    const rect = gElCanvas.getBoundingClientRect()
    return {
        x: ev.clientX - rect.left,
        y: ev.clientY - rect.top
    }
}
