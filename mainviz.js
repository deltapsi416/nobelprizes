
// set the margins of the main visualization area
const margin = {
    top     : 40,
    right   : 10,
    bottom  : 10,
    left    : 100
};  

// sizes of the main svg
var mainsvg = {
    height       : 450,
    width        : document.getElementById("mainviz").offsetWidth - 5, // set width to div container width.
    boxwidth     : 10,
    boxheight    : 10,
    boxwidthRatio : 0.9
    //circleradius : window.innerWidth > 1600 ? 10 : (window.innerWidth - margin.left - margin.right) / 119 * .8 / 2
};

console.log(mainsvg.boxwidth);

// create the SVG
var svg = d3.select("#mainviz")
        .append("svg")
            .attr("id", "boxsvg")
            .attr("width", mainsvg.width)
            .attr("height", mainsvg.height);


/* Code to enable dynamic changing of SVG width based on window size. Disabled for now, maybe future feature? 
function redraw() {
    svg.attr("width", window.innerWidth*.90);
    console.log("Window resize to" + window.innerWidth)

}
//window.onresize = redraw;
//console.log("Initial window width" + window.innerWidth);
*/

// define the colors, category has to match the data header. 
var boxColors = {
    gender: {
        male: "steelblue",
        female: "salmon",
        org: "limegreen"    
    },

    category: {
        physics: "steelblue",
        chemistry: "salmon",
        medicine: "gold",
        peace: "red",
        literature: "fuchsia",
        economics: "limegreen"
    },

    prizeShare: {
        "1/1": "#FF33CC",
        "1/2": "#AA22CC",
        "1/3": "#5511CC",
        "1/4": "#0000CC"
    },

    timesPrizeWon: {
        "3": "gold",
        "2": "silver",
        "1": "#cd7f32"
    },

    ageBin: { // color blind friendly blend
        "<=40"  : "#FFCC00",
        "41-50" : "#D6A314",
        "51-60" : "#AD7A29", 
        "61-70" : "#85523D",
        "71-80" : "#5C2952",    
        ">80"   : "#330066"
    },

    yearsSincePublishedBin: {
        "<=10"  : "#33FF00",
        "11-20" : "#59BF00",
        "21-30" : "#808000", 
        "31-40" : "#A64000",
        ">40"   : "#CC0000",
        "Unknown" : "silver",
    },

    ageCurrentBin: {  // color blind friendly blend
        "<=30"  : "#FFCC00",
        "31-40" : "#DDAA11",
        "41-50" : "#BB8822",
        "51-60" : "#996633", 
        "61-70" : "#774444",
        "71-80" : "#552255",    
        ">80"   : "#330066",
        "Deceased": "silver"
    }
}

// define a custom margin.left for different y axis choices
var customLeftMargin = {
    category: 100,
    prizeShare: 50,
    timesPrizeWon: 50,

    name: 500,
    countryClean: 150,
    yearsSincePublishedBin: 100,

    gender: 100,
    ageBin: 100,
    bornCountryBin: 150,
    bornCountryClean: 200,

    nil: 0
}


// declare global variable - needed for year slider bar.
var yearsChanged;
var filterCurrentCountry;

// global variable for zoomed in or not
var zoomedIn = false;
var zoomedInObjectID;

