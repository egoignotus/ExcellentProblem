// =============================================================
// MENACE Visualisation — Interactive tic-tac-toe board,
// matchbox bead display, and Plotly learning curve.
// Uses window.INFERNO for colors and window.MENACE for engine.
// =============================================================

(function () {
  'use strict';

  var M = window.MENACE;
  var R = window.INFERNO.roles;

  // ---- Bead color per cell position (9 Inferno stops) -----------
  var BEAD_COLORS = [];
  (function () {
    for (var i = 0; i < 9; i++) {
      BEAD_COLORS.push(window.INFERNO.at(i / 8));
    }
  })();

  // ---- Shared state ---------------------------------------------
  var menace = new M.MenaceAgent();
  var currentBoard  = [0,0,0,0,0,0,0,0,0];
  var gameActive    = false;
  var humanTurn     = false;
  var autoTraining  = false;
  var pendingTimeout = null;   // track scheduled menaceMoves to prevent races

  // The board MENACE was looking at when it last made a decision.
  // This is what the matchbox display shows — NOT currentBoard,
  // because currentBoard is usually a state where it's the human's
  // turn and MENACE has no matchbox for it.
  var menaceViewBoard = null;
  var menaceChosenCell = -1;   // actual cell MENACE placed X on

  // ---- DOM helpers ----------------------------------------------

  function el(id) { return document.getElementById(id); }

  function setText(id, text) {
    var e = el(id);
    if (e) e.textContent = text;
  }

  // ---- Board rendering (canvas based) ---------------------------
  var CELL_SIZE  = 80;
  var BOARD_SIZE = CELL_SIZE * 3;

  function getCanvas() { return el('menace-board'); }
  function getCtx()    { var c = getCanvas(); return c ? c.getContext('2d') : null; }

  function drawBoard() {
    var ctx = getCtx();
    if (!ctx) return;
    var cs = CELL_SIZE;
    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    // Grid lines
    ctx.strokeStyle = '#420a68';
    ctx.lineWidth = 3;
    for (var i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, BOARD_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cs); ctx.lineTo(BOARD_SIZE, i * cs); ctx.stroke();
    }

    // Pieces
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        var idx = r * 3 + c;
        var cx = c * cs + cs / 2;
        var cy = r * cs + cs / 2;
        if (currentBoard[idx] === M.X) drawX(ctx, cx, cy, cs);
        else if (currentBoard[idx] === M.O) drawO(ctx, cx, cy, cs);
      }
    }

    // Winning line
    var winner = M.checkWinner(currentBoard);
    if (winner !== M.EMPTY) {
      for (var w = 0; w < M.WIN_LINES.length; w++) {
        var line = M.WIN_LINES[w];
        if (currentBoard[line[0]] === winner &&
            currentBoard[line[1]] === winner &&
            currentBoard[line[2]] === winner) {
          drawWinLine(ctx, line, cs);
          break;
        }
      }
    }
  }

  function drawX(ctx, cx, cy, cs) {
    var off = cs * 0.28;
    ctx.strokeStyle = R.lineA;
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - off, cy - off); ctx.lineTo(cx + off, cy + off); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + off, cy - off); ctx.lineTo(cx - off, cy + off); ctx.stroke();
  }

  function drawO(ctx, cx, cy, cs) {
    var rad = cs * 0.28;
    ctx.strokeStyle = R.lineB;
    ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 2 * Math.PI); ctx.stroke();
  }

  function drawWinLine(ctx, line, cs) {
    var r0 = Math.floor(line[0] / 3), c0 = line[0] % 3;
    var r2 = Math.floor(line[2] / 3), c2 = line[2] % 3;
    ctx.strokeStyle = '#fca50a';
    ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(c0 * cs + cs / 2, r0 * cs + cs / 2);
    ctx.lineTo(c2 * cs + cs / 2, r2 * cs + cs / 2);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  }

  // ---- Bead dot rendering ---------------------------------------
  // Render `count` small colored circles inside a flex container.
  // Above MAX_DOTS we show dots + "+N" overflow label.
  var MAX_DOTS = 16;
  var DOT_SIZE = 7;   // px

  function renderBeadDots(count, color) {
    var show = Math.min(count, MAX_DOTS);
    var html = '<div style="display:flex; flex-wrap:wrap; gap:2px; justify-content:center; padding:2px;">';
    for (var i = 0; i < show; i++) {
      html += '<span style="display:inline-block; width:' + DOT_SIZE + 'px; height:' + DOT_SIZE + 'px; ' +
              'border-radius:50%; background:' + color + ';"></span>';
    }
    if (count > MAX_DOTS) {
      html += '<span style="font-size:9px; color:' + color + '; align-self:center;">+' + (count - MAX_DOTS) + '</span>';
    }
    html += '</div>';
    return html;
  }

  // ---- Matchbox bead visualisation ------------------------------
  // Shows the matchbox for `menaceViewBoard` (the state MENACE
  // was evaluating), NOT currentBoard.

  function renderMatchbox() {
    var container = el('menace-matchbox');
    if (!container) return;

    if (!menaceViewBoard) {
      container.innerHTML = '<div style="color:#888; text-align:center; padding:30px;">' +
        'Start a game to see MENACE\'s matchbox</div>';
      return;
    }

    container.innerHTML = renderMatchboxOrbits();
  }

  function renderMatchboxOrbits() {
    var viewBoard = menaceViewBoard;
    var orbits = menace.getOrbitSnapshot(viewBoard);
    var totalBeads = 0;
    for (var o = 0; o < orbits.length; o++) totalBeads += orbits[o].beads;

    var html = '<div style="display:flex; flex-direction:column; gap:8px; max-width:300px; margin:0 auto;">';

    for (var o = 0; o < orbits.length; o++) {
      var orb = orbits[o];
      var pct = totalBeads > 0 ? ((orb.beads / totalBeads) * 100).toFixed(0) : 0;
      var isChosen = false;
      for (var m = 0; m < orb.actualMembers.length; m++) {
        if (orb.actualMembers[m] === menaceChosenCell) isChosen = true;
      }
      var color = BEAD_COLORS[orb.actualMembers[0]];
      var borderStyle = isChosen ? '3px solid #fca50a' : '2px solid ' + window.INFERNO.rgba(color, 0.4);
      var bgStyle = isChosen ? 'rgba(252, 165, 10, 0.10)' : 'rgba(255,255,255,0.6)';

      html += '<div style="display:flex; align-items:center; gap:10px; padding:8px 10px; ' +
              'border:' + borderStyle + '; border-radius:8px; background:' + bgStyle + ';">';

      // Mini board showing which cells belong to this orbit
      var cs = 16;
      html += '<div style="flex-shrink:0; display:inline-grid; grid-template-columns:repeat(3,' + cs + 'px); ' +
              'grid-template-rows:repeat(3,' + cs + 'px); border:1px solid #aaa; border-radius:2px; background:white;">';
      for (var i = 0; i < 9; i++) {
        var br = (i % 3 < 2) ? 'border-right:1px solid #ccc;' : '';
        var bb = (i < 6) ? 'border-bottom:1px solid #ccc;' : '';
        var cellContent = '';
        if (viewBoard[i] === M.X) {
          cellContent = '<span style="color:' + R.lineA + ';font-size:9px;">✕</span>';
        } else if (viewBoard[i] === M.O) {
          cellContent = '<span style="color:' + R.lineB + ';font-size:9px;">○</span>';
        } else {
          var inOrbit = false;
          for (var m = 0; m < orb.actualMembers.length; m++) {
            if (orb.actualMembers[m] === i) inOrbit = true;
          }
          if (inOrbit) {
            cellContent = '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:' + color + ';"></span>';
          }
        }
        html += '<div style="display:flex;align-items:center;justify-content:center;' + br + bb + '">' + cellContent + '</div>';
      }
      html += '</div>';

      // Bead info
      html += '<div style="flex:1; min-width:0;">';
      html += renderBeadDots(orb.beads, color);
      html += '<div style="font-size:10px; color:#888; margin-top:2px;">' +
              orb.beads + ' bead' + (orb.beads !== 1 ? 's' : '') +
              ' (' + orb.size + ' cell' + (orb.size > 1 ? 's' : '') + ')</div>';
      html += '</div>';

      // Percentage
      html += '<div style="font-size:16px; font-weight:600; color:' + color + '; min-width:40px; text-align:right;">' +
              pct + '%</div>';

      html += '</div>';
    }

    html += '</div>';
    if (totalBeads > 0) {
      html += '<div style="text-align:center; margin-top:8px; font-size:12px; color:#666;">Total beads: ' + totalBeads + '</div>';
    }
    return html;
  }

  // ---- Learning curve (Plotly) ----------------------------------

  function renderLearningCurve() {
    var div = el('menace-curve');
    if (!div) return;

    if (menace.gameLog.length < 2) {
      Plotly.purge(div);
      return;
    }

    var windowSize = Math.min(50, Math.max(5, Math.floor(menace.gameLog.length / 4)));
    var s = M.rollingStats(menace.gameLog, windowSize);

    var traces = [
      { x: s.x, y: s.wins, mode: 'lines', name: 'Win %',
        line: { color: R.lineA, width: 2 },
        hovertemplate: 'Game %{x}<br>Win: %{y:.1f}%<extra></extra>' },
      { x: s.x, y: s.draws, mode: 'lines', name: 'Draw %',
        line: { color: '#fca50a', width: 2 },
        hovertemplate: 'Game %{x}<br>Draw: %{y:.1f}%<extra></extra>' },
      { x: s.x, y: s.losses, mode: 'lines', name: 'Loss %',
        line: { color: R.lineB, width: 2 },
        hovertemplate: 'Game %{x}<br>Loss: %{y:.1f}%<extra></extra>' }
    ];

    var layout = {
      xaxis: { title: 'Game #' },
      yaxis: { title: 'Rate (%)', range: [0, 105] },
      plot_bgcolor: 'white', paper_bgcolor: 'white',
      margin: { l: 50, r: 20, t: 10, b: 45 },
      legend: { x: 0.01, y: 0.99, bgcolor: 'rgba(255,255,255,0.8)' },
      showlegend: true,
      annotations: [{
        x: 0.5, y: 1.05, xref: 'paper', yref: 'paper',
        text: 'Rolling ' + windowSize + '-game average',
        showarrow: false, font: { size: 11, color: '#888' }
      }]
    };

    Plotly.react(div, traces, layout, { responsive: true, displayModeBar: false });
  }

  // ---- Stats display --------------------------------------------

  function renderStats() {
    var s = menace.stats;
    if (s.games === 0) {
      setText('menace-stats', 'No games played yet.');
      return;
    }
    var wPct = ((s.wins / s.games) * 100).toFixed(1);
    var dPct = ((s.draws / s.games) * 100).toFixed(1);
    var lPct = ((s.losses / s.games) * 100).toFixed(1);
    var boxes = Object.keys(menace.boxes).length;

    setText('menace-stats',
      'Games: ' + s.games +
      ' | W: ' + s.wins + ' (' + wPct + '%)' +
      ' | D: ' + s.draws + ' (' + dPct + '%)' +
      ' | L: ' + s.losses + ' (' + lPct + '%)' +
      ' | Matchboxes: ' + boxes
    );
  }

  // ---- Game logic -----------------------------------------------

  function newGame() {
    if (pendingTimeout) { clearTimeout(pendingTimeout); pendingTimeout = null; }
    currentBoard = [0,0,0,0,0,0,0,0,0];
    gameActive   = true;
    humanTurn    = false;
    menaceChosenCell = -1;

    // Show the empty-board matchbox — this is where learning is visible
    menaceViewBoard = M.copyBoard(currentBoard);
    setText('menace-status', 'MENACE is thinking...');
    drawBoard();
    renderMatchbox();

    // MENACE moves first (X) after a brief pause so user can see the matchbox
    pendingTimeout = setTimeout(function () { pendingTimeout = null; menaceMoves(); }, 600);
  }

  function menaceMoves() {
    if (!gameActive) return;

    // Snapshot the board BEFORE MENACE's move — this is the matchbox state
    menaceViewBoard = M.copyBoard(currentBoard);

    var move = menace.chooseMove(currentBoard);
    currentBoard[move] = M.X;
    menaceChosenCell = move;

    drawBoard();
    renderMatchbox();   // shows menaceViewBoard + highlights chosen cell

    var winner = M.checkWinner(currentBoard);
    if (winner === M.X) { endGame('win'); return; }
    if (M.isDraw(currentBoard)) { endGame('draw'); return; }

    humanTurn = true;
    setText('menace-status', 'Your turn (O). Click a cell.');
  }

  function humanMoves(cell) {
    if (!gameActive || !humanTurn) return;
    if (currentBoard[cell] !== M.EMPTY) return;

    currentBoard[cell] = M.O;
    humanTurn = false;
    drawBoard();

    var winner = M.checkWinner(currentBoard);
    if (winner === M.O) { endGame('loss'); return; }
    if (M.isDraw(currentBoard)) { endGame('draw'); return; }

    setText('menace-status', 'MENACE is thinking...');
    pendingTimeout = setTimeout(function () { pendingTimeout = null; menaceMoves(); }, 300);
  }

  function endGame(outcome) {
    gameActive = false;
    humanTurn  = false;
    menace.reward(outcome);
    drawBoard();
    renderMatchbox();
    renderStats();
    renderLearningCurve();

    var msg = outcome === 'win'  ? 'MENACE wins!'
            : outcome === 'draw' ? 'Draw!'
            : 'You win! MENACE loses.';
    setText('menace-status', msg + ' Click "New Game" to play again.');
  }

  // ---- Training -------------------------------------------------

  function trainN(n) {
    if (autoTraining) return;
    autoTraining = true;
    gameActive = false;
    humanTurn  = false;
    setText('menace-status', 'Training ' + n + ' games...');

    var batchSize = 50;
    var done = 0;

    function runBatch() {
      var toRun = Math.min(batchSize, n - done);
      M.trainBatch(menace, toRun);
      done += toRun;
      renderStats();
      renderLearningCurve();

      if (done < n) {
        setText('menace-status', 'Training... ' + done + '/' + n);
        setTimeout(runBatch, 10);
      } else {
        autoTraining = false;
        // After training, show empty-board matchbox so user sees the learned weights
        menaceViewBoard  = [0,0,0,0,0,0,0,0,0];
        menaceChosenCell = -1;
        renderMatchbox();
        setText('menace-status', 'Training complete! ' + n + ' games played. Click "New Game" to test MENACE.');
      }
    }
    runBatch();
  }

  function resetMenace() {
    if (pendingTimeout) { clearTimeout(pendingTimeout); pendingTimeout = null; }
    menace.reset();
    currentBoard    = [0,0,0,0,0,0,0,0,0];
    menaceViewBoard = null;
    menaceChosenCell = -1;
    gameActive = false;
    humanTurn  = false;
    drawBoard();
    renderMatchbox();
    renderStats();
    renderLearningCurve();
    setText('menace-status', 'MENACE reset. All matchboxes cleared.');
  }

  // ---- Move 2 zoom view (5 canonical boards) --------------------

  function enumerateMove2States() {
    var canonical = {};
    var board = [0,0,0,0,0,0,0,0,0];

    function recurse(xCount, oCount) {
      if (M.checkWinner(board) !== M.EMPTY) return;
      var isXTurn = (xCount === oCount);
      if (isXTurn && xCount === 1) {
        var key = M.canonicalKey(board);
        if (!canonical[key]) canonical[key] = board.slice();
        return;
      }
      if (xCount + oCount >= 2) return;
      var player = isXTurn ? M.X : M.O;
      for (var i = 0; i < 9; i++) {
        if (board[i] !== M.EMPTY) continue;
        board[i] = player;
        recurse(isXTurn ? xCount + 1 : xCount, isXTurn ? oCount : oCount + 1);
        board[i] = M.EMPTY;
      }
    }
    recurse(0, 0);

    var keys = Object.keys(canonical).sort();
    var states = [];
    for (var i = 0; i < keys.length; i++) states.push(canonical[keys[i]]);
    return states;
  }

  function renderMove2Boards() {
    var container = el('menace-move2');
    if (!container) return;

    var states = enumerateMove2States();
    var html = '<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;padding:8px 0;">';
    for (var i = 0; i < states.length; i++) {
      html += renderMiniBoardCard(states[i], i + 1);
    }
    html += '</div>';
    container.innerHTML = html;
  }

  // ---- Move 3 zoom view (12 canonical boards) -------------------

  function enumerateMove3States() {
    var canonical = {};
    var board = [0,0,0,0,0,0,0,0,0];

    function recurse(xCount, oCount) {
      if (M.checkWinner(board) !== M.EMPTY) return;
      var isXTurn = (xCount === oCount);
      if (isXTurn && xCount === 2) {
        var key = M.canonicalKey(board);
        if (!canonical[key]) canonical[key] = board.slice();
        return;
      }
      if (xCount + oCount >= 4) return;
      var player = isXTurn ? M.X : M.O;
      for (var i = 0; i < 9; i++) {
        if (board[i] !== M.EMPTY) continue;
        board[i] = player;
        recurse(isXTurn ? xCount + 1 : xCount, isXTurn ? oCount : oCount + 1);
        board[i] = M.EMPTY;
      }
    }
    recurse(0, 0);

    var keys = Object.keys(canonical).sort();
    var states = [];
    for (var i = 0; i < keys.length; i++) states.push(canonical[keys[i]]);
    return states;
  }

  function renderMiniBoardCard(board, num) {
    var cs = 28;
    var html = '<div style="text-align:center;">';
    html += '<div style="display:inline-grid; grid-template-columns:repeat(3,' + cs + 'px); ' +
            'grid-template-rows:repeat(3,' + cs + 'px); ' +
            'border:2px solid #420a68; border-radius:4px; overflow:hidden; background:white;">';

    for (var i = 0; i < 9; i++) {
      var br = (i % 3 < 2)  ? 'border-right:1px solid #420a68;'  : '';
      var bb = (i < 6)       ? 'border-bottom:1px solid #420a68;' : '';
      var content = '';
      if (board[i] === M.X) {
        content = '<span style="color:' + R.lineA + ';font-size:16px;font-weight:bold;">✕</span>';
      } else if (board[i] === M.O) {
        content = '<span style="color:' + R.lineB + ';font-size:16px;font-weight:bold;">○</span>';
      } else {
        content = '<span style="color:#ddd;font-size:10px;">·</span>';
      }
      html += '<div style="display:flex;align-items:center;justify-content:center;' +
              br + bb + '">' + content + '</div>';
    }

    html += '</div>';
    html += '<div style="font-size:10px;color:#999;margin-top:4px;">#' + num + '</div>';
    html += '</div>';
    return html;
  }

  function renderMove3Boards() {
    var container = el('menace-move3');
    if (!container) return;

    var states = enumerateMove3States();
    var html = '<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;padding:8px 0;">';
    for (var i = 0; i < states.length; i++) {
      html += renderMiniBoardCard(states[i], i + 1);
    }
    html += '</div>';
    container.innerHTML = html;
  }

  // ---- Matchbox Collection (Wikipedia-style visual) -------------
  // Enumerates ALL canonical board states where it's MENACE's turn,
  // groups them by move number, and renders colored blocks.

  var COLLECTION_COLORS = [
    { bg: '#c8e6c9', border: '#66bb6a' },   // green  — move 1
    { bg: '#bbdefb', border: '#42a5f5' },   // blue   — move 2
    { bg: '#f5f5f5', border: '#9e9e9e' },   // white  — move 3
    { bg: '#f8bbd0', border: '#ec407a' },   // pink   — move 4
    { bg: '#ef9a9a', border: '#ef5350' }    // red    — move 5
  ];

  function enumerateMatchboxStates() {
    var groups = {};
    for (var m = 1; m <= 5; m++) groups[m] = {};

    var board = [0,0,0,0,0,0,0,0,0];

    function recurse(xCount, oCount) {
      if (M.checkWinner(board) !== M.EMPTY) return;

      var isXTurn = (xCount === oCount);

      if (isXTurn) {
        var move = xCount + 1;
        if (move <= 5) groups[move][M.canonicalKey(board)] = true;
      }

      if (xCount + oCount >= 9) return;

      var player = isXTurn ? M.X : M.O;
      for (var i = 0; i < 9; i++) {
        if (board[i] !== M.EMPTY) continue;
        board[i] = player;
        recurse(isXTurn ? xCount + 1 : xCount, isXTurn ? oCount : oCount + 1);
        board[i] = M.EMPTY;
      }
    }

    recurse(0, 0);
    return groups;
  }

  function renderMatchboxCollection() {
    var container = el('menace-collection');
    if (!container) return;

    var groups = enumerateMatchboxStates();
    var total = 0;

    // Faint tic-tac-toe grid pattern drawn on each matchbox via CSS gradients
    var gridCSS =
      'linear-gradient(to right, ' +
        'transparent 30%, rgba(0,0,0,0.13) 30%, rgba(0,0,0,0.13) 34%, transparent 34%, ' +
        'transparent 64%, rgba(0,0,0,0.13) 64%, rgba(0,0,0,0.13) 68%, transparent 68%), ' +
      'linear-gradient(to bottom, ' +
        'transparent 28%, rgba(0,0,0,0.13) 28%, rgba(0,0,0,0.13) 34%, transparent 34%, ' +
        'transparent 63%, rgba(0,0,0,0.13) 63%, rgba(0,0,0,0.13) 69%, transparent 69%)';

    var html = '<div style="display:flex; gap:24px; align-items:flex-end; ' +
               'flex-wrap:wrap; justify-content:center; padding:8px 0;">';

    for (var m = 1; m <= 5; m++) {
      var keys = Object.keys(groups[m]);
      var count = keys.length;
      if (count === 0) continue;
      total += count;

      var col = COLLECTION_COLORS[m - 1];
      var boxesPerRow = Math.max(4, Math.min(14, Math.ceil(Math.sqrt(count * 2))));
      var maxW = boxesPerRow * 25;

      html += '<div style="text-align:center;">';
      html += '<div style="display:flex; flex-wrap:wrap; gap:2px; ' +
              'max-width:' + maxW + 'px; justify-content:center;">';

      for (var i = 0; i < count; i++) {
        html += '<div style="' +
          'width:22px; height:15px;' +
          'background-image:' + gridCSS + ';' +
          'background-color:' + col.bg + ';' +
          'border:1px solid ' + col.border + ';' +
          'border-radius:2px;' +
          'box-shadow:1px 1px 2px rgba(0,0,0,0.08);' +
        '"></div>';
      }

      html += '</div>';
      var gameTurn = (m - 1) * 2 + 1;
      html += '<div style="font-size:11px; color:#555; margin-top:8px; font-weight:600;">' +
              'Move ' + m + '</div>';
      html += '<div style="font-size:10px; color:#999;">' +
              count + ' matchbox' + (count > 1 ? 'es' : '') + '</div>';
      html += '<div style="font-size:9px; color:#bbb;">(turn ' + gameTurn + ')</div>';
      html += '</div>';
    }

    html += '</div>';
    html += '<div style="text-align:center; font-size:12px; color:#888; margin-top:10px;">' +
            'Total: ' + total + ' matchboxes</div>';

    container.innerHTML = html;
  }

  // ---- Canvas click handler -------------------------------------

  function onBoardClick(e) {
    var canvas = getCanvas();
    if (!canvas) return;
    var rect = canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) * (canvas.width / rect.width);
    var y = (e.clientY - rect.top)  * (canvas.height / rect.height);
    var col = Math.floor(x / CELL_SIZE);
    var row = Math.floor(y / CELL_SIZE);
    if (col >= 0 && col < 3 && row >= 0 && row < 3) {
      humanMoves(row * 3 + col);
    }
  }

  // ---- Initialisation -------------------------------------------

  function initMenace() {
    var canvas = getCanvas();
    if (canvas) {
      canvas.width  = BOARD_SIZE;
      canvas.height = BOARD_SIZE;
      canvas.addEventListener('click', onBoardClick);
      canvas.style.cursor = 'pointer';
    }

    var btnNew   = el('menace-btn-new');
    var btnReset = el('menace-btn-reset');
    var btn50    = el('menace-btn-train50');
    var btn200   = el('menace-btn-train200');
    var btn500   = el('menace-btn-train500');

    if (btnNew)   btnNew.addEventListener('click', newGame);
    if (btnReset) btnReset.addEventListener('click', resetMenace);
    if (btn50)    btn50.addEventListener('click', function () { trainN(50); });
    if (btn200)   btn200.addEventListener('click', function () { trainN(200); });
    if (btn500)   btn500.addEventListener('click', function () { trainN(500); });

    drawBoard();
    renderMatchbox();
    renderStats();
    renderMove2Boards();
    renderMove3Boards();
    renderMatchboxCollection();
    setText('menace-status', 'Click "New Game" to play against MENACE, or train it first.');
  }

  window.initMenacePlot = initMenace;

})();
