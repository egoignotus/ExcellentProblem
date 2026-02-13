function initConstantIntegralPlot(el) {
  var tMax = 10;
  var C = 5;
  var maxIntegral = C * tMax; // = 50
  
  function generateData(tLower, tUpper) {
    // Generate points for the line y = 5
    var lineT = [0, tMax];
    var lineY = [C, C];
    
    // Generate filled area from tLower to tUpper
    var fillT = [tLower, tLower, tUpper, tUpper];
    var fillY = [0, C, C, 0];
    
    // Integral of 5 from tLower to tUpper = 5 * (tUpper - tLower)
    var integralValue = C * (tUpper - tLower);
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
  
  window.updateConstantIntegralPlot = function() {
    var slider = document.getElementById('rangeSliderConstant');
    var values = slider && slider.noUiSlider ? slider.noUiSlider.get() : [0, 5];
    var tLower = parseFloat(values[0]);
    var tUpper = parseFloat(values[1]);
    
    var data = generateData(tLower, tUpper);
    document.getElementById('integralValueConstant').textContent = data.integralValue.toFixed(2);
    document.getElementById('integralPercentConstant').textContent = data.integralPercent.toFixed(0);
    
    // Left plot traces
    var R = window.INFERNO.roles;

    var traceLine = {
      x: data.lineT,
      y: data.lineY,
      mode: 'lines',
      name: 'y = 5',
      line: {color: R.lineA, width: 2},
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.1f}<extra></extra>'
    };
    
    var traceFill = {
      x: data.fillT,
      y: data.fillY,
      fill: 'toself',
      fillcolor: R.fillA,
      line: {color: R.fillBorderA, width: 1},
      name: 'Area',
      hoverinfo: 'skip'
    };
    
    var traceMarkerLower = {
      x: [data.tLower],
      y: [C],
      mode: 'markers',
      marker: {color: R.markerLower, size: 10, line: {color: '#000004', width: 1}},
      name: 'Lower limit',
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.1f}<extra></extra>'
    };
    
    var traceMarkerUpper = {
      x: [data.tUpper],
      y: [C],
      mode: 'markers',
      marker: {color: R.markerUpper, size: 12, line: {color: '#fcffa4', width: 1}},
      name: 'Upper limit',
      hovertemplate: 'time: %{x:.1f}<br>y: %{y:.1f}<extra></extra>'
    };
    
    // Right plot traces - using percentage
    var traceIntegralBar = {
      x: ['Integral'],
      y: [data.integralPercent],
      type: 'bar',
      marker: {color: R.fillB},
      name: '∫ₐᵇ 5 dτ',
      hovertemplate: '%{y:.1f}%<extra></extra>',
      width: 0.5
    };
    
    var layoutLeft = {
      title: {text: 'f(t) = 5', font: {size: 14}},
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
        line: {color: R.annotation, width: 2, dash: 'dash'}
      }]
    };
    
    var config = {responsive: true, displayModeBar: false};
    
    Plotly.react('leftPlotConstant', [traceFill, traceLine, traceMarkerLower, traceMarkerUpper], layoutLeft, config);
    Plotly.react('rightPlotConstant', [traceIntegralBar], layoutRight, config);
  };
  
  // Initialize
  window.updateConstantIntegralPlot();
}
