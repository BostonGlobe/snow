// This module draws the map.

import pakage from './../../package.json'
import { select } from './utils/dom'

const startMap = url => {

	// Select DOM map container.
	const mapElement = select('.observed-snowfall__map')

	// Create Mapzen map in map container.
	const map = L.Mapzen.map(mapElement, {
		center: [42.2040, -71.8674],
		zoom: 7,
		scene: `assets/scene.yaml?q=${pakage.version}`,
		minZoom: 2,
		maxZoom: 10,
		apiKey: 'mapzen-v3U3y5X',
	})

	// Set attribution.
	map.attributionControl.addAttribution('<a href="http://www.weather.gov/erh/hydromet">NWS</a>')

	// Add locator button.
	const locator = L.Mapzen.locator()
	locator.addTo(map)

	let scene

	// Listen to the Tangram layer being loaded on the map,
	map.on('tangramloaded', e => {

		// then save scene to variable,
		scene = e.tangramLayer.scene

		// and force cache busting.
		scene.setDataSource('_snowtotals', {
			type: 'TopoJSON',
			url,
		})

	})

}

export default startMap
