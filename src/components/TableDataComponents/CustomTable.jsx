import React from 'react'
import ModalBox from '../ModalBox'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'

class CustomTable extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            tableData: null,
            tableName: "",
            showModal: false,
            dataFields: "",
            fieldController: {}
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
                    dataSubmited: false,
                    tableData: res,
                    tableName: res.name,
                    fieldController: fieldController,
                    dataFields: (
                            <div>
                                <h1>Add new item</h1>
                                <form onSubmit={async (e) =>  {
                                    e.preventDefault()
                                    this.setState({dataSubmited: true})
                                    fetch('https://us-central1-multi-manage.cloudfunctions.net/addTableRow', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            orgId: getSessionCookie(ORG_TOKEN),
                                            tokenId: getSessionCookie(USER_TOKEN),
                                            tableId: this.props.tableId,
                                            tableData: JSON.stringify(this.state.fieldController)
                                        }),
                                    })
                                    .then(res => {
                                        if(res.json().status === "deauth"){
                                            deleteSessionCookies()
                                            window.location.reload(false)
                                        }
                                        return res
                                    }).then(e => {
                                        window.location.reload(false)
                                    }).catch(err => {
                                        if(err.status === "deauth")
                                            deleteSessionCookies()
                                        else
                                            throw err
                                    })
                                }}>
                                    {res.fields.map(field => 
                                        (field.type === 'select') ?
                                            <select key={field.name} className="txt-field" onChange={this.handleInputChange} name={field.name}>
                                                {field.select_data.map((selectValue, i) => 
                                                    <option key={selectValue+"-"+i} value={selectValue}>{selectValue}</option>)}
                                            </select>
                                        :
                                            <input key={field.name} type={field.type} value={this.state.fieldController[field.name]} onChange={this.handleInputChange} name={field.name} className="txt-field" placeholder={field.name}/>

                                    )}
                                    <input type="submit" className="btn" disabled={this.state.dataSubmited} value="Add new item"/>
                                </form>
                            </div>
                        ),
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

    handleInputChange = (e) => {
        let {fieldController} = this.state
        fieldController[e.target.name] = e.target.value

        this.setState({
            fieldController: fieldController
        })
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