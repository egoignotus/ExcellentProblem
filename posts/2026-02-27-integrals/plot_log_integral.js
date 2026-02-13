function initLogIntegralPlot(el) {
  var tMin = 1;
  var tMax = 10;
  // Max integral: ∫₁^10 ln(t)dt
  var maxIntegral = tMax * Math.log(tMax) - tMax - (tMin * Math.log(tMin) - tMin);
  
  function generateData(tLower, tUpper) {
    // Generate points for the line y = ln(t)
    var lineT = [];
    var lineY = [];
    for (var i = Math.round(tMin * 10); i <= tMax * 10; i++) {
      var t = i / 10;
      lineT.push(t);
      lineY.push(Math.log(t));
    }
    
    // Generate filled area from tLower to tUpper
    var fillT = [tLower];
    var fillY = [0];
    for (var i = Math.round(tLower * 10); i <= Math.round(tUpper * 10); i++) {
      var t = i / 10;
      fillT.push(t);
      fillY.push(Math.log(t));
    }
    fillT.push(tUpper);
    fillY.push(0);
    
    // Integral of ln(t) from tLower to tUpper = [t*ln(t) - t] evaluated
    var integralValue = (tUpper * Math.log(tUpper) - tUpper) - (tLower * Math.log(tLower) - tLower);
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
  
  window.updateLogIntegralPlot = function() {
    var slider = document.getElementById('rangeSliderLog');
    var values = slider && slider.noUiSlider ? slider.noUiSlider.get() : [1, 5];
    var tLower = parseFloat(values[0]);
    var tUpper = parseFloat(values[1]);
    
    var data = generateData(tLower, tUpper);
    document.getElementById('integralValueLog').textContent = data.integralValue.toFixed(2);
    document.getElementById('integralPercentLog').textContent = data.integralPercent.toFixed(0);
    
    // Left plot traces
    var traceLine = {
      x: data.lineT,
      y: data.lineY,
      mode: 'lines',
      name: 'y = ln(t)',
      line: {color: 'green', width: 2},
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.2f}<extra></extra>'
    };
    
    var traceFill = {
      x: data.fillT,
      y: data.fillY,
      fill: 'toself',
      fillcolor: 'rgba(144, 238, 144, 0.4)',
      line: {color: 'rgba(34, 139, 34, 0.8)', width: 1},
      name: 'Area',
      hoverinfo: 'skip'
    };
    
    var traceMarkerLower = {
      x: [data.tLower],
      y: [Math.log(data.tLower)],
      mode: 'markers',
      marker: {color: 'orange', size: 10},
      name: 'Lower limit',
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.2f}<extra></extra>'
    };
    
    var traceMarkerUpper = {
      x: [data.tUpper],
      y: [Math.log(data.tUpper)],
      mode: 'markers',
      marker: {color: 'red', size: 12},
      name: 'Upper limit',
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.2f}<extra></extra>'
    };
    
    // Right plot traces - using percentage
    var traceIntegralBar = {
      x: ['Integral'],
      y: [data.integralPercent],
      type: 'bar',
      marker: {color: 'rgba(144, 238, 144, 0.7)'},
      name: '∫ₐᵇ ln(τ) dτ',
      hovertemplate: '%{y:.1f}%<extra></extra>',
      width: 0.5
    };
    
    var layoutLeft = {
      title: {text: 'f(t) = ln(t)', font: {size: 14}},
      xaxis: {title: 'time', range: [0, tMax], dtick: 2},
      yaxis: {title: 'y', range: [0, Math.log(tMax) + 0.3]},
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      margin: {l: 50, r: 20, t: 50, b: 50},
      showlegend: false
    };
    
    var layoutRight = {
      title: {text: '∫ₐᵇ ln(τ) dτ', font: {size: 14}},
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
    
    Plotly.react('leftPlotLog', [traceFill, traceLine, traceMarkerLower, traceMarkerUpper], layoutLeft, config);
    Plotly.react('rightPlotLog', [traceIntegralBar], layoutRight, config);
  };
  
  // Initialize
  window.updateLogIntegralPlot();
}
