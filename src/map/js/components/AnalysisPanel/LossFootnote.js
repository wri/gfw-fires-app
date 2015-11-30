import CanopyLink from 'components/AnalysisPanel/CanopyLink';
import LossLink from 'components/AnalysisPanel/LossLink';
import {analysisPanelText as text} from 'js/config';
import {mapStore} from 'stores/MapStore';
import React from 'react';

export default class LossFootnote extends React.Component {

  constructor (props) {
    super(props);

    mapStore.listen(this.storeUpdated.bind(this));
    let defaultState = mapStore.getState();
    this.state = {
      lossFromSelectIndex: defaultState.lossFromSelectIndex,
      lossToSelectIndex: defaultState.lossToSelectIndex,
      canopyDensity: defaultState.canopyDensity
    };
  }

  storeUpdated () {
    let newState = mapStore.getState();
    if (newState.lossFromSelectIndex !== this.state.lossFromSelectIndex ||
        newState.lossToSelectIndex !== this.state.lossToSelectIndex ||
        newState.canopyDensity !== this.state.canopyDensity
    ) {
      this.setState({
        lossFromSelectIndex: newState.lossFromSelectIndex,
        lossToSelectIndex: newState.lossToSelectIndex,
        canopyDensity: newState.canopyDensity
      });
    }
  }

  render () {
    return (
      <div className='loss-footnote flex'>
        <span className='loss-footnote-label'>{text.lossFootnote}</span>
        <LossLink {...this.state} />
        <CanopyLink {...this.state} />
      </div>
    );
  }

}
