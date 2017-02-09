// import Awesomplete from 'awesomplete'
import _ from 'lodash'

import pakage from './../../package.json'
import { select } from './utils/dom.js'
// import search from './search.js'

// import {
// 	getAllStorageResults,
// 	getStorageResultsByToken,
// 	setStorageResults,
// } from './storage.js'

// const mapzenKey = 'mapzen-PvGhJST'

// let WAITING_FOR_TANGRAM = false

const startMap = (url) => {

	// Select DOM map container.
	const mapElement = select('.observed-snowfall__map')

	// Create Mapzen map in map container.
	const map = L.Mapzen.map(mapElement, {
		center: [42.2040, -71.8674],
		zoom: 7,
		scene: 'assets/scene.yaml?q=' + pakage.version,
		minZoom: 2,
		maxZoom: 10,
		apiKey: 'mapzen-v3U3y5X',
	})

	// Set attribution.
	map.attributionControl.addAttribution('<a href="http://www.weather.gov/erh/hydromet">NWS</a>')

	// Add locator button.
	const locator = L.Mapzen.locator()
	locator.addTo(map)

	// // Keep track of map location in URL hash.
	// L.Mapzen.hash({ map })

	let scene

	// Listen to the Tangram layer being loaded on the map.
	map.on('tangramloaded', e => {

		// Save scene to variable.
		scene = e.tangramLayer.scene

		// Force cache busting
		// TODO: update this with the real url once it's ready
		scene.setDataSource('_snowtotals', {
			type: 'TopoJSON',
			url,
		})

	})

	// 	scene.subscribe({
	// 		view_complete: e => {

	// 			if (WAITING_FOR_TANGRAM) {

	// 				console.log('going to find feature')

	// 				const { x, y } = map.getSize()

	// 				// get the underlying feature,
	// 				// TODO: do we need to polyfill promises?
	// 				scene.getFeatureAt({ x: x / 2, y: y / 2 })
	// 					.then(selection => {

	// 						console.log(JSON.stringify(selection, null, 2))

	// 						// // get snow totals,
	// 						// const DN = _.get(selection, 'feature.properties.DN')

	// 					})

	// 			}

	// 			WAITING_FOR_TANGRAM = false

	// 		},
	// 	})

	// })

	// // Initialize the autocomplete dropdown.
	// const input = select('.js-search')
	// const awesome = new Awesomplete(input, {
	// 	sort: () => 0,
	// 	maxItems: 5,
	// })

	// // When user selects dropdown entry, pan to corresponding location.
	// window.addEventListener('awesomplete-selectcomplete', e => {

	// 	// Get all cached results.
	// 	const results = getAllStorageResults()

	// 	// Try to find the selection.
	// 	const { value } = e.text

	// 	const match = _.find(results, { label: value })

	// 	// If we got a match,
	// 	if (match) {

	// 		// get the match coordinates,
	// 		const [lon, lat] = match.coordinates

	// 		// set a boolean flag,
	// 		WAITING_FOR_TANGRAM = true

	// 		// and set the map to the right coordinates.
	// 		map.setView([lat, lon], 10)

	// 		// L.circle([lat, lon], {radius: 16 * 1000}).addTo(map)

	// 	}

	// })

	// // Respond to user selecting a dropdown entry.
	// input.addEventListener('input', e => {

	// 	const { value } = e.target

	// 	// If value is longer than 2 characters,
	// 	if (value.length > 1) {

	// 		// retrieve cached results.
	// 		const results = getStorageResultsByToken(value)

	// 		// If the result is not an array, it means we haven't searched
	// 		// for this token yet. Do it.
	// 		if (!results) {

	// 			search(value, data => {

	// 				// Set storage results for this token.
	// 				setStorageResults({ token: value, results: data })

	// 				// Update dropdown.
	// 				awesome.list = data.map(v => v.label)

	// 			})

	// 		} else {

	// 			// Otherwise, if it's an array, it means we have these results
	// 			// in local storage. Update the dropdown.
	// 			awesome.list = results.map(v => v.label)

	// 		}

	// 	}

	// })

}

export default startMap
