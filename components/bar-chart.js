import React from 'react'
import { HorizontalBar } from 'react-chartjs-2'

export default class LineChart extends React.Component {
  render () {
    return (
      <div>
        <HorizontalBar
          data={this.props.data}
          options={this.props.options}
        />
      </div>
    )
  }
}
