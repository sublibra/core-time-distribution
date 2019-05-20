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

  return (
    <div className="list">

      <div className="card card-1" onClick={() => selectType('feature')}>
        <p className="name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[0].qFallbackTitle}</span></p>
        <p className="num">{Math.trunc(layout.qHyperCube.qGrandTotalRow[0].qText * 100)}%</p>
      </div>

      <div className="card card-2" onClick={() => selectType('enhancement')}>
        <p className="name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[1].qFallbackTitle}</span></p>
        <p className="num">{Math.trunc(layout.qHyperCube.qGrandTotalRow[1].qText * 100)}%</p>
      </div>

      <div className="card card-3" onClick={() => selectType('maintenance')}>
        <p className="name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[2].qFallbackTitle}</span></p>
        <p className="num">{Math.trunc(layout.qHyperCube.qGrandTotalRow[2].qText * 100)}%</p>
      </div>

      <div className="card card-4" onClick={() => selectType('admin')}>
        <p className="name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[3].qFallbackTitle}</span></p>
        <p className="num">{Math.trunc(layout.qHyperCube.qGrandTotalRow[3].qText * 100)}%</p>
      </div>
    </div>
  );
}
