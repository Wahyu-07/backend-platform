const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

function toWIB(date, withFormat = true) {
  const wibTime = dayjs(date).tz('Asia/Jakarta');
  return withFormat ? wibTime.format('YYYY-MM-DD HH:mm:ss') : wibTime.toDate();
}

module.exports = {
  toWIB,
};