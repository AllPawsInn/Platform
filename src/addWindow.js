function createAddWindow(){

	const {BrowserWindow} = require('electron').remote;
	let addWindow = new BrowserWindow({
		width: 700,
		height: 600,
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
