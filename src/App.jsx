import React from 'react';
import './css/App.css';
import './css/Dashboard.scss';
import {Navbar} from './components/Navbar'
import CustomTable from './components/CustomTable'
import {TablesManage} from './components/TablesManage'

import {connect} from 'react-redux'
import {updateUserData, updateTablesData} from './actions.js'
import { deleteState } from './localStorage.js'
import { deleteSessionCookies, getSessionCookie, ORG_TOKEN, USER_TOKEN } from './helpers/session/auth.js'

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

class App extends React.Component {

  constructor(props){
    super(props)
    const params = getUrlParams(window.location.href)
    this.state = {
      tableId: params.table,
    }

    if((this.state.tableId === 'manage_tables' || this.state.tableId === 'manage_users') && this.props.userData.admin === false)
      window.location = "/"

    console.log(this.state.tableId)
    if(this.state.tableId === undefined)
      if(this.props.tablesData[0] === undefined)
        fetch('https://us-central1-multi-manage.cloudfunctions.net/getNavbarTablesData?orgId='+getSessionCookie(ORG_TOKEN)+'&tokenId='+getSessionCookie(USER_TOKEN))
          .then(res => res.json())
          .then(res => {
              console.log(res)
              if(res.status === "deauth"){
                  deleteSessionCookies()
                  window.location.reload(false)
                  deleteState()
              }
              return res
          })
          .then(res => {
              this.props.updateTables(res)
              window.location.reload(false)
          })
          .catch(err => {
              if(err.status === "deauth"){
                  deleteSessionCookies()
                  deleteState()
              }else
                  throw err
          })
      else
        window.location = "/?table="+this.props.tablesData[0].tableId

  }

  render(){
    return (
      <div className="App">
   
        <Navbar />
        {
          (this.state.tableId === 'manage_tables') ?
            <TablesManage/>
          : (this.state.tableId === 'manage_users') ?
            <CustomTable tableId={this.state.tableId}/>
          :
            <CustomTable tableId={this.state.tableId}/>
        }
      </div>
    );
  }
}

const mapStateToProps = state => {
  console.log(state)
  return {
    userData: state.userData,
    tablesData: state.tablesData
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateUser: (newUserData) => dispatch(updateUserData(newUserData)),
    updateTables: (newTableData) => dispatch(updateTablesData(newTableData))
  }
}

export const AppComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
