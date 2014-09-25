define([
        "dojo/on",
        "dojo/dom",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
        "views/map/MapConfig",
        "views/map/MapModel",
        "dojo/_base/array"
    ],
    function(on, dom, Query, QueryTask, MapConfig, MapModel, arrayUtil) {

        var o = {};

        o.queryDistinct = function(url,fieldname,callback){
            var query = new Query();
            query.returnGeometry = false;
            query.where = "OBJECTID < 700";
            // query.outFields = ['*'];
            //query.returnGeometry = false;
            //query.where = '1=1';
            query.outFields = [fieldname]
            query.returnDistinctValues = true;
            var task = new QueryTask(url);
            task.execute(query,callback)
        }

        o.populatecallback = function(results){

        }

        o.init_time_selects = function(){
            console.log("TIME SELECTS")
            var today = new Date();
            console.log("TODAY",today)
            var yesterday = new Date(today.getFullYear()-1,today.getMonth()-1,today.getDay()-1);
            console.log(yesterday);
            var initial = new Date(2013, 1,1);
            var years = [];
            for (var i = initial.getFullYear();i<=today.getFullYear();i++){
                years.push(i);
            }
            var months = [];
            for (var i = 1;i<=12;i++){
                months.push(i);
            }
            MapModel.vm.fromYear(years);
            MapModel.vm.dateVals().fYear(years[0]);
            MapModel.vm.toYear(years);
            MapModel.vm.dateVals().tYear(years[0]);
            MapModel.vm.fromMonth(months);
        }

        o.bind_events = function (){
            var aoitype;
            on(dom.byId('report-island-radio'),'change',function(evt,node){
                MapModel.vm.reportAOIs(MapModel.vm.islands());
            })
            on(dom.byId('report-province-radio'),'change',function(evt,node){
                MapModel.vm.reportAOIs(MapModel.vm.provinces());

            })
            on(dom.byId('report-launch'),'click',function(){
                var win = window.open('./app/js/views/report/report.html', 'Report', '');
                var dates = MapModel.vm.dateVals();
                console.log("datevals",dates);
                win.report = true;

                var reportdates = {};
                for (var val in dates){
                    if (dates.hasOwnProperty(val)){
                        reportdates[val] = dates[val]();
                    }
                }
                console.log("report dates",reportdates)
                if (dom.byId('report-province-radio').checked){
                        aoitype = 'PROVINCE';
                }
                else if (dom.byId('report-island-radio').checked){
                        aoitype = 'ISLAND';
                }
                win.reportOptions = {'dates':reportdates, 'aois':MapModel.vm.selectedAOIs(), 'aoitype':aoitype};
            })
        }

        o.populate_select = function (){
            var self = this;
            var fires = MapConfig.firesLayer
            self.init_time_selects();
            self.bind_events();
            selaois = MapModel.vm.selectedAOIs;
            var islandresults = function(results){
                console.log("ISLAND RESULTS",results);
                var islands = [];
                arrayUtil.forEach(results.features,function(f){
                    islands.push(f.attributes.ISLAND);
                })
                MapModel.vm.islands(islands);
                MapModel.vm.reportAOIs(islands);
            }
            var provinceresults = function(results){
                console.log("PROVINCE RESULTS",results);
                var provinces = [];
                arrayUtil.forEach(results.features,function(f){
                    provinces.push(f.attributes.PROVINCE);
                })
                MapModel.vm.provinces(provinces);

            }
            var url = "http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN_staging/MapServer/0"
            self.queryDistinct(url+ "?returnDistinctValues=true",
                    fires.report_fields.islands,islandresults
                )
            self.queryDistinct(url+ "?returnDistinctValues=true",
                    fires.report_fields.provinces,provinceresults
                )
            
        }

        o.query = function(props) {

            var layer = props.layer;
            var where = props.where || "1=1";
            var returnGeometry = props.returnGeometry || false;
            var outFields = props.outFields || ["*"];
            var type = props.type || "execute";

            var queryTask = new QueryTask(layer)

            var query = new Query();
            query.where = where; //"ACQ_DATE > date '" + dateString + "'";
            query.returnGeometry = returnGeometry; // false;
            query.outFields = outFields; //["peat"];
            query.getCount

            var deferred = eval("queryTask." + type + "(query)");

            return deferred;

        }

        //listen to key

        //trigger event 



        return o;


    });