export const userData = (state, action) => {
    switch(action.type){
        case 'UPDATE':
            console.log(action.newData)
            return action.newData
        default:
            return state
    }
}