// This module is invoked by the Makefile.
// It converts `snow.kml` to `snow.json`.

import fs from 'fs-extra'
import { parseString } from 'xml2js'
import _ from 'lodash'
import moment from 'moment-timezone'

// Read `snow.kml`,
const xml = fs.readFileSync('./input/snow.kml', 'utf8')

// and try to parse it.
parseString(xml, (error, result) => {

	// If there was an error during parsing,
	if (error) {

		// log the error,
		console.error(error)

		// and exit this process with code 1 (error).
		process.exit(1)

	// Otherwise,
	} else {

		try {

			// get all the placemarks.
			const placemarks = _.get(result, 'kml.Document[0].Placemark', [])

			// For each placemark,
			const allData = _(placemarks)
				.map(v => {

					// get the latitude,
					const lat = _.get(v, 'LookAt[0].latitude[0]', '0')

					// longitude,
					const lon = _.get(v, 'LookAt[0].longitude[0]', '0')

					// and description.
					const description = _.get(v, 'description[0]', '')

					// Try to extract snow depth and report time.
					const parts =
						description.match(/Snowfall: (.*) inches(.*)Time of Report:<\/b>(.*)<br>\n$/) || []

					const [, amount, , datetime] = parts

					// Return the bits we want.
					return {
						lat: (+lat).toFixed(1),
						lon: (+lon).toFixed(1),
						amount: +amount,
						datetime,
					}

				})

				// Only keep reports that have a valid datetime.
				.filter('datetime')

				// Use `moment.js` to parse the datetime string.
				.map(v => ({
					...v,
					unix: moment(v.datetime.trim(), 'h:mm A on MM/D/YYYY').valueOf(),
				}))

				// Group reports by lat/lon,
				.groupBy(v => [v.lat, v.lon].join(''))

				// and for each group,
				.map(values =>

					// return the first report (sorted by amount).
					_(values)
						.orderBy(['amount'], ['desc'])
						.head()
				)

				// Next, order by time, descending.
				.orderBy(['unix'], ['desc'])

				// Only pick lat, lon, amount,
				.map((v, i) => ({
					lat: v.lat,
					lon: v.lon,
					amount: v.amount,

					// and timestamp of the first array item.
					timestamp: i === 0 ? v.unix : null,
				}))
				.value()

			// Finally, write to disk.
			fs.writeJsonSync('./output/reports.json', allData)

		} catch (e) {

			// If there was an error during any of the above,
			// log the error,
			console.error(e)

			// and exit with error code 1.
			process.exit(1)

		}

	}

})
