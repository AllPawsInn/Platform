const electron = require('electron')
const path = require ('path')
const url = require('url')

process.env.NODE_ENV = 'development';

const{app, BrowserWindow, Menu, ipcMain} = electron //pull required objects from electron module

let mainWindow; //visible window
let addWindow;

//Listen for app to be ready
app.on('ready', function(){
	//Create new Window
	mainWindow = new BrowserWindow({});
	// Load html into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocol: 'file:',
		slashes : true
	})); // above block is equivelant to file://dirname/mainWindow.html

	//Quit app when closed
	mainWindow.on('closed', function(){
		app.quit();
	});

	// Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)

	// Insert Menu
	Menu.setApplicationMenu(mainMenu); // replaces former menu
	// to do: get developer tools menu option back?


});


//Handle create add window
function createAddWindow(){

	addWindow = new BrowserWindow({
		width: 200,
		height: 300,
		title : 'Add Dog'
	});

	// Load html into window
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'addWindow.html'),
		protocol: 'file:',
		slashes : true
	}));

	//garbage collect
	addWindow.on('close', function(){
		addWindow = null;
	});
}


//Catch added dogs
ipcMain.on('item:add', function(e, item){
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});


// ---------------------- Create Menu --------------------
const mainMenuTemplate = [
	{
		label: 'File',
		submenu:[
			{
				label: 'Add Item',
				click(){
					createAddWindow();
				}
			},
			{
				label: 'Clear Items',
				click(){
					mainWindow.webContents.send('item:clear') //no item sent
				}
			},
			{
				label: 'Quit',
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				//above line : process.platform brings OS info
				// 'darwin' for mac so command q else ctrl q
				click(){
					app.quit();
				}
			}
		]
	}
];

//if mac
if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
}

//add developer tools
if(process.env.NODE_ENV !== 'production'){
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu:[
			{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+Shift+I',
				click(item, focusedWindow){ //focus on the currentwindow
					focusedWindow.toggleDevTools();
				}
			},
			{
				role: 'reload'
			}
		]
	})
}