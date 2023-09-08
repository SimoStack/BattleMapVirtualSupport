# Battle Map virtual support
## Premise
This software has been developed for my own personal use, since it was working fine and it was usable for mine (non developers) friends, i've chosen to publish this code free to anyone how is willing to use it.  
I've no programs about maintaining/changing/improving anything about this repo, but fell yourself free to make any request, if i have spare time and request are doable i will gladly add new features.  
If anyone is willing to extend or change massively the source code fell free take the entire code base in this repo and make it his own. 

## Introduction
Battle map virtual support is intended as a free and easy to use platform in which anyone can load **its own** assets.  
No server or other structures required to use this software, just download the repo and open the Mapper.html file to be ready to go.

## Quick start
Download the repo (or the repo zip, in case you are not familiar with handling repositories) via **[ < > Code ]** button.  
Once the repo package is downloaded open Mapper.html file in your own favourite browser (tested on chrome) to be ready to go.

Main intended usage is to load your map, PCs and Minis, select them from menu and start placing them on your map.  
Additional features have been introduced for mine necessities and are described in the following sections.

## Functionalities
### Load assets (Map, PC avatars, Mini avatars, Utilities avatars)
Any image of .jpg/.jpeg/.png can be loaded as asset, as general rule the name used for the loaded asset (it may be a PC, Mini or Utility) is the name of the image with the underscores (_) replaced with space.  
The "clear all" button near the upload avatar button will allow you to discard all the loaded assets for the current section. 

#### Load Map
Mapper starts with already loaded default map (it can be changed replacing the default_map.jpg under /assets folder), if a new map is required it can be loaded via the button "choose file" placed in top toolbar near the "Map:" text.  
Once the new map is selected, it will be replaced automatically to the previous one.

#### Load PC avatars
In right menu PC avatars can be loaded with the "choose file" button under PC section, only the asset name will be shown in preview.  
To place a PC on the map just click their name on the menu to select the desired PC (selected PC have a red banner as background), then click on the map, and the icon of selected PC will appear. Subsequent clicks will replace the previous position of the PC with the new one selected

#### Load Utilities avatars
In right menu Utilities avatars can be loaded with the "choose file" button under Utility section, once loaded the assets their names with a small icon and a X (meant to clear all the utility instances on map) will be shown in preview.  
Utilities are meant for avatars you need to place more than one time (like fire flames, bushes, chairs...) so their selection and placement will be identical to the one described in **Load PC Avatar**, but every click on map will create a new utility avatar on map without clearing previous ones.  
All utilities of the same type will be cleared if the "X" button placed at the right of the utility name in the menu is pressed.

#### Load Miniatures avatars
In footer section Minis can be loaded with the "choose file" button, asset name and image will be shown below.
Minis selection (selected mini have his name color changed and a withe aura behind the image) and print on map follow the same rules described in **Load PC Avatar** section. 

### Draw (circular) AOE
In right menu AOE section you can define your own circular area to place on map, the size (radius) of the circle must be specified in "percentage of the page width" (so 100 mean that the radius of the area is long as your screen width), to help you to create an aoe of the desired size you can enable the 'scale' via the button
'show/hide scale' that will show over the map how much space will cover a specific percentage, based on this you should be able to create
any aoe of desired size.  

Once the size of your AOE is defined, click on 'create' button of the aoe section, from now any click on the map will place the
AOE (any selected avatar won't be moved, AOE placement take priority over avatar placement), the point clicked with your cursor will be center
of the AOE circle.  
Once the AOE is placed any click on map will continue to move the selected mini (or place anoter utility, anyways the behaviour on map
is reverted to its state before placing the AOE).  

AOEs can be also customized with their own color (blue, green, red and yellow, 4 color should be enough) and name, AOE name will be shown
on the top of the circle and in the list of the active AOEs below the AOE creation buttons.  
Color and name should provide an easy way to indentify easily any AOE on your map.  

An AOE can be deleted via the 'X' button next to its name on the AOEs list or with the ereaser button (that will clear all the minis and
AOEs from the map)

### Draw (rectangular) room
Like AOE, room require a specified width & height in percentage (of the page width) that define the rectangle of the room, the point of placement will be the
center of the room.  
Only one room allowed per time, creating a new room will remove previous one.

### Map Utilities
#### Toolbar icon: Question mark
Open help guide dialog

#### Toolbar icon: Eraser
Clear all minis from map

#### Toolbar icon: Eye 
Full page function: Hide/collapse the toolbars, enlarging the map and vice versa. Some toolbars are collapsed but not hidden to make it easier to select minis even in full page view.

#### Scale Mini
Increase or decrease the avatar placed of the factor specified, 100% is the original size of the avatar

#### Rotate Mini
Rotate the avatar placement based on the degrees(°) specified

### Shortcuts
It's possible to access some features with keyboard shortcuts:
- **ctrl+C**: Clear all avatars on map
- **ctrl+F**: Enable/disable full page
- **ctrl+M**: Open minis loading assets window
- **ctrl+P**: Open PC loading assets window
- **ctrl+U**: Open utility loading assets window
- **ctrl+1...9**: Select mini from 1 to 9 based on key pressed

## Known limits
- Rooms and AOE features doesn't scale properly when full page mode is activated, so if you plan to add one define its dimensions a little bigger to fit well on full page visualization (use the "show/hide scale" button to determine the size of your areas you must use)
- That's a pure JS/HTML/CSS software, auto-loading assets are now allowed to prevent security issues. 
# BattleMapVirtualSupport
# BattleMapVirtualSupport
