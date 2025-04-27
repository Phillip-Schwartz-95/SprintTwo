'use strict'

// Meme data model
var gImgs = [{ id: 1, url: 'square-img/1.jpg', keywords: ['funny', 'trump'] },
{ id: 2, url: 'square-img/2.jpg', keywords: ['cute', 'puppies'] },
{ id: 3, url: 'square-img/3.jpg', keywords: ['cute', 'baby'] }]

var gMeme = {
    selectedImgId: 1,
    selectedLineIdx: 0,
    lines: [
        {
            txt: 'Enter Text Here',
            size: 20,
            color: 'red'
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
    return gMeme
}

function setLineTxt(txt) {
    gMeme.lines[gMeme.selectedLineIdx].txt = txt
}

// For rendering pictures in the gallery from available pics
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
