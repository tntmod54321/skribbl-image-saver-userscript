// ==UserScript==
// @name         skribbl image saver
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description
// @author       tntmod54321
// @match        https://skribbl.io/*
// @grant        none
// ==/UserScript==

//initialize global variables
var imageArray=[]
var imageElementAlreadyCreated=false
var buttonToggle=false
var base64data
var stylesheets
var debugMode=true
const overlayPromptRE = new RegExp('The word was: ([a-zA-Z0-9]+)'); //don't match for characters that would make invalid filenames
const testString = "The word was: Tom!"
//const testString = "tom!"

function getCurrentDrawer(){
    var drawer = "unknown"
    //if .style="" then they're the drawer
    //for
    console.log("the drawer is", drawer)
    //return drawer
}

function getPrompt(){
    var prompt = "unknown"

    var contentClass=document.getElementsByClassName('content')
    for (let i = 0; i < contentClass.length; i++) { // make this something like for class in contentClasses
        var text = contentClass[i].getElementsByClassName("text")[0]
        var result = text.outerText.match(overlayPromptRE)
        if (result) {prompt=result[1];break}
    }

    //if we don't get a result use this fallback
    if (!result) {
        var fallbackElement=document.getElementById('currentWord')
        if (fallbackElement) { //don't crash if the element doesn't exist
            if (fallbackElement.outerText!="") {prompt = fallbackElement.outerText}
        }
    }

    return prompt
}

//create an element to be able to display the image
function displayImage(){
    if (imageElementAlreadyCreated){return}
    var body = document.getElementsByTagName("body")
    var a = document.createElement("center")
    var b = document.createElement("img")
    a.id="XD1"
    b.id="XD2"
    body[0].appendChild(a)
    var center = document.getElementById("XD1")
    center.appendChild(b)
    imageElementAlreadyCreated=true
}

//converts the canvas to a data blob
async function canvasToBlob() {
    var canvas = document.getElementById('canvasGame')
    const blob = await new Promise((resolve) => canvas.toBlob(resolve))
    const blobURL = URL.createObjectURL(blob)
    URL.revokeObjectURL(blobURL)
    return blob
}

//embed the data blob of the canvas into the page
async function mirrorImage(){
    console.clear()
    var Image = await canvasToBlob();
    displayImage()
    var HTMLImage = document.getElementById("XD2")
    var reader = new FileReader()
    reader.readAsDataURL(Image)
    reader.onloadend = function() {
        var base64data = reader.result
        HTMLImage.src=base64data
        if(buttonToggle){mirrorImage()}
        else{HTMLImage.src=""}
    }
}

//return the index of the cssrule for the second stylesheet that matches the passed (selector) argument
function getStyleSheet(selector){
    var stylesheets=document.styleSheets[1].cssRules
    for (var i in stylesheets){
        if (stylesheets[i].selectorText==selector){
            return i
        }
        i++
    }
    console.log("stylesheet not found :(")
}

//insert download button
function insertDownloadButton(){
    var leftSidebar = document.getElementById("containerPlayerlist")
    var downloadButton = document.createElement("button")
    downloadButton.classList.add('btn')
    downloadButton.classList.add('btn-block')
    downloadButton.id="downloadImage"
    downloadButton.style="margin-top:8px;color: rgb(255, 255, 255);background-color: rgb(102, 218, 92);border-color: rgb(72, 214, 50);"
    var downloadText = document.createTextNode("Download image");

	downloadButton.onclick=function() {downloadBlobImage()}

	downloadButton.appendChild(downloadText)
    leftSidebar.appendChild(downloadButton)
}

//toggle mirror function
function mirBtnFunc(){
	mirrorImage()
	buttonToggle=(!buttonToggle)
}

