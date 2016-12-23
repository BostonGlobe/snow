import { json } from 'd3-request'
import _ from 'lodash'

const mapzenKey = 'mapzen-PvGhJST'

const search = (text, callback) => {

	const url = `https://search.mapzen.com/v1/autocomplete?text=${text}&api_key=${mapzenKey}&boundary.country=USA&layers=locality%2Ccounty%2Cmacrocounty%2Cregion%2Cmacroregion`

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
