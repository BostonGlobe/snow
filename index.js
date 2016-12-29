import fs from 'fs-extra'
import _ from 'lodash'
import moment from 'moment-timezone'

let topo = fs.readJsonSync('./output/snowtotals.topojson')
const reports = fs.readJsonSync('./output/snowfall_scraper.json')

const timestamp = _(reports)
	.map('DateTime_Report(UTC)')
	.map(v => moment.utc(v.trim(), 'YYYY-MM-DD HH:mm'))
	.sortBy()
	.last()

topo.timestamp = timestamp.tz('America/New_York').format('YYYY-MM-DD HH:mm')

console.log(topo.timestamp)

fs.writeJsonSync('./output/snowtotals.topojson', topo)