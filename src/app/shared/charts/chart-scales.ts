import { scaleService, helpers } from 'chart.js';

// Convert seconds to string (H:MM:SS)
const epochToHHMMSS = (tickValue, index, ticks) => {
  return new Date(tickValue * 1000).toISOString().substr(12, 7);
};

// https://github.com/chartjs/Chart.js/blob/68bae7906d93784618bd7d2ef4f760db09a31088/src/helpers/helpers.math.js#L66
export function _setMinAndMaxByKey(array, target, property) {
  let i;
  let ilen;
  let value;

  for (i = 0, ilen = array.length; i < ilen; i++) {
    value = array[i][property];
    if (!isNaN(value)) {
      target.min = Math.min(target.min, value);
      target.max = Math.max(target.max, value);
    }
  }
}

/**
 * Implementation of the nice number algorithm used in determining where axis labels will go
 */
function niceNum(seconds): number {
  if (seconds < 60) {
    return niceNum60(seconds);
  }

  if (seconds < 60 * 60) {
    return niceNum60(seconds / 60) * 60;
  }

  // Hours are made nice based on base10
  if (seconds >= 60 * 60) {
    const hours = seconds / (60 * 60);
    const exponent = Math.floor(Math.log10(hours));
    const fraction = hours / Math.pow(10, exponent);
    let niceFraction;

    if (fraction <= 1.0) {
      niceFraction = 1;
    } else if (fraction <= 2) {
      niceFraction = 2;
    } else if (fraction <= 5) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent) * 60 * 60;
  }
}

// returns nice intervals for values between 1 and 60
function niceNum60(range) {
  if (range <= 1.0) {
    return 1;
  } else if (range <= 2) {
    return 2;
  } else if (range <= 5) {
    return 5;
  } else if (range <= 10) {
    return 10;
  } else if (range <= 15) {
    return 15;
  } else if (range <= 30) {
    return 30;
  }
  return 60;
}

function generateTicks(generationOptions, dataRange) {
  const ticks = [];
  // To get a "nice" value for the tick spacing, we will use the appropriately named
  // "nice number" algorithm. See https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
  // for details.

  const MIN_SPACING = 1e-14;
  const {min, max} = generationOptions;
  const maxNumSpaces = generationOptions.maxTicks - 1;
  const {min: rmin, max: rmax} = dataRange;
  let spacing = niceNum((rmax - rmin) / maxNumSpaces);
  let niceMin;
  let niceMax;
  let numSpaces;

  // Beyond MIN_SPACING floating point numbers being to lose precision
  // such that we can't do the math necessary to generate ticks
  if (spacing < MIN_SPACING && helpers.isNullOrUndef(min) && helpers.isNullOrUndef(max)) {
    return [{value: rmin}, {value: rmax}];
  }

  numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
  if (numSpaces > maxNumSpaces) {
    // If the calculated num of spaces exceeds maxNumSpaces, recalculate it
    spacing = niceNum(numSpaces * spacing / maxNumSpaces);
  }

  niceMin = Math.floor(rmin / spacing) * spacing;
  niceMax = Math.ceil(rmax / spacing) * spacing;

  numSpaces = (niceMax - niceMin) / spacing;
  // If very close to our rounded value, use it.
  if (helpers.almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
    numSpaces = Math.round(numSpaces);
  } else {
    numSpaces = Math.ceil(numSpaces);
  }

  ticks.push({value: helpers.isNullOrUndef(min) ? niceMin : min});
  for (let j = 1; j < numSpaces; ++j) {
    ticks.push({value: Math.round((niceMin + j * spacing))});
  }
  ticks.push({value: helpers.isNullOrUndef(max) ? niceMax : max});

  return ticks;
}

export const durationScale = (scaleService as any).getScaleConstructor('linear').extend({
  buildTicks() {
    const me = this;
    const opts = me.options;
    const tickOpts = opts.ticks;

    // Figure out what the max number of ticks we can support it is based on the size of
    // the axis area. For now, we say that the minimum tick spacing in pixels must be 40
    // We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
    // the graph. Make sure we always have at least 2 ticks
    let maxTicks = me.getTickLimit();
    maxTicks = Math.max(2, maxTicks);

    const numericGeneratorOptions = {
      maxTicks,
      min: opts.min,
      max: opts.max
    };
    const ticks = generateTicks(numericGeneratorOptions, me);

    // At this point, we need to update our max and min given the tick values since we have expanded the
    // range of the scale
    _setMinAndMaxByKey(ticks, me, 'value');

    if (opts.reverse) {
      ticks.reverse();

      me.start = me.max;
      me.end = me.min;
    } else {
      me.start = me.min;
      me.end = me.max;
    }

    return ticks;
  }
});

export const durationConfig = Object.assign({}, (scaleService as any).getScaleDefaults('linear'), {
  ticks: {
    beginAtZero: true,
    callback: epochToHHMMSS,
  }
});
