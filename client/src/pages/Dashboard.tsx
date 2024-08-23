import { useSelector } from 'react-redux'
import React, { useState, useEffect } from 'react'
import { Container, Row, Col } from 'reactstrap'
import ProjectCards from '../components/Dashboard/ProjectCards'
import NavMenu from '../components/NavMenu'
import GeneralModal from '../components/GeneralModal'
// import '../styles/dashboard.css'
import '../styles/App.css'

// css
import '../styles/dashboard.css'

// interfaces
import Project from '../interfaces/Project'
import { createNewProject, getAllProjects } from '../helpers/DatabaseAPIs'
import { createDataset } from '../helpers/OwlAPIs'

// import { createProject } from '../store/api';

interface IFetchedProjects {
  projects: Array<Project>
  success: boolean
}

const Dashboard = () => {
  // useState here is same as setting state in constructor, the returned func called
  // setModal can be called with the new value you want modal to take on. Calling setModal
  // will trigger rerender, just like setState. https://reactjs.org/docs/hooks-state.html https://reactjs.org/docs/hooks-reference.html#usestate
  const [modal, setModal] = useState(false)
  const [projName, setProjName] = useState('')
  const [projects, setProjects] = useState([])

  // const myo = {
  //     x: "a",
  //     y: "b",
  //     z: "c"
  // }

  // let {x, ...somethingelse} = myo

  // useSelector is the replacement for connect() and mapStateToProps().
  // it takes a function which is passed the whole redux state, and returns just the sub-section
  // of it that you want to pay attention to. only changes in that section of redux state will trigger
  // rerenders. https://react-redux.js.org/next/api/hooks#useselector
  // const projects = useSelector((state:any) => state.project.arr)
  const auth = useSelector((state: any) => state.auth)

  // const history = useHistory()

  // this replaces both componentDidMount and componentWillUnmount. when react pushes this component to the browser's painting
  // engine, it calls all the functions passed to any useEffect call. the function you pass does work at this point, and the function
  // you might want to return from that passed function will be stored by react and automaticallly called on unmount. this is SO AWESOME
  // for pub/sub models, but /we/ prob won't need to return anything from the functions we pass to useEffect.
  // note the [] as the second argument to useEffect. this is the dependancy array. on first render, the function you passed to useEffect
  // (called an `effect`) will always be called, but after that, further re-renders only result in you effect being called if one of the
  // variables you list in the dependancy array changes. this might feel like "the other side" of useState cuz it is.
  // https://reactjs.org/docs/hooks-reference.html#useeffect
  useEffect(() => {
    const actingFunction = (temp: any) => setProjects(oldProjs => { return [...oldProjs, ...temp] })
    getAllProjects(auth.token, auth.id, actingFunction)
    // getProjects();
  }, [])

  /**
     * Will create a new project on the DB. (using helper)
     * If successful will add the project to the array, else will show error message.
     * *Based on return values from helper*
     */
  function createNewProjectDashboard() {
    console.log(projName)
    let id: any = null
    const actingFunction = (res: any) => setProjects(oldProjs => {
      res.project.status = 'creator'
      id = res.project._id
      createDataset(id)
      return [...oldProjs, res.project]
    })
    createNewProject(projName, auth.token, actingFunction)
  }

  const toggleModal = () => setModal(!modal)

  return (
    <Container fluid className="container-fluid">
      <NavMenu title="Dashboard" />
      <Container>
        <Row id="project-row">
          {projects.map((prj: Project) => (
            <ProjectCards
              name={prj.name}
              userStatus={prj.status}
              id={prj._id}
              key={prj._id}
            />
          ))}
          <Col lg="4" className="p-3">
            <div className="addCards text-center">
              <button className="mt-5 pt-2 dashboard-button" onClick={toggleModal}>+ Create new study</button>
            </div>
          </Col>
        </Row>
      </Container>

      <GeneralModal
        showModal={modal}
        toggleModal={toggleModal}
        header={{ title: 'Create a new project' }}
        row1={[
          { element: 'textbox', type: 'text', size: 'lg', placeholder: "Enter the project's name", label: 'Project Name', onChange: (e: any) => setProjName(e.target.value) }
        ]}
        footer={[
          { element: 'button', text: 'Cancel', variant: 'danger', col: 2, onClick: toggleModal },
          {
            element: 'button',
            text: 'Add',
            variant: 'primary',
            col: 2,
            onClick: () => {
              createNewProjectDashboard()
              toggleModal()
            }
          }
        ]}
      />
    </Container>
  )
}

Dashboard.displayName = 'Dashboard'
export default Dashboard
