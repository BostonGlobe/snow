import fetch from 'node-fetch'
import moment from 'moment'
import fs from 'fs'

/**
 * getGeoTiff
 * datasource: https://www.nohrsc.noaa.gov/snowfall/
 * NOHRSC uploads geotiffs of snowfall at certain times of day.
 * We pull the previous 6 hours, 24 hours and season totals of snowfall
 * by finding the nearest available upload of each geotiff.
 * Then download each geotiff to a file with a filename corresponding
 * to the data type (i.e. 6h, 24h, or total) and the date that the
 * geotiff was uploaded.
 */

// File info for data source
// TODO: make season total file dynamic
const filePrefixes = [
  {
    prefix: 'sfav2_CONUS_6h_',
    filename: '6h',
    interval: 6
  }, {
    prefix: 'sfav2_CONUS_24h_',
    filename: '24h',
    interval: 12
  },
  {
    prefix: 'sfav2_CONUS_2017093012_to_',
    filename: 'total',
    interval: 12
  }
]

/**
 * Takes a moment js date object and returns year, month, date, and hour
 * in correct string format.
 * @method getDate
 * @param  {Object} datetime moment js date object
 * @return {Object}
 */
const getDate = datetime => {
  return {
    year: datetime.format('YYYY'),
    month: datetime.format('MM'),
    date: datetime.format('DD'),
    hour: datetime.format('HH')
  }
}

/**
 * Function that returns the date-based datasource url as well as the
 * corresponding date-based file stream in order to request the most recent data and
 * download it into a file.
 * @method getDateFiles
 * @param  {Object}     datetime moment js date object
 * @param  {String}     prefix   prefix of the filename that determines
 *                               the date type (6hr, 24hr, season total)
 * @param  {String}     filename prefix of destination filename (6h, 24h, ot total)
 * @return {Object}              object with datasource url string and file stream
 */
const getDateFiles = (datetime, prefix, filename) => {
  const { year, month, date, hour } = getDate(datetime)
  const yearMonth = `${year}${month}`

  // Datasource
  const url = `https://www.nohrsc.noaa.gov/snowfall/data/${yearMonth}/${prefix}${yearMonth}${date}${hour}.tif`
  // Destination filename
  const file = fs.createWriteStream(`input/${filename}_${year}-${month}-${date}-${hour}.tiff`)

  return { url, file }
}

/**
 * Function that returns the correct hour to request as data is only updated
 * at certain hours of the day.
 * @method getHour
 * @param  {Number} hour          current utc hour of the day
 * @param  {Number} interval      how often data is updated
 * @return {Number}               the nearest hour where data is availble
 */
const getHour = (hour, interval = 12) => {
  //
  const hours = [0,6,12,18].filter(time => ((time % interval) === 0) && hour >= time)
  return Math.max(...hours)
}

/**
 * Fetches nearest avalable geotiff and downloads it to a file
 * with a filename that contains the datatype (6h, 24h, and total)
 * as well as the date and hour of when data was uploaded.
 * @method fetchFile
 * @param  {String}  prefix   prefix of the filename that determines
 *                            the date type (6hr, 24hr, season total)
 * @param  {Object}  utc      moment js date object
 * @param  {Number}  interval how often data is updated
 * @param  {String}  filename prefix of destination filename (6h, 24h, ot total)
 */
const fetchFile = (prefix, utc, interval, filename) => {
  let { url, file } = getDateFiles(utc, prefix, filename)
  console.log(`DOWNLOADING: ${url}`);
  fetch(url)
    .then(res => {
      if(res.ok) {
        res.body.pipe(file)
      } else {
        let { url, file } = getDateFiles(utc.subtract(interval, 'hours'), prefix, filename)
        console.log('FILE DOESN\'T EXIST');
        console.log(`TRYING: ${url}`);
        fetch(url)
          .then(res => {
            if(res.ok) {
              res.body.pipe(file)
            } else {
              console.log('SECONDARY FILE DOESN\'T EXIST EITHER');
            }
          })
      }
    })
    .catch((err) => {
      console.log(err);
    })
}

// Loop through all the file objects and fetch and download
filePrefixes.forEach(obj => {
  const { prefix, interval, filename } = obj
  const utc = moment.utc()
  const hour = getHour(utc.hour(), interval)

  utc.hour(hour)

  fetchFile(prefix, utc, interval, filename)
})
