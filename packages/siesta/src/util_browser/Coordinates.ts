export const clientXtoPageX = (x : number, win : Window) : number => x + win.scrollX

export const clientYtoPageY = (y : number, win : Window) : number => y + win.scrollY

export const pageXtoClientX = (x : number, win : Window) : number => x - win.scrollX

export const pageYtoClientY = (y : number, win : Window) : number => y - win.scrollY
