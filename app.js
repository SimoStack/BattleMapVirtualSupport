const header = document.getElementById('header');
const main = document.getElementById('main');
const mapInput = document.getElementById('map-input');
const menu = document.getElementById('menu');
const pcInput = document.getElementById('pc-input');
const pcList = document.getElementById('pc-list');
const utilityInput = document.getElementById('utility-input');
const utilityList = document.getElementById('utility-list');
const aoeRadius = document.getElementById('aoe-radius');
const aoeColor = document.getElementById('aoe-color');
const aoeName = document.getElementById('aoe-name');
const aoeList = document.getElementById('aoe-list');
const roomList = document.getElementById('room-list');
const roomWidth = document.getElementById('room-width');
const roomHeight = document.getElementById('room-height');
const footer = document.getElementById('footer');
const avatarsContainer = document.getElementById('avatars-container');
const avatarsInput = document.getElementById('avatars-input');

let avatarFilesArray = [];
let pcFilesArray = [];
let utilityFilesArray = [];
let aoeElementsArray = [];
let aoesDataArray = [];
let roomElementsArray = [];
let roomsDataArray = [];
let map = null;
let activeMini = null;
let typeMini = null;
let barsVisible = true;
let scaleVisible = false;
let scaleElement = null;
let aoePlaceMessageElement = null;
let helpElement = null;
let aoe = null;
let room = null;
let currentScale;
const mainGridRows = 150;
const mainGridCols = 150;
const baseMW = 4.5; // max-width: 4.5vw
const baseMH = 8; // max-height: 8vh
const baseMWFull = 5.5; // max-width: 5.5vw
const baseMHFull = 9.75; // max-height: 9.75vh

generateMainGrid();

const enableDefaultMap = true;
if(enableDefaultMap) {
    main.style.backgroundImage = `url('./assets/default-map/default_map.jpg')`;
}

// keyboard shortcut listener
document.onkeypress = function (e) {
    e = e || window.event;
    // console.log(e);
    switch(e.code) {
        case 'KeyF':
            if(e.ctrlKey) {
                switchBarVisibility()
            }
            break;
        case 'KeyC':
            // clear all
            if(e.ctrlKey) {
                clearMiniesOnMap();
            }
            break;
        case 'KeyM':
            // open load minis window
            if(e.ctrlKey) {
                avatarsInput.click();
            }
            break;
        case 'KeyP':
            // open load minis window
            if(e.ctrlKey) {
                pcInput.click();
            }
            break;
        case 'KeyU':
            // open load utility window
            if(e.ctrlKey) {
                utilityInput.click();
            }
            break;
        case 'Digit1':
        case 'Digit2':
        case 'Digit3':
        case 'Digit4':
        case 'Digit5':
        case 'Digit6':
        case 'Digit7':
        case 'Digit8':
        case 'Digit9':
            //select avatar by digit
            if(e.ctrlKey) {
                if(avatarFilesArray && avatarFilesArray.length > (e.key - 1))
                selectMini('avatar', e.key - 1);
            }
            break;
    }
};

// Listeners on upload file buttons
// Upload map
mapInput.addEventListener("change", () => {
    const maps = mapInput.files

    map = maps[0];
    displayMap();
})
// Upload avatars
avatarsInput.addEventListener("change", () => {
    const files = avatarsInput.files
    for (let i = 0; i < files.length; i++) {
        avatarFilesArray.push(files[i]);
    }
    displayAvatars();
})
// Upload PCs
pcInput.addEventListener("change", () => {
    const files = pcInput.files
    for (let i = 0; i < files.length; i++) {
        pcFilesArray.push(files[i]);
    }
    displayPC();
})
// Upload utilities
utilityInput.addEventListener("change", () => {
    const files = utilityInput.files
    for (let i = 0; i < files.length; i++) {
        utilityFilesArray.push(files[i]);
    }
    displayUtility();
})

// MAP SECTION
/**
 * Generate the empty map grid and place it in 'main' container
 */
function generateMainGrid() {
    let grid = '<div class="main-grid-table">';
    for (let i = 0; i < mainGridRows; i++) {
        grid += '<div class="main-grid-row">'
        for (let j = 0; j < mainGridRows; j++) {
            grid += `<div id="main-cell-${j}-${i}" class="main-grid-cell" onclick="gridCellSelected(${j}, ${i})"></div>`
        }
        grid += '</div>'
    }
    grid += '</div>'
    main.innerHTML = grid;
}

