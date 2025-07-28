document.addEventListener('DOMContentLoaded', function() {
    // 集合を定義
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([3, 4, 5]);
    const set3 = new Set([1, 3, 5, 6]);

    // 3集合のデータ
    const threeSetData = [
        { sets: ['Set 1'], size: set1.size },
        { sets: ['Set 2'], size: set2.size },
        { sets: ['Set 3'], size: set3.size },
        { sets: ['Set 1', 'Set 2'], size: [...set1].filter(x=>set2.has(x)).length },
        { sets: ['Set 1', 'Set 3'], size: [...set1].filter(x=>set3.has(x)).length },
        { sets: ['Set 2', 'Set 3'], size: [...set2].filter(x=>set3.has(x)).length },
        { sets: ['Set 1', 'Set 2', 'Set 3'], size: [...set1].filter(x=>set2.has(x) && set3.has(x)).length }
    ];

    // 各領域ごとに要素リストを計算して item.elements に格納
    function computeElements(d) {
        const s = d.sets;
      if (s.length===1) {
        const A=s[0]==='Set 1'?set1:s[0]==='Set 2'?set2:set3;
        const others = new Set();
        if (s[0]!=='Set 1') [...set1].forEach(x=>others.add(x));
        if (s[0]!=='Set 2') [...set2].forEach(x=>others.add(x));
        if (s[0]!=='Set 3') [...set3].forEach(x=>others.add(x));
        return [...A].filter(x=>!others.has(x));
      } else if (s.length===2) {
        const [a,b]=s;
        const A=a==='Set 1'?set1:a==='Set 2'?set2:set3;
        const B=b==='Set 1'?set1:b==='Set 2'?set2:set3;
        const Cset = ['Set 1','Set 2','Set 3'].filter(z=>!s.includes(z))[0];
        const C = Cset==='Set 1'?set1:Cset==='Set 2'?set2:set3;
        return [...A].filter(x=>B.has(x)&&!C.has(x));
      } else {
        return [...set1].filter(x=>set2.has(x)&&set3.has(x));
      }
    }
    threeSetData.forEach(item=>{
      const elems=computeElements(item);
      item.label = `Count: ${elems.length}\nElement: ${elems.join(',')||'—'}`;
    });

    // Venn Diagram の描画
    d3.select("#venn-diagram1").append("div").text("3つの集合のベン図");
    const chart = venn.VennDiagram().width(500).height(530);
    d3.select("#venn-diagram1").append("div").datum(threeSetData).call(chart);

    // 描画完了後に、各単一集合の円に対して外部ラベルを追加
    // Set 1, Set 2 は上側、Set 3 は下側に配置
    d3.selectAll('.venn-area text').each(function(d) {
      const textEl = d3.select(this);
      const lines = d.label.split('\n');
      // まず既存のテキストをクリア
      textEl.text(null);
      // x, y の属性を保持
      const x = textEl.attr('x');
      const y = textEl.attr('y');
      lines.forEach((line, i) => {
        textEl.append('tspan')
          .attr('x', x)
          .attr('dy', i===0 ? '0em' : '1.2em')
          .text(line);
      });
    });
});
