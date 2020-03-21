import React from 'react'
import { deleteSessionCookies, getSessionCookie, ORG_TOKEN, USER_TOKEN } from '../helpers/session/auth.js'

import {connect} from 'react-redux'
import {updateUserData, updateTablesData} from '../actions.js'
import '../localStorage.js'
import { deleteState } from '../localStorage.js'

class NavbarComponent extends React.Component{
    constructor(){
        super()
        this.state = {
            navbarData: []
        }
    }

    componentDidMount(){
        const reqData = {
            orgIdToken: getSessionCookie(ORG_TOKEN),
            userTokenId: getSessionCookie(USER_TOKEN)
        }
        fetch('https://us-central1-multi-manage.cloudfunctions.net/getLoggedInUserData', {
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
            
        fetch('https://us-central1-multi-manage.cloudfunctions.net/getNavbarTablesData?orgId='+getSessionCookie(ORG_TOKEN)+'&tokenId='+getSessionCookie(USER_TOKEN))
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

    render(){
        return (
            <nav>
                {(this.props.userData !== undefined) ?
                    <ul>
                        <li>
                            <h3>{this.props.userData.name}</h3>
                            <h5>{this.props.userData.orgName}</h5>
                        </li>

                        {(this.props.userData.admin) ?
                            <li> <a href="/?table=manage_tables"> Manage tables </a></li> : ""}
                        {(this.props.userData.admin) ?
                                <li> <a href="/?table=manage_users"> Users </a></li> : ""}
                        <li> </li>
                        {
                            this.props.tablesData.map(table => 
                                <li key={table.tableId}> <a href={"/?table="+table.tableId}>{table.tableName}</a></li>
                            )
                        }
                        
                        <li> <a href="/login" onClick={
                            () => {
                                deleteSessionCookies()
                                deleteState()
                            }
                        }> Log out </a></li>
                    </ul>
                : ""
                }
            </nav>
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
