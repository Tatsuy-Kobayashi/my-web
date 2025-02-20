document.addEventListener('DOMContentLoaded', function() {
    // Data for the two-set Venn diagram
    const twoSetData = [
        { sets: ['Set 1'], size: 3 },
        { sets: ['Set 2'], size: 3 },
        { sets: ['Set 1', 'Set 2'], size: 1 } // Overlap size
    ];

    // Data for the three-set Venn diagram
    const threeSetData = [
        { sets: ['Set 1'], size: 3 },
        { sets: ['Set 2'], size: 3 },
        { sets: ['Set 3'], size: 4 },
        { sets: ['Set 1', 'Set 2'], size: 1 },
        { sets: ['Set 1', 'Set 3'], size: 2 },
        { sets: ['Set 2', 'Set 3'], size: 2 },
        { sets: ['Set 1', 'Set 2', 'Set 3'], size: 1 } // Triple overlap
    ];

    // Render two-set Venn diagram
    d3.select("#venn-diagram").append("h2").text("Two-Set Venn Diagram");
    const twoSetChart = venn.VennDiagram().width(400).height(400);
    d3.select("#venn-diagram").append("div").datum(twoSetData).call(twoSetChart);

    // Render three-set Venn diagram
    d3.select("#venn-diagram").append("h2").text("Three-Set Venn Diagram");
    const threeSetChart = venn.VennDiagram().width(400).height(400);
    d3.select("#venn-diagram").append("div").datum(threeSetData).call(threeSetChart);
});
