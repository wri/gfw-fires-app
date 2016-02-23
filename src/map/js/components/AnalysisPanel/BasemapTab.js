import {analysisPanelText} from 'js/config';
import React from 'react';

export default class BasemapTab extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    let className = 'text-center';
    if (this.props.activeTab !== analysisPanelText.basemapTabId) { className += ' hidden'; }

    return (
      <div className={className}>
        TODO: basemap ui
        <div className='no-shrink analysis-footer text-center'>
        </div>
      </div>
    );
  }

}
