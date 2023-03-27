sap.ui.define([
        "com/goap/cfms/works/reuselib/BaseViewController",
        "sap/m/InstanceManager"
    ], function (BaseController, InstanceManager) {
        "use strict";

        return BaseController.extend("com.goap.cfms.works.as.controller.NotFound", {

            onInit: function () {
                BaseController.prototype.onInit.apply(this, arguments);

                // register on display events
                var oTarget = this.router.getTarget("notFound");
                oTarget.attachDisplay(this.onDisplay.bind(this));
            },

            onDisplay: function (oEvent) {

                // set message on UI
                var oData = oEvent.getParameter("data");
                this.byId("page").setText(oData.message);

                // close potential "not found" dialogs for errors from server
                // (after UI5 has openend them)
                setTimeout(function () {
                    InstanceManager.closeAllDialogs();
                }, 0);
            }


        });

    }
);