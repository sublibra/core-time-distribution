import React, { useState, useEffect } from 'react';
import './kpi.scss';

export default function useKpi(layout, app) {
 
  const [selected, setSelected] = useState(false);

  if (!layout) {
    return null;
  }

  const selectType = async (value) => {
    const field = await app.getField('Type');
    if (!selected) { 
      await field.select(value);
    } else {
      await field.clear();
    }
    setSelected(!selected);
  };    

  const cards = () => {
   let res = [];
    for (let i=0; i<layout.qHyperCube.qMeasureInfo.length; i++){
      let className = "card card-" + (i+1);
      res.push(
        <div className={className} onClick={() => selectType(layout.qHyperCube.qMeasureInfo[i].qFallbackTitle)}>
        <p className="name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[i].qFallbackTitle}</span></p>
        <p className="num">{Math.trunc(layout.qHyperCube.qGrandTotalRow[i].qNum * 100)}%</p>
      </div>)
    }
    return res;
  }

  return (
    <div className="list">
      {cards()}
    </div>
  );
}
