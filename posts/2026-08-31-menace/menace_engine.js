// =============================================================
// MENACE Engine — Machine Educable Noughts and Crosses Engine
// Implements Michie's matchbox reinforcement learning system
// for Tic-Tac-Toe (Noughts and Crosses).
//
// MENACE plays as X (first mover). Each board state that MENACE
// encounters maps to a "matchbox" containing colored beads.
// Drawing a bead = choosing a move. After a game the beads are
// adjusted: wins add beads, draws add fewer, losses remove beads.
// =============================================================

(function () {
  'use strict';

  // ---- Constants ------------------------------------------------
  var EMPTY = 0, X = 1, O = 2;
  var WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],  // rows
    [0,3,6],[1,4,7],[2,5,8],  // cols
    [0,4,8],[2,4,6]            // diags
  ];

  // Bead reward/penalty settings (Michie's original values)
  var INITIAL_BEADS  = 8;   // beads per legal move in a fresh box
  var WIN_REWARD     = 3;   // beads added on win
  var DRAW_REWARD    = 1;   // beads added on draw
  var LOSS_PENALTY   = 1;   // beads removed on loss (min 1 remains)

  // ---- Board utilities ------------------------------------------

  function checkWinner(board) {
    for (var i = 0; i < WIN_LINES.length; i++) {
      var a = WIN_LINES[i][0], b = WIN_LINES[i][1], c = WIN_LINES[i][2];
      if (board[a] !== EMPTY && board[a] === board[b] && board[b] === board[c]) {
        return board[a]; // X or O
      }
    }
    return EMPTY;
  }

  function isDraw(board) {
    if (checkWinner(board) !== EMPTY) return false;
    for (var i = 0; i < 9; i++) {
      if (board[i] === EMPTY) return false;
    }
    return true;
  }

  function legalMoves(board) {
    var moves = [];
    for (var i = 0; i < 9; i++) {
      if (board[i] === EMPTY) moves.push(i);
    }
    return moves;
  }

  function boardKey(board) {
    return board.join('');
  }

  function copyBoard(board) {
    return board.slice();
  }

  // ---- Canonical rotation/reflection (state compression) --------
  // We map equivalent board positions to a single canonical key
  // so MENACE only needs ~304 matchboxes instead of ~5000+.

  var TRANSFORMS = [
    [0,1,2,3,4,5,6,7,8], // identity
    [2,5,8,1,4,7,0,3,6], // 90° CW
    [8,7,6,5,4,3,2,1,0], // 180°
    [6,3,0,7,4,1,8,5,2], // 270° CW
    [2,1,0,5,4,3,8,7,6], // horizontal flip
    [6,7,8,3,4,5,0,1,2], // vertical flip
    [0,3,6,1,4,7,2,5,8], // main diagonal
    [8,5,2,7,4,1,6,3,0]  // anti-diagonal
  ];

  function canonicalKey(board) {
    var best = boardKey(board);
    for (var t = 1; t < TRANSFORMS.length; t++) {
      var perm = TRANSFORMS[t];
      var key = '';
      for (var i = 0; i < 9; i++) key += board[perm[i]];
      if (key < best) best = key;
    }
    return best;
  }

  // Find the transform that maps canonical -> current orientation
  function findTransform(board) {
    var canon = canonicalKey(board);
    for (var t = 0; t < TRANSFORMS.length; t++) {
      var perm = TRANSFORMS[t];
      var key = '';
      for (var i = 0; i < 9; i++) key += board[perm[i]];
      if (key === canon) return perm;
    }
    return TRANSFORMS[0];
  }

  // Map a canonical-space cell index back to actual board index
  function invertTransform(perm, canonIdx) {
    for (var i = 0; i < 9; i++) {
      if (perm[i] === canonIdx) return i;
    }
    return canonIdx;
  }

  // ---- Move-orbit detection (symmetry within a single state) ----
  // Two legal moves are equivalent if a symmetry that *preserves*
  // the current board maps one to the other.  We group them into
  // orbits so that each orbit stores a single bead count.

  // Return the subset of TRANSFORMS that leave `board` unchanged.
  function getStabilizer(board) {
    var key = boardKey(board);
    var stab = [];
    for (var t = 0; t < TRANSFORMS.length; t++) {
      var perm = TRANSFORMS[t];
      var tKey = '';
      for (var i = 0; i < 9; i++) tKey += board[perm[i]];
      if (tKey === key) stab.push(perm);
    }
    return stab;
  }

  // Group the legal moves of `board` into equivalence classes
  // (orbits) under its stabilizer.  Returns an array of
  // { rep: <smallest index>, members: [idx, …] }.
  function getMoveOrbits(board) {
    var stabilizer = getStabilizer(board);
    var legal = legalMoves(board);
    var visited = {};
    var orbits = [];

    for (var i = 0; i < legal.length; i++) {
      var move = legal[i];
      if (visited[move]) continue;
      var orbitSet = {};
      for (var s = 0; s < stabilizer.length; s++) {
        var mapped = invertTransform(stabilizer[s], move);
        if (board[mapped] === EMPTY) orbitSet[mapped] = true;
      }
      var members = Object.keys(orbitSet).map(Number)
                          .sort(function (a, b) { return a - b; });
      for (var j = 0; j < members.length; j++) visited[members[j]] = true;
      orbits.push({ rep: members[0], members: members });
    }
    return orbits;
  }

  // ---- MENACE Agent ---------------------------------------------

  function MenaceAgent() {
    this.boxes = {};          // canonicalKey -> { _orbits, rep: beadCount }
    this.history = [];        // moves made this game: [{key, move}]
    this.stats = { wins: 0, draws: 0, losses: 0, games: 0 };
    this.gameLog = [];        // per-game outcomes for learning curve
  }

  MenaceAgent.prototype.getBox = function (board) {
    var key = canonicalKey(board);
    if (!this.boxes[key]) {
      // Compute canonical board and its move orbits
      var perm = findTransform(board);
      var canonBoard = [];
      for (var i = 0; i < 9; i++) canonBoard.push(board[perm[i]]);
      var orbits = getMoveOrbits(canonBoard);
      var box = { _orbits: orbits };
      for (var m = 0; m < orbits.length; m++) {
        box[orbits[m].rep] = INITIAL_BEADS;
      }
      this.boxes[key] = box;
    }
    return this.boxes[key];
  };

  MenaceAgent.prototype.chooseMove = function (board) {
    var key = canonicalKey(board);
    var box = this.getBox(board);
    var perm = findTransform(board);
    var orbits = box._orbits;

    // Total beads = Σ(beads_per_orbit) — orbits are equally weighted
    var total = 0;
    for (var i = 0; i < orbits.length; i++) {
      total += (box[orbits[i].rep] || 0);
    }

    if (total === 0) {
      var legal = legalMoves(board);
      var actualMove = legal[Math.floor(Math.random() * legal.length)];
      this.history.push({ key: key, move: null });
      return actualMove;
    }

    // Random selection of orbit proportional to bead count
    var r = Math.random() * total;
    var cumul = 0;
    var chosenOrbit = orbits[0];
    for (var i = 0; i < orbits.length; i++) {
      cumul += (box[orbits[i].rep] || 0);
      if (r < cumul) { chosenOrbit = orbits[i]; break; }
    }

    // Pick a random member of the chosen orbit
    var canonMove = chosenOrbit.members[
      Math.floor(Math.random() * chosenOrbit.members.length)
    ];
    var actualMove = perm[canonMove];

    // Record the orbit representative for reward
    this.history.push({ key: key, move: chosenOrbit.rep });
    return actualMove;
  };

  MenaceAgent.prototype.reward = function (outcome) {
    // outcome: 'win', 'draw', 'loss'
    var delta = outcome === 'win' ? WIN_REWARD
              : outcome === 'draw' ? DRAW_REWARD
              : -LOSS_PENALTY;

    for (var i = 0; i < this.history.length; i++) {
      var h = this.history[i];
      if (h.move === null) continue;
      var box = this.boxes[h.key];
      if (!box) continue;
      box[h.move] = Math.max(1, (box[h.move] || 0) + delta);
    }

    this.stats.games++;
    if (outcome === 'win')  this.stats.wins++;
    if (outcome === 'draw') this.stats.draws++;
    if (outcome === 'loss') this.stats.losses++;
    this.gameLog.push(outcome);

    this.history = [];
  };

  MenaceAgent.prototype.reset = function () {
    this.boxes = {};
    this.history = [];
    this.stats = { wins: 0, draws: 0, losses: 0, games: 0 };
    this.gameLog = [];
  };

  MenaceAgent.prototype.getBeadSnapshot = function (board) {
    // Return bead counts mapped to actual board positions.
    // All cells in the same orbit get the same bead count.
    var box = this.getBox(board);
    var perm = findTransform(board);
    var orbits = box._orbits;
    var result = [];
    for (var i = 0; i < 9; i++) result.push(0);

    for (var o = 0; o < orbits.length; o++) {
      var beads = box[orbits[o].rep] || 0;
      var members = orbits[o].members;
      for (var m = 0; m < members.length; m++) {
        var actualIdx = perm[members[m]];
        result[actualIdx] = beads;
      }
    }
    return result;
  };

  MenaceAgent.prototype.totalBeads = function (board) {
    var snap = this.getBeadSnapshot(board);
    var sum = 0;
    for (var i = 0; i < 9; i++) sum += snap[i];
    return sum;
  };

  // Return orbit-level data mapped to actual board positions.
  // Each orbit: { beads, size, weight, actualMembers[] }
  MenaceAgent.prototype.getOrbitSnapshot = function (board) {
    var box = this.getBox(board);
    var perm = findTransform(board);
    var orbits = box._orbits;
    var result = [];

    for (var o = 0; o < orbits.length; o++) {
      var beads = box[orbits[o].rep] || 0;
      var members = orbits[o].members;
      var actualMembers = [];
      for (var m = 0; m < members.length; m++) {
        actualMembers.push(perm[members[m]]);
      }
      actualMembers.sort(function (a, b) { return a - b; });
      result.push({
        beads: beads,
        size: members.length,
        weight: beads * members.length,
        actualMembers: actualMembers
      });
    }
    return result;
  };

  // ---- Random opponent ------------------------------------------

  function randomMove(board) {
    var legal = legalMoves(board);
    return legal[Math.floor(Math.random() * legal.length)];
  }

  // ---- Play one full game (MENACE = X vs random/human O) --------

  function playGame(menace, opponentMoveFn) {
    var board = [0,0,0,0,0,0,0,0,0];
    var moveRecord = [];

    while (true) {
      // MENACE (X) moves
      var xMove = menace.chooseMove(board);
      board[xMove] = X;
      moveRecord.push({ player: X, cell: xMove, board: copyBoard(board) });
      if (checkWinner(board) === X) {
        menace.reward('win');
        return { outcome: 'win', moves: moveRecord };
      }
      if (isDraw(board)) {
        menace.reward('draw');
        return { outcome: 'draw', moves: moveRecord };
      }

      // Opponent (O) moves
      var oMove = opponentMoveFn(board);
      board[oMove] = O;
      moveRecord.push({ player: O, cell: oMove, board: copyBoard(board) });
      if (checkWinner(board) === O) {
        menace.reward('loss');
        return { outcome: 'loss', moves: moveRecord };
      }
      if (isDraw(board)) {
        menace.reward('draw');
        return { outcome: 'draw', moves: moveRecord };
      }
    }
  }

  // ---- Batch training -------------------------------------------

  function trainBatch(menace, numGames) {
    var results = [];
    for (var i = 0; i < numGames; i++) {
      var r = playGame(menace, randomMove);
      results.push(r.outcome);
    }
    return results;
  }

  // ---- Rolling statistics for learning curve --------------------

  function rollingStats(gameLog, windowSize) {
    windowSize = windowSize || 20;
    var wins = [], draws = [], losses = [], x = [];
    var wCount = 0, dCount = 0, lCount = 0;

    for (var i = 0; i < gameLog.length; i++) {
      if (gameLog[i] === 'win')  wCount++;
      if (gameLog[i] === 'draw') dCount++;
      if (gameLog[i] === 'loss') lCount++;

      if (i >= windowSize) {
        if (gameLog[i - windowSize] === 'win')  wCount--;
        if (gameLog[i - windowSize] === 'draw') dCount--;
        if (gameLog[i - windowSize] === 'loss') lCount--;
      }

      var n = Math.min(i + 1, windowSize);
      x.push(i + 1);
      wins.push((wCount / n) * 100);
      draws.push((dCount / n) * 100);
      losses.push((lCount / n) * 100);
    }
    return { x: x, wins: wins, draws: draws, losses: losses };
  }

  // ---- Export to window -----------------------------------------

  window.MENACE = {
    EMPTY: EMPTY, X: X, O: O,
    WIN_LINES: WIN_LINES,
    checkWinner: checkWinner,
    isDraw: isDraw,
    legalMoves: legalMoves,
    copyBoard: copyBoard,
    canonicalKey: canonicalKey,
    MenaceAgent: MenaceAgent,
    randomMove: randomMove,
    playGame: playGame,
    trainBatch: trainBatch,
    rollingStats: rollingStats,
    INITIAL_BEADS: INITIAL_BEADS,
    WIN_REWARD: WIN_REWARD,
    DRAW_REWARD: DRAW_REWARD,
    LOSS_PENALTY: LOSS_PENALTY
  };

})();
