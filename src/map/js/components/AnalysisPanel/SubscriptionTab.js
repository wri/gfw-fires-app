import {analysisPanelText, shortTermServices} from 'js/config';
import {mapStore} from 'stores/MapStore';
import scaleUtils from 'esri/geometry/scaleUtils';
import geometryUtils from 'utils/geometryUtils';
import Query from 'esri/tasks/query';
import QueryTask from 'esri/tasks/QueryTask';
import graphicsUtils from 'esri/graphicsUtils';
import {analysisActions} from 'actions/AnalysisActions';
import {modalActions} from 'actions/ModalActions';
import { layerActions } from 'actions/LayerActions';
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
    mapStore.listen(this.storeUpdated.bind(this));
    this.state = {
      dndActive: false,
      loader: false,
      drawButtonActive: false,
      isUploading: false,
      fieldSelectionShown: false,
      showFields: false,
      fields: [],
      graphics: [],
      numberOfViirsPointsInPolygons: 0,
      numberOfModisPointsInPolygons: 0,
      modisTimePeriod: null,
      modisTimePeriodPrefix: null,
      viirsTimePeriod: null,
      viirsTimePeriodPrefix: null,
      modisTimeIndex: mapStore.getState().firesSelectIndex,
      viirsTimeIndex: mapStore.getState().viirsSelectIndex,
      geometryOfDrawnShape: mapStore.getState().geometryOfDrawnShape,
      activeLayers: mapStore.getState().activeLayers,
      viirsStartDate: mapStore.getState().archiveViirsStartDate,
      viirsEndDate: mapStore.getState().archiveViirsEndDate,
      modisStartDate: mapStore.getState().archiveModisStartDate,
      modisEndDate: mapStore.getState().archiveModisEndDate,
      showDrawnMapGraphics: mapStore.getState().showDrawnMapGraphics
    };
  }

  singleViirsQuery(query, url, timePeriod, index, queryGeometry) {
    this.setState({ loader: true });

    const viirsQuery = new QueryTask(url);
    viirsQuery.execute(query).then(res => {
      this.setState({
        numberOfViirsPointsInPolygons: res.features.length,
        viirsTimePeriod: timePeriod,
        viirsTimeIndex: index,
        // geometryOfDrawnShape: queryGeometry,
        loader: false
      });
      // Todo: Update mapstore geometryOfDrawnShape
      layerActions.changeUserUploadedGeometry(queryGeometry);

    });
  }

  singleModisQuery(query, url, timePeriod, index, queryGeometry) {
    this.setState({ loader: true });

    const modisQuery = new QueryTask(url);
    modisQuery.execute(query).then(res => {
      this.setState({
        numberOfModisPointsInPolygons: res.features.length,
        modisTimePeriod: timePeriod,
        modisTimeIndex: index,
        // geometryOfDrawnShape: queryGeometry,
        loader: false
      });
      // Todo: Update mapstore geometryOfDrawnShape
      layerActions.changeUserUploadedGeometry(queryGeometry);
    });
  }

  queryForFires(geometry) {
    const store = mapStore.getState();
    console.log('thisis the geo in the query for fires', geometry);
    // const queryGeometry = geometry === undefined ? this.state.geometryOfDrawnShape : geometry;
    const queryGeometry = geometry === undefined ? store.geometryOfDrawnShape : geometry;

    // Setup a query object for Viirs
    const viirsQuery = new Query();
    viirsQuery.returnGeometry = false;
    viirsQuery.geometry = queryGeometry;

    // Setup a query object for Modis
    const modisQuery = new Query();
    modisQuery.returnGeometry = false;
    modisQuery.geometry = queryGeometry;

    // Setup the time periods for 72 hours
    const today = new window.Kalendae.moment().format('MM/DD/YYYY');
    const threeDaysAgo = new window.Kalendae.moment().subtract(3, 'days').format('MM/DD/YYYY');

    // To determine the Viirs period, we look at the selected index.
    let viirsTimePeriod, viirsTimePeriodPrefix, viirsDate, viirsId;
    if (store.viirsSelectIndex === 4) {
      // If the index is 4, the user is in the calendar mode and selecting a custom range of dates.
      viirsTimePeriodPrefix = 'from ';
      viirsTimePeriod = `${store.archiveViirsStartDate} to ${store.archiveViirsEndDate}.`;
      viirsDate = '1yr';
      viirsQuery.where = `ACQ_DATE <= date'${store.archiveViirsEndDate}' AND ACQ_DATE >= date'${store.archiveViirsStartDate}'`;
      viirsId = shortTermServices.viirs1YR.id;
    } else if (mapStore.state.viirsSelectIndex === 3) {
      viirsTimePeriodPrefix = 'in the ';
      viirsTimePeriod = 'past week.';
      viirsDate = '7d';
      viirsId = shortTermServices.viirs7D.id;
    } else if (mapStore.state.viirsSelectIndex === 2) {
      viirsQuery.where = `ACQ_DATE <= date'${today}' AND ACQ_DATE >= date'${threeDaysAgo}'`;
      viirsTimePeriodPrefix = 'in the ';
      viirsTimePeriod = 'past 72 hours.';
      viirsDate = '7d';
      viirsId = shortTermServices.viirs7D.id;
    } else if (mapStore.state.viirsSelectIndex === 1) {
      viirsTimePeriodPrefix = 'in the ';
      viirsTimePeriod = 'past 48 hours.';
      viirsDate = '48hrs';
      viirsId = shortTermServices.viirs48HR.id;
    } else if (mapStore.state.viirsSelectIndex === 0) {
      viirsTimePeriodPrefix = 'in the ';
      viirsTimePeriod = 'past 24 hours.';
      viirsDate = '24hrs';
      viirsId = shortTermServices.viirs24HR.id;
    }

    const viirsURL = `https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_VIIRS_${viirsDate}/MapServer/${viirsId}`;

    // To determine the Modis period, we look at the selected index.
    let modisTimePeriod, modisTimePeriodPrefix, modisDate, modisID;
    if (store.firesSelectIndex === 4) {
      // If the index is 4, the user is in the calendar mode and selecting a custom range of dates.
      modisTimePeriodPrefix = 'from ';
      modisTimePeriod = `${store.archiveModisStartDate} to ${store.archiveModisEndDate}.`;
      modisDate = '1yr';
      modisQuery.where = `ACQ_DATE <= date'${store.archiveModisEndDate}' AND ACQ_DATE >= date'${store.archiveModisStartDate}'`;
      modisID = shortTermServices.modis1YR.id;
    } else if (mapStore.state.firesSelectIndex === 3) {
      modisTimePeriodPrefix = 'in the ';
      modisTimePeriod = 'past week.';
      modisDate = '7d';
      modisID = shortTermServices.modis7D.id;
    } else if (mapStore.state.firesSelectIndex === 2) {
      modisTimePeriodPrefix = 'in the ';
      modisTimePeriod = 'past 72 hours.';
      modisQuery.where = `ACQ_DATE <= date'${today}' AND ACQ_DATE >= date'${threeDaysAgo}'`;
      modisDate = '7d';
      modisID = shortTermServices.modis7D.id;
    } else if (mapStore.state.firesSelectIndex === 1) {
      modisTimePeriodPrefix = 'in the ';
      modisTimePeriod = 'past 48 hours.';
      modisDate = '48hrs';
      modisID = shortTermServices.modis48HR.id;
    } else if (mapStore.state.firesSelectIndex === 0) {
      modisTimePeriodPrefix = 'in the ';
      modisTimePeriod = 'past 24 hours.';
      modisDate = '24hrs';
      modisID = shortTermServices.modis24HR.id;
    }

    const modisURL = `https://gis-gfw.wri.org/arcgis/rest/services/Fires/FIRMS_Global_MODIS_${modisDate}/MapServer/${modisID}`;

    const viirsQueryTask = new QueryTask(viirsURL);
    const modisQueryTask = new QueryTask(modisURL);

    if (geometry && store.activeLayers.includes('viirsFires') && store.activeLayers.includes('activeFires')) {
      // If both layers on when the initial drawing is made, we want to fire off 2 queries.
      Promise.all([
        viirsQueryTask.execute(viirsQuery),
        modisQueryTask.execute(modisQuery)
      ]).then(res => {
        this.setState({
          viirsTimePeriodPrefix,
          modisTimePeriodPrefix,
          numberOfModisPointsInPolygons: res[1].features.length,
          numberOfViirsPointsInPolygons: res[0].features.length,
          modisTimePeriod: modisTimePeriod,
          viirsTimePeriod: viirsTimePeriod,
          modisTimeIndex: store.firesSelectIndex,
          viirsTimeIndex: store.viirsSelectIndex
        });
        layerActions.changeUserUploadedGeometry(queryGeometry);
      });
    } else if (geometry && store.activeLayers.includes('viirsFires')) {
      // If viirs layer is on and modis layer is off when the initial drawing is made
      this.singleViirsQuery(viirsQuery, viirsURL, viirsTimePeriod, store.viirsSelectIndex, queryGeometry);
    } else if (geometry && store.activeLayers.includes('activeFires')) {
      // If modis layer is on and viirs layer is off when the initial drawing is made, we want to fire off 1 query.
      this.singleModisQuery(modisQuery, modisURL, modisTimePeriod, store.firesSelectIndex, queryGeometry);
    } else if (store.activeLayers.includes('viirsFires') && (store.viirsSelectIndex !== this.state.viirsTimeIndex || (this.state.viirsTimeIndex === 4 && this.state.viirsTimePeriod !== viirsTimePeriod))) {
      // viirs layer on, modis layer off
      this.singleViirsQuery(viirsQuery, viirsURL, viirsTimePeriod, store.viirsSelectIndex, queryGeometry);
    } else if (store.activeLayers.includes('activeFires') && (store.firesSelectIndex !== this.state.modisTimeIndex || (this.state.modisTimeIndex === 4 && this.state.modisTimePeriod !== modisTimePeriod))) {
      // modis layer on, viirs layer off
      this.singleModisQuery(modisQuery, modisURL, modisTimePeriod, store.firesSelectIndex, queryGeometry);
    }

    this.setState({
      viirsTimePeriodPrefix,
      modisTimePeriodPrefix,
      isUploading: false
    });
  }

  storeUpdated () {
    console.log('store updated!');
    const state = mapStore.getState();
    // If a user selects the calendar. Only fire off the query function once the dates have changed.
    if (state.firesSelectIndex === 4 && this.state.modisTimeIndex !== 4) {
      if (state.archiveModisStartDate !== this.state.modisStartDate || state.archiveModisEndDate !== this.state.modisEndDate) {
        this.setState({
          modisStartDate: state.archiveModisStartDate,
          modisEndDate: state.archiveModisEndDate
        });
        this.queryForFires();
      }
    } else if (state.viirsSelectIndex === 4 && this.state.viirsTimeIndex !== 4) {
      if (state.archiveViirsStartDate !== this.state.viirsStartDate || state.archiveViirsEndDate !== this.state.viirsEndDate) {
        this.setState({
          viirsStartDate: state.archiveViirsStartDate,
          viirsEndDate: state.archiveViirsEndDate
        });
        this.queryForFires();
      }
    } else if (this.state.modisTimeIndex === 4 && (state.archiveModisStartDate !== this.state.modisStartDate || state.archiveModisEndDate !== this.state.modisEndDate)) {
      // If the user is changing one of the dates of the modis calendar while still on the calendar.
      this.setState({
        modisStartDate: state.archiveModisStartDate,
        modisEndDate: state.archiveModisEndDate
      });
      this.queryForFires();
    } else if (this.state.viirsTimeIndex === 4 && (state.archiveViirsStartDate !== this.state.viirsStartDate || state.archiveViirsEndDate !== this.state.viirsEndDate)) {
      // If the user is changing one of the dates of the viirs calendar while still on the calendar...
      this.setState({
        viirsStartDate: state.archiveViirsStartDate,
        viirsEndDate: state.archiveViirsEndDate
      });
      this.queryForFires();
    } else if (
      // If the user changed either the Modis or Viirs date, and there is a shape on the map, fire off new queries
      (state.firesSelectIndex !== this.state.modisTimeIndex || // Checks if the modis dates changed
      state.viirsSelectIndex !== this.state.viirsTimeIndex) && // Checks if the viirs dates changed
      (state.activeLayers.includes('activeFires') === true || state.activeLayers.includes('viirsFires') === true) && // Checks if the modis or viirs layers were toggled (and at least one is on)
      state.drawnMapGraphics === true // Checks if a shape has been drawn on the map.
      ) {
      this.queryForFires();
    }

    // If only the activeLayers changed, we update state but don't run new queries.
    if (state.activeLayers !== this.state.activeLayers) {
      this.setState({
        activeLayers: state.activeLayers
      });
    }

    if (state.drawnMapGraphics !== this.state.showDrawnMapGraphics) {
      this.setState({ showDrawnMapGraphics: state.drawnMapGraphics });
    }

    // Update the geometry if it has changed
    if (state.geometryOfDrawnShape !== this.state.geometryOfDrawnShape) {
    this.setState({ geometryOfDrawnShape: state.geometryOfDrawnShape});
    }
  }

  componentWillReceiveProps() {
    if (!toolbar && app.map.loaded) {
      toolbar = new Draw(app.map);
      toolbar.on('draw-complete', (evt) => {
        /******************************************** NOTE ********************************************
          * When a user draws a polygon, we want to capture the following data:
            * The number of Viirs and Modis Fires contained within the polygon
            * The time period which is being displayed for Viirs and Modis.
          * We will query the Viirs and Modis REST endpoints and pass in the geometry of the polygon as the input geometry.
          * We will then save the count of features returned from each query, and save the counts on state.
          * We also save the phrase associated with the time period based on the index selected from the dropdown options.
        ***********************************************************************************************/

        this.queryForFires(evt.geometry);

        modalActions.addCustomFeature();
        toolbar.deactivate();
        this.setState({ drawButtonActive: false });
        if (app.mobile() === false) {
          analysisActions.toggleAnalysisToolsVisibility();
        }
        layerActions.changeUserUploadedGeometry(evt.geometry);
        let graphic = geometryUtils.generateDrawnPolygon(evt.geometry);
        graphic.attributes.Layer = 'custom';
        graphic.attributes.featureName = 'Custom Feature ' + app.map.graphics.graphics.length;
        app.map.graphics.add(graphic);
      });
    }
  }

  draw = () => {
    if (app.map.graphics.graphics.length > 0) {
      app.map.graphics.clear();
    }

    toolbar.activate(Draw.FREEHAND_POLYGON);
    this.setState({ drawButtonActive: true });
    //- If the analysis modal is visible, hide it
    analysisActions.toggleAnalysisToolsVisibility();
  };

  removeDrawing = () => {
    debugger;
    if (app.map.graphics.graphics.length > 0) {
      app.map.graphics.clear();
    }
    layerActions.changeUserUploadedGeometry(null);
    this.setState({ showDrawnMapGraphics: false });
    console.log('???', 'after dispatch');

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

    if (evt.dataTransfer.files.length > 1) {
      console.log('Please upload a single polygon for fire count analysis');
      alert('Please upload a single polygon for fire count analysis');
      return;
    } else {
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
    }
  };

  fieldMap (field) {
    return (
      <div id={field.id} onClick={this.selectField} className='generated-field-row'>{field.name}</div>
    );
  }

  selectField = (evt) => {
    // This is where a user selects the type of name field for their uploaded file. Doing so will fire off a query using the uploaded shape geometry.
    app.map.graphics.clear();
    this.setState({
      showFields: false,
      fieldSelectionShown: false,
      showDrawnMapGraphics: true
    });

    let nameField = evt.target.id;

    const graphicsExtent = graphicsUtils.graphicsExtent(this.state.uploadedGraphics);

    modalActions.addCustomFeature(true);
    app.map.setExtent(graphicsExtent, true);
    this.state.uploadedGraphics.forEach((graphic) => {
      graphic.attributes.Layer = 'custom';
      graphic.attributes.featureName = graphic.attributes[nameField];
      app.map.graphics.add(graphic);
      this.queryForFires(graphic.geometry);
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
    const { numberOfViirsPointsInPolygons, numberOfModisPointsInPolygons, viirsTimePeriod, modisTimePeriod, modisTimePeriodPrefix, viirsTimePeriodPrefix } = this.state;

    return (
      <div id={analysisPanelText.subscriptionTabId} className={`analysis-instructions__draw ${className}`}>
        <p>{analysisPanelText.subscriptionInstructionsOne}</p>
        <Loader active={this.state.loader} />
        <p>{analysisPanelText.subscriptionClick}</p>
          {
            numberOfViirsPointsInPolygons > 0 &&
            this.state.activeLayers.includes('viirsFires') &&
            this.state.showDrawnMapGraphics === true ?
              <p className='analysis-instructions__content'>
                <span className='analysis-instructions__bold'>{numberOfViirsPointsInPolygons}</span>
                <span className='analysis-instructions__viirs-color'>{analysisPanelText.numberOfViirsPointsInPolygons}</span>
                <span>{viirsTimePeriodPrefix}</span>
                <span className='analysis-instructions__bold'>{viirsTimePeriod}</span>
              </p> : null
          }
          {
            numberOfModisPointsInPolygons > 0 &&
            this.state.activeLayers.includes('activeFires') &&
            this.state.showDrawnMapGraphics === true ?
              <p className='analysis-instructions__content'>
                <span className='analysis-instructions__bold'>{numberOfModisPointsInPolygons}</span>
                <span className='analysis-instructions__modis-color'>{analysisPanelText.numberOfModisPointsInPolygons}</span>
                <span>{modisTimePeriodPrefix}</span>
                <span className='analysis-instructions__bold'>{modisTimePeriod}</span>
              </p> : null
          }

          {
            numberOfModisPointsInPolygons > 0 || numberOfViirsPointsInPolygons > 0 &&
            this.state.showDrawnMapGraphics === true ?
              <p style={{ fontSize: '12px'}}>{analysisPanelText.drawingDisclaimer}</p> : null
          }


        <div className='analysis-instructions__draw-icon-container'>
          <svg className='analysis-instructions__draw-icon' dangerouslySetInnerHTML={{ __html: drawSvg }} />
        </div>

        {
          this.state.showDrawnMapGraphics || this.state.geometryOfDrawnShape ?
          <button onClick={this.removeDrawing} className={`gfw-btn blue subscription-draw ${this.state.drawButtonActive ? 'active' : ''}`}>
            {analysisPanelText.subscriptionButtonLabelRemove}
          </button> :
          <button onClick={this.draw} className={`gfw-btn blue subscription-draw ${this.state.drawButtonActive ? 'active' : ''}`}>
            {analysisPanelText.subscriptionButtonLabel}
          </button>
        }

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
