import fs from 'fs-extra'
import { parseString } from 'xml2js'
import _ from 'lodash'
import moment from 'moment-timezone'

const xml = fs.readFileSync('./input/snow.kml', 'utf8')

parseString(xml, (error, result) => {

	if (!error) {

		console.error(error)
		process.exit(1)

	} else {

		try {

			const placemarks = _.get(result, 'kml.Document[0].Placemark', [])

			const data = _(placemarks)
				.map(v => {

					const lat = _.get(v, 'LookAt[0].latitude[0]', '0')
					const lon = _.get(v, 'LookAt[0].longitude[0]', '0')
					const description = _.get(v, 'description[0]', '')

					const parts = description.match(/Snowfall: (.*) inches(.*)Time of Report:<\/b> (.*) on (.*)<br>\n$/)

					const [, amount, , time, date] = parts || []

					return {
						lat: (+lat).toFixed(1),
						lon: (+lon).toFixed(1),
						amount: +amount,
						time,
						date,
					}

				})
				.map(v => ({
					...v,
					latlon: [v.lat, v.lon].join(', '),
				}))
				.groupBy('latlon')
				.map((values, key) =>

					_(values)
						.orderBy(['amount'], ['desc'])
						.map(v => _.omit(v, 'latlon'))
						.head()
				)
				.value()

			fs.writeJsonSync('./output/reports.json', data)

		} catch (e) {

			console.error(e)
			process.exit(1)

		}

	}

})
