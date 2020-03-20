export const tablesData = (state = [], action) => {
    switch(action.type){
        case 'UPDATE_TABLES':
            console.log(action.newData)
            return action.newData
        default:
            return state
    }
}