import { select } from './utils/dom.js'

const map = {

  init() {

    const mapElement = select('.observed-snowfall--map')

    const map = L.Mapzen.map(mapElement, {
    	center: [37.7749, -122.4194],
    	zoom: 13,
    	scene: L.Mapzen.BasemapStyles.Cinnabar,
    })

  }

}

export default map
