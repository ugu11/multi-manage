export const loadState = () => {
    try{
        const serializedData = localStorage.getItem('state')
        if(serializedData === null)
            return undefined
        return JSON.parse(serializedData)
    }catch(err){
        return undefined
    }
}

export const saveState = state => {
    try{
        const serializedState = JSON.stringify(state)
        localStorage.setItem('state', serializedState)
    }catch(err){
        // Ignore errors for now
    }
}

export const deleteState = () => {
    try{
        localStorage.removeItem('state')
    }catch(err){

    }
}