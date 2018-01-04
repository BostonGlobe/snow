// This module sets up all the components.

import setPathCookie from './utils/setPathCookie'
import removeMobileHover from './utils/removeMobileHover'
import wireSocialButtons from './utils/wireSocialButtons'
import startMap from './map'
// import setupCredits from './credits'
// import updateTimestamp from './timestamp'

removeMobileHover()
setPathCookie()
// setupCredits()

// Add class to html if JS is loaded.
document.querySelector('html').classList.add('js-is-loaded')

// Wire header social if present.
if (document.querySelectorAll('.g-header__share').length) {
	wireSocialButtons({
		facebook: '.g-header__share-button--fb',
		twitter: '.g-header__share-button--tw',
	})
}

// const url =
// 	`https://www.bostonglobe.com/partners/snowfallscraper/snowfall_scraper.json?q=${Date.now()}`

// Start the map.
startMap()

// Update timestamp.
// updateTimestamp(url)
