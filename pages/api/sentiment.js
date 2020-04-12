import fetch from 'isomorphic-unfetch'

const url = [
  'https://covid-19-sentiment.azureedge.net/',
  'covid-19-sentiment-container/merged.json']
  .join('')

export default async (_, res) => {
  const resp = await fetch(url)
  const data = await resp.json()
  res.json(data)
}
