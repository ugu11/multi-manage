export const tablesData = (state = [], action) => {
    switch(action.type){
        case 'UPDATE_TABLES':
            return action.newData
        default:
            return state
    }
}