function initExpIntegralPlot(el) {
  var tMax = 5;
  // Max integral: ∫₀^5 exp(t)dt = exp(5) - exp(0) = exp(5) - 1 ≈ 147.41
  var maxIntegral = Math.exp(tMax) - 1;
  
  function generateData(tLower, tUpper) {
    // Generate points for the line y = exp(t)
    var lineT = [];
    var lineY = [];
    for (var i = 0; i <= tMax * 20; i++) {
      var t = i / 20;
      lineT.push(t);
      lineY.push(Math.exp(t));
    }
    
    // Generate filled area from tLower to tUpper
    var fillT = [tLower];
    var fillY = [0];
    for (var i = Math.round(tLower * 20); i <= Math.round(tUpper * 20); i++) {
      var t = i / 20;
      fillT.push(t);
      fillY.push(Math.exp(t));
    }
    fillT.push(tUpper);
    fillY.push(0);
    
    // Integral of exp(t) from tLower to tUpper = exp(tUpper) - exp(tLower)
    var integralValue = Math.exp(tUpper) - Math.exp(tLower);
    
    return {
      lineT: lineT,
      lineY: lineY,
      fillT: fillT,
      fillY: fillY,
      integralValue: integralValue,
      tLower: tLower,
      tUpper: tUpper
    };
  }
  
  window.updateExpIntegralPlot = function() {
    var tLower = parseFloat(document.getElementById('tSliderExpLower').value);
    var tUpper = parseFloat(document.getElementById('tSliderExpUpper').value);
    
    // Ensure lower <= upper
    if (tLower > tUpper) {
      tLower = tUpper;
      document.getElementById('tSliderExpLower').value = tLower;
    }
    
    document.getElementById('tValueExpLower').textContent = tLower.toFixed(1);
    document.getElementById('tValueExpUpper').textContent = tUpper.toFixed(1);
    
    var data = generateData(tLower, tUpper);
    document.getElementById('integralValueExp').textContent = data.integralValue.toFixed(2);
    
    // Left plot traces
    var traceLine = {
      x: data.lineT,
      y: data.lineY,
      mode: 'lines',
      name: 'y = exp(t)',
      line: {color: 'purple', width: 2},
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.2f}<extra></extra>'
    };
    
    var traceFill = {
      x: data.fillT,
      y: data.fillY,
      fill: 'toself',
      fillcolor: 'rgba(186, 85, 211, 0.4)',
      line: {color: 'rgba(128, 0, 128, 0.8)', width: 1},
      name: 'Area',
      hoverinfo: 'skip'
    };
    
    var traceMarkerLower = {
      x: [data.tLower],
      y: [Math.exp(data.tLower)],
      mode: 'markers',
      marker: {color: 'orange', size: 10},
      name: 'Lower limit',
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.2f}<extra></extra>'
    };
    
    var traceMarkerUpper = {
      x: [data.tUpper],
      y: [Math.exp(data.tUpper)],
      mode: 'markers',
      marker: {color: 'red', size: 12},
      name: 'Upper limit',
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.2f}<extra></extra>'
    };
    
    // Right plot traces
    var traceIntegralBar = {
      x: ['Integral'],
      y: [data.integralValue],
      type: 'bar',
      marker: {color: 'rgba(186, 85, 211, 0.7)'},
      name: '∫ₐᵇ exp(τ) dτ',
      hovertemplate: 'Value: %{y:.2f}<extra></extra>',
      width: 0.5
    };
    
    var layoutLeft = {
      title: {text: 'f(t) = exp(t)', font: {size: 14}},
      xaxis: {title: 'time', range: [0, tMax], dtick: 1},
      yaxis: {title: 'y', range: [0, Math.exp(tMax) * 1.05]},
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      margin: {l: 50, r: 20, t: 50, b: 50},
      showlegend: false
    };
    
    var layoutRight = {
      title: {text: '∫ₐᵇ exp(τ) dτ', font: {size: 14}},
      xaxis: {showticklabels: false},
      yaxis: {title: 'Area', range: [0, maxIntegral * 1.1]},
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      margin: {l: 50, r: 20, t: 50, b: 50},
      showlegend: false,
      shapes: [{
        type: 'line',
        xref: 'paper',
        x0: 0.1,
        x1: 0.9,
        y0: maxIntegral,
        y1: maxIntegral,
        line: {color: 'gray', width: 2, dash: 'dash'}
      }]
    };
    
    var config = {responsive: true, displayModeBar: false};
    
    Plotly.react('leftPlotExp', [traceFill, traceLine, traceMarkerLower, traceMarkerUpper], layoutLeft, config);
    Plotly.react('rightPlotExp', [traceIntegralBar], layoutRight, config);
  };
  
  // Initialize
  window.updateExpIntegralPlot();
}
