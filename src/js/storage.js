const localStorageKey = 'bg-snow-totals-results'

const setStorageResults = ({ token, results }) => {

	// Try to retrieve the dictionary.
	let item = localStorage.getItem(localStorageKey)

	// If it doesn't exist yet,
	if (!item) {

		// create it.
		item = JSON.stringify({})

	}

	// Parse the dictionary.
	let dictionary = JSON.parse(item)

	// Update dictionary.
	dictionary[token] = results

	// Write to local storage.
	localStorage.setItem(localStorageKey, JSON.stringify(dictionary))

}

const getAllStorageResults = () => {

	// Try to retrieve the dictionary.
	let item = localStorage.getItem(localStorageKey)

	// If it doesn't exist yet,
	if (!item) {

		// create it.
		item = JSON.stringify({})

	}

	// Parse the dictionary.
	const dictionary = JSON.parse(item)

	// Get all the values.
	const results = _(dictionary)
		.values()
		.flatten()
		.sortBy('label')
		.uniqBy('label')
		.value()

	return results

}

const getStorageResultsByToken = (token) => {

	// Try to retrieve the dictionary.
	let item = localStorage.getItem(localStorageKey)

	// If it doesn't exist yet,
	if (!item) {

		// create it,
		item = JSON.stringify({})

		// and write to localStorage.
		localStorage.setItem(localStorageKey, item)
	}

	// Parse the dictionary.
	const dictionary = JSON.parse(item)

	// Return entry for this token.
	return dictionary[token]

}

export {
	getAllStorageResults,
	getStorageResultsByToken,
	setStorageResults,
}
