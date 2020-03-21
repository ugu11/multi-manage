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
            showModal: false
        }
    }

    componentDidMount(){
        fetch('https://us-central1-multi-manage.cloudfunctions.net/getOrgUsers?orgId='+getSessionCookie(ORG_TOKEN)+'&tokenId='+getSessionCookie(USER_TOKEN))
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
                    window.location.reload(false)
                    deleteState()
                }else{
                    this.setState({
                        usersData: res.usersData
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
    
    handleRowClick = (userId) => {
      window.location.href = "/viewrow?type=manage_users&userId="+userId
    }

    toggleModal = () => {
        const { showModal } = this.state
        this.setState({
            showModal: !showModal
        })
    }
    
    render(){
        return (
            <div id="content">
                <ModalBox dataFields={<CreateUserModal />} isShown={this.state.showModal} toggleModal={this.toggleModal}/>

                <h1>{ this.state.tableName }</h1>
                <div className="actions">
                    <button className="btn" onClick={this.toggleModal}>Add item</button>
                    <input type="text" className="txt-field" placeholder="search"/>
                </div>
                {(this.state.usersData !== null && this.state.usersData !== undefined) ?
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
                                    {this.state.usersData.map((user, i) => 
                                        <tr key={user.username} onClick={() => this.handleRowClick(user._id)}>
                                            <td>{user.name}</td>
                                            <td>{user.username}</td>
                                            <td>{user.jobRole}</td>
                                            <td>{(user.admin === true) ? "Yes" : "No"}</td>
                                        </tr>
                                    )}
                            </tbody>
                    </table>
                : ""}
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
