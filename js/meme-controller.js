'use strict'

var gElCanvas
var gCtx
var gStartPos = { x: 0, y: 0 }


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
    const meme = getMeme()
    const img = new Image()

    // if image is not from default list, use the uploaded image
    if (meme.selectedImgUrl !== null && meme.selectedImgUrl !== undefined && meme.selectedImgUrl !== '') {
        img.src = meme.selectedImgUrl
    } else {
        img.src = getImageById(meme.selectedImgId).url
    }

    img.onload = () => {
        gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)

        meme.lines.forEach((line, idx) => {
            const font = line.isSticker ? `${line.size}px Arial` : `${line.size}px ${line.selectedFont || gMeme.selectedFont}`
            gCtx.font = font

            // Use the selected line's alignment if defined, otherwise default to center
            let align = 'center'
            if (idx === gMeme.selectedLineIdx && line.textAlign) {
                align = line.textAlign
            }
            gCtx.textAlign = align
            gCtx.textBaseline = 'middle'
            gCtx.fillStyle = line.color

            // Measure text
            const textMetrics = gCtx.measureText(line.txt)
            const textWidth = textMetrics.width
            const textHeight = line.size

            // Update stored dimensions (in object)
            line.width = textWidth
            line.height = textHeight

            // Draw text
            gCtx.fillText(line.txt, line.x, line.y)

            // If selected, draw a white highlight (existing code, like switch line function)
            if (gMeme.selectedLineIdx !== null && idx === gMeme.selectedLineIdx) {
                gCtx.strokeStyle = 'white'
                gCtx.lineWidth = 2
                const padding = 10
                let rectX
                // Calculate the x offset based on the alignment:
                if (gCtx.textAlign === 'left') {
                    rectX = line.x - padding;
                } else if (gCtx.textAlign === 'center') {
                    rectX = line.x - textWidth / 2 - padding
                } else if (gCtx.textAlign === 'right') {
                    rectX = line.x - textWidth - padding
                }
                const rectY = line.y - textHeight / 2 - padding
                const rectWidth = textWidth + padding * 2
                const rectHeight = textHeight + padding * 2
                gCtx.strokeRect(rectX, rectY, rectWidth, rectHeight)

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

        document.querySelector('.user-memes').classList.add('hidden')

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

    if (gMeme.lines.length >= 5) {
        alert('You can only add up to 5 lines or stickers.')
        return
    }

    // Find the last text line (non-sticker)
    const textLines = gMeme.lines.filter(line => !line.isSticker)
    const lastLine = textLines[textLines.length - 1]
    const newY = lastLine ? lastLine.y + 60 : 50

    // prevent from being added off screen
    let x = 200
    let y = newY

    if (x < 0) x = 0
    else if (x > gElCanvas.width) x = gElCanvas.width

    if (y < 0) y = 0
    else if (y > gElCanvas.height) y = gElCanvas.height

    gMeme.lines.push({
        txt: 'New Line',
        size: 20,
        color: 'white',
        x,
        y,
        width: 0,
        height: 0,
        isSticker: false
    })

    renderMeme()
}

function onSwitchLine() {
    gMeme.selectedLineIdx = (gMeme.selectedLineIdx + 1) % gMeme.lines.length // Cycle through lines
    renderMeme()
}

//update the DOM of selected line
function updateEditor(line) {
    document.querySelector('.meme-text').value = line.txt
    document.querySelector('.text-color-picker').value = line.color
    document.querySelector('#font-size-meter').value = line.size
}


function onCanvasClick(ev) {
    ev.preventDefault() // Prevent any default behavior

    const pos = getEvPos(ev)


    let isLineClicked = false

    gMeme.lines.forEach((line, idx) => {
        // Set font size so measurements are accurate.
        gCtx.font = `${line.size}px Arial`
        const textMetrics = gCtx.measureText(line.txt)

        // Use line.size for approx text height
        const textHeight = line.size
        const textWidth = textMetrics.width

        // Calculate the clickable area with padding
        const padding = 10
        const bounds = {
            left: line.x - (textWidth / 2) - padding,
            right: line.x + (textWidth / 2) + padding,
            top: line.y - (textHeight / 2) - padding,
            bottom: line.y + (textHeight / 2) + padding
        }

        console.log(`Checking line ${idx}:`, {
            text: line.txt,
            position: `(${line.x}, ${line.y})`,
            bounds: bounds,
            clickPos: pos
        })

        if (pos.x >= bounds.left && pos.x <= bounds.right &&
            pos.y >= bounds.top && pos.y <= bounds.bottom) {

            gMeme.selectedLineIdx = idx
            gMeme.isDragging = true // dragging
            gStartPos = pos
            isLineClicked = true
        }
    })
    if (!isLineClicked) {
        gMeme.selectedLineIdx = null
        gMeme.isDragging = false
    }
    renderMeme() // to take away the border if clicked outside of line coordinates
}

function onMove(ev) {

    if (!gMeme.isDragging)
        return

    if (gMeme.selectedLineIdx === null)
        return

    const pos = getEvPos(ev)
    const dx = pos.x - gStartPos.x
    const dy = pos.y - gStartPos.y

    const selectedLine = gMeme.lines[gMeme.selectedLineIdx]
    if (!selectedLine) return

    selectedLine.x += dx
    selectedLine.y += dy

    gStartPos = pos
    renderMeme()
}


function onUp() {
    console.log(" onUp() TRIGGERED") // Debugging log

    if (!gMeme.isDragging) return

    gMeme.isDragging = false
    gStartPos = { x: 0, y: 0 }

    console.log(" isDragging after reset:", gMeme.isDragging)
}

function onChangeFont(font) {
    gMeme.lines[gMeme.selectedLineIdx].selectedFont = font
    console.log('font changed to:', font)
    renderMeme()
}

function onChangeAlignment(alignment) {
    const selectedLine = gMeme.lines[gMeme.selectedLineIdx]
    selectedLine.textAlign = alignment

    // Update x based on alignment:
    if (alignment === 'left') {
        // Align to the left side with a small margin
        selectedLine.x = 10
    } else if (alignment === 'center') {
        // Center alignment
        selectedLine.x = gElCanvas.width / 2
    } else if (alignment === 'right') {
        // Align to the right side with a small margin
        selectedLine.x = gElCanvas.width - 10
    }

    console.log('Aligned to:', alignment)
    renderMeme()
}

function onSaveMeme() {
    // Convert to a JPEG data URL.
    const memeDataUrl = gElCanvas.toDataURL('image/jpeg')

    // Retrieve the existing saved memes, or an empty array if none
    let savedMemes = loadFromStorage('savedMemes') || []

    // Add new meme's data URL to array
    savedMemes.push(memeDataUrl)

    // Save the updated array back to local storage using saveToStorage.
    saveToStorage('savedMemes', savedMemes)

    alert('Meme saved successfully')
}

function renderSavedMemes() {
    const memesContainer = document.querySelector('.memes-container')
    const savedMemes = loadFromStorage('savedMemes') || []

    let htmlStr = ''

    if (savedMemes.length === 0) {
        htmlStr = '<p class="no-memes">No saved memes yet</p>'
    } else {
        savedMemes.forEach(memeDataUrl => {
            htmlStr += `<img src="${memeDataUrl}" alt="Saved Meme" class="saved-meme">`
        })
    }

    memesContainer.innerHTML = htmlStr
}

function showMemes() {
    // Hide sections that are not the memes page
    document.querySelector('.image-gallery').classList.add('hidden')
    document.querySelector('.meme-editor').classList.add('hidden')

    // Show the memes section
    const memesSection = document.querySelector('.user-memes')
    memesSection.classList.remove('hidden')

    // Render memes from local storage into saved memes container
    renderSavedMemes()
}

function onLoadRandomPicture() {

    const images = getImgs()
    const randomIdx = Math.floor(Math.random() * images.length)
    const randomImg = images[randomIdx]

    // Update your global meme data:
    gMeme.selectedImgId = randomImg.id
    // (do not include user-uploaded image)
    gMeme.selectedImgUrl = null

    // default line
    gMeme.lines = [{
        txt: 'Your Meme Text Here',
        size: 20,
        color: 'white',
        x: 200,
        y: 50,
        width: 0,
        height: 0
    }]

    // Switch to editor view and render meme
    toggleEditor(true)
    renderMeme()
}

function onUploadPicture(ev) {
    const reader = new FileReader()
    reader.onload = function (event) {
        const imgData = event.target.result

        // Update the global meme object with the uploaded image.
        // user image has noimage id.
        gMeme.selectedImgId = null
        gMeme.selectedImgUrl = imgData

        // Set one default line of text
        gMeme.lines = [{
            txt: 'Your Meme Text Here',
            size: 30,
            color: 'white',
            x: 200,
            y: 50,
            width: 0,
            height: 0
        }]

        // Switch to the editor view and render the meme.
        toggleEditor(true)
        renderMeme()
    }
    reader.readAsDataURL(ev.target.files[0])
}

function onDeleteLine() {
    // Check if theres line to delete
    if (gMeme.lines.length === 0) return

    // Remove the line at selected index
    gMeme.lines.splice(gMeme.selectedLineIdx, 1)

    // Adjust the selected line index:
    // If there are still lines remaining, ensure the index is correct.
    if (gMeme.selectedLineIdx >= gMeme.lines.length) {
        gMeme.selectedLineIdx = gMeme.lines.length - 1
    }

    // Optional: If no lines are left, you could add a default empty line:
    if (gMeme.lines.length === 0) {
        gMeme.lines.push({
            txt: 'Enter text here',
            size: 20,
            color: 'white',
            x: 200,
            y: 50,
            width: 0,
            height: 0
        })
        gMeme.selectedLineIdx = 0
    }

    renderMeme()
}

function onSelectSticker(emoji) {
    if (!emoji) return

    onAddSticker(emoji)

    // Reset the dropdown back to default
    document.getElementById('sticker-select').value = ''
}

function onAddSticker(emoji) {

    let x = gElCanvas.width / 2
    let y = gElCanvas.height / 2
    const margin = 10

    // Ensure the sticker appears within the visible canvas area
    if (x < margin) x = margin
    else if (x > gElCanvas.width - margin) x = gElCanvas.width - margin

    if (y < margin) y = margin
    else if (y > gElCanvas.height - margin) y = gElCanvas.height - margin

    gMeme.lines.push({
        txt: emoji,
        size: 40,
        color: 'black', // color doesn't matter for emoji
        x,
        y,
        width: 0,
        height: 0,
        isSticker: true
    })

    gMeme.selectedLineIdx = gMeme.lines.length - 1
    renderMeme()
}
