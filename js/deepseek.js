/* ===== DeepSeek API — AI-Powered Personalized Predictions ===== */
window.DeepSeekAI = (function() {
  'use strict';

  // ⚠️ SECURITY WARNING: In a production environment, NEVER expose API keys in client-side code.
  // Anyone can view your page source and steal the key. Use a backend proxy or serverless function.
  var API_KEY = 'sk-32ae8ceae83a4502b115282ef8a95882';
  var API_URL = 'https://api.deepseek.com/v1/chat/completions';
  var MODEL = 'deepseek-chat';
  var TIMEOUT_MS = 30000;

  var Core = window.BaziCore;
  var Gods = window.GodsStars;
  var DaYun = window.DaYun;

  // ─── Build comprehensive Bazi profile for the AI ───
  function buildBaziProfile(bazi, strength, elementAnalysis, shensha, dayun, liuNian, liuNianAnalysis, age, birthYear, birthMonth, birthDay, pattern) {
    var profile = [];
    var STEMS = Core.STEMS;
    var BRANCHES = Core.BRANCHES;

    // Helper: get element for a stem character
    function stemElem(c) {
      for (var i = 0; i < STEMS.length; i++) {
        if (STEMS[i].char === c) return STEMS[i].element;
      }
      return '?';
    }

    // Helper: format hidden stems
    function fmtHidden(branchChar) {
      var hs = Core.HIDDEN_STEMS[branchChar] || [];
      return hs.map(function(h) { return h.stem + '(' + stemElem(h.stem) + ',' + (h.weight*100).toFixed(0) + '%)'; }).join('、');
    }

    // 1. Four Pillars
    profile.push('【八字四柱】');
    var pillarNames = { year:'年柱', month:'月柱', day:'日柱（日主）', hour:'时柱' };
    ['year','month','day','hour'].forEach(function(p) {
      var pd = bazi[p];
      profile.push(pillarNames[p] + '：' + pd.stem.char + pd.branch.char +
        '（天干' + pd.stem.element + '，地支' + pd.branch.element +
        '，纳音' + pd.nayin +
        '，藏干：' + fmtHidden(pd.branch.char) + '）');
    });

    // 2. Day Master
    var dm = bazi.day.stem;
    profile.push('\n【日主】');
    profile.push('日主' + dm.char + '（五行属' + dm.element + '，' + dm.yinYang + '性）');
    var monthMainQi = (Core.HIDDEN_STEMS[bazi.month.branch.char] || [])[0];
    profile.push('生于' + bazi.month.branch.char + '月，月令主气为' + (monthMainQi ? monthMainQi.stem + '(' + stemElem(monthMainQi.stem) + ')' : '未知'));

    // 3. Element Distribution
    profile.push('\n【五行分布】');
    elementAnalysis.forEach(function(ea) {
      profile.push(ea.element + '：' + ea.percentage.toFixed(0) + '%（' + ea.status + '，计' + ea.count.toFixed(1) + '）');
    });

    // 4. Strength & Favorable/Unfavorable
    profile.push('\n【日主强弱与喜忌】');
    profile.push('强弱评定：' + strength.level + '（评分' + (strength.score * 100).toFixed(0) + '分）');
    profile.push('用神（喜神）：' + strength.favorable.join('、'));
    profile.push('忌神：' + strength.unfavorable.join('、'));

    // 5. Pattern
    profile.push('\n【格局】');
    profile.push('主格：' + pattern.primaryPattern);
    if (pattern.specialPatterns && pattern.specialPatterns.length > 0) {
      profile.push('特殊格局：' + pattern.specialPatterns.join('、'));
    }

    // 6. Ten Gods
    profile.push('\n【十神配置】');
    var tenGods = Gods.getAllTenGods(bazi);
    ['year','month','day','hour'].forEach(function(p) {
      profile.push(pillarNames[p].replace('（日主）','') + '十神：天干为' + tenGods[p].stemGod + '，地支为' + tenGods[p].branchGod);
    });

    // 7. Shen Sha
    profile.push('\n【神煞】');
    if (shensha.length > 0) {
      shensha.forEach(function(s) {
        profile.push(s.name + '（' + (s.type === 'auspicious' ? '吉神' : s.type === 'inauspicious' ? '凶煞' : '中性') + '）：' + s.desc);
      });
    } else {
      profile.push('（命局无特殊神煞入命）');
    }

    // 8. Da Yun — compute ten god for each pillar
    profile.push('\n【大运】');
    profile.push('起运年龄：' + dayun.startAge + '岁，排运方向：' + dayun.direction);
    profile.push('起运天数距节气：' + dayun.daysToTerm + '天');
    var dmStem = bazi.day.stem;
    dayun.pillars.forEach(function(d, i) {
      var dyTenGod = Gods.getTenGod(dmStem, d.stem);
      var isCurrent = (age >= d.ageStart && age <= d.ageEnd);
      profile.push('第' + (i+1) + '步大运：' + d.stem.char + d.branch.char +
        '（纳音' + d.nayin + '，' + d.ageStart + '-' + d.ageEnd + '岁，十神：' + dyTenGod + '）' +
        (isCurrent ? ' ← 当前所在大运' : ''));
    });

    // 9. Liu Nian analysis
    profile.push('\n【流年分析】');
    if (liuNianAnalysis && liuNianAnalysis.length > 0) {
      profile.push('当前' + liuNian.year + '年（' + liuNian.stem.char + liuNian.branch.char + '年）：');
      liuNianAnalysis.forEach(function(a) {
        if (typeof a === 'string') {
          profile.push('  ' + a);
        } else if (a && a.text) {
          profile.push('  ' + (a.type ? '[' + a.type + '] ' : '') + a.text);
        }
      });
    }

    // 10. Multi-year scoring
    var years = DaYun.scoreMultipleYears(bazi, dayun, age, birthYear, birthMonth, birthDay, 6);
    profile.push('\n【未来流年评分（逐年详析）】');
    years.forEach(function(y) {
      profile.push(y.year + '年（' + y.liuNian.stem.char + y.liuNian.branch.char + '年）：' +
        '天干' + y.liuNian.stem.char + '(' + y.liuNian.stem.element + ')，地支' + y.liuNian.branch.char + '(' + y.liuNian.branch.element + ')，' +
        '流年十神=' + y.tenGod + '，综合评分=' + y.score + '分，评级=' + y.rating +
        ' | 感情' + y.categories.love.score + ' 事业' + y.categories.career.score +
        ' 财运' + y.categories.wealth.score + ' 健康' + y.categories.health.score);
      if (y.highlights.length > 0) profile.push('  吉兆：' + y.highlights.join('；'));
      if (y.warnings.length > 0) profile.push('  凶兆：' + y.warnings.join('；'));
    });

    return profile.join('\n');
  }

  // ─── Build the prompt for DeepSeek ───
  function buildPrompt(baziProfile, birthYear, birthMonth, birthDay) {
    var systemPrompt =
      '你是一位精通子平八字的命理大师，研习八字三十余年，断命无数。' +
      '你的特点是：用最专业的八字术语做诊断，然后用命主能听懂的人话翻译出来。' +
      '你的语言风格神秘而笃定，像一位真正的算命先生——不模棱两可，不泛泛而谈。' +
      '你善于从八字中找到命主内心最深的恐惧和渴望，并用命理逻辑给出令人信服的解释。' +
      '你的回答必须完全因人而异——不同的八字，不同的命运，不同的语言。' +
      '绝不使用任何模板化的套话。每一个断语都必须紧扣命主的具体命局。' +
      '重要：使用"刺痛→解释→解法→预售"的心理框架——先让命主感到被看穿，再用命理解释原因，给出具体解法，最后承诺转机。';

    var userPrompt =
      '以下是一位出生於' + birthYear + '年' + birthMonth + '月' + birthDay + '日的命主的完整八字命盘：\n\n' +
      baziProfile + '\n\n' +
      '请根据以上命盘信息，为此命主生成6个类别的详细预测。每个类别约150-300字。\n\n' +
      '1. **逐年运势**：分析未来3-5年每年的核心主题。必须结合具体的干支组合、十神变化、刑冲合害来解释为什么某年好某年坏。指出哪一年是"转机年"。\n' +
      '2. **爱情姻缘**：从夫妻宫（日支）的五行生克、配偶星的旺衰位置、桃花/孤辰/红鸾/天喜等神煞入手，精准诊断命主在感情中的底层模式。指出具体的缘分窗口年份。\n' +
      '3. **财运事业**：从格局（财格/官格/印格等）、财星是否透干、比劫是否夺财、日主能否担财入手。用专业术语解释命主的财富逻辑，给出具体年份的财运策略。\n' +
      '4. **健康平安**：从五行偏枯（哪个五行最弱）、羊刃/血光神煞、五行-脏腑对应关系入手。指出最需要关注的器官系统和具体的高风险年份。\n' +
      '5. **近期注意**：综合刑冲合害（六冲/六合/三刑/伏吟）、太岁关系、忌神流年，列出当前和未来2-3年最需要注意的具体事项。\n' +
      '6. **当前建议**：基于格局和用神忌神，给出命主当下最应该做的3-5件具体事项。包括宜忌方向、宜忌行业、宜忌颜色等。\n\n' +
      '格式要求：每个类别以"## 类别名"开头，内容紧随其后。类别之间用空行分隔。\n' +
      '内容中请大量使用专业八字术语（如用神、忌神、格局、十神、刑冲合害、六冲、六合、伏吟、夫妻宫、配偶星、财星、官星、印星等），每个术语后附简洁的人话解释。\n' +
      '必须完全基于此命主的具体命盘来写，不要使用任何泛泛而谈的模板句子。每个命主的八字不同，断语就要不同。\n' +
      '语言要：神秘、笃定、专业、有温度。像一位真正的老算命先生在对你说话。';

    return { system: systemPrompt, user: userPrompt };
  }

  // ─── Call DeepSeek API ───
  function callAPI(systemPrompt, userPrompt) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', API_URL, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', 'Bearer ' + API_KEY);
      xhr.timeout = TIMEOUT_MS;

      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            var data = JSON.parse(xhr.responseText);
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
              resolve(data.choices[0].message.content);
            } else {
              reject(new Error('API返回格式异常：' + xhr.responseText.substring(0, 200)));
            }
          } catch(e) {
            reject(new Error('JSON解析失败：' + e.message));
          }
        } else {
          reject(new Error('API请求失败 HTTP ' + xhr.status + '：' + xhr.responseText.substring(0, 200)));
        }
      };

      xhr.onerror = function() { reject(new Error('网络请求失败，请检查网络连接')); };
      xhr.ontimeout = function() { reject(new Error('API请求超时（' + (TIMEOUT_MS/1000) + '秒）')); };

      var body = JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 4096,
        top_p: 0.95
      });

      xhr.send(body);
    });
  }

  // ─── Parse AI response into categories ───
  function parseResponse(rawText) {
    var categories = {
      yearly: '',
      love: '',
      wealth: '',
      health: '',
      caution: '',
      advice: ''
    };

    var catMap = {
      '逐年运势': 'yearly',
      '爱情姻缘': 'love',
      '财运事业': 'wealth',
      '健康平安': 'health',
      '近期注意': 'caution',
      '当前建议': 'advice'
    };

    // Split by ## markers
    var sections = rawText.split(/##\s*/);
    sections.forEach(function(section) {
      section = section.trim();
      if (!section) return;

      // Try to match category name
      var matched = false;
      Object.keys(catMap).forEach(function(name) {
        if (section.indexOf(name) === 0) {
          var content = section.substring(name.length).trim();
          // Remove leading newlines and dashes
          content = content.replace(/^[\s\n\r-]+/, '').trim();
          // Wrap paragraphs in <p> tags
          content = content.replace(/\n\n/g, '</p><p>');
          content = content.replace(/\n/g, '<br>');
          content = '<p>' + content + '</p>';
          categories[catMap[name]] = content;
          matched = true;
        }
      });

      // Also try matching without the Chinese label (AI might use different format)
      if (!matched) {
        // Try to guess from content
        var lower = section.toLowerCase();
        if (lower.indexOf('逐年') >= 0 || lower.indexOf('yearly') >= 0) {
          categories.yearly = wrapContent(cleanSection(section));
        } else if (lower.indexOf('爱情') >= 0 || lower.indexOf('姻缘') >= 0 || lower.indexOf('love') >= 0) {
          categories.love = wrapContent(cleanSection(section));
        } else if (lower.indexOf('财运') >= 0 || lower.indexOf('事业') >= 0 || lower.indexOf('wealth') >= 0) {
          categories.wealth = wrapContent(cleanSection(section));
        } else if (lower.indexOf('健康') >= 0 || lower.indexOf('health') >= 0) {
          categories.health = wrapContent(cleanSection(section));
        } else if (lower.indexOf('注意') >= 0 || lower.indexOf('预警') >= 0 || lower.indexOf('caution') >= 0) {
          categories.caution = wrapContent(cleanSection(section));
        } else if (lower.indexOf('建议') >= 0 || lower.indexOf('指南') >= 0 || lower.indexOf('advice') >= 0) {
          categories.advice = wrapContent(cleanSection(section));
        }
      }
    });

    return categories;
  }

  function cleanSection(text) {
    // Remove the category label (first line) if it looks like a title
    var lines = text.split('\n');
    if (lines.length > 1 && (lines[0].indexOf('**') >= 0 || lines[0].length < 20)) {
      lines.shift();
    }
    return lines.join('\n').trim();
  }

  function wrapContent(text) {
    if (!text) return '';
    text = text.replace(/\n\n/g, '</p><p>');
    text = text.replace(/\n/g, '<br>');
    return '<p>' + text + '</p>';
  }

  // ─── Format AI content into the same structure as template predictions ───
  function formatAIPredictions(aiCategories, bazi, strength, shensha, pattern) {
    var titles = {
      yearly: '流年推演 · 逐年命程',
      love: '夫妻宫论断 · 姻缘天机',
      wealth: '财官论断 · 功名利禄',
      health: '身命根基 · 健康玄机',
      caution: '流年预警 · 趋吉避凶',
      advice: '格局调候 · 当下指引'
    };

    var result = {};
    Object.keys(titles).forEach(function(cat) {
      var content = aiCategories[cat] || '';
      if (content) {
        // Add the artistic title and wrap in pred-body
        result[cat] = '<h3>' + titles[cat] + '</h3>\n' + content;
      } else {
        result[cat] = '';
      }
    });

    return result;
  }

  // ─── Main public function ───
  function generatePredictions(bazi, strength, elementAnalysis, shensha, dayun, liuNian, liuNianAnalysis, age, birthYear, birthMonth, birthDay, pattern) {
    // Build the bazi profile
    var profile = buildBaziProfile(bazi, strength, elementAnalysis, shensha, dayun, liuNian, liuNianAnalysis, age, birthYear, birthMonth, birthDay, pattern);

    // Build prompt
    var prompts = buildPrompt(profile, birthYear, birthMonth, birthDay);

    // Call API and parse response
    return callAPI(prompts.system, prompts.user).then(function(rawText) {
      var categories = parseResponse(rawText);
      var formatted = formatAIPredictions(categories, bazi, strength, shensha, pattern);

      // Verify we got enough content
      var filledCount = 0;
      Object.keys(formatted).forEach(function(k) { if (formatted[k] && formatted[k].length > 50) filledCount++; });

      if (filledCount < 3) {
        throw new Error('AI生成内容不足，仅' + filledCount + '个类别有有效内容');
      }

      return formatted;
    });
  }

  return {
    generatePredictions: generatePredictions,
    buildBaziProfile: buildBaziProfile
  };
})();
