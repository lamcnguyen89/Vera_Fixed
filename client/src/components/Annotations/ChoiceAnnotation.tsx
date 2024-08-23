import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deleteChoice } from '../../helpers/OwlAPIs'
import GeneralModal from '../GeneralModal'
import '../../styles/Timeline.css'

interface IChoiceAnnotationProps {
  id:any;
  auth:any;
  match:any;
  subject:any;
  rerender?: any;
}

interface IChoiceAnnotationState {
  deleteId: any,
  modalHeader: any,
  row1: Array<any>,
  row2: Array<any>,
  row3: Array<any>,
  footer: Array<any>,
  showModal: boolean;
}

class ChoiceAnnotation extends Component<IChoiceAnnotationProps, IChoiceAnnotationState> {
  state = {
    deleteId: '',
    modalHeader: '',
    row1: [{}],
    row2: [{}],
    row3: [{}],
    footer: [{}],
    showModal: false
  }

  toggleModal = () => {
    this.setState({ showModal: !this.state.showModal })
  }

  deleteChoice = (e:any) => {
    const prjId = this.props.match.params.projectId
    const token = this.props.auth.token

    deleteChoice(token, prjId, this.state.deleteId, this.props.subject, null)
    this.toggleModal()
    this.props.rerender()
  }

  handleDeleteChoice = (e:any) => {
    e.preventDefault()
    this.setState({ deleteId: e.currentTarget.title.substr(1) }, () => {
      this.setState({
        modalHeader: { title: 'Delete Choice' },
        row1: [
          { element: 'p', fontSize: '18px', text: 'Are you sure you want to delete this choice? Doing so will permanently delete all data attached to it.' }
        ],
        row2: null,
        row3: null,
        footer: [
          { element: 'button', text: 'Cancel', variant: 'primary', col: 2, onClick: this.toggleModal },
          { element: 'button', text: 'Delete', variant: 'danger', col: 2, onClick: this.deleteChoice }
        ]
      })

      this.toggleModal()
    })
    return false
  }

  render () {
    return (
      <div>
        <GeneralModal
          showModal={this.state.showModal}
          toggleModal={this.toggleModal}
          header={this.state.modalHeader}
          row1={this.state.row1}
          footer={this.state.footer}
        />
        <div title={this.props.id} className="choice-annotation" onContextMenu={this.handleDeleteChoice}></div>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({
  auth: state.auth
})

export default connect(mapStateToProps, {})(ChoiceAnnotation)
