import {analysisPanelText} from 'js/config';
import {DrawSvg} from 'utils/svgs';
import scaleUtils from 'esri/geometry/scaleUtils';
import geometryUtils from 'utils/geometryUtils';
import graphicsUtils from 'esri/graphicsUtils';
import {analysisActions} from 'actions/AnalysisActions';
import {modalActions} from 'actions/ModalActions';
// import keys from 'constants/StringKeys';
import {uploadConfig} from 'js/config';
import Loader from 'components/Loader';
import Draw from 'esri/toolbars/draw';
import request from 'utils/request';

import React from 'react';

const TYPE = {
  ZIP: 'application/zip',
  JSON: 'application/json',
  SHAPEFILE: 'shapefile',
  GEOJSON: 'geojson'
};

const drawSvg = '<use xlink:href="#icon-analysis-draw" />';
const closeSymbolCode = 9660,
    openSymbolCode = 9650;

let toolbar;

export default class SubscriptionTab extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      dndActive: false,
      drawButtonActive: false,
      isUploading: false,
      fieldSelectionShown: false,
      showFields: false,
      fields: [],
      graphics: [],
      numberOfViirsPointsInPolygons: 0,
      numberOfModisPointsInPolygons: 0
    };
  }

  componentWillReceiveProps() {
    // const {map} = this.context;

    if (!toolbar && app.map.loaded) {
      toolbar = new Draw(app.map);
      toolbar.on('draw-end', (evt) => {
        console.log('polygon extent', evt.target.map.extent);

        toolbar.deactivate();
        this.setState({ drawButtonActive: false });
        if (app.mobile() === false) {
          analysisActions.toggleAnalysisToolsVisibility();
        }
        let graphic = geometryUtils.generateDrawnPolygon(evt.geometry);
        graphic.attributes.Layer = 'custom';
        graphic.attributes.featureName = 'Custom Feature ' + app.map.graphics.graphics.length;
        app.map.graphics.add(graphic);
      });
    }
  }

  draw = () => {
    toolbar.activate(Draw.FREEHAND_POLYGON);
    this.setState({ drawButtonActive: true });
    //- If the analysis modal is visible, hide it
    analysisActions.toggleAnalysisToolsVisibility();
    // mapActions.toggleAnalysisModal({ visible: false });
  };

  //- DnD Functions
  prevent = (evt) => {
    evt.preventDefault();
    return false;
  };

  enter = (evt) => {
    this.prevent(evt);
    this.setState({ dndActive: true });
  };

  leave = (evt) => {
    this.prevent(evt);
    this.setState({ dndActive: false });
  };

  drop = (evt) => {
    evt.preventDefault();
    const file = evt.dataTransfer &&
                 evt.dataTransfer.files &&
                 evt.dataTransfer.files[0];

    if (!file) {
      return;
    }

    //- Update the view
    this.setState({
      dndActive: false,
      isUploading: true
    });

    //- If the analysis modal is visible, hide it
    // mapActions.toggleAnalysisModal({ visible: false });

    const extent = scaleUtils.getExtentForScale(app.map, 40000);
    // const type = file.type === TYPE.ZIP ? TYPE.SHAPEFILE : TYPE.GEOJSON;
    const type = TYPE.SHAPEFILE;
    const params = uploadConfig.shapefileParams(file.name, app.map.spatialReference, extent.getWidth(), app.map.width);
    const content = uploadConfig.shapefileContent(JSON.stringify(params), type);

    // the upload input needs to have the file associated to it
    let input = this.refs.fileInput;
    input.files = evt.dataTransfer.files;

    request.upload(uploadConfig.portal, content, this.refs.upload).then((response) => {
      if (response.featureCollection) {
        const graphics = geometryUtils.generatePolygonsFromUpload(response.featureCollection);
        // const graphicsExtent = graphicsUtils.graphicsExtent(graphics);
        let uploadedFeats = [];

        response.featureCollection.layers[0].layerDefinition.fields.forEach((field) => {
            uploadedFeats.push({
                name: field.name,
                id: field.alias
            });
        });

        this.setState({
          isUploading: false,
          fieldSelectionShown: true,
          fields: uploadedFeats,
          uploadedGraphics: graphics
        });

      } else {
        this.setState({
          fieldSelectionShown: false,
          isUploading: false
        });
        console.error('No feature collection present in the file');
      }
    }, (error) => {
      this.setState({
        isUploading: false,
        fieldSelectionShown: false
      });
      console.error(error);
    });

  };

  fieldMap (field) {
    return (
      <div id={field.id} onClick={this.selectField} className='generated-field-row'>{field.name}</div>
    );
  }

  selectField = (evt) => {
    this.setState({
      showFields: false,
      fieldSelectionShown: false
    });

    let nameField = evt.target.id;

    const graphicsExtent = graphicsUtils.graphicsExtent(this.state.uploadedGraphics);

    app.map.setExtent(graphicsExtent, true);
    this.state.uploadedGraphics.forEach((graphic) => {
      graphic.attributes.Layer = 'custom';
      graphic.attributes.featureName = graphic.attributes[nameField];
      app.map.graphics.add(graphic);
    });
  }

  toggleFields = () => {
    this.setState({
      showFields: !this.state.showFields
    });
  }

  render () {
    let className = ' text-center';
    if (this.props.activeTab !== analysisPanelText.subscriptionTabId) { className += ' hidden'; }
    const { numberOfViirsPointsInPolygons, numberOfModisPointsInPolygons } = this.state;
    return (
      <div id={analysisPanelText.subscriptionTabId} className={`analysis-instructions__draw ${className}`}>
        <p>{analysisPanelText.subscriptionInstructionsOne}
          <span className='subscribe-link' onClick={this.signUp}>{analysisPanelText.subscriptionInstructionsTwo}</span>
          {analysisPanelText.subscriptionInstructionsThree}
        </p>
        <p>{analysisPanelText.subscriptionClick}</p>
        <p>{numberOfViirsPointsInPolygons > 0 ? `${numberOfViirsPointsInPolygons} ${analysisPanelText.numberOfViirsPointsInPolygons}` : ''}</p>
        <p>{numberOfModisPointsInPolygons > 0 ? `${numberOfModisPointsInPolygons} ${analysisPanelText.numberOfModisPointsInPolygons}` : ''}</p>

        <div className='analysis-instructions__draw-icon-container'>
          <svg className='analysis-instructions__draw-icon' dangerouslySetInnerHTML={{ __html: drawSvg }} />
        </div>
        <button onClick={this.draw} className={`gfw-btn blue subscription-draw ${this.state.drawButtonActive ? 'active' : ''}`}>{analysisPanelText.subscriptionButtonLabel}</button>

        <div id='upload-fields-input' className={`subscription-field-container ${this.state.fieldSelectionShown ? '' : ' hidden'}`}>
          <span className='upload-fields-label'>Choose name field </span><span onClick={this.toggleFields} className='layer-category-caret red'>{String.fromCharCode(!this.state.showFields ? closeSymbolCode : openSymbolCode)}</span>
          <div className={`subscription-field-select ${this.state.showFields ? '' : ' hidden'}`}>
            {this.state.fields.map(this.fieldMap, this)}
          </div>
        </div>

        <form
          className={`analysis-instructions__upload-container ${app.mobile() ? 'hidden ' : ''}${this.state.dndActive ? 'active' : ''}`}
          encType='multipart/form-data'
          onDragEnter={this.enter}
          onDragLeave={this.leave}
          onDragOver={this.prevent}
          onDrop={this.drop}
          name='upload'
          ref='upload'
          >
          <Loader active={this.state.isUploading} />
          <span className='analysis-instructions__upload'>
            {analysisPanelText.subscriptionShapefile}
          </span>

          <input type='file' name='file' ref='fileInput' />
          <input type='hidden' name='publishParameters' value='{}' />
					<input type='hidden' name='filetype' value='shapefile' />
					<input type='hidden' name='f' value='json' />
        </form>
      </div>
    );
  }

  signUp () {
    modalActions.showSubscribeModal();
  }

}
