import React from 'react'
import { connect } from 'react-redux'

interface ITestProps {
  auth: any
}

interface ITestState {
  projectId: string
  projectName: string
  addUsersEmail: string
  file: any
  playerName: string
  playerId: string
  mongoFileId: string
  serverRetFile: any
}

class Test extends React.Component<ITestProps, ITestState> {
  constructor(props: ITestProps) {
    super(props)

    this.state = {
      projectId: '',
      addUsersEmail: '',
      file: null,
      projectName: '',
      playerName: '',
      playerId: '',
      mongoFileId: '',
      serverRetFile: null
    }
  }

  handleCreateNewProject = () => {
    fetch(`/api/projects/CreateProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        name: this.state.projectName
      })
    })
      .then((res) => {
        console.log(res)
        return res.json()
      })
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  handleLogAllProjectsCreatedByUser = () => {
    fetch(`/api/projects/GetAllCreatedProjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      }
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res.projects)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  handleLogAllParticipatingProjectsNotOwner = () => {
    fetch(`/api/projects/GetAllParticipatingProjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      }
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  handleAddUserToProject = () => {
    fetch(`/api/projects/AddUserToProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        projectId: this.state.projectId,
        userEmail: this.state.addUsersEmail
      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  handleGetAllProjects = () => {
    fetch(`/api/projects/GetAllProjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      }
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  handleRemoveUserFromProject = () => {
    fetch(`/api/projects/RemoveUserFromProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        projectId: this.state.projectId,
        userEmail: this.state.addUsersEmail
      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  AddFileToPlayer = () => {
    const formData = new FormData()
    formData.append('file', this.state.file)
    formData.append('fileName', 'test file name')
    formData.append('projectId', this.state.projectId)
    formData.append('playerId', this.state.playerId)

    fetch(`/api/players/AddFileToPlayer`, {
      method: 'POST',
      headers: {
        Authorization: this.props.auth.token
      },
      body: formData
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  addPlayerToProject = () => {
    fetch(`/api/projects/AddPlayerToProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        playerName: this.state.playerName,
        projectId: this.state.projectId
      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  removePlayerFromProject = () => {
    fetch(`/api/projects/RemovePlayerFromProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        playerId: this.state.playerId,
        projectId: this.state.projectId
      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  getAllPlayersForProject = () => {
    fetch(`/api/projects/GetAllPlayersForProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        projectId: this.state.projectId
      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  deleteProject = () => {
    fetch(`/api/projects/deleteProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        projectId: this.state.projectId
      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  getAllUsers = () => {
    fetch(`/api/projects/GetAllUsers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        projectId: this.state.projectId
      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  removeSelfFromProject = () => {
    fetch(`/api/projects/removeSelfFromProject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        projectId: this.state.projectId
      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  GetFileFromPlayer = () => {
    fetch(`/api/players/GetFileFromPlayer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        projectId: this.state.projectId,
        playerId: this.state.playerId,
        fileId: this.state.mongoFileId

      })
    })
      .then((res) => {
        console.log(res)
        return res.blob()
      })
      .then((res) => {
        console.log(res)
        this.setState({ serverRetFile: URL.createObjectURL(res) })
      })
      .catch((res) => {
        console.log(res)
      })
  }

  deleteFileFromPlayer = () => {
    fetch(`/api/players/DeleteFileFromPlayer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      },
      body: JSON.stringify({
        projectId: this.state.projectId,
        playerId: this.state.playerId,
        fileId: this.state.mongoFileId
      })
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  deleteUser = () => {
    fetch(`/api/users/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.props.auth.token
      }
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res)
      })
      .catch((res) => {
        console.log(res)
      })
  }

  render() {
    return (
      <div>
        {/* <ToastNotification /> */}
        <button onClick={this.handleCreateNewProject}>Create new project</button>
        <button onClick={this.handleLogAllProjectsCreatedByUser}>log all projects created by this user</button>
        <button onClick={this.handleLogAllParticipatingProjectsNotOwner}>log all projects user is in, but not created</button>
        <button onClick={this.handleAddUserToProject}>Add user to a project</button>
        <button onClick={this.handleGetAllProjects}>Get all projects user is a part of</button>
        <button onClick={this.handleRemoveUserFromProject}>Remove user from a project</button>

        <input onChange={(e: any) => this.setState({ file: e.target.files[0] })} type="file"></input>
        <button onClick={this.AddFileToPlayer}>Send file to MongoDB</button>
        <button onClick={this.addPlayerToProject}>Add player to project</button>
        <button onClick={this.removePlayerFromProject}>remove player from project</button>
        <button onClick={this.getAllPlayersForProject}>Get all players for project</button>
        <button onClick={this.deleteProject}>Delete a project</button>
        <button onClick={this.getAllUsers}>Get all users for a project</button>
        <button onClick={this.removeSelfFromProject}>Remove self from project</button>
        <button onClick={this.GetFileFromPlayer}>Get File From Player</button>
        <button onClick={this.deleteFileFromPlayer}>Delete file from player</button>
        <button onClick={this.deleteUser}>Delete user (Logged in)</button>

        <hr />

        <input value={this.state.addUsersEmail} onChange={(e) => this.setState({ addUsersEmail: e.target.value })} placeholder="user's email" />
        <input value={this.state.projectId} onChange={(e) => this.setState({ projectId: e.target.value })} placeholder="project id for stuff" />
        <input value={this.state.projectName} onChange={(e) => this.setState({ projectName: e.target.value })} placeholder="project name to create" />
        <input value={this.state.playerName} onChange={(e) => this.setState({ playerName: e.target.value })} placeholder="player name" />
        <input value={this.state.playerId} onChange={(e) => this.setState({ playerId: e.target.value })} placeholder="Player id" />
        <input value={this.state.mongoFileId} onChange={(e) => this.setState({ mongoFileId: e.target.value })} placeholder="Mongo file id" />

        <img src={this.state.serverRetFile} alt={'File not received yet'}></img>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({
  auth: state.auth
})

export default connect(mapStateToProps, {})(Test)
