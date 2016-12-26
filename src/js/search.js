import { json } from 'd3-request'
import _ from 'lodash'

const mapzenKey = 'mapzen-PvGhJST'

const search = (text, callback) => {

	const url = `https://search.mapzen.com/v1/autocomplete?text=${text}&api_key=${mapzenKey}&boundary.country=USA&layers=locality&boundary.rect.min_lon=-130.87&boundary.rect.min_lat=23.40&boundary.rect.max_lon=-58.01&boundary.rect.max_lat=51.12`

	json(url, (error, data) => {

		if (error) {
			console.error(error)
		} else {

			const results = _.get(data, 'features')
				.map(v => ({
					label: _.get(v, 'properties.label').replace(/, usa$/gi, ''),
					coordinates: _.get(v, 'geometry.coordinates'),
				}))

			callback(results)

		}

	})

}

const searchDebounced = _.debounce(search, 1000/6)

export default searchDebounced
