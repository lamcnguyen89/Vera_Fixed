import React from 'react'
import { Button } from 'react-bootstrap'

type props = {
    ref?: any,
    btncolor?: string,
    text?: string,
    onClick?: any
}
const ModalButton = (props: props) => (
  <Button style={{ backgroundColor: `${props.btncolor}` }} {...props}>{props.text}</Button>
)

ModalButton.displayName = 'Button'
export default ModalButton
