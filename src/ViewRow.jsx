import React from 'react'
import './css/ViewRow.scss'

import {connect} from 'react-redux'
import {updateUserData} from './actions/updateUserData.js'
import { ViewCustomTableRow } from './components/ViewRowComponents/ViewCustomTableRow';
import { ViewTablesManageRow } from './components/ViewRowComponents/ViewTablesManageRow';
import { ViewUsersManageRow } from './components/ViewRowComponents/ViewUsersManageRow';

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
        return (
            <div id="dashboard-content">
                {(this.state.params.type === 'manage_tables') ?
                  <ViewTablesManageRow />
                : (this.state.params.type === 'manage_users') ? 
                  <ViewUsersManageRow />
                : <ViewCustomTableRow />}
            </div>
        )
    }
}

const mapStateToProps = state => {
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
