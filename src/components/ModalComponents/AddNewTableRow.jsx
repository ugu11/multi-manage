import React from 'react'
import AddFieldModalData from './AddFieldModalData'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'
import ProcessingComponent from '../ProcessingComponent'
import { deleteState } from '../../localStorage'

class AddNewTableRow extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            dataSubmited: false,
            tableData: null,
            tableName: "",
            fieldController: null,
            processingData: false
        }
    }

    componentDidUpdate(pP, prevState){
        if(prevState.tableData === null && this.props.tableData !== prevState.tableData)
            this.setState({tableData: this.props.tableData})
        if(prevState.fieldController === null && this.props.fieldController !== prevState.fieldController)
            this.setState({fieldController: this.props.fieldController})
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
            <div>
                <ProcessingComponent  radius="0" display={this.state.processingData} />
                <h1>Add new item</h1>
                <form onSubmit={async (e) =>  {
                    e.preventDefault()
                    this.setState({dataSubmited: true, processingData: true})
                    if(this.state.dataSubmited === false)
                        fetch('https://us-central1-multi-manage.cloudfunctions.net/addTableRow', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orgId: getSessionCookie(ORG_TOKEN),
                                tokenId: getSessionCookie(USER_TOKEN),
                                tableId: this.state.tableData._id,
                                tableData: JSON.stringify(this.state.fieldController)
                            }),
                        })
                        .then(res => {
                            if(res.json().status === "deauth"){
                                deleteSessionCookies()
                                deleteState()
                            }
                            window.location.reload(false)
                            return res
                        }).catch(err => {
                            if(err.status === "deauth")
                                deleteSessionCookies()
                            else
                                throw err
                        })
                }}>
                    {
                        (this.state.tableData !== null) ?
                            this.state.tableData.fields.map(field => 
                                (field.type === 'select') ?
                                    <select key={field.name} className="txt-field" onChange={this.handleInputChange} name={field.name}>
                                        {field.select_data.map((selectValue, i) => 
                                            <option key={selectValue+"-"+i} value={selectValue}>{selectValue}</option>)}
                                    </select>
                                :
                                    <input key={field.name} type={field.type} value={this.state.fieldController[field.name]} onChange={this.handleInputChange} name={field.name} className="txt-field" placeholder={field.name}/>
        
                            )
                        : ""
                    }
                    <input type="submit" className="btn" disabled={this.state.dataSubmited} value="Add new item"/>
                </form>
            </div>
        )
    }
}

export default AddNewTableRow