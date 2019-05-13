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
      <ul>
        <li className="card">
          <div className="card__front">
            <p className="card__name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[0].qFallbackTitle}</span></p>
            <p className="card__num">{layout.qHyperCube.qGrandTotalRow[0].qText}</p>
          </div>
        </li>
        <li className="card">
          <div className="card__front">
            <p className="card__name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[1].qFallbackTitle}</span></p>
            <p className="card__num">{layout.qHyperCube.qGrandTotalRow[1].qText}</p>
          </div>
        </li>
        <li className="card">
          <div className="card__front">
            <p className="card__name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[2].qFallbackTitle}</span></p>
            <p className="card__num">{layout.qHyperCube.qGrandTotalRow[2].qText}</p>
          </div>
        </li>
        <li className="card">
          <div className="card__front">
            <p className="card__name">Average <br /><span>{layout.qHyperCube.qMeasureInfo[3].qFallbackTitle}</span></p>
            <p className="card__num">{layout.qHyperCube.qGrandTotalRow[3].qText}</p>
          </div>
        </li>
      </ul>
    </div>
  );
}
