const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 16
canvas.height = 16 
context.strokeStyle = 'rgba(51, 51, 51, 0.4)';
const range = (start, stop, step) => {
  const len = Math.max(Math.ceil((stop - start) / step), 0);
  const r = Array(len);
  for (let i = 0; i < len; i++, start += step) {
    r[i] = start;
  }
  return r;
};
range(-1 * canvas.width, canvas.height, 8).forEach((val) => {
  context.beginPath();
  context.moveTo(val, 0);
  context.lineTo(canvas.width + val, canvas.height);
  context.stroke();
});
const pattern = context.createPattern(canvas, 'repeat');

const forecastHrs = [0, 5, 17, 33, 45, 57, 69, 93, 117];

const styles = {
  error_cone: {
    0: new ol.style.Style({
      fill: new ol.style.Fill({ color: pattern }),
      stroke: new ol.style.Stroke({ color: [51, 51, 51, 0.4], width: 1 }),
      zIndex: 2
    }),
    72: new ol.style.Style({
      fill: new ol.style.Fill({ color:[224, 224, 224, 0.7] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 3
    }),
    120: new ol.style.Style({
      fill: new ol.style.Fill({ color: [255, 255, 255, 0.4] }),
      stroke: new ol.style.Stroke({ color: [0, 0, 0, 0.4], width: 1 }),
      zIndex: 1
    })
  },
  forecast_position: {
    default:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFFFF'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 1,
        angle: Math.PI / 4,
      })
    }),
    RED:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FF0000'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    BLUE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#0024FA'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    WHITE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFFFF'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    YELLOW:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFF33'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    })
  },
  forecast_track_line: {
   default: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#777777',
      width: 2
    })
   })
  },
  past_track_line: {
   default: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#777777',
      width: 2
    })
   })
  },
  warning_line: {
   default: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#777777',
      width: 2
    })
   })
  },
  forecast_track_point: {
    RED:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FF0000'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    BLUE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#0024FA'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    WHITE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFFFF'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    YELLOW:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFF33'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    })
  },
  forecast_winds: {
    RED:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 0, 0, 0.4)'
        }),
    }),
    BLUE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 36, 250, 0.4)'
        }),
    }),
    WHITE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.4)'
        }),
    }),
    YELLOW:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 51, 0.4)'
        }),
    })
  },
  past_wind: {
    RED:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 0, 0, 0.4)'
        }),
    }),
    BLUE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 36, 250, 0.4)'
        }),
    }),
    WHITE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.4)'
        }),
    }),
    YELLOW:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 51, 0.4)'
        }),
    })
  },
  past_track_point: {
    RED:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FF0000'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    BLUE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#0024FA'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    WHITE:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFFFF'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    }),
    YELLOW:  new ol.style.Style({
      image: new ol.style.RegularShape({
        fill: new ol.style.Fill({
          color: '#FFFF33'
        }),
        stroke: new ol.style.Stroke({
          color: '#000000',
          width: 0.5
        }),
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
      }),
    })
  },
  wind_prob_point: {
    default:  new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(0, 178, 0, 0.4)'
      }),
      zIndex: 1
  }),
  },
  wind_prob_polygon: {
    // '#00B200'
    GREEN:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 178, 0, 0.4)'
        }),
        zIndex: 1
    }),
  // '#00FF00'
    LIMEGREEN:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 255, 0, 0.4)' 
        }),
        zIndex: 2
    }),
  // '#FFFF00'
    LIGHTYELLOW:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 0, 0.4)'
        }),
        zIndex: 3
    }),
    BLANDYELLOW:  new ol.style.Style({
      // '#FFCC66'
        fill: new ol.style.Fill({
          color: 'rgba(255, 204, 102, 0.4)' 
        }),
        zIndex: 4
    }),
  // '#CC6600'
    DARKORANGE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(204, 102, 0, 0.4)'
        }),
        zIndex: 5
    }),
  // '#FF8000'
    ORANGE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 128, 0, 0.4)'
        }),
        zIndex: 6
    }),
    RED:  new ol.style.Style({
      // '#C00000'
        fill: new ol.style.Fill({
          color: 'rgba(192, 0, 0, 0.4)'
        }),
        zIndex: 7
    }),
    DARKRED:  new ol.style.Style({
      // '#800000'
        fill: new ol.style.Fill({
            color: 'rgba(128, 0, 0, 0.4)'
        }),
        zIndex: 8
    }),
    PURPLE:  new ol.style.Style({
      // '#6600CC'
        fill: new ol.style.Fill({
          color: 'rgba(102, 0, 204, 0.4)' 
        }),
        zIndex: 9
    })
  },
  forecast_wind_swath: {
    RED:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 0, 0, 0.4)'
        }),
    }),
    BLUE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 36, 250, 0.4)'
        }),
    }),
    WHITE:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.4)'
        }),
    }),
    YELLOW:  new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 51, 0.4)'
        }),
    })
  },
  getColorFromWS(ws) {
    const TROP_STORM_SPEED = 34;
    const STRONG_STORM_SPEED = 50;
    const HURRICANE_SPEED = 64;
    
    if (ws >= TROP_STORM_SPEED && ws < STRONG_STORM_SPEED) {
      return 'BLUE';
    } else if (ws >= STRONG_STORM_SPEED && ws < HURRICANE_SPEED) {
      return 'YELLOW';
    } else if (ws >= HURRICANE_SPEED) {
      return 'RED';
    } else {
      return 'WHITE';
    }
  },
  getColorFromProb(prob) {
    prob = (prob >= 10) ? (Math.floor(prob / 10) * 10) : (prob >= 5) ? 5 : 0;
   
    switch (prob) {
      case 5:
        return 'DARKGREEN';
      case 10:
        return 'GREEN';
      case 20:
        return 'LIMEGREEN';
      case 30:
        return 'LIGHTYELLOW';
      case 40:
        return 'BLANDYELLOW';
      case 50:
        return 'DARKORANGE';
      case 60:
        return 'ORANGE';
      case 70:
        return 'RED';
      case 80:
        return 'DARKRED';
      case 90:
        return 'PURPLE';
    }
  },
  styleFunction(feature) {
    const layerName = feature.get('layer');
    if (layerName === 'error_cone') {
      return this[layerName][feature.get('label')];
    } else if (layerName === 'forecast_position') {
      if (forecastHrs.includes(feature.get('hour'))) {
        const color = this.getColorFromWS(feature.get('maxwind'));
        return this[layerName][color];
      } else {
        return this[layerName].default;
      }
    } else if (layerName === 'forecast_track_line') {
      return this[layerName].default;
    } else if (layerName === 'forecast_track_point') {
      const color = this.getColorFromWS(feature.get('maxwind'));
      return this[layerName][color];
    } else if (layerName === 'forecast_winds') {
      const color = this.getColorFromWS(feature.get('maxwind'));
      return this[layerName][color];
    } else if (layerName === 'past_track_point') {
      const color = this.getColorFromWS(feature.get('maxwind'));
      return this[layerName][color];
    } else if (layerName === 'past_track_line') {
      return this[layerName].default;
    } else if (layerName === 'past_wind') {
      const color = this.getColorFromWS(feature.get('windspd'));
      return this[layerName][color];
    } else if (layerName === 'warning_line') {
      return this[layerName].default;
    } else if (layerName === 'wind_prob_point') {
      return this[layerName].default;
    } else if (layerName === 'wind_prob_polygon') {
      if (feature.get('windspd') === 34) {
        const color = this.getColorFromProb(feature.get('prob'));
        return this[layerName][color];
      }
    } else if (layerName === 'forecast_wind_swath') {
      const color = this.getColorFromWS(feature.get('windspd'));
      return this[layerName][color];
    }
  }
}

export default styles;