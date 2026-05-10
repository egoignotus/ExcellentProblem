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

  // Draw faded X markers for the "shadow" positions (equivalent cells)
  function drawXFaded(ctx, cellIdx, alpha) {
    var row = Math.floor(cellIdx / 3);
    var col = cellIdx % 3;
    var cx = col * CELL + CELL / 2;
    var cy = row * CELL + CELL / 2;
    var off = CELL * 0.28;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = R.lineA;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - off, cy - off); ctx.lineTo(cx + off, cy + off); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + off, cy - off); ctx.lineTo(cx - off, cy + off); ctx.stroke();
    ctx.restore();
  }

  function drawBoard(canvasId, xCell, fadedCells) {
    var ctx = getCtx(canvasId);
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    drawGrid(ctx);
    if (fadedCells) {
      for (var i = 0; i < fadedCells.length; i++) {
        drawXFaded(ctx, fadedCells[i], 0.15);
      }
    }
    if (xCell >= 0) drawX(ctx, xCell);
  }

  function makeClickable(canvas) {
    canvas.style.cursor = 'pointer';
  }

  function renderRotating(canvasId, cells, idxRef) {
    var current = cells[idxRef.v];
    var faded = [];
    for (var i = 0; i < cells.length; i++) {
      if (i !== idxRef.v) faded.push(cells[i]);
    }
    drawBoard(canvasId, current, faded);
  }

  function initMove1Figure() {
    // Scale all canvases for high-DPI
    var ids = ['fig-move1-empty', 'fig-move1-corner', 'fig-move1-edge', 'fig-move1-center'];
    for (var k = 0; k < ids.length; k++) {
      var c = getCanvas(ids[k]);
      if (c) setupHiDPI(c, SIZE, SIZE);
    }

    // Empty board
    var ctxEmpty = getCtx('fig-move1-empty');
    if (ctxEmpty) {
      ctxEmpty.clearRect(0, 0, SIZE, SIZE);
      drawGrid(ctxEmpty);
    }

    // Center (static)
    drawBoard('fig-move1-center', 4, null);

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
