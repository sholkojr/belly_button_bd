function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var sampleData = data.samples;
    // console.log(sampleData);
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var sampleResult = sampleData.filter(sampleObj => sampleObj.id == sample);
    // console.log(sampleResult);
    //  5. Create a variable that holds the first sample in the array.
    var firstResult = sampleResult[0];
    // console.log(firstResult);

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_idsArray = firstResult.otu_ids;
    var otu_labelsArray = firstResult.otu_labels;
    var sample_valuesArray = firstResult.sample_values;
    // console.log(sample_valuesArray);
    let completeSamples = []; 
    otu_idsArray.forEach((element, i) => {
      completeSamples.push({
        "otu_ids": element,
        "otu_labels": otu_labelsArray[i],
        "sample_value": sample_valuesArray[i]
      });
    });
    // console.log(completeSamples);

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    sortedSamples = completeSamples.sort((a,b) => b.sample_value - a.sample_value);
    sortedSlicedSamples = sortedSamples.slice(0, 10).reverse();
    // console.log(sortedSlicedSamples);


    var yticks = sortedSlicedSamples.map(object => `OTU ${object.otu_ids} `);
    // console.log(yticks);
    // 8. Create the trace for the bar chart. 
    var barData = sortedSlicedSamples.map(object => object.sample_value);
    // console.log(barData);
  
    // 9. Create the layout for the bar chart. 
    var trace1 = {
      x: barData,
      y: yticks,
      name: "Bacteria",
      type: "bar",
      orientation: "h"      
    };
    // 10. Use Plotly to plot the data with the layout. 
    var barTrace = [trace1];
    var layout = {
      title: `Top Bateria Samples for Individual ${sample}`,
      margin: {
        l: 100,
        r: 100,
        t: 100,
        b: 100
      }
    };

    Plotly.newPlot("bar", barTrace, layout);

    var xticks = sortedSlicedSamples.map(object => object.otu_ids);
    var yvalues = sortedSlicedSamples.map(object => object.sample_value);
    var markerSizes = sortedSlicedSamples.map(object => object.sample_value);
    var markerColors = sortedSlicedSamples.map(object => object.otu_ids);
    var markerLabels = sortedSlicedSamples.map(object => object.otu_labels);

    /* var markerText = [];

    markerLabels.forEach((element, i) => {
      markerText.push(`[${xticks[i]}, ${yvalues[i]}]<br>${element}`)
    }); */

    // console.log(markerText);


    // 1. Create the trace for the bubble chart.
    var bubbleTrace = {
      x: xticks,
      y: yvalues,
      text: markerLabels,
      mode: 'markers',
      marker: {
        color: markerColors,
        size: markerSizes
      }
    };

    var bubbleData = [bubbleTrace];

    // Manually finding the max value of the x-axis
    // Function finds the max value of an array
    function getMax (array) {
      var maxNumber = array[0];
      array.forEach ((number, i) => {
        if (i > 0) {
          if (number > maxNumber) {maxNumber = number};
        };
      });
      return maxNumber
    }
    // Find the object that contains the max value
    maxObjX = sortedSlicedSamples.find(max => max.otu_ids === getMax(xticks));

    // Sets the maximum value of the x-axis based on the max id plus the bubble size
    xMaximum = maxObjX.otu_ids + 2 * maxObjX.sample_value;

    // Do the Same for the Y-axis
    maxObjY = sortedSlicedSamples.find(max => max.sample_value === getMax(yvalues));
    yMaximum = maxObjY.sample_value + 2 * maxObjY.sample_value;


    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: `Bacteria Cultures Per Sample for Individual ${sample}`,
      xaxis: {
        title: 'OTU ID',
        range: [0, xMaximum]
      },
      yaxis: {
        range: [0, yMaximum]
      },
      showlegend: false,
      margin: {
        l: 100, 
        r: 100,
        t: 100,
        b: 100
      }
    };

    // 3. Use Plotly to plot the data with the layout.

    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    // D2: 3. Use Plotly to plot the data with the layout.

    // Pull Wash Frequency Number from Metadata
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    console.log(result.wfreq)
    washFreq = result.wfreq;

    
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      domain: { x: [0, 1], y: [0, 1] },
      value: washFreq,
      title: { text: "Belly Button Washing Frequency".bold()+"<br>Scrubs per Week" },
      type: "indicator",
      mode: "gauge+number",
      gauge: {
        axis: { range: [null, 10] },
        bar: { color: "black" },
        steps: [
          { range: [0, 2], color: "red" },
          { range: [2, 4], color: "orange" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "rgb(154, 205, 50)" },
          { range: [8, 10], color: "green" },
        ]}
    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      //width: 450, 
      //height: 450, 
      margin: { t: 0, b: 0 }
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);

  });
}
