import React from 'react'
import {Navbar} from './components/Navbar'
import './css/ViewRow.scss'
import { MdEdit } from "react-icons/md";
import ModalBox from './components/ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from './helpers/session/auth'

import {connect} from 'react-redux'
import {updateUserData} from './actions/updateUserData.js'
import { ViewCustomTableRow } from './components/ViewCustomTableRow';
import { ViewTablesManageRow } from './components/ViewTablesManageRow';

function getUrlParams(url) {
	var params = {};
	var parser = document.createElement('a')
	parser.href = url
	var query = parser.search.substring(1)
	var vars = query.split('&')
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=')
		params[pair[0]] = decodeURIComponent(pair[1])
	}
	return params
}

class ViewRowComponent extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            showModal: false,
            modalContent: null,
            fieldData: [],
            fields: [],
            tableName: "",
            modalFieldData: null,
            tableData: null,
            dataSubmited: false,
            params: getUrlParams(window.location.href)
        }
    }

    render(){
        console.log(this.state.fieldData)
        return (
            <div>
                {(this.state.params.type === 'manage_tables') ?
                    <ViewTablesManageRow />
                : <ViewCustomTableRow />}
            </div>
        )
    }
}

// export default ViewRow

const mapStateToProps = state => {
  console.log(state)
  return {
    userData: state
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateUser: (newData) => dispatch(updateUserData(newData))
  }
}

export const ViewRow = connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewRowComponent)
