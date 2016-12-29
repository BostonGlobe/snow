import * as request from 'd3-request'

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

startMap()

request.json('/assets/snowtotals.topojson', (error, json) => {

	if (error) {

		console.error(error)

	} else {
		
		const timestamp = json.timestamp

		select('.js-time').innerHTML = 'Dec. 8, 3:29 p.m.'

	}


})