/*

https://github.com/iAmNathanJ/cursor

The MIT License (MIT)
Copyright (c) 2020 iamnathanj


Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.

*/

// @ts-ignore
import { encode } from "https://deno.land/std@0.83.0/encoding/utf8.ts"

declare const Deno

const isTerminalApp = Deno.env.get("TERM_PROGRAM") === "Apple_Terminal"

const ESC = "\u001B["

const SAVE = isTerminalApp ? "\u001B7" : ESC + "s"
const RESTORE = isTerminalApp ? "\u001B8" : ESC + "u"
const POSITION = "6n"
const HIDE = "?25l"
const SHOW = "?25h"
const SCROLL_UP = "T"
const SCROLL_DOWN = "S"

const UP = "A"
const DOWN = "B"
const RIGHT = "C"
const LEFT = "D"

const CLEAR_RIGHT = "0K"
const CLEAR_LEFT = "1K"
const CLEAR_LINE = "2K"

const CLEAR_DOWN = "0J"
const CLEAR_UP = "1J"
const CLEAR_SCREEN = "2J"
const CLEAR = "\u001Bc"

const NEXT_LINE = "1E"
const PREV_LINE = "1F"
const COLUMN = "1G" // left?
const HOME = "H"

function write (str : string) {
  Deno.stdout.writeSync(encode(str))
}

function cursor (action : string) {
  write(ESC + action)
}

function save () {
  write(SAVE)
}

function restore () {
  write(RESTORE)
}

function position () {
  cursor(POSITION)
}

function hideCursor () {
  cursor(HIDE)
}

function showCursor () {
  cursor(SHOW)
}

function scrollUp () {
  cursor(SCROLL_UP)
}

function scrollDown () {
  cursor(SCROLL_DOWN)
}

function clearUp () {
  cursor(CLEAR_UP)
}

function clearDown () {
  cursor(CLEAR_DOWN)
}

function clearLeft () {
  cursor(CLEAR_LEFT)
}

function clearRight () {
  cursor(CLEAR_RIGHT)
}

function clearLine () {
  cursor(CLEAR_LINE)
}

function clearScreen () {
  cursor(CLEAR_SCREEN)
}

function nextLine () {
  cursor(NEXT_LINE)
}

function prevLine () {
  cursor(PREV_LINE)
}

function goHome () {
  cursor(HOME)
}

function goUp (y = 1) {
  cursor(y + UP)
}

function goDown (y = 1) {
  cursor(y + DOWN)
}

function goLeft (x = 1) {
  cursor(x + LEFT)
}

function goRight (x = 1) {
  cursor(x + RIGHT)
}

function goTo (x : number, y : number) {
  write(ESC + y + ";" + x + HOME)
}

export {
  CLEAR,
  CLEAR_DOWN,
  CLEAR_LEFT,
  CLEAR_LINE,
  CLEAR_RIGHT,
  CLEAR_SCREEN,
  CLEAR_UP,
  clearDown,
  clearLeft,
  clearLine,
  clearRight,
  clearScreen,
  clearUp,
  COLUMN,
  DOWN,
  goDown,
  goHome,
  goLeft,
  goRight,
  goTo,
  goUp,
  HIDE,
  hideCursor,
  HOME,
  LEFT,
  NEXT_LINE,
  nextLine,
  POSITION,
  position,
  PREV_LINE,
  prevLine,
  RESTORE,
  restore,
  RIGHT,
  SAVE,
  save,
  SCROLL_DOWN,
  SCROLL_UP,
  scrollDown,
  scrollUp,
  SHOW,
  showCursor,
  UP,
}
