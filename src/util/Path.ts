// TODO this module is currently just a quick&dirty implementation, needs proper refactoring,
// since the WHATWG URL implementation is a total crap (lacks any useful methods,
// like `isAbsolute`, `join`, etc

//---------------------------------------------------------------------------------------------------------------------
export const isAbsolute = (url : string) : boolean => {
    return /^(https?:|file:\/\/\/|\/)/i.test(url)
}


//---------------------------------------------------------------------------------------------------------------------
export const relative = (baseUrl : string, url : string) : string => {
    baseUrl = baseUrl.replace(/\/?$/, '/')

    const indexOf = url.indexOf(baseUrl)

    if (indexOf === 0) return url.slice(baseUrl.length)

    return url
}

//---------------------------------------------------------------------------------------------------------------------
export const stripBasename = (url : string, keepTrailingSlash : boolean = false) : string =>
    url.replace(/\/[^/]*?$/, keepTrailingSlash ? '/' : '')


//---------------------------------------------------------------------------------------------------------------------
export const stripDirname = (url : string) : string => url.replace(/^.*\//, '')


//---------------------------------------------------------------------------------------------------------------------
export const stripTrailingSlash = (url : string) : string => url.replace(/\/$/, '')


//---------------------------------------------------------------------------------------------------------------------
export const ensureTrailingSlash = (url : string) : string => url.replace(/\/?$/, '/')


//---------------------------------------------------------------------------------------------------------------------
export const joinUrls = (baseUrl : string, relativeUrl : string) : string => {
    return isAbsolute(relativeUrl) ? relativeUrl : ensureTrailingSlash(baseUrl) + relativeUrl
}
