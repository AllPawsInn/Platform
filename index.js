const electron = require('electron')
const path = require ('path')
const url = require('url')
const sql = require('mssql');


process.env.NODE_ENV = 'development'; //change it to 'production' if not developing

const{app, BrowserWindow, Menu, ipcMain} = electron //pull required objects from electron module

let mainWindow; //visible window
let addWindow;

//Listen for app to be ready
app.on('ready', function(){
	//Create new Window
	mainWindow = new BrowserWindow({
		frame : false,
		fullscreen : true
	});
	// Load html into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'app/mainWindow.html'),
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

	let sqlConfig = {
		user: 'sa', // your mssql account
		password: 'asdqwe123',
		server: 'DESKTOP-9BJOBVM\\SQLEXPRESS', // your server name
		database: 'KMDB'
	}


	// insert => "INSERT INTO dbo.Colours (ColourName) VALUES ('Blue')"
	// delete => "DELETE FROM dbo.Animals WHERE ID = 16"
	// select => "SELECT * FROM dbo.Animals"
  async function sqlTester() {
	    console.log("sql connecting......")
	    let pool = await sql.connect(sqlConfig)
	    let result = await pool.request()
	       .query("DELETE FROM dbo.Colours WHERE ID = 16")

	    console.log(result)
  }
 sqlTester();

});



//Handle create add window
function createAddWindow(){
	addWindow = new BrowserWindow({
		width: 500,
		height: 300,
		title : 'Add Item'
	});

	// Load html into window
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'app/addWindow.html'),
		protocol: 'file:',
		slashes : true
	}));

	//garbage collect
	addWindow.on('close', function(){
		addWindow = null;
	});
}

//Catch added dogs (sent from addWindow.html)
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