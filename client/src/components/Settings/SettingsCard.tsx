import React from 'react'
import { connect } from 'react-redux'
import { Button, ListGroup, Card, Form, FormGroup } from 'react-bootstrap'

// eslint-disable-next-line no-unused-vars
import Annotator from '../../interfaces/Annotator'
// eslint-disable-next-line no-unused-vars
import TestSubject from '../../interfaces/TestSubject'
import List from './List'

interface ICardProp {
    title: 'Researchers' | 'Subjects' | 'ProtoElements';
    annotatorList?: Array<Annotator>; // ? means that it can be "undefined" (not passed to props)
    testSubjectList?: Array<TestSubject>;
    protoElementsList?: Array<any>;
    seeModal: boolean;
    toggleModal: any;

    handleDelete?: any;
    handleAdd?: any;
    auth: any;

    onSelectProtoElementType?: any;
}

interface ICardState {
    deleteId: any,
    helperTxt: any,
    showModal: boolean;
    test: any;
    protoElementType: string;
}

type SelectElement = React.FormEvent<HTMLSelectElement>;

/** cards for each individual project that appears in dashboard */
class SettingsCard extends React.Component<ICardProp, ICardState> {
  constructor (props: ICardProp) {
    super(props)

    this.state = {
      deleteId: '',
      helperTxt: '',
      showModal: false,
      test: null,
      protoElementType: 'Scenes'
    }
  }

    buildList = () => {
      const { annotatorList, title, protoElementsList, testSubjectList, handleDelete } = this.props
      const list: Array<any> = []

      if (title === 'Researchers') {
        annotatorList.map((listItem: any) => {
          return (
            list.push(<List
              key={listItem._id}
              itemId={listItem.email}
              itemName={listItem.email}
              firstName={listItem.firstName}
              lastName={listItem.lastName}
              handleDelete={this.props.handleDelete}
            />)
          )
        })
      } else if (title === 'ProtoElements') {
        protoElementsList.map((listItem, index) => {
          const id = listItem.protoelement.substr(1)
          return (
            list.push(<List
              key={id}
              itemId={id}
              itemName={listItem.protoelement}
              firstName={listItem.description}
              lastName={''}
              handleDelete={handleDelete}
            />)
          )
        })
      } else {
        testSubjectList.map((listItem: any) => {
          return (
            list.push(<List
              key={listItem._id}
              itemId={listItem._id}
              itemName={listItem.uid}
              handleDelete={handleDelete}
            />)
          )
        })
      }

      return list
    }

    onSelect = (e:any) => {
      this.props.onSelectProtoElementType(e.currentTarget.value)
    }

    render () {
      const { handleAdd, title } = this.props
      let list: Array<any> = []
      list = this.buildList()

      return (

        <div>
          <Card style={{ border: '5px solid black', borderRadius: '10px', maxHeight: '40%' }}>

            <Card.Header style={{ backgroundColor: 'black', color: 'white' }}>
              <Card.Title className="text-center"
                style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{title}
              </Card.Title>
            </Card.Header>

            <div style={{ maxHeight: '450px' }}>
              <ListGroup variant="flush" style={{ height: '350px', overflowY: 'auto', overflowX: 'hidden' }}>
                {(this.props.title === 'ProtoElements')
                  ? <FormGroup>
                    <div className="justify-content-center" style={{ display: 'flex' }}>
                      <Form.Label>Select ProtoElement Type</Form.Label>
                    </div>
                    <Form.Control as="select" onChange={(e:any) => this.onSelect(e)}>
                      <option value="Scenes">Scenes</option>
                      <option value="Beats">Beats</option>
                      <option value="Choices">Choices</option>
                    </Form.Control>
                  </FormGroup>
                  : null}
                {list}
              </ListGroup>
            </div>

            <Card.Footer>
              <Button variant="primary" onClick={handleAdd}>{`+ Add ${title}`}</Button>
            </Card.Footer>
          </Card>
        </div>
      )
    }
}

const mapStateToProps = (state: any) => ({
  auth: state.auth
})

export default connect(mapStateToProps, {})(SettingsCard)
