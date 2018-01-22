// This module draws the map.

import mapboxgl from 'mapbox-gl'
import * as topojson from 'topojson-client'
import * as request from 'd3-request'
import moment from 'moment'
import { map, find } from 'lodash'
import { select, selectAll } from './utils/dom'

const url = 'assets/snowtotals.topojson'
const COLORS = [
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

class SnowMap {
	constructor() {
		mapboxgl.accessToken = 'pk.eyJ1IjoiZ2FicmllbC1mbG9yaXQiLCJhIjoiVldqX21RVSJ9.Udl7GDHMsMh8EcMpxIr2gA'
		const snowMap = new mapboxgl.Map({
				container: 'snowfall',
				style: 'mapbox://styles/mapbox/streets-v9',
				center: [-71.766398, 44.512989],
				zoom: 4.5
		})

		this.props = {
			snowMap
		}

		this.state = {
			data: [],
			view: '24h'
		}

		this.init()
	}

	getDateTimeInfo(filename) {
		const [ type, datetime ] = filename.split('_')
		const lastUpdated = moment.utc(datetime, 'YYYY-MM-DD-HH').local()

		return {
			type,
			lastUpdated
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

				this.state.data = geoData

				this.setupButtons()
				this.addData()
			}
		})
	}

	addData() {
		const { snowMap } = this.props
		const { data } = this.state

		this.setView()
		this.setLastUpdated()
	}

	setView(view = '24h') {
		const { snowMap } = this.props
		const { data } = this.state
		const current = find(data, collection => collection.properties.info.type === view)
		const sorted = current.features.sort((a,b) => a.properties.DN - b.properties.DN)

		sorted.forEach(feature => {
			const inches = feature.properties.DN
			const { color } = find(COLORS, colorObj => colorObj.inches === inches)

			snowMap.addLayer({
				'id': `${view}_${inches}`,
				'type': 'fill',
				'source': {
					'type': 'geojson',
					'data': feature
				},
				'layout': {},
				'paint': {
					'fill-color': color,
					'fill-opacity': 0.75
				}
			})
		})
	}

	setLastUpdated(view = '24h') {
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
		const { data } = this.state
		const $container = select('[data-button-container]')
		const buttons = data.map(collection => {
			const { type } = collection.properties.info
			return `<button data-layer="${type}">${type}</button>`
		}).join('\n')

		$container.innerHTML = buttons

		this.buttonEventListener()
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
				this.setLastUpdated(layer)

				this.state.view = layer
			})
		})
	}

	removeLayers(view) {
		const { snowMap } = this.props
		const { data } = this.state
		const current = find(data, collection => collection.properties.info.type === view)

		current.features.forEach(feature => {
			const { DN } = feature.properties

			snowMap.removeLayer(`${view}_${DN}`)
			snowMap.removeSource(`${view}_${DN}`)
		})
	}

	init() {
		this.fetchData()
	}
}

export default SnowMap
