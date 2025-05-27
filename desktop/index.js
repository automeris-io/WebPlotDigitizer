const { app, BrowserWindow, dialog, ipcMain, shell, screen } = require('electron')

const createWindow = () => {
    const screenSize = screen.getPrimaryDisplay().workAreaSize;

    const win = new BrowserWindow({
        title: "WPD",
        width: parseInt(screenSize.width*0.75),
        height: parseInt(screenSize.height*0.75),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    win.loadFile('offline.html');

    var allowQuit = false;
    win.on('close', async function(e) {
        if(!allowQuit) {
            e.preventDefault();
            var choice = await dialog.showMessageBox(win,
                {
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    title: 'Confirm',
                    message: 'Are you sure you want to quit?'
                });
            if(choice.response == 0){
                allowQuit = true;
                app.quit();
            }
        }
    })
}

app.on('window-all-closed', () => {
    app.quit()
})

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

ipcMain.on("app_exit", () => {
    app.quit();
});
