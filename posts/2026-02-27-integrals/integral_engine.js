// Shared engine for all interactive integral plots.
// Each plot supplies a small config object; the engine handles
// traces, layouts, crosshairs, and Plotly rendering.
//
// Usage:
//   createIntegralPlot({
//     idPrefix:    'Log',
//     tMin:        1,
//     tMax:        20,
//     f:           function(t) { return Math.log(t); },
//     F:           function(t) { return t * Math.log(t) - t; },
//     title:       'f(t) = ln(t)',
//     integralLabel: '∫ₐᵇ ln(τ) dτ',
//     yRange:      [0, Math.log(20) + 0.3],
//     dtick:       2,
//     hoverFmt:    ':.2f',
//     step:        10,          // points per unit on x-axis
//     defaultLower: 1,
//     defaultUpper: 10
//   });

function createIntegralPlot(cfg) {
  var idPrefix     = cfg.idPrefix  || '';
  var tMin         = cfg.tMin      != null ? cfg.tMin : 0;
  var tMax         = cfg.tMax;
  var f            = cfg.f;
  var F            = cfg.F;
  var maxIntegral  = F(tMax) - F(tMin);
  var title        = cfg.title;
  var intLabel     = cfg.integralLabel;
  var yRange       = cfg.yRange;
  var dtick        = cfg.dtick     || 2;
  var hoverFmt     = cfg.hoverFmt  || ':.1f';
  var step         = cfg.step      || 10;  // samples per unit
  var defaultLower = cfg.defaultLower != null ? cfg.defaultLower : tMin;
  var defaultUpper = cfg.defaultUpper != null ? cfg.defaultUpper : tMax;

  function generateData(tLower, tUpper) {
    var lineT = [], lineY = [];
    for (var i = Math.round(tMin * step); i <= Math.round(tMax * step); i++) {
      var t = i / step;
      lineT.push(t);
      lineY.push(f(t));
    }

    var fillT = [tLower], fillY = [0];
    for (var i = Math.round(tLower * step); i <= Math.round(tUpper * step); i++) {
      var t = i / step;
      fillT.push(t);
      fillY.push(f(t));
    }
    fillT.push(tUpper);
    fillY.push(0);

    var integralValue   = F(tUpper) - F(tLower);
    var integralPercent = (integralValue / maxIntegral) * 100;

    return {
      lineT: lineT, lineY: lineY,
      fillT: fillT, fillY: fillY,
      integralValue: integralValue,
      integralPercent: integralPercent,
      tLower: tLower, tUpper: tUpper,
      fLower: f(tLower), fUpper: f(tUpper)
    };
  }

  var updateFnName = idPrefix
    ? 'update' + idPrefix + 'IntegralPlot'
    : 'updateIntegralPlot';

  window[updateFnName] = function () {
    var slider = document.getElementById('rangeSlider' + idPrefix);
    var values = slider && slider.noUiSlider
      ? slider.noUiSlider.get()
      : [defaultLower, defaultUpper];
    var tLower = parseFloat(values[0]);
    var tUpper = parseFloat(values[1]);

    var d = generateData(tLower, tUpper);
    document.getElementById('integralValue' + idPrefix).textContent = d.integralValue.toFixed(2);
    document.getElementById('integralPercent' + idPrefix).textContent = d.integralPercent.toFixed(0);

    var R = window.INFERNO.roles;
    var hoverTpl = 'time: %{x:.1f}<br>y: %{y' + hoverFmt + '}<extra></extra>';

    var traces = [
      // filled area
      { x: d.fillT, y: d.fillY, fill: 'toself',
        fillcolor: R.fillA, line: {color: R.fillBorderA, width: 1},
        name: 'Area', hoverinfo: 'skip' },
      // function curve
      { x: d.lineT, y: d.lineY, mode: 'lines',
        line: {color: R.lineA, width: 2},
        name: title, hovertemplate: hoverTpl },
      // lower marker
      { x: [d.tLower], y: [d.fLower], mode: 'markers',
        marker: {color: R.markerLower, size: 10, line: {color: '#000004', width: 1}},
        name: 'Lower limit', hovertemplate: hoverTpl },
      // upper marker
      { x: [d.tUpper], y: [d.fUpper], mode: 'markers',
        marker: {color: R.markerUpper, size: 12, line: {color: '#fcffa4', width: 1}},
        name: 'Upper limit', hovertemplate: hoverTpl }
    ];

    // Crosshair shapes: dotted lines from each marker to both axes
    var shapes = [
      // lower vertical
      {type:'line', x0:d.tLower, x1:d.tLower, y0:0, y1:d.fLower,
       line:{color:R.markerLower, width:1.5, dash:'dot'}},
      // lower horizontal
      {type:'line', x0:tMin, x1:d.tLower, y0:d.fLower, y1:d.fLower,
       line:{color:R.markerLower, width:1.5, dash:'dot'}},
      // upper vertical
      {type:'line', x0:d.tUpper, x1:d.tUpper, y0:0, y1:d.fUpper,
       line:{color:R.markerUpper, width:1.5, dash:'dot'}},
      // upper horizontal
      {type:'line', x0:tMin, x1:d.tUpper, y0:d.fUpper, y1:d.fUpper,
       line:{color:R.markerUpper, width:1.5, dash:'dot'}}
    ];

    var layoutLeft = {
      xaxis: {title: 'time', range: [tMin, tMax], dtick: dtick},
      yaxis: {title: 'growth(t)', range: yRange},
      plot_bgcolor: 'white', paper_bgcolor: 'white',
      margin: {l: 50, r: 20, t: 30, b: 50},
      showlegend: false,
      shapes: shapes
    };

    var layoutRight = {
      xaxis: {showticklabels: false},
      yaxis: {title: '%', range: [0, 110], ticksuffix: '%'},
      plot_bgcolor: 'white', paper_bgcolor: 'white',
      margin: {l: 50, r: 20, t: 50, b: 50},
      showlegend: false,
      shapes: [{
        type: 'line', xref: 'paper', x0: 0.1, x1: 0.9, y0: 100, y1: 100,
        line: {color: R.annotation, width: 2, dash: 'dash'}
      }]
    };

    var barTrace = {
      x: ['Integral'], y: [d.integralPercent], type: 'bar',
      marker: {color: R.fillB}, name: intLabel,
      hovertemplate: '%{y:.1f}%<extra></extra>', width: 0.5
    };

    var config = {responsive: true, displayModeBar: false};
    Plotly.react('leftPlot'  + idPrefix, traces, layoutLeft,  config);
    Plotly.react('rightPlot' + idPrefix, [barTrace], layoutRight, config);
  };

  // Run on first load
  window[updateFnName]();
}
