import fetch from 'isomorphic-unfetch'

const url = [
  'https://covid-19-sentiment.azureedge.net/',
  'covid-19-sentiment-container/merged.json']
  .join('')

export default (_, res) => {
  // a slow endpoint for getting repo data
  fetch(url)
    .then(resp => resp.json())
    .then(data => {
      res.json(data)
    })
}
