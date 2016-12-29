import fs from 'fs-extra'
import _ from 'lodash'

let topo = fs.readJsonSync('./output/snowtotals.topojson')
const reports = fs.readJsonSync('./output/allReports.geojson')

const timestamp = _(reports.features)
	.map('properties.dates')
	.map(v => Date.parse(v))
	.sortBy()
	.last()

topo.timestamp = timestamp

fs.writeJsonSync('./output/snowtotals.topojson', topo)