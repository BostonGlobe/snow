import * as d3 from 'd3'
import * as topojson from 'topojson-client'

// Load shapefile.
import snow from './../../output/snow.json'

const [width, height] = [100, 100]

const svg = d3.select('svg.map')
	.attr('viewBox', `0 0 ${width} ${height}`)
	.append('g')

const feature = topojson.feature(snow, snow.objects.snow)
const { features } = feature
const projection = d3.geoMercator()
const path = d3.geoPath().projection(projection)
projection.fitSize([width, height], feature)

const colors = [
		[1000 * 0, '#ffffff'],
		[1000 * 0.001, '#eaffbf'],
		[1000 * 0.1, '#aaff7f'],
		[1000 * 1, '#00cd00'],
		[1000 * 2, '#008b00'],
		[1000 * 3, '#104e8b'],
		[1000 * 4, '#1e90ff'],
		[1000 * 6, '#00b2ee'],
		[1000 * 8, '#00eeee'],
		[1000 * 10, '#c868ff'],
		[1000 * 12, '#912cee'],
		[1000 * 15, '#8b008b'],
		[1000 * 18, '#8b0000'],
		[1000 * 21, '#cd0000'],
		[1000 * 24, '#ee4000'],
		[1000 * 30, '#ff7f00'],
		[1000 * 36, '#ffff00'],
]

const color = d3.scaleThreshold()
	.domain(colors.slice(1).map(v => v[0]))
	.range(colors.map(v => v[1]))

svg.selectAll('path')
		.data(features)
	.enter().append('path')
		.attr('d', path)
		.attr('fill', d => color(d.properties.DN))

// console.log(test)







