import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalActions} from 'actions/ModalActions';
import {layerPanelText} from 'js/config';
import React from 'react';

let firesOptions = layerPanelText.firesOptions;

export default class ViirsControls extends React.Component {

  componentDidUpdate(prevProps) {
    if (prevProps.viiirsSelectIndex !== this.props.viiirsSelectIndex) {
      LayersHelper.updateViirsDefinitions(this.props.viiirsSelectIndex);
    }
  }

  componentWillReceiveProps(nextProps) {
    // Set the default layer definition when the map has been loaded
    if (!this.props.loaded && nextProps.loaded) {
      LayersHelper.updateViirsDefinitions(nextProps.viiirsSelectIndex);
    }
  }

  render () {
    //<input onChange={this.toggleConfidence} type='checkbox' /><span className='fires-confidence-wrapper'>Only show <span className='fires-confidence' onClick={this.showFiresModal}>high confidence fires</span></span>
    let activeItem = firesOptions[this.props.viiirsSelectIndex];
    return <div>
      <div className='timeline-container relative fires'>
        <select className='pointer' value={activeItem.value} onChange={this.changeViirsTimeline}>
          {firesOptions.map(this.optionsMap, this)}
        </select>
        <div className='active-fires-control gfw-btn sml white'>{activeItem.label}</div>
      </div>
    </div>;
  }

  // showFiresModal () {
  //   modalActions.showFiresModal();
  // }

  toggleConfidence (evt) {
    LayersHelper.toggleConfidence(evt.target.checked);
  }

  optionsMap (item, index) {
    return <option key={index} value={item.value}>{item.label}</option>;
  }

  changeViirsTimeline (evt) {
    layerActions.changeViirsTimeline(evt.target.selectedIndex);
  }

}
