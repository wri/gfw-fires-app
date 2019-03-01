import DraggableModalWrapper from 'components/Modals/DraggableModalWrapper';
import { mapActions } from 'actions/MapActions';
import React, { Component, PropTypes } from 'react';
import ImageryDatePicker from 'components/AnalysisPanel/ImageryDatePicker';
import ScreenPoint from 'esri/geometry/ScreenPoint';
import Loader from 'components/Loader';
import GFWImageryLayer from 'js/layers/GFWImageryLayer';
import { AlertsSvg } from 'utils/svgs';
import Graphic from 'esri/graphic';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Polygon from 'esri/geometry/Polygon';
import symbols from 'utils/symbols';
import KEYS from 'js/constants';

import ProjectParameters from 'esri/tasks/ProjectParameters';
import GeometryService from 'esri/tasks/GeometryService';
import SpatialReference from 'esri/SpatialReference';
import { modalText } from 'js/config';


import on from 'dojo/on';

export default class ImageryModal extends Component {

  //  static contextTypes = {
  //   map: PropTypes.object.isRequired
  // };

  constructor(props) {
    super(props);
    this.state = {
      monthsVal: modalText.imagery.monthsOptions[1].label,
      imageStyleVal: modalText.imagery.imageStyleOptions[0].label,
      cloudScore: [0, 25],
      // start: null,
      // end: null,
      selectedThumb: null,
      hoveredThumb: null,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // When panning while modal is open, we want to update selectedThumb state if no imagery is there
    if (prevProps.selectedImagery && !this.props.selectedImagery) {
      this.setState({ selectedThumb: null });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.imageryModalVisible && !this.props.imageryModalVisible && !nextProps.imageryData.length) {
      this.updateImagery();
    }
    // Load first tile in imageryData array only if the tile_url does not equal the tile_url from the previous props.
    // or if this the first time the imagery data array has length.
    if ((nextProps.imageryData.length &&
    nextProps.imageryData[0] &&
    this.props.imageryData[0] &&
    nextProps.imageryData[0].attributes.tile_url !== this.props.imageryData[0].attributes.tile_url) ||
    (nextProps.imageryData.length && !this.props.imageryData.length)) {
      // filterImagery data based on the selected cloud score.
      const filteredImageryData = nextProps.imageryData.filter((data) => {
        return data.attributes.cloud_score >= this.state.cloudScore[0] && data.attributes.cloud_score <= this.state.cloudScore[1];
      });
      // Select first tile in the filteredImageryData array to display.
      if (filteredImageryData[0]) {
        // this.selectThumbnail(filteredImageryData[0], 0);
      }
    }
  }

  selectThumbnail(tileObj, i) {
    const map = app.map;
    let imageryLayer = map.getLayer(KEYS.RECENT_IMAGERY);

    if (imageryLayer) {
      imageryLayer.setUrl(tileObj.tileUrl || tileObj.attributes.tile_url);
    } else {
      const options = {
        id: KEYS.RECENT_IMAGERY,
        url: tileObj.tileUrl || tileObj.attributes.tile_url,
        visible: true
      };

      imageryLayer = new GFWImageryLayer(options);
      map.addLayer(imageryLayer);
      map.reorderLayer(KEYS.RECENT_IMAGERY, 1); // Should be underneath all other layers
      imageryLayer._extentChanged();
    }

    this.setState({ selectedThumb: { index: i, tileObj } });
    // setTimeout(() => mapActions.setSelectedImagery(tileObj), 1000);
    mapActions.setSelectedImagery(tileObj);

    // Add graphic to the map for hover effect on tile.
    let imageryGraphicsLayer = map.getLayer('imageryGraphicsLayer');

    if (imageryGraphicsLayer) {
      imageryGraphicsLayer.clear();
    } else {
      imageryGraphicsLayer = new GraphicsLayer({
        id: 'imageryGraphicsLayer',
        visible: true
      });
      map.addLayer(imageryGraphicsLayer);

      imageryGraphicsLayer.on('mouse-out', () => {
        mapActions.setImageryHoverInfo({ visible: false });
      });

      imageryGraphicsLayer.on('mouse-move', (evt) => {
        if (imageryGraphicsLayer.graphics.length) {
          mapActions.setImageryHoverInfo({ visible: true, top: evt.clientY, left: evt.clientX });
        }
      });

    }

    const geometry = new Polygon({ rings: [tileObj.attributes.bbox.geometry.coordinates], type: 'polygon' });
    const registeredGraphic = new Graphic(
      new Polygon(geometry),
      symbols.getImagerySymbol()
    );
    const geometryService = new GeometryService('https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer');
    var params = new ProjectParameters();

    // // Set the projection of the geometry for the image server
    params.outSR = new SpatialReference(102100);
    params.geometries = [geometry];

    // // update the graphics geometry with the new projected geometry
    const successfullyProjected = (geometries) => {
      registeredGraphic.geometry = geometries[0];
      imageryGraphicsLayer.add(registeredGraphic);
    };
    const failedToProject = (err) => {
      console.log('Failed to project the geometry: ', err);
    };
    geometryService.project(params).then(successfullyProjected, failedToProject);

  }

  hoverThumbnail(tileObj) {
    this.setState({ hoveredThumb: tileObj });
  }

  renderDropdownOptions = (option, index) => {
    return <option key={index} value={option.label}>{option.label}</option>;
  }

  renderThumbnails = (tileObj, i) => {

    let reloadCount = 0;

    const handleError = (event) => {
      if (reloadCount < 20) {
        event.persist();
        event.target.src = '';
        reloadCount++;
        setTimeout(() => {
          event.target.src = tileObj.thumbUrl;
          event.target.classList.remove('hidden');
        }, 1000);
      } else {
        event.target.classList.add('hidden');
      }
    };
    if (!tileObj.tileUrl) {
      return (
        <div
          className='thumbnail disabled'
          key={`thumb-${i}`}>
            <Loader active={this.props.loadingImagery} type={'imagery'} />
            {!this.props.loadingImagery && <div className='imagery-alert-thumb'><AlertsSvg /></div>}
        </div>
      );
    } else {
      return (
        <div
          onClick={() => this.selectThumbnail(tileObj, i)}
          onMouseEnter={() => this.hoverThumbnail(tileObj)}
          onMouseLeave={() => this.hoverThumbnail(null)}
          className={`thumbnail ${this.state.selectedThumb && this.state.selectedThumb.index === i ? 'selected' : ''}`}
          key={`thumb-${i}`}>
          <img src={tileObj.thumbUrl} onError={handleError} />
        </div>
      );
    }
  }

  renderThumbText = () => {
    const { hoveredThumb, selectedThumb } = this.state;

    const thumbnailText = hoveredThumb || selectedThumb.tileObj;

    return (
      <div>
        <p>{window.Kalendae.moment(thumbnailText.attributes.date_time).format('DD MMM YYYY')}</p>
        <p>{`${thumbnailText.attributes.cloud_score.toFixed(0)}% cloud coverage`}</p>
        <p>{thumbnailText.attributes.instrument.replace('_', ' ')}</p>
      </div>
    );
  };

  close = () => {
    mapActions.toggleImageryVisible(false);
  };

  onChangeStart = (event) => {
    if (event.currentTarget.dataset.type === 'cloudMin') {
      const cloudScoreCloned = [...this.state.cloudScore];
      if (Number(event.target.value) > cloudScoreCloned[1]) {
        cloudScoreCloned.splice(0, 1);
        cloudScoreCloned.push(Number(event.target.value));
      } else {
        cloudScoreCloned[0] = Number(event.target.value);
      }
      this.setState({ cloudScore: cloudScoreCloned }, this.updateImagery);
    } else if (event.currentTarget.dataset.type === 'cloudMax') {
      const cloudScoreCloned = [...this.state.cloudScore];
      if (Number(event.target.value) < cloudScoreCloned[0]) {
        cloudScoreCloned.splice(1, 1);
        cloudScoreCloned.unshift(Number(event.target.value));
      } else {
        cloudScoreCloned[1] = Number(event.target.value);
      }
      this.setState({ cloudScore: cloudScoreCloned }, this.updateImagery);
    } else {
      const value = parseInt(event.target.value.split(' ')[0]);
      const type = value === 4 ? 'weeks' : 'months';

      const end = this.state.end ? window.Kalendae.moment(this.state.end) : window.Kalendae.moment();
      const start = end.subtract(value, type).format('YYYY-MM-DD');

      this.setState({ start, monthsVal: event.target.value, selectedThumb: null }, this.updateImagery);
    }
  }

  //  onChangeEnd = (end) => {
  //   this.setState({ end, selectedThumb: null }, this.updateImagery);
  // }

  onChangeImageStyle = (event) => {
    const value = event.target.value;
    this.setState({ imageStyleVal: value, selectedThumb: null }, this.updateImagery);
  }

  //  rangeSliderCallback = (range) => {
  //   this.setState({ cloudScore: range, selectedThumb: null });
  // }


  // onDragEnd = (event) => {
  //   event.target.style.top = event.clientY;
  //   event.target.style.left = event.clientX;
  // };

  updateImagery = () => {
    const map = app.map;

    if (map.toMap === undefined) { return; }

    const { start, end, imageStyleVal } = this.state;

    const xVal = window.innerWidth / 2;
    const yVal = window.innerHeight / 2;

    // Create new screen point at center;
    const screenPt = new ScreenPoint(xVal, yVal);

    // Convert screen point to map point and zoom to point;
    const mapPt = map.toMap(screenPt);
    // Note: Lat and lon are intentionally reversed until imagery api is fixed.
    // The imagery API only returns the correct image for that lat/lon if they are reversed.
    const lon = mapPt.getLatitude();
    const lat = mapPt.getLongitude();

    const params = { lat, lon, start, end };

    if (imageStyleVal === 'Vegetation Health') {
      params.bands = '[B8,B11,B2]';
    }
    if (map.getZoom() < 8) {
      map.setZoom(8);
    }
    mapActions.getSatelliteImagery(params);

    //Reset state
    this.setState({
      selectedThumb: null,
      hoveredThumb: null
    });
  };

  render() {
    const { monthsVal, imageStyleVal, cloudScore, hoveredThumb, selectedThumb } = this.state;
    const { imageryData, loadingImagery, imageryError } = this.props;
    const filteredImageryData = imageryData.filter((data) => {
      return data.attributes.cloud_score >= cloudScore[0] && data.attributes.cloud_score <= cloudScore[1];
    });
    return (
      <DraggableModalWrapper onClose={this.close} onDragEnd={this.onDragEnd}>
        <div className='imagery-modal__wrapper'>
          <div className='imagery-modal__title'>Recent Hi-Res Satellite Imagery</div>
          <div className='imagery-modal__section filters flex'>
            <div className='imagery-modal__item'>
              <div className='imagery-modal_section-title'>Aquisition Date</div>
              <div className='flex'>
                <div className='relative'>
                  <select
                    data-type='date'
                    value={monthsVal}
                    onChange={this.onChangeStart}>
                    {modalText.imagery.monthsOptions.map(this.renderDropdownOptions)}
                  </select>
                  <div className='gfw-btn sml white pointer'>{monthsVal}</div>
                </div>

                <div className='imagery-modal_section-text'>before</div>

                <ImageryDatePicker
                  minDate={'2012-01-01'}
                  calendarCallback={this.onChangeEnd} />
              </div>
            </div>
            <div className='imagery-modal__item'>
              <div className='imagery-modal_section-title'>Maximum Cloud Cover Percentage</div>
              <div className='flex'>
                <div className='imagery-modal_section-text'>Min</div>
                <div className='relative'>
                  <select
                    data-type='cloudMin'
                    value={cloudScore[0]}
                    onChange={this.onChangeStart}>
                    {modalText.imagery.cloudCoverageOptions.map(this.renderDropdownOptions)}
                  </select>
                  <div className='gfw-btn sml white pointer'>{cloudScore[0]}</div>
                </div>
                <div className='imagery-modal_section-text'>Max</div>
                <div className='relative'>
                  <select
                    data-type='cloudMax'
                    value={cloudScore[1]}
                    onChange={this.onChangeStart}>
                    {modalText.imagery.cloudCoverageOptions.map(this.renderDropdownOptions)}
                  </select>
                  <div className='gfw-btn sml white pointer'>{cloudScore[1]}</div>
                </div>
              </div>
              {/* <ImageryModalSlider
                rangeSliderCallback={this.rangeSliderCallback}
                bounds={[0, 100]}
                initialStartValue={0}
                initialEndValue={25}
                step={25} /> */}
            </div>
          </div>
          <hr />

          <div className='imagery-modal__section flex secondary-filters'>
            <div className='thumbnail-text'>
              {hoveredThumb || selectedThumb ? this.renderThumbText() : null}
            </div>
            <div className='relative'>
              <select
                value={imageStyleVal}
                onChange={this.onChangeImageStyle}>
                {modalText.imagery.imageStyleOptions.map(this.renderDropdownOptions)}
              </select>
              <div className='gfw-btn sml white pointer'>{imageStyleVal}</div>
            </div>
          </div>
          <div className='imagery-modal__section thumbnail_container flex'>
            {imageryError &&
              <div className='imagery-modal__error'>
                <div className='imagery-alert-thumb'><AlertsSvg /></div>
                <p>Error loading recent imagery.</p>
              </div>
            }
            <Loader active={loadingImagery && !filteredImageryData.length} type={'imagery-modal-width'} />
            {!loadingImagery && !filteredImageryData.length &&
              <div className='imagery-modal__error'>
                <p>No results match the selected critria.</p>
              </div>
            }
            {filteredImageryData.map(this.renderThumbnails.bind(this))}
          </div>
        </div>
      </DraggableModalWrapper >
    );
  }
}
