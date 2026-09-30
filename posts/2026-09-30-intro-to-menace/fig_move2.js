// =============================================================
// Move 2 Symmetry Figure — Three board states after X and O each
// played once. Empty cells colored by symmetry orbit to show
// how many distinct 3rd-move options MENACE sees.
// =============================================================

(function () {
  'use strict';

  var R = window.INFERNO.roles;
  var SIZE = 140;
  var CELL = SIZE / 3;

  // High-DPI setup: scale canvas buffer while keeping CSS size
  function setupHiDPI(canvas, w, h) {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
  }

  // Orbit colors match the engine's bead palette.
  var ORBIT_FILLS = [
    'rgba(91, 26, 120, 0.22)',
    'rgba(230, 159, 0, 0.25)',
    'rgba(0, 140, 131, 0.25)',
    'rgba(217, 79, 61, 0.22)',
    'rgba(63, 127, 191, 0.25)',
    'rgba(192, 74, 135, 0.22)',
    'rgba(106, 159, 56, 0.25)'
  ];
  var ORBIT_SOLIDS = [
    '#5B1A78',
    '#E69F00',
    '#008C83',
    '#D94F3D',
    '#3F7FBF',
    '#C04A87',
    '#6A9F38'
  ];

  // Scenario A: X=0 (corner), O=5 (edge)
  // Stabiliser = {identity} → 7 distinct orbits
  var SCENARIO_A = {
    x: 0, o: 5,
    orbits: [-1, 0, 1, 2, 3, -1, 4, 5, 6],
    nOrbits: 7
  };

  // Scenario B: X=1 (edge), O=4 (center)
  // Stabiliser = {identity, h-flip} → 4 orbits: {0,2}, {3,5}, {6,8}, {7}
  var SCENARIO_B = {
    x: 1, o: 4,
    orbits: [0, -1, 0, 1, -1, 1, 2, 3, 2],
    nOrbits: 4
  };

  // Scenario C (collection position #12): X and O in opposite corners
  // Mirror symmetry → 4 orbits: {1,3}, {2,6}, {4}, {5,7}
  var SCENARIO_C = {
    x: 0, o: 8,
    orbits: [-1, 0, 1, 0, 2, 3, 1, 3, -1],
    nOrbits: 4
  };

  function getCtx(id) {
    var c = document.getElementById(id);
    return c ? c.getContext('2d') : null;
  }

  function fillCell(ctx, cellIdx, color) {
    var row = Math.floor(cellIdx / 3);
    var col = cellIdx % 3;
    ctx.fillStyle = color;
    ctx.fillRect(col * CELL, row * CELL, CELL, CELL);
  }

  function drawGrid(ctx) {
    ctx.strokeStyle = '#420a68';
    ctx.lineWidth = 2;
    for (var i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }
  }

  function drawX(ctx, cellIdx) {
    var row = Math.floor(cellIdx / 3);
    var col = cellIdx % 3;
    var cx = col * CELL + CELL / 2;
    var cy = row * CELL + CELL / 2;
    var off = CELL * 0.28;
    ctx.strokeStyle = R.lineA;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - off, cy - off); ctx.lineTo(cx + off, cy + off); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + off, cy - off); ctx.lineTo(cx - off, cy + off); ctx.stroke();
  }

  function drawO(ctx, cellIdx) {
    var row = Math.floor(cellIdx / 3);
    var col = cellIdx % 3;
    var cx = col * CELL + CELL / 2;
    var cy = row * CELL + CELL / 2;
    var radius = CELL * 0.26;
    ctx.strokeStyle = R.lineB;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Draw small orbit-index label inside each empty cell
  function drawOrbitLabel(ctx, cellIdx, orbitIdx) {
    var row = Math.floor(cellIdx / 3);
    var col = cellIdx % 3;
    var cx = col * CELL + CELL / 2;
    var cy = row * CELL + CELL / 2;
    ctx.fillStyle = ORBIT_SOLIDS[orbitIdx];
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(orbitIdx + 1), cx, cy);
  }

  function drawScenario(canvasId, scenario) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    setupHiDPI(canvas, SIZE, SIZE);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Fill orbit cells
    for (var i = 0; i < 9; i++) {
      var oi = scenario.orbits[i];
      if (oi >= 0) fillCell(ctx, i, ORBIT_FILLS[oi]);
    }

    drawGrid(ctx);
    drawX(ctx, scenario.x);
    drawO(ctx, scenario.o);

    // Draw orbit labels in empty cells
    for (var j = 0; j < 9; j++) {
      var oj = scenario.orbits[j];
      if (oj >= 0) drawOrbitLabel(ctx, j, oj);
    }
  }

  function initMove2Figure() {
    drawScenario('fig-move2-a', SCENARIO_A);
    drawScenario('fig-move2-b', SCENARIO_B);
    drawScenario('fig-move2-c', SCENARIO_C);

    var ids = ['fig-move2-a', 'fig-move2-b', 'fig-move2-c'];
    for (var i = 0; i < ids.length; i++) {
      var canvas = document.getElementById(ids[i]);
      if (canvas) {
        canvas.style.width = 'min(140px, 100%)';
        canvas.style.height = 'auto';
      }
    }
  }

  window.initMove2Figure = initMove2Figure;

})();