//Download Image
async function downloadBlobImage(){
	var Image = await canvasToBlob();
    var reader = new FileReader()
    reader.readAsDataURL(Image)
    reader.onloadend = function() {
        var base64data = reader.result
        var a = document.createElement('a')
        a.setAttribute('href', base64data)
        var DL_Name="skribbl-"+getPrompt()+"-"+(Date.now()/1000|0)+".png" //round date.now to secs instead of millis
        a.setAttribute('download', DL_Name)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

}

//open the blob as an image in a new tab
async function openImageInNewTab(){
    var Image = await canvasToBlob()
    var fileURL = URL.createObjectURL(Image)
    var a = document.createElement('a')
    a.href = fileURL
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(fileURL)
}

//insert mirror button
function insertMirrorButton(){
	var leftSidebar = document.getElementById("containerPlayerlist")
	var mirrorButton = document.createElement("button")
	mirrorButton.classList.add('btn')
    mirrorButton.classList.add('btn-block')
    mirrorButton.id="mirrorImage"
	mirrorButton.style="margin-top:8px;color: rgb(255, 255, 255);background-color: rgb(92, 218, 218);border-color: rgb(50, 214, 200);"
	mirrorButton.onclick=function() {mirBtnFunc()}
	var mirrorText = document.createTextNode("Mirror image")
	mirrorButton.appendChild(mirrorText)
    leftSidebar.appendChild(mirrorButton)
}

//insert the new tab button
function insertNewTabButton(){
    var leftSidebar = document.getElementById("containerPlayerlist")
    var newTabButton = document.createElement("button")
    newTabButton.classList.add('btn')
    newTabButton.classList.add('btn-block')
    newTabButton.id="openNewTab"
    newTabButton.style="margin-top:8px;color: rgb(255, 255, 255);background-color: rgb(102, 218, 92);border-color: rgb(72, 214, 50);"

	newTabButton.onclick=function() {openImageInNewTab()}
    var newTabText = document.createTextNode("Open Image in New Tab");
	newTabButton.appendChild(newTabText)
    leftSidebar.appendChild(newTabButton)
}

//main function
function main(){
	//fix button spacing in css
	var stylesheetIndex=getStyleSheet("#containerPlayerlist")
	var stylesheets=document.styleSheets[1].cssRules[stylesheetIndex].style
    stylesheets.removeProperty("justify-content")
	//insert buttons, in order they appear on the screen
	insertDownloadButton()
    if (debugMode) {insertNewTabButton()}
    insertDownloadChatlogButton()
    if (debugMode) {insertMirrorButton()}
    console.log("Skribbl Image Saver Loaded!")
    //maybe add a while true loop here that updates globally the prompt (for use in filenames)
}

//open text in new tab
function openTextInNewTab(array){
    var chatLog=""
    for (var object in array){
        chatLog=chatLog.concat(array[object]+"\n")
    }
    if(chatLog==""){return}
    chatLog="<div id=\"boxMessages\" style=\"font-family: Helvetica Neue, Helvetica, Arial, sans-serif;\">\n".concat(chatLog)
    chatLog=chatLog.concat("</div>")
    var chatLogBlob = new Blob([chatLog],{ type: "text/html;charset=utf-8" });
    var fileURL = URL.createObjectURL(chatLogBlob)
    var a = document.createElement('a')
    a.href = fileURL
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(fileURL)
}

//download text as an html file
function downloadText(array){
    var chatLog=""
    for (var object in array){
        chatLog=chatLog.concat(array[object]+"\n")
    }
    if(chatLog==""){return}
    chatLog="<html><body><div id=\"boxMessages\" style=\"font-family: Helvetica Neue, Helvetica, Arial, sans-serif;\">\n".concat(chatLog)
    chatLog=chatLog.concat("</div></body></html>")
    var chatLogBlob = new Blob([chatLog],{ type: "text/html;charset=utf-8" });
    var fileURL = URL.createObjectURL(chatLogBlob)
    var a = document.createElement('a')
    a.setAttribute('href', fileURL)
    var DL_Name="skribblchatlog-"+getPrompt()+"-"+(Date.now()/1000|0)+".html" //round date.now to secs instead of millis
    a.setAttribute('download', DL_Name)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(fileURL)
}

//function to save the chat as an html file
function saveChat(){
    var chatElement = document.getElementById("boxMessages")
    var chatChildren = chatElement.children
    var array2=[]
    for (var message in chatChildren){
        if (typeof chatChildren[message]=="object"){array2.push(chatChildren[message].outerHTML)}
    }
    downloadText(array2)
}

function insertDownloadChatlogButton(){
    var leftSidebar = document.getElementById("containerPlayerlist")
    var chatlogButton = document.createElement("button")
    chatlogButton.classList.add('btn')
    chatlogButton.classList.add('btn-block')
    chatlogButton.id="downloadChatLog"
    chatlogButton.style="margin-top:8px;color: rgb(255, 255, 255);background-color: rgb(230, 204, 18);border-color: rgb(132, 119, 32);"

	chatlogButton.onclick=function() {saveChat()}
    var newTabText = document.createTextNode("Download Chatlog");
	chatlogButton.appendChild(newTabText)
    leftSidebar.appendChild(chatlogButton)
}

//test function with e

document.onkeyup=function(e){
    if(e.which == 69) {
        getCurrentDrawer()
    }
};

main()