/**
 * On cell selection (defined by [x] and [y] coords), print (if any selected) the selected minies in that cell and clear
 * previous occurences of that mini (if avatar or pc, utilities clear is handled differently)
 *
 * @param x cell coords
 * @param y cell coords
 */
function gridCellSelected(x, y) {
    const cell = document.getElementById('main-cell-' + x + '-' + y);

    if(aoePlaceMessageElement) {
        aoePlaceMessageElement.remove();
    }
    if(aoe) {
        // Defining AOE
        // set aoe coords
        aoe.cell_x = x;
        aoe.cell_y = y;
        // create AOE Element
        aoeElement = createAOEElement(aoe);

        // Attach to dom and display in list
        document.body.appendChild(aoeElement);

        aoesDataArray.push(aoe);
        aoeElementsArray.push(aoeElement);
        displayAOE();
        aoe = null;
    } else if(room) {
        // Defining room
        // set aoe coords
        room.cell_x = x;
        room.cell_y = y;
        // create AOE Element
        roomElement = createRoomElement(room);

        // Attach to dom and display in list
        document.body.appendChild(roomElement);

        roomsDataArray.push(room);
        roomElementsArray.push(roomElement);
        displayRoom();
        room = null;
    }
    else {
        if (activeMini) {
            //Clear avatar previous instances
            if(typeMini == 'avatar' || typeMini == 'pc') {
                const prevAvatars = document.querySelectorAll(`.mini-${activeMini.name.split(".")[0]}`);
                for (let i = 0; i < prevAvatars.length; i++) {
                    prevAvatars[i].remove();
                }
            }
            // Put avatar in cell (apply scale factor if set)
            currentScale = document.getElementById('scale-input').value;
            currentRotation = document.getElementById('rotate-input').value;
            currentRotation = currentRotation % 360;
            currentRotationRad = currentRotation * Math.PI / 180

            translateX =(Math.cos(currentRotationRad) + Math.sin(currentRotationRad)) * -50;
            translateY =(Math.cos(currentRotationRad) - Math.sin(currentRotationRad)) * -50;

            if(currentScale != null && !isNaN(currentScale) && currentScale != '' && currentScale != 100) {
                let mw;
                let mh;
                if (barsVisible) {
                    mw = (currentScale/100) * baseMW
                    mh = (currentScale/100) * baseMH
                } else {
                    mw = (currentScale/100) * baseMWFull
                    mh = (currentScale/100) * baseMHFull
                }

                cell.innerHTML = `<img src="${URL.createObjectURL(activeMini)}" class="mini-on-map mini-${activeMini.name.split(".")[0]}" style="max-height: ${mh}vh !important; max-width: ${mw}vw !important; transform: rotate(${currentRotation}deg) translate(${translateX}%, ${translateY}%);">`// translate(-50%, -75%)
            } else {
                cell.innerHTML = `<img src="${URL.createObjectURL(activeMini)}" class="mini-on-map mini-${activeMini.name.split(".")[0]}" style="transform: rotate(${currentRotation}deg) translate(${translateX}%, ${translateY}%);">` // translate(-50%, -75%)
            }
        }
    }

}

/**
 * After loading the map, print it in main section
 */
function displayMap() {
    main.style.backgroundImage = `url(${URL.createObjectURL(map)})`;
}

// PC,UTILITY,AOE MENU SECTION
/**
 * After loading PCs, print them in menu
 */
function displayPC() {
    let pcs = ""
    pcFilesArray.forEach((image, index) => {
        pcs += `<div
                    id="pc-name-${index}"
                    class="pc-name"
                    onclick="selectMini('pc', ${index})">
                        ${image.name.split(".")[0].replaceAll('_', ' ')}
                </div>`
    })

    pcList.innerHTML = pcs;
}
// todo
/**
 * After loading utilities, print them in menu
 */
