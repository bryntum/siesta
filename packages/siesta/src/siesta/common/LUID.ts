// locally unique identifier

export type LUID = number

let ID : LUID = 0

export const luid = () : LUID => ID++
