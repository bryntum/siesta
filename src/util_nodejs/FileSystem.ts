import fs from 'fs'
import path from 'path'

export const scanDir = (dir : string, forEach : (entry : fs.Dirent, filename : string) => any) : false | void => {
    const entries   = fs.readdirSync(dir, { withFileTypes : true })

    for (let i = 0; i < entries.length; i++) {
        const entry     = entries[ i ]

        if (!entry.isDirectory()) {
            if (forEach(entry, path.resolve(dir, entry.name)) === false) return false
        }
    }

    for (let i = 0; i < entries.length; i++) {
        const entry     = entries[ i ]

        if (entry.isDirectory()) {
            if (scanDir(path.resolve(dir, entry.name), forEach) === false) return false
        }
    }
}
