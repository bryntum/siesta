import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"

// need to keep log levels as numbers for efficient comparison
/**
 * The enumeration of the logging levels.
 */
export enum LogLevel {
    /**
     * Most detailed and verbose level
     */
    info,

    /**
     * Slightly less verbose level
     */
    debug,

    /**
     * Log level for important log messages only
     */
    log,

    /**
     * Log level for warnings
     */
    warn,

    /**
     * Log level for errors
     */
    error
}

export type LogMethod = 'info' | 'debug' | 'log' | 'warn' | 'error'

/**
 * The abstract logger mixin. There are several [[LogLevel|log levels]], ranging from the `info` -
 * the lowest, most detailed level, till `error` - the highest, rarely used level, with critical errors only.
 *
 * Every log level has a corresponding logging method: [[info]], [[debug]], [[log]], [[warn]], [[error]].
 *
 * The calls to log methods, corresponding to the lower logging level than the [[logLevel|current one]] are ignored.
 */
export class Logger extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class Logger extends base {
        /**
         * The current log level, the logger operates at.
         */
        logLevel        : LogLevel = LogLevel.log


        printLogMessage (method : LogMethod, ...message : unknown[]) {
            // abstract logger is silent
        }

        /**
         * The log method for the `info` [[LogLevel|log level]]
         *
         * @category Logging
         * @param message
         */
        info (...message : unknown[]) {
            if (this.logLevel <= LogLevel.info) this.printLogMessage('info', ...message)
        }


        /**
         * The log method for the `debug` [[LogLevel|log level]]
         *
         * @category Logging
         * @param message
         */
        debug (...message : unknown[]) {
            if (this.logLevel <= LogLevel.debug) this.printLogMessage('debug', ...message)
        }


        /**
         *The log method for the  `log` [[LogLevel|log level]]
         *
         * @category Logging
         * @param message
         */
        log (...message : unknown[]) {
            if (this.logLevel <= LogLevel.log) this.printLogMessage('log', ...message)
        }


        /**
         * The log method for the `warn` [[LogLevel|log level]]
         *
         * @category Logging
         * @param message
         */
        warn (...message : unknown[]) {
            if (this.logLevel <= LogLevel.warn) this.printLogMessage('warn', ...message)
        }


        /**
         * The log method for the `error` [[LogLevel|log level]]
         *
         * @category Logging
         * @param message
         */
        error (...message : unknown[]) {
            if (this.logLevel <= LogLevel.error) this.printLogMessage('error', ...message)
        }
    }
){}
