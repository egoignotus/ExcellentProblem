function initIntegralPlot(el) {
  var tMax = 10;
  var maxIntegral = (tMax * tMax) / 2; // = 50
  
  function generateData(tLower, tUpper) {
    // Generate points for the line y = t
    var lineT = [];
    var lineY = [];
    for (var i = 0; i <= tMax * 10; i++) {
      var t = i / 10;
      lineT.push(t);
      lineY.push(t);
    }
    
    // Generate filled area from tLower to tUpper
    var fillT = [tLower];
    var fillY = [0];
    for (var i = Math.round(tLower * 10); i <= Math.round(tUpper * 10); i++) {
      var t = i / 10;
      fillT.push(t);
      fillY.push(t);
    }
    fillT.push(tUpper);
    fillY.push(0);
    
    // Integral of t from tLower to tUpper = (tUpper^2 - tLower^2) / 2
    var integralValue = (tUpper * tUpper - tLower * tLower) / 2;
    var integralPercent = (integralValue / maxIntegral) * 100;
    
    return {
      lineT: lineT,
      lineY: lineY,
      fillT: fillT,
      fillY: fillY,
      integralValue: integralValue,
      integralPercent: integralPercent,
      tLower: tLower,
      tUpper: tUpper
    };
  }
  
  window.updateIntegralPlot = function() {
    var slider = document.getElementById('rangeSlider');
    var values = slider && slider.noUiSlider ? slider.noUiSlider.get() : [0, 5];
    var tLower = parseFloat(values[0]);
    var tUpper = parseFloat(values[1]);
    
    var data = generateData(tLower, tUpper);
    document.getElementById('integralValue').textContent = data.integralValue.toFixed(2);
    document.getElementById('integralPercent').textContent = data.integralPercent.toFixed(0);
    
    // Left plot traces
    var traceLine = {
      x: data.lineT,
      y: data.lineY,
      mode: 'lines',
      name: 'y = t',
      line: {color: 'blue', width: 2},
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.1f}<extra></extra>'
    };
    
    var traceFill = {
      x: data.fillT,
      y: data.fillY,
      fill: 'toself',
      fillcolor: 'rgba(100, 149, 237, 0.4)',
      line: {color: 'rgba(100, 149, 237, 0.8)', width: 1},
      name: 'Area',
      hoverinfo: 'skip'
    };
    
    var traceMarkerLower = {
      x: [data.tLower],
      y: [data.tLower],
      mode: 'markers',
      marker: {color: 'orange', size: 10},
      name: 'Lower limit',
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.1f}<extra></extra>'
    };
    
    var traceMarkerUpper = {
      x: [data.tUpper],
      y: [data.tUpper],
      mode: 'markers',
      marker: {color: 'red', size: 12},
      name: 'Upper limit',
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.1f}<extra></extra>'
    };
    
    // Right plot traces - using percentage
    var traceIntegralBar = {
      x: ['Integral'],
      y: [data.integralPercent],
      type: 'bar',
      marker: {color: 'rgba(100, 149, 237, 0.7)'},
      name: '∫ₐᵇ τ dτ',
      hovertemplate: '%{y:.1f}%<extra></extra>',
      width: 0.5
    };
    
    var layoutLeft = {
      title: {text: 'f(t) = t', font: {size: 14}},
      xaxis: {title: 'time', range: [0, tMax], dtick: 2},
      yaxis: {title: 'y', range: [0, tMax], dtick: 2},
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      margin: {l: 50, r: 20, t: 50, b: 50},
      showlegend: false
    };
    
    var layoutRight = {
      title: {text: '∫ₐᵇ f(τ) dτ', font: {size: 14}},
      xaxis: {showticklabels: false},
      yaxis: {title: '%', range: [0, 110], ticksuffix: '%'},
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      margin: {l: 50, r: 20, t: 50, b: 50},
      showlegend: false,
      shapes: [{
        type: 'line',
        xref: 'paper',
        x0: 0.1,
        x1: 0.9,
        y0: 100,
        y1: 100,
        line: {color: 'gray', width: 2, dash: 'dash'}
      }]
    };
    
    var config = {responsive: true, displayModeBar: false};
    
    Plotly.react('leftPlot', [traceFill, traceLine, traceMarkerLower, traceMarkerUpper], layoutLeft, config);
    Plotly.react('rightPlot', [traceIntegralBar], layoutRight, config);
  };
  
  // Initialize
  window.updateIntegralPlot();
}
