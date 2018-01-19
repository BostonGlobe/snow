import fetch from 'node-fetch'
import moment from 'moment'
import fs from 'fs'

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

const getDate = datetime => {
  return {
    year: datetime.format('YYYY'),
    month: datetime.format('MM'),
    date: datetime.format('DD'),
    hour: datetime.format('HH')
  }
}

const getDateFiles = (datetime, prefix, filename) => {
  const { year, month, date, hour } = getDate(datetime)
  const yearMonth = `${year}${month}`
  const url = `https://www.nohrsc.noaa.gov/snowfall/data/${yearMonth}/${prefix}${yearMonth}${date}${hour}.tif`
  const file = fs.createWriteStream(`input/${filename}_${year}-${month}-${date}-${hour}.tiff`)

  return { url, file }
}

const getHour = (hour, interval = 12) => {
  const hours = [0,6,12,18].filter(time => ((time % interval) === 0) && hour >= time)
  return Math.max(...hours)
}

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

filePrefixes.forEach(obj => {
  const { prefix, interval, filename } = obj
  const utc = moment.utc()
  const hour = getHour(utc.hour(), interval)

  utc.hour(hour)

  fetchFile(prefix, utc, interval, filename)
})