function displayUtility() {
    let utilities = ""
    utilityFilesArray.forEach((image, index) => {
        utilities += `<div id="utility-container-${index}" class="utility-image-container">
                <img id="utility-image-${index}"
                    class="utility-image"
                    src="${URL.createObjectURL(image)}"
                    onclick="selectMini('utility', ${index})"
                    alt="image">
                <div
                    id="utility-name-${index}"
                    class="utility-name"
                    onclick="selectMini('utility', ${index})">
                        ${image.name.split(".")[0].replaceAll('_', ' ')}
                </div>
                <div
                    class="utility-clear"
                    onclick="clearAllUtilityMinies(${index})">
                        x
                </div>
              </div>`
    })

    utilityList.innerHTML = utilities;
}

/**
 * Based on AOE sectio input parameters prepare an AOE dataset used to place an AOE element on map
 */
function createAOE() {
    aoe = {
        color: aoeColor.value,
        name: aoeName.value,
        radius: aoeRadius.value,
        cell_x: null,
        cell_y: null,
    }

    message = `Place the AOE clicking anywere on the map (clicked point will be the center of the aoe)
    `

    aoePlaceMessageElement = document.createElement('div');
    aoePlaceMessageElement.classList = 'AOEMessage';
    aoePlaceMessageElement.style.cssText = `
    position:fixed;
    bottom:3%;
    left:35%;
    width:30%;
    height:3%;
    padding:2% 1%;
    text-align: center;
    z-index:101;
    background-color: #777;
    color:white;`;
    aoePlaceMessageElement.innerHTML = message;
    clearMessage = `<button onclick="closeAOEMessage()">X</button><br/>`
    aoePlaceMessageElement.innerHTML = clearMessage + message;
    document.body.appendChild(aoePlaceMessageElement);
}

/**
 * Based on Room section input parameters prepare room rectangle to place on map
 */
function createRoom() {
    clearRoom(0);
    room = {
        width: roomWidth.value,
        height: roomHeight.value,
        cell_x: null,
        cell_y: null,
    }

    message = `Place the room bounds clicking anywere on the map (clicked point will be the center of the room)`

    aoePlaceMessageElement = document.createElement('div');
    aoePlaceMessageElement.classList = 'AOEMessage';
    aoePlaceMessageElement.style.cssText = `
    position:fixed;
    bottom:3%;
    left:35%;
    width:30%;
    height:3%;
    padding:2% 1%;
    text-align: center;
    z-index:101;
    background-color: #777;
    color:white;`;
    aoePlaceMessageElement.innerHTML = message;
    clearMessage = `<button onclick="closeAOEMessage()">X</button><br/>`
    aoePlaceMessageElement.innerHTML = clearMessage + message;
    document.body.appendChild(aoePlaceMessageElement);
}

/**
 * create AOE DOM element and place it on map screen;
 *
 * @param aoe - aoe model datatype (json with color, name and radius attributes)
 * @returns {HTMLDivElement}
 */
function createAOEElement(aoe) {

    const cell = document.getElementById('main-cell-' + aoe.cell_x + '-' + aoe.cell_y);

    aoeElement = document.createElement('div');
    aoeElement.id = aoe.name;
    aoeElement.classList = "aoe-on-map"
    aoeElement.dataset.color = aoe.color;
    aoeElement.dataset.name = aoe.name;
    aoeElement.style.cssText = `
            position:fixed;
            top:calc(${cell.getBoundingClientRect().top}px - ${aoe.radius}vw);
            left:calc(${aoe.cell_left = cell.getBoundingClientRect().left}px - ${aoe.radius}vw);
            width:${aoe.radius * 2}vw;
            height:${aoe.radius * 2}vw;
            background-image: url('./assets/images/aoe-circle-${aoe.color}.png');
            background-size: 100% 100%;
            z-index:1;`;

    // Add name to AOE
    aoeLabel = document.createElement('div');
    aoeLabel.innerHTML = aoe.name;
    const color = aoe.color == 'yellow' ? 'black' : 'white';
    aoeLabel.style.cssText = `text-align:center; color: ${color}; height:1em;`;
    aoeElement.appendChild(aoeLabel);
    return aoeElement;
}

/**
 * create Room DOM element and place it on map screen;
 *
 * @param room - room model datatype (json with width & height attributes)
 * @returns {HTMLDivElement}
 */
