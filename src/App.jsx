import React from 'react';
import './css/App.css';
import './css/Dashboard.scss';
import {Navbar} from './components/Navbar'
import CustomTable from './components/CustomTable'
import TablesManage from './components/TablesManage'

import {connect} from 'react-redux'
import {updateUserData} from './actions/updateUserData.js'

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
  }

  render(){
    return (
      <div className="App">
   
        <Navbar />

       { /*

        USE REDUX TO SAVE THE TABLES REQUESTS IN NAVBAR COMPONENT AND OUTSIDE :D

        */}
  
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
    userData: state
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateUser: () => dispatch(updateUserData('userDataTest heheheh'))
  }
}

export const AppComponent = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
