import React from 'react'
import { Form } from 'react-bootstrap'

interface checkboxProps {
    inline?: boolean;
    disable?: boolean;
    label?: string;
    key?: any;
    classname?: string;
    onChange?: any;
    checked?: boolean;
}

const Checkbox: any = (props: checkboxProps) => {
  return (
    <Form.Check
      inline={props.inline}
      disabled={props.disable}
      label={props.label}
      type="checkbox"
      key={props.key}
      defaultChecked={props.checked}
      className={props.classname}
      onChange={props.onChange}
      // checked={props.checked}
    />
  )
}

export default Checkbox
