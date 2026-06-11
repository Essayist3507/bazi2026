/* ===== LiquidChrome — Native WebGL Liquid Metal Background ===== */
(function() {
  'use strict';

  window.LiquidChrome = {
    init: init,
    destroy: destroy
  };

  var canvas, gl, program, animationId;
  var uniforms = {};
  var mouseX = 0.5, mouseY = 0.5;
  var startTime = performance.now();

  var defaultOptions = {
    baseColor: [0.08, 0.08, 0.08],
    speed: 0.25,
    amplitude: 0.3,
    frequencyX: 3.0,
    frequencyY: 3.0,
    interactive: true
  };

  // ─── Shaders (from LiquidChrome React component) ───
  var VERTEX_SHADER = [
    'attribute vec2 position;',
    'attribute vec2 uv;',
    'varying vec2 vUv;',
    'void main() {',
    '  vUv = uv;',
    '  gl_Position = vec4(position, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAGMENT_SHADER = [
    'precision highp float;',
    'uniform float uTime;',
    'uniform vec3 uResolution;',
    'uniform vec3 uBaseColor;',
    'uniform float uAmplitude;',
    'uniform float uFrequencyX;',
    'uniform float uFrequencyY;',
    'uniform vec2 uMouse;',
    'varying vec2 vUv;',

    'vec4 renderImage(vec2 uvCoord) {',
    '  vec2 fragCoord = uvCoord * uResolution.xy;',
    '  vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);',

    '  for (float i = 1.0; i < 10.0; i++) {',
    '    uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);',
    '    uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);',
    '  }',

    '  vec2 diff = (uvCoord - uMouse);',
    '  float dist = length(diff);',
    '  float falloff = exp(-dist * 20.0);',
    '  float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;',
    '  uv += (diff / (dist + 0.0001)) * ripple * falloff;',

    '  vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));',
    '  return vec4(color, 1.0);',
    '}',

    'void main() {',
    '  vec4 col = vec4(0.0);',
    '  int samples = 0;',
    '  for (int i = -1; i <= 1; i++) {',
    '    for (int j = -1; j <= 1; j++) {',
    '      vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));',
    '      col += renderImage(vUv + offset);',
    '      samples++;',
    '    }',
    '  }',
    '  gl_FragColor = col / float(samples);',
    '}'
  ].join('\n');

  // ─── Compile shader ───
  function createShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // ─── Create fullscreen quad geometry ───
  function createQuad() {
    // Two triangles covering clip space (-1 to 1) with UVs (0 to 1)
    var vertices = new Float32Array([
      // x, y,    u, v
      -1, -1,     0, 0,
       1, -1,     1, 0,
       1,  1,     1, 1,
      -1, -1,     0, 0,
       1,  1,     1, 1,
      -1,  1,     0, 1
    ]);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var stride = 4 * 4; // 4 floats * 4 bytes
    var posLoc = gl.getAttribLocation(program, 'position');
    var uvLoc = gl.getAttribLocation(program, 'uv');

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, stride, 0);

    if (uvLoc >= 0) {
      gl.enableVertexAttribArray(uvLoc);
      gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride, 2 * 4);
    }

    return { buffer: buf, count: 6 };
  }

  var quad;

  // ─── Resize ───
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);

      if (uniforms.uResolution) {
        gl.uniform3f(uniforms.uResolution, canvas.width, canvas.height, canvas.width / canvas.height);
      }
    }
  }

  // ─── Event handlers ───
  function handleMouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
  }

  function handleTouchMove(e) {
    if (e.touches.length > 0) {
      var rect = canvas.getBoundingClientRect();
      mouseX = (e.touches[0].clientX - rect.left) / rect.width;
      mouseY = 1.0 - (e.touches[0].clientY - rect.top) / rect.height;
    }
  }

  // ─── Init ───
  function init(container, options) {
    var opts = options || {};
    var baseColor = opts.baseColor || defaultOptions.baseColor;
    var speed = opts.speed != null ? opts.speed : defaultOptions.speed;
    var amplitude = opts.amplitude != null ? opts.amplitude : defaultOptions.amplitude;
    var frequencyX = opts.frequencyX != null ? opts.frequencyX : defaultOptions.frequencyX;
    var frequencyY = opts.frequencyY != null ? opts.frequencyY : defaultOptions.frequencyY;
    var interactive = opts.interactive != null ? opts.interactive : defaultOptions.interactive;

    container = container || document.body;
    if (typeof container === 'string') container = document.querySelector(container);

    // Create canvas
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    container.appendChild(canvas);

    // Get WebGL context
    gl = canvas.getContext('webgl', { antialias: true, alpha: false })
      || canvas.getContext('experimental-webgl', { antialias: true, alpha: false });

    if (!gl) {
      console.warn('WebGL not supported, falling back to static background');
      canvas.style.background = '#0a0a0a';
      return false;
    }

    gl.clearColor(baseColor[0], baseColor[1], baseColor[2], 1);

    // Compile shaders and create program
    var vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    var fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    if (!vs || !fs) {
      console.warn('Shader compilation failed');
      return false;
    }

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(program));
      return false;
    }

    gl.useProgram(program);

    // Cache uniform locations
    uniforms.uTime = gl.getUniformLocation(program, 'uTime');
    uniforms.uResolution = gl.getUniformLocation(program, 'uResolution');
    uniforms.uBaseColor = gl.getUniformLocation(program, 'uBaseColor');
    uniforms.uAmplitude = gl.getUniformLocation(program, 'uAmplitude');
    uniforms.uFrequencyX = gl.getUniformLocation(program, 'uFrequencyX');
    uniforms.uFrequencyY = gl.getUniformLocation(program, 'uFrequencyY');
    uniforms.uMouse = gl.getUniformLocation(program, 'uMouse');

    // Set initial uniforms
    gl.uniform3f(uniforms.uBaseColor, baseColor[0], baseColor[1], baseColor[2]);
    gl.uniform1f(uniforms.uAmplitude, amplitude);
    gl.uniform1f(uniforms.uFrequencyX, frequencyX);
    gl.uniform1f(uniforms.uFrequencyY, frequencyY);

    // Create geometry
    quad = createQuad();

    // Resize and start
    resize();

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
    }
    window.addEventListener('resize', resize);

    // Animation loop
    function animate(now) {
      animationId = requestAnimationFrame(animate);
      var t = (now - startTime) * 0.001 * speed;
      gl.uniform1f(uniforms.uTime, t);
      gl.uniform2f(uniforms.uMouse, mouseX, mouseY);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, quad.count);
    }

    startTime = performance.now();
    animationId = requestAnimationFrame(animate);

    return true;
  }

  // ─── Destroy ───
  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('resize', resize);

    if (canvas && canvas.parentElement) {
      canvas.parentElement.removeChild(canvas);
    }

    if (gl) {
      var ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }

    canvas = null;
    gl = null;
    program = null;
    uniforms = {};
  }
})();
