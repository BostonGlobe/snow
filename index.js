import fs from 'fs-extra'
import _ from 'lodash'
import moment from 'moment-timezone'

const [, , year, month, day] = process.argv

let topo = fs.readJsonSync('./output/snowtotals.topojson')

topo.timestamp = [year, month, day].join('-')

fs.writeJsonSync('./output/snowtotals.topojson', topo)