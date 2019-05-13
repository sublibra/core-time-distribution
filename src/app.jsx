import React, { useEffect, useMemo, useRef } from 'react';
import enigma from 'enigma.js';
import schema from 'enigma.js/schemas/12.170.2.json';
import { useModel, useLayout, usePicasso } from 'hamus.js';
import picasso from 'picasso.js';
import picassoQ from 'picasso-plugin-q';
import usePromise from 'react-use-promise';
import picasso_props from '../artifacts/object-picasso-chart.json';
import kpi_props from '../artifacts/object-kpi.json'
import useKpi from './kpi';
import background from './img/time.jpg';

const settings = {
  collections: [{
    key: 'stacked',
    data: {
      extract: {
        field: 'qDimensionInfo/0', //week
        props: {
          series: { field: 'qDimensionInfo/1' }, //type
          end: { field: 'qMeasureInfo/0' } //avg(size)
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
    { type: 'text', text: 'Qlik Core Time distribution', dock: 'top' },
    { type: 'text', text: 'Size', dock: 'left' },
    { type: 'text', text: 'week', dock: 'bottom' },
    //{ type: 'legend-cat', scale: 'catcolor', dock: 'top' },
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
          fill: function(d) { return d.resources.scale('catcolor')(d.datum.series.label); },
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
              opacity: 0.3,
            },
          },
        }],
      },
      }
    }],
};

const settings_barchart = {
  scales: {
    x: {
      data: { extract: { field: 'qDimensionInfo/0', props: { name: { field: 'qDimensionInfo/0', label: v => v.qText } } } },
      padding: 0.2,
    },
    y: {
      data: { field: 'qMeasureInfo/0' },
      include: [0],
      invert: true,
    },
    color: {
      data: { extract: { field: 'qDimensionInfo/0' } },
      type: 'color',
    },
  },
  components: [
    { type: 'axis', dock: 'left', scale: 'y' },
    { type: 'axis', dock: 'bottom', scale: 'x' },
    { type: 'text', text: 'Qlik Core Time distribution', dock: 'top' },
    { type: 'text', text: 'Size', dock: 'left' },
    { type: 'text', text: 'week', dock: 'bottom' },
    { type: 'legend-cat', scale: 'color', dock: 'top' },
    {
      key: 'bars',
      type: 'box',
      data: {
        extract: {
          field: 'qDimensionInfo/0',
          props: {
            start: 0,
            end: { field: 'qMeasureInfo/0' },
          },
        },
      },
      settings: {
        major: { scale: 'x' },
        minor: { scale: 'y' },
        box: {
          maxWidthPx: 200,
          fill: { scale: 'color' },
          strokeWidth: 1,
        },
      }
    }],
};

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
  // we need to use the useMemo hook to avoid creating new enigma.js sessions each time.
  const session = useMemo(() => enigma.create({ schema, url: 'ws://localhost:29076/app' }), [false]);
  const [global] = useGlobal(session);
  const app = useApp(global);
  // fetch the model
  const [model, modelError] = useModel(app, picasso_props);
  // fetch the layout.
  const [layout, layoutError] = useLayout(model);
  // render picasso chart.
  const pic = usePicasso(element, settings, layout);

  console.log(layout);

  const [model2, modelError2] = useModel(app, kpi_props);
  // fetch the layout.
  const [layout2, layoutError2] = useLayout(model2);

  // render kpi
  const kpi = useKpi(layout2);

  // we want to start with one value highlighted in the chart.
  useEffect(() => {
    if (!pic) return;
    // access the brush instance
    const highlighter = pic.brush('highlight');
    // highlight a value
    highlighter.addValue('qHyperCube/qDimensionInfo/0', 1);
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
      {kpi}
      <div className="chart">
        <div ref={element}>{msg}</div>
      </div>
    </div>
  );
}