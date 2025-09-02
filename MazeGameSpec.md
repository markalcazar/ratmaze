#Maze Game 
We are to create an online maze game with a rat navigating through a maze. 
This file describes the specification of the game, the desired behaviors, and module layout. 

We will write this game in javascript and standalone html. If there are online open-source libraries that can expedite development, please suggest them for use. Please also leverage any online assets to reuse. 

##Game definition 
The game will start by showing a partial view of part of a maze. The user uses the navigation keys to move a mouse through the maze. As the user moves the arrow keys, the mouse will navigate through the maze, showing more of the maze. 

There is one defined exit point from the Maze. Once the user has successfully exited the maze, the game will display a victory UI. 

##Program Structure 
Create one major HTML page, a subfolder for images and assets. Create one main javascript file 'main.js' and as many other subsequent files necessary. 

If the javascript in a file exceeds than 4k, you are to create a separate file. 

##Major Modules

###Maze generation 
This module randomly generates a maze with one exit. You are to use an appropriate datastructure to represent the maze. 
##Maze display
This paints the maze from the generated maze. When the game begins, it only renders part of the maze using a spotlight that only shows the part of the maze currently visible to the rat. 

##Mouse and Asset display 
The mouse is to be displayed at the starting point of the maze, showing only part of the maze. The mouse is a pre-defined asset that you are to load. 

###Game Loop 
As the user uses the arrow-keys, the mouse is to move through the maze, and more of the maze is to become visible. 

###Navigation and Collision detection
The mouse should not be able to walk through walls, the maze is a constraint in where the mouse can navigate. 


###AssetLoading and Generation 
Load images on game startup. Use a predefined image for the mouse, and other assets you deem necessary. 
###Timer Countdown
Display a seconds and minutes timer showing the time since the user started the game. 

###Wining UI
On successfully exiting the maze, display exploding fireworks on top of the game, the words 'you won' and display the timer. 

