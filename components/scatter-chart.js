import React from 'react'
import { Scatter } from 'react-chartjs-2'

export default class ScatterChart extends React.Component {
  render () {
    return (
      <div>
        <Scatter
          data={this.props.data}
          options={this.props.options}
        />
      </div>
    )
  }
}
