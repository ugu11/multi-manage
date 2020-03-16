import React from 'react'
import '../css/ModalBox.scss'


class ModalBox extends React.Component{
    /*
        Props:
        toggleModal => Function to toggle the modal box
        dataFields => jsx data to be shown inside the modal box
        isShown => Flag used to display or not the modal box
    */
    constructor(props){
        super(props)
    }

    render(){
        return (
            <div>
                <div className="modal-bg" onClick={this.props.toggleModal} style={{
                        display: (this.props.isShown) ? "grid" : "none"
                    }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        {this.props.dataFields}
                    </div>
                </div>
            </div>
        )
    }
}

export default ModalBox