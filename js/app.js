/* ===== App — UI Orchestration, Event Handling, Rendering ===== */
(function() {
  'use strict';

  var Core = window.BaziCore;
  var Calendar = window.BaziCalendar;
  var Gods = window.GodsStars;
  var DaYun = window.DaYun;
  var Predictions = window.Predictions;

  var $ = function(id) { return document.getElementById(id); };

  var inputSection = $('inputSection');
  var loadingEl = $('loading');
  var resultsEl = $('results');
  var submitBtn = $('submitBtn');
  var editBtn = $('editBtn');

  var btnSolar = $('btnSolar');
  var btnLunar = $('btnLunar');
  var solarInputs = $('solarInputs');
  var lunarInputs = $('lunarInputs');
  var calendarType = 'solar';

  var btnMale = $('btnMale');
  var btnFemale = $('btnFemale');
  var gender = 'male';

  var currentBazi = null;
  var currentPredictions = null;

  // ─── Calendar Toggle ───
  btnSolar.addEventListener('click', function() {
    calendarType = 'solar';
    btnSolar.classList.add('active'); btnLunar.classList.remove('active');
    solarInputs.classList.remove('hidden'); lunarInputs.classList.add('hidden');
  });
  btnLunar.addEventListener('click', function() {
    calendarType = 'lunar';
    btnLunar.classList.add('active'); btnSolar.classList.remove('active');
    solarInputs.classList.add('hidden'); lunarInputs.classList.remove('hidden');
    updateLunarInputs();
  });

  // Gender toggle
  btnMale.addEventListener('click', function() { gender = 'male'; btnMale.classList.add('active'); btnFemale.classList.remove('active'); });
  btnFemale.addEventListener('click', function() { gender = 'female'; btnFemale.classList.add('active'); btnMale.classList.remove('active'); });

  // ─── Lunar Input Updates ───
  function updateLunarInputs() {
    var year = parseInt($('lunarYear').value) || 1990;
    var months = Calendar.getLunarMonths(year);
    var monthSel = $('lunarMonth');
    monthSel.innerHTML = '';
    months.forEach(function(m) {
      var opt = document.createElement('option');
      opt.value = m.num + (m.isLeap ? '_leap' : '');
      opt.textContent = (m.isLeap ? '闰' : '') + m.num + '月 (' + m.days + '天)';
      monthSel.appendChild(opt);
    });
    updateLunarDays();
  }

  function updateLunarDays() {
    var year = parseInt($('lunarYear').value) || 1990;
    var monthVal = $('lunarMonth').value;
    var months = Calendar.getLunarMonths(year);
    var daySel = $('lunarDay');
    var selectedMonth = null;
    months.forEach(function(m) {
      if ((m.num + (m.isLeap ? '_leap' : '')) === monthVal) selectedMonth = m;
    });
    if (!selectedMonth) selectedMonth = months[0];
    daySel.innerHTML = '';
    for (var d = 1; d <= selectedMonth.days; d++) {
      var opt = document.createElement('option');
      opt.value = d;
      var dayNames = ['','初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
      opt.textContent = dayNames[d] || d;
      daySel.appendChild(opt);
    }
  }

  $('lunarYear').addEventListener('change', updateLunarInputs);
  $('lunarMonth').addEventListener('change', updateLunarDays);
  updateLunarInputs();

  // ─── Get Birth Date ───
  function getBirthDate() {
    var year, month, day;
    if (calendarType === 'solar') {
      year = parseInt($('solarYear').value) || 1990;
      month = parseInt($('solarMonth').value) || 1;
      day = parseInt($('solarDay').value) || 1;
    } else {
      var lYear = parseInt($('lunarYear').value) || 1990;
      var monthVal = $('lunarMonth').value;
      var isLeap = monthVal.indexOf('_leap') >= 0;
      var lMonth = parseInt(monthVal);
      var lDay = parseInt($('lunarDay').value) || 1;
      var solar = Calendar.lunarToSolar(lYear, lMonth, lDay, isLeap);
      if (!solar) { alert('农历转换失败，请检查输入日期'); return null; }
      year = solar.year; month = solar.month; day = solar.day;
    }
    var maxDay = Calendar.daysInMonth(year, month);
    if (day < 1) day = 1; if (day > maxDay) day = maxDay;
    return { year: year, month: month, day: day, hourBranchIndex: parseInt($('birthHour').value) || 0 };
  }

  // ─── Submit ───
  submitBtn.addEventListener('click', function() {
    var birth = getBirthDate();
    if (!birth) return;
    inputSection.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    resultsEl.classList.add('hidden');

    // Update loading text for AI generation
    var loadingText = loadingEl.querySelector('p');
    if (loadingText) loadingText.textContent = '正在为您排盘推演...';

    // Small delay for the loading animation to show
    setTimeout(function() {
      performCalculationAsync(birth).then(function() {
        loadingEl.classList.add('hidden');
        resultsEl.classList.remove('hidden');
        renderAll();
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        initScrollReveal();
      }).catch(function(err) {
        console.error('Calculation failed:', err);
        loadingEl.classList.add('hidden');
        alert('推演失败，请稍后重试');
        inputSection.classList.remove('hidden');
      });
    }, 400);
  });

  editBtn.addEventListener('click', function() {
    resultsEl.classList.add('hidden');
    inputSection.classList.remove('hidden');
    inputSection.scrollIntoView({ behavior: 'smooth' });
  });

  // ─── Calculate Everything (sync base data) ───
  function performBaseCalculation(birth) {
    currentBazi = Core.calculateBazi(birth.year, birth.month, birth.day, birth.hourBranchIndex);
    currentBazi.elementsTally = Core.tallyFiveElements(currentBazi);
    currentBazi.elementAnalysis = Gods.analyzeElementBalance(currentBazi.elementsTally, currentBazi);
    currentBazi.strength = Core.assessDayMasterStrength(currentBazi, currentBazi.elementsTally);
    currentBazi.tenGods = Gods.getAllTenGods(currentBazi);
    currentBazi.shensha = Gods.calculateShenSha(currentBazi);
    currentBazi.pattern = Gods.analyzePattern(currentBazi, currentBazi.tenGods, currentBazi.strength);
    currentBazi.fateSummary = Gods.generateFateSummary(currentBazi, currentBazi.tenGods, currentBazi.strength, currentBazi.pattern, currentBazi.shensha, currentBazi.elementAnalysis);

    var yearStem = currentBazi.year.stem;
    currentBazi.dayun = DaYun.calculateDaYun(birth.year, birth.month, birth.day, gender, yearStem, { stem: currentBazi.month.stem, branch: currentBazi.month.branch });

    var today = new Date();
    var birthDate = new Date(birth.year, birth.month - 1, birth.day);
    var age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) age--;
    currentBazi.age = age;
    currentBazi.currentDayun = DaYun.getCurrentDaYun(currentBazi.dayun, age);
    currentBazi.liuNian = DaYun.calculateLiuNian(2026);
    currentBazi.liuNianAnalysis = DaYun.analyzeLiuNianInteraction(currentBazi, currentBazi.liuNian, currentBazi.currentDayun);
    currentBazi.birth = birth;
    currentBazi.ageVal = age;
  }

  // ─── Generate Template Predictions (sync fallback) ───
  function generateFallbackPredictions() {
    currentPredictions = Predictions.generateAllPredictions(
      currentBazi, currentBazi.strength, currentBazi.elementAnalysis,
      currentBazi.shensha, currentBazi.dayun, currentBazi.liuNian,
      currentBazi.liuNianAnalysis, currentBazi.ageVal, currentBazi.birth.year,
      currentBazi.birth.month, currentBazi.birth.day, currentBazi.pattern
    );
  }

  // ─── Async Calculation with AI ───
  function performCalculationAsync(birth) {
    // Step 1: Calculate base bazi data (sync, fast)
    performBaseCalculation(birth);

    // Step 2: Try DeepSeek AI for personalized predictions
    var loadingText = loadingEl.querySelector('p');
    if (loadingText) loadingText.textContent = '正在为您推演天机...';

    return DeepSeekAI.generatePredictions(
      currentBazi, currentBazi.strength, currentBazi.elementAnalysis,
      currentBazi.shensha, currentBazi.dayun, currentBazi.liuNian,
      currentBazi.liuNianAnalysis, currentBazi.ageVal, currentBazi.birth.year,
      currentBazi.birth.month, currentBazi.birth.day, currentBazi.pattern
    ).then(function(aiPredictions) {
      // AI succeeded — use AI predictions
      currentPredictions = aiPredictions;
      currentBazi.aiGenerated = true;
      console.log('AI predictions generated successfully');
    }).catch(function(err) {
      // AI failed — fall back to template predictions
      console.warn('AI prediction failed, using template fallback:', err.message);
      generateFallbackPredictions();
      currentBazi.aiGenerated = false;
    });
  }

  // ─── Render All ───
  function renderAll() {
    renderPillars();
    renderFatePattern();
    renderElements();
    renderTenGods();
    renderShenSha();
    renderDaYun();
    renderLiuNian();
    renderPredictions('yearly');
  }

  // ─── Render Pillars ───
  function renderPillars() {
    var grid = $('pillarsGrid');
    var pillars = [
      { key: 'year', label: '年柱', emoji: '🏠' },
      { key: 'month', label: '月柱', emoji: '🌙' },
      { key: 'day', label: '日柱', emoji: '☀️' },
      { key: 'hour', label: '时柱', emoji: '⏰' }
    ];
    grid.innerHTML = '';
    pillars.forEach(function(p) {
      var data = currentBazi[p.key];
      var tenGod = currentBazi.tenGods[p.key];
      var hiddenStems = data.hiddenStems.map(function(h) { return h.stem; }).join(' ');
      var elemClass = 'elem-' + { '木':'wood','火':'fire','土':'earth','金':'metal','水':'water' }[data.stem.element];
      var card = document.createElement('div');
      card.className = 'pillar-card';
      if (data.isDayMaster) card.classList.add('day-master');
      card.innerHTML =
        '<div class="pillar-label">' + p.emoji + ' ' + p.label + '</div>' +
        '<div class="pillar-stem">' + data.stem.char + '</div>' +
        '<div class="pillar-branch">' + data.branch.char + '</div>' +
        '<div class="pillar-element ' + elemClass + '">' + data.stem.element + '</div>' +
        '<div class="pillar-nayin">' + data.nayin + '</div>' +
        '<div class="pillar-tengod">' + (tenGod ? tenGod.stemGod : '') + '</div>' +
        '<div class="pillar-hidden">藏干: ' + hiddenStems + '</div>' +
        (data.isDayMaster ? '<div class="pillar-day-label">日主</div>' : '');
      grid.appendChild(card);
    });
  }

  // ─── Render Fate Pattern ───
  function renderFatePattern() {
    var section = document.getElementById('fateSection') || createFateSection();
    var pattern = currentBazi.pattern;
    var shensha = currentBazi.shensha;
    var auspicious = shensha.filter(function(s) { return s.type === 'auspicious'; });
    var inauspicious = shensha.filter(function(s) { return s.type === 'inauspicious'; });

    var html = '<h2 class="section-title">命格详解</h2>';
    html += '<div class="fate-content">';
    html += '<div class="fate-main">';
    html += '<div class="fate-pattern-badge">' + pattern.primaryPattern + '</div>';
    if (pattern.specialPatterns.length > 0) {
      html += '<div class="fate-special">' + pattern.specialPatterns.map(function(p) { return '<span class="special-tag">' + p + '</span>'; }).join('') + '</div>';
    }
    html += '<p class="fate-desc">' + pattern.description + '</p>';
    html += '</div>';

    html += '<div class="fate-summary">';
    html += '<h3>命局总论</h3>';
    html += '<p>' + currentBazi.fateSummary + '</p>';
    html += '</div>';

    // Auspicious stars detail
    if (auspicious.length > 0) {
      html += '<div class="fate-stars"><h4>吉神庇佑</h4>';
      auspicious.forEach(function(s) {
        html += '<div class="star-detail auspicious"><strong>' + s.name + '</strong><p>' + s.desc + '</p></div>';
      });
      html += '</div>';
    }
    if (inauspicious.length > 0) {
      html += '<div class="fate-stars"><h4>需注意</h4>';
      inauspicious.forEach(function(s) {
        html += '<div class="star-detail warning"><strong>' + s.name + '</strong><p>' + s.desc + '</p></div>';
      });
      html += '</div>';
    }

    html += '</div>';
    section.innerHTML = html;
  }

  function createFateSection() {
    var section = document.createElement('section');
    section.id = 'fateSection';
    section.className = 'fate-section';
    var pillarsSection = document.querySelector('.pillars-section');
    pillarsSection.parentNode.insertBefore(section, pillarsSection.nextSibling);
    return section;
  }

  // ─── Render Elements ───
  function renderElements() {
    var content = $('elementsContent');
    var analysis = currentBazi.elementAnalysis;
    var barsHTML = '<div class="elements-bars">';
    analysis.forEach(function(a) {
      barsHTML +=
        '<div class="element-bar-row">' +
        '<span class="element-bar-label" style="color:' + Core.ELEM_COLORS[a.element] + '">' + a.element + '</span>' +
        '<div class="element-bar-track"><div class="element-bar-fill ' + {木:'wood',火:'fire',土:'earth',金:'metal',水:'water'}[a.element] + '" style="width:' + a.percentage + '%"></div></div>' +
        '<span class="element-bar-count">' + a.status + '</span></div>';
    });
    barsHTML += '</div>';

    var strength = currentBazi.strength;
    var verdictHTML =
      '<div class="elements-verdict"><h3>日主' + strength.level + '</h3>' +
      '<p>日主' + currentBazi.day.stem.char + '(' + currentBazi.day.stem.element + ')，综合评分' + (strength.score * 100).toFixed(0) + '分。' +
      '喜用神：<span style="color:' + Core.ELEM_COLORS[strength.favorable[0]] + '">' + strength.favorable[0] + '</span>' +
      (strength.favorable[1] ? '、<span style="color:' + Core.ELEM_COLORS[strength.favorable[1]] + '">' + strength.favorable[1] + '</span>' : '') +
      '。忌神：<span style="color:' + Core.ELEM_COLORS[strength.unfavorable[0]] + '">' + strength.unfavorable[0] + '</span>。</p></div>';
    content.innerHTML = barsHTML + verdictHTML;
  }

  // ─── Render Ten Gods ───
  function renderTenGods() {
    var table = $('tenGodsTable');
    var pillars = ['year', 'month', 'day', 'hour'];
    var labels = ['年柱', '月柱', '日柱', '时柱'];
    var html = '<table><thead><tr><th></th>';
    labels.forEach(function(l) { html += '<th>' + l + '</th>'; });
    html += '</tr></thead><tbody>';
    html += '<tr><td>天干</td>';
    pillars.forEach(function(p) {
      html += '<td' + (currentBazi.tenGods[p].stemGod === '日主' ? ' class="day-master-cell"' : '') + '>' + currentBazi[p].stem.char + '</td>';
    });
    html += '</tr><tr><td>十神</td>';
    pillars.forEach(function(p) {
      html += '<td' + (currentBazi.tenGods[p].stemGod === '日主' ? ' class="day-master-cell"' : '') + '>' + currentBazi.tenGods[p].stemGod + '</td>';
    });
    html += '</tr><tr><td>地支</td>';
    pillars.forEach(function(p) { html += '<td>' + currentBazi[p].branch.char + '</td>'; });
    html += '</tr><tr><td>纳音</td>';
    pillars.forEach(function(p) { html += '<td>' + currentBazi[p].nayin + '</td>'; });
    html += '</tr><tr><td>藏干</td>';
    pillars.forEach(function(p) {
      html += '<td style="font-size:0.8rem;color:var(--text-muted)">' + currentBazi[p].hiddenStems.map(function(h) { return h.stem; }).join(' ') + '</td>';
    });
    html += '</tr></tbody></table>';
    table.innerHTML = html;
  }

  // ─── Render Shen Sha ───
  function renderShenSha() {
    var grid = $('shenshaGrid');
    var shensha = currentBazi.shensha;
    if (shensha.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;width:100%">命局平和，未出现明显神煞</p>';
      return;
    }
    grid.innerHTML = '';
    shensha.forEach(function(s) {
      var tag = document.createElement('span');
      tag.className = 'shensha-tag ' + s.type;
      tag.textContent = s.name;
      tag.title = s.desc;
      grid.appendChild(tag);
    });
  }

  // ─── Render Da Yun ───
  function renderDaYun() {
    var info = $('dayunInfo');
    var timeline = $('dayunTimeline');
    var dayun = currentBazi.dayun;
    var age = currentBazi.age;
    info.innerHTML = '起运年龄：<span>' + dayun.startAge + '岁</span> · 排法：<span>' + dayun.direction + '</span> · 距节气<span>' + dayun.daysToTerm + '</span>天 · 当前年龄：<span>' + age + '岁</span>';
    timeline.innerHTML = '';
    var dmStem = currentBazi.day.stem;
    dayun.pillars.forEach(function(dy) {
      var tenGod = Gods.getTenGod(dmStem, dy.stem);
      var isCurrent = (age >= dy.ageStart && age <= dy.ageEnd);
      var card = document.createElement('div');
      card.className = 'dayun-card';
      if (isCurrent) card.classList.add('current');
      card.innerHTML =
        '<div class="dayun-age">' + dy.ageStart + '-' + dy.ageEnd + '岁</div>' +
        '<div class="dayun-stem">' + dy.stem.char + '</div>' +
        '<div class="dayun-branch">' + dy.branch.char + '</div>' +
        '<div class="dayun-tengod">' + tenGod + '</div>' +
        '<div class="dayun-nayin">' + dy.nayin + '</div>' +
        (isCurrent ? '<div style="font-size:0.65rem;color:var(--gold);margin-top:4px">◀ 当前 ▶</div>' : '');
      timeline.appendChild(card);
    });
  }

  // ─── Render Liu Nian ───
  function renderLiuNian() {
    var content = $('liunianContent');
    var liuNian = currentBazi.liuNian;
    var analysis = currentBazi.liuNianAnalysis;
    var html =
      '<div class="liunian-pillar">' +
      '<div><div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">天干</div><div class="liunian-stem">' + liuNian.stem.char + '</div><div style="font-size:0.75rem;color:var(--text-secondary)">' + liuNian.stem.element + '</div></div>' +
      '<div style="font-size:1.5rem;color:var(--gold)">·</div>' +
      '<div><div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">地支</div><div class="liunian-branch">' + liuNian.branch.char + '</div><div style="font-size:0.75rem;color:var(--text-secondary)">' + liuNian.branch.animal + ' · ' + liuNian.branch.element + '</div></div>' +
      '</div><div class="liunian-detail">';
    analysis.forEach(function(a) {
      var color = 'var(--text-secondary)';
      if (a.type === 'clash') color = 'var(--red)';
      if (a.type === 'warning') color = 'var(--gold-light)';
      if (a.type === 'good') color = 'var(--green)';
      html += '<p style="color:' + color + ';margin-bottom:6px">' + a.text + '</p>';
    });
    html += '</div>';
    content.innerHTML = html;
  }

  // ─── Render Predictions ───
  function renderPredictions(category) {
    var content = $('predContent');
    var titles = {
      'fate': '命格详解',
      'yearly': '逐年运势',
      'love': '爱情姻缘',
      'wealth': '财运事业',
      'fortune': '运势总览',
      'career': '事业前程',
      'health': '健康平安',
      'caution': '近期注意',
      'advice': '当前建议'
    };

    if (category === 'fate') {
      content.innerHTML = '<h3>' + titles[category] + '</h3><div>' + currentBazi.fateSummary + '</div>';
      return;
    }

    var text = currentPredictions[category] || '';
    content.innerHTML = '<div class="pred-body">' + text + '</div>';
  }

  // ─── Prediction Tab Switching ───
  var activeTab = 'yearly';
  var predTabs = document.querySelectorAll('.pred-tab');
  predTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      predTabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      activeTab = tab.getAttribute('data-tab');
      renderPredictions(activeTab);
    });
  });

  // ─── Particle Background — Grand Cosmic System ───
  function initParticles() {
    var canvas = $('particles');
    var ctx = canvas.getContext('2d');
    var w, h;
    var mouseX = 0, mouseY = 0;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // ═══════════════════════════════════════════
    // Layer 1: GRAND GLYPHS — massive floating characters
    // ═══════════════════════════════════════════
    var grandGlyphs = [
      '甲','乙','丙','丁','戊','己','庚','辛','壬','癸',
      '子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥',
      '木','火','土','金','水',
      '命','运','道','天','地','阴','阳','玄','机','气',
      '生','克','制','化','刑','冲','合','害'
    ];
    var glyphs = [];
    for (var i = 0; i < 22; i++) {
      glyphs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        c: grandGlyphs[Math.floor(Math.random() * grandGlyphs.length)],
        size: Math.random() * 70 + 40,       // 40-110px — BIG
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: (Math.random() - 0.5) * 0.2 - 0.05,
        opacity: Math.random() * 0.08 + 0.03, // 0.03-0.11
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.003 + 0.002
      });
    }

    // ═══════════════════════════════════════════
    // Layer 2: COSMIC ORBS — large glowing energy spheres
    // ═══════════════════════════════════════════
    var orbs = [];
    var orbColors = [
      { r: 212, g: 168, b: 67 },   // gold
      { r: 96, g: 165, b: 250 },   // blue
      { r: 248, g: 113, b: 113 },  // red
      { r: 74, g: 222, b: 128 },   // green
      { r: 180, g: 130, b: 220 }   // purple
    ];
    for (var i = 0; i < 10; i++) {
      var c = orbColors[Math.floor(Math.random() * orbColors.length)];
      orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 180 + 60,        // 60-240px radius — BIG
        speedX: (Math.random() - 0.5) * 0.12,
        speedY: (Math.random() - 0.5) * 0.12,
        color: c,
        opacity: Math.random() * 0.04 + 0.015,
        phase: Math.random() * Math.PI * 2
      });
    }

    // ═══════════════════════════════════════════
    // Layer 3: RISING EMBERS — golden fireflies drifting upward
    // ═══════════════════════════════════════════
    var embers = [];
    for (var i = 0; i < 70; i++) {
      embers.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: -Math.random() * 0.6 - 0.15,  // rising
        opacity: Math.random() * 0.7 + 0.2,
        phase: Math.random() * Math.PI * 2,
        freq: Math.random() * 0.03 + 0.01,
        hue: Math.random() < 0.7 ? 40 : Math.random() < 0.5 ? 210 : 0
      });
    }

    // ═══════════════════════════════════════════
    // Layer 4: SHOOTING STARS — comets streaking across
    // ═══════════════════════════════════════════
    var comets = [];
    function spawnComet() {
      var fromLeft = Math.random() < 0.5;
      comets.push({
        x: fromLeft ? -60 : w + 60,
        y: Math.random() * h * 0.7,
        vx: fromLeft ? Math.random() * 2 + 1.5 : -(Math.random() * 2 + 1.5),
        vy: Math.random() * 1.2 + 0.3,
        life: 1,
        len: Math.random() * 120 + 60,
        r: Math.random() * 1.5 + 0.5
      });
      if (comets.length > 5) comets.shift();
    }
    spawnComet();
    setInterval(function() {
      if (comets.length < 5 && Math.random() < 0.5) spawnComet();
    }, 4000);

    // ═══════════════════════════════════════════
    // Layer 5: ENERGY RIBBONS — flowing silk waves
    // ═══════════════════════════════════════════
    var ribbons = [];
    for (var i = 0; i < 4; i++) {
      ribbons.push({
        points: [],
        numPoints: 60,
        amplitude: Math.random() * 80 + 60,
        frequency: Math.random() * 0.004 + 0.002,
        speed: Math.random() * 0.3 + 0.2,
        offset: Math.random() * Math.PI * 2,
        yBase: Math.random() * h * 0.6 + h * 0.2,
        opacity: Math.random() * 0.06 + 0.025,
        phase: Math.random() * Math.PI * 2
      });
      // Initialize ribbon points
      for (var j = 0; j < ribbons[i].numPoints; j++) {
        ribbons[i].points.push({ x: 0, y: 0 });
      }
    }

    var time = 0;
    function animate() {
      time++;
      ctx.clearRect(0, 0, w, h);

      // ─────────────────────────────────────
      // Draw COSMIC ORBS first (background layer)
      // ─────────────────────────────────────
      orbs.forEach(function(o) {
        o.x += o.speedX;
        o.y += o.speedY;
        if (o.x < -o.r) o.x = w + o.r;
        if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r;
        if (o.y > h + o.r) o.y = -o.r;

        var flicker = 1 + Math.sin(time * 0.008 + o.phase) * 0.3;
        var alpha = o.opacity * flicker;

        var gradient = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        gradient.addColorStop(0, 'rgba(' + o.color.r + ',' + o.color.g + ',' + o.color.b + ', ' + (alpha * 2.5) + ')');
        gradient.addColorStop(0.3, 'rgba(' + o.color.r + ',' + o.color.g + ',' + o.color.b + ', ' + (alpha * 1.2) + ')');
        gradient.addColorStop(0.7, 'rgba(' + o.color.r + ',' + o.color.g + ',' + o.color.b + ', ' + (alpha * 0.2) + ')');
        gradient.addColorStop(1, 'rgba(' + o.color.r + ',' + o.color.g + ',' + o.color.b + ', 0)');

        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // ─────────────────────────────────────
      // Draw ENERGY RIBBONS
      // ─────────────────────────────────────
      ribbons.forEach(function(rib) {
        rib.offset += rib.speed * 0.01;

        for (var j = 0; j < rib.numPoints; j++) {
          var t = j / rib.numPoints;
          var x = t * w;
          var y = rib.yBase + Math.sin(t * rib.frequency * w + rib.offset + rib.phase) * rib.amplitude
                + Math.cos(t * rib.frequency * w * 1.7 + rib.offset * 0.7) * rib.amplitude * 0.4;
          rib.points[j].x = x;
          rib.points[j].y = y;
        }

        ctx.beginPath();
        ctx.moveTo(rib.points[0].x, rib.points[0].y);
        for (var j = 1; j < rib.numPoints - 2; j++) {
          var xc = (rib.points[j].x + rib.points[j + 1].x) / 2;
          var yc = (rib.points[j].y + rib.points[j + 1].y) / 2;
          ctx.quadraticCurveTo(rib.points[j].x, rib.points[j].y, xc, yc);
        }
        ctx.strokeStyle = 'rgba(212, 168, 67, ' + rib.opacity + ')';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Glow pass
        ctx.beginPath();
        ctx.moveTo(rib.points[0].x, rib.points[0].y);
        for (var k = 1; k < rib.numPoints - 2; k++) {
          var xc2 = (rib.points[k].x + rib.points[k + 1].x) / 2;
          var yc2 = (rib.points[k].y + rib.points[k + 1].y) / 2;
          ctx.quadraticCurveTo(rib.points[k].x, rib.points[k].y, xc2, yc2);
        }
        ctx.strokeStyle = 'rgba(212, 168, 67, ' + (rib.opacity * 0.3) + ')';
        ctx.lineWidth = 4;
        ctx.stroke();
      });

      // ─────────────────────────────────────
      // Draw SHOOTING STARS
      // ─────────────────────────────────────
      comets.forEach(function(c) {
        c.x += c.vx;
        c.y += c.vy;
        c.life -= 0.004;
        if (c.life <= 0 || c.x < -120 || c.x > w + 120 || c.y > h + 120) return;

        var grad = ctx.createLinearGradient(
          c.x, c.y,
          c.x - c.vx * c.len, c.y - c.vy * c.len
        );
        grad.addColorStop(0, 'rgba(255, 255, 255, ' + (c.life * 0.9) + ')');
        grad.addColorStop(0.1, 'rgba(255, 220, 180, ' + (c.life * 0.6) + ')');
        grad.addColorStop(0.5, 'rgba(212, 168, 67, ' + (c.life * 0.2) + ')');
        grad.addColorStop(1, 'rgba(212, 168, 67, 0)');

        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * c.len, c.y - c.vy * c.len);
        ctx.strokeStyle = grad;
        ctx.lineWidth = c.r * 2;
        ctx.stroke();

        // Head glow
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 240, 220, ' + (c.life * 0.5) + ')';
        ctx.fill();
      });
      // Clean dead comets and occasionally spawn
      comets = comets.filter(function(c) { return c.life > 0 && c.x > -120 && c.x < w + 120 && c.y < h + 120; });

      // ─────────────────────────────────────
      // Draw RISING EMBERS
      // ─────────────────────────────────────
      embers.forEach(function(e) {
        e.x += e.speedX + Math.sin(time * e.freq + e.phase) * 0.2;
        e.y += e.speedY + Math.cos(time * e.freq * 1.3 + e.phase) * 0.15;
        e.phase += 0.01;

        if (e.y < -20) { e.y = h + 20; e.x = Math.random() * w; }
        if (e.x < -20) e.x = w + 20;
        if (e.x > w + 20) e.x = -20;
        if (e.y > h + 20) e.y = -20;

        var sparkle = 0.3 + 0.7 * Math.sin(time * 0.04 + e.phase);
        var alpha = e.opacity * sparkle;
        var color = e.hue === 40 ? '212, 168, 67' : e.hue === 210 ? '96, 165, 250' : '248, 113, 113';

        // Outer glow
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 3, 0, Math.PI * 2);
        var glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 3);
        glow.addColorStop(0, 'rgba(' + color + ', ' + (alpha * 0.5) + ')');
        glow.addColorStop(1, 'rgba(' + color + ', 0)');
        ctx.fillStyle = glow;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + color + ', ' + alpha + ')';
        ctx.fill();
      });

      // ─────────────────────────────────────
      // Draw GRAND GLYPHS
      // ─────────────────────────────────────
      glyphs.forEach(function(g) {
        g.x += g.speedX;
        g.y += g.speedY;
        g.phase += g.pulseSpeed;

        if (g.x < -120) g.x = w + 120;
        if (g.x > w + 120) g.x = -120;
        if (g.y < -120) g.y = h + 120;
        if (g.y > h + 120) g.y = -120;

        var pulse = 1 + Math.sin(g.phase) * 0.4;
        var alpha = g.opacity * pulse;
        alpha = Math.max(0.015, Math.min(0.15, alpha));

        // Mouse proximity — slightly brighter near cursor
        var dx = g.x - mouseX;
        var dy = g.y - mouseY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          alpha += 0.04 * (1 - dist / 300);
        }

        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.font = g.size + 'px "Ma Shan Zheng", "KaiTi", "STKaiti", serif';

        // Outer glow
        ctx.fillStyle = 'rgba(212, 168, 67, ' + (alpha * 0.25) + ')';
        ctx.fillText(g.c, -3, -3);
        ctx.fillText(g.c, 3, -3);
        ctx.fillText(g.c, -3, 3);
        ctx.fillText(g.c, 3, 3);

        // Main glyph
        ctx.fillStyle = 'rgba(212, 168, 67, ' + alpha + ')';
        ctx.fillText(g.c, 0, 0);
        ctx.restore();
      });

      // ─────────────────────────────────────
      // Constellation mesh between nearby embers
      // ─────────────────────────────────────
      for (var i = 0; i < embers.length; i += 4) {
        for (var j = i + 1; j < embers.length; j += 4) {
          var dx = embers[i].x - embers[j].x;
          var dy = embers[i].y - embers[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(embers[i].x, embers[i].y);
            ctx.lineTo(embers[j].x, embers[j].y);
            ctx.strokeStyle = 'rgba(212, 168, 67, ' + (0.04 * (1 - dist / 130)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }
    animate();
  }

  // ─── Scroll Reveal ───
  function initScrollReveal() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.results > section').forEach(function(section) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(section);
    });
  }

  // ─── Init ───
  function init() { initParticles(); initScrollReveal(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
