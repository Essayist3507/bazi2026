/* ===== Ba Zi Core — Data Tables & Four Pillars Calculation ===== */
window.BaziCore = (function() {
  'use strict';

  // ─── Heavenly Stems (天干) ───
  const STEMS = [
    { char: '甲', pinyin: 'jiǎ', element: '木', yinYang: '阳', num: 1 },
    { char: '乙', pinyin: 'yǐ',  element: '木', yinYang: '阴', num: 2 },
    { char: '丙', pinyin: 'bǐng', element: '火', yinYang: '阳', num: 3 },
    { char: '丁', pinyin: 'dīng', element: '火', yinYang: '阴', num: 4 },
    { char: '戊', pinyin: 'wù',   element: '土', yinYang: '阳', num: 5 },
    { char: '己', pinyin: 'jǐ',   element: '土', yinYang: '阴', num: 6 },
    { char: '庚', pinyin: 'gēng', element: '金', yinYang: '阳', num: 7 },
    { char: '辛', pinyin: 'xīn',  element: '金', yinYang: '阴', num: 8 },
    { char: '壬', pinyin: 'rén',  element: '水', yinYang: '阳', num: 9 },
    { char: '癸', pinyin: 'guǐ',  element: '水', yinYang: '阴', num: 10 }
  ];

  // ─── Earthly Branches (地支) ───
  const BRANCHES = [
    { char: '子', pinyin: 'zǐ',  element: '水', yinYang: '阳', animal: '鼠', num: 1 },
    { char: '丑', pinyin: 'chǒu', element: '土', yinYang: '阴', animal: '牛', num: 2 },
    { char: '寅', pinyin: 'yín',  element: '木', yinYang: '阳', animal: '虎', num: 3 },
    { char: '卯', pinyin: 'mǎo',  element: '木', yinYang: '阴', animal: '兔', num: 4 },
    { char: '辰', pinyin: 'chén', element: '土', yinYang: '阳', animal: '龙', num: 5 },
    { char: '巳', pinyin: 'sì',   element: '火', yinYang: '阴', animal: '蛇', num: 6 },
    { char: '午', pinyin: 'wǔ',   element: '火', yinYang: '阳', animal: '马', num: 7 },
    { char: '未', pinyin: 'wèi',  element: '土', yinYang: '阴', animal: '羊', num: 8 },
    { char: '申', pinyin: 'shēn', element: '金', yinYang: '阳', animal: '猴', num: 9 },
    { char: '酉', pinyin: 'yǒu',  element: '金', yinYang: '阴', animal: '鸡', num: 10 },
    { char: '戌', pinyin: 'xū',   element: '土', yinYang: '阳', animal: '狗', num: 11 },
    { char: '亥', pinyin: 'hài',  element: '水', yinYang: '阴', animal: '猪', num: 12 }
  ];

  // ─── Hidden Stems (藏干) ───
  const HIDDEN_STEMS = {
    '子': [{ stem: '癸', weight: 1.0 }],
    '丑': [{ stem: '己', weight: 0.6 }, { stem: '癸', weight: 0.3 }, { stem: '辛', weight: 0.1 }],
    '寅': [{ stem: '甲', weight: 0.6 }, { stem: '丙', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
    '卯': [{ stem: '乙', weight: 1.0 }],
    '辰': [{ stem: '戊', weight: 0.6 }, { stem: '乙', weight: 0.3 }, { stem: '癸', weight: 0.1 }],
    '巳': [{ stem: '丙', weight: 0.6 }, { stem: '庚', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
    '午': [{ stem: '丁', weight: 0.7 }, { stem: '己', weight: 0.3 }],
    '未': [{ stem: '己', weight: 0.6 }, { stem: '丁', weight: 0.3 }, { stem: '乙', weight: 0.1 }],
    '申': [{ stem: '庚', weight: 0.6 }, { stem: '壬', weight: 0.3 }, { stem: '戊', weight: 0.1 }],
    '酉': [{ stem: '辛', weight: 1.0 }],
    '戌': [{ stem: '戊', weight: 0.6 }, { stem: '辛', weight: 0.3 }, { stem: '丁', weight: 0.1 }],
    '亥': [{ stem: '壬', weight: 0.7 }, { stem: '甲', weight: 0.3 }]
  };

  // ─── Na Yin (纳音) — 30 pairs, each pair covers 2 stem-branch combos ───
  const NA_YIN_TABLE = [
    ['甲子','乙丑','海中金'], ['丙寅','丁卯','炉中火'], ['戊辰','己巳','大林木'],
    ['庚午','辛未','路旁土'], ['壬申','癸酉','剑锋金'], ['甲戌','乙亥','山头火'],
    ['丙子','丁丑','涧下水'], ['戊寅','己卯','城头土'], ['庚辰','辛巳','白蜡金'],
    ['壬午','癸未','杨柳木'], ['甲申','乙酉','泉中水'], ['丙戌','丁亥','屋上土'],
    ['戊子','己丑','霹雳火'], ['庚寅','辛卯','松柏木'], ['壬辰','癸巳','长流水'],
    ['甲午','乙未','沙中金'], ['丙申','丁酉','山下火'], ['戊戌','己亥','平地木'],
    ['庚子','辛丑','壁上土'], ['壬寅','癸卯','金箔金'], ['甲辰','乙巳','覆灯火'],
    ['丙午','丁未','天河水'], ['戊申','己酉','大驿土'], ['庚戌','辛亥','钗钏金'],
    ['壬子','癸丑','桑柘木'], ['甲寅','乙卯','大溪水'], ['丙辰','丁巳','沙中土'],
    ['戊午','己未','天上火'], ['庚申','辛酉','石榴木'], ['壬戌','癸亥','大海水']
  ];

  // Build Na Yin lookup map
  const NA_YIN_MAP = {};
  NA_YIN_TABLE.forEach(function(row) {
    NA_YIN_MAP[row[0]] = row[2];
    NA_YIN_MAP[row[1]] = row[2];
  });

  // ─── Five Elements colors ───
  const ELEM_COLORS = { '木': '#4ade80', '火': '#f87171', '土': '#fbbf24', '金': '#e2e8f0', '水': '#60a5fa' };

  // ─── Helper Functions ───
  function getStemByChar(char) {
    for (var i = 0; i < STEMS.length; i++) {
      if (STEMS[i].char === char) return STEMS[i];
    }
    return null;
  }

  function getBranchByChar(char) {
    for (var i = 0; i < BRANCHES.length; i++) {
      if (BRANCHES[i].char === char) return BRANCHES[i];
    }
    return null;
  }

  function getStemIndex(char) {
    for (var i = 0; i < STEMS.length; i++) {
      if (STEMS[i].char === char) return i;
    }
    return -1;
  }

  function getBranchIndex(char) {
    for (var i = 0; i < BRANCHES.length; i++) {
      if (BRANCHES[i].char === char) return i;
    }
    return -1;
  }

  // ─── Solar Term Calculation ───
  // Uses the standard formula: day ≈ base + 0.2422*(year-1900) - floor((year-1900)/4)
  // Century corrections: add 0.2422 for 21st C, subtract for precision
  // The 12 major solar terms (节) that define month boundaries

  function computeSolarTerm(year, termIndex) {
    // termIndex 0-23: 0=立春, 2=惊蛰, 4=清明, 6=立夏, 8=芒种, 10=小暑,
    //                  12=立秋, 14=白露, 16=寒露, 18=立冬, 20=大雪, 22=小寒
    // Base day values for each solar term (covers both 节 and 气)
    var baseDays = [
      4.6295, 19.4739,  // 0:立春 2/4±1,  1:雨水 2/19±1
      5.63,   20.646,   // 2:惊蛰 3/6±1,   3:春分 3/21±1
      4.81,   20.084,   // 4:清明 4/5±1,   5:谷雨 4/20±1
      5.52,   21.184,   // 6:立夏 5/6±1,   7:小满 5/21±1
      5.68,   21.374,   // 8:芒种 6/6±1,   9:夏至 6/21±1
      7.18,   22.995,   // 10:小暑 7/7±1,  11:大暑 7/23±1
      7.50,   23.056,   // 12:立秋 8/7±1,  13:处暑 8/23±1
      7.65,   23.166,   // 14:白露 9/8±1,  15:秋分 9/23±1
      8.23,   23.577,   // 16:寒露 10/8±1, 17:霜降 10/24±1
      7.32,   22.429,   // 18:立冬 11/7±1, 19:小雪 11/22±1
      7.18,   22.048,   // 20:大雪 12/7±1, 21:冬至 12/22±1
      5.52,   20.178    // 22:小寒 1/6±1,  23:大寒 1/20±1
    ];

    var months = [2,2, 3,3, 4,4, 5,5, 6,6, 7,7, 8,8, 9,9, 10,10, 11,11, 12,12, 1,1];

    var base = baseDays[termIndex];
    var centuryOffset = Math.floor((year - 1900) / 100) * 0.2422;
    var leapCorrection = Math.floor((year - 1900) / 4);

    var day = Math.floor(base + 0.2422 * (year - 1900) - leapCorrection + centuryOffset);

    // Clamp to valid month days
    var month = months[termIndex];
    if (month === 1 && termIndex >= 22) year += 1;

    // Fix: For 21st century, terms are off by about 1 day
    if (year >= 2000 && termIndex >= 0) {
      day -= 1;
    }

    // Clamp days
    var maxDays = 31;
    if (month === 2) {
      maxDays = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28;
    } else if ([4,6,9,11].indexOf(month) >= 0) {
      maxDays = 30;
    }
    if (day < 1) day = 1;
    if (day > maxDays) day = maxDays;

    return { year: year, month: month, day: day };
  }

  // Get a specific major solar term date for month pillar boundaries
  function getMajorSolarTerm(year, monthNum) {
    // monthNum 1-12 in the pillar system: 1=寅月(立春), 2=卯月(惊蛰), ...
    // termIndex = (monthNum - 1) * 2
    var termIdx = (monthNum - 1) * 2;
    if (termIdx >= 22) {
      // 小寒(termIdx=22) and 大寒(termIdx=23) map to month pillar months 12 and 1
    }
    return computeSolarTerm(year, termIdx);
  }

  // Get Li Chun (立春) date for a given year — determines year pillar boundary
  function getLiChun(year) {
    return computeSolarTerm(year, 0);
  }

  // Get all major solar term dates for Da Yun calculation
  function getAllMajorSolarTerms(year) {
    var terms = [];
    for (var i = 0; i < 24; i += 2) {
      terms.push(computeSolarTerm(year, i));
    }
    // Also need 小寒 for the year transition
    terms.push(computeSolarTerm(year, 22));
    return terms;
  }

  // Find which month pillar a date falls in, and days to next/prev major term
  function getMonthPillarInfo(year, month, day) {
    // month pillar 1-12: 寅=1, 卯=2, 辰=3, 巳=4, 午=5, 未=6, 申=7, 酉=8, 戌=9, 亥=10, 子=11, 丑=12
    // Get all 12 major solar terms for this year
    var majorTerms = [];
    var monthNames = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'];

    for (var mp = 1; mp <= 12; mp++) {
      var ti = (mp - 1) * 2;
      var st;
      if (ti <= 22) {
        st = computeSolarTerm(year, ti);
      }
      if (st) {
        majorTerms.push({ monthPillar: mp, monthName: monthNames[mp-1], year: st.year, month: st.month, day: st.day, termIdx: ti });
      }
    }

    // Also add 小寒 of this year for month 12 boundary, and 立春 of next year
    var xiaohan = computeSolarTerm(year, 22);
    majorTerms.push({ monthPillar: 12, monthName: '丑', year: xiaohan.year, month: xiaohan.month, day: xiaohan.day, termIdx: 22 });

    var lichunNext = computeSolarTerm(year + 1, 0);
    majorTerms.push({ monthPillar: 1, monthName: '寅', year: lichunNext.year, month: lichunNext.month, day: lichunNext.day, termIdx: 24 });

    // Sort by actual date
    majorTerms.sort(function(a, b) {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });

    // Find which interval the birth date falls in
    var birthDate = new Date(year, month - 1, day);
    var foundMonth = 12; // default
    var daysToNext = 0;
    var daysToPrev = 0;

    for (var i = 0; i < majorTerms.length; i++) {
      var termDate = new Date(majorTerms[i].year, majorTerms[i].month - 1, majorTerms[i].day);
      var nextDate = (i + 1 < majorTerms.length) ? new Date(majorTerms[i+1].year, majorTerms[i+1].month - 1, majorTerms[i+1].day) : null;

      if (termDate <= birthDate && (!nextDate || birthDate < nextDate)) {
        foundMonth = majorTerms[i].monthPillar;
        if (nextDate) {
          daysToNext = Math.floor((nextDate - birthDate) / 86400000);
        }
        daysToPrev = Math.floor((birthDate - termDate) / 86400000);
        break;
      }
    }

    return { monthPillarNum: foundMonth, daysToNextTerm: daysToNext, daysToPrevTerm: daysToPrev };
  }

  // ─── Year Pillar (年柱) ───
  function getYearPillar(year, month, day) {
    var liChun = getLiChun(year);
    // If birth is before Li Chun, use previous year
    if (month < liChun.month || (month === liChun.month && day < liChun.day)) {
      year--;
    }
    var stemIdx = ((year - 4) % 10 + 10) % 10;
    var branchIdx = ((year - 4) % 12 + 12) % 12;
    return {
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      stemIndex: stemIdx,
      branchIndex: branchIdx
    };
  }

  // ─── Month Pillar (月柱) ───
  function getMonthPillar(year, month, day, yearStemIndex) {
    var info = getMonthPillarInfo(year, month, day);
    var monthNum = info.monthPillarNum; // 1-12 (寅=1, ..., 丑=12)
    var branchIdx = (monthNum - 1 + 2) % 12; // 寅=index2, so month 1 → index 2

    // Five Tiger Escape (五虎遁): month stem from year stem
    // Year stem groups: 甲己→丙, 乙庚→戊, 丙辛→庚, 丁壬→壬, 戊癸→甲
    var stemBase;
    var g = yearStemIndex % 5;
    if (g === 0) stemBase = 2;      // 甲→丙(index 2)
    else if (g === 1) stemBase = 4; // 乙→戊(index 4)
    else if (g === 2) stemBase = 6; // 丙→庚(index 6)
    else if (g === 3) stemBase = 8; // 丁→壬(index 8)
    else stemBase = 0;              // 戊→甲(index 0)

    var stemIdx = (stemBase + monthNum - 1) % 10;

    return {
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      stemIndex: stemIdx,
      branchIndex: branchIdx,
      monthPillarNum: monthNum
    };
  }

  // ─── Day Pillar (日柱) ───
  function getDayPillar(year, month, day) {
    // Reference: 1900-01-01 = 甲戌日 (sexagenary cycle position 10)
    // 甲=0, 戌=10 → cycle index = 10
    var refDate = Date.UTC(1900, 0, 1);
    var targetDate = Date.UTC(year, month - 1, day);
    var diffDays = Math.floor((targetDate - refDate) / 86400000);

    // Cycle index = (reference_cycle_index + diff_days) mod 60
    var refCycleIdx = 10; // 甲戌
    var cycleIdx = ((refCycleIdx + diffDays) % 60 + 60) % 60;

    var stemIdx = cycleIdx % 10;
    var branchIdx = cycleIdx % 12;

    return {
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      stemIndex: stemIdx,
      branchIndex: branchIdx
    };
  }

  // ─── Hour Pillar (时柱) ───
  function getHourPillar(dayStemIndex, hourBranchIndex) {
    // Five Rat Escape (五鼠遁): hour stem from day stem
    // Day stem groups for 子时: 甲己→甲, 乙庚→丙, 丙辛→戊, 丁壬→庚, 戊癸→壬
    var stemBase;
    var g = dayStemIndex % 5;
    if (g === 0) stemBase = 0;      // 甲→甲(index 0)
    else if (g === 1) stemBase = 2; // 乙→丙(index 2)
    else if (g === 2) stemBase = 4; // 丙→戊(index 4)
    else if (g === 3) stemBase = 6; // 丁→庚(index 6)
    else stemBase = 8;              // 戊→壬(index 8)

    var stemIdx = (stemBase + hourBranchIndex) % 10;

    return {
      stem: STEMS[stemIdx],
      branch: BRANCHES[hourBranchIndex],
      stemIndex: stemIdx,
      branchIndex: hourBranchIndex
    };
  }

  // ─── Full Ba Zi Calculation ───
  function calculateBazi(year, month, day, hourBranchIndex) {
    var yearPillar = getYearPillar(year, month, day);
    var monthPillar = getMonthPillar(year, month, day, yearPillar.stemIndex);
    var dayPillar = getDayPillar(year, month, day);
    var hourPillar = getHourPillar(dayPillar.stemIndex, hourBranchIndex);

    // Nayin for each pillar
    function getNaYin(stemChar, branchChar) {
      return NA_YIN_MAP[stemChar + branchChar] || '';
    }

    // Hidden stems for each pillar
    function getHiddenStems(branchChar) {
      return HIDDEN_STEMS[branchChar] || [];
    }

    return {
      year: {
        stem: yearPillar.stem,
        branch: yearPillar.branch,
        stemIndex: yearPillar.stemIndex,
        branchIndex: yearPillar.branchIndex,
        nayin: getNaYin(yearPillar.stem.char, yearPillar.branch.char),
        hiddenStems: getHiddenStems(yearPillar.branch.char)
      },
      month: {
        stem: monthPillar.stem,
        branch: monthPillar.branch,
        stemIndex: monthPillar.stemIndex,
        branchIndex: monthPillar.branchIndex,
        nayin: getNaYin(monthPillar.stem.char, monthPillar.branch.char),
        hiddenStems: getHiddenStems(monthPillar.branch.char)
      },
      day: {
        stem: dayPillar.stem,
        branch: dayPillar.branch,
        stemIndex: dayPillar.stemIndex,
        branchIndex: dayPillar.branchIndex,
        nayin: getNaYin(dayPillar.stem.char, dayPillar.branch.char),
        hiddenStems: getHiddenStems(dayPillar.branch.char),
        isDayMaster: true
      },
      hour: {
        stem: hourPillar.stem,
        branch: hourPillar.branch,
        stemIndex: hourPillar.stemIndex,
        branchIndex: hourPillar.branchIndex,
        nayin: getNaYin(hourPillar.stem.char, hourPillar.branch.char),
        hiddenStems: getHiddenStems(hourPillar.branch.char)
      }
    };
  }

  // ─── Five Elements Tally ───
  function tallyFiveElements(bazi) {
    var tally = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    var pillars = ['year', 'month', 'day', 'hour'];

    pillars.forEach(function(p) {
      var stemElem = bazi[p].stem.element;
      var branchElem = bazi[p].branch.element;
      tally[stemElem] = (tally[stemElem] || 0) + 1;
      tally[branchElem] = (tally[branchElem] || 0) + 1;

      // Also count hidden stems (weighted)
      var hidden = bazi[p].hiddenStems;
      hidden.forEach(function(h) {
        var hStem = getStemByChar(h.stem);
        if (hStem) {
          tally[hStem.element] = (tally[hStem.element] || 0) + h.weight * 0.5;
        }
      });
    });

    return tally;
  }

  // ─── Day Master Strength Assessment (身强/身弱) ───
  function assessDayMasterStrength(bazi, tally) {
    var dmElement = bazi.day.stem.element;
    var dmYinYang = bazi.day.stem.yinYang;

    // Supporting elements: same as DM + generating DM (印)
    var generatingMap = {
      '木': '水', '火': '木', '土': '火', '金': '土', '水': '金'
    };
    var supportElem = generatingMap[dmElement];

    // Count support vs opposition in visible stems and branches
    var supportCount = 0;
    var opposeCount = 0;

    var pillars = ['year', 'month', 'day', 'hour'];
    pillars.forEach(function(p) {
      var sElem = bazi[p].stem.element;
      var bElem = bazi[p].branch.element;

      // Stem support
      if (sElem === dmElement || sElem === supportElem) supportCount++;
      else opposeCount++;

      // Branch support
      if (bElem === dmElement || bElem === supportElem) supportCount++;
      else opposeCount++;

      // Hidden stems - count the primary one
      var hidden = bazi[p].hiddenStems;
      if (hidden.length > 0) {
        var hElem = getStemByChar(hidden[0].stem).element;
        if (hElem === dmElement || hElem === supportElem) supportCount += 0.5;
        else opposeCount += 0.5;
      }
    });

    // Month branch carries more weight (seasonal influence)
    var monthElem = bazi.month.branch.element;
    if (monthElem === dmElement || monthElem === supportElem) supportCount += 2;
    else opposeCount += 2;

    var strength = supportCount / (supportCount + opposeCount);
    var level;
    if (strength >= 0.65) level = '身强';
    else if (strength >= 0.45) level = '中和';
    else level = '身弱';

    // Determine favorable and unfavorable elements
    var favorable = [];
    var unfavorable = [];

    if (strength >= 0.60) {
      // Strong: favor elements that control or drain DM
      // Controlling: overcomer element
      // Draining: element DM generates
      var controlledBy = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' };
      var generates = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
      favorable = [controlledBy[dmElement], generates[dmElement]];
      unfavorable = [dmElement, supportElem];
    } else {
      // Weak: favor supporting elements
      favorable = [dmElement, supportElem];
      var controlledBy = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' };
      unfavorable = [controlledBy[dmElement]];
    }

    return {
      level: level,
      score: strength,
      supportCount: supportCount,
      opposeCount: opposeCount,
      favorable: favorable,
      unfavorable: unfavorable
    };
  }

  // ─── Public API ───
  return {
    STEMS: STEMS,
    BRANCHES: BRANCHES,
    HIDDEN_STEMS: HIDDEN_STEMS,
    NA_YIN_MAP: NA_YIN_MAP,
    ELEM_COLORS: ELEM_COLORS,
    getStemByChar: getStemByChar,
    getBranchByChar: getBranchByChar,
    getStemIndex: getStemIndex,
    getBranchIndex: getBranchIndex,
    calculateBazi: calculateBazi,
    tallyFiveElements: tallyFiveElements,
    assessDayMasterStrength: assessDayMasterStrength,
    getLiChun: getLiChun,
    getMonthPillarInfo: getMonthPillarInfo,
    getAllMajorSolarTerms: getAllMajorSolarTerms,
    computeSolarTerm: computeSolarTerm,
    getYearPillar: getYearPillar,
    getMonthPillar: getMonthPillar,
    getDayPillar: getDayPillar,
    getHourPillar: getHourPillar
  };
})();
