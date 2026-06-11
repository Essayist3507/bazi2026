/* ===== Predictions — 专业术语为骨 · 情绪刺痛为刃 · 心理闭环引擎 ===== */
window.Predictions = (function() {
  'use strict';

  var Core = window.BaziCore;
  var Gods = window.GodsStars;
  var DaYun = window.DaYun;

  // ─── Helpers ───
  function ratingBadge(r) {
    var c = { '大吉':'#4ade80','吉':'#60a5fa','平':'#fbbf24','凶':'#f87171','大凶':'#ef4444' };
    return '<span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:0.85rem;font-weight:600;background:'+(c[r]||'#6b7280')+'20;color:'+(c[r]||'#6b7280')+';border:1px solid '+(c[r]||'#6b7280')+'40">'+r+'</span>';
  }
  function ec(e) {
    var m = { '木':'#4ade80','火':'#f87171','土':'#fbbf24','金':'#e2e8f0','水':'#60a5fa' };
    return m[e]||'#9ca3af';
  }
  function tc(c) { return '<span style="color:'+ec(c)+';font-weight:600">'+c+'</span>'; }

  // ─── Emotional Block Templates ───
  function stingBlock(pain) { return '<div class="emo-block sting"><div class="emo-icon">⚡</div><p>'+pain+'</p></div>'; }
  function explainBlock(text) { return '<div class="emo-block explain"><div class="emo-icon">☯</div><p>'+text+'</p></div>'; }
  function wayBlock(text) { return '<div class="emo-block way"><div class="emo-icon">🔑</div><p>'+text+'</p></div>'; }
  function promiseBlock(text) { return '<div class="emo-block promise"><div class="emo-icon">✨</div><p>'+text+'</p></div>'; }

  // ─── Professional diagnosis header block ───
  function diagBlock(title, text) {
    return '<div class="diag-block"><div class="diag-title">'+title+'</div><div class="diag-body">'+text+'</div></div>';
  }

  // ─── Get all pillar interactions for a year ───
  function getYearInteractions(bazi, yearBranch) {
    var interactions = [];
    var pillarNames = { year:'年柱', month:'月柱', day:'日柱', hour:'时柱' };
    var pillars = ['year','month','day','hour'];
    pillars.forEach(function(p) {
      var pBranch = bazi[p].branch.char;
      if (pBranch === yearBranch && p === 'day') {
        interactions.push({ type:'warn', term:'日柱伏吟', text:'流年与日柱伏吟——你内心深处会反复思量同一件事，情绪如潮水般起伏，夜深人静时尤为明显。这不是"想太多"，而是流年能量在搅动你的根基。' });
      } else if (pBranch === yearBranch) {
        interactions.push({ type:'warn', term:pillarNames[p]+'伏吟', text:pillarNames[p]+'伏吟——该宫位所主之事容易出现反复、停滞。' });
      }
    });
    return interactions;
  }

  // ─── Explain Liu Nian branch interactions in professional terms ───
  function explainBranchInteractions(bazi, lnBranch, lnStem) {
    var parts = [];
    var pillarNames = { year:'年柱', month:'月柱', day:'日柱', hour:'时柱' };
    var pillars = ['year','month','day','hour'];

    // Tai Sui
    if (lnBranch === bazi.year.branch.char) {
      parts.push('<strong>值太岁</strong>——流年地支与年柱地支相同，古书云"太岁当头坐，无喜恐有祸"。你自身的能量场与流年能量场产生共振，这一年任何决定都会被放大——好的更好，坏的更坏。');
    }
    // Clash with Tai Sui
    var clashPairs = { '子':'午','午':'子','丑':'未','未':'丑','寅':'申','申':'寅','卯':'酉','酉':'卯','辰':'戌','戌':'辰','巳':'亥','亥':'巳' };
    if (clashPairs[lnBranch] === bazi.year.branch.char) {
      parts.push('<strong>冲太岁</strong>——流年地支与年柱相冲，乃变动之象。古诀云"太岁逢冲，十有九凶"。这一年你的人生可能面临重大转折——换工作、搬家、感情变故，看似突然实则命局早已注定。');
    }

    // Interactions with day branch (夫妻宫)
    var dayBranch = bazi.day.branch.char;
    if (lnBranch === dayBranch) {
      parts.push('<strong>流年伏吟日柱</strong>——日柱乃夫妻宫，亦代表你自身。伏吟者，如回音般反复。这一年你在感情和情绪层面会经历"循环播放"式的体验——某件事或某个人，反复出现在你的脑海里，挥之不去。');
    }
    if (clashPairs[lnBranch] === dayBranch) {
      parts.push('<strong>流年冲夫妻宫</strong>——日支逢冲，夫妻宫动荡不安。已婚者需防口舌争执、感情生变；单身者则可能在这一年遇到让你内心震动的人，但这段关系注定不会平淡。');
    }

    return parts.join('');
  }

  // ─── 1. Yearly Fortune (逐年运势) ───
  function generateYearlyFortune(bazi, dayun, age, birthYear, birthMonth, birthDay) {
    var years = DaYun.scoreMultipleYears(bazi, dayun, age, birthYear, birthMonth, birthDay, 8);
    var dm = bazi.day.stem;
    var strength = Core.assessDayMasterStrength(bazi, Core.tallyFiveElements(bazi));
    var tenGods = Gods.getAllTenGods(bazi);
    var shensha = Gods.calculateShenSha(bazi);
    var pattern = Gods.analyzePattern(bazi, tenGods, strength);
    var parts = [];

    parts.push('<h3>流年推演 · 逐年命程</h3>');
    parts.push('<p class="pred-intro">天不得时，日月无光；地不得时，草木不长；人不得时，利运不通。以下依你的命局格局，逐年推演天时流转——何年用神当令，何年忌神肆虐，一目了然。</p>');

    // ── Professional Diagnosis ──
    var diagnosisLines = [];
    diagnosisLines.push('命主日干<span style="color:'+ec(dm.element)+';font-weight:700">'+dm.char+'</span>（'+dm.element+'），生于'+bazi.month.branch.char+'月，月令透出<strong>'+tenGods.month.stemGod+'</strong>，入<strong>'+pattern.primaryPattern+'</strong>。');
    diagnosisLines.push('日主综合评定：<strong>'+strength.level+'</strong>（身强/身弱/中和三者居其一）。用神取<span style="color:'+ec(strength.favorable[0])+'">'+strength.favorable.join('、')+'</span>，忌神为<span style="color:'+ec(strength.unfavorable[0])+'">'+strength.unfavorable.join('、')+'</span>。');
    diagnosisLines.push('大运起于<strong>'+dayun.startAge+'岁</strong>，排运方向为<strong>'+dayun.direction+'</strong>。当前正行<strong>'+getCurrentDaYunLabel(dayun, age)+'</strong>。');
    diagnosisLines.push('命局核心矛盾：' + getCoreConflict(bazi, strength, tenGods, dm));
    parts.push(diagBlock('命局诊断', diagnosisLines.join('<br>')));

    // ── Sting: The Pattern ──
    var badYears = years.filter(function(y){ return y.rating === '凶' || y.rating === '大凶'; });
    var goodYears = years.filter(function(y){ return y.rating === '大吉' || y.rating === '吉'; });
    var stingIntro = '命盘已排定，天机已现。你面前的这条时间线，不是"运气的好坏"，而是<strong>用神与忌神的交替消长</strong>。';
    if (badYears.length > 0) {
      stingIntro += '其中有几年，流年天干地支恰好与你命局中的忌神同频——这并非上天在惩罚你，而是命局中早已写定的"逆风期"。';
    }
    if (badYears.length >= 2) {
      stingIntro += '如果你此刻正经历着某种"明明很努力却看不到结果"的无力感，请往下看——你会在下面的流年图谱中找到答案。';
    }
    parts.push(stingBlock(stingIntro));

    // ── Explanation ──
    var explainText = '<strong>格局解读：</strong>你的命局以<strong>'+pattern.primaryPattern+'</strong>立格。';
    if (strength.level === '身弱') {
      explainText += '日主偏弱，如小船行于江海——顺流而下则一日千里（行用神运），逆水行舟则寸步难行（逢忌神运）。你这一生，<strong>借势</strong>比<strong>用力</strong>更重要。';
    } else if (strength.level === '身强') {
      explainText += '日主强旺，如猛虎在山——有足够的能量去闯、去拼。但强极则亢，你需要忌神来"打磨"你，用神来"成就"你。运势的起伏不是好坏，是<strong>节奏</strong>。';
    } else {
      explainText += '日主中和，刚柔并济。这是难得的中和之象——你不会大起大落，人生如平缓的河流，稳中求进。但中和也意味着<strong>需要外力来打破平衡</strong>，流年的能量变化对你尤为关键。';
    }
    parts.push(explainBlock(explainText));

    // ── Yearly Cards with professional commentary ──
    parts.push('<div class="yearly-grid">');
    years.forEach(function(y, idx) {
      var ln = y.liuNian;
      var cls = { '大吉':'great','吉':'good','平':'neutral','凶':'bad','大凶':'terrible' }[y.rating]||'neutral';

      // Professional narrative for each year
      var narrative = buildYearNarrative(y, bazi, strength, ln);

      parts.push('<div class="year-card ' + cls + '">');
      parts.push('<div class="year-header"><span class="year-num">' + y.year + '</span> <span class="year-branch">' + ln.stem.char + ln.branch.char + '年</span> ' + ratingBadge(y.rating) + '</div>');
      parts.push('<div class="year-score-bar"><div class="year-score-fill" style="width:' + y.score + '%"></div></div>');
      parts.push('<div class="year-detail"><span style="color:' + ec(ln.stem.element) + '">' + ln.stem.element + '</span> · 流年十神：<strong>' + y.tenGod + '</strong> · 综合' + y.score + '分</div>');
      parts.push('<div class="year-narrative">' + narrative + '</div>');

      if (y.highlights.length > 0) {
        parts.push('<div class="year-highlights">');
        y.highlights.forEach(function(h) { parts.push('<div class="hl-item good">' + h + '</div>'); });
        parts.push('</div>');
      }
      if (y.warnings.length > 0) {
        parts.push('<div class="year-warnings">');
        y.warnings.forEach(function(w) { parts.push('<div class="hl-item warn">' + w + '</div>'); });
        parts.push('</div>');
      }

      // Category bars
      parts.push('<div class="year-cats">');
      var cats = { love:'感情', career:'事业', wealth:'财运', health:'健康' };
      Object.keys(cats).forEach(function(c) {
        var s = y.categories[c].score;
        var color = s >= 60 ? 'var(--green)' : s >= 45 ? 'var(--yellow)' : 'var(--red)';
        parts.push('<span class="cat-mini"><span class="cat-label">'+cats[c]+'</span><span class="cat-bar-wrap"><span class="cat-bar-fill" style="width:'+s+'%;background:'+color+'"></span></span><span class="cat-val">'+s+'</span></span>');
      });
      parts.push('</div>');
      parts.push('</div>');
    });
    parts.push('</div>');

    // ── Promise ──
    var bestYear = goodYears.length > 0 ? goodYears[0] : null;
    var promiseText = '<strong>命理总结：</strong>你的命局以<strong>'+strength.favorable.join('、')+'</strong>为用神。';
    if (goodYears.length >= 2) {
      promiseText += '当流年天干透出用神（'+goodYears[0].year+'年<strong>'+goodYears[0].liuNian.stem.char+'</strong>、'+goodYears[1].year+'年<strong>'+goodYears[1].liuNian.stem.char+'</strong>），你的运势将迎来质的飞跃。';
    }
    if (badYears.length > 0) {
      promiseText += '而'+badYears.map(function(y){return y.year;}).join('、')+'年，忌神当令——这些年份不是来摧毁你的，而是来<strong>筛掉</strong>你人生中不坚固的部分。渡劫之后，格局更清。';
    }
    promiseText += '命理不是宿命，是天时地图。地图在你手中，走哪条路——你说了算。';
    parts.push(promiseBlock(promiseText));

    return parts.join('\n');
  }

  // ── Build professional year narrative ──
  function buildYearNarrative(y, bazi, strength, ln) {
    var parts = [];
    var lnBranch = ln.branch.char;
    var lnStem = ln.stem.char;

    // Professional ten-god analysis
    var tgExplain = {
      '正官':'<strong>正官</strong>为克我之异性——这一年规则和秩序会进入你的生活。上司、官方、制度成为关键词。正官年是"被认可"的机会，也是"被约束"的考验。',
      '七杀':'<strong>七杀</strong>为克我之同性，攻身之力极强——这是你命中的"压力测试"。七杀年要么让你脱胎换骨，要么让你身心俱疲。关键在于：你有没有把压力变成动力。',
      '正财':'<strong>正财</strong>为我克之异性——稳定的财源正在形成。适合储蓄、谈薪资、做长期投资。但正财也代表"占有"——不要因为贪稳而错过机会。',
      '偏财':'<strong>偏财</strong>为我克之同性——意外之财、投资回报、副业收入。偏财年财运起伏大，来得快去得也快。见好就收是最高智慧。',
      '食神':'<strong>食神</strong>为我生之同性——你的才华和创造力会在这一年自然流露。食神生财，这是"躺着也能赚钱"的年份。但别太安逸——食神太过则懒散。',
      '伤官':'<strong>伤官</strong>为我生之异性——你的智慧和口才会在这一年爆发。但伤官见官则为祸——说话做事需三思，锋芒太露必招是非。',
      '正印':'<strong>正印</strong>为生我之异性——贵人运最旺的年份。有人愿意帮你、教你、提携你。学习、考证、求学的黄金时间。印星护身，小人也难以近你。',
      '偏印':'<strong>偏印</strong>为生我之同性——适合深度学习和独处思考。偏印年不宜社交扩张，适合"向内求"。但偏印夺食——注意不要因为过度思考而错失行动的机会。',
      '比肩':'<strong>比肩</strong>为同我之同性——这一年竞争激烈，但也意味着你在人群中会被看到。比肩帮身，但比肩也夺财——合作可以，但要守住自己的利益。',
      '劫财':'<strong>劫财</strong>为同我之异性——这是最容易"破财"的年份。借钱、投资、合伙都要万分谨慎。劫财年最大的陷阱：你以为是机会，其实是坑。'
    };
    if (tgExplain[y.tenGod]) parts.push(tgExplain[y.tenGod]);

    // Branch interactions
    var branchTerm = explainBranchInteractions(bazi, lnBranch, lnStem);
    if (branchTerm) parts.push(branchTerm);

    // Element check
    if (strength.favorable.indexOf(ln.stem.element) >= 0) {
      parts.push('流年天干'+lnStem+'为<strong style="color:'+ec(ln.stem.element)+'">用神'+ln.stem.element+'</strong>——天时在你这边，这一年做什么都比平时顺。');
    }
    if (strength.unfavorable.indexOf(ln.stem.element) >= 0) {
      parts.push('流年天干'+lnStem+'为<strong style="color:#f87171">忌神'+ln.stem.element+'</strong>——这一年同样的努力，收获可能只有平时的一半。不是你的问题，是天地能量不对你"友好"。');
    }

    return parts.join('<br>');
  }

  // ── Get core conflict of the chart ──
  function getCoreConflict(bazi, strength, tenGods, dm) {
    var monthGod = tenGods.month.stemGod;
    if (strength.level === '身弱') {
      if (monthGod === '七杀' || monthGod === '正官') return '月令官杀当权而日主偏弱——"官杀攻身"，如同一个严苛的上司日日盯着你。你一生需要学会用印星（学习、贵人）来化解压力，而非硬扛。';
      if (monthGod === '正财' || monthGod === '偏财') return '月令财星当旺而日主身弱——"财多身弱，富屋贫人"。你身边从来不缺赚钱的机会，但你的能量还不足以把它们都抓住。先强身，再求财。';
      return '日主身弱，月令为忌。你需要找到对的平台、对的人来"借力"，单打独斗不是你的最优解。';
    } else if (strength.level === '身强') {
      if (monthGod === '比肩' || monthGod === '劫财') return '月令比劫当权，日主过旺——"比劫夺财"，你身边竞争环伺。你需要用官杀来约束自己、用食伤来释放才华，否则容易"心比天高，命比纸薄"。';
      return '日主强旺，但需忌神来平衡。你的挑战不是"不够强"，而是"太刚易折"。适当收敛锋芒，反而能走得更远。';
    }
    return '命局中和，五行流转尚可。需要注意的是大运流年对格局的扰动——中和之命最怕"偏枯"之运。';
  }

  // ── Get current Da Yun label ──
  function getCurrentDaYunLabel(dayun, age) {
    for (var i = 0; i < dayun.pillars.length; i++) {
      if (age >= dayun.pillars[i].ageStart && age <= dayun.pillars[i].ageEnd) {
        return dayun.pillars[i].stem.char + dayun.pillars[i].branch.char + '大运（' + dayun.pillars[i].nayin + '）';
      }
    }
    return dayun.pillars[0].stem.char + dayun.pillars[0].branch.char + '大运';
  }

  // ─── 2. Love Prediction (爱情姻缘) ───
  function generateLoveTimeline(bazi, dayun, age, shensha) {
    var dm = bazi.day.stem;
    var dmElem = dm.element;
    var dayBranch = bazi.day.branch;
    var tenGods = Gods.getAllTenGods(bazi);
    var strength = Core.assessDayMasterStrength(bazi, Core.tallyFiveElements(bazi));
    var loveYears = DaYun.findLoveYears(bazi, dayun, age, 10);
    var parts = [];

    // Shensha inventory
    var hasTaoHua = shensha.some(function(s){return s.name==='桃花';});
    var hasHongLuan = shensha.some(function(s){return s.name==='红鸾';});
    var hasGuChen = shensha.some(function(s){return s.name==='孤辰';});
    var hasTianXi = shensha.some(function(s){return s.name==='天喜';});
    var hasTianYi = shensha.some(function(s){return s.name==='天乙贵人';});

    parts.push('<h3>夫妻宫论断 · 姻缘天机</h3>');

    // ── Professional Diagnosis ──
    var diagLines = [];
    diagLines.push('<strong>夫妻宫（日支）：</strong>'+dayBranch.char+'（'+dayBranch.element+'）。日支乃婚姻的根基，其五行生克直接决定你的感情底色。');
    diagLines.push('<strong>配偶星：</strong>'+(dm.yinYang==='阳'?'正财':'正官')+'为你的正缘星。命局中配偶星的旺衰、位置、是否有伤，决定了你的婚姻质量和时机。');
    if (hasTaoHua) diagLines.push('<strong>桃花入命：</strong>异性缘旺，但桃花有正偏之分。子午卯酉四正之位见桃花者，多情而善感，一生情路不会平淡。');
    if (hasGuChen) diagLines.push('<strong>孤辰照命：</strong>孤辰在夫妻宫或年柱者，感情上天生"慢热"，宁缺毋滥。不是找不到人，是你不愿意将就——这是标准，不是诅咒。');
    if (hasHongLuan) diagLines.push('<strong>红鸾入命：</strong>正姻缘星到位。只要流年大运引动，正缘必现。红鸾不动则已，一动便是正缘。');
    if (hasTianXi) diagLines.push('<strong>天喜照命：</strong>姻缘宫有喜气。天喜与红鸾同现，婚姻信息非常明确——只是时间问题。');
    diagLines.push('<strong>日主'+dm.char+dmElem+'：</strong>' + getLovePersonality(dmElem, dm.yinYang));
    parts.push(diagBlock('夫妻宫诊断', diagLines.join('<br>')));

    // ── Sting ──
    var stingText = '';
    if (hasGuChen) {
      stingText = '你命带<strong>孤辰</strong>——在子平术中，孤辰主"六亲缘薄、独立自处"。你或许不止一次在深夜问过自己：为什么别人轻易就能拥有的温暖，到我这里就变得如此困难？你试着投入过，试着信任过，但最后发现——能真正理解你的人，寥寥无几。这不是你不好，是孤辰让你对"对的人"有着极高的筛选门槛。';
    } else if (hasTaoHua && !hasHongLuan) {
      stingText = '命带<strong>桃花</strong>却不见<strong>红鸾</strong>——这在命理中称为"有花无果"。你身边从来不缺喜欢你的人，但真正让你心动、且愿意对你负责的，却凤毛麟角。你经历过那种"看似热闹，实则孤独"的感情状态——人来人往，却没有一个能走进你的夫妻宫。';
    } else {
      stingText = '在子平术中，婚姻看<strong>夫妻宫（日支）</strong>和<strong>配偶星</strong>。你的日支为'+dayBranch.char+'，这个位置的能量状态，决定了你在感情中的核心模式。你可能发现——自己总是在某个特定的"感情剧本"里打转，重复遇到相似的人、经历相似的结果。这不是巧合，这是命局的底层代码在运行。';
    }
    parts.push(stingBlock(stingText));

    // ── Explain ──
    var explainText = '<strong>命理解析：</strong>';
    if (hasGuChen) {
      explainText += '孤辰在命，古书云"男怕孤辰，女怕寡宿"。但这并非说你会孤独终老——而是说你在情感上比常人更"挑剔"。孤辰让你对感情的质量要求极高，这是你的标准高，不是你的命不好。当大运流年走到红鸾、天喜或配偶星透干之时，孤辰的"筛选"功能反而会帮你精准锁定最合适的那个人。';
    }
    if (hasTaoHua) {
      explainText += '桃花星入命之人，天生自带吸引力。但子平术中桃花分<strong>墙里桃花</strong>和<strong>墙外桃花</strong>——前者主良缘，后者主烂缘。你之前遇到的，多是"练手"的偏桃花，帮你逐步认清自己真正需要什么样的伴侣。';
    }
    explainText += '你的日主'+dm.char+'为'+dmElem+'，夫妻宫'+dayBranch.char+'为'+dayBranch.element+'。' + getDayBranchLove(dayBranch, dmElem);
    parts.push(explainBlock(explainText));

    // ── Way ──
    var wayText = '<strong>缘分开窗期：</strong>';
    if (loveYears.length > 0) {
      wayText += '你的夫妻宫和配偶星在以下年份被引动——这些是你需要高度警觉的"缘分窗口"：';
      loveYears.slice(0,4).forEach(function(ly) {
        wayText += '<br><strong>'+ly.year+'年：</strong>' + ly.reasons.join('，') + '。';
      });
      wayText += '<br>这些年份里，<strong>天时已至</strong>。但命理只能给你"地图"，走到目的地的那一步，得你自己迈出去。';
    } else {
      wayText += '当前大运流年尚未直接引动你的夫妻宫和配偶星。但这不意味着"没有缘分"——而是缘分在<strong>酝酿</strong>。你现在最需要做的，是把精力放在提升自己的能量层级上。当你的气场与未来的正缘同频时，不需要"找"，自会相遇。';
    }
    parts.push(wayBlock(wayText));

    // ── Promise ──
    var idealElem = Gods.GENERATED_BY[dmElem] || dmElem;
    var promiseText = '<strong>正缘画像：</strong>根据你的命局五行喜忌和配偶星位置，你的正缘具有以下特征——五行偏<strong>'+idealElem+'</strong>，或命中带'+idealElem+'属性。';
    if (idealElem === '木') promiseText += '对方如大树般稳重可靠，会在你最需要的时候给你遮风挡雨。性格中带着温柔而坚韧的力量，看似柔软实则不屈。';
    else if (idealElem === '火') promiseText += '对方温暖明亮如火焰，会照亮你生命中所有灰暗的角落。热情而真诚，是你人生中最亮的那束光。';
    else if (idealElem === '土') promiseText += '对方踏实稳重如大地，是你永远的安全港。不善言辞但行动力极强，是那种"做了不说"的人。';
    else if (idealElem === '金') promiseText += '对方果决而忠诚，如金石般坚定不移。在你犹豫时替你决断，在你脆弱时为你挡下风雨。';
    else promiseText += '对方聪慧灵动如水，能带你看见人生更多的可能性。善于沟通，是你灵魂层面的知己。';
    if (hasTianXi || hasHongLuan) promiseText += '更重要的是——你的命盘中姻缘星已经就位，这不是"有没有"的问题，而是"什么时候"的问题。命理已定，天时将至。';
    parts.push(promiseBlock(promiseText));

    return parts.join('\n');
  }

  function getLovePersonality(elem, yinYang) {
    var map = {
      '木': '木主仁，你在感情中是那个默默生长、默默付出的人。你像一棵树——渴望稳定而深刻的感情，但有时太"直"，不擅长表达柔软。对方需要耐心，才能看到你内心最温柔的年轮。',
      '火': '火主礼，你热情而直接，爱的时候倾尽所有。但火焰需要燃料——你需要一个能持续点燃你、而不是熄灭你的人。你的感情世界非黑即白，没有灰色地带。',
      '土': '土主信，你稳重可靠，是感情中默默承担一切的那一方。但有时太过隐忍，让对方误以为你不需要被照顾。你的内心比表面看起来更需要被理解。',
      '金': '金主义，你爱恨分明、忠诚而坚定。但有时太过锋利，在无意中伤到了最亲近的人。你需要的是能欣赏你的"锐利"而不是试图磨平你的人。',
      '水': '水主智，你情感细腻、内心世界丰富。但有时想得太多、说得太少，让对方无法真正触达你的内心。你需要的是愿意潜到水底来看你的人。'
    };
    return map[elem] || '';
  }

  function getDayBranchLove(dayBranch, dmElem) {
    var relations = {
      '子': '子为四正桃花之一。夫妻宫坐桃花者，配偶通常外貌气质不俗。但子水夫妻宫需火土来暖局——对方需要是能给你"温度"的人。',
      '午': '午为四正桃花之一，火性炎上。夫妻宫坐午火者，感情热烈但也容易因小事起争执。你需要的是一个能"定"住你的人。',
      '卯': '卯为四正桃花之一，木性柔和。夫妻宫坐卯木者，配偶性格温良。但卯木忌金克——对方若太过刚硬，夫妻宫会被"冲撞"。',
      '酉': '酉为四正桃花之一，金性刚锐。夫妻宫坐酉金者，配偶能力强但也强势。你需要找到那个让你甘愿"示弱"的人。'
    };
    return relations[dayBranch.char] || '夫妻宫'+dayBranch.char+'的五行属性与你的日主'+dmElem+'之间的生克关系，决定了你在婚姻中的"舒适度"。';
  }

  // ─── 3. Wealth & Career (财运事业) ───
  function generateWealthCareer(bazi, dayun, age, years) {
    var dm = bazi.day.stem;
    var strength = Core.assessDayMasterStrength(bazi, Core.tallyFiveElements(bazi));
    var tenGods = Gods.getAllTenGods(bazi);
    var pattern = Gods.analyzePattern(bazi, tenGods, strength);
    var parts = [];

    var wealthWarnings = years.filter(function(y){return y.categories.wealth.score < 50;});
    var badWealthYears = years.filter(function(y){return y.categories.wealth.score < 45;});
    var goodWealthYears = years.filter(function(y){return y.categories.wealth.score >= 65;});

    parts.push('<h3>财官论断 · 功名利禄</h3>');

    // ── Professional Diagnosis ──
    var diagLines = [];
    diagLines.push('<strong>格局：</strong>'+pattern.primaryPattern+'。在子平术中，财为养命之源，官为荣身之本。你的财星和官星在命局中的位置与旺衰，决定了财富和事业的底层逻辑。');
    var wealthStars = [];
    ['year','month','day','hour'].forEach(function(p) {
      var god = tenGods[p].stemGod;
      if (god === '正财' || god === '偏财') wealthStars.push(p+'柱天干透出<strong>'+god+'</strong>');
    });
    if (wealthStars.length > 0) {
      diagLines.push('<strong>财星：</strong>' + wealthStars.join('；') + '——财星透出，一生不缺赚钱机会。');
    } else {
      diagLines.push('<strong>财星：</strong>命局天干不透财星——你的财富需要大运流年来"引动"。平时财运不显，但一旦大运走到财星之地，积累的势能会集中释放。');
    }
    diagLines.push('<strong>日主强弱：</strong>'+strength.level+'。' + (strength.level==='身弱' ? '身弱而财旺则为"财多身弱"——富屋贫人，明明看到钱却拿不动。你需要先强身，后求财。' : strength.level==='身强' ? '身强则能担财官。你有足够的能量去承载财富和权力——关键是大运流年能否引出财星。' : '中和之命，财运随大运起伏。好在大起大落不多，稳中有升是主基调。'));
    parts.push(diagBlock('财官诊断', diagLines.join('<br>')));

    // ── Sting ──
    var stingText = '';
    if (strength.level === '身弱' && badWealthYears.length > 0) {
      stingText = '在子平术中，有一个残酷的术语叫<strong>"财多身弱"</strong>——翻译成白话就是：钱就在眼前，但你的"体力"还不够把它扛走。你是不是觉得自己明明很努力了，但钱就是留不住？赚到了又花掉，投资了又亏损，好像总有一只无形的手在掏你的口袋？这不是你不努力——是从命局来看，你正在跟<strong>忌神流年</strong>对抗。';
    } else if (strength.level === '身强' && pattern.primaryPattern.indexOf('财') < 0) {
      stingText = '命局<strong>比劫旺而无制</strong>——这意味着你身边的竞争比你想象中更激烈。看着别人似乎轻轻松松就赚到了钱，你心里在想："我不比他们差，为什么不是我？"你的挫败感不是来自"赚不到钱"，而是来自<strong>"命局比劫夺财"</strong>——你赚到的每一分钱，都有十只手在跟你抢。';
    } else {
      stingText = '<strong>财星不显，官星不透</strong>——你可能正处在一种"不上不下"的状态里。说不上差，但总觉得天花板就在头顶。你想突破，但又怕走错一步满盘皆输。在命理上，这叫做<strong>"财官不现于天干"</strong>——你的才华和努力，需要一个正确的"气口"才能兑现。';
    }
    parts.push(stingBlock(stingText));

    // ── Explain ──
    var explainText = '<strong>命局解码：</strong>你的格局为'+pattern.primaryPattern+'，用神取<strong>'+strength.favorable.join('、')+'</strong>。';
    if (strength.level === '身弱') {
      explainText += '身弱之命求财，如小舟出海——你需要造一艘更大的船（强身），或者等待风平浪静的天气（用神流年）。'+badWealthYears.map(function(y){return y.year;}).join('、')+'年，流年天干为忌神，地支又与命局形成冲克——这几年财运走低，不是你不够努力，而是<strong>天时不至</strong>。';
    } else {
      explainText += '身强能担财官——你是能"扛"的人。但财官好比货物，你需要一辆"车"来运它们。这辆"车"就是<strong>用神'+strength.favorable.join('、')+'</strong>。当流年大运走到用神之地，你之前所有的积累会像开闸放水一样集中爆发。';
    }
    explainText += '特别提醒：五行'+strength.favorable[0]+'是你财富的"钥匙"。多接触'+strength.favorable[0]+'属性的人、事、物——不是迷信，是让你的气场与财运气场同频共振。';
    parts.push(explainBlock(explainText));

    // ── Way ──
    var wayText = '<strong>财运策略（按流年）：</strong></p><ul>';
    if (goodWealthYears.length > 0) {
      wayText += '<li><strong>'+goodWealthYears.map(function(y){return y.year;}).join('、')+'年</strong>——财星得地，用神当令。适合启动新项目、谈加薪、做投资。这是你的"渔获季节"，天道酬勤。</li>';
    }
    if (badWealthYears.length > 0) {
      wayText += '<li><strong>'+badWealthYears.map(function(y){return y.year;}).join('、')+'年</strong>——比劫夺财、忌神肆虐。这几年的策略只有两个字：<strong>保守</strong>。不借贷、不担保、不投资。多存钱、少折腾。</li>';
    }
    wayText += '<li><strong>五行调理：</strong>在你的办公桌或家中'+getDirection(strength.favorable[0])+'方，放置'+strength.favorable[0]+'属性的物品。这不是玄学——当周围环境的能量与你命局用神同频时，你的决策质量会显著提升。</li>';
    wayText += '</ul><p>';
    parts.push(wayBlock(wayText));

    // ── Promise ──
    var careerMap = { '木':'教育、文化、健康、环保','火':'科技、能源、传媒、餐饮','土':'地产、金融、管理、农业','金':'法律、工程、制造、金融','水':'贸易、物流、咨询、智慧产业' };
    var promiseText = '<strong>财富格局总结：</strong>你的命盘显示，财富的"起爆点"与<strong>'+strength.favorable[0]+'</strong>密切相关。适合深耕的领域包括'+(careerMap[dm.element]||'综合领域')+'。';
    if (goodWealthYears.length > 0) {
      promiseText += '当'+goodWealthYears[0].year+'年流年天干<strong>'+goodWealthYears[0].liuNian.stem.char+'</strong>（用神'+goodWealthYears[0].liuNian.stem.element+'）透出时，你会看到——今天所有让你焦虑的财务数字，都只是你未来财富叙事的序章。';
    }
    parts.push(promiseBlock(promiseText));

    return parts.join('\n');
  }

  function getDirection(elem) {
    var map = { '木':'东','火':'南','土':'中央','金':'西','水':'北' };
    return map[elem] || '吉';
  }

  // ─── 4. Health (健康平安) ───
  function generateHealth(bazi, dayun, age, years, elementAnalysis) {
    var dm = bazi.day.stem;
    var shensha = Gods.calculateShenSha(bazi);
    var hasYangRen = shensha.some(function(s){return s.name==='羊刃';});
    var parts = [];

    var weakest = null, minCount = Infinity;
    elementAnalysis.forEach(function(ea){ if(ea.count < minCount){ minCount=ea.count; weakest=ea; } });

    var organMap = {
      '木': { o:'肝胆', s:'木主肝胆，开窍于目。木弱则肝气郁结——你把太多情绪憋在心里，久而久之化为身体的抗议。右肋胀痛、眼睛干涩、容易叹气，这些都是肝在"喊累"。' },
      '火': { o:'心脏、血脉', s:'火主心，开窍于舌。火弱则心气不足——心慌、失眠、手脚冰凉，不是因为你"矫情"，是你的心火不够旺，推不动血液到达末梢。' },
      '土': { o:'脾胃', s:'土主脾胃，开窍于口。土弱则脾失健运——胃胀、食欲不振、大便不成形。你想得太多，胃在替你承担那些消化不了的压力。' },
      '金': { o:'肺、呼吸道', s:'金主肺，开窍于鼻。金弱则肺气不足——容易感冒、皮肤干燥、呼吸短促。那些你没哭出来的眼泪，变成了肺里的痰湿。' },
      '水': { o:'肾、腰膝', s:'水主肾，开窍于耳。水弱则肾精不足——腰酸、耳鸣、精力不济。你扛了太多不属于你的重担，肾在替你"咬牙"支撑。' }
    };

    parts.push('<h3>身命根基 · 健康玄机</h3>');

    // ── Professional Diagnosis ──
    var diagLines = [];
    if (weakest && organMap[weakest.element]) {
      var om = organMap[weakest.element];
      diagLines.push('<strong>五行偏枯：</strong>命局中<strong>'+weakest.element+'</strong>最为薄弱（仅占'+(weakest.percentage*100).toFixed(0)+'%）。在中医与子平术的体系中，'+weakest.element+'对应<strong>'+om.o+'系统</strong>。'+om.s);
    }
    if (hasYangRen) {
      diagLines.push('<strong>羊刃入命：</strong>羊刃在子平术中为"凶煞之首"，主血光、手术、外伤。命带羊刃者，一旦大运流年引动羊刃或逢冲，身体会有"应激反应"。这并非诅咒——而是你的身体在用这种方式提醒你：该慢下来了。');
    }
    diagLines.push('<strong>日主'+dm.char+'：</strong>'+dm.element+'命之人，先天体质偏向' + getBodyConstitution(dm.element) + '。调理方向应以<strong>补'+weakest.element+'</strong>为主。');
    parts.push(diagBlock('体质诊断', diagLines.join('<br>')));

    // ── Sting ──
    var stingText = '';
    if (hasYangRen) {
      stingText = '命带<strong>羊刃</strong>——在古书中，这不是一个温和的词。你是否觉得自己比同龄人更容易受伤、更容易累？有时候身体莫名地不舒服，去医院检查又说"没什么大问题"。但你就是知道自己不在最佳状态——这种"说不清的疲惫"，比确诊一个病更让人煎熬。';
    } else {
      stingText = '你是否曾在深夜醒来，盯着天花板，感觉身体某个部位隐隐不适——然后开始在网上搜索症状，越搜越害怕？或者，你最近是否觉得精力不如从前，但又告诉自己"只是太累了，睡一觉就好"？<strong>在命理中，身体的不适从来不是"突然"出现的——它是五行不平衡日积月累的结果。</strong>';
    }
    parts.push(stingBlock(stingText));

    // ── Explain ──
    var explainText = '<strong>五行病理：</strong>';
    if (weakest) {
      explainText += '你的命局中'+weakest.element+'最弱。五行'+weakest.element+'对应的脏腑是'+(organMap[weakest.element] ? organMap[weakest.element].o : '相关系统')+'——当你压力过大、情绪波动、作息紊乱时，最先"报警"的就是这里。这不是你不够注意身体——是你的命局在这一环<strong>天生偏弱</strong>，需要比别人更多一分的呵护。';
    }
    if (hasYangRen) {
      explainText += '羊刃入命之人，身体有一种"冲锋"的本能——你比别人更拼、更能扛。但羊刃最忌逢冲，当大运流年与羊刃宫位形成冲克时，身体会用最直接的方式让你停下来——通常是突如其来的疼痛、意外或高烧。这不是"倒霉"，是身体在强制你休息。';
    }
    parts.push(explainBlock(explainText));

    // ── Way ──
    var healthBadYears = years.filter(function(y){return y.categories.health.score < 45;});
    var wayText = '<strong>重点防护年限：</strong>';
    if (healthBadYears.length > 0) {
      healthBadYears.forEach(function(y) {
        wayText += '<br><strong>'+y.year+'年（健康指数'+y.categories.health.score+'）：</strong>流年'+y.liuNian.stem.char+y.liuNian.branch.char+'与你的命局产生冲克。这一年切忌过度透支、高风险运动、忽视身体信号。';
      });
    } else {
      wayText += '未来几年整体健康运势尚可，但日常养护不可松懈。五行调理的重点：补充<strong>'+weakest.element+'</strong>能量。';
    }
    wayText += '<br><strong>日常调理：</strong>'+(weakest ? '多吃'+weakest.element+'属性的食物、穿'+weakest.element+'属性的颜色、在'+getDirection(weakest.element)+'方摆放对应的风水物品。' : '')+'规律作息是基础，情绪管理是关键。';
    parts.push(wayBlock(wayText));

    // ── Promise ──
    var promiseText = '<strong>身命告示：</strong>命理中的健康预警，不是"你一定会生病"，而是<strong>"你需要在某些时候比别人更爱自己"</strong>。你的身体比你的意志更早感知到压力的来临——学会倾听它、尊重它、养护它。';
    if (weakest) promiseText += '当你开始有意识地补充'+weakest.element+'能量时，那些困扰你的小毛病会像晨雾一样，在你注意不到的某个时刻悄然散去。';
    parts.push(promiseBlock(promiseText));

    return parts.join('\n');
  }

  function getBodyConstitution(elem) {
    var map = {
      '木': '肝气偏旺，需注意情绪疏导。木命之人像树——需要空间来"伸展"，压抑的环境最容易让你生病。',
      '火': '心火偏旺，需注意情绪波动。火命之人精力充沛但容易"过火"——亢奋和疲惫往往只有一线之隔。',
      '土': '脾胃功能偏敏感，需注意饮食规律。土命之人是"承载者"——你替别人消化了太多情绪，胃在替你承担。',
      '金': '肺气偏弱，需注意呼吸道。金命之人气质清冷——悲忧伤肺，那些没说出口的话，都堵在了喉咙。',
      '水': '肾气偏弱，需注意腰膝和精力管理。水命之人敏感细腻——恐惧伤肾，你的身体在替你承受所有的不安。'
    };
    return map[elem] || '';
  }

  // ─── 5. Cautions (近期注意) ───
  function generateCautions(years, shensha) {
    var parts = [];
    parts.push('<h3>流年预警 · 趋吉避凶</h3>');

    var currentYear = years[1];
    var upcomingBad = years.filter(function(y){return y.rating === '凶' || y.rating === '大凶';});
    var allWarnings = [];
    years.forEach(function(y){ y.warnings.forEach(function(w){ if(allWarnings.indexOf(w)<0) allWarnings.push(w); }); });

    // ── Sting ──
    parts.push(stingBlock(
      '在子平术中，<strong>刑冲合害</strong>是判断流年吉凶的核心法则。人生最大的风险，不是你知道了什么坏消息——而是你<strong>不知道</strong>自己命局中哪一柱正在被流年冲克。以下预警，不是为了让你恐惧，而是让你提前看清——风暴从哪个方向来。'
    ));

    // ── Current year professional analysis ──
    parts.push(diagBlock(
      '当前'+currentYear.year+'年 · '+currentYear.liuNian.stem.char+currentYear.liuNian.branch.char+'年流年研判',
      '<strong>流年十神：</strong>'+currentYear.tenGod+'入命。<br>' +
      '<strong>综合评分：</strong>'+currentYear.score+'分 · '+ratingBadge(currentYear.rating)+'<br>' +
      (currentYear.highlights.length > 0 ? '<strong>有利因素：</strong>'+currentYear.highlights.join('；')+'<br>' : '') +
      (currentYear.warnings.length > 0 ? '<strong>不利因素：</strong>'+currentYear.warnings.join('；') : '')
    ));

    // ── All warnings consolidated ──
    if (allWarnings.length > 0) {
      parts.push('<div class="pred-block">');
      parts.push('<h4>未来数年综合预警清单</h4>');
      parts.push('<p>以下为各流年与命局交互中提取出的关键风险信号——每一条都对应着命局中某个具体的<strong>刑冲合害</strong>或<strong>十神组合</strong>：</p>');
      parts.push('<ul>');
      allWarnings.slice(0,8).forEach(function(w){ parts.push('<li>' + w + '</li>'); });
      parts.push('</ul>');
      parts.push('</div>');
    }

    // ── Way ──
    if (upcomingBad.length > 0) {
      parts.push(wayBlock(
        '<strong>凶年应对法则：</strong>'+upcomingBad.map(function(y){return y.year;}).join('、')+'年，流年忌神当令、刑冲并见。' +
        '这几年的核心策略是<strong>"以守代攻"</strong>——不主动求变、不贸然投资、不与人结怨。' +
        '子平术讲"避凶即是趋吉"——当你避开了命局中不利的能量场，吉气自然有空间流入。' +
        '把精力放在读书、健身、陪伴家人上——这些"不显眼"的投入，会在接下来的吉年中产生几何级的回报。'
      ));
    }

    // ── Promise ──
    parts.push(promiseBlock(
      '在命理中，<strong>预知</strong>本身就是最大的优势。当你提前看清了未来数年的能量流转——哪些年份可以全力以赴，哪些年份需要收敛蓄力——你就已经比99%的人更有掌控感。命运不会亏待有准备的人。'
    ));

    return parts.join('\n');
  }

  // ─── 6. Advice (当前建议) ───
  function generateAdvice(bazi, strength, years, shensha, pattern) {
    var dm = bazi.day.stem;
    var parts = [];
    parts.push('<h3>格局调候 · 当下指引</h3>');

    // ── Sting ──
    parts.push(stingBlock(
      '在子平术中，<strong>格局清浊</strong>决定了一个人的上限，而<strong>调候得宜</strong>决定了你能不能触达这个上限。你此刻能看到的"机会"和"困境"，都只是命局底层代码在现实中的投影——真正的关键，是你选<strong>哪个运</strong>来出击，选<strong>哪个运</strong>来蛰伏。'
    ));

    // ── Explain ──
    parts.push(explainBlock(
      '<strong>格局定论：</strong>你以<strong>'+pattern.primaryPattern+'</strong>立格，日主<strong>'+strength.level+'</strong>，用神<strong>'+strength.favorable.join('、')+'</strong>，忌神<strong>'+strength.unfavorable.join('、')+'</strong>。' +
      (strength.level === '身强' ? '身强则能任重——你的能量足够大，但需要方向。身强之人的最大陷阱不是"做不到"，而是"什么都想做"。把'+strength.favorable[0]+'作为你的指南针——只做与用神同频的事。' : '') +
      (strength.level === '身弱' ? '身弱并非劣势——水虽柔，却能穿石。你的策略不是"硬碰硬"，而是<strong>借势</strong>。找到'+strength.favorable[0]+'属性的平台、合作伙伴、行业方向——让环境替你分担压力。' : '') +
      (strength.level === '中和' ? '中和之命，刚柔并济。你的最大优势是<strong>灵活</strong>——顺境中能进取，逆境中能隐忍。但中和之人最大的风险是"犹豫"——当机会来临时，你可能会过度分析而错失良机。' : '')
    ));

    // ── Way ──
    var goodYears = years.filter(function(y){return y.rating === '大吉' || y.rating === '吉';});
    var hasWenChang = shensha.some(function(s){return s.name==='文昌贵人';});
    var hasYiMa = shensha.some(function(s){return s.name==='驿马';});
    var hasHuaGai = shensha.some(function(s){return s.name==='华盖';});

    parts.push(wayBlock(
      '<strong>当下宜忌清单（基于命局格局+大运+流年综合判断）：</strong></p><ul>' +
      '<li><strong>宜出击：</strong>' + goodYears.slice(0,3).map(function(y){return y.year+'年（'+y.liuNian.stem.char+y.liuNian.branch.char+'）';}).join('、') + '——这几年大运流年皆为喜用，是你命局中的"绿灯时段"。大胆执行计划，天时在你这边。</li>' +
      '<li><strong>宜调理：</strong>日常多接触<strong>'+strength.favorable[0]+'</strong>能量——颜色、方向、行业、饮食。你的气场会在与用神同频的环境中逐渐改变，这种改变是潜移默化但真实的。</li>' +
      (hasWenChang ? '<li><strong>文昌入命：</strong>子平术中，文昌主科甲功名。现在正是学习、考证、深造的黄金时期。知识是你最稳的投资——因为它不会被忌神流年夺走。</li>' : '') +
      (hasYiMa ? '<li><strong>驿马星动：</strong>驿马主"动中求吉"。如果近期有出行、跳槽、搬家的机会——不要怕改变。驿马动则有变，变中藏机。</li>' : '') +
      (hasHuaGai ? '<li><strong>华盖照命：</strong>华盖主智慧但也主孤独。你天生适合深耕某个领域——但不要让"深度思考"变成"过度内耗"。</li>' : '') +
      '<li><strong>最重要的一条：</strong>命理是<strong>趋势</strong>，不是<strong>定数</strong>。你的每一次选择都在修改命运的轨迹。用神指引你方向，但迈出脚步的，是你自己。</li>' +
      '</ul><p>'
    ));

    // ── Promise ──
    parts.push(promiseBlock(
      '<strong>天机已泄，命盘已现。</strong>你现在看到的每一个字——格局、用神、忌神、大运、流年——都是子平术千年来无数命师总结出的规律。但这些规律指向的从来不是"宿命"，而是<strong>概率</strong>。' +
      '当你知道了什么时候该进、什么时候该守、什么时候该爱、什么时候该放——你就已经不是在"被命运推着走"，而是在<strong>与天地同步而行</strong>。' +
      '知命，是为了造命。你手中的这张命盘，是你独有的人生地图——接下来的路，你可以走得更清醒、更笃定。'
    ));

    return parts.join('\n');
  }

  // ─── Generate All ───
  function generateAllPredictions(bazi, strength, elementAnalysis, shensha, dayun, liuNian, liuNianAnalysis, age, birthYear, birthMonth, birthDay, pattern) {
    var fateSummary = Gods.generateFateSummary(bazi, Gods.getAllTenGods(bazi), strength, pattern, shensha, elementAnalysis);
    var years = DaYun.scoreMultipleYears(bazi, dayun, age, birthYear, birthMonth, birthDay, 8);

    return {
      fate: fateSummary,
      pattern: pattern,
      yearly: generateYearlyFortune(bazi, dayun, age, birthYear, birthMonth, birthDay),
      love: generateLoveTimeline(bazi, dayun, age, shensha),
      wealth: generateWealthCareer(bazi, dayun, age, years),
      fortune: generateYearlyFortune(bazi, dayun, age, birthYear, birthMonth, birthDay),
      career: generateWealthCareer(bazi, dayun, age, years),
      health: generateHealth(bazi, dayun, age, years, elementAnalysis),
      caution: generateCautions(years, shensha),
      advice: generateAdvice(bazi, strength, years, shensha, pattern)
    };
  }

  return { generateAllPredictions: generateAllPredictions };
})();
