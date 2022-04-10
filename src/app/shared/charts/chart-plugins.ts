import { PluginServiceGlobalRegistration, PluginServiceRegistrationOptions } from 'chart.js';

export const textPlugin: (PluginServiceGlobalRegistration & PluginServiceRegistrationOptions) = {
  id: 'appText',
  afterDatasetsDraw: chartInstance => {
    const chart = chartInstance as Chart;
    const ctx = chart.ctx as CanvasRenderingContext2D;

    if (chartInstance.options.plugins.text) {
      for (const centerConfig of chartInstance.options.plugins.text) {
        const fontStyle = centerConfig.fontStyle || 'Arial';
        const txt = centerConfig.text;
        const color = centerConfig.color || '#000';
        const x = centerConfig.x;
        const y = centerConfig.y;
        const height = centerConfig.fontSize || 18;
        // Set font size, must be equal to height so we can shift the textbox
        ctx.font = height + 'px ' + fontStyle;

        const width = ctx.measureText(txt).width;
        ctx.fillStyle = color;

        // Draw text in center
        ctx.fillText(txt, x * chart.width - width / 2, y * chart.height + height / 2);
      }
    }
  }
};

export const linePlugin: (PluginServiceGlobalRegistration & PluginServiceRegistrationOptions) = {
  id: 'appLine',
  afterDatasetsDraw: chartInstance => {
    let position;
    const chart = chartInstance as Chart & any; // & any to suppress errors caused by accessing the scales
    const hasOneAxis = chart.scales.scale !== undefined;
    const canvas = chart.chart;
    const ctx = canvas.ctx;
    let style;

    if (chartInstance.options.plugins.line) {
      for (const line of chartInstance.options.plugins.line) {
        let scale;
        if (hasOneAxis) {
          scale = chart.scales.scale;
        } else if (line.type === 'vertical') {
          scale = chart.scales['x-axis-0'];
        } else {
          scale = chart.scales['y-axis-0'];
        }

        if (!line.style) {
          style = 'rgba(169,169,169, .6)';
        } else {
          style = line.style;
        }

        if (chart.config.type === 'doughnut') {
          position = [canvas.width / 2, canvas.height * 0.8];
        } else if (line.pos !== null && line.pos !== undefined) {
          if (hasOneAxis) {
            position = line.type === 'vertical' ? scale.xCenter : scale.yCenter;
            position -= scale.getDistanceFromCenterForValue(line.pos);
          } else {
            position = scale.getPixelForValue(line.pos);
          }
        }

        ctx.lineWidth = 2;

        if (position !== null) {
          ctx.beginPath();
          if (chart.config.type === 'doughnut') {
            const xx = Math.cos(-Math.PI + line.pos * Math.PI / 100);
            const yy = Math.sin(-line.pos * Math.PI / 100);
            ctx.moveTo(position[0] + (xx * chart.innerRadius), position[1] + (yy * chart.innerRadius));
            ctx.lineTo(position[0] + (xx * chart.outerRadius), position[1] + (yy * chart.outerRadius));
          } else {
            const start = (1 - line.size) / 2;
            const end = 1 - start;
            if (line.type === 'vertical') {
              ctx.moveTo(position, start * canvas.height);
              ctx.lineTo(position, end * canvas.height);
            } else {
              ctx.moveTo(start * canvas.width, position);
              ctx.lineTo(end * canvas.width, position);
            }
          }

          ctx.strokeStyle = style;
          ctx.stroke();
        }

        if (line.text) {
          ctx.fillStyle = style;
          ctx.fillText(line.text, 0, position + ctx.lineWidth);
        }
      }
    }
  }
};

export const pathPlugin: (PluginServiceGlobalRegistration & PluginServiceRegistrationOptions) = {
  id: 'appPath',
  afterDatasetsDraw: chartInstance => {
    const chart = chartInstance as Chart & any; // & any to suppress errors caused by accessing the scales
    const canvas = chart.chart;
    const ctx = canvas.ctx;
    let style;

    if (chartInstance.options.plugins.path) {
      for (const path of chartInstance.options.plugins.path) {
        if (path.hidden || path.points.length === 0) {
          continue;
        }

        const xScale = chart.scales[path.scales[0]];
        const yScale = chart.scales[path.scales[1]];

        if (!path.style) {
          style = 'rgba(169,169,169, .6)';
        } else {
          style = path.style;
        }

        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(xScale.getPixelForValue(path.points[0][0]), yScale.getPixelForValue(path.points[0][1]));
        for (const point of path.points) {
          ctx.lineTo(xScale.getPixelForValue(point[0]), yScale.getPixelForValue(point[1]));
        }

        ctx.strokeStyle = style;
        ctx.stroke();

        for (const text of path.text || []) {
          const position = Math.min(text.position, path.points.length - 1.0001) || 0;
          const pointIndex = Math.floor(position);
          const frac = position - pointIndex;
          const pointA = path.points[pointIndex];
          const pointB = path.points[pointIndex + 1];
          const xA = xScale.getPixelForValue(pointA[0]);
          const yA = yScale.getPixelForValue(pointA[1]);
          const xB = xScale.getPixelForValue(pointB[0]);
          const yB = yScale.getPixelForValue(pointB[1]);
          const angle = Math.atan2(yB - yA, xB - xA);

          if (frac < 0.1){
            ctx.textAlign = 'left';
          } else if (frac  > 0.9) {
            ctx.textAlign = 'right';
          } else {
            ctx.textAlign = 'center';
          }

          ctx.save();
          ctx.translate(xA + frac * (xB - xA), yA + frac * (yB - yA));
          ctx.rotate(angle);
          ctx.fillStyle = style;
          ctx.fillText(text.string, 0, -4); // xScale.getPixelForValue(point[0]), yScale.getPixelForValue(point[1]));
          ctx.restore();
        }
      }
    }
  }
};
