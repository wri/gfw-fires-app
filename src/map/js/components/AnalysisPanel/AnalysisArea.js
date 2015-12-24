import {analysisPanelText} from 'js/config';
import {analysisActions} from 'actions/AnalysisActions';
import React from 'react';

export default class AnalysisArea extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    let className = 'text-center';
    if (this.props.activeTab === analysisPanelText.timeframeTabId) { className += ' hidden'; };

    return (
      <div className={className}>
        <p>Select area of interest:</p>
        <div className='flex flex-justify-around'>
          <label>
            <input onChange={analysisActions.toggleAreaIslandsActive} checked={this.props.areaIslandsActive} type='radio' />
            {' By Island(s)'}
          </label>
          <label>
            <input onChange={analysisActions.toggleAreaIslandsActive} checked={!this.props.areaIslandsActive} type='radio' />
            {' By Province(s)'}
          </label>
        </div>
        <div className='padding'>
          <select className={`fill__wide ${this.props.areaIslandsActive === true ? '' : 'hidden'}`}  multiple onChange={this.change} disabled={this.props.islands.length === 0}>
            {this.props.islands.map((i) => (
              <option value={i}>{i}</option>
            ))}
          </select>
          <select className={`fill__wide ${this.props.areaIslandsActive === false ? '' : 'hidden'}`} multiple onChange={this.change} disabled={this.props.provinces.length === 0}>
            {this.props.provinces.map((p) => (
              <option value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

}
