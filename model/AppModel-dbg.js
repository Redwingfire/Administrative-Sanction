sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (
    JSONModel
) {
    "use strict";

    return JSONModel.extend("com.goap.cfms.works.as.AppModel", {

        constructor : function (startupParams) {

            // create data
            var oData = {
                viewTypeEdit: false
            };

            // call super constructor
            JSONModel.call(this, oData);
        }

    });
});