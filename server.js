// ETS2Viewer
// Copyright © 2014 Carl Hewett

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

var fs = require("fs");
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

var dataFilePath = "C:/Program Files (x86)/Steam/SteamApps/common/Euro Truck Simulator 2/bin/win_x86/ETS2Data.txt";
 
var defaultFilePath = "/index.html";

var newline = "\n";

// Path: "C:/Program Files (x86)/Steam/SteamApps/common/Euro Truck Simulator 2/bin/win_x86/ETS2Data.txt"

// Truck data order: Heading, pitch, roll, speed, rpm, gear

app.get('/', function(req, res){
	res.sendfile("index.html");
});

io.on('connection', function(socket){
	userConnected();
	socket.on("disconnect", userDisconnected);
	
	socket.on("request-data", sendData);
});

http.listen(2000, function(){
	console.log('listening on port 2000');
});

function userConnected()
{
	console.log("User connected");
}

function userDisconnected()
{
	console.log("User disconnected");
}

function sendData()
{
	fs.readFile(dataFilePath, {encoding: "UTF8", flag: "r"}, function (err, data) {
		var latestData = "";
		var gotCharacter = false;
		var indexOfFirstCharacterOfLine = 0;
	
		if (err)
		{
			console.log("Error reading data file! Is it's path '" + dataFilePath + "'? If not, please modify it in server.js. The file should be in the same directory as the Euro Truck Simulator 2 binary.");
		}
		
		for(var i=data.length-1; i>0; i--)
		{
			if(gotCharacter && data[i]==newline)
			{
				indexOfFirstCharacterOfLine = i - 1;
				break;
			} else
			{
				gotCharacter = true;
			}
		}
		
		for(var i=indexOfFirstCharacterOfLine; i<data.length; i++)
		{
			if(data[i]!=newline)
			{
				latestData = latestData + data[i];
			}
		}
		
		io.emit("data", latestData);
	});
}
