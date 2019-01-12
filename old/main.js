//Electron paketini kullanarak bir uygulama oluşuturuyoruz.
const {app, BrowserWindow, Tray} = require('electron')
var path = require('path')
// Import the Nucleus Library and init with your app id
const { dialog } = require('electron')
const Swal = require('sweetalert2')

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}
function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};

// Burada pencere objesini global referans olarak tutuyoruz. Eğer bunu yapmaz isek pencere otomatik olarak kapanacak.
let win

function createWindow () {
  // Yeni bir pencere oluşturuyoruz.
  // Pencere ilk açıldığında genişliği 800, yüksekliği 600 px olacak.
win = new BrowserWindow({
width: 600,
height: 600,
titleBarStyle: 'hidden',
icon: path.join(__dirname,'./ico/favicon.ico'),
resizable: false,
})
win.setMenu(null)



  // Uygulamanın içerisine index.html dosyasını yükle.
  win.loadURL(`file://${__dirname}/index.html`)

  // Bu kısım şart değil, yazarsanız uygulama başladığında sağ tarafta konsolu görürsünüz. Kodları incelemek açısından şimdilik kalsın.
   //win.webContents.openDevTools()

  // Pencere kapandığında uygulamayı kapat.
  win.on('closed', () => {
    win = null
  })
}

// Bu metod Electron başladığında çağırılacak ve bir tarayıcı penceresi oluşturacak.
app.on('ready', createWindow)

// Tüm pencereler kapatıldığında uygulamayı sonlandır.
app.on('window-all-closed', () => {
  // MacOS sistemlerde uygulama ekranı kapanmasına rağman menü çubuğu hala aktif kalabildiğinden dolayı MacOs için ayriyetten bu kodu yazıyoruz.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // Yine MacOS'ta Dock üzerinde uygulama iconuna tekrar tıklayınca bir pencere daha açar.
  if (win === null) {
    createWindow()
  }
})

// Bu dosyada uygulama ile ilgili başka ana işlemler kodları yazmaya devam edebiliriz.
// Ayrıca onları başka bir dosyaya yazıp buraya referans vererek kullanabiliriz.
