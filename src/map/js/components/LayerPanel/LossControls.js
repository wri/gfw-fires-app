import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {layerPanelText} from 'js/config';
import React from 'react';

let lossOptions = layerPanelText.lossOptions;

export default class LossControls extends React.Component {

  componentDidUpdate (prevProps) {
    if (prevProps.lossFromSelectIndex !== this.props.lossFromSelectIndex || prevProps.lossToSelectIndex !== this.props.lossToSelectIndex) {
      LayersHelper.updateLossLayerDefinitions(this.props.lossFromSelectIndex, this.props.lossToSelectIndex);
    }
  }

  componentWillReceiveProps(nextProps) {
    // Set the default layer definition when the map has been loaded
    if (!this.props.loaded && nextProps.loaded) {
      LayersHelper.updateLossLayerDefinitions(this.props.lossFromSelectIndex, this.props.lossToSelectIndex);
    }
  }

  render () {
    let fromItem = lossOptions[this.props.lossFromSelectIndex];
    let toItem = lossOptions[this.props.lossToSelectIndex];

    return (
      <div className='timeline-container loss flex'>
        <div className='loss-from relative'>
          <select onChange={this.fromChanged} className='pointer' value={fromItem.value}>
            {lossOptions.map(this.optionsMap('from'))}
          </select>
          <div className='loss-from-button gfw-btn sml white'>{fromItem.label}</div>
        </div>
        <div className='loss-timeline-spacer'>to</div>
        <div className='loss-to relative'>
          <select onChange={this.toChanged} className='pointer' value={toItem.value}>
            {lossOptions.map(this.optionsMap('to'))}
          </select>
          <div className='loss-to-button gfw-btn sml white'>{toItem.label}</div>
        </div>
      </div>
    );
  }

  optionsMap (selectType) {
    // Disable options in the 'from' select that are greater than the selected value in the 'to' select
    // and vice versa, disable 'to' options less than the selected value in the 'from' select
    let fromMax = lossOptions[this.props.lossToSelectIndex].value;
    let toMin = lossOptions[this.props.lossFromSelectIndex].value;
    return (item, index) => {
      let disabled = selectType === 'from' ? item.value >= fromMax : item.value <= toMin;
      return <option key={index} value={item.value} disabled={disabled}>{item.label}</option>;
    };
  }

  fromChanged (evt) {
    layerActions.changeLossFromTimeline(evt.target.selectedIndex);
  }

  toChanged (evt) {
    layerActions.changeLossToTimeline(evt.target.selectedIndex);
  }

}
