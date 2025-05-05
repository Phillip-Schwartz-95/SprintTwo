'use strict'

// Meme data model
var gImgs = [{ id: 1, url: 'square-img/1.jpg', keywords: ['funny', 'trump'] },
{ id: 2, url: 'square-img/2.jpg', keywords: ['cute', 'puppies'] },
{ id: 3, url: 'square-img/3.jpg', keywords: ['cute', 'baby'] },
{ id: 4, url: 'square-img/4.jpg', keywords: ['cute', 'kitten'] },
{ id: 5, url: 'square-img/5.jpg', keywords: ['cute', 'funny'] },
{ id: 6, url: 'square-img/6.jpg', keywords: ['dumb', 'funny'] },
{ id: 7, url: 'square-img/7.jpg', keywords: ['cute', 'funny'] },
{ id: 8, url: 'square-img/8.jpg', keywords: ['funny', 'wonka'] },
{ id: 9, url: 'square-img/9.jpg', keywords: ['cute', 'funny'] },
{ id: 10, url: 'square-img/10.jpg', keywords: ['funny', 'obama'] },
{ id: 11, url: 'square-img/11.jpg', keywords: ['funny', 'kissing'] },
{ id: 12, url: 'square-img/12.jpg', keywords: ['funny', 'random'] },
{ id: 13, url: 'square-img/13.jpg', keywords: ['funny', 'cheers', 'gatsby'] },
{ id: 14, url: 'square-img/14.jpg', keywords: ['random', 'matrix'] },
{ id: 15, url: 'square-img/15.jpg', keywords: ['funny', 'lotr'] },
{ id: 16, url: 'square-img/16.jpg', keywords: ['funny', 'star trek'] },
{ id: 17, url: 'square-img/17.jpg', keywords: ['political', 'putin'] },
{ id: 18, url: 'square-img/18.jpg', keywords: ['cute', 'toy story'] }
]

var gMeme = {
    selectedImgId: 1,
    selectedLineIdx: 0,
    selectedFont: 'Arial',
    textAlign: 'center',
    isDragging: false,
    lines: [
        {
            txt: 'Your Meme Text Here',
            size: 20,
            color: 'white',
            x: 200,  
            y: 50,   
            width: 0,  // These will be calculated
            height: 0  // during rendering
        }
    ]
}


var gKeywordSearchCountMap = { 'funny': 1, 'cute': 2, 'baby': 1 }

// Find the image in the gImgs array for the render function
function getImageById(imgId) {
    return gImgs.find(img => img.id === imgId)
}

// Function to retrieve the current meme object
function getMeme() {
    if (!gMeme.isDragging) {
        gMeme.selectedLineIdx = null
    }
    return gMeme
}

function setLineTxt(txt) {
    gMeme.lines[gMeme.selectedLineIdx].txt = txt
}

// For rendering pictures in the gallery from available pics and for random img function
function getImgs() {
    return gImgs 
}

// Used for the selectedImgId property value inside gMeme in order to
// render the selected image in the canvas 
function setImg(imgId) {
    gMeme.selectedImgId = imgId 
}

function setColor(color) {
    gMeme.lines[gMeme.selectedLineIdx].color = color
}

function setFontSize(size) {
    gMeme.lines[gMeme.selectedLineIdx].size = size // Increase and decrease font size
}

//for handling touch vs. click events
function getEvPos(ev) {
    // Get the canvas's bounding rectangle
    const rect = gElCanvas.getBoundingClientRect()
    // Calculate scale factors to convert CSS coordinates to canvas
    const scaleX = gElCanvas.width / rect.width
    const scaleY = gElCanvas.height / rect.height

    let pos

    // Check if this is a touch event
    if (ev.type.startsWith('touch')) {
        // Prevent default behavior 
        ev.preventDefault()
        // Use the first touch point
        const touch = ev.changedTouches[0]
        pos = {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        }
    } else {
        // else it's a mouse event
        pos = {
            x: (ev.clientX - rect.left) * scaleX,
            y: (ev.clientY - rect.top) * scaleY
        }
    }

    return pos
}