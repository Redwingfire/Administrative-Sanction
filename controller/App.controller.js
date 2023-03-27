sap.ui.define([
        "com/goap/cfms/works/reuselib/BaseViewController",
        "sap/ui/model/json/JSONModel"
    ], function (BaseController, JSONModel) {
        "use strict";

        return BaseController.extend("com.goap.cfms.works.as.controller.App", {

            onInit: function () {
                BaseController.prototype.onInit.apply(this, arguments);
                var oViewModel,
                    fnSetAppNotBusy,
                    iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

                oViewModel = new JSONModel({
                    busy: true,
                    delay: 0,
                    position: "00000000",
                    DepartDesc: "",
                    InitiatinDept:""
                });
                this.getView().setModel(oViewModel, "appView");
                this.component.setModel(oViewModel, "appView");
                 fnSetAppNotBusy = function () {
                     oViewModel.setProperty("/busy", false);
                     oViewModel.setProperty("/delay", iOriginalBusyDelay);
                 };

                this.model.metadataLoaded().then(fnSetAppNotBusy);
                //this._checkRole();
               
                 //this.contentDensity = "sapUiSizeCompact";
                // apply content density mode to root view
                //this.getView().addStyleClass(this.contentDensity);
            },

		/* =========================================================== */
		/* private functions                                              */
		/* =========================================================== */

		/**
		 * Call to Identify the role of the User
		 * 
		 * @public
		 */            

            /**
            * Private function to check workflow role
             */
            _checkRole: function(){
                var that = this;
                this.component.getModel().callFunction("/GetRole",{
                    method: "GET",
                    urlParameters: {
                        ApplicationId: "AS"
                    },
                    success: function(oResponse, oTe){
                       that.component.getModel("appView").setProperty("/role", oResponse.GetRole.Role);
                    },
                    error: function(oError){
    
                    }
                });
            }
        });
    }
);