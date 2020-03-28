import React from 'react'

const DataContainerField = (props) => (
    <div className="field-display">
        <label className="field-label">{props.label}</label>
        <div className="field-value">{props.value}</div>
    </div>)

export default DataContainerField