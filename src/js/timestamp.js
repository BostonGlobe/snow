// This module updates the "Last updated" element.

import * as request from 'd3-request'
import dateline from 'dateline'
import _ from 'lodash'

import { select } from './utils/dom'

const updateTimestamp = url => {

	// Request topojson.
	request.json(url, (error, json) => {

		if (error) {

			console.error(error)

		} else {

			// Get the DOM element we are going to modify.
			const jsTime = select('.js-time')

			// Get the station reports.
			const reports = _.get(json, 'objects.reports.geometries', [])

			// Get the report timestamps (there should only be one).
			const [timestamp] = _(reports)
				.map('properties.timestamp')
				.filter()
				.value()

			// If we have a timestamp,
			if (timestamp) {

				// create a dateline-wrapped date,
				const wrapped = dateline(new Date(+timestamp))

				// create the human-readable string,
				const human = [wrapped.getAPDate(), wrapped.getAPTime()].join(', ')

				// and set its innerHTML and datetime attribute.
				jsTime.innerHTML = human
				jsTime.setAttribute('datetime', timestamp)

			}

		}

	})

}

export default updateTimestamp
