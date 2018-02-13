import * as request from 'd3-request'

const getData = url => {
  request.json(url, (error, json) => {
    if (error) {

			console.error(error)

      return null

		} else {

      return json

    }
  })
}

export default getData
