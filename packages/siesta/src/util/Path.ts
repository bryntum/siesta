// TODO this module is currently just a quick&dirty implementation, needs proper refactoring,
// since the WHATWG URL implementation is a total crap (lacks any useful methods,
// like `isAbsolute`, `join`, etc

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isAbsolute = (url : string) : boolean => {
    return /^(https?:|file:\/\/\/|\/)/i.test(url)
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const relative = (baseUrl : string, url : string) : string => {
    baseUrl = baseUrl.replace(/\/?$/, '/')

    const indexOf = url.indexOf(baseUrl)

    if (indexOf === 0) return url.slice(baseUrl.length)

    return url
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const stripBasename = (url : string, keepTrailingSlash : boolean = false) : string =>
    url.replace(/\/[^/]*?$/, keepTrailingSlash ? '/' : '')


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const stripDirname = (url : string) : string => url.replace(/^.*\//, '')


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const stripTrailingSlash = (url : string) : string => url.replace(/\/$/, '')


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const ensureTrailingSlash = (url : string) : string => url.replace(/\/?$/, '/')


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const joinUrls = (baseUrl : string, relativeUrl : string) : string => {
    return isAbsolute(relativeUrl) ? relativeUrl : ensureTrailingSlash(baseUrl) + relativeUrl
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TODO The `URL` api treats the top-level segment specifically..
// in general feels a bit messy, but works
// needs a proper implementation

// this method strips the `./`, `../` segments from the URL
// normalizing it to the actual url
export const normalizeUrl = (url : string, baseUrl? : string) : string => {
    const protocolMatch     = /^(https?|file):\/\//.exec(url)
    const leadingSlash      = /^\//.exec(url)

    const normalized        = new URL(!protocolMatch ? 'http://' + url : url, baseUrl)

    if (protocolMatch)
        return normalized.href
    else {
        const stripFakeProtocol = normalized.href.replace(/^http:\/\//, '')

        return leadingSlash ? '/' + stripFakeProtocol : stripFakeProtocol
    }
}
