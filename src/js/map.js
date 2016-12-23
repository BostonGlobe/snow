import Awesomplete from 'awesomplete'
import { select } from './utils/dom.js'
import search from './search.js'

const mapzenKey = 'mapzen-PvGhJST'

const startMap = () => {

	// Select DOM map container
	const mapElement = select('.observed-snowfall--map')

	// Create Mapzen map in map container
	const map = L.Mapzen.map(mapElement, {
		center: [42.45, -73.089],
		zoom: 6.5,
		scene: 'assets/scene.yaml',
		minZoom: 2,
		maxZoom: 10,
		maxBounds: [
			[23.40276490540795, -130.869140625], // southwest
			[51.12421275782688, -58.00781249999999], // northeast
		],
	})

	map.attributionControl.addAttribution('Snowfall analysis <a href="https://www.nohrsc.noaa.gov/snowfall/">NOHRSC</a>')

	// Add locator button
	const locator = L.Mapzen.locator()
	locator.addTo(map)

	// Keep track of map location in URL hash
	L.Mapzen.hash({ map })

	const input = select('.intro__hed__search')
	new Awesomplete(input, {
		list: [
			'one',
			'two',
			'three',
			'four',
			'five',
			'six',
			'seven',
			'eight',
			'nine',
			'ten',
			'eleven',
			'twelve',
		]
	})

	input.addEventListener('input', e => {

		const { value } = e.target

		// If value is longer than 2 characters,
		if (value.length > 1) {

			// search
			search(value, (error, data) => {

				console.log({ error, data })

			})

		}

	})

		// // Add geocoder
		// const geocoder = L.Mapzen.geocoder(mapzenKey, {
		// 	params: {
		// 		'boundary.country': 'USA',
		// 		layers: 'locality,county,macrocounty,region,macroregion',
		// 	},
		// 	placeholder: 'hey',
		// })
		// geocoder.addTo(map)

}

export default startMap
