import Head from 'next/head'
import BarChart from '../components/bar-chart'
import moment from 'moment'
import React from 'react'
import fetch from '../libs/fetch'
import useSWR from 'swr'

const colors = {
  red: 'rgb(255, 99, 132)',
  blue: 'rgb(54, 162, 235)'

}

const options = {
  maintainAspectRatio: true,
  scales: {
    xAxes: [{
      ticks: { beginAtZero: true, suggestedMax: 1.0 }
    }],
    yAxes: [{
      gridLines: {
        offsetGridLines: true
      }
    }]
  }
}

const ListItem = (props) => {
  const { data } = props
  const dt = `${data.timestamp}T23:59:59.414Z`
  const date = data.timestamp
  return (
    <div>
      <h3>
          Hourly Mean Scores for&nbsp;
        <time
          dateTime={dt}
        >
          {date}
        </time>
      </h3>
      <BarChart
        type='horizontalBar'
        data={data}
        options={options}
      />
      <div className='footer'>
        <a
          href='https://twitter.com/joemccann'
          target='_blank'
          rel='noopener noreferrer'
        >
        Made by @joemccann
        </a>
      </div>
    </div>
  )
}

const DailyList = (props) => {
  const { data } = props
  const listItems = data.map((d, index) =>
    <ListItem key={index} data={d} />
  )
  return (
    <div>
      {listItems}
    </div>
  )
}

const transformToPoints = ({ articles = [], includeCurrentDay = false }) => {
  if (!articles.length) {
    return { err: new Error('Missing `articles` parameter.') }
  }
  let denominator = 1
  let positiveAggregate = 0
  let negativeAggregate = 0
  const len = articles.length

  const data = {
    labels: [],
    datasets: [{
      label: 'Negative Sentiment',
      backgroundColor: colors.red,
      borderColor: colors.red,
      data: []
    }, {
      label: 'Positive Sentiment',
      backgroundColor: colors.blue,
      borderColor: colors.blue,
      data: []
    }
    ]
  }

  let firstDay = moment.utc(articles[0].timestamp).format('MM-DD-YYYY')
  //
  // Seed labels array with first date.
  //
  data.labels.push(firstDay)

  //
  // Build datasets and labels array
  //
  articles.forEach((article, i) => {
    const {
      timestamp = '',
      positive = -1,
      negative = -1,
      neutral = -1
    } = article

    if (!timestamp || positive === -1 || negative === -1 || neutral === -1) {
      console.error(new Error('Invalid or missing article data.'))
      return
    }

    const thisDay = moment.utc(article.timestamp).format('MM-DD-YYYY')
    const lengthCheck = (len - 1 === i)

    if (!includeCurrentDay) {
      const now = moment.utc(Date.now()).format('MM-DD-YYYY')

      if (moment(thisDay).isSame(now)) {
        positiveAggregate += parseFloat(positive)
        negativeAggregate += parseFloat(negative)
        //
        // Push averaged data
        //
        const y = firstDay
        const xNeg = (negativeAggregate / denominator).toFixed(4)
        const xPos = (positiveAggregate / denominator).toFixed(4)
        data.datasets[0].data.push({ y, x: xNeg })
        data.datasets[1].data.push({ y, x: xPos })
        //
        // Update current day and advance to next dataset
        //
        firstDay = thisDay
        //
        // Reset denominator
        //
        denominator = 1
        positiveAggregate = 0
        negativeAggregate = 0
        return
      }
    }

    //
    // If the day is different or we are
    // on the last iteration, then push aggregate data onto that dataset
    //
    if (!moment(thisDay).isSame(firstDay) || lengthCheck) {
      if (lengthCheck) {
        positiveAggregate += parseFloat(positive)
        negativeAggregate += parseFloat(negative)
        //
        // Push averaged data
        //
        const y = firstDay
        const xNeg = (negativeAggregate / denominator).toFixed(4)
        const xPos = (positiveAggregate / denominator).toFixed(4)
        data.datasets[0].data.push({ y, x: xNeg })
        data.datasets[1].data.push({ y, x: xPos })
        return
      }
      //
      // Push averaged data
      //
      const y = firstDay
      const xNeg = (negativeAggregate / denominator).toFixed(4)
      const xPos = (positiveAggregate / denominator).toFixed(4)
      // const xNeu = (neutralAggregate / denominator).toFixed(4)
      data.datasets[0].data.push({ y, x: xNeg })
      data.datasets[1].data.push({ y, x: xPos })
      //
      // Update current day and advance to next dataset
      //
      firstDay = thisDay
      data.labels.push(thisDay)
      //
      // Reset denominator
      //
      denominator = 1
      positiveAggregate = 0
      negativeAggregate = 0
    } else {
      //
      // Tally up current days' values
      //
      positiveAggregate += parseFloat(positive)
      negativeAggregate += parseFloat(negative)
      denominator++
    }
  })
  //
  // Remove null entries from labels
  //
  data.labels = data.labels.filter(function (el) {
    return el != null
  })
  return { data }
}

