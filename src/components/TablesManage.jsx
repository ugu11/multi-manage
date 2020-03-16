import React from 'react'
import AddFields from './AddFields'
import ModalBox from './ModalBox'
import { getSessionCookie, ORG_TOKEN, deleteSessionCookies, USER_TOKEN } from '../helpers/session/auth.js'

class TablesManage extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            tableData: null,
            dataFields: <AddFields />
        }
    }
    
    componentDidMount(){
        fetch('https://us-central1-multi-manage.cloudfunctions.net/getNavbarTablesData?orgId='+getSessionCookie(ORG_TOKEN)+'&tokenId='+getSessionCookie(USER_TOKEN))
            .then(res => res.json())
            .then(res => {
                console.log(res)
                this.setState({
                    tableData: res
                })
            })
            .catch(err => {
                if(err.status === "deauth")
                    deleteSessionCookies()
                else
                    throw err
            })
    }
    
    handleRowClick = (index) => {
      window.location.href = "/viewrow?tableId="+this.state.tableData._id+"&rowIndex="+index
    }

    toggleModal = () => {
        const { showModal } = this.state
        this.setState({
        showModal: !showModal
        })
        console.log(this.state)
    }
    
    render(){
        return (

            <div id="content">
                <ModalBox dataFields={this.state.dataFields} isShown={this.state.showModal} toggleModal={this.toggleModal}/>

                <h1>{ this.state.tableName }</h1>
                <div className="actions">
                    <button className="btn" onClick={this.toggleModal}>Add item</button>
                    <input type="text" className="txt-field" placeholder="search"/>
                </div>
                    <table>
                        <thead>
                            <th>Table name</th>
                        </thead>

                        <tbody>
                            {(this.state.tableData !== null) ?
                                this.state.tableData.map((table, i) => 
                                    <tr onClick={() => this.handleRowClick(i)}>
                                        <td>{table.tableName}</td>
                                    </tr>
                                )
                            : ""}
                        </tbody>
                    </table>

            </div>
        )
    }
}

export default TablesManage