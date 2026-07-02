// bayes_visual.js — P(sick|positive) via area decomposition
// Driven by the same sliders as dependent_events.js
(function () {
  "use strict";

  var C = window.INFERNO.roles;

  function toSafeProbability(val) {
    var n = parseFloat(val);
    if (isNaN(n) || n < 0) return 0;
    if (n > 1) return 1;
    return Math.round(n * 100) / 100;
  }

  function createBayesVisual(cfg) {
    var canvas        = document.getElementById(cfg.canvasId);
    var ctx           = canvas.getContext("2d");
    var sliderSick    = document.getElementById(cfg.sliderSickId);
    var sliderPosSick = document.getElementById(cfg.sliderPosSickId);
    var sliderPosH    = document.getElementById(cfg.sliderPosHealthyId);

    // Colors — match dependent_events.js
    var COL_TRUE_POS  = "rgba(187, 55, 84, 0.85)";
    var COL_FALSE_POS = "rgba(221, 81, 58, 0.65)";
    var COL_SPLIT     = "#bb3754";
    var COL_FP        = "#dd513a";
    var COL_BG        = "#1a1a2e";

    function draw() {
      var pSick    = toSafeProbability(sliderSick.value);
      var pHealthy = 1 - pSick;
      var pPosSick = toSafeProbability(sliderPosSick.value);
      var pPosH    = toSafeProbability(sliderPosH.value);

      // Areas (joint probabilities)
      var areaTP = pPosSick * pSick;        // True Positive area
      var areaFP = pPosH * pHealthy;        // False Positive area
      var areaFN = (1 - pPosSick) * pSick;  // False Negative area
      var pPos   = areaTP + areaFP;         // Total positive

      // Bayes' theorem
      var pSickGivenPos = (pPos > 0) ? areaTP / pPos : 0;

      // Responsive layout
      var cssW = canvas.clientWidth;
      var mobile = cssW < 480;
      var PAD_LEFT   = mobile ? 10 : 16;
      var PAD_RIGHT  = mobile ? 10 : 16;
      var PAD_TOP    = mobile ? 30 : 36;
      var PAD_BOTTOM = mobile ? 50 : 58;
      var FONT       = mobile ? 11 : 13;
      var FONT_SM    = mobile ? 10 : 11;

      var barW = cssW - PAD_LEFT - PAD_RIGHT;
      var barH = mobile ? 44 : 56;
      var totalH = PAD_TOP + barH + PAD_BOTTOM;

      canvas.style.height = totalH + "px";
      var dpr = window.devicePixelRatio || 1;
      canvas.width  = cssW * dpr;
      canvas.height = totalH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, totalH);

      var ox = PAD_LEFT;
      var oy = PAD_TOP;

      // --- Title ---
      var FONT_TITLE = mobile ? 14 : 17;
      ctx.font         = "bold " + FONT_TITLE + "px sans-serif";
      ctx.textAlign    = "center";
      ctx.textBaseline = "bottom";
      ctx.fillStyle    = C.annotation;
      ctx.fillText("P(sick | positive) = " + pSickGivenPos.toFixed(4), cssW / 2, oy - 8);

      // --- Background bar (total = 1 scale = pPos) ---
      ctx.fillStyle = COL_BG;
      ctx.fillRect(ox, oy, barW, barH);

      // --- 10-division grid on bar ---
      ctx.strokeStyle = "rgba(120,120,120,0.7)";
      ctx.lineWidth   = 0.75;
      ctx.setLineDash([3, 3]);
      for (var gi = 1; gi < 10; gi++) {
        ctx.beginPath();
        ctx.moveTo(ox + gi * barW / 10, oy);
        ctx.lineTo(ox + gi * barW / 10, oy + barH);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.strokeStyle = C.annotation;
      ctx.lineWidth   = 1;
      ctx.strokeRect(ox, oy, barW, barH);

      if (pPos < 0.0001) {
        // Edge case: nothing positive
        ctx.font         = FONT + "px sans-serif";
        ctx.fillStyle    = C.annotation;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("P(+) \u2248 0", ox + barW / 2, oy + barH / 2);
        return;
      }

      // --- True Positive segment (left) ---
      var tpW = (areaTP / pPos) * barW;
      ctx.fillStyle = COL_TRUE_POS;
      ctx.fillRect(ox, oy, tpW, barH);

      // --- False Positive segment (right) ---
      var fpW = barW - tpW;
      ctx.fillStyle = COL_FALSE_POS;
      ctx.fillRect(ox + tpW, oy, fpW, barH);

      // --- Divider line ---
      if (tpW > 2 && fpW > 2) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth   = 2;
        ctx.beginPath();
        ctx.moveTo(ox + tpW, oy);
        ctx.lineTo(ox + tpW, oy + barH);
        ctx.stroke();
      }

      // --- Labels inside bar segments ---
      ctx.textBaseline = "middle";
      ctx.font = "bold " + FONT + "px sans-serif";

      // TP label
      var tpLabel = "TP = " + areaTP.toFixed(4);
      var tpLabelW = ctx.measureText(tpLabel).width;
      if (tpW > tpLabelW + 10) {
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(tpLabel, ox + tpW / 2, oy + barH / 2);
      }

      // FP label
      var fpLabel = "FP = " + areaFP.toFixed(4);
      var fpLabelW = ctx.measureText(fpLabel).width;
      if (fpW > fpLabelW + 10) {
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(fpLabel, ox + tpW + fpW / 2, oy + barH / 2);
      }

      // --- Bar axis labels ---
      var FONT_TICK = mobile ? 13 : 15;
      ctx.font         = "bold " + FONT_TICK + "px sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign    = "left";
      ctx.fillStyle    = C.annotation;
      ctx.fillText("0", ox, oy + barH + 5);
      ctx.textAlign = "right";
      ctx.fillText("1", ox + barW, oy + barH + 5);

      // Tick at TP/FP boundary
      if (tpW > 20 && fpW > 20) {
        ctx.textAlign = "center";
        ctx.fillStyle = COL_SPLIT;
        ctx.fillText((pSickGivenPos).toFixed(4), ox + tpW, oy + barH + 5);
      }

      // --- Percentage annotation ---
      var pctY = oy + barH + FONT_TICK + 14;
      ctx.font      = "bold " + FONT + "px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = COL_SPLIT;
      ctx.fillText(
        (pSickGivenPos * 100).toFixed(1) + "% of positive results are truly sick",
        cssW / 2,
        pctY
      );
    }

    sliderSick.addEventListener("input", draw);
    sliderPosSick.addEventListener("input", draw);
    sliderPosH.addEventListener("input", draw);
    window.addEventListener("resize", draw);

    draw();

    return { draw: draw };
  }

  window.BayesVisual = { create: createBayesVisual };
})();
