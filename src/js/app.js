// This module sets up all the components.

import setPathCookie from './utils/setPathCookie'
import removeMobileHover from './utils/removeMobileHover'
import wireSocialButtons from './utils/wireSocialButtons'
import getData from './getData'
import SnowMap from './map'
import setupCredits from './credits'
import updateTimestamp from './timestamp'

removeMobileHover()
setPathCookie()
setupCredits()

// Add class to html if JS is loaded.
document.querySelector('html').classList.add('js-is-loaded')

// Wire header social if present.
if (document.querySelectorAll('.g-header__share').length) {
	wireSocialButtons({
		facebook: '.g-header__share-button--fb',
		twitter: '.g-header__share-button--tw',
	})
}


// const topojson = getData(url)

// Start the map.
new SnowMap()

// Update timestamp.
// updateTimestamp(url)
