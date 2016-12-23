import { select } from './utils/dom.js'

const map = {

	init() {

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

	}

}

export default map
