//
// Future work:
// - consistent colors between mainviz and sankey (define color matrix)
// - define dynamic SVG height (define svg height matrix)
// - add in other data axis? (might need to wrangle data2.csv)
//


// initialize the sankey data
// --------------------------------------------
var sankeyData = {
  type: "sankey",
  orientation: "h",
  node: {
    pad: 15,
    thickness: 30,
    line: {
      color: "black",
      width: 1
    },
   label: [
           "Work in United Kingdom",//0  KEEP
           "Work in Germany",//1 KEEP
           "Work in USA",//2 KEEP
           "Work in France",//3 KEEP
           "Work in Russia",//4 KEEP
           "Work in Switzerland",//5 KEEP
           "Work in Italy",//6 KEEP
           "Work in Canada",//7 KEEP
           "Work in Sweden",//8 KEEP
           "Work in Japan",//9 KEEP
           "Born in Russia",//10 KEEP
           "Born in Canada",//11 KEEP
           "Born in Switzerland",//12 KEEP
           "Born in Germany",//13 KEEP
           "Born in France",//14 KEEP
           "Born in United Kingdom",//15 KEEP
           "Born in Italy",//16 KEEP
           "Born in Japan",//17 KEEP
           "Born in Poland",//18 KEEP
           "Born in Sweden",//19 KEEP
           "Born in USA",//20 KEEP
           "Born in Other Countries",//21 KEEP
           "Work in Other Countries",//22 KEEP
           ],
   //color: ["blue", "blue", "red", "red", "green", "green", "green"]
      },

  link: {
    source: [10,10,10,10,10,10, //Born in Russia 
             11,11,11,  //Born in Canada
             12,12,12,12,12,  //Born in Switzerland
             13,13,13,13,13,13,13,  //Born in Germany
             14,14,14,14,  //Born in France
             15,15,15,15,15,  //Born in United Kingdom
             16,16,16,16,16,  //Born in Italy
             17,17,17,  //Born in Japan
             18,18,18,18,18,18,  //Born in Poland
             19,19,19,19,  //Born in Sweden
             20,20,20,  //Born in USA
             21,21,21,21,21,21,21,21,21  //Born in other countries
             ],
    target: [4,2,1,0,5,22, //Born in Russia 
             7,2,22,   //Born in Canada
             5,6,3,2,22,  //Born in Switzerland
             1,2,0,3,5,8,22,  //Born in Germany
             3,2,5,22,  //Born in France
             0,2,7,5,22,  //Born in United Kingdom
             6,0,2,5,22,  //Born in Italy
             9,2,22,  //Born in Japan
             1,2,0,3,5,22,  //Born in Poland
             8,2,0,22,  //Born in Sweden
             2,0,22,  //Born in USA
             0,1,2,3,4,5,6,8,22  //Born in other countries
             ],
    value:  [9,4,2,2,1,8, //Born in Russia 
             4,12,3,   //Born in Canada
             12,1,1,1,4,  //Born in Switzerland
             45,11,3,1,3,1,15,  //Born in Germany
             27,6,1,22,  //Born in France
             65,17,2,1,17,  //Born in United Kingdom
             4,2,5,1,7,  //Born in Italy
             18,4,4,  //Born in Japan
             7,6,1,2,1,10,  //Born in Poland
             14,1,1,13,  //Born in Sweden
             241,1,32,  //Born in USA
             17,11,48,7,3,3,1,2,147  //Born in other countries
             ]
  }
}

// save Kristin's emigration data
var emigration = {
  type: "sankey",
  orientation: "h",
  node: {
    pad: 15,
    thickness: 30,
    line: {
      color: "black",
      width: 1
    },
      label: [
      "Work in United Kingdom",//0  KEEP
      "Work in Germany",//1 KEEP
      "Work in USA",//2 KEEP
      "Work in France",//3 KEEP
      "Work in Russia",//4 KEEP
      "Work in Switzerland",//5 KEEP
      "Work in Italy",//6 KEEP
      "Work in Canada",//7 KEEP
      "Work in Sweden",//8 KEEP
      "Work in Japan",//9 KEEP
      "Born in Russia",//10 KEEP
      "Born in Canada",//11 KEEP
      "Born in Switzerland",//12 KEEP
      "Born in Germany",//13 KEEP
      "Born in France",//14 KEEP
      "Born in United Kingdom",//15 KEEP
      "Born in Italy",//16 KEEP
      "Born in Japan",//17 KEEP
      "Born in Poland",//18 KEEP
      "Born in Sweden",//19 KEEP
      "Born in USA",//20 KEEP
      "Born in Other Countries",//21 KEEP
      "Work in Other Countries",//22 KEEP
      ],
  },

    link: {
      source: [10,10,10,10,10,10, //Born in Russia 
               11,11,11,  //Born in Canada
               12,12,12,12,12,  //Born in Switzerland
               13,13,13,13,13,13,13,  //Born in Germany
               14,14,14,14,  //Born in France
               15,15,15,15,15,  //Born in United Kingdom
               16,16,16,16,16,  //Born in Italy
               17,17,17,  //Born in Japan
               18,18,18,18,18,18,  //Born in Poland
               19,19,19,19,  //Born in Sweden
               20,20,20,  //Born in USA
               21,21,21,21,21,21,21,21,21  //Born in other countries
               ],
      target: [4,2,1,0,5,22, //Born in Russia 
               7,2,22,   //Born in Canada
               5,6,3,2,22,  //Born in Switzerland
               1,2,0,3,5,8,22,  //Born in Germany
               3,2,5,22,  //Born in France
               0,2,7,5,22,  //Born in United Kingdom
               6,0,2,5,22,  //Born in Italy
               9,2,22,  //Born in Japan
               1,2,0,3,5,22,  //Born in Poland
               8,2,0,22,  //Born in Sweden
               2,0,22,  //Born in USA
               0,1,2,3,4,5,6,8,22  //Born in other countries
               ],
      value:  [9,4,2,2,1,8, //Born in Russia 
               4,12,3,   //Born in Canada
               12,1,1,1,4,  //Born in Switzerland
               45,11,3,1,3,1,15,  //Born in Germany
               27,6,1,22,  //Born in France
               65,17,2,1,17,  //Born in United Kingdom
               4,2,5,1,7,  //Born in Italy
               18,4,4,  //Born in Japan
               7,6,1,2,1,10,  //Born in Poland
               14,1,1,13,  //Born in Sweden
               241,1,32,  //Born in USA
               17,11,48,7,3,3,1,2,147  //Born in other countries
               ]
    }
}

