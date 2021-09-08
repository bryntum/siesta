"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var playwright_1 = require("playwright");
var MediaNodeWebSocketParent_js_1 = require("../src/rpc/media/MediaNodeWebSocketParent.js");
var ServerNodeWebSocket_js_1 = require("../src/rpc/server/ServerNodeWebSocket.js");
var SimulatorPlaywright_js_1 = require("../src/siesta/simulate/SimulatorPlaywright.js");
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var browser, wsServer, wsPort, awaitConnection, page, port, media, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, playwright_1.default.firefox.launch({ headless: false, /*devtools : true, */ args: ['--window-size maximized'] })];
            case 1:
                browser = _b.sent();
                wsServer = new ServerNodeWebSocket_js_1.ServerNodeWebSocket();
                return [4 /*yield*/, wsServer.startWebSocketServer()];
            case 2:
                wsPort = _b.sent();
                awaitConnection = new Promise(function (resolve) { return wsServer.onConnectionHook.once(function (self, socket) { return resolve(socket); }); });
                return [4 /*yield*/, browser.newPage({ viewport: null })];
            case 3:
                page = _b.sent();
                page.on('console', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                    var i, _a, _b, _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                i = 0;
                                _d.label = 1;
                            case 1:
                                if (!(i < msg.args().length)) return [3 /*break*/, 4];
                                _b = (_a = console).log;
                                _c = i + ": ";
                                return [4 /*yield*/, msg.args()[i].jsonValue()];
                            case 2:
                                _b.apply(_a, [_c + (_d.sent())]);
                                _d.label = 3;
                            case 3:
                                i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                page.on('pageerror', function (e) { return console.log(e); });
                port = SimulatorPlaywright_js_1.SimulatorPlaywrightServer.new({ page: page });
                media = MediaNodeWebSocketParent_js_1.MediaNodeWebSocketParent.new();
                port.media = media;
                return [4 /*yield*/, page.goto('http://localhost:8000/src/index.html')];
            case 4:
                _b.sent();
                return [4 /*yield*/, page.waitForLoadState('load')
                    // // @ts-ignore
                    // await page.waitForFunction(() => window.connect !== undefined)
                ];
            case 5:
                _b.sent();
                // // @ts-ignore
                // await page.waitForFunction(() => window.connect !== undefined)
                console.log("GOTO DONE");
                return [4 /*yield*/, page.evaluate("window.connect(" + wsPort + ")")];
            case 6:
                _b.sent();
                console.log("EVAL DONE");
                _a = media;
                return [4 /*yield*/, awaitConnection];
            case 7:
                _a.socket = _b.sent();
                port.handshakeType = 'parent_first';
                return [4 /*yield*/, port.connect()];
            case 8:
                _b.sent();
                console.log("CONNECTED");
                return [2 /*return*/];
        }
    });
}); };
run();
