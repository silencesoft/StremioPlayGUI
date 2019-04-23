import fs from 'fs';

const userPath = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.config"),
    userPackage = userPath + '/' + process.env.npm_package_name,
    userFile = userPackage + '/config.json';

let json = {};
console.log({userFile});

function testDirectory() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(userPackage)){
            fs.mkdirSync(userPackage);
        }
        resolve();
    });
}

function saveFile() {
    return new Promise((resolve, reject) => {
        testDirectory().then(() => {
            fs.writeFile(userFile, JSON.stringify(json, null, 4), (err) => {
                if (err) {
                    console.error(err);
                    reject('error');
                    return;
                };

                console.log("File has been created");
                resolve();
            });
        });
    });
}

function loadFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(userFile, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                reject('no file');
                return;
            }

            json = JSON.parse(data);

            resolve();
        });
    });
}

export function set(key, value) {
    return new Promise((resolve, reject) => {
        if (!Object.keys(json).length) {
            loadFile().then(() => {
                json = {
                    ...json,
                    [key]: value
                };

                saveFile()
                    .then(() => resolve())
                    .catch((err) => console.log(err));
            })
            .catch((err) => {
                console.log(err)

                json = {
                    ...json,
                    [key]: value
                };

                saveFile()
                    .then(() => resolve())
                    .catch((err) => console.log(err));
            });
            return;
        }

        json = {
            ...json,
            [key]: value
        };

        saveFile()
            .then(() => resolve())
            .catch((err) => console.log(err));
    });
}

export function get(key) {
    return new Promise((resolve, reject) => {
        if (!Object.keys(json).length) {
            loadFile().then(() => {
                if (json && json[key] !== undefined)
                    resolve(json[key]);
                else
                    reject('');
            })
            .catch((err) => console.log(err));
            return;
        }

        resolve(json[key]);
    });
}