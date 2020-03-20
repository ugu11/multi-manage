import {combineReducers} from 'redux'
import {tablesData} from './tablesData'
import {userData} from './userData'

export default combineReducers({
    tablesData,
    userData
})