import { json } from 'd3-request'

const mapzenKey = 'mapzen-PvGhJST'

const search = (text, callback) => {

	const url = `https://search.mapzen.com/v1/autocomplete?text=${text}&api_key=${mapzenKey}&boundary.country=USA&layers=locality%2Ccounty%2Cmacrocounty%2Cregion%2Cmacroregion`

	json(url, (error, data) => {

		callback(error, data)

	})

}

export default search
