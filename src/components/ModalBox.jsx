import React from 'react'
import '../css/ModalBox.scss'

/*
    Props:
    toggleModal => Function to toggle the modal box
    dataFields => jsx data to be shown inside the modal box
    isShown => Flag used to display or not the modal box
*/

const ModalBox = (props) => {
    return(
        <div>
            <div className="modal-bg" onClick={props.toggleModal} style={{
                    display: (props.isShown) ? "grid" : "none"
                }}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    {props.dataFields}
                </div>
            </div>
        </div>
    )
}

export default ModalBox