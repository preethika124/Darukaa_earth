import React from 'react';
import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { SiteAnalyticsRecord } from '../../types';

// Dark theme defaults for Highcharts in Darukaa.Earth
Highcharts.setOptions({
  chart: {
    backgroundColor: 'transparent',
    style: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
    },
  },
  title: {
    style: {
      color: '#f8fafc',
      fontWeight: '600',
      fontSize: '15px',
    },
  },
  subtitle: {
    style: {
      color: '#94a3b8',
      fontSize: '12px',
    },
  },
  legend: {
    itemStyle: {
      color: '#cbd5e1',
      fontWeight: '500',
      fontSize: '11px',
    },
    itemHoverStyle: {
      color: '#ffffff',
    },
  },
  xAxis: {
    labels: {
      style: {
        color: '#94a3b8',
      },
    },
    lineColor: '#334155',
    tickColor: '#334155',
  },
  yAxis: {
    gridLineColor: '#1e293b',
    labels: {
      style: {
        color: '#94a3b8',
      },
    },
  },
  tooltip: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: 8,
    style: {
      color: '#f8fafc',
    },
  },
  credits: {
    enabled: false,
  },
});

interface ChartProps {
  data: SiteAnalyticsRecord[];
  title?: string;
  height?: number;
}

// 1. Carbon Trend: Cumulative Stock & Annual Sequestration
export const CarbonTrendChart: React.FC<ChartProps> = ({
  data,
  title = 'Carbon Sequestration & Stock Dynamics',
  height = 320,
}) => {
  const categories = data.map((d) => d.monitoring_date);
  const stockSeries = data.map((d) => d.carbon_stock);
  const sequesteredSeries = data.map((d) => d.carbon_sequestered);

  const options: Highcharts.Options = {
    chart: {
      type: 'spline',
      height,
    },
    title: {
      text: title,
      align: 'left',
    },
    subtitle: {
      text: 'Total biomass carbon stock (tCO2e) and net annual sequestration rate',
      align: 'left',
    },
    xAxis: {
      categories,
      crosshair: true,
    },
    yAxis: [
      {
        title: {
          text: 'Carbon Stock (tCO2e)',
          style: { color: '#10b981' },
        },
        labels: {
          format: '{value} t',
          style: { color: '#10b981' },
        },
      },
      {
        title: {
          text: 'Annual Sequestration (tCO2e/yr)',
          style: { color: '#06b6d4' },
        },
        labels: {
          format: '{value} t/yr',
          style: { color: '#06b6d4' },
        },
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
    },
    series: [
      {
        name: 'Total Carbon Stock',
        type: 'spline',
        yAxis: 0,
        data: stockSeries,
        color: '#10b981',
        marker: { symbol: 'circle', radius: 4 },
      },
      {
        name: 'Annual Sequestration',
        type: 'column',
        yAxis: 1,
        data: sequesteredSeries,
        color: 'rgba(6, 182, 212, 0.65)',
        borderRadius: 4,
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

// 2. Biodiversity Trend: Index (0-100) & Flora/Fauna Species Count
export const BiodiversityTrendChart: React.FC<ChartProps> = ({
  data,
  title = 'Biodiversity Health & Species Richness',
  height = 320,
}) => {
  const categories = data.map((d) => d.monitoring_date);
  const scoreSeries = data.map((d) => d.biodiversity_score);
  const speciesSeries = data.map((d) => d.species_count);

  const options: Highcharts.Options = {
    chart: {
      type: 'areaspline',
      height,
    },
    title: {
      text: title,
      align: 'left',
    },
    subtitle: {
      text: 'Ecosystem health rating alongside verified taxonomic species censuses',
      align: 'left',
    },
    xAxis: {
      categories,
      crosshair: true,
    },
    yAxis: [
      {
        title: {
          text: 'Biodiversity Index (0–100)',
          style: { color: '#14b8a6' },
        },
        min: 0,
        max: 100,
        labels: {
          format: '{value}',
          style: { color: '#14b8a6' },
        },
      },
      {
        title: {
          text: 'Observed Species Count',
          style: { color: '#f59e0b' },
        },
        labels: {
          format: '{value} spp',
          style: { color: '#f59e0b' },
        },
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
    },
    series: [
      {
        name: 'Biodiversity Index',
        type: 'areaspline',
        yAxis: 0,
        data: scoreSeries,
        color: '#14b8a6',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(20, 184, 166, 0.4)'],
            [1, 'rgba(20, 184, 166, 0.02)'],
          ],
        },
      },
      {
        name: 'Documented Species',
        type: 'spline',
        yAxis: 1,
        data: speciesSeries,
        color: '#f59e0b',
        dashStyle: 'ShortDot',
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

// 3. Vegetation Trend: NDVI & Forest Coverage %
export const VegetationTrendChart: React.FC<ChartProps> = ({
  data,
  title = 'Canopy Density & Sentinel NDVI Index',
  height = 320,
}) => {
  const categories = data.map((d) => d.monitoring_date);
  const ndviSeries = data.map((d) => d.vegetation_index);
  const coverSeries = data.map((d) => d.forest_cover);

  const options: Highcharts.Options = {
    chart: {
      type: 'spline',
      height,
    },
    title: {
      text: title,
      align: 'left',
    },
    subtitle: {
      text: 'Multispectral vegetation vigor (NDVI) and crown forest cover percentage',
      align: 'left',
    },
    xAxis: {
      categories,
      crosshair: true,
    },
    yAxis: [
      {
        title: {
          text: 'Vegetation Index (NDVI)',
          style: { color: '#22c55e' },
        },
        min: 0,
        max: 1.0,
        labels: {
          format: '{value}',
          style: { color: '#22c55e' },
        },
      },
      {
        title: {
          text: 'Forest Cover (%)',
          style: { color: '#8b5cf6' },
        },
        min: 0,
        max: 100,
        labels: {
          format: '{value}%',
          style: { color: '#8b5cf6' },
        },
        opposite: true,
      },
    ],
    tooltip: {
      shared: true,
    },
    series: [
      {
        name: 'NDVI Index',
        type: 'spline',
        yAxis: 0,
        data: ndviSeries,
        color: '#22c55e',
      },
      {
        name: 'Crown Forest Cover',
        type: 'column',
        yAxis: 1,
        data: coverSeries,
        color: 'rgba(139, 92, 246, 0.6)',
        borderRadius: 4,
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

// 4. Carbon vs Biodiversity Correlation Scatter
export const CarbonVsBiodiversityChart: React.FC<ChartProps> = ({
  data,
  title = 'Carbon Biomass vs. Biodiversity Synergy',
  height = 320,
}) => {
  const scatterData = data.map((d) => ({
    x: d.carbon_stock,
    y: d.biodiversity_score,
    name: d.monitoring_date,
    species: d.species_count,
  }));

  const options: Highcharts.Options = {
    chart: {
      type: 'scatter',
      height,
    },
    title: {
      text: title,
      align: 'left',
    },
    subtitle: {
      text: 'Empirical cross-plot correlating total carbon stock with ecological score',
      align: 'left',
    },
    xAxis: {
      title: {
        text: 'Total Carbon Stock (tCO2e)',
        style: { color: '#cbd5e1' },
      },
    },
    yAxis: {
      title: {
        text: 'Biodiversity Score (0–100)',
        style: { color: '#cbd5e1' },
      },
      min: 0,
      max: 100,
    },
    tooltip: {
      formatter: function () {
        const ctx = this as any;
        const point = ctx.point;
        return (
          `<b>${point?.name || 'Monitoring Record'}</b><br/>` +
          `Carbon Stock: <b>${ctx.x?.toLocaleString()} tCO2e</b><br/>` +
          `Biodiversity Score: <b>${ctx.y} / 100</b><br/>` +
          `Species Count: <b>${point?.species || 'N/A'}</b>`
        );
      },
    },
    series: [
      {
        name: 'Observation Period',
        type: 'scatter',
        data: scatterData,
        color: '#38bdf8',
        marker: {
          radius: 6,
          symbol: 'circle',
        },
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};
