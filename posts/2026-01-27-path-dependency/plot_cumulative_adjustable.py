import plotly.graph_objects as go
import pandas as pd
import numpy as np
from plotly_autoscale_js import get_autoscale_js


# Shiller's monthly data:
df = pd.read_csv("C:/Users/afulara/OneDrive - Microsoft/Data/shillers_data/monthly_dt_min.csv")

##############################
##
# cumulative average
##
##############################

# Create a new dataframe for cumulative averages
df_cumul = df[['year', 'jan_price']].drop_duplicates(subset=['year'])
# reset the index for clean plotting (row numbering)
df_cumul = df_cumul.reset_index(drop=True)


df_cumul['pct_change'] = df_cumul['jan_price'].pct_change() * 100 # calculate % change of jan index
df_cumul['cum_avg_pct_change'] = df_cumul['pct_change'].expanding().mean() # calculate cumulative average for the full data

# Create a new figure for cumulative averages
fig_cumul = go.Figure()

# Add percent change trace
fig_cumul.add_trace(
    go.Scatter(
        x=df_cumul['year'],
        y=df_cumul['pct_change'],
        mode='lines+markers',
        name='% Change',
        line=dict(color='orange', width=2)
    )
)

# Add cumulative average percent change trace
fig_cumul.add_trace(
    go.Scatter(
        x=df_cumul['year'],
        y=df_cumul['cum_avg_pct_change'],
        mode='lines',
        name='Cumulative Avg % Change',
        line=dict(color='blue', width=2, dash='dot')
    )
)

fig_cumul.update_layout(
    title="Yearly % Change and Cumulative Avg % Change of January Price",
    xaxis=dict(title="Year"),
    yaxis=dict(title="Percent Change"),
    plot_bgcolor="white",
    paper_bgcolor="white",
    margin=dict(l=60, r=60, t=60, b=60)
)

# Show the plot (or save as HTML)
#fig_cumul.show()
df_cumul.to_csv("cumulative_avg_data.csv", index=False)
fig_cumul.write_html("cumulative_avg_plot.html")

