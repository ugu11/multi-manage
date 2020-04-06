import React from 'react'
import { deleteSessionCookies, getSessionCookie, ORG_TOKEN, USER_TOKEN } from '../helpers/session/auth.js'
import { FiLogOut } from "react-icons/fi";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import {connect} from 'react-redux'
import {updateUserData, updateTablesData} from '../actions.js'
import '../localStorage.js'
import { deleteState } from '../localStorage.js'
import '../css/NavBar.scss'

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

class NavbarComponent extends React.Component{
    constructor(){
        super()
        const params = getUrlParams(window.location.href)
        this.state = {
            navbarData: [],
            tableId: params.tableId,
            displaySmallScreenMenu: false
        }
    }

    componentDidMount(){
        const reqData = {
            orgIdToken: getSessionCookie(ORG_TOKEN),
            userTokenId: getSessionCookie(USER_TOKEN)
        }
        fetch('https://us-central1-multi-manage.cloudfunctions.net/users-getLoggedInUserData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqData)})
                .then(resp => resp.json())
                .then(res => {
                    if(res.status === "deauth"){
                        deleteSessionCookies()
                        deleteState()
                        window.location.reload(false)
                    }else
                        return res
                })
                .then(resp => {
                    this.props.updateUser(resp)
                })
                .catch(err => {
                    if(err.status === "deauth"){
                        deleteSessionCookies()
                        deleteState()
                        window.location.reload(false)
                    }else
                        throw err
                })
            
        fetch('https://us-central1-multi-manage.cloudfunctions.net/tables-getNavbarTablesData?orgId='+getSessionCookie(ORG_TOKEN)+'&tokenId='+getSessionCookie(USER_TOKEN))
            .then(res => res.json())
            .then(res => {
                if(res.status === "deauth"){
                    deleteSessionCookies()
                    window.location.reload(false)
                    deleteState()
                }
                return res
            })
            .then(res => {
                this.props.updateTables(res)
            })
            .catch(err => {
                if(err.status === "deauth"){
                    deleteSessionCookies()
                    deleteState()
                    window.location.reload(false)
                }else
                    throw err
            })
        // }
    }

    toggleSmallScreenMenu = () => this.setState(prevState => ({displaySmallScreenMenu: !prevState.displaySmallScreenMenu}))

    render(){
        return (
            (this.props.userData !== undefined && this.props.userData !== null) ?
                <nav>

                    <div id="big-screen">
                        <ul id="top-bar">

                            <li onClick={() => {
                                deleteSessionCookies()
                                deleteState()
                                window.location.href = "/login"
                            }}> <label id="logout-icon"><label id="logout-label">Log out</label> <FiLogOut /></label> </li>

                            <h1>Multi Manage</h1>

                        </ul>

                        <ul id="side-bar">
                            <li id="user-info">
                                <h3 id="user-navbar">{this.props.userData.name}</h3>
                                <h5 id="job-role-navbar">{this.props.userData.jobRole}</h5>
                            </li>

                            {(this.props.userData.admin) ?
                                <li id="manage-tables-item" className={(this.state.tableId === "manage_tables") ? "checked-section" : ""}> <a href="/?tableId=manage_tables"> Manage tables </a></li> : ""}
                            {(this.props.userData.admin) ?
                                    <li className={(this.state.tableId === "manage_users") ? "checked-section" : ""}> <a href="/?tableId=manage_users"> Users </a></li> : ""}
                            <li className="separator">&nbsp;</li>
                                
                            {
                                (this.props.tablesData !== null && this.props.tablesData !== undefined) ?
                                    this.props.tablesData.map(table => 
                                        <li key={table.tableId} className={(this.state.tableId === table.tableId) ? "checked-section" : ""} onClick={() => window.location.href = "/?tableId="+table.tableId}>
                                            {table.tableName}
                                        </li>
                                    )
                                : ""
                            }
                            
                        </ul>
                    </div>

                    <div id="small-screen">

                        <div id="top-bar">
                            <h1>Multi Manage</h1>
                            <button onClick={this.toggleSmallScreenMenu}>
                                {
                                    (this.state.displaySmallScreenMenu === true)
                                    ? <IoMdClose />
                                    : <IoMdMenu />
                                }
                            </button>
                        </div>
                        {
                            (this.state.displaySmallScreenMenu === true) ?
                                <ul id="side-bar">
                                    <li id="user-info">
                                        <h3 id="user-navbar">{this.props.userData.name}</h3>
                                        <h5 id="job-role-navbar">{this.props.userData.jobRole}</h5>
                                    </li>
        
                                    {(this.props.userData.admin) ?
                                        <li id="manage-tables-item" className={(this.state.tableId === "manage_tables") ? "checked-section" : ""}> <a href="/?tableId=manage_tables"> Manage tables </a></li> : ""}
                                    {(this.props.userData.admin) ?
                                            <li className={(this.state.tableId === "manage_users") ? "checked-section" : ""}> <a href="/?tableId=manage_users"> Users </a></li> : ""}
                                    <li className="separator">&nbsp;</li>
                                        
                                    {
                                        (this.props.tablesData !== null && this.props.tablesData !== undefined) ?
                                            this.props.tablesData.map(table => 
                                                <li key={table.tableId} className={(this.state.tableId === table.tableId) ? "checked-section" : ""} onClick={() => window.location.href = "/?tableId="+table.tableId}>
                                                    {table.tableName}
                                                </li>
                                            )
                                        : ""
                                    }
                                    <li onClick={() => {
                                        deleteSessionCookies()
                                        deleteState()
                                        window.location.href = "/login"
                                    }}> <label id="logout-icon"><label id="logout-label">Log out</label> <FiLogOut /></label> </li>
        
                                </ul>
                            : ""
                        }
                        
                    </div>

                </nav>

            : ""
        )
    }
}


const mapStateToProps = state => {
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

export const Navbar = connect(
    mapStateToProps,
    mapDispatchToProps
)(NavbarComponent)
