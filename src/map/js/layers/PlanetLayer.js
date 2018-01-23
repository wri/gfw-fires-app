import TileCanvasLayer from './EsriTileCanvasBase';
import declare from 'dojo/_base/declare';

export default declare('PlanetLayer', [TileCanvasLayer], {
    filter: function (data) {
        return data;
    }
});
