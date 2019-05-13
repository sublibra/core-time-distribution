import React, { useState, useEffect } from 'react';
import './kpi-list.scss';
import './kpi';
import useKpi from './kpi';

export default function useKpiList(layout) {

  if (!layout) {
    return null;
  } else {
    console.log(layout);
  }

  let kpis=null;
  for (let i=0; i++; i<3){
    kpis += useKpi(
      layout.qHyperCube.qMeasureInfo[i].qFallbackTitle,
      layout.qHyperCube.qGrandTotalRow[i].qText);
  }

  console.log(kpis);

  return (
    <div className="kpilist">
      {kpis}
    </div>
  );
}
