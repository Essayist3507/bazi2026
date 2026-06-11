/* ===== Calendar — Solar/Lunar Calendar Conversion ===== */
window.BaziCalendar = (function() {
  'use strict';

  // ─── Verified Chinese New Year DOY (Day of Year, Jan 1 = 1) for 1900-2100 ───
  // Source: Standard Chinese calendar reference tables
  var CNY_DOY = [
    /* 1900-1909 */ 31, 50, 38, 29, 46, 35, 25, 43, 32, 22,
    /* 1910-1919 */ 41, 30, 49, 37, 26, 44, 33, 53, 41, 30,
    /* 1920-1929 */ 49, 37, 27, 45, 34, 24, 42, 31, 49, 38,
    /* 1930-1939 */ 28, 46, 35, 25, 43, 33, 22, 41, 30, 49,
    /* 1940-1949 */ 37, 27, 45, 34, 25, 42, 32, 22, 40, 29,
    /* 1950-1959 */ 48, 37, 27, 45, 34, 24, 42, 31, 50, 38,
    /* 1960-1969 */ 28, 46, 36, 25, 43, 33, 21, 40, 29, 47,
    /* 1970-1979 */ 37, 27, 45, 35, 24, 43, 31, 50, 38, 28,
    /* 1980-1989 */ 46, 36, 25, 43, 33, 51, 40, 29, 48, 37,
    /* 1990-1999 */ 27, 46, 35, 23, 42, 31, 50, 39, 28, 47,
    /* 2000-2009 */ 36, 24, 43, 32, 22, 40, 29, 49, 38, 26,
    /* 2010-2019 */ 45, 34, 23, 42, 31, 50, 39, 28, 47, 36,
    /* 2020-2029 */ 25, 43, 32, 22, 41, 29, 48, 37, 26, 44,
    /* 2030-2039 */ 34, 23, 41, 31, 49, 38, 28, 46, 35, 24,
    /* 2040-2049 */ 42, 31, 49, 38, 27, 46, 35, 24, 44, 33,
    /* 2050-2059 */ 22, 41, 29, 47, 37, 26, 44, 33, 51, 40,
    /* 2060-2069 */ 29, 48, 37, 26, 44, 33, 22, 41, 30, 49,
    /* 2070-2079 */ 38, 27, 45, 34, 24, 42, 31, 50, 39, 28,
    /* 2080-2089 */ 46, 35, 25, 43, 32, 22, 41, 29, 48, 37,
    /* 2090-2099 */ 26, 44, 33, 23, 41, 30, 49, 38, 27, 46,
    /* 2100     */ 35
  ];

  // ─── Lunar month data (1900-2100) ───
  // Standard encoding: lower 12 bits = month days (0=29d, 1=30d)
  // Bits 12-13: leap month days (0=none, 1=29d in leap, 2=30d in leap, 3=30d in leap)
  // Actually: bit 12 = leap month days (0=29, 1=30)
  // Bits 16-19: leap month number (0=no leap, 1-12=which lunar month is repeated)
  var LUNAR_DATA = [
    /* 1900-1909 */ 0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    /* 1910-1919 */ 0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    /* 1920-1929 */ 0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    /* 1930-1939 */ 0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    /* 1940-1949 */ 0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    /* 1950-1959 */ 0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
    /* 1960-1969 */ 0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    /* 1970-1979 */ 0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    /* 1980-1989 */ 0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    /* 1990-1999 */ 0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    /* 2000-2009 */ 0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    /* 2010-2019 */ 0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    /* 2020-2029 */ 0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    /* 2030-2039 */ 0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    /* 2040-2049 */ 0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    /* 2050-2059 */ 0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
    /* 2060-2069 */ 0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    /* 2070-2079 */ 0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    /* 2080-2089 */ 0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    /* 2090-2099 */ 0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252,
    /* 2100     */ 0x0d520
  ];

  // ─── Helpers ───
  function daysInMonth(year, month) {
    if (month === 2) {
      return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
    }
    return [31,28,31,30,31,30,31,31,30,31,30,31][month - 1];
  }

  function isLeapYear(year) {
    return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
  }

  // ─── Get lunar year info ───
  function getLunarYearInfo(lunarYear) {
    if (lunarYear < 1900 || lunarYear > 2100) return null;
    var idx = lunarYear - 1900;
    var data = LUNAR_DATA[idx];
    var newYearDOY = CNY_DOY[idx];

    var leapMonth = (data >> 16) & 0xf;
    var leapDays = (data >> 12) & 0x1 ? 30 : 29;
    var monthDays = [];
    for (var i = 0; i < 12; i++) {
      monthDays.push((data >> i) & 0x1 ? 30 : 29);
    }

    return {
      lunarYear: lunarYear,
      newYearDOY: newYearDOY,
      leapMonth: leapMonth,
      leapDays: leapDays,
      monthDays: monthDays
    };
  }

  // ─── Solar → Lunar ───
  function solarToLunar(year, month, day) {
    if (year < 1900 || year > 2100) return null;

    var doy = doyFromDate(year, month, day);
    var lunarYear = year;
    var info = getLunarYearInfo(lunarYear);
    if (!info) return null;

    var cnyDOY = info.newYearDOY;
    var daysSinceCNY;

    if (doy < cnyDOY) {
      lunarYear--;
      info = getLunarYearInfo(lunarYear);
      if (!info) return null;
      cnyDOY = info.newYearDOY;
      var prevYearDays = isLeapYear(year - 1) ? 366 : 365;
      daysSinceCNY = doy + prevYearDays - cnyDOY;
    } else {
      daysSinceCNY = doy - cnyDOY;
    }

    var totalDays = 0;
    var lunarMonth = 1;
    var isLeap = false;

    for (var m = 0; m < 12; m++) {
      var mDays = info.monthDays[m];
      if (totalDays + mDays > daysSinceCNY) {
        lunarMonth = m + 1;
        break;
      }
      totalDays += mDays;

      if (info.leapMonth === m + 1) {
        if (totalDays + info.leapDays > daysSinceCNY) {
          lunarMonth = m + 1;
          isLeap = true;
          break;
        }
        totalDays += info.leapDays;
      }
    }

    var lunarDay = daysSinceCNY - totalDays + 1;

    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      isLeap: isLeap
    };
  }

  // ─── Lunar → Solar ───
  function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap) {
    if (lunarYear < 1900 || lunarYear > 2100) return null;

    var info = getLunarYearInfo(lunarYear);
    if (!info) return null;

    var cnyDOY = info.newYearDOY;
    var totalDays = 0;

    for (var m = 0; m < lunarMonth - 1; m++) {
      totalDays += info.monthDays[m];
      if (info.leapMonth === m + 1) totalDays += info.leapDays;
    }

    if (isLeap && info.leapMonth === lunarMonth) {
      totalDays += info.monthDays[lunarMonth - 1];
    }

    totalDays += (lunarDay - 1);

    // Get the CNY date in the Gregorian year
    var refYear = lunarYear;
    var cnyMonth, cnyDay;

    if (cnyDOY <= 31) {
      cnyMonth = 1; cnyDay = cnyDOY;
    } else {
      cnyMonth = 2; cnyDay = cnyDOY - 31;
    }

    var resultDate = new Date(refYear, cnyMonth - 1, cnyDay);
    resultDate.setDate(resultDate.getDate() + totalDays);

    return {
      year: resultDate.getFullYear(),
      month: resultDate.getMonth() + 1,
      day: resultDate.getDate()
    };
  }

  // ─── Day of year helpers ───
  function doyFromDate(year, month, day) {
    var doy = 0;
    for (var m = 1; m < month; m++) { doy += daysInMonth(year, m); }
    return doy + day;
  }

  // ─── Get lunar months list for UI ───
  function getLunarMonths(lunarYear) {
    var info = getLunarYearInfo(lunarYear);
    if (!info) {
      var months = [];
      for (var i = 1; i <= 12; i++) months.push({ num: i, isLeap: false, days: 30 });
      return months;
    }

    var months = [];
    for (var i = 1; i <= 12; i++) {
      months.push({ num: i, isLeap: false, days: info.monthDays[i - 1] });
      if (info.leapMonth === i) {
        months.push({ num: i, isLeap: true, days: info.leapDays });
      }
    }
    return months;
  }

  function getLeapMonth(lunarYear) {
    var info = getLunarYearInfo(lunarYear);
    return info ? info.leapMonth : 0;
  }

  // ─── Public API ───
  return {
    solarToLunar: solarToLunar,
    lunarToSolar: lunarToSolar,
    getLunarYearInfo: getLunarYearInfo,
    getLeapMonth: getLeapMonth,
    getLunarMonths: getLunarMonths,
    daysInMonth: daysInMonth,
    doyFromDate: doyFromDate,
    CNY_DOY: CNY_DOY
  };
})();