function createRoomElement(room) {
    const cell = document.getElementById('main-cell-' + room.cell_x + '-' + room.cell_y);

    roomElement = document.createElement('div');
    roomElement.id = 'room';
    roomElement.classList = "room-on-map"
    roomElement.dataset.name = 'room';
    roomElement.style.cssText = `
            position:fixed;
            top:calc(${cell.getBoundingClientRect().top}px - ${room.height/2}vw);
            left:calc(${cell.getBoundingClientRect().left}px - ${room.width/2}vw);
            width:${room.width}vw;
            height:${room.height}vw;
            border-image: url('./assets/bkg/room.jpeg') 1 / 10px / 10px;
            z-index:1;`;
    return roomElement;
}

/**
 * Print Aoe list
 */
function displayAOE() {
    let aoes = ""
    aoeElementsArray.forEach((aoe, index) => {
        aoes += `<div id="aoe-container-${index}" class="aoe-image-container">
                <div id="aoe-image-${index}"
                    class="aoe-image"
                    style="background-color: ${aoe.dataset.color}">
                </div>
                <div
                    id="aoe-name-${index}"
                    class="aoe-name">
                        ${aoe.dataset.name}
                </div>
                <div
                    class="aoe-clear"
                    onclick="clearAOE(${index})">
                        x
                </div>
              </div>`
    })

    aoeList.innerHTML = aoes;
}

/**
 * Print Rooms list
 */
function displayRoom() {
    let rooms = ""
    roomElementsArray.forEach((room, index) => {
        rooms += `<div id="room-container-${index}" class="room-image-container">
                <div
                    id="room-name-${index}"
                    class="room-name">
                        Room
                </div>
                <div
                    class="aoe-clear"
                    onclick="clearRoom(${index})">
                        x
                </div>
              </div>`
    })

    roomList.innerHTML = rooms;
}

/**
 * Based on all AOEs actives, clear the elements printed and redraw them (used for adapt the AOEs during fullscreen and
 * back screen change)
 */
function redrawAllAOEs() {
    //Clear current AOE printed elements
    aoeElementsArray.forEach(element => {
        element.remove();
    });
    aoeElementsArray = [];

    aoesDataArray.forEach(aoe => {
        elem = createAOEElement(aoe);
        document.body.appendChild(elem);
        aoeElementsArray.push(elem);
    })
}

/**
 * Based on all rooms actives, clear the elements printed and redraw them (used for adapt the rooms during fullscreen and
 * back screen change)
 */
function redrawAllRooms() {
    //Clear current AOE printed elements
    roomElementsArray.forEach(element => {
        element.remove();
    });
    roomElementsArray = [];

    roomsDataArray.forEach(room => {
        elem = createRoomElement(room);
        document.body.appendChild(elem);
        roomElementsArray.push(elem);
    })
}

// AVATARS SECTION
/**
 * After loading avatars, print them in footer
 */
function displayAvatars() {
    let avatars = ""
    avatarFilesArray.forEach((image, index) => {
        avatars += `<div id="avatar-container-${index}" class="avatar-image-container">
                <img id="avatar-image-${index}"
                    class="avatar-image"
                    src="${URL.createObjectURL(image)}"
                    onclick="selectMini('avatar',${index})"
                    alt="image">
                <div
                    id="avatar-name-${index}"
                    class="avatar-name"
                    onclick="selectMini('avatar', ${index})">
                        ${image.name.split(".")[0].replaceAll('_', ' ')}
                </div>
              </div>`
    })

    avatarsContainer.innerHTML = avatars;
}

// UI UTILITIES SECTION
/**
 * Show/hide toolbars, bars can be hidden (entirely invisible) or collapsed (only small fraction of bar will be visible)
 */
