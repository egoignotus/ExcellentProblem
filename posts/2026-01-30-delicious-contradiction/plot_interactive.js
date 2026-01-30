function initInteractivePlot(el, fullData) {
  function calculateCumulativeAvg(startYear, endYear) {
    var startIdx = fullData.years.findIndex(y => y >= startYear);
    var endIdx = fullData.years.findIndex(y => y > endYear);
    
    if (startIdx === -1) startIdx = 0;
    if (endIdx === -1) endIdx = fullData.years.length;
    
    var visibleYears = fullData.years.slice(startIdx, endIdx);
    var visiblePctChange = fullData.pctChange.slice(startIdx, endIdx);
    var visibleJanPrice = fullData.janPrice.slice(startIdx, endIdx);
    
    // Calculate cumulative average for visible range
    var cumAvg = [];
    var sum = 0;
    var count = 0;
    
    for (var i = 0; i < visiblePctChange.length; i++) {
      var val = visiblePctChange[i];
      
      if (val === null || val === undefined || isNaN(val)) {
        cumAvg.push(null);
      } else {
        sum += val;
        count++;
        cumAvg.push(sum / count);
      }
    }
    
    return {
      years: visibleYears,
      pctChange: visiblePctChange,
      cumAvg: cumAvg,
      janPrice: visibleJanPrice
    };
  }
  
  window.updatePlot = function() {
    var startYear = parseInt(document.getElementById('startYear').value);
    var endYear = parseInt(document.getElementById('endYear').value);
    
    if (startYear >= endYear) {
      alert('Start year must be less than end year');
      return;
    }
    
    var data = calculateCumulativeAvg(startYear, endYear);
    
    if (data.years.length === 0) {
      alert('No data available for this range');
      return;
    }
    
    var zeros = Array(data.years.length).fill(0);
    
    var trace1 = {
      x: data.years,
      y: data.pctChange,
      mode: 'lines+markers',
      name: '% Return',
      line: {color: 'green', width: 2},
      marker: {size: 3},
      hovertemplate: 'Year: %{x}<br>%{y:.1f}%<extra></extra>'
    };
    
    var trace2 = {
      x: data.years,
      y: data.cumAvg,
      mode: 'lines',
      name: 'Cumulative Average Return',
      line: {color: 'blue', width: 3, dash: 'dash'},
      hovertemplate: 'Year: %{x}<br>%{y:.1f}%<extra></extra>'
    };
    
    var trace3 = {
      x: data.years,
      y: zeros,
      mode: 'lines',
      name: 'Zero Line',
      line: {color: 'gray', width: 1, dash: 'dash'},
      showlegend: false,
      hoverinfo: 'skip'
    };
    
    var layout = {
      title: 'Annual % Return and Cumulative Average Return (' + startYear + '-' + endYear + ')',
      xaxis: {title: 'Year'},
      yaxis: {
        title: 'Return, %',
        tickformat: '.1f'
      },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      margin: {l: 60, r: 60, t: 80, b: 60},
      legend: {orientation: 'h', x: 0.5, xanchor: 'center', y: -0.2}
    };
    
    Plotly.newPlot(el, [trace1, trace2, trace3], layout);
  };
  
  // Initial plot with default range
  updatePlot();
}
