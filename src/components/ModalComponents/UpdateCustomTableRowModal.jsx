import React from 'react'
import AddFieldModalData from './AddFieldModalData'
import { getSessionCookie, ORG_TOKEN, USER_TOKEN, deleteSessionCookies } from '../../helpers/session/auth'
import ProcessingComponent from '../ProcessingComponent'
import { deleteState } from '../../localStorage'
import { MdTransferWithinAStation } from 'react-icons/md'

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

class UpdateCustomTableRowModal extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            modalFieldData: null,
            fields: null,
            processingRequest: false,
            dataSubmited: false
        }
    }

    componentDidUpdate(pP, prevState){
        if(prevState.modalFieldData === null && this.props.modalFieldData !== prevState.modalFieldData)
            this.setState({modalFieldData: this.props.modalFieldData})
        if(prevState.fields === null && this.props.fields !== prevState.fields)
            this.setState({fields: this.props.fields})
    }

    handleInputChange = (e) => {
        let {fieldController} = this.state
        fieldController[e.target.name] = e.target.value

        this.setState({
            fieldController: fieldController
        })
    }
    
    updateFieldValue = (e) => {
        let {modalFieldData} = this.state
        const index = parseInt(e.target.name)
        modalFieldData[index].fieldValue = e.target.value

        this.setState({modalFieldData: modalFieldData})
    }


    render(){
        return (
            <div>
                <ProcessingComponent radius="0" display={this.state.processingRequest} />
                <h1>Add new item</h1>
                <form onSubmit={async (e) =>  {
                    e.preventDefault()
                    this.setState({dataSubmited: true, processingRequest: true})
                    if(this.state.dataSubmited === false)
                        fetch('https://us-central1-multi-manage.cloudfunctions.net/updateTableRow', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orgId: getSessionCookie(ORG_TOKEN),
                                tableId: getUrlParams(window.location.href).tableId,
                                rowData: JSON.stringify(this.state.modalFieldData),
                                tokenId: getSessionCookie(USER_TOKEN),
                                rowIndex: parseInt(getUrlParams(window.location.href).rowIndex)
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
                        })
                        .catch(err => {
                            if(err.status === "deauth"){
                                deleteSessionCookies()
                                deleteState()
                                window.location.reload(false)
                            }else
                                throw err
                        })
                }}>
                    {
                        (this.state.modalFieldData !== null && this.state.fields !== null) ?
                            this.state.modalFieldData.map((field, i) => {
                                let fieldData = this.state.fields.filter(f => f.name === field.fieldName)[0]
                                
                                if(fieldData !== undefined)
                                    return (fieldData.type === 'select') ?
                                        <select key={fieldData.name} className="txt-field" onChange={this.updateFieldValue} name={i} defaultValue={field.fieldValue}>
                                            {fieldData.select_data.map((selectValue, selectIndex) => 
                                                <option key={selectValue+"-"+selectIndex} value={selectValue} >{selectValue}</option>)}
                                        </select>
                            :
                                <input key={fieldData.name} type={fieldData.type} className="txt-field"
                                    name={i} placeholder={field.fieldName}
                                    value={field.fieldValue} onChange={this.updateFieldValue} />
                        })
                        : ""
                    }
                    <input type="submit" className="btn" disabled={this.state.dataSubmited} value="Submit changes"/>
                </form>
            </div>
        )
    }
}

export default UpdateCustomTableRowModal