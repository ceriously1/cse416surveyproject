# cse416surveyproject

Followed the following sources extensively:
https://www.youtube.com/watch?v=Dorf8i6lCuk&t=7488s
https://www.youtube.com/playlist?list=PL55RiY5tL51q4D-B63KBnygU6opNPFk_q

Working on login next.

npm start in /owo (client) or /uwu (server) to start.
Remember to npm install everything to get things working.
Backend:
    checkAuth is deprecated. You can now do router('/path', (req, res) => {...}) without any middleware.

For /uwu (server), build /owo client first (npm run build). Then, move the entire build folder into uwu. After that,
npm start will work. Note for anything database related (login, sign up, etc.), HTTPS MUST BE USED. Regular http will not work.

Eric Chan
- Working on adding surveys
- considering using smart contracts to send out payments (if someone could figure that out, that would be great)

James
- Translated some of the schemas in js files
- server.js is still a todo
- Adding below just for my own reference as well as to document the code. Feel free if to correct this if I messed up on some parts Eric.

app.js
- file to handle the network code. Mainly the http requests.
- Essentially, most of the Express code should go here except for /routes

/routes
- quick reference: https://expressjs.com/en/guide/routing.html
- Used to break down the http requests by page so that they aren't all clutter in app.js

/models
- Formats the schema used in the database for use with mongoose

server.js
- Script that connects the computer to the web.

TODO
These are tasks I don't think anyone else has taken on yet. Not comprehensive. 
- Most of the webpage design
- Backend search functionality for finding new surveys by tag and name
- Create the functions to enable data visualization
- Function to export the data