const transformToDailyPoints = ({ articles = [], mmddyyyy = '' }) => {
  if (!articles.length) {
    return { err: new Error('Missing `articles` parameter.') }
  }

  if (!mmddyyyy) return { err: new Error('Missing `mmddyyyy` parameter.') }

  let denominator = 1
  let positiveAggregate = 0
  let negativeAggregate = 0

  const TIME_FORMAT = 'MM-DD-YYYY HH:MM z'

  const barThickness = 'flex'
  const data = {
    labels: [],
    datasets: [{
      barThickness,
      label: 'Negative Sentiment',
      backgroundColor: colors.red,
      borderColor: colors.red,
      data: []
    }, {
      barThickness,
      label: 'Positive Sentiment',
      backgroundColor: colors.blue,
      borderColor: colors.blue,
      data: []
    }
    ]
  }

  const currentDay = moment.utc(mmddyyyy).format('MM-DD-YYYY')

  //
  // Slice articles by date
  //
  articles = articles.filter(article =>
    moment.utc(article.timestamp).format('MM-DD-YYYY') === currentDay)

  const len = articles.length

  if (!len) return { data: [] }

  let currentTimestamp = moment
    .utc(articles[0].timestamp)
    .format(TIME_FORMAT)

  //
  // Seed labels array with first date.
  //
  data.labels.push(currentTimestamp)

  //
  // Build datasets and labels array
  //
  articles.forEach((article, i) => {
    const {
      timestamp = '',
      positive = -1,
      negative = -1,
      neutral = -1
    } = article

    if (!timestamp || positive === -1 || negative === -1 || neutral === -1) {
      const err = new Error('Invalid or missing article data.')
      console.error(err)
      return { err }
    }

    const thisTimestamp = moment
      .utc(article.timestamp)
      .format(TIME_FORMAT)

    const lengthCheck = (len - 1 === i)
    //
    // If the timestamp is different and this isn't the first iteration,
    // OR we are on the last iteration, then push aggregate data
    // onto that dataset.
    //
    if ((thisTimestamp !== currentTimestamp && i !== 0) || lengthCheck) {
      if (lengthCheck) {
        positiveAggregate += parseFloat(positive)
        negativeAggregate += parseFloat(negative)
        // neutralAggregate += parseFloat(neutral)
        //
        // Push averaged data
        //
        const y = currentTimestamp
        const xNeg = (negativeAggregate / denominator).toFixed(4)
        const xPos = (positiveAggregate / denominator).toFixed(4)
        // const xNeu = (neutralAggregate / denominator).toFixed(4)
        data.datasets[0].data.push({ y, x: xNeg })
        data.datasets[1].data.push({ y, x: xPos })
        // data.datasets[2].data.push({ y, x: xNeu })

        return
      }
      //
      // Push averaged data
      //

      //
      // If this timeframe only had 1
      //
      if (denominator === 1) {
        const y = currentTimestamp
        const xNeg = (negative).toFixed(4)
        const xPos = (positive).toFixed(4)
        const xNeu = (neutral).toFixed(4)
        data.datasets[0].data.push({ y, x: xNeg })
        data.datasets[1].data.push({ y, x: xPos })
        data.datasets[2].data.push({ y, x: xNeu })
        //
        // Update current timestamp and advance to next label
        //
      } else {
        const y = currentTimestamp
        const xNeg = (negativeAggregate / denominator).toFixed(4)
        const xPos = (positiveAggregate / denominator).toFixed(4)
        // const xNeu = (neutralAggregate / denominator).toFixed(4)
        data.datasets[0].data.push({ y, x: xNeg })
        data.datasets[1].data.push({ y, x: xPos })
        // data.datasets[2].data.push({ y, x: xNeu })

        //
        // Update current day and advance to next dataset
        //
      }
      currentTimestamp = thisTimestamp
      //
      // Reset denominator
      //
      denominator = 1
      positiveAggregate = 0
      negativeAggregate = 0
      // neutralAggregate = 0
      data.labels.push(thisTimestamp)
    } else {
      //
      // Tally up current days' values
      //
      positiveAggregate += parseFloat(positive)
      negativeAggregate += parseFloat(negative)
      // neutralAggregate += parseFloat(neutral)
      denominator++
    }
  })
  return { data }
}

