import * as Cookies from 'js-cookie'

/*
userToken - user idToken
orgToken - org id
*/

export const USER_TOKEN = "userToken"
export const ORG_TOKEN = "orgToken"


export const setSessionCookie = (cookieName, session) => {
    Cookies.remove(cookieName)
    Cookies.set(cookieName, session, {expires: 3600})
}

export const getSessionCookie = (cookieName) => {
    const sessionCookie = Cookies.get(cookieName)
    console.log("=> ",sessionCookie)
    if(sessionCookie === undefined)
        return {}
    else
        return sessionCookie
}

export const deleteSessionCookie = (cookieName) => {
    Cookies.remove(cookieName)
}

export const deleteSessionCookies = () => {
    Cookies.remove(USER_TOKEN)
    Cookies.remove(ORG_TOKEN)
}

export const isSessionCookieSet = (cookieName) => {
    const sessionCookie = Cookies.get(cookieName)
    return !(sessionCookie === undefined)
}