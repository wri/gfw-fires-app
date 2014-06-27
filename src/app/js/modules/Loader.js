define(["esri/tasks/query",
        "esri/tasks/QueryTask"
    ],
    function(Query, QueryTask) {

        var o = {};

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