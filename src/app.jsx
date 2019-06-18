import React, { useEffect, useMemo, useRef } from 'react';
import enigma from 'enigma.js';
import schema from 'enigma.js/schemas/12.170.2.json';
import { useModel, useLayout, usePicasso } from 'hamus.js';
import picasso from 'picasso.js';
import picassoQ from 'picasso-plugin-q';
import usePromise from 'react-use-promise';
import picasso_props from '../artifacts/object-picasso-chart.json';
import weeklyChartProps from '../artifacts/object-picasso-day-chart.json';
import kpi_props from '../artifacts/object-kpi.json'
import useKpi from './kpi';
import lodash from 'lodash';

const stacked_chart_settings = {
  collections: [{
    key: 'stacked',
    data: {
      extract: {
        field: 'qDimensionInfo/0', 
        props: {
          series: { field: 'qDimensionInfo/1' }, 
          end: { field: 'qMeasureInfo/0' } 
        }
      },
      stack: {
        stackKey: d => d.value,
        value: d => d.end.value
      }
    }
  }],
  scales: {
    y: {
      data: {
        collection: {
          key: 'stacked'
        }
      },
      min: 0,
      max: 1,
      invert: true,
      expand: 0.2,
    },
    t: {
      data: { extract: { field: 'qDimensionInfo/0' } },
      padding: 0.3
    },
    catcolor: {
      type: 'categorical-color',
      data: ['feature', 'enhancement', 'maintenance', 'admin'],
      range: ['#5271C2', '#35a541', '#bdb235', '#db6623']
    },
    color: {
      data: { extract: { field: 'qDimensionInfo/1' } },
      type: 'color',
    },
  },
  components: [
    { type: 'axis', dock: 'left', scale: 'y' },
    { type: 'axis', dock: 'bottom', scale: 't' },
    { type: 'text', text: 'Size', dock: 'left' },
    {
      key: 'bars',
      type: 'box',
      data: {
        collection: 'stacked'
      },
      settings: {
        major: { scale: 't' },
        minor: { scale: 'y', ref: 'end' },
        box: {
          maxWidthPx: 200,
          fill: function (d) { return d.resources.scale('catcolor')(d.datum.series.label); },      
        },
      },
      brush: {
        trigger: [{
          on: 'tap',
          contexts: ['highlight'],
        }],
        consume: [{
          context: 'highlight',
          style: {
            inactive: {
              opacity: 0.5,
            },
          },
        }],
      },
    }
  ],
};


// use stacked template and add configuration
let weekly_settings = lodash.cloneDeep(stacked_chart_settings);
weekly_settings.components.push(
  { type: 'text', text: 'Time allocation per week', dock: 'top' },
  { type: 'text', text: 'week', dock: 'bottom' }
);


let weekday_settings = lodash.cloneDeep(stacked_chart_settings);
weekday_settings.components.push(
  { type: 'text', text: 'Time allocation per weekday', dock: 'top' },
  { type: 'text', text: 'day', dock: 'bottom' }
);

const useGlobal = session => usePromise(() => session.open(), [session]);

const useApp = (global) => {
  const [sessionApp] = usePromise(async () => {
    if (!global) return null;

    const app = await global.openDoc('core-time.qvf');
    await app.doReload();
    await app.doSave();
    return app;
  }, [global]);
  return sessionApp;
}

// we need to register the q plugin in order for picasso to understand the QIX hypercube.
picasso.use(picassoQ);

export default function App() {
  // we need to keep track of an element reference for the picasso chart.
  const element = useRef(null);
  const weeklyChart = useRef(null);
  
  // we need to use the useMemo hook to avoid creating new enigma.js sessions each time.
  const session = useMemo(() => enigma.create({ schema, url: 'ws://localhost:29076/app' }), [false]);
  const [global] = useGlobal(session);
  const app = useApp(global);

  // Weekly chart
  const [model, modelError] = useModel(app, picasso_props);
  const [layout, layoutError] = useLayout(model);

  const pic = usePicasso(element, weekly_settings, layout);

  // KPI Objects
  const [model2, modelError2] = useModel(app, kpi_props);
  const [layout2, layoutError2] = useLayout(model2);
  const kpi = useKpi(layout2, app);

  // Weekday chart
  const [model3, modelError3] = useModel(app, weeklyChartProps);
  const [layout3, layoutError3] = useLayout(model3);
  const weekChart = usePicasso(weeklyChart, weekday_settings, layout3);

  const selectVal = async (value) => {
    const field = await app.getField('week');
    await field.lowLevelSelect([value], true);
  };

  // we want to start with one value highlighted in the chart.
  useEffect(() => {
    if (!pic) return;
    // access the brush instance
    const highlighter = pic.brush('highlight');
    // highlight a value
    highlighter.on('update', (added) => {
      if (added[0]) {
        selectVal(added[0].values[0]);
      } else {
        pic.brush('highlight').end();
        //app.clearAll();
      }
    });

    //highlighter.addValue('qHyperCube/qDimensionInfo/1', 0);
  }, [pic]);

  let msg = '';
  if (!app) {
    msg = 'Fetching app...';
  } else if (modelError) {
    msg = 'Oops, there was some problems fetching the model';
  } else if (layoutError) {
    msg = 'Oops, there was some problems fetching the layout';
  } else if (!layout) { msg = 'Fetching layout...'; }

  return (
    <div className="app">
      <h1>Qlik Core Time allocation</h1>
      {kpi}
      <div className="chart">
        <div ref={element}>{msg}</div>
      </div>
      <div className="chart">
        <div ref={weeklyChart}>{msg}</div>
      </div>
    </div>
  );
}