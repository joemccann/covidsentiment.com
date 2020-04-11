import React from 'react'
import Chart from 'chart.js'
import { Line } from 'react-chartjs-2'
import moment from 'moment'

// const state = {
//   labels: ['January', 'February', 'March',
//     'April', 'May'],
//   datasets: [
//     {
//       label: 'Rainfall',
//       fill: false,
//       lineTension: 0.5,
//       backgroundColor: 'rgba(75,192,192,1)',
//       borderColor: 'rgba(0,0,0,1)',
//       borderWidth: 2,
//       data: [65, 59, 80, 81, 56]
//     }
//   ]
// }
function newDate (days) {
  return moment().add(days, 'd').toDate()
}

function newDateString (days) {
  return moment().add(days, 'd').format()
}

const w = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)'

}

var color = Chart.helpers.color

const state = {
  datasets: [{
    label: 'Dataset with string point data',
    backgroundColor: w.red,
    borderColor: w.red,
    fill: false,
    data: [{
      x: newDateString(0),
      y: Math.random()
    }, {
      x: newDateString(2),
      y: Math.random()
    }, {
      x: newDateString(4),
      y: Math.random()
    }, {
      x: newDateString(5),
      y: Math.random()
    }]
  }, {
    label: 'Dataset with date object point data',
    backgroundColor: w.blue,
    borderColor: w.blue,
    fill: false,
    data: [{
      x: newDate(0),
      y: Math.random()
    }, {
      x: newDate(2),
      y: Math.random()
    }, {
      x: newDate(4),
      y: Math.random()
    }, {
      x: newDate(5),
      y: Math.random()
    }]
  }]
}

export default class LineChart extends React.Component {
  render () {
    return (
      <div>
        <Line
          data={this.props.data}
          options={this.props.options}
        />
      </div>
    )
  }
}
