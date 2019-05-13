import React, { useState, useEffect } from 'react';
import './kpi.scss';

export default function useKpi(layout) {
  const [value, setValue] = useState('0');

  if (!layout) {
    return null;
  } else {
    console.log(layout);
  }

  return (
    <div className="list">

      <div className="card card-1">
        <p className="name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[0].qFallbackTitle}</span></p>
        <p className="num">{Math.trunc(layout.qHyperCube.qGrandTotalRow[0].qText * 100)}%</p>
      </div>

      <div className="card card-2">
        <p className="name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[1].qFallbackTitle}</span></p>
        <p className="num">{Math.trunc(layout.qHyperCube.qGrandTotalRow[1].qText * 100)}%</p>
      </div>

      <div className="card card-3">
        <p className="name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[2].qFallbackTitle}</span></p>
        <p className="num">{Math.trunc(layout.qHyperCube.qGrandTotalRow[2].qText * 100)}%</p>
      </div>

      <div className="card card-4">
        <p className="name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[3].qFallbackTitle}</span></p>
        <p className="num">{Math.trunc(layout.qHyperCube.qGrandTotalRow[3].qText * 100)}%</p>
      </div>
    </div>
  );
}
