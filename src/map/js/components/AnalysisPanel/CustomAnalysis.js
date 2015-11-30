import LatLngTool from 'components/AnalysisPanel/LatLngTool';
import {analysisActions} from 'actions/AnalysisActions';
import AnalysisHelper from 'helpers/AnalysisHelper';
import {analysisPanelText as text} from 'js/config';
import Draw from 'esri/toolbars/draw';
import React from 'react';

// Temporary for the prototype
import CustomAnalysisLink from 'components/AnalysisPanel/CustomAnalysisLink';
import WatershedSummary from 'components/AnalysisPanel/WatershedSummary';
import WatershedChart from 'components/AnalysisPanel/WatershedChart';
import LossFootnote from 'components/AnalysisPanel/LossFootnote';
let runReport = () => {
  window.open('http://data.wri.org/gfw-water/sample-report.pdf');
};

let editSvg = '<use xlink:href="#icon-edit-text" />';

let toolbar;

export default class CustomAnalysis extends React.Component {

  constructor (props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
    if (this.props.activeWatershed !== prevProps.activeWatershed) {
      // console.log(this.props.feature);
    }

    // Turn on or off the toolbar from store changing, this way other components can easily turn this on or off
    if (this.props.toolbarActive) {
      toolbar.activate(Draw.POINT);
    } else if (toolbar) {
      toolbar.deactivate();
    }
  }

  addPoint () {
    // Create the toolbar if necessary
    if (!toolbar) {
      toolbar = new Draw(app.map);
      toolbar.on('draw-end', evt => {
        // Deactivate toolbar, update store, then add point to map to show location and find watershed around point
        toolbar.deactivate();
        analysisActions.toggleDrawToolbar(false);
        // Find out if this point is in a watershed
        AnalysisHelper.findWatershed(evt.geometry).then(() => {
          analysisActions.analyzeCustomArea(evt.geometry);
          AnalysisHelper.performUpstreamAnalysis(evt.geometry);
        });
      });
    }

    analysisActions.toggleDrawToolbar(!this.props.toolbarActive);
  }

  nameChanged (evt) {
    analysisActions.setCustomAreaName(evt.target.value);
  }

  selectAreaTitle () {
    this.refs.customAreaTitle.focus();
    this.refs.customAreaTitle.select();
  }

  render () {
    return (
      <div className={`custom-analysis ${this.props.active ? '' : 'hidden'}`}>
        {!this.props.activeCustomArea ?
          <div>
            <div className={`gfw-btn blue pointer add-point-btn ${this.props.toolbarActive ? 'active' : ''}`} onClick={::this.addPoint}>
              {text.addPointButton}
            </div>
            <div className='custom-analysis-spacer text-center'>or</div>
            <LatLngTool {...this.props} />
          </div>
          :
          <div>
            <div className='custom-area-title relative'>
              <input ref='customAreaTitle' name='customAreaTitle' type='text' placeholder={text.customAreaNamePlaceholder}
                value={this.props.customAreaName} onChange={this.nameChanged} />
              <div className='custom-area-title-edit pointer' onClick={::this.selectAreaTitle}>
                <svg viewBox="0 0 528.899 528.899" dangerouslySetInnerHTML={{ __html: editSvg }}/>
              </div>
            </div>
            <WatershedSummary />
            <WatershedChart id='customAreaChart' feature={this.props.activeCustomArea} />
            <LossFootnote />
            <CustomAnalysisLink />
            <div className='full-report-button gfw-btn blue pointer' onClick={runReport}>{text.fullReportButton}</div>
          </div>
        }
      </div>
    );
  }
}
