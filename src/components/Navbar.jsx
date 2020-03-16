import React from 'react'
import { deleteSessionCookies, getSessionCookie, ORG_TOKEN, USER_TOKEN } from '../helpers/session/auth.js'

import {connect} from 'react-redux'
import {updateUserData} from '../actions/updateUserData.js'

class NavbarComponent extends React.Component{
    constructor(){
        super()
        this.state = {
            navbarData: []
        }
    }

    componentDidMount(){
        updateUserData("h")
        // if(this.props.userData === undefined || ((new Date().getTime()) - this.props.userData.lastUserDataRequest)/1000 >= 240){
            const reqData = {
                orgIdToken: getSessionCookie(ORG_TOKEN),
                userTokenId: getSessionCookie(USER_TOKEN)
            }
            fetch('https://us-central1-multi-manage.cloudfunctions.net/getLoggedInUserData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqData)})
                    .then(resp => resp.json())
                    .then(resp => {
                        console.log(resp)
                        this.props.updateUser(resp)
                    })
                    .catch(err => {
                        if(err.status === "deauth")
                            deleteSessionCookies()
                        else
                            throw err
                    })
        // }
        fetch('https://us-central1-multi-manage.cloudfunctions.net/getNavbarTablesData?orgId='+getSessionCookie(ORG_TOKEN)+'&tokenId='+getSessionCookie(USER_TOKEN))
            .then(res => res.json())
            .then(res => {
                console.log(res)
                this.setState({
                    navbarData: res
                })
            })
            .catch(err => {
                if(err.status === "deauth")
                    deleteSessionCookies()
                else
                    throw err
            })
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
                            this.state.navbarData.map(table => 
                                <li> <a href={"/?table="+table.tableId}>{table.tableName}</a></li>
                            )
                        }
                        
                        <li> <a href="/login" onClick={
                            () => deleteSessionCookies()
                        }> Log out </a></li>
                    </ul>
                : ""
                }
            </nav>
        )
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
        updateUser: (newUserData) => dispatch(updateUserData(newUserData))
    }
}

export const Navbar = connect(
    mapStateToProps,
    mapDispatchToProps
)(NavbarComponent)
