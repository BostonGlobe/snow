import fetch from 'node-fetch'
import moment from 'moment'
import fs from 'fs'

const utc = moment.utc()
const getDate = datetime => {
  return {
    year: datetime.format('YYYY'),
    month: datetime.format('MM'),
    date: datetime.format('DD'),
    hour: datetime.format('HH')
  }
}

const getURL = (datetime, midnightNoon) => {
  const { year, month, date, hour } = getDate(datetime)
  const yearMonth = `${year}${month}`

  if(!midnightNoon) {
    midnightNoon = +hour >= 12 ? '12': '00'
  }
  const url = `https://www.nohrsc.noaa.gov/snowfall/data/${yearMonth}/sfav2_CONUS_24h_${yearMonth}${date}${midnightNoon}.tif`
  const file = fs.createWriteStream(`input/24_${year}-${month}-${date}-${midnightNoon}.tiff`)

  return { url, file }
}

let { url, file } = getURL(utc)
console.log(url);

fetch(url)
  .then(res => {
    if(res.ok) {
      res.body.pipe(file)
    } else {
      let { url, file } = +utc.format('HH') < 12 ? getURL(utc.subtract(1, 'days'), '12'): getURL(utc, '00')
      console.log('FILE DOESN\'T EXIST');
      console.log('TRYING:');
      console.log(url);
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