function switchBarVisibility() {
    barsVisible = !barsVisible
    if (barsVisible) {
        header.classList.remove("hide");
        menu.classList.remove("collapse-right");
        footer.classList.remove("collapse-bottom");
        main.classList.remove("fullscreen");
        const printedAvatars = document.querySelectorAll(`.mini-on-map`);
        for (let i = 0; i < printedAvatars.length; i++) {
            // remove default class to scale avatars fullscreen
            printedAvatars[i].classList.remove("mini-on-map-fullscreen");
            // adjust minies size if scale factor is applied
            if(currentScale != null && !isNaN(currentScale) && currentScale != '' && currentScale != 100) {
                const mw = (currentScale/100) * baseMW
                const mh = (currentScale/100) * baseMH
                printedAvatars[i].style.maxWidth = mw+'vw';
                printedAvatars[i].style.maxHeight = mh+'vh';
            }
        }
    } else {
        header.classList.add("hide");
        menu.classList.add("collapse-right");
        footer.classList.add("collapse-bottom");
        main.classList.add("fullscreen");
        const printedAvatars = document.querySelectorAll(`.mini-on-map`);
        for (let i = 0; i < printedAvatars.length; i++) {
            // adding default class to scale avatars fullscreen
            printedAvatars[i].classList.add("mini-on-map-fullscreen");
            // adjust minies size if scale factor is applied
            if(currentScale != null && !isNaN(currentScale) && currentScale != '' && currentScale != 100) {
                const mw = (currentScale/100) * baseMWFull
                const mh = (currentScale/100) * baseMHFull
                printedAvatars[i].style.maxWidth = mw+'vw';
                printedAvatars[i].style.maxHeight = mh+'vh';
            }
        }
    }
    redrawAllAOEs();
    redrawAllRooms();
}

/**
 * Show/hide screen precentage scale
 */
function switchScaleVisibility() {
    scaleVisible = !scaleVisible

    if(scaleVisible) {
        scaleElement = document.createElement('div');
        scaleElement.innerHTML = `
        <div style="position:relative; background-color: black; height: 15px; color: white;">
            <div style="position: absolute; margin-left: 5%;">5%</div>
            <div style="position: absolute; margin-left: 15%;">15%</div>
            <div style="position: absolute; margin-left: 25%;">25%</div>
            <div style="position: absolute; margin-left: 30%;">30%</div>
            <div style="position: absolute; margin-left: 50%;">50%</div>
            <div style="position: absolute; margin-left: 75%;">75%</div>
        </div>
        <div style="position:relative; background-color: white; height: 15px; color: black;">
            <div style="position: absolute; margin-left: 5%;">5%</div>
            <div style="position: absolute; margin-left: 15%;">15%</div>
            <div style="position: absolute; margin-left: 25%;">25%</div>
            <div style="position: absolute; margin-left: 30%;">30%</div>
            <div style="position: absolute; margin-left: 50%;">50%</div>
            <div style="position: absolute; margin-left: 75%;">75%</div>
        </div>`;
        scaleElement.style.cssText = `
        position:fixed;
        top:45%;
        left:0;
        width: 100%;
        height: 30px;
        z-index:101;`;
        document.body.appendChild(scaleElement);
    } else {
        scaleElement.remove();
    }
}

/**
 * Set the currently selected mini, enlight it in toolbars and clear previous toolbars selection.
 *
 * @param type - type of mini selected ('avatar', 'pc', 'utility')
 * @param index - position of the mini in type correspondent list of loaded assets
 */
function selectMini(type, index) {
    // Store selected element
    switch(type) {
        case 'pc':
            activeMini = pcFilesArray[index];
            typeMini = 'pc';
            break;
        case 'utility':
            activeMini = utilityFilesArray[index];
            typeMini = 'utility';
            break;
        case 'avatar':
            activeMini = avatarFilesArray[index];
            typeMini = 'avatar';
            break;
    }

    // Clear previous menu selection

    // clear pcs selection
    const pcNames = document.querySelectorAll(".pc-name");
    for (let i = 0; i < pcNames.length; i++) {
        pcNames[i].classList.remove("selected-pc");
    }

    // clear utilities selection
    const utilityNames = document.querySelectorAll(".utility-name");
    for (let i = 0; i < utilityNames.length; i++) {
        utilityNames[i].classList.remove("selected-utility");
    }

    // clear avatars selection
    const avatarsImages = document.querySelectorAll(".avatar-image");
    for (let i = 0; i < avatarsImages.length; i++) {
        avatarsImages[i].classList.remove("selected-avatar-image");
    }
    const avatarsNames = document.querySelectorAll(".avatar-name");
    for (let i = 0; i < avatarsNames.length; i++) {
        avatarsNames[i].classList.remove("selected-avatar-name");
    }

    // Set selection on mini in menu
    switch(type) {
        case 'pc':
            const activePCText = document.getElementById('pc-name-' + index);
            activePCText.classList.add("selected-pc");
            break;
        case 'utility':
            const activeUtilityText = document.getElementById('utility-name-' + index);
            activeUtilityText.classList.add("selected-utility");
            break;
        case 'avatar':
            const activeAvatarImage = document.getElementById('avatar-image-' + index);
            activeAvatarImage.classList.add("selected-avatar-image");
            const activeAvatarText = document.getElementById('avatar-name-' + index);
            activeAvatarText.classList.add("selected-avatar-name");
            break;
    }

}

