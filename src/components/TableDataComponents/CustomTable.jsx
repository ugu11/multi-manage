import React from 'react'
import ModalBox from '../ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'
import AddNewTableRow from '../ModalComponents/AddNewTableRow'
import { deleteState } from '../../localStorage'

class CustomTable extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            tableData: null,
            tableName: "",
            showModal: false,
            dataFields: "",
            fieldController: {},
            tablePage: 1,
            nPages: 1
        }
    }

    componentDidMount(){
        this.getTableRows(this.state.tablePage)
            .then(res => res.json())
            .then(res => {
                if(res.status === "deauth"){
                    deleteSessionCookies()
                    deleteState()
                    window.location.reload(false)
                }
                return res
            })
            .then(res => {
                let fieldController = {}

                console.log(res)

                res.tableData.fields.forEach(field => {
                    if(field.type === 'select')
                        fieldController[field.name] = field.select_data[0]
                    else
                        fieldController[field.name] = ""
                })

                res.tableData.data = {"1": res.tableData.data}

                this.setState({
                    tableData: res.tableData,
                    tableName: res.tableData.name,  
                    fieldController: fieldController,
                    nPages: res.nPages
                })
            }).catch(err => {
                if(err.status === "deauth"){
                    deleteSessionCookies()
                    deleteState()
                    window.location.reload(false)
                }else
                    window.location = "/"
                // throw err
            })
    }

    getTableRows = (nPage) => {
        return fetch('https://ugomes.com/mm-api/get_table_data?page='+nPage+'&orgId='+getSessionCookie(ORG_TOKEN)+'&tableId='+this.props.tableId,{
            method: 'GET',
            headers: {"x-access-token": getSessionCookie(USER_TOKEN)}
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

    nextPage = () => {
        let {tablePage, tableData} = this.state
        if(tablePage < this.state.nPages){
            if(tableData.data[tablePage+1+""] === undefined){
                this.getTableRows(tablePage+1)
                    .then(res => res.json())
                    .then(res => {
                        if(res.status === "deauth"){
                            deleteSessionCookies()
                            deleteState()
                            window.location.reload(false)
                        }
                        return res
                    })
                    .then(res => {
                        tableData.data[tablePage+1+""] = res.tableData.data
        
                        this.setState({
                            tableData: tableData,
                            nPages: res.nPages,
                            tablePage: tablePage+1
                        })
                    }).catch(err => {
                        if(err.status === "deauth"){
                            deleteSessionCookies()
                            deleteState()
                            window.location.reload(false)
                        }else
                            window.location = "/"
                    })
            }else
                this.setState(prevState => ({tablePage: prevState.tablePage+1}))
        }
    }

    prevPage = () => {
        let {tablePage, tableData} = this.state
        if(tablePage > 1){
            if(tableData.data[(tablePage-1)+""] === undefined){
                this.getTableRows((tablePage-1))
                    .then(res => {
                        alert("THEN")
                        switch(res.status){
                            case 200:
                                return res
                            case 401:
                                deleteSessionCookies()
                                deleteState()
                                window.location.reload(false)
                                break
                            case 403:
                            default:
                                window.location = "/"
                        }
                    })
                    .then(res => res.json())
                    .then(res => {
                        if(res.status === "deauth"){
                            deleteSessionCookies()
                            deleteState()
                            window.location.reload(false)
                        }

                        tableData.data[(tablePage-1)+""] = res.tableData.data
        
                        this.setState({
                            tableData: tableData,
                            nPages: res.nPages,
                            tablePage: tablePage-1
                        })
                    }).catch(err => {
                        if(err.status === "deauth"){
                            deleteSessionCookies()
                            deleteState()
                            window.location.reload(false)
                        }else
                            window.location = "/"
                    })
            }else
                this.setState(prevState => ({tablePage: prevState.tablePage-1}))
        }
    }

    // prevPage = () => (this.state.tablePage > 0) ? this.setState(prevState => ({tablePage: prevState.tablePage-1})) : ""
    
    render(){
        return (

            <div id="content">
                <ModalBox dataFields={<AddNewTableRow tableData={this.state.tableData}/>}
                isShown={this.state.showModal} toggleModal={this.toggleModal}/>

                <h1>{ this.state.tableName }</h1>

                <div id="table-container">
                    <div className="actions">
                        <button className="btn" onClick={this.toggleModal}>Add item</button>
                        <input type="text" className="txt-field search-field" placeholder="search"/>
                    </div>
                    <div id="table">
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
                                        {this.state.tableData.data[this.state.tablePage+""].map((row, i) => 
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
                    {
                        (this.state.nPages !== 1) ? 
                            <div id="pagination-container">
                                <button className="secondary-btn" onClick={this.prevPage}> &lt; </button>
                                <label>{this.state.tablePage} of {this.state.nPages}</label>
                                <button className="secondary-btn" onClick={this.nextPage}>&gt;</button>
                            </div>
                        : ""
                    }
                </div>

            </div>

        )
    }
}

export default CustomTable