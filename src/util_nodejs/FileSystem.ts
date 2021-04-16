import fs from 'fs'
import path from 'path'


// TODO support symlinks


export const scanDir = (dir : string, forEach : (entry : fs.Dirent, filename : string) => any, ignore? : RegExp) : false | void => {
    const entries   = fs.readdirSync(dir, { withFileTypes : true })

    for (let i = 0; i < entries.length; i++) {
        const entry     = entries[ i ]

        if (entry.isDirectory() && (!ignore || !ignore.test(entry.name))) {
            if (scanDir(path.resolve(dir, entry.name), forEach) === false) return false
        }
        else if (entry.isFile()) {
            if (forEach(entry, path.resolve(dir, entry.name)) === false) return false
        }
    }
}


export const scanDirAsync = async function* (dirName : string, ignore? : RegExp) : AsyncGenerator<string> {
    const dir   = await fs.promises.opendir(dirName, { bufferSize : 128 })

    for await (const entry of dir) {
        const fullName  = path.resolve(dirName, entry.name)

        if (entry.isDirectory() && (!ignore || !ignore.test(entry.name))) {
            yield* scanDirAsync(fullName)
        }
        else if (entry.isFile()) {
            yield fullName
        }
    }
}
