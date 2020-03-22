import React from 'react'
import ModalBox from '../ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'
import AddNewTableRow from '../ModalComponents/AddNewTableRow'

class CustomTable extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            tableData: null,
            tableName: "",
            showModal: false,
            dataFields: "",
            fieldController: {},
        }
    }

    componentDidMount(){
        fetch('https://us-central1-multi-manage.cloudfunctions.net/getOrgTableData?orgId='+getSessionCookie(ORG_TOKEN)+'&tableId='+this.props.tableId+'&tokenId='+getSessionCookie(USER_TOKEN))
            .then(res => res.json())
            .then(res => {
                if(res.status === "deauth"){
                    deleteSessionCookies()
                    window.location.reload(false)
                }
                return res
            })
            .then(res => {
                let fieldController = {}

                res.fields.forEach(field => {
                    if(field.type === 'select')
                        fieldController[field.name] = field.select_data[0]
                    else
                        fieldController[field.name] = ""
                })

                this.setState({
                    tableData: res,
                    tableName: res.name,  
                    fieldController: fieldController,
                })
            }).catch(err => {
                // console.log(err)
                if(err.status === "deauth"){
                    deleteSessionCookies()
                    window.location.reload(false)
                }
                // throw err
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
    }
    
    render(){
        return (

            <div id="content">
                <ModalBox dataFields={<AddNewTableRow tableData={this.state.tableData} fieldController={this.state.fieldController}/>} isShown={this.state.showModal} toggleModal={this.toggleModal}/>

                <h1>{ this.state.tableName }</h1>
                <div className="actions">
                    <button className="btn" onClick={this.toggleModal}>Add item</button>
                    <input type="text" className="txt-field" placeholder="search"/>
                </div>

                {
                    (this.state.tableData !== null) ?
                        <table>
                            <thead>
                                <tr>
                                    {this.state.tableData.fields.map(field => 
                                        (field.display_table) ?
                                            <th key={field.name}>{field.name}</th> : "")
                                    }
                                </tr>
                            </thead>

                            <tbody>
                                {this.state.tableData.data.map((row, i) => 
                                    <tr key={i} onClick={() => this.handleRowClick(i)}>
                                        {this.state.tableData.fields.map(field => 
                                            (field.display_table) ? 
                                                <td key={row[field.name]+"-"+i}>{row[field.name]}</td> : "")}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    : ""
                }

            </div>

        )
    }
}

export default CustomTable