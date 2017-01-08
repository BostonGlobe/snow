import request from 'request-promise-native'

request('http://www.weather.gov//source/erh/hydromet/stormTotalv3_24.point.snow.kml')
	.then(body => {

		console.log(body)

	})
	.catch(error => {

		console.error(error)
		process.exit(1)

	})

// import fs from 'fs-extra'
// import _ from 'lodash'
// import moment from 'moment-timezone'

// const [, , year, month, day] = process.argv

// let topo = fs.readJsonSync('./output/snowtotals.topojson')

// topo.timestamp = [year, month, day].join('-')

// fs.writeJsonSync('./output/snowtotals.topojson', topo)
