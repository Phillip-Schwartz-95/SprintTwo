'use strict'

var gElCanvas
var gCtx

function onInit() {
    gElCanvas = document.querySelector('.meme-canvas')
    gCtx = gElCanvas.getContext('2d')

    renderGallery()
    renderMeme()
}

function renderMeme() {
    const meme = getMeme() // Retrieve from memeService

    const img = new Image()
    img.src = getImageById(meme.selectedImgId).url

    img.onload = () => {
        // Clear canvas before render
        gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)

        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)

        // Draw all text lines from gMeme
        meme.lines.forEach((line, idx) => {
            gCtx.font = `${line.size}px Arial`
            gCtx.fillStyle = line.color
            gCtx.textAlign = 'center'

            gCtx.fillText(line.txt, gElCanvas.width / 2, (idx + 1) * 50) // Position text dynamically
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

