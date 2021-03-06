// This module draws the map.

import mapboxgl from 'mapbox-gl'
import * as topojson from 'topojson-client'
import * as request from 'd3-request'
import moment from 'moment'
import { map, find } from 'lodash'
import { select, selectAll, addClass } from './utils/dom'

const url = ENVIRONMENT === 'development' ? (
	'assets/snowtotals.topojson'
) : (
	`https://www3.bostonglobe.com/partners/snowfallscraper/snowfall_scraper.json?q=${Date.now()}`
)

const COLORS = {
	"total": [
		{inches: 6, color: '#d8e2ef'},
		{inches: 12, color: '#bfc9e2'},
		{inches: 18, color: '#aaadd3'},
		{inches: 24, color: '#9b92c5'},
		{inches: 30, color: '#8f74b6'},
		{inches: 36, color: '#88569f'},
		{inches: 42, color: '#783d83'},
		{inches: 48, color: '#612a64'},
		{inches: 54, color: '#451b44'},
		{inches: 60, color: '#271225'},
		{inches: 66, color: '#000'},
	],
	"daily": [
		{inches: 0.1, color: '#d8e2ef'},
		{inches: 1, color: '#bfc9e2'},
		{inches: 2, color: '#aaadd3'},
		{inches: 4, color: '#9b92c5'},
		{inches: 6, color: '#8f74b6'},
		{inches: 8, color: '#88569f'},
		{inches: 10, color: '#783d83'},
		{inches: 15, color: '#612a64'},
		{inches: 20, color: '#451b44'},
		{inches: 25, color: '#271225'},
		{inches: 30, color: '#000'},
	]
}

class SnowMap {
	constructor() {

		const snowMap = L.map('snowfall',{ scrollWheelZoom: false, tap: false, zoomSnap: 0.1 })
						.setView([42.233297, -72.055862], 7.4)
		const lightBackground = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png'

		snowMap.createPane('labels')
		snowMap.getPane('labels').style.zIndex = 650
		snowMap.getPane('labels').style.pointerEvents = 'none'

		const positron = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
			attribution: '©OpenStreetMap, ©CartoDB'
		}).addTo(snowMap);

		const positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
			attribution: '©OpenStreetMap, ©CartoDB',
			pane: 'labels'
		}).addTo(snowMap);

		this.props = {
			snowMap
		}

		this.state = {
			data: [],
			view: '6h',
			currentLayer: null
		}

		this.init()
	}



	getDateTimeInfo(filename) {
		const [ type, datetime ] = filename.split('_')
		const lastUpdated = moment.utc(datetime, 'YYYY-MM-DD-HH').local()
		let order = 0

		switch (type) {
			case '6h':
				order = 1
				break;
			case '24h':
				order = 2
				break;
			default:
				order = 3
		}

		return {
			type,
			lastUpdated,
			order
		}
	}

	fetchData() {
		request.json(url, (error, json) => {
			if (error) {
				console.error(error)
			} else {
				const geoData = map(json.objects, (topo, filename) => {
					const geojson = topojson.feature(json, topo)

					geojson.properties = {
						info: this.getDateTimeInfo(filename)
					}

					return geojson
				})

				this.state.data = this.parseData(geoData)

				this.setupButtons()
				this.addData()
			}
		})
	}

	parseData(data) {
		const geoData = data.map(collection => {
			const { type } = collection.properties.info
			const whichColor = type === 'total' ? 'total': 'daily'
			collection.features = collection.features.map(feature => {
				const { DN } = feature.properties
				const { color } = find(COLORS[whichColor], colorObj => colorObj.inches === DN)
				feature.properties.color = color

				return feature
			}).sort((a,b) => a.properties.DN - b.properties.DN)

			return collection
		})

		return geoData
	}

	addData() {
		const { snowMap } = this.props
		const { data } = this.state

		this.setView()
		this.setLastUpdated()
		this.setLegend()
	}

	setView(view = '6h') {
		const { snowMap } = this.props
		const { data } = this.state
		const current = find(data, collection => collection.properties.info.type === view)
		const sorted = current.features.sort((a,b) => a.properties.DN - b.properties.DN)

		const currentLayer = L.geoJSON(sorted, {
			style: (feature) => ({
				color: feature.properties.color,
				fill: true,
				fillColor: feature.properties.color,
				fillOpacity: 0.5,
				weight: 2
			})
		})

		currentLayer.addTo(snowMap)

		this.state.currentLayer = currentLayer
	}

	setLegend(view = '6h') {
		const { data } = this.state
		const current = find(data, collection => collection.properties.info.type === view)
		const whichColor = view === 'total' ? 'total': 'daily'
		const $legend = select('[data-legend]')
		const inches = selectAll('[data-legend-inches]')

		inches.forEach(($inch, index) => {
			$inch.innerHTML = COLORS[whichColor][index].inches
		})

		addClass($legend, 'show')
	}

	setLastUpdated(view = '6h') {
		const { data } = this.state
		const current = find(data, collection => collection.properties.info.type === view)
		const { type, lastUpdated } = current.properties.info
		const viewType = select('[data-view]')
		const datetime = select('[data-time]')
		let typeString = ''

		switch (view) {
			case '6h':
				typeString = 'Snowfall in last 6 hours'
				break;
			case 'total':
				typeString = 'Season total snowfall'
				break;
			default:
				typeString = 'Snowfall in last 24 hours'
		}

		viewType.innerHTML = typeString

		datetime.setAttribute('datetime', lastUpdated.format())

		datetime.innerHTML = `${lastUpdated.format('MMMM D, YYYY, h:mm a')}`

	}

	setupButtons() {
		const { view, data } = this.state
		const $container = select('[data-button-container]')
		const buttons = data.sort((a,b) => {
			return a.properties.info.order - b.properties.info.order
		}).map(collection => {
			const { type } = collection.properties.info
			return `<button data-layer="${type}">${this.getButtonText(type)}</button>`
		}).join('\n')

		addClass($container, 'ready')
		$container.innerHTML = buttons

		this.buttonEventListener()
		this.activateButton(view)
	}

	getButtonText(type) {
		switch (type) {
			case '6h':
				return 'Past 6 hours'
				break
			case '24h':
				return 'Past 24 hours'
				break
			default:
				return 'Season Total'

		}
	}

	activateButton(layer) {
		const buttons = selectAll('[data-layer]')
		const selected = select(`[data-layer="${layer}"]`)

		buttons.forEach(button => {
			button.removeAttribute('disabled')
			button.removeAttribute('active')
		})

		selected.setAttribute('disabled', true)
		selected.setAttribute('active', true)
	}

	buttonEventListener() {
		const { snowMap } = this.props
		const buttons = selectAll('[data-layer]')

		buttons.forEach($button => {
			$button.addEventListener('click', e => {
				const { view } = this.state
				const layer = e.target.getAttribute('data-layer')

				this.removeLayers(view)
				this.setView(layer)
				this.activateButton(layer)
				this.setLastUpdated(layer)
				this.setLegend(layer)

				this.state.view = layer
			})
		})
	}

	removeLayers(view) {
		const { snowMap } = this.props
		const { data, currentLayer } = this.state
		const current = find(data, collection => collection.properties.info.type === view)

		snowMap.removeLayer(currentLayer)
	}

	init() {
		this.fetchData()
	}
}

export default SnowMap
