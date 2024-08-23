// eslint-disable-next-line no-unused-vars
import React, { useRef, useEffect, useState } from 'react'
import { Row, Col, Dropdown } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons'
import { deleteProject } from '../../helpers/DatabaseAPIs'
import GeneralModal from '../GeneralModal'

type props = {
  name: string
  userStatus: string
  id: string
  key: string
}

const ProjectCard = ({ name, userStatus, id }: props) => {
  const auth = useSelector((state: any) => state.auth)
  const [modal, setModal] = useState(false)
  const [projName, setProjName] = useState(name)
  const [modalFormState, setModalFormState] = useState('')
  const dispatch = useDispatch()
  const history = useHistory()
  //   const dropRef = useRef(null)
  const nv: React.Ref<HTMLDivElement> = useRef()
  // const blah = <FontAwesomeIcon icon={faCoffee} />
  useEffect(() => {
    nv.current.addEventListener('click', GoToProjectPage)
  }, [])

  const onChange = (e: any) => {
    setModalFormState(e.target.value)
  }

  const GoToProjectPage = (e: any = undefined) => {
    // console.log(e, e.target, nv)
    if (e !== undefined && (e.target.id !== "dropdown-toggle") && (e.target.id !== "dropdown-item-1") && (e.target.id !== "dropdown-item-2")) {
      dispatch({ type: 'SET_SELECTED_PROJECT_ID', payload: id })
      history.push('/admin/manage/' + id)
    }
  }

  const deleteProjectLocal = () => {
    if (modalFormState === projName) { deleteProject(id, auth.token, window.location.reload()) } else { alert('wrong name') }
  }

  const toggleModal = () => setModal(!modal)

  const state = {
    modalFormState: '',
    showModal: false,
    modalHeader: { title: 'Delete Project' },
    row1: [
      { onChange: (e: any) => setProjName(e.target.value), element: 'p', fontSize: '18px', text: `Are you sure you want to delete this project? doing so will make permanently delete all data attached to it. ENTER THE PROJECT'S NAME TO DELETE IT: ` }
    ],
    row2: [
      { element: 'textbox', type: 'text', placeholder: projName, onChange: onChange, size: 'lg', label: 'Projects Name' }
    ],
    row3: null,
    footer: [
      { element: 'button', text: 'Cancel', variant: 'primary', col: 2, onClick: toggleModal },
      { element: 'button', text: 'Delete', variant: 'danger', col: 2, onClick: deleteProjectLocal }
    ]
  }

  const handleDeleteProject = () => {
    toggleModal()
  }

  const buttonBackground = userStatus === 'creator' ? 'steelblue' : '#D72638'

  return (
    <Col lg="4" className="mb-2 p-3" >
      <GeneralModal
        showModal={modal}
        toggleModal={toggleModal}
        header={state.modalHeader}
        size=""
        row1={state.row1}
        row2={state.row2}
        row3={state.row3}
        footer={state.footer}
      />
      <div ref={nv} className={`projectCards text-center status-${userStatus}`} onClick={GoToProjectPage}
        style={{ cursor: 'pointer', backgroundColor: buttonBackground, border: '0', textAlign: 'center' }}>
        <Row>
          <Col>
            <div className="text-right mb-4">
              <div className="dashboard-button">
                {userStatus === 'annotator' ? null
                  : <Dropdown>
                    <Dropdown.Toggle id="dropdown-toggle">
                      <FontAwesomeIcon className="settings-icon" color="black" icon={faEllipsisH} style={{ fontSize: '25px', pointerEvents: 'none' }} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item id="dropdown-item-1" eventKey="1" href={'/admin/settings/' + id}>Settings</Dropdown.Item>
                      {/* <Dropdown.Item id="dropdown-item-1" eventKey="1" href={'/admin/project/' + id}>Manage</Dropdown.Item> */}
                      <Dropdown.Item id="dropdown-item-2" eventKey="2" onClick={handleDeleteProject}>Delete Project</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                }
              </div>
            </div>
          </Col>
        </Row>
        <div  >{name}</div>
      </div>
    </Col>
  )
}
ProjectCard.displayName = 'HeyHey'
export default ProjectCard
