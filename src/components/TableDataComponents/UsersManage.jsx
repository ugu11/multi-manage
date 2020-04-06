import React from 'react'
import { deleteSessionCookies, getSessionCookie, ORG_TOKEN, USER_TOKEN } from '../../helpers/session/auth.js'
import { deleteState } from '../../localStorage.js'
import {connect} from 'react-redux'
import ModalBox from '../ModalBox'
import CreateUserModal from '../ModalComponents/CreateUserModal'

class UsersManageComponent extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            usersData: null,
            showModal: false,
            tablePage: 1,
            nPages: 1
        }
    }

    componentDidMount(){
        this.getTableRows(this.state.tablePage)
            .then(res => {
                console.log(res, res.json())
                switch(res.status){
                    case 200:
                        return res.json()
                    case 401:
                        window.location = "/"
                        break
                    default:
                        window.location = "/"
                }
            })
            .then(res => {
                if(res.status === "deauth"){
                    deleteSessionCookies()
                    deleteState()
                    window.location.reload(false)
                }else{
                    this.setState({
                        usersData: {"1": res.usersData},
                        nPages: res.nPages
                    })
                }
            })
            .catch(err => {
                if(err.status === "deauth"){
                    deleteSessionCookies()
                    deleteState()
                }else
                    throw err
            })
    }

    getTableRows = (nPage) => {
        return fetch('https://us-central1-multi-manage.cloudfunctions.net/users-getUsers?page='+nPage+'&orgId='+getSessionCookie(ORG_TOKEN)+'&tokenId='+getSessionCookie(USER_TOKEN))
    }
    
    handleRowClick = (userId) => {
      window.location.href = "/viewrow?type=manage_users&userId="+userId
    }

    toggleModal = () => {
        const { showModal } = this.state
        this.setState({
            showModal: !showModal
        })
    }

    nextPage = () => {
        let {tablePage, usersData} = this.state
        // console.log(tableData[tablePage+1+""])
        if(tablePage < this.state.nPages){
            if(usersData[tablePage+1+""] === undefined){
                this.getTableRows(tablePage+1)
                    .then(res => {
                        switch(res.status){
                            case 200:
                                return res.json()
                            case 401:
                                window.location = "/"
                                break
                            default:
                                window.location = "/"
                        }
                    })
                    .then(res => {
                        if(res.status === "deauth"){
                            deleteSessionCookies()
                            deleteState()
                            window.location.reload(false)
                        }else{
                            usersData[tablePage+1+""] = res.usersData
            
                            this.setState({
                                usersData: usersData,
                                nPages: res.nPages,
                                tablePage: tablePage+1
                            })
                        }
                    })
                    .catch(err => {
                        if(err.status === "deauth"){
                            deleteSessionCookies()
                            deleteState()
                            window.location.reload(false)
                        }else
                            throw err
                    })
            }else
                this.setState(prevState => ({tablePage: prevState.tablePage+1}))
        }
    }


    prevPage = () => {
        let {tablePage, usersData} = this.state
        // console.log(tableData[tablePage+1+""])
        if(tablePage > 1){
            if(usersData[(tablePage-1)+""] === undefined){
                this.getTableRows((tablePage-1))
                    .then(res => {
                        switch(res.status){
                            case 200:
                                return res.json()
                            case 401:
                                window.location = "/"
                                break
                            default:
                                window.location = "/"
                        }
                    })
                    .then(res => {
                        if(res.status === "deauth"){
                            deleteSessionCookies()
                            deleteState()
                            window.location.reload(false)
                        }else{
                            usersData[(tablePage-1)+""] = res.usersData
            
                            this.setState({
                                usersData: usersData,
                                nPages: res.nPages,
                                tablePage: tablePage-1
                            })
                        }
                    })
                    .catch(err => {
                        if(err.status === "deauth"){
                            deleteSessionCookies()
                            deleteState()
                            window.location.reload(false)
                        }else
                            throw err
                    })
            }else
                this.setState(prevState => ({tablePage: prevState.tablePage-1}))
        }
    }
    
    render(){
        return (
            <div id="content">
                <ModalBox dataFields={<CreateUserModal />} isShown={this.state.showModal} toggleModal={this.toggleModal}/>

                <h1>Users Manager</h1>
                <div id="table-container">
                    <div className="actions">
                        <button className="btn" onClick={this.toggleModal}>Add item</button>
                        <input type="text" className="txt-field" placeholder="search"/>
                    </div>

                    {(this.state.usersData !== null && this.state.usersData !== undefined) ?
                        <div id="table">
                            <table>
                                <thead>
                                    <tr>
                                    <th>User</th>
                                    <th>Username</th>
                                    <th>Job Role</th>
                                    <th>Admin</th>
                                    </tr>
                                </thead>

                                    <tbody>
                                            {this.state.usersData[this.state.tablePage+""].map(user => 
                                                <tr key={user._id} onClick={() => this.handleRowClick(user._id)}>
                                                    <td>{user.name}</td>
                                                    <td>{user.username}</td>
                                                    <td>{user.jobRole}</td>
                                                    <td>{(user.admin === true) ? "Yes" : "No"}</td>
                                                </tr>
                                            )}
                                    </tbody>
                            </table>
                        </div>
                    : ""}
                    {
                        (this.state.nPages !== 1) ? 
                            <div id="pagination-container">
                                <button className="btn" onClick={this.prevPage}> &lt; </button>
                                <label>{this.state.tablePage} of {this.state.nPages}</label>
                                <button className="btn" onClick={this.nextPage}>&gt;</button>
                            </div>
                        : ""
                    }
                </div>
            </div>
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
  return {}
}

export const UsersManage = connect(
  mapStateToProps,
  mapDispatchToProps
)(UsersManageComponent)