const Home = () => {
  const { error, data } = useSWR('/api/sentiment', fetch)

  let sentiment = null

  if (data && !error) sentiment = transform(data)

  let h3 = null
  if (!data && !error) h3 = <h3>Fetching a massive dataset. Please be patient.</h3>
  if (error && !data) h3 = <h3>Error fetching data. Please refresh to try again.</h3>

  return (
    <div>
      <Head>
        <title>Sentiment Analysis of Covid-19 News Headlines</title>
        <meta
          name='description'
          content='covidsentiment.com is a free website that uses
          Microsoft Azure Cognitive Services Text Analytics Machine Learning
          API to display the positive and negative sentiments of
          coronavirus-related news headlines over time.'
        />
        <meta
          property='og:title'
          content='Covid19 News Headline Sentiment Analysis'
        />
        <meta property='og:site_name' content='covidsentiment.com' />
        <meta property='og:url' content='https://covidsentiment.com' />
        <meta
          property='og:description'
          content="View the positive and negative sentiments of news
          headlines surrounding coronavirus. The site uses Microsoft Azure's
          Cognitive Services Text Analytics Machine Learning
          API to determine sentiment."
        />
        <meta property='og:type' content='article' />
        <meta
          property='og:image'
          content='https://github.com/joemccann/the-cvd-bot/raw/master/assets/img/botpic.jpg'
        />
      </Head>

      <main className='container'>

        <h1 className='title'>
        Sentiment Analysis of Covid-19 News Headlines
        </h1>

        <p className='description'>
        Sourced from&nbsp;
          <a
            href='https://t.me/s/covid_19_updates'
            rel='noopener noreferrer'
            target='_blank'
          >
           https://t.me/covid_19_updates
          </a>
        </p>
        {
          h3 ||
            <div>
              <h3>Daily Mean for All Scores</h3>
              <BarChart
                type='horizontalBar'
                data={sentiment.points}
                options={options}
              />
              <div className='footer'>
                <a
                  href='https://twitter.com/joemccann'
                  target='_blank'
                  rel='noopener noreferrer'
                >
        Made by @joemccann
                </a>
              </div>

              <DailyList data={sentiment.daily} />
            </div>
        }

      </main>

      <style jsx global>{`
      html,
      body {
        padding: 0;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      .container {
        min-height: 100vh;
        padding: 1% 6%;
      }

      main {
        flex-grow: 1;
      }

      .footer {
        width: 100%;
        height: 50px;
        border-top: 1px solid #eaeaea;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .footer a {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      a {
        color: 'rgb(54, 162, 235);
        text-decoration: none;
      }

      a:visited {
        color: 'rgb(54, 162, 235);
        text-decoration: none;
      }

      .title a {
        color: #0070f3;
        text-decoration: none;
      }


      @media (max-width: 600px) {
        .grid {
          width: 100%;
          flex-direction: column;
        }
      }

      .footer {
        width: 100%;
        height: 50px;
        border-top: 1px solid #eaeaea;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .footer a {
        display: flex;
        justify-content: center;
        align-items: center;
      }


    `}
      </style>
    </div>
  )
}

const transform = (json) => {
  const articles = []
  const daily = []

  //
  // We remove the first date because it doesn't
  // have a full day's worth of data.
  //
  json.forEach(article => {
    const { timestamp } = article
    if (!timestamp.startsWith('2020-03-12')) articles.push(article)
  })

  const {
    err: pointsErr,
    data: points = null
  } = transformToPoints({
    articles
  })

  if (pointsErr) {
    return { err: pointsErr }
  }

  const today = [moment(Date.now()).format('MM-DD-YYYY')]
  const labels = [...points.labels]
  const days = today.concat(labels.reverse()) // mutates the labels

  //
  // Cycle through data to pull MM-DD-YYYY and loop thru
  // and push to daily array. Then iterate in react component.
  //
  days.forEach(day => {
    const {
      err: dayErr,
      data: points
    } = transformToDailyPoints({
      articles,
      mmddyyyy: day
    })

    points.timestamp = day

    daily.push(points)

    if (dayErr) return { err: dayErr }
  })

  return { points, daily }
}

export default Home
