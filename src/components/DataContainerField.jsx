import React from 'react'

const DataContainerField = (props) => (
    <div className="field-display">
        <label className="field-label">{props.label}</label>
        <label className="field-value">{props.value}</label>
    </div>)

export default DataContainerField