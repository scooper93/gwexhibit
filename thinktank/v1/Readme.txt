Initial Instructions:

To get this working on another machine you need to do a few things. 

Download Node.js from here, and install NPM with it. 

You can download it from here
https://nodejs.org/en/

next, open a terminal and navigate to your outreach svn folder, and find the folder location of this file. 

type 'npm update' without quotes and this should install everything you need

Install bower using 'sudo npm install -g bower' and then run 'bower update'

then 'bower update' again, if the json files are setup correctly this should install all the packages you need. 

once this has all finished, type node app 

and it should launch the webserver

then go to localhost:3000/projector.html - to see the projector page

and localhost:3000/control.html to see the control page. these are very basic/blank at the moment, but all that needs doing now should be the front end

If you do not have an arduino connceted, then the webserver will still run but you'll get a 'Board: Looking for connected device' Message showing in the terminal window

To get the arduino working (this will be done by Sam on the outreach pc, so this is just for your use), get an arduino UNO, and download the Arduino IDE from here: https://www.arduino.cc/en/Main/Software.

Then connect the board to your computer and open the Ardunio program. Then navigate to File, examples, Firmata, then Standard FirmataPlus, and uplaod this to the board. Once this is done you can close the Arduino software.

Update:

Please ensure that you do allow controlio in node_modules to sync when updating the svn repo

