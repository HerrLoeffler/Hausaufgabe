"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {annualSchoolPeriod}=require("../lib/billing/domain/contracts");
test("a school year uses agreed Berlin calendar dates, not 365 days from redemption",()=>{
 const p=annualSchoolPeriod("2027-09-01");
 assert.equal(p.startsAtMs,Date.parse("2027-08-31T22:00:00Z"));
 assert.equal(p.endsAtMs,Date.parse("2028-08-31T22:00:00Z"));
 assert.equal(p.startDate,"2027-09-01");assert.equal(p.endDateExclusive,"2028-09-01");
});
test("a leap-day contract has a deterministic following calendar anniversary",()=>{
 const p=annualSchoolPeriod("2028-02-29");assert.equal(p.endDateExclusive,"2029-02-28");
 assert.equal(p.endsAtMs,Date.parse("2029-02-27T23:00:00Z"));
});
test("impossible dates and timestamps disguised as dates are rejected",()=>{
 for(const value of["2027-02-29","2027-04-31","2027-09-01T00:00:00Z","01.09.2027","99999-01-01",null])assert.throws(()=>annualSchoolPeriod(value));
});
