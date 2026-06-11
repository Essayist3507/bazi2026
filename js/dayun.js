/* ===== Da Yun & Liu Nian — Luck Cycles, Multi-Year Fortune Scoring ===== */
window.DaYun = (function() {
  'use strict';

  var Core = window.BaziCore;
  var Gods = window.GodsStars;

  function daysBetween(y1, m1, d1, y2, m2, d2) {
    return Math.floor((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000);
  }

  function getDaYunDirection(gender, yearStemYinYang) {
    if (gender === 'male') return yearStemYinYang === '阳';
    else return yearStemYinYang === '阴';
  }

  function daysToSolarTerm(year, month, day, isForward) {
    var birthDate = new Date(year, month - 1, day);
    var allTerms = [];
    [year - 1, year, year + 1].forEach(function(y) {
      Core.getAllMajorSolarTerms(y).forEach(function(t) { allTerms.push(t); });
    });
    allTerms.sort(function(a, b) {
      if (a.year !== b.year) return a.year - b.year;
      if (a.month !== b.month) return a.month - b.month;
      return a.day - b.day;
    });

    if (isForward) {
      for (var i = 0; i < allTerms.length; i++) {
        var td = new Date(allTerms[i].year, allTerms[i].month - 1, allTerms[i].day);
        if (td > birthDate) return Math.floor((td - birthDate) / 86400000);
      }
    } else {
      for (var i = allTerms.length - 1; i >= 0; i--) {
        var td = new Date(allTerms[i].year, allTerms[i].month - 1, allTerms[i].day);
        if (td < birthDate) return Math.floor((birthDate - td) / 86400000);
      }
    }
    return 30;
  }

  // ─── Calculate Da Yun (大运) ───
  function calculateDaYun(birthYear, birthMonth, birthDay, gender, yearStem, monthPillar) {
    var isForward = getDaYunDirection(gender, yearStem.yinYang);
    var daysToTerm = daysToSolarTerm(birthYear, birthMonth, birthDay, isForward);
    var startAge = Math.max(0, Math.floor(daysToTerm / 3));
    if (daysToTerm <= 2) startAge = Math.max(0, Math.round(daysToTerm / 3 * 10) / 10);

    var monthStemIdx = Core.getStemIndex(monthPillar.stem.char);
    var monthBranchIdx = Core.getBranchIndex(monthPillar.branch.char);

    var pillars = [];
    for (var i = 0; i < 8; i++) {
      var offset = isForward ? (i + 1) : -(i + 1);
      var sIdx = ((monthStemIdx + offset) % 10 + 10) % 10;
      var bIdx = ((monthBranchIdx + offset) % 12 + 12) % 12;
      var stem = Core.STEMS[sIdx];
      var branch = Core.BRANCHES[bIdx];
      pillars.push({
        stem: stem, branch: branch,
        stemIndex: sIdx, branchIndex: bIdx,
        nayin: Core.NA_YIN_MAP[stem.char + branch.char] || '',
        ageStart: startAge + i * 10,
        ageEnd: startAge + (i + 1) * 10 - 1
      });
    }

    return { startAge: startAge, isForward: isForward, direction: isForward ? '顺排' : '逆排', daysToTerm: daysToTerm, pillars: pillars };
  }

  // ─── Calculate Liu Nian for a specific year ───
  function calculateLiuNian(targetYear) {
    var stemIdx = ((targetYear - 4) % 10 + 10) % 10;
    var branchIdx = ((targetYear - 4) % 12 + 12) % 12;
    return {
      year: targetYear,
      stem: Core.STEMS[stemIdx],
      branch: Core.BRANCHES[branchIdx],
      stemIndex: stemIdx,
      branchIndex: branchIdx
    };
  }

  function getCurrentDaYun(dayun, age) {
    for (var i = 0; i < dayun.pillars.length; i++) {
      if (age >= dayun.pillars[i].ageStart && age <= dayun.pillars[i].ageEnd) return dayun.pillars[i];
    }
    return dayun.pillars[dayun.pillars.length - 1];
  }

  // ─── Branch Clash/Combination Maps ───
  var BRANCH_CLASH = { '子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳' };
  var BRANCH_COMBO = { '子':'丑','丑':'子','寅':'亥','亥':'寅','卯':'戌','戌':'卯','辰':'酉','酉':'辰','巳':'申','申':'巳','午':'未','未':'午' };
  var BRANCH_HARM = { '子':'未','未':'子','丑':'午','午':'丑','寅':'巳','巳':'寅','卯':'辰','辰':'卯','申':'亥','亥':'申','酉':'戌','戌':'酉' };

  // ─── Multi-Year Fortune Scoring ───
  function scoreYear(bazi, dayun, age, targetYear, dayunForYear) {
    var ln = calculateLiuNian(targetYear);
    var dmStem = bazi.day.stem;
    var score = 60; // baseline
    var highlights = [];
    var warnings = [];
    var categories = {
      love: { score: 60, notes: [] },
      career: { score: 60, notes: [] },
      wealth: { score: 60, notes: [] },
      health: { score: 60, notes: [] }
    };

    // Dayun ten god with day master
    var dyTenGod = Gods.getTenGod(dmStem, dayunForYear ? dayunForYear.stem : dayun.pillars[0].stem);
    var lnTenGod = Gods.getTenGod(dmStem, ln.stem);

    // 1. Liu Nian Ten God influence
    var tenGodEffects = {
      '正官': { general: 8, love: 12, career: 10, desc: '正官流年，事业有进展，感情有归宿' },
      '七杀': { general: -3, career: 8, health: -8, desc: '七杀流年，压力增大，挑战与机遇并存' },
      '正财': { general: 6, wealth: 12, love: 5, desc: '正财流年，财运稳定，适合积累财富' },
      '偏财': { general: 4, wealth: 8, desc: '偏财运佳，但波动较大，宜见好就收' },
      '食神': { general: 7, love: 5, health: 5, desc: '食神流年，心情愉悦，创造力强' },
      '伤官': { general: -2, career: -3, desc: '伤官流年，言辞犀利，需注意口舌是非' },
      '正印': { general: 8, career: 6, health: 5, desc: '正印流年，学习运佳，得贵人赏识' },
      '偏印': { general: 3, desc: '偏印流年，适合研究深造，但人际关系稍弱' },
      '比肩': { general: 3, wealth: -3, desc: '比肩流年，竞争激烈，需防破财' },
      '劫财': { general: -5, wealth: -8, desc: '劫财流年，注意财务纠纷和朋友借钱' }
    };

    var tgEffect = tenGodEffects[lnTenGod] || { general: 0, desc: '' };
    score += tgEffect.general || 0;
    if (tgEffect.love) categories.love.score += tgEffect.love;
    if (tgEffect.career) categories.career.score += tgEffect.career;
    if (tgEffect.wealth) categories.wealth.score += tgEffect.wealth;
    if (tgEffect.health) categories.health.score += tgEffect.health;
    if (tgEffect.desc) highlights.push(tgEffect.desc);

    // 2. Liu Nian branch interactions with each pillar
    var pillarNames = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' };
    var pillars = ['year', 'month', 'day', 'hour'];

    pillars.forEach(function(p) {
      var pBranch = bazi[p].branch.char;
      if (BRANCH_CLASH[ln.branch.char] === pBranch) {
        score -= 8;
        categories.health.score -= 6;
        warnings.push('流年冲' + pillarNames[p] + '（' + ln.branch.char + '冲' + pBranch + '），' + pillarNames[p] + '所主之事有变动');
        if (p === 'day') { categories.health.score -= 8; warnings.push('日柱逢冲，自身或配偶健康需特别注意'); }
        if (p === 'month') { categories.career.score -= 5; warnings.push('月柱逢冲，工作环境或家庭有变动'); }
        if (p === 'year') { categories.career.score -= 3; warnings.push('年柱逢冲，长辈健康或家宅不宁'); }
      }
      if (BRANCH_COMBO[ln.branch.char] === pBranch) {
        score += 5;
        categories.love.score += 8;
        highlights.push('流年合' + pillarNames[p] + '（' + ln.branch.char + '合' + pBranch + '），' + pillarNames[p] + '和谐顺遂');
      }
      if (BRANCH_HARM[ln.branch.char] === pBranch) {
        score -= 4;
        warnings.push('流年害' + pillarNames[p] + '，小心暗中有小人或隐忧');
      }
      if (ln.branch.char === pBranch) {
        // 伏吟
        score -= 2;
        if (p === 'day') { categories.health.score -= 4; warnings.push('日柱伏吟，情绪低落反复，注意身心健康'); }
      }
    });

    // 3. Tai Sui
    if (ln.branch.char === bazi.year.branch.char) {
      score -= 5;
      warnings.push('值太岁（本命年），诸事需谨慎，宜低调行事');
    }
    if (BRANCH_CLASH[ln.branch.char] === bazi.year.branch.char) {
      score -= 7;
      warnings.push('冲太岁，变动较大的一年，不宜做重大决策');
    }

    // 4. Favorable/unfavorable element check
    var strength = Core.assessDayMasterStrength(bazi, Core.tallyFiveElements(bazi));
    if (strength.favorable.indexOf(ln.stem.element) >= 0) {
      score += 8;
      highlights.push('流年天干' + ln.stem.char + '为喜用神' + ln.stem.element + '，运势加分');
      categories.career.score += 5;
      categories.wealth.score += 5;
    }
    if (strength.unfavorable.indexOf(ln.stem.element) >= 0) {
      score -= 6;
      warnings.push('流年天干' + ln.stem.char + '为忌神' + ln.stem.element + '，需加小心');
      categories.health.score -= 3;
    }

    // 5. Da Yun + Liu Nian combined effect
    if (dayunForYear) {
      var dyElem = dayunForYear.stem.element;
      if (strength.favorable.indexOf(dyElem) >= 0 && strength.favorable.indexOf(ln.stem.element) >= 0) {
        score += 5;
        highlights.push('大运与流年皆为喜用，此年运势极佳');
      }
      if (strength.unfavorable.indexOf(dyElem) >= 0 && strength.unfavorable.indexOf(ln.stem.element) >= 0) {
        score -= 5;
        warnings.push('大运与流年皆为忌神，此年压力倍增');
      }
    }

    // Clamp scores
    var clamp = function(s) { return Math.max(10, Math.min(95, s)); };
    score = clamp(score);
    ['love','career','wealth','health'].forEach(function(c) {
      categories[c].score = clamp(categories[c].score);
    });

    // Overall rating
    var rating;
    if (score >= 72) rating = '大吉';
    else if (score >= 60) rating = '吉';
    else if (score >= 48) rating = '平';
    else if (score >= 35) rating = '凶';
    else rating = '大凶';

    return {
      year: targetYear,
      liuNian: ln,
      tenGod: lnTenGod,
      score: score,
      rating: rating,
      highlights: highlights,
      warnings: warnings,
      categories: categories
    };
  }

  // ─── Score Multiple Years ───
  function scoreMultipleYears(bazi, dayun, age, birthYear, birthMonth, birthDay, numYears) {
    var currentYear = new Date().getFullYear();
    var years = [];
    for (var i = -1; i < numYears; i++) {
      var targetYear = currentYear + i;
      var targetAge = age + (targetYear - currentYear);
      var dy = getCurrentDaYun(dayun, targetAge);
      years.push(scoreYear(bazi, dayun, targetAge, targetYear, dy));
    }
    return years;
  }

  // ─── Analyze Liu Nian Interactions (for current year detail) ───
  function analyzeLiuNianInteraction(bazi, liuNian, currentDayun) {
    var analysis = [];
    var dmStem = bazi.day.stem;
    var lnTenGod = Gods.getTenGod(dmStem, liuNian.stem);
    analysis.push({ type: 'info', text: '流年天干「' + liuNian.stem.char + '」为日主之' + lnTenGod + '（' + liuNian.stem.element + '）' });

    var pillarNames = { year: '年柱', month: '月柱', day: '日柱', hour: '时柱' };
    ['year', 'month', 'day', 'hour'].forEach(function(p) {
      var bBranch = bazi[p].branch.char;
      if (BRANCH_CLASH[liuNian.branch.char] === bBranch) {
        analysis.push({ type: 'clash', text: '流年「' + liuNian.branch.char + '」冲' + pillarNames[p] + '「' + bBranch + '」，' + pillarNames[p] + '所属领域必有变动' });
      }
      if (liuNian.branch.char === bBranch) {
        analysis.push({ type: 'same', text: '流年「' + liuNian.branch.char + '」与' + pillarNames[p] + '伏吟，此方面事务反复需耐心' });
      }
      if (BRANCH_COMBO[liuNian.branch.char] === bBranch) {
        analysis.push({ type: 'good', text: '流年「' + liuNian.branch.char + '」合' + pillarNames[p] + '「' + bBranch + '」，此领域和谐顺遂' });
      }
    });

    if (liuNian.branch.char === bazi.year.branch.char) {
      analysis.push({ type: 'warning', text: '本年值太岁（本命年），诸事需谨慎，宜安分守己、多行善事' });
    }
    if (BRANCH_CLASH[liuNian.branch.char] === bazi.year.branch.char) {
      analysis.push({ type: 'warning', text: '本年冲太岁，变动剧烈，宜静不宜动，尤其注意安全和健康' });
    }

    if (currentDayun) {
      var dyTenGod = Gods.getTenGod(dmStem, currentDayun.stem);
      analysis.push({ type: 'info', text: '当前大运「' + currentDayun.stem.char + currentDayun.branch.char + '」（' + currentDayun.nayin + '），十神为' + dyTenGod });
    }

    return analysis;
  }

  // ─── Find special years for love/marriage ───
  function findLoveYears(bazi, dayun, age, yearsAhead) {
    var currentYear = new Date().getFullYear();
    var loveYears = [];
    var dmStem = bazi.day.stem;
    var shensha = Gods.calculateShenSha(bazi);
    var hasHongLuan = shensha.some(function(s) { return s.name === '红鸾'; });

    for (var i = 0; i < yearsAhead; i++) {
      var y = currentYear + i;
      var targetAge = age + i;
      var ln = calculateLiuNian(y);
      var dy = getCurrentDaYun(dayun, targetAge);
      var lnTG = Gods.getTenGod(dmStem, ln.stem);

      var loveScore = 0;
      var reasons = [];

      // 正官/七杀 for women, 正财/偏财 for men
      var loveGods = ['正官', '七杀', '正财', '偏财'];
      if (loveGods.indexOf(lnTG) >= 0) {
        loveScore += 3;
        reasons.push(lnTG + '星现于流年');
      }

      // Peach blossom years
      var taoHuaMap = { '申':'酉','子':'酉','辰':'酉','寅':'卯','午':'卯','戌':'卯','巳':'午','酉':'午','丑':'午','亥':'子','卯':'子','未':'子' };
      if (taoHuaMap[ln.branch.char] && [bazi.year.branch.char, bazi.day.branch.char].indexOf(taoHuaMap[ln.branch.char]) < 0) {
        // Check if any pillar branch triggers peach blossom
      }

      // Branch combo with day branch
      if (BRANCH_COMBO[ln.branch.char] === bazi.day.branch.char) {
        loveScore += 4;
        reasons.push('流年地支合日柱（天地合德）');
      }

      // Hong Luan years
      if (hasHongLuan) {
        var hongLuanBranch = ({ '子':'卯','丑':'寅','寅':'丑','卯':'子','辰':'亥','巳':'戌','午':'酉','未':'申','申':'未','酉':'午','戌':'巳','亥':'辰' })[bazi.year.branch.char];
        if (ln.branch.char === hongLuanBranch) {
          loveScore += 5;
          reasons.push('红鸾星动');
        }
      }

      if (loveScore >= 3) {
        loveYears.push({ year: y, score: loveScore, reasons: reasons, liuNian: ln });
      }
    }

    loveYears.sort(function(a, b) { return b.score - a.score; });
    return loveYears;
  }

  // ─── Detect clash branches ───
  function detectBranchClashes(bazi) {
    var clashPairs = [['子','午'],['丑','未'],['寅','申'],['卯','酉'],['辰','戌'],['巳','亥']];
    var pillars = ['year', 'month', 'day', 'hour'];
    var clashes = [];
    for (var i = 0; i < pillars.length; i++) {
      for (var j = i + 1; j < pillars.length; j++) {
        var b1 = bazi[pillars[i]].branch.char;
        var b2 = bazi[pillars[j]].branch.char;
        for (var k = 0; k < clashPairs.length; k++) {
          if ((clashPairs[k][0] === b1 && clashPairs[k][1] === b2) || (clashPairs[k][0] === b2 && clashPairs[k][1] === b1)) {
            clashes.push({ pillar1: pillars[i], pillar2: pillars[j], branch1: b1, branch2: b2 });
          }
        }
      }
    }
    return clashes;
  }

  function detectBranchCombinations(bazi) {
    var comboPairs = [['子','丑'],['寅','亥'],['卯','戌'],['辰','酉'],['巳','申'],['午','未']];
    var pillars = ['year', 'month', 'day', 'hour'];
    var combos = [];
    for (var i = 0; i < pillars.length; i++) {
      for (var j = i + 1; j < pillars.length; j++) {
        var b1 = bazi[pillars[i]].branch.char;
        var b2 = bazi[pillars[j]].branch.char;
        for (var k = 0; k < comboPairs.length; k++) {
          if ((comboPairs[k][0] === b1 && comboPairs[k][1] === b2) || (comboPairs[k][0] === b2 && comboPairs[k][1] === b1)) {
            combos.push({ pillar1: pillars[i], pillar2: pillars[j], branch1: b1, branch2: b2 });
          }
        }
      }
    }
    return combos;
  }

  return {
    getDaYunDirection: getDaYunDirection,
    calculateDaYun: calculateDaYun,
    calculateLiuNian: calculateLiuNian,
    getCurrentDaYun: getCurrentDaYun,
    scoreYear: scoreYear,
    scoreMultipleYears: scoreMultipleYears,
    findLoveYears: findLoveYears,
    analyzeLiuNianInteraction: analyzeLiuNianInteraction,
    detectBranchClashes: detectBranchClashes,
    detectBranchCombinations: detectBranchCombinations,
    daysBetween: daysBetween,
    daysToSolarTerm: daysToSolarTerm,
    BRANCH_CLASH: BRANCH_CLASH,
    BRANCH_COMBO: BRANCH_COMBO
  };
})();