// define the Sankey layour parameters
// --------------------------------------------
var sankeyLayout = {
  title     : "Flow Diagram",
  width     : document.getElementById("sankeyviz").offsetWidth*0.95,
  height    : 2000,
  font      : {
                size: 12
            }
};

// custom sankey heights based on our data
// --------------------------------------------
var axisHeights = {
  gender: 600,
  category: 600,
  ageBin: 600,
  bornCountryClean: 1000,
  name: 2000,

  prizeShare: 600,
  timesPrizeWon: 600,

  countryClean: 1000,
  bornCountryBin: 600
};



// work on data_raw
// --------------------------------------------
d3.csv('data_v2.csv').then(function(data_raw) {

  // define variables
  // -----------------------------------
  let newLabel, newLink;

  let axis1name = "bornCountryClean";
  let axis2name = "countryClean";  

  processNewAxisInput();
  //plotSankey(axis1name, axis2name);

  // generate new label & link (source / target / value) data
  // -----------------------------------
  function generateSankeyData(axis1name, axis2name)
  {
    // reset data
    newLink = { source: [], target: [], value: [] }

    // define new labels
    newLabel = generateLabels();
    function generateLabels() {
      let axis1Labels = d3.map(data_raw, d => d[axis1name]).keys()
      .sort((a, b) => a[0] < b[0] ? -1 : 1);
  
      let axis2Labels = d3.map(data_raw, d => d[axis2name]).keys()
        .sort((a, b) => a[0] < b[0] ? -1 : 1);
          
      return axis1Labels.concat(axis2Labels);
    }

    // use d3.nest() to nest the data
    let nestedData = d3.nest()
                        .key(d => d[axis1name])
                        .key(d => d[axis2name])
                        .rollup(v => v.length)
                        .object(data_raw);

    // convert nested data to source / target / value format
    for (property1 in nestedData) {
      for (property2 in nestedData[property1]) {
        //console.log(`${[property1]}  ${property2}  ${nestedData[property1][property2]}`)
        newLink.source.push(newLabel.indexOf(property1));
        newLink.target.push(newLabel.indexOf(property2));
        newLink.value.push(nestedData[property1][property2]);
      }
    }
  }
  
  // plot the sankey diagram
  // ----------------------------------- 
  function plotSankey(axis1name, axis2name){
    generateSankeyData(axis1name, axis2name);

    // update sankeyData object
    sankeyData.node.label = newLabel;
    sankeyData.link = newLink;

    if (axis1name == "bornCountryClean" && axis2name == "countryClean") {
      sankeyData = emigration;
    }

    // call Plotly to create the visualization
    Plotly.react('sankeyviz', [sankeyData], sankeyLayout); 
  }

  // process new axis input 
  // ----------------------------------- 
  function processNewAxisInput() {

    // check if both axis the same, hide the div if yes 
    if (axis1name == axis2name) {
      d3.selectAll("#sankeyviz").style("display", "none");
      d3.select("#sankeyErrorMessage").html(`Error: Both axes can't be the same!`);
    } else {

      // reset SVG div container
      d3.selectAll("#sankeyviz").style("display", "");
      d3.select("#sankeyErrorMessage").html("");

      // update sankey plot parameters
      sankeyLayout.height = Math.max(axisHeights[axis1name], axisHeights[axis2name]);
      //sankeyLayout.title = `Flow of ${axis1name} (left) to ${axis2name} (right)`;

      // call the sankey plot
      plotSankey(axis1name, axis2name);
    }

  };

  // change in left axis selector
  // ----------------------------------- 
  d3.selectAll("#sankeyDropDownMenuLeftOption").on("click", function(d){
    d3.select("#sankeyDropDownMenuLeftHead").html(d3.select(this).text());    // update menu text
    axis1name = this.value;

    processNewAxisInput();
  });

  // change in right axis selector
  // ----------------------------------- 
  d3.selectAll("#sankeyDropDownMenuRightOption").on("click", function(d){
    d3.select("#sankeyDropDownMenuRightHead").html(d3.select(this).text());    // update menu text
    axis2name = this.value;

    processNewAxisInput();

  });

});


