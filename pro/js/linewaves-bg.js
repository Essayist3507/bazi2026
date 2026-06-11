/* ===== LineWaves — Exact vanilla WebGL port from React/OGL ===== */
(function() {
  'use strict';
  window.LineWaves = { init: init, destroy: destroy };

  var canvas, gl, program, animationId;
  var currentMouse = [0.5, 0.5], targetMouse = [0.5, 0.5];
  var uTimeLoc, uResLoc, uMouseLoc;

  function hexToVec3(hex) {
    var h = hex.replace('#','');
    return [parseInt(h.slice(0,2),16)/255, parseInt(h.slice(2,4),16)/255, parseInt(h.slice(4,6),16)/255];
  }

  var VERTEX = [
    'attribute vec2 uv;',
    'attribute vec2 position;',
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = vec4(position, 0, 1);',
    '}'
  ].join('\n');

  var FRAGMENT = [
    'precision highp float;',
    '',
    'uniform float uTime;',
    'uniform vec3 uResolution;',
    'uniform float uSpeed;',
    'uniform float uInnerLines;',
    'uniform float uOuterLines;',
    'uniform float uWarpIntensity;',
    'uniform float uRotation;',
    'uniform float uEdgeFadeWidth;',
    'uniform float uColorCycleSpeed;',
    'uniform float uBrightness;',
    'uniform vec3 uColor1;',
    'uniform vec3 uColor2;',
    'uniform vec3 uColor3;',
    'uniform vec2 uMouse;',
    'uniform float uMouseInfluence;',
    'uniform bool uEnableMouse;',
    '',
    '#define HALF_PI 1.5707963',
    '',
    'float hashF(float n) {',
    '  return fract(sin(n * 127.1) * 43758.5453123);',
    '}',
    '',
    'float smoothNoise(float x) {',
    '  float i = floor(x);',
    '  float f = fract(x);',
    '  float u = f * f * (3.0 - 2.0 * f);',
    '  return mix(hashF(i), hashF(i + 1.0), u);',
    '}',
    '',
    'float displaceA(float coord, float t) {',
    '  float result = sin(coord * 2.123) * 0.2;',
    '  result += sin(coord * 3.234 + t * 4.345) * 0.1;',
    '  result += sin(coord * 0.589 + t * 0.934) * 0.5;',
    '  return result;',
    '}',
    '',
    'float displaceB(float coord, float t) {',
    '  float result = sin(coord * 1.345) * 0.3;',
    '  result += sin(coord * 2.734 + t * 3.345) * 0.2;',
    '  result += sin(coord * 0.189 + t * 0.934) * 0.3;',
    '  return result;',
    '}',
    '',
    'vec2 rotate2D(vec2 p, float angle) {',
    '  float c = cos(angle);',
    '  float s = sin(angle);',
    '  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);',
    '}',
    '',
    'void main() {',
    '  vec2 coords = gl_FragCoord.xy / uResolution.xy;',
    '  coords = coords * 2.0 - 1.0;',
    '  coords = rotate2D(coords, uRotation);',
    '',
    '  float halfT = uTime * uSpeed * 0.5;',
    '  float fullT = uTime * uSpeed;',
    '',
    '  float mouseWarp = 0.0;',
    '  if (uEnableMouse) {',
    '    vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);',
    '    float mDist = length(coords - mPos);',
    '    mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);',
    '  }',
    '',
    '  float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;',
    '  float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;',
    '  float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;',
    '  float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;',
    '',
    '  vec2 fieldA = vec2(warpAx, warpAy);',
    '  vec2 fieldB = vec2(warpBx, warpBy);',
    '  vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));',
    '',
    '  float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);',
    '  float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);',
    '  float vMask = 1.0 - max(fadeTop, fadeBottom);',
    '',
    '  float tileCount = mix(uOuterLines, uInnerLines, vMask);',
    '  float scaledY = blended.y * tileCount;',
    '  float nY = smoothNoise(abs(scaledY));',
    '',
    '  float ridge = pow(',
    '    step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),',
    '    5.0',
    '  );',
    '',
    '  float lines = 0.0;',
    '  for (float i = 1.0; i < 3.0; i += 1.0) {',
    '    lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);',
    '  }',
    '',
    '  float pattern = vMask * lines;',
    '',
    '  float cycleT = fullT * uColorCycleSpeed;',
    '  float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);',
    '  float gChannel = (pattern + vMask * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);',
    '  float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);',
    '',
    '  vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;',
    '  float alpha = clamp(length(col), 0.0, 1.0);',
    '',
    '  gl_FragColor = vec4(col, alpha);',
    '}'
  ].join('\n');

  function createShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('LineWaves shader error:', gl.getShaderInfoLog(s));
      gl.deleteShader(s); return null;
    }
    return s;
  }

  function createQuad() {
    var verts = new Float32Array([
      -1,-1, 0,0,  1,-1, 1,0,  1,1, 1,1,
      -1,-1, 0,0,  1,1, 1,1,  -1,1, 0,1
    ]);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    var stride = 16;
    var pLoc = gl.getAttribLocation(program, 'position');
    var uLoc = gl.getAttribLocation(program, 'uv');
    if (pLoc >= 0) { gl.enableVertexAttribArray(pLoc); gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, stride, 0); }
    if (uLoc >= 0) { gl.enableVertexAttribArray(uLoc); gl.vertexAttribPointer(uLoc, 2, gl.FLOAT, false, stride, 8); }
    return { buffer: buf, count: 6 };
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr; canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uResLoc) gl.uniform3f(uResLoc, canvas.width, canvas.height, canvas.width / canvas.height);
    }
  }

  function handleMouse(e) {
    var r = canvas.getBoundingClientRect();
    targetMouse = [(e.clientX - r.left) / r.width, 1.0 - (e.clientY - r.top) / r.height];
  }
  function handleTouch(e) {
    if (e.touches.length > 0) {
      var r = canvas.getBoundingClientRect();
      targetMouse = [(e.touches[0].clientX - r.left) / r.width, 1.0 - (e.touches[0].clientY - r.top) / r.height];
    }
  }
  function handleMouseLeave() { targetMouse = [0.5, 0.5]; }

  function init(container, options) {
    var opts = options || {};
    container = typeof container === 'string' ? document.querySelector(container) : (container || document.body);
    if (!container) return false;

    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    container.appendChild(canvas);

    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
      || canvas.getContext('experimental-webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) { console.warn('LineWaves: WebGL not supported'); return false; }

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var vs = createShader(gl.VERTEX_SHADER, VERTEX);
    var fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT);
    if (!vs || !fs) return false;

    program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.warn('Link error'); return false; }
    gl.useProgram(program);

    var U = function(n) { return gl.getUniformLocation(program, n); };
    uTimeLoc = U('uTime'); uResLoc = U('uResolution'); uMouseLoc = U('uMouse');

    var c1 = opts.color1 ? (typeof opts.color1==='string'?hexToVec3(opts.color1):opts.color1) : [1,1,1];
    var c2 = opts.color2 ? (typeof opts.color2==='string'?hexToVec3(opts.color2):opts.color2) : [1,1,1];
    var c3 = opts.color3 ? (typeof opts.color3==='string'?hexToVec3(opts.color3):opts.color3) : [1,1,1];

    gl.uniform1f(U('uSpeed'), opts.speed != null ? opts.speed : 0.3);
    gl.uniform1f(U('uInnerLines'), opts.innerLineCount != null ? opts.innerLineCount : 32);
    gl.uniform1f(U('uOuterLines'), opts.outerLineCount != null ? opts.outerLineCount : 36);
    gl.uniform1f(U('uWarpIntensity'), opts.warpIntensity != null ? opts.warpIntensity : 1.0);
    gl.uniform1f(U('uRotation'), (opts.rotation != null ? opts.rotation : -45) * Math.PI / 180);
    gl.uniform1f(U('uEdgeFadeWidth'), opts.edgeFadeWidth != null ? opts.edgeFadeWidth : 0.0);
    gl.uniform1f(U('uColorCycleSpeed'), opts.colorCycleSpeed != null ? opts.colorCycleSpeed : 1.0);
    gl.uniform1f(U('uBrightness'), opts.brightness != null ? opts.brightness : 0.2);
    gl.uniform3f(U('uColor1'), c1[0], c1[1], c1[2]);
    gl.uniform3f(U('uColor2'), c2[0], c2[1], c2[2]);
    gl.uniform3f(U('uColor3'), c3[0], c3[1], c3[2]);
    gl.uniform1f(U('uMouseInfluence'), opts.mouseInfluence != null ? opts.mouseInfluence : 2.0);
    gl.uniform1i(U('uEnableMouse'), opts.enableMouse !== false ? 1 : 0);

    createQuad();
    resize();

    var interactive = opts.enableMouse !== false;
    if (interactive) {
      window.addEventListener('mousemove', handleMouse);
      window.addEventListener('touchmove', handleTouch, { passive: true });
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }
    window.addEventListener('resize', resize);

    function animate(time) {
      animationId = requestAnimationFrame(animate);
      var t = time * 0.001;
      gl.uniform1f(uTimeLoc, t);

      if (interactive && uMouseLoc) {
        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
        gl.uniform2f(uMouseLoc, currentMouse[0], currentMouse[1]);
      }

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    animationId = requestAnimationFrame(animate);
    return true;
  }

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('mousemove', handleMouse);
    window.removeEventListener('touchmove', handleTouch);
    if (canvas) canvas.removeEventListener('mouseleave', handleMouseLeave);
    window.removeEventListener('resize', resize);
    if (canvas && canvas.parentElement) canvas.parentElement.removeChild(canvas);
    if (gl) { var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }
    canvas = null; gl = null; program = null;
  }
})();
