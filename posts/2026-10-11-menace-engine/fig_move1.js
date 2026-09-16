// =============================================================
// Move 1 Symmetry Figure — Empty board + 3 distinct first moves.
// Corner and edge boards rotate on click to show equivalence.
// =============================================================

(function () {
  'use strict';

  var R = window.INFERNO.roles;
  var SIZE = 120;
  var CELL = SIZE / 3;

  // The 4 corner cells, in 90° rotation order
  var CORNERS = [0, 2, 8, 6]; // top-left → top-right → bottom-right → bottom-left
  // The 4 edge cells, in 90° rotation order
  var EDGES = [1, 5, 7, 3];   // top-mid → mid-right → bottom-mid → mid-left

  // Match the orbit and bead colors used throughout the MENACE figures.
  var ORBIT_FILLS = [
    'rgba(91, 26, 120, 0.22)',
    'rgba(230, 159, 0, 0.25)',
    'rgba(0, 140, 131, 0.25)'
  ];
  var ORBIT_SOLIDS = ['#5B1A78', '#E69F00', '#008C83'];

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

  function getCanvas(id) { return document.getElementById(id); }
  function getCtx(id) {
    var canvas = getCanvas(id);
    if (!canvas) return null;
    return canvas.getContext('2d');
  }

  function drawGrid(ctx) {
    ctx.strokeStyle = '#420a68';
    ctx.lineWidth = 2;
    for (var i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }
  }

  function fillCell(ctx, cellIdx, color) {
    var row = Math.floor(cellIdx / 3);
    var col = cellIdx % 3;
    ctx.fillStyle = color;
    ctx.fillRect(col * CELL, row * CELL, CELL, CELL);
  }

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

  function drawBoard(canvasId, xCell, equivalentCells, orbitIdx) {
    var ctx = getCtx(canvasId);
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    for (var i = 0; i < equivalentCells.length; i++) {
      fillCell(ctx, equivalentCells[i], ORBIT_FILLS[orbitIdx]);
    }
    drawGrid(ctx);
    if (xCell >= 0) drawX(ctx, xCell);
  }

  function makeClickable(canvas) {
    canvas.style.cursor = 'pointer';
  }

  function renderRotating(canvasId, cells, idxRef) {
    var current = cells[idxRef.v];
    var orbitIdx = canvasId === 'fig-move1-corner' ? 0 : 1;
    drawBoard(canvasId, current, cells, orbitIdx);
  }

  function initMove1Figure() {
    // Scale all canvases for high-DPI
    var ids = ['fig-move1-empty', 'fig-move1-corner', 'fig-move1-edge', 'fig-move1-center'];
    var optionSize = window.matchMedia('(max-width: 576px)').matches ? 88 : SIZE;
    for (var k = 0; k < ids.length; k++) {
      var c = getCanvas(ids[k]);
      if (c) {
        setupHiDPI(c, SIZE, SIZE);
        if (ids[k] !== 'fig-move1-empty') {
          c.style.width = optionSize + 'px';
          c.style.height = optionSize + 'px';
        }
      }
    }

    // Empty board
    var ctxEmpty = getCtx('fig-move1-empty');
    if (ctxEmpty) {
      ctxEmpty.clearRect(0, 0, SIZE, SIZE);
      for (var corner = 0; corner < CORNERS.length; corner++) {
        fillCell(ctxEmpty, CORNERS[corner], ORBIT_FILLS[0]);
      }
      for (var edge = 0; edge < EDGES.length; edge++) {
        fillCell(ctxEmpty, EDGES[edge], ORBIT_FILLS[1]);
      }
      fillCell(ctxEmpty, 4, ORBIT_FILLS[2]);
      drawGrid(ctxEmpty);
      for (var cell = 0; cell < 9; cell++) {
        var orbitIdx = cell === 4 ? 2 : (cell % 2 === 0 ? 0 : 1);
        drawOrbitLabel(ctxEmpty, cell, orbitIdx);
      }
    }

    // Center (static)
    drawBoard('fig-move1-center', 4, [4], 2);

    // Corner — click to rotate
    var cornerIdx = { v: 0 };
    renderRotating('fig-move1-corner', CORNERS, cornerIdx);
    var cornerCanvas = getCanvas('fig-move1-corner');
    if (cornerCanvas) {
      makeClickable(cornerCanvas);
      cornerCanvas.addEventListener('click', function () {
        cornerIdx.v = (cornerIdx.v + 1) % 4;
        renderRotating('fig-move1-corner', CORNERS, cornerIdx);
      });
    }

    // Edge — click to rotate
    var edgeIdx = { v: 0 };
    renderRotating('fig-move1-edge', EDGES, edgeIdx);
    var edgeCanvas = getCanvas('fig-move1-edge');
    if (edgeCanvas) {
      makeClickable(edgeCanvas);
      edgeCanvas.addEventListener('click', function () {
        edgeIdx.v = (edgeIdx.v + 1) % 4;
        renderRotating('fig-move1-edge', EDGES, edgeIdx);
      });
    }
  }

  window.initMove1Figure = initMove1Figure;

})();
