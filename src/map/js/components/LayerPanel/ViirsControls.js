import {layerActions} from 'actions/LayerActions';
import LayersHelper from 'helpers/LayersHelper';
import {modalActions} from 'actions/ModalActions';
import {layerPanelText} from 'js/config';
import React from 'react';

let firesOptions = layerPanelText.firesOptions;

class ArchiveViirsControls extends React.Component {
  render() {
    return <div>yo.</div>;
  }
}

export default class ViirsControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customeDateRange: true
    }
  }

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
    let activeItem = firesOptions[this.props.viiirsSelectIndex];
    return <div>
      <div className='timeline-container fires'>
        <select className='pointer' value={activeItem.value} onChange={this.changeViirsTimeline}>
          {firesOptions.map(this.optionsMap, this)}
        </select>
        <div className='active-fires-control gfw-btn sml white'>{activeItem.label}</div>
        <div className='active-fires-control gfw-btn sml white' onClick={this.toggleViirsArchiveState.bind(this)}>C.D.R</div>
      </div>
      <ArchiveViirsControls display={this.state.customeDateRange}/>
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

  toggleViirsArchiveState () {
    this.state.customeDateRange = !this.state.customeDateRange
  }

}
