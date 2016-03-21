import {analysisActions} from 'actions/AnalysisActions';
import {analysisPanelText as text} from 'js/config';
import {AlertsSvg, AnalysisSvg, ImagerySvg, BasemapSvg} from 'utils/svgs';
import React from 'react';

export default class TabControls extends React.Component {

  click (tabId) {
   analysisActions.setAnalysisType(tabId);
    if (this.props.activeTab === tabId) { analysisActions.toggleAnalysisToolsExpanded(); }
    else if (this.props.subscribeToolsExpanded === false) { analysisActions.toggleSubscribeToolsExpanded(); }
    else if (this.props.imageryToolsExpanded === false) { analysisActions.toggleImageryToolsExpanded(); }
    else if (this.props.basemapToolsExpanded === false) { analysisActions.toggleBasemapToolsExpanded(); }
  }

  render () {
    let left = 0;
    if (this.props.activeTab === text.subscriptionTabId) {
      left = '25%';
    } else if (this.props.activeTab === text.imageryTabId) {
      left = '50%';
    } else if (this.props.activeTab === text.basemapTabId) {
      left = '75%';
    }
    let styles = {
      left: left,
      opacity: (this.props.analysisToolsExpanded === false ? 0 : 1)
    };

    return (
      <div className='no-shrink tabs'>
        <div className={`gfw-btn pointer inline-block ${this.props.analysisToolsExpanded !== false && this.props.activeTab === text.analysisTabId ? 'active' : ''}`}
          onClick={this.click.bind(this, text.analysisTabId)}>
          <span className="tooltipmap">{text.analysisTabLabel}</span>
          <AnalysisSvg />

        </div>
        <div className={`gfw-btn pointer inline-block ${this.props.subscribeToolsExpanded !== false && this.props.activeTab === text.subscriptionTabId ? 'active' : ''}`}
          onClick={this.click.bind(this, text.subscriptionTabId)}>
          <span className="tooltipmap">{text.subscriptionTabLabel}</span>
          <AlertsSvg />

        </div>
        <div className={`gfw-btn pointer inline-block ${this.props.imageryToolsExpanded !== false && this.props.activeTab === text.imageryTabId ? 'active' : ''}`}
          onClick={this.click.bind(this, text.imageryTabId)}>
          <span className="tooltipmap">{text.imageryTabLabel}</span>
          <ImagerySvg />

        </div>
        <div className={`gfw-btn pointer inline-block ${this.props.basemapToolsExpanded !== false && this.props.activeTab === text.basemapTabId ? 'active' : ''}`}
          onClick={this.click.bind(this, text.basemapTabId)}>
          <span className="tooltipmap">{text.basemapTabLabel}</span>
          <BasemapSvg />

        </div>
        <div className='tab-indicator relative' style={styles}></div>
      </div>
    );
  }

}