def plot_cumulative_avg_interactive(df_cumul):
    """Create an interactive plot with manual range selection and lazy calculation"""
    # Use the full dataframe
    df_window = df_cumul[['year', 'jan_price']].reset_index(drop=True)
    # Calculate percent change for full range - fix the FutureWarning
    df_window['pct_change'] = df_window['jan_price'].pct_change(fill_method=None) * 100
    
    # Convert to JSON-safe format - keep NaN as null for proper handling
    import json
    years_list = df_window['year'].tolist()
    # Replace NaN with None for JSON (will become null in JavaScript)
    pct_change_list = [None if pd.isna(x) else x for x in df_window['pct_change'].tolist()]
    jan_price_list = df_window['jan_price'].tolist()
    
    # Default range: 1880-1910
    default_start = 1880
    default_end = 1910
    
    # Custom HTML with range selector UI
    custom_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 20px;
            }}
            .controls {{
                margin-bottom: 20px;
                padding: 15px;
                background-color: #f0f0f0;
                border-radius: 5px;
            }}
            .controls input {{
                padding: 5px;
                margin: 0 10px;
                width: 80px;
            }}
            .controls button {{
                padding: 5px 15px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            }}
            .controls button:hover {{
                background-color: #45a049;
            }}
        </style>
    </head>
    <body>
        <div class="controls">
            <label>Start Year: <input type="number" id="startYear" value="{default_start}" min="1871" max="2024"></label>
            <label>End Year: <input type="number" id="endYear" value="{default_end}" min="1871" max="2024"></label>
            <button onclick="updatePlot()">Update Plot</button>
        </div>
        <div id="cumul-plot"></div>
        
        <script>
        var fullData = {{
            years: {json.dumps(years_list)},
            pctChange: {json.dumps(pct_change_list)},
            janPrice: {json.dumps(jan_price_list)}
        }};
        
        console.log('Data loaded:', fullData.years.length, 'years');
        console.log('First 5 pct changes:', fullData.pctChange.slice(0, 5));
        console.log('First 5 jan prices:', fullData.janPrice.slice(0, 5));
        
        function calculateCumulativeAvg(startYear, endYear) {{
            console.log('Calculating for range:', startYear, '-', endYear);
            
            var startIdx = fullData.years.findIndex(y => y >= startYear);
            var endIdx = fullData.years.findIndex(y => y > endYear);
            
            if (startIdx === -1) startIdx = 0;
            if (endIdx === -1) endIdx = fullData.years.length;
            
            console.log('Index range:', startIdx, '-', endIdx);
            
            var visibleYears = fullData.years.slice(startIdx, endIdx);
            var visiblePctChange = fullData.pctChange.slice(startIdx, endIdx);
            var visibleJanPrice = fullData.janPrice.slice(startIdx, endIdx);
            
            // Calculate cumulative average for visible range
            // Skip null/NaN values but keep track of positions
            var cumAvg = [];
            var sum = 0;
            var count = 0;
            
            for (var i = 0; i < visiblePctChange.length; i++) {{
                var val = visiblePctChange[i];
                
                // If value is null or NaN, push null to cumAvg
                if (val === null || val === undefined || isNaN(val)) {{
                    cumAvg.push(null);
                }} else {{
                    // Valid number - add to running sum
                    sum += val;
                    count++;
                    cumAvg.push(sum / count);
                }}
            }}
            
            console.log('First 5 cumulative avgs:', cumAvg.slice(0, 5));
            console.log('Last cumulative avg:', cumAvg[cumAvg.length - 1]);
            console.log('Sum:', sum.toFixed(2), 'Count:', count);
            
            return {{
                years: visibleYears,
                pctChange: visiblePctChange,
                cumAvg: cumAvg,
                janPrice: visibleJanPrice
            }};
        }}
        
        function updatePlot() {{
            var startYear = parseInt(document.getElementById('startYear').value);
            var endYear = parseInt(document.getElementById('endYear').value);
            
            console.log('Update plot called:', startYear, '-', endYear);
            
            if (startYear >= endYear) {{
                alert('Start year must be less than end year');
                return;
            }}
            
            var data = calculateCumulativeAvg(startYear, endYear);
            
            if (data.years.length === 0) {{
                alert('No data available for this range');
                return;
            }}
            
            var zeros = Array(data.years.length).fill(0);
            
            var trace1 = {{
                x: data.years,
                y: data.pctChange,
                mode: 'lines+markers',
                name: '% Change',
                line: {{color: 'orange', width: 2}},
                marker: {{size: 4}},
                yaxis: 'y'
            }};
            
            var trace2 = {{
                x: data.years,
                y: data.cumAvg,
                mode: 'lines',
                name: 'Cumulative Avg % Change',
                line: {{color: 'blue', width: 2, dash: 'dot'}},
                yaxis: 'y'
            }};
            
            var trace3 = {{
                x: data.years,
                y: zeros,
                mode: 'lines',
                name: 'Gain vs Loss',
                line: {{color: 'red', width: 2, dash: 'dot'}},
                yaxis: 'y'
            }};
            
            var trace4 = {{
                x: data.years,
                y: data.janPrice,
                mode: 'lines',
                name: 'January Price',
                line: {{color: 'purple', width: 2}},
                yaxis: 'y2'
            }};
            
            var layout = {{
                title: 'Yearly % Change and Cumulative Avg (' + startYear + '-' + endYear + ')',
                xaxis: {{title: 'Year', type: 'linear'}},
                yaxis: {{
                    title: 'Percent Change',
                    titlefont: {{color: 'black'}},
                    tickfont: {{color: 'black'}}
                }},
                yaxis2: {{
                    title: 'January Price',
                    titlefont: {{color: 'purple'}},
                    tickfont: {{color: 'purple'}},
                    overlaying: 'y',
                    side: 'right'
                }},
                plot_bgcolor: 'white',
                paper_bgcolor: 'white',
                margin: {{l: 60, r: 60, t: 80, b: 60}}
            }};
            
            console.log('Creating plot...');
            Plotly.newPlot('cumul-plot', [trace1, trace2, trace3, trace4], layout);
            console.log('Plot created');
        }}
        
        // Initial plot with default range when page loads
        window.onload = function() {{
            console.log('Page loaded, creating initial plot');
            updatePlot();
        }};
        </script>
    </body>
    </html>
    """
    
    # Write custom HTML
    with open("cumulative_avg_interactive.html", "w", encoding="utf-8") as f:
        f.write(custom_html)
    
    print("HTML file created: cumulative_avg_interactive.html")
    
    # Also print some debug info
    print("\nDebug info:")
    print(f"First 5 years: {years_list[:5]}")
    print(f"First 5 pct changes: {pct_change_list[:5]}")
    print(f"First 5 jan prices: {jan_price_list[:5]}")
    
    # Calculate what the cumulative average should be for 1880-1910 range
    mask = (df_window['year'] >= 1880) & (df_window['year'] <= 1910)
    test_data = df_window[mask]['pct_change'].dropna()
    test_cumavg = test_data.expanding().mean()
    print(f"\nExpected cumulative avg for 1880-1910:")
    print(f"First value: {test_cumavg.iloc[0] if len(test_cumavg) > 0 else 'N/A'}")
    print(f"Last value: {test_cumavg.iloc[-1] if len(test_cumavg) > 0 else 'N/A'}")
    print(f"Number of valid values: {len(test_data)}")
    
    return None

# Replace the static call with the interactive version
plot_cumulative_avg_interactive(df_cumul)