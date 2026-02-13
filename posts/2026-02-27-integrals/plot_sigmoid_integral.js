function initSigmoidIntegralPlot(el) {
  var tMin = -5;
  var tMax = 5;
  // Sigmoid: f(t) = 1 / (1 + exp(-t))
  // Integral: F(t) = ln(1 + exp(t)) + C
  // From tMin to tMax: ln(1 + exp(tMax)) - ln(1 + exp(tMin))
  var maxIntegral = Math.log(1 + Math.exp(tMax)) - Math.log(1 + Math.exp(tMin));
  
  function sigmoid(t) {
    return 1 / (1 + Math.exp(-t));
  }
  
  function sigmoidIntegral(t) {
    return Math.log(1 + Math.exp(t));
  }
  
  function generateData(tLower, tUpper) {
    // Generate points for the sigmoid curve
    var lineT = [];
    var lineY = [];
    for (var i = tMin * 10; i <= tMax * 10; i++) {
      var t = i / 10;
      lineT.push(t);
      lineY.push(sigmoid(t));
    }
    
    // Generate filled area from tLower to tUpper
    var fillT = [tLower];
    var fillY = [0];
    for (var i = Math.round(tLower * 10); i <= Math.round(tUpper * 10); i++) {
      var t = i / 10;
      fillT.push(t);
      fillY.push(sigmoid(t));
    }
    fillT.push(tUpper);
    fillY.push(0);
    
    // Integral of sigmoid from tLower to tUpper
    var integralValue = sigmoidIntegral(tUpper) - sigmoidIntegral(tLower);
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
  
  window.updateSigmoidIntegralPlot = function() {
    var slider = document.getElementById('rangeSliderSigmoid');
    var values = slider && slider.noUiSlider ? slider.noUiSlider.get() : [-2, 2];
    var tLower = parseFloat(values[0]);
    var tUpper = parseFloat(values[1]);
    
    var data = generateData(tLower, tUpper);
    document.getElementById('integralValueSigmoid').textContent = data.integralValue.toFixed(2);
    document.getElementById('integralPercentSigmoid').textContent = data.integralPercent.toFixed(0);
    
    // Left plot traces
    var traceLine = {
      x: data.lineT,
      y: data.lineY,
      mode: 'lines',
      name: 'y = σ(t)',
      line: {color: 'teal', width: 2},
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.3f}<extra></extra>'
    };
    
    var traceFill = {
      x: data.fillT,
      y: data.fillY,
      fill: 'toself',
      fillcolor: 'rgba(0, 128, 128, 0.3)',
      line: {color: 'rgba(0, 128, 128, 0.8)', width: 1},
      name: 'Area',
      hoverinfo: 'skip'
    };
    
    var traceMarkerLower = {
      x: [data.tLower],
      y: [sigmoid(data.tLower)],
      mode: 'markers',
      marker: {color: 'orange', size: 10},
      name: 'Lower limit',
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.3f}<extra></extra>'
    };
    
    var traceMarkerUpper = {
      x: [data.tUpper],
      y: [sigmoid(data.tUpper)],
      mode: 'markers',
      marker: {color: 'red', size: 12},
      name: 'Upper limit',
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.3f}<extra></extra>'
    };
    
    // Right plot traces - using percentage
    var traceIntegralBar = {
      x: ['Integral'],
      y: [data.integralPercent],
      type: 'bar',
      marker: {color: 'rgba(0, 128, 128, 0.7)'},
      name: '∫ₐᵇ σ(τ) dτ',
      hovertemplate: '%{y:.1f}%<extra></extra>',
      width: 0.5
    };
    
    var layoutLeft = {
      title: {text: 'f(t) = 1/(1+e⁻ᵗ)', font: {size: 14}},
      xaxis: {title: 'time', range: [tMin, tMax], dtick: 2},
      yaxis: {title: 'y', range: [0, 1.1]},
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      margin: {l: 50, r: 20, t: 50, b: 50},
      showlegend: false
    };
    
    var layoutRight = {
      title: {text: '∫ₐᵇ σ(τ) dτ', font: {size: 14}},
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
    
    Plotly.react('leftPlotSigmoid', [traceFill, traceLine, traceMarkerLower, traceMarkerUpper], layoutLeft, config);
    Plotly.react('rightPlotSigmoid', [traceIntegralBar], layoutRight, config);
  };
  
  // Initialize
  window.updateSigmoidIntegralPlot();
}
