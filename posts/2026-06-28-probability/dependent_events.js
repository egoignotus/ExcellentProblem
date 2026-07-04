// dependent_events.js — Total probability & Bayes' theorem rectangle visual
// P(positive) = P(pos|sick)*P(sick) + P(pos|healthy)*P(healthy)
// Y-axis: P(sick) bottom, P(healthy) top
// Bottom X-axis: P(positive|sick), Upper X-axis: P(positive|healthy)
(function () {
  "use strict";

  var C = window.INFERNO.roles;

  function toSafeProbability(val) {
    var n = parseFloat(val);
    if (isNaN(n) || n < 0) return 0;
    if (n > 1) return 1;
    return Math.round(n * 100) / 100;
  }

  function createDependentEventsPlot(cfg) {
    var canvas        = document.getElementById(cfg.canvasId);
    var ctx           = canvas.getContext("2d");
    var sliderSick    = document.getElementById(cfg.sliderSickId);
    var sliderPosSick = document.getElementById(cfg.sliderPosSickId);
    var sliderPosH    = document.getElementById(cfg.sliderPosHealthyId);
    var labelSick     = document.getElementById(cfg.labelSickId);
    var labelPosSick  = document.getElementById(cfg.labelPosSickId);
    var labelPosH     = document.getElementById(cfg.labelPosHealthyId);
    var barTotal      = document.getElementById(cfg.barTotalId);
    var labelTotal    = document.getElementById(cfg.labelTotalId);

    // Colors
    var COL_SICK      = "rgba(187, 55, 84, 0.55)";
    var COL_HEALTHY   = "rgba(68, 1, 84, 0.25)";
    var COL_POS_SICK  = "rgba(187, 55, 84, 0.70)";
    var COL_POS_H     = "rgba(221, 81, 58, 0.50)";
    var COL_SPLIT     = "#bb3754";
    var COL_TOP_AXIS  = "#dd513a";

    function draw() {
      var pSick    = toSafeProbability(sliderSick.value);
      var pHealthy = 1 - pSick;
      var pPosSick = toSafeProbability(sliderPosSick.value);
      var pPosH    = toSafeProbability(sliderPosH.value);

      // Total probability
      var pPos = pPosSick * pSick + pPosH * pHealthy;

      // Update labels
      labelSick.textContent    = pSick.toFixed(2);
      labelPosSick.textContent = pPosSick.toFixed(2);
      labelPosH.textContent    = pPosH.toFixed(2);
      labelTotal.textContent   = "P(+) = " + pPos.toFixed(4);

      // Update total probability bar
      var pctPos = (pPos * 100).toFixed(1);
      barTotal.style.width = pctPos + "%";

      // Responsive padding
      var cssW = canvas.clientWidth;
      var mobile = cssW < 480;
      var PAD_LEFT   = mobile ? 44 : 56;
      var PAD_BOTTOM = mobile ? 44 : 52;
      var PAD_TOP    = mobile ? 36 : 44;
      var PAD_RIGHT  = mobile ? 10 : 16;
      var FONT_SIZE  = mobile ? 11 : 13;

      // Square side
      var S = Math.min(cssW - PAD_LEFT - PAD_RIGHT, 500);
      var totalH = PAD_TOP + S + PAD_BOTTOM;
      canvas.style.height = totalH + "px";

      var dpr = window.devicePixelRatio || 1;
      canvas.width  = cssW * dpr;
      canvas.height = totalH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var ox = PAD_LEFT;
      var oy = PAD_TOP;

      ctx.clearRect(0, 0, cssW, totalH);

      // --- Background strips (sick bottom, healthy top) ---
      var sickH = pSick * S;
      var healthyH = pHealthy * S;

      // Healthy strip (top)
      ctx.fillStyle = COL_HEALTHY;
      ctx.fillRect(ox, oy, S, healthyH);

      // Sick strip (bottom)
      ctx.fillStyle = COL_SICK;
      ctx.fillRect(ox, oy + healthyH, S, sickH);

      // --- Positive regions ---
      // Positive given sick: within sick strip, width = pPosSick * S
      ctx.fillStyle = COL_POS_SICK;
      ctx.fillRect(ox, oy + healthyH, pPosSick * S, sickH);

      // Positive given healthy: within healthy strip, width = pPosH * S
      ctx.fillStyle = COL_POS_H;
      ctx.fillRect(ox, oy, pPosH * S, healthyH);

      // --- 10x10 grid ---
      ctx.strokeStyle = "rgba(120,120,120,0.7)";
      ctx.lineWidth   = 0.75;
      ctx.setLineDash([3, 3]);
      for (var gi = 1; gi < 10; gi++) {
        ctx.beginPath();
        ctx.moveTo(ox + gi * S / 10, oy);
        ctx.lineTo(ox + gi * S / 10, oy + S);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ox, oy + gi * S / 10);
        ctx.lineTo(ox + S, oy + gi * S / 10);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // --- Unit square outline ---
      ctx.strokeStyle = C.annotation;
      ctx.lineWidth   = 1.5;
      ctx.strokeRect(ox, oy, S, S);

      // --- Horizontal split line (sick / healthy boundary) ---
      ctx.strokeStyle = COL_SPLIT;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.moveTo(ox, oy + healthyH);
      ctx.lineTo(ox + S, oy + healthyH);
      ctx.stroke();

      // --- Vertical dashed line: P(positive|sick) ---
      if (pPosSick > 0.02 && pPosSick < 0.98) {
        ctx.strokeStyle = COL_SPLIT;
        ctx.lineWidth   = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(ox + pPosSick * S, oy + healthyH);
        ctx.lineTo(ox + pPosSick * S, oy + S);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // --- Vertical dashed line: P(positive|healthy) ---
      if (pPosH > 0.02 && pPosH < 0.98) {
        ctx.strokeStyle = COL_TOP_AXIS;
        ctx.lineWidth   = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(ox + pPosH * S, oy);
        ctx.lineTo(ox + pPosH * S, oy + healthyH);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // --- Area labels inside rectangles ---
      var font = "bold " + FONT_SIZE + "px sans-serif";
      ctx.font = font;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      // Label in sick+positive area
      var sickPosArea = (pPosSick * pSick).toFixed(4);
      var sickPosW = pPosSick * S;
      if (sickPosW > 50 && sickH > FONT_SIZE + 8) {
        ctx.fillStyle = "#fff";
        ctx.fillText(sickPosArea, ox + sickPosW / 2, oy + healthyH + sickH / 2);
      }

      // Label in healthy+positive area
      var healthyPosArea = (pPosH * pHealthy).toFixed(4);
      var healthyPosW = pPosH * S;
      if (healthyPosW > 50 && healthyH > FONT_SIZE + 8) {
        ctx.fillStyle = "#fff";
        ctx.fillText(healthyPosArea, ox + healthyPosW / 2, oy + healthyH / 2);
      }

      // --- Bottom X-axis: P(positive|sick) ---
      var FONT_TICK  = mobile ? 13 : 15;
      var FONT_TITLE = mobile ? 13 : 16;

      ctx.fillStyle    = C.annotation;
      ctx.font         = "bold " + FONT_TICK + "px sans-serif";
      ctx.textAlign    = "center";
      ctx.textBaseline = "top";

      ctx.fillText("0", ox, oy + S + 5);
      ctx.fillText("1", ox + S, oy + S + 5);

      if (pPosSick > 0.06 && pPosSick < 0.94) {
        ctx.fillStyle = COL_SPLIT;
        ctx.fillText(pPosSick.toFixed(2), ox + pPosSick * S, oy + S + 5);
      }

      ctx.font      = "bold " + FONT_TITLE + "px sans-serif";
      ctx.fillStyle = C.annotation;
      ctx.fillText("P(+|Hugly)", ox + S / 2, oy + S + FONT_TICK + 10);

      // --- Top X-axis: P(positive|healthy) ---
      ctx.font         = "bold " + FONT_TICK + "px sans-serif";
      ctx.textBaseline = "bottom";

      ctx.fillStyle = C.annotation;
      ctx.fillText("0", ox, oy - 5);
      ctx.fillText("1", ox + S, oy - 5);

      if (pPosH > 0.06 && pPosH < 0.94) {
        ctx.fillStyle = COL_TOP_AXIS;
        ctx.fillText(pPosH.toFixed(2), ox + pPosH * S, oy - 5);
      }

      ctx.font      = "bold " + FONT_TITLE + "px sans-serif";
      ctx.fillStyle = C.annotation;
      ctx.fillText("P(+|healthy)", ox + S / 2, oy - FONT_TICK - 8);

      // --- Y-axis labels ---
      ctx.font         = "bold " + FONT_TICK + "px sans-serif";
      ctx.textAlign    = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle    = C.annotation;

      ctx.fillText("0", ox - 6, oy + S);
      ctx.fillText("1", ox - 6, oy);

      // P(sick) tick
      if (pSick > 0.06 && pSick < 0.94) {
        ctx.fillStyle = COL_SPLIT;
        ctx.fillText(pSick.toFixed(2), ox - 6, oy + healthyH);
      }

      // Y-axis title
      ctx.save();
      ctx.font      = "bold " + FONT_TITLE + "px sans-serif";
      ctx.fillStyle = C.annotation;
      ctx.translate(ox - (mobile ? 30 : 40), oy + S / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("P(Hugly)", 0, 0);
      ctx.restore();

      // --- Strip labels on right side ---
      ctx.textAlign    = "left";
      ctx.textBaseline = "middle";
      ctx.font         = "bold " + FONT_SIZE + "px sans-serif";

      if (sickH > FONT_SIZE + 4) {
        ctx.fillStyle = COL_SPLIT;
        ctx.fillText("Hugly", ox + S + 4, oy + healthyH + sickH / 2);
      }
      if (healthyH > FONT_SIZE + 4) {
        ctx.fillStyle = "#440154";
        ctx.fillText("healthy", ox + S + 4, oy + healthyH / 2);
      }
    }

    sliderSick.addEventListener("input", draw);
    sliderPosSick.addEventListener("input", draw);
    sliderPosH.addEventListener("input", draw);
    window.addEventListener("resize", draw);

    draw();

    return { draw: draw };
  }

  window.DependentEvents = { create: createDependentEventsPlot };
})();
