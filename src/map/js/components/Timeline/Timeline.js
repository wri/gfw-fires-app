import {analysisStore} from 'stores/AnalysisStore';
import React from 'react';

export default class Timeline extends React.Component {

  constructor (props) {
    super(props);
    analysisStore.listen(this.storeUpdated.bind(this));
    this.state = analysisStore.getState();
  }

  storeUpdated () {
    this.setState(analysisStore.getState());
  }

  render () {
    var className = `timeline shadow back-white ${this.state.timelineVisible === false ? 'hidden' : ''}`
    return (
      <div className={className}>
        Timeline
      </div>
    )
  }

}
