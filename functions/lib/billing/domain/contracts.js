"use strict";

function parsedDate(value) {
  if (typeof value !== "string" || !/^20\d{2}-\d{2}-\d{2}$/.test(value)) throw new TypeError("Valid calendar date required");
  const utc = Date.parse(value + "T00:00:00Z");
  if (!Number.isFinite(utc) || new Date(utc).toISOString().slice(0,10) !== value) throw new TypeError("Invalid calendar date");
  return new Date(utc);
}
function berlinMidnight(value) {
  const utc = parsedDate(value).getTime();
  const offset = new Intl.DateTimeFormat("en", {timeZone:"Europe/Berlin",timeZoneName:"longOffset",hour:"2-digit"})
    .formatToParts(utc).find(part => part.type === "timeZoneName")?.value;
  const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(offset || "");
  if (!match) throw new TypeError("Berlin calendar timezone unavailable");
  const offsetMs = (Number(match[2])*60 + Number(match[3]))*60000*(match[1] === "+" ? 1 : -1);
  return utc - offsetMs;
}
function annualSchoolPeriod(startDate) {
  const start = parsedDate(startDate), year = start.getUTCFullYear()+1, month = start.getUTCMonth();
  const lastDay = new Date(Date.UTC(year,month+1,0)).getUTCDate();
  const endDateExclusive = new Date(Date.UTC(year,month,Math.min(start.getUTCDate(),lastDay))).toISOString().slice(0,10);
  return {startDate,endDateExclusive,timeZone:"Europe/Berlin",startsAtMs:berlinMidnight(startDate),endsAtMs:berlinMidnight(endDateExclusive)};
}
module.exports = {annualSchoolPeriod};
