
// export const isAbsolute = (url : string) : boolean => {
//     return new URL(url, "http://base/").href === url
// }


export const relative = (baseUrl : string, url : string) : string => {
    baseUrl = baseUrl.replace(/\/?$/, '/')

    const indexOf = url.indexOf(baseUrl)

    if (indexOf === 0) return url.slice(baseUrl.length)

    return url
}
