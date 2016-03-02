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

        o.queryDistinct = function(url, fieldname, callback) {
            var query = new Query();
            query.returnGeometry = false;
            query.where = "1=1";
            query.outFields = [fieldname]
            query.returnDistinctValues = true;
            var task = new QueryTask(url);
            task.execute(query, callback);

        }

        o.populatecallback = function(results) {

        }

        o.init_time_selects = function() {
            var today = new Date();
            var oneWeekAgo = new Date();
            oneWeekAgo.setDate(today.getDate() - 7);
            var initial = new Date(2013, 1, 1);
            var years = [];
            for (var i = initial.getFullYear(); i <= today.getFullYear(); i++) {
                years.push(i);
            }
        }

        o.bind_events = function() {
            var aoitype;
            on(dom.byId('report-island-radio'), 'change', function(evt, node) {
                var islands = MapModel.vm.islands();
                MapModel.vm.reportAOIs([]);
                arrayUtil.forEach(islands, function(island) {
                    MapModel.vm.reportAOIs.push(island);
                })
                MapModel.vm.selectedAOIs(['Sumatra']);

            })
            on(dom.byId('report-province-radio'), 'change', function(evt, node) {
                var provinces = MapModel.vm.provinces();
                MapModel.vm.reportAOIs([]);
                arrayUtil.forEach(provinces, function(province) {
                    MapModel.vm.reportAOIs.push(province);
                });
                MapModel.vm.selectedAOIs(['Riau']);

            });

            on(dom.byId('report-launch'), 'click', function() {
                if (dom.byId('report-province-radio').checked) {
                    aoitype = 'PROVINCE';
                } else if (dom.byId('report-island-radio').checked) {
                    aoitype = 'ISLAND';
                }

                var currentDate = $("#firesDateFrom").datepicker("getDate");
                var dateFrom = ("0" + (currentDate.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + currentDate.getDate().toString()).substr(-2) + "/" + (currentDate.getFullYear().toString());
                // var observedDate = new Date(MapModel.vm.firesObservFrom());

                // var observedDate2 = ("0" + (observedDate.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + observedDate.getDate().toString()).substr(-2) + "/" + (observedDate.getFullYear().toString());

                // if (dateFrom != observedDate2) {
                //     observedDate2 = dateFrom;
                // }

                var currentDateTo = $("#firesDateTo").datepicker("getDate");
                var dateTo = ("0" + (currentDateTo.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + currentDateTo.getDate().toString()).substr(-2) + "/" + (currentDateTo.getFullYear().toString());
                // if (dateTo != MapModel.vm.firesObservTo()) {
                //     debugger;
                // }

                //var reportdateFrom = MapModel.vm.firesObservFrom().split("/");
                var reportdateFrom = dateFrom.split("/");
                //var reportdateTo = MapModel.vm.firesObservTo().split("/");
                var reportdateTo = dateTo.split("/");
                var reportdates = {};

                reportdates.fYear = Number(reportdateFrom[2]);
                reportdates.fMonth = Number(reportdateFrom[0]);
                reportdates.fDay = Number(reportdateFrom[1]);
                reportdates.tYear = Number(reportdateTo[2]);
                reportdates.tMonth = Number(reportdateTo[0]);
                reportdates.tDay = Number(reportdateTo[1]);

                var hash = o.report_data_to_hash(aoitype, reportdates, MapModel.vm.selectedAOIs);
                var win = window.open('./app/js/views/report/report.html' + hash, '_blank', '');


                win.report = true;
                win.reportOptions = {
                    'dates': reportdates,
                    'aois': MapModel.vm.selectedAOIs(),
                    'aoitype': aoitype
                };
            })
        }

        o.report_data_to_hash = function(aoitype, dates, aois) {
            var hash = "#",
                dateargs = [],
                datestring,
                aoistring;


            for (var val in dates) {
                if (dates.hasOwnProperty(val)) {
                    dateargs.push([val, dates[val]].join('-'));
                }
            }

            datestring = "dates=" + dateargs.join('!');

            aoistring = "aois=" + aois().join('!');

            hash += ["aoitype=" + aoitype, datestring, aoistring].join("&");
            console.log("HASH STING", hash);
            return hash;
        }

        o.populate_select = function() {
            var self = this;
            var fires = MapConfig.firesLayer
                //self.init_time_selects();
            self.bind_events();
            selaois = MapModel.vm.selectedAOIs;

            var islandresults = function(results) {
                var islands = [];
                arrayUtil.forEach(results.features, function(f) {
                    if (f.attributes.ISLAND != '') {
                        islands.push(f.attributes.ISLAND);
                    }
                })
                MapModel.vm.islands(islands.sort());
                MapModel.vm.reportAOIs(islands);
                MapModel.vm.selectedAOIs(['Sumatra', 'Kalimantan', 'Lesser Sunda', 'Maluku', 'Papua', 'Sulawesi', 'Java']);
            }
            var provinceresults = function(results) {
                var provinces = [];
                arrayUtil.forEach(results.features, function(f) {
                    if (f.attributes.PROVINCE != '') {
                        provinces.push(f.attributes.PROVINCE);
                    }
                })
                MapModel.vm.provinces(provinces.sort());

            }
            var url = "http://gis-potico.wri.org/arcgis/rest/services/Fires/FIRMS_ASEAN/MapServer/7"
            self.queryDistinct(url + "?returnDistinctValues=true",
                fires.report_fields.islands, islandresults
            );
            self.queryDistinct(url + "?returnDistinctValues=true",
                fires.report_fields.provinces, provinceresults
            );

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

        o.reportFromBuble = function() {
            //This function only gets called from the home page's 'View Latest Analysis' bubble and has hard-coded parameters for the past week.
            var aoitype = 'ISLAND';
            var initialAOIs = ['Sumatra', 'Kalimantan', 'Lesser Sunda', 'Maluku', 'Papua', 'Sulawesi', 'Java']

            var date = new Date();

            var dateTo = ("0" + (date.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + date.getDate().toString()).substr(-2) + "/" + (date.getFullYear().toString());

            var date2 = new Date(new Date().setDate(new Date().getDate() - 7));

            var dateFrom = ("0" + (date2.getMonth() + 1).toString()).substr(-2) + "/" + ("0" + date2.getDate().toString()).substr(-2) + "/" + (date2.getFullYear().toString());


            var reportdateFrom = dateFrom.split("/");
            var reportdateTo = dateTo.split("/");
            var reportdates = {};

            reportdates.fYear = Number(reportdateFrom[2]);
            reportdates.fMonth = Number(reportdateFrom[0]);
            reportdates.fDay = Number(reportdateFrom[1]);
            reportdates.tYear = Number(reportdateTo[2]);
            reportdates.tMonth = Number(reportdateTo[0]);
            reportdates.tDay = Number(reportdateTo[1]);
            MapModel.vm.selectedAOIs(['Sumatra', 'Kalimantan', 'Lesser Sunda', 'Maluku', 'Papua', 'Sulawesi', 'Java']);
            var hash = o.report_data_to_hash(aoitype, reportdates, MapModel.vm.selectedAOIs);
            var win = window.open('./app/js/views/report/report.html' + hash, '_blank', '');
            // win.report = true;
            // win.reportOptions = {
            //     'dates': reportdates,
            //     'aois': MapModel.vm.selectedAOIs(),
            //     'aoitype': aoitype
            // };

        }
        //listen to key

        //trigger event

        return o;

    });
