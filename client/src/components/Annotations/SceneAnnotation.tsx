import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deleteScene } from '../../helpers/OwlAPIs'
import GeneralModal from '../GeneralModal'
import '../../styles/Timeline.css'

interface ISceneAnnotationProps {
  width: string;
  id:any;
  auth:any;
  match:any;
  subject:any;
  rerender?:any;
}

interface ISceneAnnotationState {
  deleteId: any,
  modalHeader: any,
  row1: Array<any>,
  row2: Array<any>,
  row3: Array<any>,
  footer: Array<any>,
  showModal: boolean;
}

class SceneAnnotation extends Component<ISceneAnnotationProps, ISceneAnnotationState> {
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

  deleteScene = (e:any) => {
    const prjId = this.props.match.params.projectId
    const token = this.props.auth.token

    deleteScene(token, prjId, this.state.deleteId, this.props.subject, null)
    this.toggleModal()
    this.props.rerender()
  }

  handleDeleteScene = (e:any) => {
    e.preventDefault()
    this.setState({ deleteId: e.currentTarget.title.substr(1) }, () => {
      this.setState({
        modalHeader: { title: 'Delete Scene' },
        row1: [
          { element: 'p', fontSize: '18px', text: 'Are you sure you want to delete this scene? Doing so will permanently delete all data attached to it.' }
        ],
        row2: null,
        row3: null,
        footer: [
          { element: 'button', text: 'Cancel', variant: 'primary', col: 2, onClick: this.toggleModal },
          { element: 'button', text: 'Delete', variant: 'danger', col: 2, onClick: this.deleteScene }
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
        <div title={this.props.id} className="scene-annotation" style={{ width: this.props.width }} onContextMenu={this.handleDeleteScene}></div>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({
  auth: state.auth
})

export default connect(mapStateToProps, {})(SceneAnnotation)
