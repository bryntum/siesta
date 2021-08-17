export const delay = (timeout : number) : Promise<any> => new Promise(resolve => setTimeout(resolve, timeout))

export async function summer (a : number, b : number) : Promise<number> {
    await delay(10)

    return a + b
}

export type Zoomer = { name : string, age : number }

export  function zoomer (name : string, age : number) : Zoomer {
    return { name, age }
}
