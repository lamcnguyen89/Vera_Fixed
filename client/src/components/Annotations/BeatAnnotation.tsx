import React, { Component } from 'react'
import { connect } from 'react-redux'
import { deleteBeat } from '../../helpers/OwlAPIs'
import GeneralModal from '../GeneralModal'
import '../../styles/Timeline.css'

interface IBeatAnnotationProps {
  width: string;
  id:any;
  auth:any;
  match:any;
  subject:any;
  rerender?: any;
}

interface IBeatAnnotationState {
  deleteId: any,
  modalHeader: any,
  row1: Array<any>,
  row2: Array<any>,
  row3: Array<any>,
  footer: Array<any>,
  showModal: boolean;
}

class BeatAnnotation extends Component<IBeatAnnotationProps, IBeatAnnotationState> {
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

  deleteBeat = (e:any) => {
    const prjId = this.props.match.params.projectId
    const token = this.props.auth.token

    deleteBeat(token, prjId, this.state.deleteId, this.props.subject, null)
    this.toggleModal()
    // this.props.rerender();
  }

  handleDeleteBeat = (e:any) => {
    e.preventDefault()
    this.setState({ deleteId: e.currentTarget.title.substr(1) }, () => {
      this.setState({
        modalHeader: { title: 'Delete Beat' },
        row1: [
          { element: 'p', fontSize: '18px', text: 'Are you sure you want to delete this beat? Doing so will permanently delete all data attached to it.' }
        ],
        row2: null,
        row3: null,
        footer: [
          { element: 'button', text: 'Cancel', variant: 'primary', col: 2, onClick: this.toggleModal },
          { element: 'button', text: 'Delete', variant: 'danger', col: 2, onClick: this.deleteBeat }
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
        <div title={this.props.id} className="beat-annotation" style={{ width: this.props.width }} onContextMenu={this.handleDeleteBeat}></div>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({
  auth: state.auth
})

export default connect(mapStateToProps, {})(BeatAnnotation)
