sap.ui.define([
	"sap/ui/core/UIComponent",
	"com/goap/cfms/works/reuselib/componentInit",
	"com/goap/cfms/works/reuselib/WorksDraft",
	"sap/ui/model/json/JSONModel",
	"com/goap/cfms/works/reuselib/HashSync",
	"com/goap/cfms/works/as/model/AppModel",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem"
], function (UIComponent,
	componentInit,
	WorksDraft,
	JSONModel,
	HashSync,
	AppModel,
	MessagePopover,
	MessagePopoverItem) {
		"use strict";

		return UIComponent.extend("com.goap.cfms.works.as.Component", {

			metadata: {
				manifest: "json",
				"config": {
					"fullWidth": true
				}
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * In this function, the FLP and device models are set and the router is initialized.
			 * @public
			 * @override
			 */
			init: function () {
				// call the base component's init function
				UIComponent.prototype.init.apply(this, arguments);
				
				jQuery.sap.includeStyleSheet(jQuery.sap.getModulePath("com.goap.cfms.works.reuselib.css") + "/style.css");
				//Initialize MessageManager
				//this.messageManager = sap.ui.getCore().getMessageManager();

					//Implement Message Manager
				sap.ui.getCore().getMessageManager().registerObject(this, true);
				var oMessageTemplate = new MessagePopoverItem({
					type: "{type}",
					title: "{message}",
					description: "{additionalText} {description} {code} {target}",
					subtitle: "{code}"
				});

				this.oMessagePopover = new MessagePopover({
					showHeader: false,
					items: {
						path: "/",
						template: oMessageTemplate
					}

				});
				
				this.contentDensity = "sapUiSizeCompact";
				
				this.oMessagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel());
				
				this.getModel().attachBatchRequestCompleted(function() {
					sap.ui.getCore().getMessageManager().getMessageModel().fireMessageChange();
				});
				//initialize reused component
				componentInit.init(this);

				// set the app model
				if (sap.ushell) {
					var oAppModel = new AppModel(this.getComponentData().startupParameters);
					this.setModel(oAppModel, "appProperties");
				}
				//attach Draft Object
				this.oDraft = new WorksDraft({
					component: this
				});
				//Initialize App State
				this._initializeAppState();
				// synch the hash BEFORE initializing the router
				var oHashSync = new HashSync({
					component: this,
					message: this.message
				});
				oHashSync.synch();

				
				// create the views based on the url/hash
				this.getRouter().initialize();
				
			/*	if(sap.ui.getCore().getModel("ZWRKGlobalModel") !== undefined){
                	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCanEdit", false);
                	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", false);
                	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/EST/bAddNewEST", false);
				}else{
                	window.location.hash = "#ZWorks-AdminstrativeSanction";
                	this.worksGlobalModel();
                }*/
                
            	
                if (sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/bBrowserRefresh")) {
                	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/SessionGuid", "00000000-0000-0000-0000-000000000000");
                	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bBrowserRefresh", false);
                	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/EST/bBrowserRefresh", false);
                	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCanEdit", false);
	            	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", false);
	            	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/EST/bAddNewEST", false);
	            	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bNavtoAsfromDocFlow", false);
	            
	            	if (this.getComponentData().startupParameters) {
	            		if (!this.getComponentData().startupParameters.Mode) {
	            			window.location.hash = "#ZWorks-AdminstrativeSanction";
	            		}
	            	}
                }
                
               /* if(sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/bBrowserRefresh")){
                	sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/bBrowserRefresh", false);
                	window.location.hash = "#ZWorks-AdminstrativeSanction";
                }else{
                	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCanEdit", false);
	            	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", false);
	            	sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/EST/bAddNewEST", false);
                }*/
			},

			_initializeAppState : function(){
				this.oAppStateModel = new sap.ui.model.json.JSONModel({
					appState : ""
				});
				this.setModel(this.oAppStateModel, "appState");
	
				sap.ushell.Container.getService("CrossApplicationNavigation").getStartupAppState(this).done(function (oStartupAppStateContainer) {
					var data = oStartupAppStateContainer.getData();
					if (data) {
						this.oAppStateModel.setProperty("/appState", data || "");
					}
				}.bind(this));
			},

			destroy: function () {
				componentInit.destroy(this);
				// call the base component's destroy function
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			getContentDensityClass : function() {
				if (!this.contentDensity) {
						this.contentDensity = "sapUiSizeCompact";
					} else {
						this.contentDensity = "sapUiSizeCozy";
					}
				return this.contentDensity;
			},
			
			worksGlobalModel: function(){
				var oData = {
					AS: {},
					TS: {},
					AGR: {},
					EST: {},
					MB: {},
					LF: {},
					Common: {}
				};
				var oGlobalModel = new sap.ui.model.json.JSONModel(oData);
				//this.setModel(oGlobalModel, "zWorksGlobalMModel");
				sap.ui.getCore().setModel(oGlobalModel, "ZWRKGlobalModel");
			}

		});

	});