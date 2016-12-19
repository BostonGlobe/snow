import { select } from './utils/dom.js'

const map = {

	init() {

		// Select DOM map container
		const mapElement = select('.observed-snowfall--map')

		// Create Mapzen map in map container
		const map = L.Mapzen.map(mapElement, {
			center: [37, -97],
			zoom: 3.75,
			// scene: L.Mapzen.BasemapStyles.Refill,
			scene: 'assets/scene.yaml',
		})

		// Add geocoder
		const geocoder = L.Mapzen.geocoder('mapzen-JA21Wes')
		geocoder.addTo(map)

		// Add locator button
		const locator = L.Mapzen.locator()
		locator.addTo(map)

		// Keep track of map location in URL hash
		L.Mapzen.hash({ map, geocoder })

	}

}

export default map