import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navbar, Nav } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import logo from '../assets/VERA-logo-main-157x157.png'

const NavMenu = (props: { title: string }) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const firstName = useSelector((state: any) => state.auth.firstName)
  const lastName = useSelector((state: any) => state.auth.lastName)
  const dashboard = {
    pathname: "/admin/Dashboard/",
    hash: ""
  }
  return (
    <Navbar bg="navy" variant="dark">
      <Navbar.Brand onClick={() => history.push(dashboard)}><img height="30" src={logo} style={{ cursor: "pointer", paddingRight:5 }} alt="VERA Logo" />VERA</Navbar.Brand>

      <Nav className="mr-auto">
        <Nav.Link>{props.title}</Nav.Link>
      </Nav>

      <Navbar.Collapse>
        <Nav className="ml-auto">

          <Nav.Link onClick={() => history.push('/admin/Account')} className="profile-link">
            <svg xmlns="http://www.w3.org/2000/svg" className="user-icon">
              <path d={'M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm7.753 18.305c-.261-.586-.789-.991-1.871-1.241-2.293-.529-4.428-.993-3.393-2.945 3.145-5.942.833-9.119-2.489-9.119-3.388 0-5.644 3.299-2.489 9.119 1.066 1.964-1.148 2.427-3.393 2.945-1.084.25-1.608.658-1.867 1.246-1.405-1.723-2.251-3.919-2.251-6.31 0-5.514 4.486-10 10-10s10 4.486 10 10c0 2.389-.845 4.583-2.247 6.305z'} />
            </svg>
            {`${firstName} ${lastName}`}
          </Nav.Link>

          <Nav.Link onClick={() => { dispatch({ type: 'LOGOUT' }); history.replace('/admin') }}>Log Out</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
NavMenu.displayName = 'NavMenu'
export default NavMenu