d3.csv('data_v2.csv').then(function(data) {

    const data_original = data;

    // resize the SVG height
    function resizeSvg(newheight) {
        mainsvg.height = newheight;
        //console.log(`Newheight = ${newheight}`)
        svg.transition().duration(1000).attr("height", mainsvg.height);
    };

    // sort the data by year
    //var data = data.sort((a, b) => a.year - b.year);

    // define the different scales in use
    //----------------------------------------------------
    var newAxisHeights, newTotalHeight, newYLabels;
    function defineYScale(yAxisName) { //  5/10/2020 new dynamic sized y scales

        newAxisHeights = {}           // the maximum of entries in a year (i.e. max vertica height) for each new category. [no. of boxes]
        newTotalHeight = 0;           // the maximum (top to bottom) of all entries [no. of boxes.]
        //numActualYCategories = 0;

        // determine the new Y Labels
        newYLabels = d3.map(data, d => d[yAxisName]).keys();  // == the new y Axis domain

            // manual override for some y axis
            // .filter(x => ...) excludes  y labels that do not exist in subset of data being shown
            // yAxis that do not need sorting: Gender, Prize Category, 
            switch (yAxisName) {
                case "prizeShare": 
                    newYLabels = ["1/1", "1/2", "1/3", "1/4"].filter(x => newYLabels.includes(x));
                    break;
                case "ageBin":
                    newYLabels = ["<=40", "41-50", "51-60", "61-70", "71-80", ">80"].filter(x => newYLabels.includes(x));
                    break;
                case "bornCountryBin":
                    newYLabels = ["USA", "UK", "Germany", "France", "Sweden", "Poland", 
                                    "Japan", "Russia", "Canada", "Other (<20 Laureates)"].filter(x => newYLabels.includes(x));
                    break;
                case "bornCountryClean":
                case "name": // name of institution
                case "countryClean":  // country of institution 
                    // sorted by number of nobel prizes in each band
                    newYLabels.sort((a,b) => {
                        return data.filter(d => d[yAxisName] == b).length - data.filter(d => d[yAxisName] == a).length
                    });
                    break;
                case "yearsSincePublishedBin":
                    newYLabels = ["<=10", "11-20", "21-30", "31-40", ">40", "Unknown"].filter(x => newYLabels.includes(x));
                    break;
            }

        // console.log(data.filter(d => d.bornCountryClean == "USA").length);


        // calculate the height of each yLabel [no of boxes] & the total height of viz [no of boxes]
        for (index in newYLabels) {
            numberEntriesByYear = d3.nest()
                                    .key(d => d.year)
                                    .rollup(v => v.length)
                                    .entries(data.filter(d => d[yAxisName] == newYLabels[index]));

            //console.log(`no entries by year: ${numberEntriesByYear}`);

            if (numberEntriesByYear != "") {       
                newAxisHeights[newYLabels[index]] = d3.max(numberEntriesByYear, d => d.value)
                newTotalHeight += newAxisHeights[newYLabels[index]];
                //numActualYCategories++;
            }
        }

        // calculate new SVG height and change it
        newSvgHeight = margin.top + margin.bottom + newTotalHeight*(mainsvg.boxheight*1.5) + newYLabels.length*(mainsvg.boxheight*0.5); 
        // console.log(`New Y Labels: ${newYLabels}`);
        // console.log(`Total new height: ${newTotalHeight}`);
        resizeSvg(newSvgHeight);

        // define new scales
        var yScaleObject = {};

        var currentStart = margin.top;
        for (index in newYLabels) {
            if (newAxisHeights[newYLabels[index]] > 0) {
                currentEnd = currentStart + newAxisHeights[newYLabels[index]]*(mainsvg.boxheight*1.5) + mainsvg.boxheight*0.5;
                yScaleObject[newYLabels[index]] = d3.scaleBand()
                                                    .domain([newYLabels[index]])   // single category only
                                                    .range([currentStart, currentEnd]);

                currentStart = currentEnd;
            }
        }

        return yScaleObject;
    }

    // helper function, convert the order # to a y coordinate
    function yPos(order) {
        return order * mainsvg.boxheight*1.5 + mainsvg.boxheight*0.5
    };

    // set default y axis
    var yAxisName = "category"
    var yearRange = [1901, 2019];

    // set global yScale, default = category
    var yScale = defineYScale("category");

    // define the x Scale (year only)
    //----------------------------------------------------
    var xScale;    

    function yearsBetween() {
        let yrs = [];
        for (i=yearRange[0]; i<= yearRange[1]; i++) {yrs.push(i);}
        return yrs;
    }

    function updateXScale () {
        xScale = d3.scaleBand()
            .domain(yearsBetween())
            .range([margin.left, mainsvg.width - margin.right]);
    }

    updateXScale();
    mainsvg.boxwidth = xScale.bandwidth() * mainsvg.boxwidthRatio;

    // Tracker for current color legend
    var currentColorLegend = "gender"; 

    // Plot the X Axis & year hover boxes.
    //--------------------------------------------------
    plotxaxis();
    function plotxaxis() {
        svg.selectAll("#xaxis").remove();
        //svg.selectAll("#verticallines").remove();

        // create new axisTop() object
        var xAxis = d3.axisTop()
                    .scale(xScale)
                    .tickSize(0);
                    //.tickFormat(d3.format("d"));

        // append it to the SVG
        svg.append("g")
            .attr("class", "axis")
            .attr("id", "xaxis")
            .attr("transform", "translate(0, " + (margin.top) + ")")
            .call(xAxis)
                .selectAll("text")
                .attr("dy", "0.5em")
                .attr("dx", "0.5em")
                .attr("transform", "rotate(270)")
                .style("text-anchor", "start");

        // draw line on the right
        // d3.select("#xaxis").append("line")  
        //         .attr("x1", mainsvg.width - margin.right)
        //         .attr("y1", margin.top)
        //         .attr("x2", mainsvg.width - margin.right)
        //         .attr("y2", mainsvg.height - margin.bottom)
        //         .attr("stroke-width", 1)
        //         .attr("stroke", "darkgrey");

        // plot vertical gridlines
        /*
        svg.append("g")
            .attr("class", "grid")
            .attr("id", "verticallines")
            .selectAll("line")
            .data(xScale.domain())
            .join("line")
                .attr("x1", d => xScale(d))
                .attr("y1", margin.top)
                .attr("x2", d => xScale(d))
                .attr("y2", height-margin.bottom)
                .attr("stroke-width", 1)
                .attr("stroke", "darkgrey")
                .attr("stroke-dasharray", "2,2"); */
    };

    // Plot the transparent hover boxes to display year in the banner
    plotYearHoverBoxes();
    function plotYearHoverBoxes() {
        //svg.selectAll("#vertiacalHoverBoxes").remove();

        svg.append("g")
            .attr("id", "vertiacalHoverBoxes")
            .selectAll("rect")
            .data(xScale.domain()) 
            .join("rect")
                .attr("id", d => `hoverBoxYear${d}`)
                .attr("x", d => xScale(d))
                .attr("y", margin.top)
                .attr("width", xScale.bandwidth())
                .attr("height", mainsvg.height - margin.top)
                .attr("fill-opacity", 0)
                .attr("fill", "lavender")
                .on("mouseover", handleMouseOverYearHoverBoxes)
                .on("mouseout", handleMouseOutYearHoverBoxes)
                .on("click", d => {
                    currentDisplayedDetail = 0;
                    d3.select("#laureateDetails").style("display", "none");
                    d3.select("#laureates").selectAll("rect").attr("fill-opacity", 1);
                    zoomedIn = false;
                });
    };

    function handleMouseOverYearHoverBoxes(d) {
        d3.select("#displayYearSpanDiv").style("opacity", "100")
        d3.select("#displayYearSpan").html(d);
        d3.select(`#hoverBoxYear${d}`).attr("fill-opacity", 0.6);
    }

    function handleMouseOutYearHoverBoxes(d) {
        d3.select("#displayYearSpanDiv").style("opacity", "0")
        d3.select(`#hoverBoxYear${d}`).attr("fill-opacity", 0);
    }

    // Plot the Y Axis & horizontal grid lines
    //--------------------------------------------------
    plotyaxis();
    function plotyaxis(){
 
        // remove existing yaxis and horizontal lines
        svg.selectAll("#yaxis").remove();
        svg.selectAll("#horizontallines").remove();

        // plot y axis
        for (categoryName in yScale) {
            //console.log(categoryName);

            // console.log(`Y Axis Name: ${yAxisName}`)
            // console.log(`Category Name: ${categoryName}`)
            // console.log("New Axis Height: "+newAxisHeights[categoryName]);
            // console.log(data);

            if (newAxisHeights[categoryName] > 0) {
                // create the y axis
                var yax = d3.axisLeft()
                            .scale(yScale[categoryName])
                            .tickSize(0);
                            
                // plot the y axis
                svg.append("g")
                    .transition(1000)
                        .attr("id", "yaxis")
                        .attr("transform", `translate(${margin.left}, 0)`)
                        .call(yax)
                            .style("font-size", "13")
                            //.style("color", "slateblue")
                            .style("font-weight", "bold");


                // plot the horizontal lines
                svg.append("g")
                    .attr("id", "horizontallines")
                    .selectAll("line")
                    .data(yScale[categoryName].domain())
                    .join("line")
                        .attr("y1", d => yScale[d](d))
                        .attr("x1", margin.left)
                        .attr("y2", d =>  yScale[d](d))
                        .attr("x2", mainsvg.width - margin.right)
                        .attr("stroke-width", 1)
                        .attr("stroke", "darkgrey");
                        //.attr("stroke-dasharray", "2,2");
            }

            // plot the last horizontal line
            d3.select("#horizontallines").append("line")                   
                .attr("y1", mainsvg.height - margin.bottom)
                .attr("x1", margin.left)
                .attr("y2", mainsvg.height - margin.bottom)
                .attr("x2", mainsvg.width - margin.right)
                .attr("stroke-width", 1)
                .attr("stroke", "darkgrey");
        }

        // svg.selectAll("#yaxis").remove();
        // svg.selectAll("#horizontallines").remove();
        
        // // plot simple axis
        // if (yAxisName == "gender") {  // special treatment for gender because of the large number of male recipients. 

        //     var intersect = margin.top + (mainsvg.height - margin.top - margin.bottom) / 5 * 3;
            
        //     // plot the male axis.  
        //     var yAxisMale = d3.axisLeft()
        //                    .scale(yScaleGenderMale)
        //                    .tickSize(0);

        //     svg.append("g")
        //         .transition(1000)
        //             .attr("class", "axis")
        //             .attr("id", "yaxis")
        //             .attr("transform", "translate(" + margin.left + ",0)")
        //             .call(yAxisMale); 

        //     // plot the female & others axis.
        //     var yAxisOther = d3.axisLeft()
        //                    .scale(yScaleGenderOther)
        //                    .tickSize(0);

        //     svg.append("g")
        //         .transition(1000)
        //             .attr("class", "axis")
        //             .attr("id", "yaxis")
        //             .attr("transform", "translate(" + margin.left + ", 0)") //" + intersect + ")")
        //             .call(yAxisOther);

        //     // plot the horizontal lines
        //     svg.append("g")
        //         .attr("class", "grid")
        //         .attr("id", "horizontallines")
        //         .selectAll("line")
        //         .data(yScaleGenderOther.domain())
        //         .join("line")
        //             .attr("y1", d => yScaleGenderOther(d))
        //             .attr("x1", margin.left)
        //             .attr("y2", d => yScaleGenderOther(d))
        //             .attr("x2", mainsvg.width - margin.right)
        //             .attr("stroke-width", 1)
        //             .attr("stroke", "darkgrey");
        //             //.attr("stroke-dasharray", "2,2");
        // } else {
        //     // create the yAxis object
        //     var yAxis = d3.axisLeft()
        //         .scale(yScale)
        //         .tickSize(0);

        //     // append yAxis to SVG
        //     svg.append("g")
        //         .transition(1000)
        //             .attr("class", "axis")
        //             .attr("id", "yaxis")
        //             .attr("transform", "translate(" + margin.left + ",0)")
        //             .call(yAxis);

        //     // plot the horizontal lines
        //     svg.append("g")
        //         .attr("class", "grid")
        //         .attr("id", "horizontallines")
        //         .selectAll("line")
        //         .data(yScale.domain())
        //         .join("line")
        //             .attr("y1", d => yScale(d))
        //             .attr("x1", margin.left)
        //             .attr("y2", d => yScale(d))
        //             .attr("x2", mainsvg.width - margin.right)
        //             .attr("stroke-width", 1)
        //             .attr("stroke", "darkgrey");
        //             //.attr("stroke-dasharray", "2,2");
        // }
    };
   
    // Define the div for the tooltip
    //--------------------------------------------------
    var tooltip = d3.select("body")
                    .append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0.5)
                        .style("background-color", "lightgray");

    // plot individual rectangles for each nobel laureatte
    //-----------------------------------------------------------
    var currentDisplayedDetail = 0; // what is this for? 

    plotLauraeteBoxes();
    function plotLauraeteBoxes() {
        d3.select("#laureates").remove();
        
        svg.append("g")
            .attr("id", "laureates")
            .selectAll("rect")
            .data(data)
                .join("rect")
                    .attr("id", d => `LaureateBoxID${d.id}`)
                    .attr("x", d => xScale(d.year) + xScale.bandwidth()*.1)
                    .attr("y", d => {
                                        dataslice = data.filter(d2 => (d2.year==d.year && d2.category==d.category));
                                        pos = dataslice.map(e => e.id).indexOf(d.id);
                                        return yScale[d.category](d.category) + 15*pos + 5;
                                    })
                    .attr("width", mainsvg.boxwidth)
                    .attr("height", mainsvg.boxheight)
                    //.style("stroke", "black").style("stroke-width", "0.5px")
                    .on("mouseover", handleMouseOverLaureateBox)
                    .on("mouseout", handleMouseOutLaureateBox)
                    .on("click", function(d) { 
                        handleMouseClick(d);
                        //d3.select(this).attr("fill-opacity", 1);  /* ????? TO DO - IMPLEMENT PERSIST SELECTED BOX = COLORED */
                    });
    }

    // fucntion to update colors of all the boxes
    function updateLegendAndColors() {
        svg.select("#laureates")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .transition()
                .duration(500)
                .attr("fill", d => boxColors[currentColorLegend][d[currentColorLegend]]);

        // reset legend
        var colorLegend = d3.select("#colorLegend");
        colorLegend.html("");
        
        for (category in boxColors[currentColorLegend])
        {
            colorLegend.append("div")
                .attr("class", "colorLegendBox")
                .attr("id", currentColorLegend + boxColors[currentColorLegend][category].slice(1) + "box")
                .style("background-color", boxColors[currentColorLegend][category])
                .style("border", "1px solid black");
    
            colorLegend.append("span")
                .attr("class", "colorLegendText")
                .attr("id", currentColorLegend+boxColors[currentColorLegend][category].slice(1) +"text")
                .text(`\u00A0${category} \u00A0\u00A0\u00A0`);
        }
    }
    updateLegendAndColors(); 

    // display details pane
    // ----------------------------------
    function handleMouseClick(d) {
        if (currentDisplayedDetail != `${d.id}${d.year}`) {
            currentDisplayedDetail = `${d.id}${d.year}`;
            updateLaureateDetails(d);

            // fade the remaining laureates
            d3.select("#laureates")
                .selectAll("rect")
                .attr("fill-opacity", 0.3);

            // ensure current laurate is filled
            //d3.select(this).attr("fill-opacity", 1);

            zoomedInObjectID = `#LaureateBoxID${d.id}`
            zoomedIn = true;

            d3.select(zoomedInObjectID).attr("fill-opacity", 1);

        } else {
            currentDisplayedDetail = 0;
            d3.select("#laureateDetails").style("display", "none");

            d3.select("#laureates").selectAll("rect").attr("fill-opacity", 1);

            zoomedIn = false;
        }
    }

    // populate details pane with Laureates' details
    // ----------------------------------
    function updateLaureateDetails(d) {
        // un-hide the div block
        d3.select("#laureateDetails").style("display", "block");

        // show the picture
        d3.select("#laureatePicture").attr("src", d.URLpicture);

        // populate with laureate's details.
        d3.select("#laureateName").text(`${d.firstname} ${d.surname}`);
        d3.select("#laureateAward").html(function() {
            if (d.category=="medicine") {
                return `The Nobel Prize in Physiology or Medicine ${d.year}`;
            } else if (d.category=="economics") {
                return `The Sveriges Riksbank Prize in Economic Sciences in Memory of Alfred Nobel ${d.year}`;
            } else if (d.category=="peace") {
                return `The Nobel Peace Prize ${d.year}`;
            } else {
                return `The Nobel Prize in ${d.category[0].toUpperCase()}${d.category.slice(1)} ${d.year}`;
            }
        });
        
        d3.select("#laureateMotivation").text(`${d.motivation[1].toUpperCase()}${d.motivation.slice(2,-1)}.`);
        d3.select("#laureatePrizeShare").html(`Prize share: ${d.prizeShare}<br>`);
        d3.select("#laureateInstitution").html(d.name ? `Academic Institution: ${d.name}, ${d.city}, ${d.country} <br>` : "");
        d3.select("#laureateWorkPublished").html(d.workPublishYear ? `Work published in ${d.workPublishYear} (${d.year - d.workPublishYear} years before receiving Nobel Prize) <br>`: "");        

        d3.select("#laureateGender").html( d.gender != "org" ? `Gender: ${d.gender[0].toUpperCase()}${d.gender.slice(1)} <br>` : "");
        d3.select("#laureateBorn").html(function() {
            if (d.gender == "org") {
                return `Founded in ${d.bornYear} <br>`;
            } else {
                return `Born: ${d.bornDay} ${d.bornMonth} ${d.bornYear} in 
                        ${d.bornCity}, ${d.bornCountry}     
                        ${d.ageCurrent != "" ? "(Age: "+ d.ageCurrent + ")" : ""} <br>`;
            }
            
        });
        d3.select("#laureateDeath").html(d.diedYear ? `Died: ${d.diedDay} ${d.diedMonth} ${d.diedYear} in ${d.diedCity}, ${d.diedCountry} (age ${d.diedYear - d.bornYear}) <br>` : "" );
        d3.select("#laureateAge").text(d.age);

        d3.select("#laureateOtherPrizes").html(d.timesPrizeWon > 1 ? `Other Nobel Prizes Won: ${d.timesPrizeWonOther} <br>` : "")
                
        d3.select("#laureateWebsiteLink").attr("href", d.URLpage);
        d3.select("#laureateWebsite").text(d.URLpage);
    }

    // tooltip function
    // ----------------------------------
    // display tooltop on mouseover
    function handleMouseOverLaureateBox(d) {

        console.log("mouseover triggered")
        handleMouseOverYearHoverBoxes(d.year);
          
        // bold color legend text, turn rest into gray text
        d3.selectAll(".colorLegendText").style("color", "gray");

        d3.select(`#${currentColorLegend}${boxColors[currentColorLegend][d[currentColorLegend]].slice(1)}text`)
                .style("font-weight", "bold")
                .style("color", "black");
        
        // highlight color legend box
        d3.selectAll(".colorLegendBox").style("opacity", 0.3);

        d3.select(`#${currentColorLegend}${boxColors[currentColorLegend][d[currentColorLegend]].slice(1)}box`)
                .style("opacity", 1)

        // highlight rect 
        d3.select(this).style("stroke", "red");
        d3.select(this).style("stroke-width", "1.5px");

        // tooltip
        tooltip.transition()
            .duration(30)
            .style("opacity", 1)

        tooltip.html(`${d.firstname} ${d.surname} <br>
                      ${d.year} ${d.category[0].toUpperCase()}${d.category.slice(1)} Prize <br>
                      `)
                .style("left", (d3.event.pageX - 50) + "px")
                .style("top", (d3.event.pageY + 20) + "px");

        d3.select(this).attr("class", "info").datum(d).style("cursor", "pointer");
    }

    // remove tooltip on mouseout
    function handleMouseOutLaureateBox(d) {
        handleMouseOutYearHoverBoxes(d.year);

        // unhighlight color
        d3.select(this).style("stroke-width", "0px");

        tooltip.transition()
            .duration(30)
            .style("opacity", 0);

        d3.select(this).attr("class", null)

        // reset legend styles
        d3.selectAll(".colorLegendText")
            .style("font-weight", "")
            .style("color", "black");

        d3.selectAll(".colorLegendBox")
            .style("opacity", 1);

    }

    // Change on color selection
    //--------------------------------------------------
    d3.selectAll("#colorDropDownMenuOption").on("click", function(d){
        currentColorLegend = this.value;         // this.value = chosen color encoding, has to match data header
        d3.select("#colorDropDownMenuHead").html(d3.select(this).text());          // update menu text

        updateLegendAndColors();
    });

    // Change in y axis selection
    //--------------------------------------------------
    d3.selectAll("#yaxisDropDownMenuOption").on("click", function(d){
 
        d3.select("#yaxisDropDownMenuHead").html(d3.select(this).text());    // update menu text

        oldyAxisName = yAxisName; 
        yAxisName = this.value

        if (this.value != "nil") {
            // set the left margin.
            margin.left = customLeftMargin[yAxisName];

             // define new yscale & plot y axis
            yScale = defineYScale(yAxisName);
            plotyaxis();

            // define new x Scale & plot
            updateXScale();
            plotxaxis();

            // update the width of each box
            mainsvg.boxwidth = xScale.bandwidth() * mainsvg.boxwidthRatio;

            // update the height of the year hover boxes
            // svg.select("#vertiacalHoverBoxes")
            //     .selectAll("rect")
            //     .data(xScale.domain()) 
            //     .join("rect")
            //         .attr("height", mainsvg.height - margin.top);
                    // update the position & sizes of the year hover boxes
            svg.select("#vertiacalHoverBoxes")
            .selectAll("rect")
            .data(xScale.domain()) 
            .join("rect")
                //.attr("id", d => `hoverBoxYear${d}`)
                .attr("x", d => xScale(d))
                .attr("y", margin.top)
                .attr("width", xScale.bandwidth())
                .attr("height", mainsvg.height - margin.top);
                //.attr("fill-opacity", 0)
                //.attr("fill", "lavender")
                //.on("mouseover", handleMouseOverYearHoverBoxes)
                //.on("mouseout", handleMouseOutYearHoverBoxes);

            // update the position of the Laureate boxes
            svg.select("#laureates")
                .selectAll("rect")
                .data(data)
                    .join("rect")
                    .transition()
                    .duration(1000)
                    .attr("x", d => xScale(d.year) + xScale.bandwidth()*.1)
                    .attr("y", d => {
                        dataslice = data.filter(e => (e["year"]==d["year"] && e[yAxisName]==d[yAxisName]));
                        pos = dataslice.map(e => e.id).indexOf(d.id);
                        //console.log("POS: "+(yScale[d[yAxisName]](d[yAxisName]) + mainsvg.boxheight*1.5*pos + mainsvg.boxheight*0.5));
                        //console.log(yScale[d[yAxisName]](d[yAxisName]));
                        return yScale[d[yAxisName]](d[yAxisName]) + mainsvg.boxheight*1.5*pos + mainsvg.boxheight*0.5;
                    })
                    .attr("width", mainsvg.boxwidth);

        } else if (this.value == "nil") {
            // remove horizontal lines & y-axis
            svg.selectAll("#horizontallines").remove();
            svg.selectAll("#yaxis").remove();

            // resize the SVG
            resizeSvg(300);

            // set the left margin.
            margin.left = customLeftMargin[yAxisName];

             // define new yscale & plot y axis
            //yScale = defineYScale(yAxisName);
            //plotyaxis();

            // define new x Scale & plot
            //updateXScale();
            //plotxaxis();

            // transition the boxes to their new default position
            var laureates = svg.select("#laureates")
                                .selectAll("rect")
                                .data(data)
                                .join("rect")
                                .transition()
                                    .duration(1000)
                                    //.attr("x", d => xScale(d.year) + xScale.bandwidth()*.1)
                                    .attr("y", d => {
                                        dataslice = data.filter(e => e["year"]==d["year"]);

                                        // return an array of the dataslice keys in the correct order
                                        keysSorted = Object.keys(dataslice).sort((a, b) => { 
                                            return newYLabels.indexOf(dataslice[a][oldyAxisName]) - newYLabels.indexOf(dataslice[b][oldyAxisName])
                                        });

                                        // use indexOf to get the correct position of the data. 
                                        pos = keysSorted.indexOf(Object.keys(dataslice).find(key => dataslice[key].id == d.id));

                                        return margin.top + yPos(pos) //margin.top + 15*pos + 5;
                                    });
        }

    });

    // Change in year range
    //--------------------------------------------------
    yearsChanged = function yearsChanged_(newRange) {
        // update the year Range
        yearRange[0] = Math.min.apply(Math, newRange);
        yearRange[1] = Math.max.apply(Math, newRange);

        // update the x Axis.
        updateXScale();
        plotxaxis();

        // update the width of each box
        mainsvg.boxwidth = xScale.bandwidth() * mainsvg.boxwidthRatio;

        // update the data
        data = data_original.filter(d => (d.year >= yearRange[0] && d.year <= yearRange[1]))


        //plotBoxes(); 
        //updateLegendAndColors(); 

        // update the position & sizes of the year hover boxes
        svg.select("#vertiacalHoverBoxes")
            .selectAll("rect")
            .data(xScale.domain()) 
            .join("rect")
                .attr("id", d => `hoverBoxYear${d}`)
                .attr("x", d => xScale(d))
                .attr("y", margin.top)
                .attr("width", xScale.bandwidth())
                .attr("height", mainsvg.height - margin.top)
                .attr("fill-opacity", 0)
                .attr("fill", "lavender")
                .on("mouseover", handleMouseOverYearHoverBoxes)
                .on("mouseout", handleMouseOutYearHoverBoxes)
                .on("click", d => {
                    currentDisplayedDetail = 0;
                    d3.select("#laureateDetails").style("display", "none");
                    d3.select("#laureates").selectAll("rect").attr("fill-opacity", 1);
                    zoomedIn = false;
                });

        svg.select("#laureates").selectAll("rect").remove();
        
        // update the laureate boxes.
        svg.select("#laureates")
                .selectAll("rect")
                .data(data)
                .join("rect")
                    .attr("id", d => `LaureateBoxID${d.id}`)   
                    .attr("x", d => xScale(d.year) + xScale.bandwidth()*.1)
                    .attr("y", d => {
                        dataslice = data.filter(e => (e["year"]==d["year"] && e[yAxisName]==d[yAxisName]));
                        pos = dataslice.map(e => e.id).indexOf(d.id);
                        return yScale[d[yAxisName]](d[yAxisName]) + 15*pos+5;
                    })
                    .attr("width", mainsvg.boxwidth)
                    .attr("height", mainsvg.boxheight)
                    .attr("fill", d => boxColors[currentColorLegend][d[currentColorLegend]])
                    .on("mouseover", handleMouseOverLaureateBox)
                    .on("mouseout", handleMouseOutLaureateBox)
                    .on("click", function(d) { 
                        handleMouseClick(d);
                        //d3.select(this).attr("fill-opacity", 1);  // ????? TO DO - IMPLEMENT PERSIST SELECTED BOX = COLORED 
                    })
                    .attr("fill-opacity", d => {
                        if (zoomedIn == true) {
                            return `#LaureateBoxID${d.id}` == zoomedInObjectID ? 1: 0.3;
                        } else {
                            return 1;
                        }; 
                    });

        /*
        var u = svg.select("#laureates")
                    .selectAll("rect")
                    .data(data)
                    //.data(data.filter(d => (d.year >= yearRange[0] && d.year <= yearRange[1])));

                // exit
                u.exit().remove();

                // update??
                u.attr("x", d => xScale(d.year) + xScale.bandwidth()*.1)
                    .attr("y", d => {
                                        dataslice = data.filter(e => (e["year"]==d["year"] && e[yAxisName]==d[yAxisName]));
                                        pos = dataslice.map(e => e.id).indexOf(d.id);
                                        return yScale(d[yAxisName]) + 15*pos+5;
                                    })
                    .attr("width", mainsvg.boxwidth)
                    .attr("height", mainsvg.boxheight)
                    .attr("fill", d => boxColors[currentColorLegend][d[currentColorLegend]]);
                
                //u.join("rect")
                u.enter().append("rect")
                    .attr("x", d => xScale(d.year) + xScale.bandwidth()*.1)
                    .attr("y", d => {
                                        dataslice = data.filter(e => (e["year"]==d["year"] && e[yAxisName]==d[yAxisName]));
                                        pos = dataslice.map(e => e.id).indexOf(d.id);
                                        return yScale(d[yAxisName]) + 15*pos+5;
                                    })
                    .attr("width", mainsvg.boxwidth)
                    .attr("height", mainsvg.boxheight)
                    .attr("fill", d => boxColors[currentColorLegend][d[currentColorLegend]])
                    .attr("fill-opacity", d => {   //<== to preserve opacity, currently broken. 
                        return zoomedIn ? 0.3 : 1;
                    })
                    //.attr("fill-opacity", 0.5)
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut)
                    .on("click", function(d) { // display details pane
                        if (currentDisplayedDetail != d.id) {
                            currentDisplayedDetail = d.id;
                            handleMouseClick(d);
                        } else {
                            currentDisplayedDetail = 0;
                            svgDetailPanel.attr("height", 0).attr("width", 0);
                        }});*/


    }; 

    // Dynamically populate the countries dropdown menu
    //--------------------------------------------------
    populateCountriesDropdownMenu();
    function populateCountriesDropdownMenu() {
        countries = d3.map(data, d => d.bornCountryClean).keys()
                        .sort((a, b) => a[0] < b[0] ? -1 : 1);

        //countries = "All Countries" + countries;
        countries.unshift("All Countries");
        //console.log(countries);

        numberEntriesPerCountry = d3.nest()
                                    .key(e => e.bornCountryClean)
                                    .rollup(e => e.length)
                                    .object(data)

        //console.log(numberEntriesPerCountry);

        // programmatically create the menu options
        d3.select("#countrySelectorDivItems")
            .selectAll("button")
            .data(countries)
                .join("button")
                    .attr("class", "dropdown-item btn-sm countrySelection")
                    .attr("type", "button")
                    .attr("id", d => `countrySelectorDivItem${d}`)
                    .attr("value", d => d)
                    .text(d => d + (d == "All Countries" ? "" : ` (${numberEntriesPerCountry[d]} Laureate${numberEntriesPerCountry[d]>1 ? "s" : ""})`))
                    .style  ("border-bottom", d => d=="All Countries" ? "1px solid lightgrey" : "")
                    .on("click", d => {
                        d3.select("#countrySelectorDropDownMenuHead").text(d);
                        filterByCountry(d);
                    });
    }

    // Filter to selected country + change y-axis to display only that country? 
    //--------------------------------------------------
    function filterByCountry(d) {
        filterCurrentCountry = d;

        // amend the data the match current filter
        if (d == "All Countries") {
            data = data_original;
        } else {
            data = data_original.filter(e => e.bornCountryClean == d)
        }

        // update new yscale based on new data        
        yScale = defineYScale(yAxisName);

        // plot the new Y axis
        plotyaxis();

        // update the height of the year hover boxes
        svg.select("#vertiacalHoverBoxes")
            .selectAll("rect")
            .data(xScale.domain()) 
            .join("rect")
                .attr("height", mainsvg.height - margin.top);

        // update the position of the Laureate boxes (create all new ones to ensure they remain on top)
        //d3.select("#laureates").selectAll("rect").remove();

        svg.select("#laureates")
                .selectAll("rect")
                .data(data)
                .join("rect")
                    .attr("id", d => `LaureateBoxID${d.id}`) 
                    .attr("x", d => xScale(d.year) + xScale.bandwidth()*.1)
                    .attr("y", d => {
                        dataslice = data.filter(e => (e["year"]==d["year"] && e[yAxisName]==d[yAxisName]));
                        pos = dataslice.map(e => e.id).indexOf(d.id);
                        return yScale[d[yAxisName]](d[yAxisName]) + mainsvg.boxheight*1.5*pos + mainsvg.boxheight*0.5;
                    })
                    .attr("width", mainsvg.boxwidth)
                    .attr("height", mainsvg.boxheight)
                    .attr("fill", d => boxColors[currentColorLegend][d[currentColorLegend]])
                    .attr("fill-opacity", 0)
                    .on("mouseover", handleMouseOverLaureateBox)
                    .on("mouseout", handleMouseOutLaureateBox)
                    .on("click", function(d) { 
                        handleMouseClick(d);
                        d3.select(this).attr("fill-opacity", 1);  // ????? TO DO - IMPLEMENT PERSIST SELECTED BOX = COLORED 
                    })
                        .transition()
                        .duration(1000)
                        .attr("fill-opacity", d => {
                            if (zoomedIn == true) {
                                return `#LaureateBoxID${d.id}` == zoomedInObjectID ? 1: 0.3;
                            } else {
                                return 1;
                            }
                        }); 
    }

});

//d3.select("#displayYearSpan").html(d => "Update");
//d3.select("body").append("p").text("If this text appears, Javascript executed to completion. Remove line before deployment");

