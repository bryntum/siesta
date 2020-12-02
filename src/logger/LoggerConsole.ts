import { Logger, LogMethod } from "./Logger.js"

export class LoggerConsole extends Logger {

    printLn (method : LogMethod, ...message : string[]) {
        console[ method ](...message)
    }
}
