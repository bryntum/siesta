export type InternalId  = number

let ID : InternalId = 0

export const nextInternalId = () => ID++
