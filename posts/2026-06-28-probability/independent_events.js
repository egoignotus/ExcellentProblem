// independent_events.js — Interactive unit-square visual for independent events
// P(A ∩ B) = P(A) × P(B)  ↔  area of the intersection rectangle
(function () {
  "use strict";

  var C = window.INFERNO.roles;

  function toSafeProbability(val) {
    var n = parseFloat(val);
    if (isNaN(n) || n < 0) return 0;
    if (n > 1) return 1;
    return Math.round(n * 100) / 100;   // two-decimal precision
  }

  function createIndependentEventsPlot(cfg) {
    var canvas  = document.getElementById(cfg.canvasId);
    var ctx     = canvas.getContext("2d");
    var sliderX = document.getElementById(cfg.sliderXId);
    var sliderY = document.getElementById(cfg.sliderYId);
    var labelX  = document.getElementById(cfg.labelXId);
    var labelY  = document.getElementById(cfg.labelYId);

    function draw() {
      var pA = toSafeProbability(sliderX.value);
      var pB = toSafeProbability(sliderY.value);

      labelX.textContent = pA.toFixed(2);
      labelY.textContent = pB.toFixed(2);

      // Responsive padding — shrink on narrow screens
      var cssW = canvas.clientWidth;
      var mobile = cssW < 480;
      var PAD_LEFT   = mobile ? 36 : 48;
      var PAD_BOTTOM = mobile ? 44 : 52;
      var PAD_TOP    = mobile ? 12 : 16;
      var PAD_RIGHT  = mobile ? 10 : 16;
      var FONT_SIZE  = mobile ? 11 : 13;

      // Square side: fill available width, cap at 500 for readability
      var S = Math.min(cssW - PAD_LEFT - PAD_RIGHT, 500);

      // Canvas height derived from S so axis labels always fit
      var totalH = PAD_TOP + S + PAD_BOTTOM;
      canvas.style.height = totalH + "px";

      var dpr = window.devicePixelRatio || 1;
      canvas.width  = cssW * dpr;
      canvas.height = totalH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var ox = PAD_LEFT;
      var oy = PAD_TOP;

      ctx.clearRect(0, 0, cssW, totalH);

      // --- unit square outline ---
      ctx.strokeStyle = C.annotation;
      ctx.lineWidth   = 1.5;
      ctx.strokeRect(ox, oy, S, S);

      // --- P(B) vertical band (full height, width = pA * S) ---
      ctx.fillStyle = C.fillA;                         // purple tint
      ctx.fillRect(ox, oy, pA * S, S);

      // --- P(A) horizontal band (full width, height = pB * S, from bottom) ---
      ctx.fillStyle = "rgba(221, 81, 58, 0.25)";      // orange tint (fillB-like)
      ctx.fillRect(ox, oy + S - pB * S, S, pB * S);

      // --- intersection P(A)·P(B) overlay ---
      var intW = pA * S;
      var intH = pB * S;
      var intX = ox;
      var intY = oy + S - intH;
      ctx.fillStyle = "rgba(187, 55, 84, 0.55)";      // blended magenta
      ctx.fillRect(intX, intY, intW, intH);

      // --- area label inside intersection ---
      var areaText = (pA * pB).toFixed(4);
      var areaFont = "bold " + FONT_SIZE + "px sans-serif";
      ctx.font = areaFont;
      var textW = ctx.measureText(areaText).width;
      var textH = FONT_SIZE;
      if (intW > textW + 8 && intH > textH + 8) {
        ctx.fillStyle    = "#fff";
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(areaText, intX + intW / 2, intY + intH / 2);
      }

      // --- axis ticks & labels ---
      var font = FONT_SIZE + "px sans-serif";
      ctx.fillStyle   = C.annotation;
      ctx.font        = font;
      ctx.textAlign   = "center";
      ctx.textBaseline = "top";

      // x-axis: 0 and 1
      ctx.fillText("0", ox, oy + S + 5);
      ctx.fillText("1", ox + S, oy + S + 5);

      // x-axis: P(A) tick
      if (pA > 0.06 && pA < 0.94) {
        var xTick = ox + pA * S;
        ctx.strokeStyle = C.lineA;
        ctx.lineWidth   = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(xTick, oy);
        ctx.lineTo(xTick, oy + S);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = C.lineA;
        ctx.fillText(pA.toFixed(2), xTick, oy + S + 5);
      }

      // x-axis title
      ctx.fillStyle = C.annotation;
      ctx.fillText("P(A)", ox + S / 2, oy + S + FONT_SIZE + 10);

      // y-axis: 0 and 1
      ctx.textAlign    = "right";
      ctx.textBaseline = "middle";
      ctx.fillText("0", ox - 6, oy + S);
      ctx.fillText("1", ox - 6, oy);

      // y-axis: P(B) tick
      if (pB > 0.06 && pB < 0.94) {
        var yTick = oy + S - pB * S;
        ctx.strokeStyle = C.lineB;
        ctx.lineWidth   = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(ox, yTick);
        ctx.lineTo(ox + S, yTick);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = C.lineB;
        ctx.fillText(pB.toFixed(2), ox - 6, yTick);
      }

      // y-axis title (rotated)
      ctx.save();
      ctx.fillStyle = C.annotation;
      ctx.translate(ox - (mobile ? 24 : 34), oy + S / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("P(B)", 0, 0);
      ctx.restore();

      // --- legend inside the square ---
      ctx.textAlign    = "left";
      ctx.textBaseline = "top";
      ctx.font         = "bold " + FONT_SIZE + "px sans-serif";

      var legW = mobile ? 100 : 130;
      var legX = ox + S - legW + 4;
      var legY = oy + 8;
      if (pA > 0.55 && pB > 0.55) { legY = oy + S - 52; }

      // P(A) swatch
      ctx.fillStyle = C.fillA;
      ctx.fillRect(legX, legY, 14, 14);
      ctx.strokeStyle = C.lineA; ctx.lineWidth = 1;
      ctx.strokeRect(legX, legY, 14, 14);
      ctx.fillStyle = C.lineA;
      ctx.fillText("P(A)", legX + 20, legY + 1);

      // P(B) swatch
      ctx.fillStyle = "rgba(221, 81, 58, 0.25)";
      ctx.fillRect(legX, legY + 20, 14, 14);
      ctx.strokeStyle = C.lineB; ctx.lineWidth = 1;
      ctx.strokeRect(legX, legY + 20, 14, 14);
      ctx.fillStyle = C.lineB;
      ctx.fillText("P(B)", legX + 20, legY + 21);

      // P(A∩B) swatch
      ctx.fillStyle = "rgba(187, 55, 84, 0.55)";
      ctx.fillRect(legX, legY + 40, 14, 14);
      ctx.strokeStyle = "#bb3754"; ctx.lineWidth = 1;
      ctx.strokeRect(legX, legY + 40, 14, 14);
      ctx.fillStyle = "#bb3754";
      ctx.fillText("P(A\u2229B)", legX + 20, legY + 41);
    }

    sliderX.addEventListener("input", draw);
    sliderY.addEventListener("input", draw);
    window.addEventListener("resize", draw);

    draw();

    return { draw: draw };
  }

  window.IndependentEvents = { create: createIndependentEventsPlot };
})();
