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
const projection = d3.geoAlbers()
const path = d3.geoPath().projection(projection)
projection.fitSize([width, height], feature)

const colors = [
		[0, '#ffffff'],
		[1 + 0, '#aaff7f'],
		[1 + 1, '#00cd00'],
		[1 + 2, '#008b00'],
		[1 + 3, '#104e8b'],
		[1 + 4, '#1e90ff'],
		[1 + 6, '#00b2ee'],
		[1 + 8, '#00eeee'],
		[1 + 10, '#c868ff'],
		[1 + 12, '#912cee'],
		[1 + 15, '#8b008b'],
		[1 + 18, '#8b0000'],
		[1 + 21, '#cd0000'],
		[1 + 24, '#ee4000'],
		[1 + 30, '#ff7f00'],
		[1 + 36, '#ffff00'],
]

const color = d3.scaleThreshold()
	.domain(colors.slice(1).map(v => v[0]))
	.range(colors.map(v => v[1]))

svg.selectAll('path')
		.data(features)
	.enter().append('path')
		.attr('d', path)
		.attr('fill', d => color(d.properties.DN))