/**
 * Clear the list of the loaded assets per category [assetCategory]
 *
 * @param assetCategory - Category name of the loaded assets to clear ('avatar', 'pc', 'utility')
 */
function clearLoadedAssets(assetCategory) {
    switch (assetCategory) {
        case 'avatar':
            avatarsInput.value = null;
            avatarFilesArray = [];
            displayAvatars();
            break;
        case 'pc':
            pcInput.value = null;
            pcFilesArray = [];
            displayPC();
            break;
        case 'utility':
            utilityInput.value = null;
            utilityFilesArray = [];
            displayUtility();
            break;
    }
}

/**
 * Clear all instance of a single utility mini on map, the utility mini is referenced by its position [index]
 *
 * @param index - position of the utility mini to clear in the loaded utilities list [utilityFilesArray]
 */
function clearAllUtilityMinies(index) {
    utilityMini = utilityFilesArray[index];
    const utilityInstances = document.querySelectorAll(`.mini-${utilityMini.name.split(".")[0]}`);
    for (let i = 0; i < utilityInstances.length; i++) {
        utilityInstances[i].remove();
    }
}

/**
 *  clear selected aoe
 *
 *  @param index - position of the aoe to clear in aoe created elements list [aoeElementsArray]
 */
function clearAOE(index) {
    aoeElementsArray[index].remove();
    aoeElementsArray.splice(index,1);
    aoesDataArray.splice(index,1);
    displayAOE();
}

/**
 *  clear selected room
 *
 *  @param index - position of the room to clear in rooms created elements list [roomElementsArray]
 */
function clearRoom(index) {
    if(roomElementsArray.length>0) {
        roomElementsArray[index].remove();
        roomElementsArray.splice(index,1);
        roomsDataArray.splice(index,1);
        displayRoom();
    }
}


/**
 * Clear all minies placed on map
 */
function clearMiniesOnMap() {
    const minies = document.querySelectorAll(`.mini-on-map`);
    for (let i = 0; i < minies.length; i++) {
        minies[i].remove();
    }
    const aoes = document.querySelectorAll(`.aoe-on-map`);
    aoeElementsArray = [];
    aoesDataArray = [];
    displayAOE();
    for (let i = 0; i < aoes.length; i++) {
        aoes[i].remove();
    }
    const rooms = document.querySelectorAll(`.room-on-map`);
    console.log('rooms');
    console.log(rooms);
    roomElementsArray = [];
    roomsDataArray = [];
    displayRoom();
    for (let i = 0; i < rooms.length; i++) {
        rooms[i].remove();
    }
}

/**
 * Open help window
 */
