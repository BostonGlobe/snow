import * as request from 'd3-request'
import dateline from 'dateline'
import _ from 'lodash'

import { select } from './utils/dom.js'
import setPathCookie from './utils/setPathCookie.js'
import removeMobileHover from './utils/removeMobileHover.js'
import wireSocialButtons from './utils/wireSocialButtons.js'
import startMap from './map.js'
import credits from './credits.js'

removeMobileHover()
setPathCookie()
credits()

// Add class to html if JS is loaded
document.querySelector('html').classList.add('js-is-loaded')

// Wire header social if present
if (document.querySelectorAll('.g-header__share').length) {
	wireSocialButtons({
		facebook: '.g-header__share-button--fb',
		twitter: '.g-header__share-button--tw',
	})
}

// const url = 'https://apps.bostonglobe.com/metro/graphics/2016/12/snow-totals/assets/snowtotals.topojson?q=' + Date.now()
const url = '/assets/snowtotals.topojson?q=' + Date.now()

startMap(url)

// const jsTime = select('.js-time')
// jsTime.innerHTML = 'Jan. 8, 5:04 pm'

request.json(url, (error, json) => {

	if (error) {

		console.error(error)

	} else {

		// Get the DOM element we are going to modify.
		const jsTime = select('.js-time')

		const reports = _.get(json, 'objects.reports.geometries', [])

		const [timestamp] = _(reports)
			.map('properties.timestamp')
			.filter()
			.value()

		if (timestamp) {

			// Create a dateline-wrapped date.
			const wrapped = dateline(new Date(+timestamp))

			// Create the human-readable string.
			const human = [wrapped.getAPDate(), wrapped.getAPTime()].join(', ')

			// Set its innerHTML and datetime attribute.
			jsTime.innerHTML = human
			jsTime.setAttribute('datetime', timestamp)

		}

	}

})
