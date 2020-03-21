export const userData = (state = [], action) => {
    switch(action.type){
        case 'UPDATE':
            return action.newData
        default:
            return state
    }
}