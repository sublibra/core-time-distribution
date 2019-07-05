import React, { useEffect, useMemo, useRef } from 'react';
import enigma from 'enigma.js';
import schema from 'enigma.js/schemas/12.170.2.json';
import { useModel, useLayout, usePicasso } from 'hamus.js';
import picasso from 'picasso.js';
import picassoQ from 'picasso-plugin-q';
import usePromise from 'react-use-promise';
import useKpi from './kpi';

labels = function({
  c,
  justify = 0.5,
  align = 0.5,
  position = 'inside',
  fontSize = 12,
  fill = '#111'
}) {
  return {
    type: 'labels',
    displayOrder: 1,
    settings: {
      sources: [{
        component: c,
        selector: 'rect',
        strategy: {
          type: 'bar',
          settings: {
            direction: 'left',
            fontSize,
            align,
            labels: [{
              placements: [{
                position,
                fill,
                justify
              }],
              label: function label(d) {
                return Math.trunc((d.data.end.value - d.data.start.value)*100);
              }
            }]
          }
        }
      }]
    }
  };
}

const week_allocation_settings = {
  collections: [{
    key: 'stacked',
    data: {
      extract: {
        field: 'week',
        props: {
          series: { field: 'Type' },
          end: { field: 'avg(Size)' }
        }
      },
      stack: {
        stackKey: d => d.value,
        value: d => d.end.value
      }
    }
  }],
  formatters: {
    percentageFormatter: {
      formatter: 'd3',
      format: '0.1%'
    }
  },
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
      data: { extract: { field: 'week' } },
      padding: 0.3
    },
    catcolor: {
      type: 'categorical-color',
      data: ['feature', 'enhancement', 'maintenance', 'admin'],
      range: ['#5271C2', '#35a541', '#bdb235', '#db6623']
    },
    color: {
      data: { extract: { field: 'week' } },
      type: 'color',
    },
  },
  components: [
    { type: 'text', text: 'Time allocation per week', dock: 'top' },
    { type: 'axis', dock: 'left', scale: 'y', formatter: 'percentageFormatter' },
    { type: 'text', text: 'proportion', dock: 'left' },
    { type: 'legend-cat', scale: 'catcolor', dock: 'top' },
    { type: 'axis', dock: 'bottom', scale: 't' },
    { type: 'text', text: 'week', dock: 'bottom' },
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
          fill: function (d) {
            return d.resources.scale('catcolor')(d.datum.series.label);
          }
        },
      },
      brush: {
        trigger: [{
          on: 'tap',
          contexts: ['highlight'],
        },
        {
          on: 'over',
          action: 'set',
          contexts: ['hoover'],        
        }
      ],
        consume: [{
          context: 'highlight',
          style: {
            inactive: {
              opacity: 0.5,
            },
          },
        },
        {
          context: 'hoover',
          style: {
            active: {
              stroke: '#333',
              fontSize: 20,
              action: () => {
                //console.log(week_allocation_settings.components);
              },
              context: 'hoover'
            }
          }
        }
      ],
      },
    },
    labels({c: 'bars'}),
  ],
};

const weekday_settings = {
  collections: [{
    key: 'stacked',
    data: {
      extract: {
        field: 'weekDay',
        props: {
          line: { field: 'Type' },
          end: { field: 'avg(Size)' }
        }
      },
      stack: {
        stackKey: d => d.value,
        value: d => d.end.value
      }
    }
  }],
  formatters: {
    percentageFormatter: {
      formatter: 'd3',
      format: '0.1%'
    }
  },
  scales: {
    y: {
      data: {
        collection: {
          key: 'stacked'
        }
      },
      invert: true,
      expand: 0.1,
      min: 0,
      max: 1

    },
    t: { data: { extract: { field: 'weekDay' } } },
    catcolor: {
      type: 'categorical-color',
      data: ['feature', 'enhancement', 'maintenance', 'admin'],
      range: ['#5271C2', '#35a541', '#bdb235', '#db6623']
    },
    color: { data: { extract: { field: 'Type' } }, type: 'color' }
  },
  components: [
    { type: 'text', text: 'Time allocation per weekday', dock: 'top' },
    { type: 'axis', dock: 'left', scale: 'y', formatter: 'percentageFormatter' }, 
    { type: 'text', text: 'proportion', dock: 'left' },
    { type: 'axis', dock: 'bottom', scale: 't' }, 
    { type: 'text', text: 'day', dock: 'bottom' },
    {
      key: 'lines',
      type: 'line',
      data: {
        collection: 'stacked'
      },
      settings: {
        coordinates: {
          major: { scale: 't' },
          minor0: { scale: 'y', ref: 'start' },
          minor: { scale: 'y', ref: 'end' },
          layerId: { ref: 'line' }
        },
        layers: {
          curve: 'monotone',
          line: {
            show: false
          },
          area: {
            fill: function (d) {
              return d.resources.scale('catcolor')(d.datum.line.label);
            }
          }
        }
      }
    }]
}

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

const useObjectModel = (app, id) => {
  [model, error] = usePromise(() => {
    if (!app) {
      return null;
    } else {
      return app.getObject(id);
    }
  }, [app]);
  return [model, error];
};

// we need to register the q plugin in order for picasso to understand the QIX hypercube.
picasso.use(picassoQ);

export default function App() {
  // we need to keep track of an element reference for the picasso chart.
  const weeksChart = useRef(null);
  const weekdayChart = useRef(null);

  // we need to use the useMemo hook to avoid creating new enigma.js sessions each time.
  const session = useMemo(() => enigma.create({ schema, url: 'ws://localhost:29076/app' }), [false]);
  const [global] = useGlobal(session);
  const app = useApp(global);

  // Weekschart
  const [model, modelError] = useObjectModel(app, 'vis-2');
  const [layout, layoutError] = useLayout(model);
  const weeksChartPic = usePicasso(weeksChart, week_allocation_settings, layout);

  // KPI Objects
  const [model2, modelError2] = useObjectModel(app, 'kpi-objects');
  const [layout2, layoutError2] = useLayout(model2);
  const kpi = useKpi(layout2, app);

  // Weekday chart
  const [model3, modelError3] = useObjectModel(app, 'vis-1');
  const [layout3, layoutError3] = useLayout(model3);
  const weekDayChart = usePicasso(weekdayChart, weekday_settings, layout3);

  const selectVal = async (value) => {
    const field = await app.getField('week');
    await field.lowLevelSelect([value], true);
  };

  useEffect(() => {
    if (!weeksChartPic) return;
    // access the brush instance
    const weekChartHighlighter = weeksChartPic.brush('highlight');
    // highlight a value
    weekChartHighlighter.on('update', (added) => {
      if (added[0]) {
        selectVal(added[0].values[0]);
      } else {
        weeksChartPic.brush('highlight').end();
      }
    });

    weekChartHighlighter.on('hoover', (element) => {
      //console.log(element);
    });
  }, [weeksChartPic]);

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
        <div ref={weeksChart}>{msg}</div>
      </div>
      <div className="chart">
        <div ref={weekdayChart}>{msg}</div>
      </div>
    </div>
  );
}