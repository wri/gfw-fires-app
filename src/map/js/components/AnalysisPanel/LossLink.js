import {layerActions} from 'actions/LayerActions';
import {layerPanelText} from 'js/config';
import React from 'react';

let lossOptions = layerPanelText.lossOptions;

export default class LossLink extends React.Component {

  fromChanged (evt) {
    layerActions.changeLossFromTimeline(evt.target.selectedIndex);
  }

  toChanged (evt) {
    layerActions.changeLossToTimeline(evt.target.selectedIndex);
  }

  optionsMap (type) {
    // Disable options in the 'from' select that are greater than the selected value in the 'to' select
    // and vice versa, disable 'to' options less than the selected value in the 'from' select
    let fromMax = lossOptions[this.props.lossToSelectIndex].value;
    let toMin = lossOptions[this.props.lossFromSelectIndex].value;
    return item => {
      let disabled = type === 'from' ? item.value >= fromMax : item.value <= toMin;
      return <option value={item.value} disabled={disabled}>{item.label}</option>;
    };
  }

  render () {
    let fromItem = lossOptions[this.props.lossFromSelectIndex];
    let toItem = lossOptions[this.props.lossToSelectIndex];

    return (
      <span className='loss-link inline-flex'>
        <div className='loss-from relative'>
          <select onChange={this.fromChanged} className='pointer' value={fromItem.value}>
            {lossOptions.map(this.optionsMap('from'))}
          </select>
          <div className='gfw-link'>{fromItem.label}</div>
        </div>
        <div className='loss-timeline-spacer'>to</div>
        <div className='loss-to relative'>
          <select onChange={this.toChanged} className='pointer' value={toItem.value}>
            {lossOptions.map(this.optionsMap('to'))}
          </select>
          <div className='gfw-link'>{toItem.label}</div>
        </div>
      </span>
    );
  }

}