function help() {
    message = `
    <div style="display: flex; justify-content: end;">
        <input type="button" onclick="closeHelp()" value="X"></input>
    </div>
    <strong>General:</strong>
    <ul>
        <li>Some buttons have a title set, so if some part of the interface is not clear try hovering the mouse, in few seconds the hint about what the element do will appear.</li>
        <li>There are 4 sections: <br/>
            top - header (Map load, scale & rotation factor for minis and utility buttons).<br/>
            left - menu (PC load, utilities load and AOE circles definition).<br/>
            right - main (Map will be loaded here, and minis are placed here after selection).<br/>
            bottom - footer (load mini npc for scenario here).<br/>
        </li>
        <li>How to use: Load your minis in the section required, click on minis loaded to select them and finally click in the main section where you want to place the minis on map.</li>
        <li>Mostly of the minis are one time use, placing them and the clicking elsewere on map will remove the first placement and keep the last. The only exception are the Utility minis (menu section) they persist and any new click place a new icon, to clear them on map press the 'X' after the mini name in menu->utility section.</li>    
    </ul>
    <br/>
    <strong>Utility buttons (top right buttons):</strong>
    <ul>
        <li>Question mark: Help, open this guide.</li>
        <li>Eraser: Clear all minis from map.</li>
        <li>Eye: hide/collapse the toolbars, enlarging the map. Some toolbar are collapsed but not hidden to make it easier to select minis even in full page view.</li>
    </ul>
    <br/>
    <strong>Asset loading:</strong>
    <ul>
        <li>Every set of minis (npcs, pcs and utilities) have a 'clear all' button that unload the entire section.</li>
        <li>Mini name is determined from image loaded name, _ are replaced with a space, and the extension is removed.</li>
        <li>Each mini currently added must have unique name, since the 'remove old version of mini from the map' operation (during mini place change) rely on image names to identify which element must be removed, using same name on different minis imply that any time one of the minis that share a name is moved all minis with same name are cleared from map.</li>
    </ul>
    <br/>
    <strong>AOE Usage:</strong>
    <p>
        To create a circular AOE (Only circular area available) the AOE section in menu provide a tool to do so, the only parameter required is the 
        radius (not diameter) of the circle.<br/>
        The radius must be expressed in percentage based on the page size (since loaded maps doesn't have a default cell size, it's impossible 
        define a standard 'foot' size of the AOE), to help you to create an aoe of the desired size you can enable the 'scale' via the button 
        'show/hide scale' that will show over the map how much space will cover a specific percentage, based on that you should be able to create 
        any aoe of desired size.<br/>
        <br/>
        Once the size of your AOE is defined, click on 'create' button of the aoe section, from now any click on the map will place the 
        AOE (any selected mini won't be moved, AOE placement take priority over mini placement), the point clicked with your cursor will be center 
        of the AOE circle.<br/>
        Once the AOE is placed any click on map will continue to move the selected mini (or place anoter utility, anyways the behaviour on map 
        is reverted to its state before placing the AOE)<br/>
        <br/>
        AOEs can be also customized with their own color (blue, green, red and yellow, 4 color should be enough) and name, AOE name will be shown
        on the top of the circle and in the list of the active AOEs below the AOE creation buttons. <br/> 
        Color and name should provide an easy way to indentify easily any AOE on your map.<br/>
        <br/>
        An AOE can be deleted via the 'X' button next to its name on the AOEs list or with the ereaser button (that will clear all the minis and 
        AOEs from the map)
    </p>
    <strong>Room Usage:</strong>
    <p>
        Like AOE, room require a specified width & height in percentage that define the rectangle of the room, the point of placement will be the 
        center of the room.<br/> 
        Only one room allowed per time, creating a new room will remove previous one.
    </p>
    <strong>Shortcuts:</strong>
    <p>
        <ul>
            <li><strong>ctrl+C</strong>: Clear all minis</li>
            <li><strong>ctrl+F</strong>: Enable/disable full page</li>
            <li><strong>ctrl+M</strong>: Open minis loading window</li>
            <li><strong>ctrl+P</strong>: Open PC loading window</li>
            <li><strong>ctrl+U</strong>: Open utility loading window</li>
            <li><strong>ctrl+1...9</strong>: Select mini from 1 to 9 based on key pressed</li>
        </ul>    
    </p>
    `;

    helpElement = document.createElement('div');
    helpElement.style.cssText = `
    position:fixed;
    top:25%;
    left:25%;
    width:50%;
    height:50%;
    padding:2% 1%;
    z-index:101;
    background-color: #777;
    color:white;
    overflow-y:scroll`;
    helpElement.innerHTML = message;
    document.body.appendChild(helpElement);
}

/**
 * Close help window
 */
function closeHelp() {
    helpElement.remove();
}

/**
 * Close all aoes messages (fallback in case aoe message won't close on his own)
 */
function closeAOEMessage() {
    const aoesMessage = document.querySelectorAll(`.AOEMessage`);
    for (let i = 0; i < aoesMessage.length; i++) {
        aoesMessage[i].remove();
    }
}
