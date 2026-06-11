/* ===== Gods & Stars — Ten Gods, Shen Sha, Pattern Analysis, Detailed Interpretation ===== */
window.GodsStars = (function() {
  'use strict';

  var Core = window.BaziCore;

  // ─── Element Relations ───
  var GEN_CYCLE = ['木','火','土','金','水'];
  var OVERCOME_MAP = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
  var GENERATED_BY = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };

  function getElementRelation(fromElem, toElem) {
    if (fromElem === toElem) return 'same';
    var fromIdx = GEN_CYCLE.indexOf(fromElem);
    var toIdx = GEN_CYCLE.indexOf(toElem);
    var diff = (toIdx - fromIdx + 5) % 5;
    if (diff === 1) return 'generateTo';
    if (diff === 2) return 'overcomeTo';
    if (diff === 3) return 'overcomeFrom';
    return 'generateFrom';
  }

  // ─── Ten Gods (十神) Calculation ───
  function getTenGod(dayMasterStem, otherStem) {
    var dm = dayMasterStem;
    var ot = otherStem;
    var rel = getElementRelation(dm.element, ot.element);
    var sameYY = (dm.yinYang === ot.yinYang);
    if (rel === 'same')       return sameYY ? '比肩' : '劫财';
    if (rel === 'generateTo') return sameYY ? '食神' : '伤官';
    if (rel === 'overcomeTo') return sameYY ? '偏财' : '正财';
    if (rel === 'overcomeFrom') return sameYY ? '七杀' : '正官';
    if (rel === 'generateFrom') return sameYY ? '偏印' : '正印';
    return '';
  }

  function getAllTenGods(bazi) {
    var dmStem = bazi.day.stem;
    var pillars = ['year', 'month', 'day', 'hour'];
    var result = {};
    pillars.forEach(function(p) {
      result[p] = {
        stemGod: getTenGod(dmStem, bazi[p].stem),
        branchGod: getTenGod(dmStem, bazi[p].branch)
      };
    });
    result.day.stemGod = '日主';
    return result;
  }

  // ─── Shen Sha (神煞) Calculation ───
  function calculateShenSha(bazi) {
    var results = [];
    var yearBranch = bazi.year.branch.char;
    var monthBranch = bazi.month.branch.char;
    var dayBranch = bazi.day.branch.char;
    var hourBranch = bazi.hour.branch.char;
    var yearStem = bazi.year.stem.char;
    var monthStem = bazi.month.stem.char;
    var dayStem = bazi.day.stem.char;
    var hourStem = bazi.hour.stem.char;
    var allBranches = [yearBranch, monthBranch, dayBranch, hourBranch];
    var allStems = [yearStem, monthStem, dayStem, hourStem];

    var starDefs = [
      { name: '天乙贵人', type: 'auspicious', desc: '命中最大的吉星，遇难有救、逢凶化吉。有此星者一生必有贵人相助，危难时刻总能化险为夷。' },
      { name: '太极贵人', type: 'auspicious', desc: '主聪明好学，有玄学天赋，对神秘事物有浓厚兴趣。思维敏捷，洞察力强。' },
      { name: '文昌贵人', type: 'auspicious', desc: '主文采出众、学业优异。考试运极佳，适合从事文化、教育、学术研究等工作。' },
      { name: '桃花', type: 'neutral', desc: '异性缘佳，人缘好，有艺术气质和审美天赋。但需防感情纠葛和烂桃花。' },
      { name: '驿马', type: 'neutral', desc: '主奔波劳碌，宜动不宜静。适合外出发展、异地求财。马星动则有变，变动之中有生机。' },
      { name: '华盖', type: 'neutral', desc: '性情清高孤傲，有艺术和哲学才华，与宗教玄学有不解之缘。聪慧但有时孤独。' },
      { name: '羊刃', type: 'inauspicious', desc: '性格刚烈、争强好胜，易冲动行事。需防意外血光、手术外伤，宜加强安全意识和情绪管理。' },
      { name: '天德贵人', type: 'auspicious', desc: '心地善良，福泽深厚。危难之时有上天庇佑，一生少有大灾大难，化戾气为祥和。' },
      { name: '月德贵人', type: 'auspicious', desc: '性格温和包容，人缘极佳。得长辈提携、异性助力，人际关系和谐顺畅。' },
      { name: '孤辰', type: 'inauspicious', desc: '性格偏向孤僻内向，六亲缘分相对淡薄。婚姻感情方面需要更多包容与经营。' },
      { name: '金舆', type: 'auspicious', desc: '主有车缘、出行便利。也象征生活富足，有一定的社会地位和物质享受。' },
      { name: '禄神', type: 'auspicious', desc: '主衣食丰足、福禄双全。一生不愁温饱，有稳定的生活保障和经济来源。' },
      { name: '魁罡', type: 'neutral', desc: '性格刚直果决、聪明果断，有领导才能。但锋芒毕露，需注意收敛锐气，圆融处世。' },
      { name: '三奇贵人', type: 'auspicious', desc: '命带三奇，天赋异禀、才华出众。一生注定不凡，在某个领域有超乎常人的成就。' },
      { name: '红鸾', type: 'auspicious', desc: '正桃花星，主婚恋之喜。感情真挚美满，容易遇到真心相爱的伴侣。' },
      { name: '天喜', type: 'auspicious', desc: '喜事临门、添丁进口。此星动则有吉庆之事，尤以婚嫁、生子、乔迁等喜事为应。' }
    ];

    // Check each star
    var checkFns = {
      '天乙贵人': function() {
        var map = { '甲':['丑','未'],'戊':['丑','未'],'庚':['丑','未'], '乙':['子','申'],'己':['子','申'], '丙':['亥','酉'],'丁':['亥','酉'], '壬':['巳','卯'],'癸':['巳','卯'], '辛':['午','寅'] };
        var branches = map[dayStem] || [];
        return branches.some(function(b) { return allBranches.indexOf(b) >= 0; });
      },
      '太极贵人': function() {
        var map = { '甲':['子','午'],'乙':['子','午'], '丙':['卯','酉'],'丁':['卯','酉'], '戊':['辰','戌','丑','未'],'己':['辰','戌','丑','未'], '庚':['寅','亥'],'辛':['寅','亥'], '壬':['巳','申'],'癸':['巳','申'] };
        return (map[dayStem] || []).some(function(b) { return allBranches.indexOf(b) >= 0; });
      },
      '文昌贵人': function() {
        var map = { '甲':'巳','乙':'午','丙':'申','丁':'酉','戊':'申','己':'酉','庚':'亥','辛':'子','壬':'寅','癸':'卯' };
        return allBranches.indexOf(map[dayStem]) >= 0;
      },
      '桃花': function() {
        var map = { '申':'酉','子':'酉','辰':'酉','寅':'卯','午':'卯','戌':'卯','巳':'午','酉':'午','丑':'午','亥':'子','卯':'子','未':'子' };
        return allBranches.indexOf(map[dayBranch]) >= 0;
      },
      '驿马': function() {
        var map = { '申':'寅','子':'寅','辰':'寅','寅':'申','午':'申','戌':'申','巳':'亥','酉':'亥','丑':'亥','亥':'巳','卯':'巳','未':'巳' };
        return allBranches.indexOf(map[dayBranch]) >= 0;
      },
      '华盖': function() {
        var map = { '申':'辰','子':'辰','辰':'辰','寅':'戌','午':'戌','戌':'戌','巳':'丑','酉':'丑','丑':'丑','亥':'未','卯':'未','未':'未' };
        return allBranches.indexOf(map[dayBranch]) >= 0;
      },
      '羊刃': function() {
        var map = { '甲':'卯','丙':'午','戊':'午','庚':'酉','壬':'子','乙':'辰','丁':'未','己':'未','辛':'戌','癸':'丑' };
        return allBranches.indexOf(map[dayStem]) >= 0;
      },
      '天德贵人': function() {
        var map = { '寅':'丁','卯':'申','辰':'壬','巳':'辛','午':'亥','未':'甲','申':'癸','酉':'寅','戌':'丙','亥':'乙','子':'巳','丑':'庚' };
        var stem = map[monthBranch];
        return stem && allStems.indexOf(stem) >= 0;
      },
      '月德贵人': function() {
        var map = { '寅':'丙','卯':'甲','辰':'壬','巳':'庚','午':'丙','未':'甲','申':'壬','酉':'庚','戌':'丙','亥':'甲','子':'壬','丑':'庚' };
        var stem = map[monthBranch];
        return stem && allStems.indexOf(stem) >= 0;
      },
      '孤辰': function() {
        var map = { '亥':'寅','子':'寅','丑':'寅','寅':'巳','卯':'巳','辰':'巳','巳':'申','午':'申','未':'申','申':'亥','酉':'亥','戌':'亥' };
        return allBranches.indexOf(map[yearBranch]) >= 0;
      },
      '金舆': function() {
        var map = { '甲':'辰','乙':'巳','丙':'未','丁':'申','戊':'未','己':'申','庚':'戌','辛':'亥','壬':'丑','癸':'寅' };
        return allBranches.indexOf(map[dayStem]) >= 0;
      },
      '禄神': function() {
        var map = { '甲':'寅','乙':'卯','丙':'巳','丁':'午','戊':'巳','己':'午','庚':'申','辛':'酉','壬':'亥','癸':'子' };
        return allBranches.indexOf(map[dayStem]) >= 0;
      },
      '魁罡': function() {
        return ['壬辰','庚辰','庚戌','戊戌'].indexOf(dayStem + dayBranch) >= 0;
      },
      '三奇贵人': function() {
        var allStemChars = [yearStem, monthStem, dayStem];
        var wonders = [['甲','戊','庚'],['乙','丙','丁'],['壬','癸','辛']];
        return wonders.some(function(w) { return w.every(function(s) { return allStemChars.indexOf(s) >= 0; }); });
      },
      '红鸾': function() {
        var map = { '子':'卯','丑':'寅','寅':'丑','卯':'子','辰':'亥','巳':'戌','午':'酉','未':'申','申':'未','酉':'午','戌':'巳','亥':'辰' };
        return allBranches.indexOf(map[yearBranch]) >= 0;
      },
      '天喜': function() {
        var map = { '子':'酉','丑':'申','寅':'未','卯':'午','辰':'巳','巳':'辰','午':'卯','未':'寅','申':'丑','酉':'子','戌':'亥','亥':'戌' };
        return allBranches.indexOf(map[yearBranch]) >= 0;
      }
    };

    starDefs.forEach(function(def) {
      if (checkFns[def.name] && checkFns[def.name]()) {
        results.push(def);
      }
    });

    results.sort(function(a, b) {
      var order = { 'auspicious': 0, 'neutral': 1, 'inauspicious': 2 };
      return order[a.type] - order[b.type];
    });

    return results;
  }

  // ─── Element Balance Analysis ───
  function analyzeElementBalance(tally, bazi) {
    var elements = ['木','火','土','金','水'];
    var total = 0;
    elements.forEach(function(e) { total += tally[e]; });
    var analysis = [];
    elements.forEach(function(e) {
      var pct = total > 0 ? (tally[e] / total * 100) : 20;
      var status;
      if (pct > 35) status = '过旺';
      else if (pct > 22) status = '偏旺';
      else if (pct > 12) status = '适中';
      else if (pct > 5) status = '偏弱';
      else status = '过弱';
      analysis.push({ element: e, count: tally[e], percentage: pct, status: status });
    });
    return analysis;
  }

  // ─── Pattern / 格局 Analysis ───
  function analyzePattern(bazi, tenGods, strength) {
    var monthStemGod = tenGods.month.stemGod;
    var dmStem = bazi.day.stem;
    var monthBranch = bazi.month.branch.char;

    // Determine primary pattern from month stem Ten God
    var patternMap = {
      '正官': '正官格', '七杀': '七杀格', '正财': '正财格', '偏财': '偏财格',
      '食神': '食神格', '伤官': '伤官格', '正印': '正印格', '偏印': '偏印格',
      '比肩': '建禄格', '劫财': '月刃格'
    };
    var primaryPattern = patternMap[monthStemGod] || monthStemGod + '格';

    // Check for special patterns
    var specialPatterns = [];
    var score = strength.score;

    // 从格判断
    if (score <= 0.15) {
      // Very weak - check following patterns
      var allTenGods = [];
      ['year','month','hour'].forEach(function(p) {
        allTenGods.push(tenGods[p].stemGod);
      });
      var officerCount = allTenGods.filter(function(g) { return g === '正官' || g === '七杀'; }).length;
      var wealthCount = allTenGods.filter(function(g) { return g === '正财' || g === '偏财'; }).length;
      var outputCount = allTenGods.filter(function(g) { return g === '食神' || g === '伤官'; }).length;

      if (officerCount >= 2 && wealthCount >= 1) specialPatterns.push('从官杀格');
      else if (wealthCount >= 3) specialPatterns.push('从财格');
      else if (outputCount >= 2 && officerCount === 0) specialPatterns.push('从儿格');
      else specialPatterns.push('从弱格');
    } else if (score >= 0.80) {
      specialPatterns.push('从强格');
    }

    // 魁罡格
    if (['壬辰','庚辰','庚戌','戊戌'].indexOf(dmStem.char + bazi.day.branch.char) >= 0) {
      specialPatterns.push('魁罡格');
    }

    // Generate pattern description
    var descriptions = {
      '正官格': '正官格是子平八字中最正派的格局之一。命主品行端正，遵纪守法，有责任心和管理才能。为人正直诚实，适合在体制内或大型企业担任管理职务。一生追求稳定和秩序，做事有板有眼，深得上下级信任。',
      '七杀格': '七杀格主权威和决断力。命主个性鲜明，敢作敢为，具有开拓精神和领导力。如同乱世中的英雄，能在压力下迸发出惊人的能量。适合军警、法律、外科医生、企业高管等需要果决判断的职业。',
      '正财格': '正财格主稳定的财富来源。命主对金钱有谨慎务实的态度，善于积累财富，不喜冒险。适合从事金融、会计、贸易等与钱财打交道的行业。一生财运稳定，靠勤劳和智慧获取正当收入。',
      '偏财格': '偏财格主意外之财和商业头脑。命主头脑灵活，善于把握商机，有投资眼光和经商天赋。不喜朝九晚五的固定工作，适合创业、投资、自由职业。财运起伏较大，但总体来看容易获得超出常人的财富。',
      '食神格': '食神格主才华和享受。命主天资聪颖，有艺术天赋和创造力，性格温和乐观，喜爱美食和生活享受。适合从事设计、艺术、美食、文化创意等行业。' + (strength.level === '身强' ? '才华能够得到充分发挥' : '需要注意才华与现实的平衡'),
      '伤官格': '伤官格主聪明才智和不拘一格的个性。命主思维敏捷、口才出众，有独特的见解和创新能力。但不喜束缚，有时锋芒过露。适合创意、演艺、策划、咨询等需要智慧和表达的工作。',
      '正印格': '正印格主学识和贵气。命主心地善良，重视精神修养，有慈悲心和包容心。学习能力强，适合教育、研究、文化、公益等领域。一生多得贵人相助，精神世界丰富而深邃。',
      '偏印格': '偏印格主特殊的智慧和领悟力。命主思维独特，善于钻研玄学、哲学、科技等小众领域。有第六感和直觉力，不随波逐流。适合科研、技术、玄学、心理学等需要深度思考的工作。',
      '建禄格': '建禄格日主有根，生命力强韧。命主性格独立自主，不轻易依赖他人。有实干精神，通过自身努力获取成就。一生运势平稳向上，属于稳扎稳打型的人生。',
      '月刃格': '月刃格个性刚强，不轻易妥协。命主有强烈的自我意识，竞争力强，适合在竞争激烈的领域中脱颖而出。但需注意人际关系，避免因过于强势而树敌。'
    };

    var patternDesc = descriptions[primaryPattern] || '此命格结构独特，需要结合具体的五行生克和大运流年综合判断。日主为' + dmStem.char + '，月令透出' + monthStemGod + '，格局清浊取决于整体配合。';

    // Add special pattern notes
    var specialDesc = '';
    if (specialPatterns.length > 0) {
      specialDesc = '\n\n此命同时带有特殊格局：' + specialPatterns.join('、') + '。';
      if (specialPatterns.indexOf('从弱格') >= 0) specialDesc += '从弱格意味着日主极弱，反而需要顺势而为，不宜强行补益。喜用神为克制日主的五行，一生运势随大运中克制五行的强弱而起落。';
      if (specialPatterns.indexOf('从强格') >= 0) specialDesc += '从强格日主极旺，气势如虹，一生宜顺势而行。喜生扶日主的五行，忌克制。运势在上坡路上越走越强。';
      if (specialPatterns.indexOf('魁罡格') >= 0) specialDesc += '魁罡入命，性格刚毅果决，人群中自然成为焦点和决策者。但大运流年中若见官杀混杂，易有波折，需以柔克刚。';
    }

    return {
      primaryPattern: primaryPattern,
      specialPatterns: specialPatterns,
      description: patternDesc + specialDesc,
      monthStemGod: monthStemGod
    };
  }

  // ─── Detailed Fate Interpretation ───
  function generateFateSummary(bazi, tenGods, strength, pattern, shensha, elementAnalysis) {
    var dm = bazi.day.stem;
    var parts = [];

    // Part 1: Core identity
    parts.push('日主' + dm.char + '（' + dm.element + '，' + dm.yinYang + '），生于' + bazi.month.branch.char + '月。');
    parts.push('命格为' + pattern.primaryPattern + '，日主' + strength.level + '（评分' + (strength.score * 100).toFixed(0) + '分）。');

    // Part 2: Element description
    var elemDesc = {
      '木': '木主仁，有生长升发之性。木命之人如参天大树，心地仁慈，有向上的生命力和创造力。',
      '火': '火主礼，有炎热向上之性。火命之人热情奔放，待人礼貌周到，行动力强，有感染力。',
      '土': '土主信，有承载生化之性。土命之人诚信敦厚，稳重可靠，包容力强，是最踏实的朋友和伙伴。',
      '金': '金主义，有肃杀变革之性。金命之人刚毅果断，重义轻利，有原则和底线，做事雷厉风行。',
      '水': '水主智，有润下流动之性。水命之人聪慧灵活，适应力强，善于变通，有着深邃的内心世界。'
    };
    parts.push(elemDesc[dm.element] || '');

    // Part 3: Strength analysis
    parts.push('命局喜' + strength.favorable.join('、') + '，忌' + strength.unfavorable.join('、') + '。');

    if (strength.level === '身强') {
      parts.push('身强者精力充沛，抗压能力强，适合承担重任。但需注意性格可能过于强势，适当收敛锋芒反而能让路走得更宽。');
    } else if (strength.level === '身弱') {
      parts.push('身弱者虽体力精力有限，但心思细腻、善察人意。适合借力而行，善用贵人资源和团队合作来放大自己的力量。');
    } else {
      parts.push('命局中和，刚柔并济。这是难得的好格局，能够灵活应对各种人生境遇，可进可退，收放自如。');
    }

    // Part 4: Shensha highlights
    var auspicious = shensha.filter(function(s) { return s.type === 'auspicious'; });
    var inauspicious = shensha.filter(function(s) { return s.type === 'inauspicious'; });

    if (auspicious.length > 0) {
      parts.push('命中带有' + auspicious.map(function(s) { return s.name; }).join('、') + '等吉星，');
      if (auspicious.some(function(s) { return s.name === '天乙贵人'; })) {
        parts.push('天乙贵人入命是最大的福气，一生遇难成祥、逢凶化吉，无论走到哪里都有贵人伸出援手。');
      }
    }

    if (inauspicious.length > 0) {
      parts.push('也需注意' + inauspicious.map(function(s) { return s.name; }).join('、') + '的影响，');
      parts.push('了解自身的短板才能在人生旅途中趋吉避凶。');
    }

    // Part 5: Element balance
    var maxElem = null, minElem = null, maxPct = 0, minPct = 100;
    elementAnalysis.forEach(function(ea) {
      if (ea.percentage > maxPct) { maxPct = ea.percentage; maxElem = ea; }
      if (ea.percentage < minPct) { minPct = ea.percentage; minElem = ea; }
    });

    if (maxElem && minElem) {
      parts.push('五行之中' + maxElem.element + '最旺（' + maxElem.status + '），' + minElem.element + '最弱（' + minElem.status + '）。');
      var balanceAdvice = {
        '木': '多亲近自然，家中种植绿色植物，穿着青色系服饰有助于平衡',
        '火': '多参与社交活动，保持积极热情的心态，接触红色系的事物',
        '土': '注重脚踏实地，多接触大地和自然，穿着黄色系可增强土的能量',
        '金': '佩戴金属饰品，保持果断的行动力，白色和金色的环境对你有益',
        '水': '多饮水，亲近水域，保持思维的灵动和柔软，蓝色和黑色是最佳选择'
      };
      parts.push('日常生活中' + (balanceAdvice[minElem.element] || '') + '。');
    }

    return parts.join('');
  }

  // ─── Public API ───
  return {
    getTenGod: getTenGod,
    getAllTenGods: getAllTenGods,
    calculateShenSha: calculateShenSha,
    analyzeElementBalance: analyzeElementBalance,
    analyzePattern: analyzePattern,
    generateFateSummary: generateFateSummary,
    getElementRelation: getElementRelation,
    GEN_CYCLE: GEN_CYCLE,
    OVERCOME_MAP: OVERCOME_MAP,
    GENERATED_BY: GENERATED_BY
  };
})();
