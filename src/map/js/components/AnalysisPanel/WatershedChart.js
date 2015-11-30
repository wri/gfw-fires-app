import {analysisPanelText as text} from 'js/config';
import React from 'react';

let generateChart = (id, feature) => {
  console.log(feature);
  $(`#${id}`).highcharts({
    chart: { polar: true, spacingBottom: 0, spacingLeft: 0, spacingRight: 0, spacingTop: 0 },
    title: { text: '' },
    pane: { startAngle: 0, endAngle: 360 },
    xAxis: {
      tickInterval: 360,
      min: 0,
      max: 360,
      labels: { enabled: false }
    },
    yAxis: { min: 0, max: 5, labels: { enabled: false } },
    plotOptions: {
      series: { pointStart: 0, pointInterval: 90, events: { legendItemClick: () => false } },
      column: { pointPadding: 0, groupPadding: 0 }
    },
    legend: {
      align: 'right',
      layout: 'vertical',
      verticalAlign: 'middle',
      itemStyle: {
        width: '130px',
        fontWeight: 300,
        fontFamily: '\'Fira Sans\', Georgia, serif'
      }
    },
    tooltip: {
      formatter: function () {
        return `${this.series.name} - ${this.y}<br>${text.chartLookup[this.y]}`;
      }
    },
    credits: { enabled: false },
    series: [{
      type: 'column',
      name: 'Recent tree cover loss',
      data: [2],
      color: '#FF6097',
      pointPlacement: 'between'
    },
    {
      type: 'column',
      name: 'Sedimentation',
      data: [4],
      color: '#A79261',
      pointPlacement: 'between'
    },
    {
      type: 'column',
      name: 'Fire',
      data: [3],
      color: '#EA5A00',
      pointPlacement: 'between'
    },
    {
      type: 'column',
      name: 'Historical tree cover loss',
      data: [4],
      color: '#D2DF2E',
      pointPlacement: 'between'
    }]
  });
};

export default class WatershedChart extends React.Component {

  componentDidMount() {
    generateChart(this.props.id, this.props.feature);
  }

  componentDidUpdate(prevProps) {
    if (this.props.feature !== prevProps.feature && this.props.feature !== null) {
      generateChart(this.props.id, this.props.feature);
    }
  }

  render () {
    return (
      <div className='watershed-chart' id={this.props.id} />
    );
  }
}
