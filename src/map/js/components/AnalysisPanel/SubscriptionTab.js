import {analysisPanelText} from 'js/config';
import {mapStore} from 'stores/MapStore';
import scaleUtils from 'esri/geometry/scaleUtils';
import geometryUtils from 'utils/geometryUtils';
import Query from 'esri/tasks/query';
import QueryTask from 'esri/tasks/QueryTask';
import graphicsUtils from 'esri/graphicsUtils';
import {analysisActions} from 'actions/AnalysisActions';
import {modalActions} from 'actions/ModalActions';
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
      numberOfModisPointsInPolygons: 0,
      modisTimePeriod: null,
      viirsTimePeriod: null
    };
  }

  componentWillReceiveProps() {
    // const {map} = this.context;

    if (!toolbar && app.map.loaded) {
      toolbar = new Draw(app.map);
      toolbar.on('draw-end', (evt) => {
        /******************************************** NOTE ********************************************
          * When a user draws a polygon, we want to capture the following data:
            * The number of Viirs and Modis Fires contained within the polygon
            * The time period which is being displayed for Viirs and Modis.
          * We will query the Viirs and Modis REST endpoints and pass in the geometry of the polygon as the input geometry.
          * We will then save the count of features returned from each query, and save the counts on state.
          * We also save the phrase associated with the time period based on the index selected from the dropdown options.
        ***********************************************************************************************/

        // Run a new query
        const query = new Query();
        query.geometry = evt.geometry;
        query.returnGeometry = false;

        const viirsQuery = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS_24hrs/MapServer/21');
        const modisQuery = new QueryTask('https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS_24hrs/MapServer/21');
        Promise.all([
          viirsQuery.execute(query),
          modisQuery.execute(query)
        ]).then(res => {
          console.log('store', mapStore.state);

          // To determine the Viirs period, we look at the selected index.
          let viirsTimePeriod;
          if (mapStore.state.viirsSelectIndex === 4) {
            // If the index is 4, the user is in the calendar mode and selecting a custom range of dates.
            viirsTimePeriod = `from ${mapStore.state.archiveViirsStartDate} to ${mapStore.state.archiveViirsEndDate}.`;
          } else if (mapStore.state.viirsSelectIndex === 3) {
            viirsTimePeriod = 'in the past week.';
          } else if (mapStore.state.viirsSelectIndex === 2) {
            viirsTimePeriod = 'in the past 72 hours.';
          } else if (mapStore.state.viirsSelectIndex === 1) {
            viirsTimePeriod = 'in the past 48 hours.';
          } else if (mapStore.state.viirsSelectIndex === 0) {
            viirsTimePeriod = 'in the past 24 hours.';
          }

          // To determine the Modis period, we look at the selected index.
          let modisTimePeriod;
          if (mapStore.state.firesSelectIndex === 4) {
            // If the index is 4, the user is in the calendar mode and selecting a custom range of dates.
            modisTimePeriod = `from ${mapStore.state.archiveModisStartDate} to ${mapStore.state.archiveModisEndDate}.`;
          } else if (mapStore.state.firesSelectIndex === 3) {
            modisTimePeriod = 'in the past week.';
          } else if (mapStore.state.firesSelectIndex === 2) {
            modisTimePeriod = 'in the past 72 hours.';
          } else if (mapStore.state.firesSelectIndex === 1) {
            modisTimePeriod = 'in the past 48 hours.';
          } else if (mapStore.state.firesSelectIndex === 0) {
            modisTimePeriod = 'in the past 24 hours.';
          }

          this.setState({
            numberOfModisPointsInPolygons: res[1].features.length,
            numberOfViirsPointsInPolygons: res[0].features.length,
            modisTimePeriod: modisTimePeriod,
            viirsTimePeriod: viirsTimePeriod
          });
        });
        // setLayerDefs on the dynamic map image layer to the query for modis/viirs.
        // assign the counts with .length;

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

    const extent = scaleUtils.getExtentForScale(app.map, 40000);

    const type = TYPE.SHAPEFILE;
    const params = uploadConfig.shapefileParams(file.name, app.map.spatialReference, extent.getWidth(), app.map.width);
    const content = uploadConfig.shapefileContent(JSON.stringify(params), type);

    // the upload input needs to have the file associated to it
    let input = this.refs.fileInput;
    input.files = evt.dataTransfer.files;

    request.upload(uploadConfig.portal, content, this.refs.upload).then((response) => {
      if (response.featureCollection) {
        const graphics = geometryUtils.generatePolygonsFromUpload(response.featureCollection);

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
    const { numberOfViirsPointsInPolygons, numberOfModisPointsInPolygons, viirsTimePeriod, modisTimePeriod } = this.state;
    return (
      <div id={analysisPanelText.subscriptionTabId} className={`analysis-instructions__draw ${className}`}>
        <p>{analysisPanelText.subscriptionInstructionsOne}
          <span className='subscribe-link' onClick={this.signUp}>{analysisPanelText.subscriptionInstructionsTwo}</span>
          {analysisPanelText.subscriptionInstructionsThree}
        </p>
        <p>{analysisPanelText.subscriptionClick}</p>
        <p>{numberOfViirsPointsInPolygons > 0 && mapStore.state.activeLayers.includes('viirsFires') ? `${numberOfViirsPointsInPolygons} ${analysisPanelText.numberOfViirsPointsInPolygons} ${viirsTimePeriod}` : ''}</p>
        <p>{numberOfModisPointsInPolygons > 0 && mapStore.state.activeLayers.includes('activeFires') ? `${numberOfModisPointsInPolygons} ${analysisPanelText.numberOfModisPointsInPolygons} ${modisTimePeriod}` : ''}</p>

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
