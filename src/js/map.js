// This module draws the map.

import pakage from './../../package.json'
import { select } from './utils/dom'



const startMap = () => {


const mapboxAccessToken = "pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA";
const map = L.map('observed-snowfall__map', {scrollWheelZoom: false, tap: false, zoomSnap: 0.1}).setView([42.281, -71.718], 8.8);

	L.tileLayer('https://api.mapbox.com/styles/v1/gabriel-florit/cjc13znc8hpva2sruk24odval/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox.light',
	    accessToken: 'pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA'
	}).addTo(map);

	// // Select DOM map container.
	// const mapElement = select('.observed-snowfall__map')

// 	// Create Mapzen map in map container.
// 	const map = L.Mapzen.map(mapElement, {
// 		center: [42.2040, -71.8674],
// 		zoom: 7,
// 		scene: `assets/scene.yaml?q=${pakage.version}`,
// 		minZoom: 2,
// 		maxZoom: 10,
// 		apiKey: 'mapzen-v3U3y5X',
// 	})

// 	// Set attribution.
// 	map.attributionControl.addAttribution('<a href="http://www.weather.gov/erh/hydromet">NWS</a>')

// 	// Add locator button.
// 	const locator = L.Mapzen.locator()
// 	locator.addTo(map)

// 	let scene

// 	// Listen to the Tangram layer being loaded on the map,
// 	map.on('tangramloaded', e => {

// 		// then save scene to variable,
// 		scene = e.tangramLayer.scene

// 		// and force cache busting.
// 		scene.setDataSource('_snowtotals', {
// 			type: 'TopoJSON',
// 			url,
// 		})

// 	})

}

export default startMap
