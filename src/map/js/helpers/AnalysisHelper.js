import GraphicsHelper from 'helpers/GraphicsHelper';
import Deferred from 'dojo/Deferred';
import Request from 'utils/request';
import {errors} from 'js/config';

const AnalysisHelper = {

  findWatershed: pointGeometry => {
    app.debug('AnalysisActions >>> findWatershed');
    let deferred = new Deferred();
    Request.getWatershedByGeometry(pointGeometry).then(feature => {
      if (feature) {
        deferred.resolve(feature);
        app.map.setExtent(feature.geometry.getExtent(), true);
      } else {
        deferred.reject(errors.featureNotFound);
      }
    }, err => {
      console.error(err);
      deferred.reject(err);
    });
    return deferred;
  },

  performUpstreamAnalysis: geometry => {
    Request.getUpstreamAnalysis(geometry).then(dataValue => {
      dataValue.features.forEach(feature => {
        GraphicsHelper.addUpstreamGraphic(feature);
      });
    }, console.error);
  }

};

export { AnalysisHelper as default };
