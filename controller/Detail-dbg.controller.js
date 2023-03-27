var that;
var myObj;
// var myObj;

var strHash;
var signerName;
var offset;
var signerCert;
var outfile;
var resellerCode = 75;
var filecontent = "";
var pdf_data = "JVBERY=";
/*eslint-disable */
//eslint-disable-sap-no-hardcoded-url
var serverUrl = "https://202.65.131.15:8443/sign";
/*eslint-enable */
sap.ui.define([
	"com/goap/cfms/works/reuselib/WorksBaseController",
	"com/goap/cfms/works/reuselib/DynamicBusyIndicator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"com/goap/cfms/works/reuselib/VHDialog.controller",
	"sap/m/UploadCollectionParameter",
	"sap/m/MessageToast",
	"com/goap/cfms/works/as/model/formatter",
	"sap/m/Token",
	"sap/m/MessageBox",
	"sap/m/TablePersoController",
	"com/goap/cfms/works/as/Digital_Sign/ds2min"
], function(BaseController, DynamicBusyIndicator, JSONModel, Filter, FilterOperator, Sorter, VHDialog,
	UploadCollectionParameter, MessageToast, formatter,
	Token, MessageBox, TablePersoController, ds2min) {
	"use strict";

	return BaseController.extend("com.goap.cfms.works.as.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Lifecycle method to instantiate Detail controller and bind view
		 */
		onInit: function() {
			//Initializing the DS2min
			/*eslint-disable */
			//eslint-disable-no-undef
			myObj = _elk_desksignObj;
			/*eslint-enable */
			myObj._elk_initialize(this.mycallback, this);
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				SrcDDOTableRowCount: 0,
				DDOTableRowCount: 0,
				ESTTableRowCount: 0,
				stateId: "D",
				ObjectTitle: "Display",
				busy: true,
				delay: 0,
				bUAVisible: false,
				Migrated: false,
				bOwnDCW: true,
				bPicCodeVisible: false,
				ApproveBtnVisibility: false,
				ReturnBtnVisibility: false,
				OnholdBtnVisibility: false,
				NextBtnVisibility: false,
				SubmitBtnVisibility: false,
				oToDayDate: new Date(),
				lineItemListTitle: this.getResourceBundle().getText("detail.lineitem.table.heading"),
				WorkLog: [],
				UserNotes: [],
				Notingstring: "",
				addNotingstring: "",
				Notingid: "CREATE",
				addNotePagent: "",
				Pagent: "",
				WfRole: "",
				bIsSecratary: false,
				goDateValueState: "None",
				secCodeValueState: "None",
				GoNumValueState: "None",
				goDateValueStateText: "",
				secCodeValueStateText: "",
				GoNumValueStateText: "",
				CategoryKey: "",
				ExecutingDeptKey: "",
				SanctioningDeptKey: "",
				bEditExectDept: false,
				sFiledControlRole: "",
				SessionGuid: "00000000-0000-0000-0000-000000000000",
				schemeDesc: "",
				propertyIdMapping: {
					MN_WRK_CODE: "idMainNatureWork",
					sb_wrk01_code: "idSubClass01",
					sb_wrk02_code: "idSubClass02",
					sb_wrk03_code: "idSubClass03",
					fundid: "idFundingAgency"
				},
				dependentFields: {
					MN_WRK_CODE: {
						fields: ["SubclassL01", "SubclassL02", "SubclassL03"]
					},
					sb_wrk01_code: {
						fields: ["SubclassL02", "SubclassL03"]
					},
					sb_wrk02_code: {
						fields: ["SubclassL03"]
					},
					// Hoa: {fields: ["Ddo"]},
					Category: {
						source: this.byId("idWorksHoA"),
						fields: ["Hoa", "Ddo"]
					},
					InitiatingDept: {
						source: this.byId("idWorksHoA"),
						fields: ["Hoa", "Ddo"]
					},
					ExecutingDept: {
						source: this.byId("idWorksHoA"),
						fields: ["Ddo"]
					}
				},
				sortOrder: {
					district: ["name"],
					mandal: ["districtx", "mandalx"],
					village: ["districtx", "mandalx", "villagex"],
					loksabha: ["District_name", "loksabha_name"],
					constutuency: ["distx", "assembly"],
					MN_WRK_CODE: ["MAIN_WORK"],
					sb_wrk03_code: ["sub_work_03"],
					sb_wrk01_code: ["sub_work_01"],
					sb_wrk02_code: ["sub_work_02"]
				}
			});

			var oHoaDdoFilterModel = new JSONModel({
				oHoaFilterNonDCW: {
					filter: [{
						id: "idCategory",
						key: "category",
						value: "Category"
					}, {
						id: "idInitDept",
						key: "dept",
						value: "InitiatinDept"
					}]
				},
				oDdoFilterNonDCW: {
					filter: [{
						id: "idExecDept",
						key: "fictr",
						value: "ExecutingDept"
					}]
				},
				oHoaFilterOwnDCW: {
					filter: []
				},
				oDdoFilterOwnDCW: {
					filter: [{
						id: "idExecDept",
						key: "fictr",
						value: "ExecutingDept"
					}]
				},
				oHoaFilterSource: {
					filter: [{
						id: "idCategory",
						key: "category",
						value: "Category"
					}, {
						id: "idInitDept",
						key: "dept",
						value: "InitiatinDept"
					}]
				},
				oDdoFilterSource: {
					filter: [{
						id: "idInitDept",
						key: "dept",
						value: "InitiatinDept"
					}]
				},
				oHoaFilterTarget: {
					filter: [{
						id: "idCategory",
						key: "category",
						value: "Category"
					}]
				},
				oDdoFilterTarget: {
					filter: []
				}
			});

			var sCreatedBy = sap.ushell.Container.getService("UserInfo").getId();
			if (!jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage")) {
				var oParamsBrowserStorage = {
					UserId: sCreatedBy,
					PositionId: "00000000",
					Role: "",
					SessionGuid: "00000000-0000-0000-0000-000000000000"
				};
				jQuery.sap.storage(jQuery.sap.storage.Type.session).put("zworksBrowserStorage", oParamsBrowserStorage);
			} else {
				var sStorageUser = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").UserId;
				if (sStorageUser !== sCreatedBy) {
					var oParamsBrowserStorage = {
						UserId: sCreatedBy,
						PositionId: "00000000",
						Role: "",
						SessionGuid: "00000000-0000-0000-0000-000000000000"
					};
					jQuery.sap.storage(jQuery.sap.storage.Type.session).put("zworksBrowserStorage", oParamsBrowserStorage);
				}
			}
			if (jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").SessionGuid === null) {
				var oParamsBrowserStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage");
				oParamsBrowserStorage.SessionGuid = "00000000-0000-0000-0000-000000000000";
				jQuery.sap.storage(jQuery.sap.storage.Type.session).put("zworksBrowserStorage", oParamsBrowserStorage);
			}
			var sStorePosition = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").PositionId;
			var sStorageRole = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").Role;
			var oViewAppModel = this.getOwnerComponent().getModel("appView");
			oViewAppModel.setProperty("/position", sStorePosition);
			oViewAppModel.setProperty("/role", sStorageRole);
			this._callFieldControl({
				action: "LOAD",
				application: "AS",
				Positionid: sStorePosition,
				Role: sStorageRole
			});

			this.getRouter().getRoute("Detail").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "detailView");
			this.setModel(oHoaDdoFilterModel, "hoaDdoFilters");
			//register the Message Manager and attach event handler for changes
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			sap.ui.getCore().getMessageManager().getMessageModel().attachMessageChange(this._updateMessage, this);
			//var sRole = this.getOwnerComponent().getModel("appView").getProperty("/role");
			//var aFilter = [(new Filter("Action", FilterOperator.EQ, "LOAD")), (new Filter("Application", FilterOperator.EQ, "AS"),(new Filter("Application", FilterOperator.EQ, sRole)))];
			this.oDefaultControlModel = new JSONModel();
			this.oAmendControlModel = new JSONModel();
			this.oBundleControlModel = new JSONModel();
			//this.getView().addStyleClass("sapUiSizeCompact");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

			if (!this.contentDensity) {
				this.contentDensity = "sapUiSizeCompact";
			}

			//For Launchpad Back Button preventing default action
			this.getOwnerComponent().getService("ShellUIService").then(function(oShellService) {
				oShellService.setBackNavigation(function() {
					this._navBackPreventDefault("BackBtnAction", "detail.message.warning.unsaveDataLost");
				}.bind(this));
			}.bind(this));
			//For Launchpad Home Button preventing default action
			/*  $("#homeBtn").bind("click", function(oEvent) {
			      oEvent.preventDefault();
			      this._navBackPreventDefault("HomeBtnAction", "detail.message.warning.unsaveDataLostHome");
			  }.bind(this));*/
		},

		/**
		 * Lifecycle method to perform operation just after rendering the view
		 */
		onAfterRendering: function() {
			var that = this,
				oSrcDDOTable = this.getView().byId("idWorksSrcHoA"),
				oDDOTable = this.getView().byId("idWorksHoA"),
				oEstTable = this.byId("idWorksEstim"),

				oEstItemsBinding = oEstTable.getBinding("items"),
				oDDOItemsBinding = oDDOTable.getBinding("items"),
				oSrcDDOTableBinding = oSrcDDOTable.getBinding("items");

			//Check items Binding change
			oSrcDDOTableBinding.attachChange(function(oEvent) {
				var oLength = oEvent.getSource().iLength;
				that.getModel("detailView").setProperty("/SrcDDOTableRowCount", oLength);
				that.getModel("detailView").updateBindings();
			});
			oDDOItemsBinding.attachChange(function(oEvent) {
				var oLength = oEvent.getSource().iLength;
				that.getModel("detailView").setProperty("/DDOTableRowCount", oLength);
				that.getModel("detailView").updateBindings();
			});
			oEstItemsBinding.attachChange(function(oEvent) {
				var oLength = oEvent.getSource().iLength;
				that.getModel("detailView").setProperty("/ESTTableRowCount", oLength);
				that.getModel("detailView").updateBindings();
			});

		},

		/**
		 * Lifecycle method to clear all references
		 */
		onExit: function() {
			this.bRefreshDDoTable = null;
			if (this._oDDOVHDialog) {
				this._oDDOVHDialog.destroy();
				this._oDDOVHDialog = null;
			}
			if (this._valueHelpDialog) {
				this._valueHelpDialog.destroy();
				this._valueHelpDialog = null;
			}
			if (this._oHOAVHDialog) {
				this._oHOAVHDialog.destroy();
				this._oHOAVHDialog = null;
			}
			if (this._oPicCodeVHDialog) {
				this._oPicCodeVHDialog.destroy();
				this._oPicCodeVHDialog = null;
			}
			if (this._createChangeLogFrag) {
				this._createChangeLogFrag.close();
			}
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Handler called when suggestion item is selected
		 * @param {sap.ui.base.Event} oEvent Selection of an Item from the Suggestions
		 */
		handleSuggestionItemSelected: function(oEvent) {
			if (!oEvent.getSource().getValue()) {
				oEvent.getSource().setValueState();
			}
		},
		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onSendEmailPress: function() {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler function to adjust the screen
		 * @param {Event} oEvent Press event
		 */
		onFullScreenPress: function(oEvent) {
			var param = {
				event: oEvent,
				target: "detail",
				masterPage: "MasterPage",
				detailPage: "DetailPage"
			};
			this._setScreenSize(param);
		},
		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function() {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},
		/**
		 * Event handler for the value help to select DDO
		 * @param {sap.ui.base.Event} oEvent is the event raised by the control
		 */
		handleDDOValueHelp: function(oEvent) {
			//this.oDDO = oEvent.getSource();
			var sCustomData = oEvent.getSource().getCustomData()[0].getValue();
			var oDdoVH = this._getDdoVH(oEvent, sCustomData);
			if (oDdoVH) {
				oDdoVH.open();
			}
			this.oCurrentInput = oEvent.getSource();
		},
		/**
		 * Event handler for the value help to select DDO
		 * @param {sap.ui.base.Event} oEvent is the event raised by the control
		 */
		handleHoaValueHelp: function(oEvent) {
			//this.oHOA = oEvent.getSource();
			var sCustomData = oEvent.getSource().getCustomData()[0].getValue();
			var oHoaVH = this._getHoaVH(oEvent, sCustomData);
			if (oHoaVH) {
				oHoaVH.open();
			}
			this.oCurrentInput = oEvent.getSource();
		},
		/**
		 * Event handler for the value help to select Pic Code
		 * @param {sap.ui.base.Event} oEvent is the event raised by the control
		 */
		handlePicCodeValueHelp: function(oEvent) {
			//this.oHOA = oEvent.getSource();
			var sCustomData = oEvent.getSource().getCustomData()[0].getValue();
			this._getPicCodeVH(oEvent, sCustomData).open();
			this.oCurrentInput = oEvent.getSource();
		},
		/**
		 * Event handler for the search in the value help fragments
		 * @param {sap.ui.base.Event} oEvent Search press inside the Value help for Location
		 */
		_handleValueHelpSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Desc",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		// /**
		//  * Event handler for the value help to select HOA
		//  * @param {sap.ui.base.Event} oEvent Value Help for HOA selection from Table
		//  */
		// handleHOAValueHelp: function(oEvent){
		// 	this.oHoa = oEvent.getSource();
		// 	this.getASHoaVH().open({
		// 		filters: [],
		// 		mode: "Single",	
		// 		hideFilter: false,
		// 		//for multiselect
		// 		// multiSelect: function (aSelectedRows) {
		// 		//     this.onSelectEmployee(aSelectedRows);

		// 		// }.bind(this),

		// 		//for single select pass this method
		// 		select: function(oSelectedObject){
		// 			this.getModel().setProperty("Hoa", oSelectedObject.hoa, this.oHoa.getBindingContext());
		// 			this.oHoa.fireChange();
		// 		}.bind(this)
		// 	});
		// },

		/**
		 * Event handler for value help to select currency
		 * @param {sap.ui.base.Event} oEvent Value help for currency selection
		 */
		handleCurrValueHelp: function(oEvent) {
			this.oCurr = oEvent.getSource();
			this.getASCurrVH().open({
				filters: [],
				//for multiselect
				// multiSelect: function (aSelectedRows) {
				//     this.onSelectEmployee(aSelectedRows);

				// }.bind(this),

				//for single select pass this method
				select: function(oSelectedObject) {
					this.oCurr.setValue(oSelectedObject.waers);
					this.oCurr.fireChange();
				}.bind(this)
			});
		},
		/**
		 * Need to change the Binding as per the data for value help
		 * @param {sap.ui.base.Event} oEvent Value Help for Estimations
		 */
		handleEstValueHelp: function(oEvent) {
			var sInputValue = oEvent.getSource().getValue();
			this.oBindingContext = oEvent.getSource().getBindingContext("oLocalJSONModel");
			this.sProperty = "EstimateTable";
			if (!this.getModel("valueHelpModel")) {
				var oDDOModel = new JSONModel(this.getModel("oLocalJSONModel").getProperty("/DDO"));
				this.setModel(oDDOModel, "valueHelpModel");
			}

			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"com.goap.cfms.works.as.fragment.ValueHelpDialog",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}
			// create a filter for the binding
			this._valueHelpDialog.getBinding("items").filter([new Filter(
				"Desc",
				sap.ui.model.FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._valueHelpDialog.open(sInputValue);
		},

		/**
		 * Function for creating new Estimate Payload nd sending to EntitySet
		 * @param {sap.ui.base.Event} oEvent On Editting existing estimate
		 */
		onEstChange: function(oEvent) {
			var oEstPayload = {
				Action: "UPD_ESTMT",
				Guid: oEvent.getSource().getBindingContext().getProperty("Guid"),
				EstimateGuid: oEvent.getSource().getBindingContext().getProperty("EstimateGuid"),
				LockTimestamp: oEvent.getSource().getBindingContext().getProperty("LockTimestamp"),
				ItemNo: oEvent.getSource().getBindingContext().getProperty("ItemNo"),
				EstimateId: oEvent.getSource().getBindingContext().getProperty("EstimateId"),
				Quantity: oEvent.getSource().getBindingContext().getProperty("Quantity"),
				Rate: oEvent.getSource().getBindingContext().getProperty("Rate"),
				Value: oEvent.getSource().getBindingContext().getProperty("Value")
			};
			//var sUpdPath = "/WrkASDetailsDraftSet(Guid=guid'" + oEvent.getSource().getBindingContext().getProperty("Guid") + "'),LockTimestamp=\/Date(" +  ( new Date()).getTime() + ")\/ )";
			var sUpdPath = this.getModel().createKey("WrkEstimatesSet", {
				Guid: oEvent.getSource().getBindingContext().getProperty("Guid"),
				EstimateGuid: oEvent.getSource().getBindingContext().getProperty("EstimateGuid")
			});

			sUpdPath = "/" + sUpdPath;

			this.getModel().update(sUpdPath, oEstPayload, {
				refreshAfterChange: false
			});
		},
		/**
		 * Event handler function for Version press
		 * @param {Event} oEvent Button press on version selection
		 */
		onVersionPress: function(oEvent) {
			var sTitle = this.getModel("i18n").getResourceBundle().getText("detail.page.header.version.title"),
				sNav = "worksversions";
			this._openVersionDialog(sTitle, sNav);
		},
		/**
		 * Event handler function for navigation for Version No
		 * @param {Event} oEvent Event handler for navigating to different version
		 */
		onVersionNav: function(oEvent) {
			this.getRouter().navTo("Detail", {
				objectId: oEvent.getSource().getBindingContext().getProperty("Guid"),
				stateId: "D" //this.getModel("detailView").getProperty("/stateId")
			}, true);
			this.onVersionClose();
		},
		/**
		 * Event handler for addition of new rows to DDO table
		 * @param {Event} oEvent On adding new records to DDO table
		 */
		addNewRowDDOs: function(oEvent) {
			var bInsertItem = false,
				oItems = this.byId("idWorksHoA").getItems(),
				oBusyControl = this.byId("idWorksHoA");
			oBusyControl.setBusy(true);
			var columnListItemNewLine = this._returnListItemTemplate(),
				oDetailsContext = this.byId("idWorksHoA").getBindingContext();
			if (oItems.length > 0) {
				var oModel = this.getModel(),
					oBindingContext = oItems[oItems.length - 1].getBindingContext(),
					sDDO = oModel.getProperty("Ddo", oBindingContext),
					sHOA = oModel.getProperty("Hoa", oBindingContext),
					sShare = oModel.getProperty("Zshare", oBindingContext);
				if (sDDO && sHOA && sShare) {
					bInsertItem = true;
				} else {
					oBusyControl.setBusy(false);
				}
			}
			if (oItems.length === 0) {
				this.getModel().setProperty("Ddo", "", oDetailsContext);
				this.getModel().setProperty("Hoa", "", oDetailsContext);
				this.byId("idWorksHoA").addItem(columnListItemNewLine);
				this._setPropertyCall(columnListItemNewLine, "TGT", oBusyControl);

			} else {
				if (bInsertItem) {
					this.getModel().setProperty("Ddo", "", oDetailsContext);
					this.getModel().setProperty("Hoa", "", oDetailsContext);
					this.byId("idWorksHoA").addItem(columnListItemNewLine);
					this._setPropertyCall(columnListItemNewLine, "TGT", oBusyControl);
				}
			}
		},
		/**
		 * Event handler for addition of new rows to Source DDO table
		 * @param {Event} oEvent On adding new records to Source DDO table
		 */
		addNewRowSrcDDOs: function(oEvent) {
			var bInsertItem = false,
				oItems = this.byId("idWorksSrcHoA").getItems(),
				oBusyControl = this.byId("idWorksSrcHoA");
			oBusyControl.setBusy(true);
			var columnListItemNewLine = this._returnSrcListItemTemplate(),
				oDetailsContext = this.byId("idWorksSrcHoA").getBindingContext();
			if (oItems.length > 0) {
				var oModel = this.getModel(),
					oBindingContext = oItems[oItems.length - 1].getBindingContext(),
					sDDO = oModel.getProperty("SourceDdo", oBindingContext),
					sHOA = oModel.getProperty("SourceHoa", oBindingContext),
					sShare = oModel.getProperty("SourceZShare", oBindingContext);
				if (sDDO && sHOA && sShare) {
					bInsertItem = true;
				} else {
					oBusyControl.setBusy(false);
				}
			}
			if (oItems.length === 0) {
				this.getModel().setProperty("SourceDdo", "", oDetailsContext);
				this.getModel().setProperty("SourceHoa", "", oDetailsContext);
				this.byId("idWorksSrcHoA").addItem(columnListItemNewLine);
				this._setPropertyCall(columnListItemNewLine, "SRC", oBusyControl);
			} else {
				if (bInsertItem) {
					this.getModel().setProperty("SourceDdo", "", oDetailsContext);
					this.getModel().setProperty("SourceHoa", "", oDetailsContext);
					this.byId("idWorksSrcHoA").addItem(columnListItemNewLine);
					this._setPropertyCall(columnListItemNewLine, "SRC", oBusyControl);
				}
			}
		},
		/**
		 * Event handler for modification of the value of percentage share in DDO table
		 * @param {sap.ui.base.Event} oEvent On changing the % share field in DDO
		 */
		onDdoShareChange: function(oEvent) {
			var oSource = oEvent.getSource();
			this._validateShare(oSource);
			if (oSource.getValueState() !== "Error") {
				this._setPropertyCall(oSource, "TGT");
			}
		},
		/**
		 * Event handler for modification of the value of percentage share in DDO table
		 * @param {sap.ui.base.Event} oEvent On changing the % share field in DDO
		 */
		onDdoShareLiveChange: function(oEvent) {
			var oSource = oEvent.getSource();
			this._validateShare(oSource);
		},
		/**
		 * Event handler for modification of the value of percentage share in DDO table
		 * @param {sap.ui.base.Event} oEvent On changing the % share field in DDO
		 */
		onSrcDdoShareChange: function(oEvent) {
			var oSource = oEvent.getSource();
			this._setPropertyCall(oSource, "SRC");
		},
		/**
		 * Event Handler for any changes performed to the DDO table
		 * @param {Event} oEvent Performing changes on the DDO table
		 */
		onDdoChange: function(oEvent) {
			if (oEvent.getSource().getMetadata().getElementName() === "sap.m.Input") {
				if (oEvent.getSource().getSelectedKey()) {
					oEvent.getSource().setValueState();
				} else if (oEvent.getSource().getValue()) {
					oEvent.getSource().setValueState();
				} else {
					oEvent.getSource().setValueState("Error");
				}
			} else if (oEvent.getSource().data("bindPath") === "ValidTo" || oEvent.getSource().data("bindPath") === "ValidFrom") {
				var oValidTo = oEvent.getSource().getBindingContext().getProperty("ValidTo"),
					oValidFrom = oEvent.getSource().getBindingContext().getProperty("ValidFrom");
				if (oValidFrom > oValidTo) {
					this._displayWarnMessge(this.getModel("i18n").getResourceBundle().getText("detail.message.error.ValidToFrom"));
					oEvent.getSource().setValue(null);
				}
			}
			this._setPropertyCall(oEvent.getSource(), "TGT");
		},
		/**
		 * Event Handler for any changes performed to the DDO table
		 * @param {Event} oEvent Performing changes on the DDO table
		 */
		onSrcDdoChange: function(oEvent) {
			if (oEvent.getSource().getMetadata().getElementName() === "sap.m.Input") {
				if (oEvent.getSource().getSelectedKey()) {
					oEvent.getSource().setValueState();
				} else if (oEvent.getSource().getValue()) {} else {
					oEvent.getSource().setValueState("Error");
				}
			} else if (oEvent.getSource().data("bindPath") === "SourceValidFrom" || oEvent.getSource().data("bindPath") === "SourceValidTo") {
				var oValidTo = oEvent.getSource().getBindingContext().getProperty("SourceValidTo"),
					oValidFrom = oEvent.getSource().getBindingContext().getProperty("SourceValidFrom");
				if (oValidFrom > oValidTo) {
					this._displayWarnMessge(this.getModel("i18n").getResourceBundle().getText("detail.message.error.ValidToFrom"));
					oEvent.getSource().setValue(null);
				}
			}
			this._setPropertyCall(oEvent.getSource(), "SRC");
		},
		/**
		 * Event Handler for deletions performed to the DDO table
		 * @param {Event} oEvent Deleting from the DDO table
		 */
		onDeleteDDO: function(oEvent) {
			var oParams = {
				Message: "detail.messageBox.delete",
				source: oEvent.getSource(),
				action: "DEL_HOA",
				guid: oEvent.getSource().getBindingContext().getObject().HoaGuid
			};
			if (this.getView().getBindingContext().getProperty("Status") === "E0003") {
				oParams.action = "APPR_DELI";
			}
			this._onActionConfirm(this._onDeleteConfirmation.bind(this), oParams);
		},
		/**
		 * Event Handler for deletions performed to the Source DDO table
		 * @param {Event} oEvent Deleting from the Source DDO table
		 */
		onSourceDeleteDDO: function(oEvent) {
			var oParams = {
				Message: "detail.messageBox.delete",
				source: oEvent.getSource(),
				action: "DEL_S_HOA",
				guid: oEvent.getSource().getBindingContext().getObject().HoaGuid
			};
			this._onActionConfirm(this._onDeleteConfirmation.bind(this), oParams);
		},
		/**
		 * Event handler for Additional Note
		 * @param {*} oEvent 
		 */
		onAdditionalNotePress: function(oEvent) {
			var that = this,
				oDetailViewModel = this.getModel("detailView");
			if (!this._addNoteFrag) {
				var fragId = this.createId("fragAddNote");
				this._addNoteFrag = sap.ui.xmlfragment(fragId, "com.goap.cfms.works.as.fragment.additionalNote", this);
				this.getView().addDependent(this._addNoteFrag);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._addNoteFrag);
			}
			this._addNoteFrag.setModel(oDetailViewModel);
			this._addNoteFrag.open();
			this._addNoteFrag.setBusy(true);
			var sPath = this.getModel().createKey("WrkCoverPageSet", {
				Caseguid: this.getView().getBindingContext().getProperty("Guid"),
				Notingid: oDetailViewModel.getProperty("/Notingid")
			});
			sPath = "/" + sPath;
			this.getModel().read(sPath, {
				success: function(oData) {
					oDetailViewModel.setProperty("/addNotingstring", decodeURIComponent(oData.Notingstring));
					oDetailViewModel.setProperty("/addNotePagent", oData.Pagent);
					oDetailViewModel.setProperty("/Notingid", oData.Notingid);
					that._addNoteFrag.setBusy(false);
				},
				error: function(oError) {
					that._addNoteFrag.setBusy(false);
				}
			});
		},
		/**
		 * Event handler for save additional note
		 * @param {*} oEvent 
		 */
		onSaveAdditionalNote: function(oEvent) {
			var oDetailViewModelData = this.getModel("detailView").getProperty("/"),
				oParam = {
					sPath: "WrkCoverPageSet",
					sNotingId: oDetailViewModelData.Notingid,
					sPagent: oDetailViewModelData.addNotePagent,
					sNotingString: encodeURIComponent(oDetailViewModelData.addNotingstring),
					sGuid: this.getView().getBindingContext().getProperty("Guid")
				};
			var oAdditionNoteSave = new Promise(function(resolve, reject) {
				this._addNoteFrag.setBusy(true);
				this._postNote(oParam, resolve, reject);
			}.bind(this));
			oAdditionNoteSave.then(function(oResult) {
				this._addNoteFrag.setBusy(false);
				this._addNoteFrag.close();
			}.bind(this));
		},
		/**
		 * Event handler function for Print
		 * @param {Event} oEvent 
		 */
		onPrintPress: function(oEvent) {
			var oPrintModel = this.getModel("printModel");
			var sServiceUrl = oPrintModel.sServiceUrl;
			var params = {
				sServiceUrl: sServiceUrl,
				sGuid: oEvent.getSource().getBindingContext().getProperty("Guid"),
				sDocCategory: "ZAS"
			};
			this._onPrintPress(params);
		},
		/**
		 * Event Handler for closing the value help dialog
		 * @param {sap.ui.base.Event} oEvent Pressing on Close in Value Help
		 */
		_handleValueHelpClose: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this.getModel("oLocalJSONModel").setProperty(this.sProperty, oSelectedItem.getDescription(), this.oBindingContext);
				this.getModel("oLocalJSONModel").updateBindings();
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		/**
		 * Event Handler for clicking on the Save button
		 * @param {sap.ui.base.Event} oEvent Save button press
		 */
		onSavePress: function(oEvent) {
			$.sap.ASNUMBER = undefined;
			this.updateControlModel("oControlModel");
			var bMandatoryCheck = this._mandatoryFieldCheckOnSave("oControlModel");
			var bValidated = this._validateBeforeSave("oControlModel");
			var bIsAmendDoc = parseInt(this.getView().getBindingContext().getProperty("Version"), 10) > 0 ? true : false;
			var bCheckListValidation = this._handleCheckListValidate("idChecklistTable", bIsAmendDoc);
			if (bMandatoryCheck && bValidated && bCheckListValidation) {
				var oParams = {
					Message: "detail.messageBox.save",
					action: "SAVE",
					event: oEvent
				};
				this._onActionConfirm(this._postAS.bind(this), oParams);
			} else {
				//Logic for Not save
				if (bCheckListValidation) {
					this.getModel("oControlModel").updateBindings();
					this._displayWarnMessge(this.getModel("i18n").getResourceBundle().getText("detail.message.error.mandatoryField"));
					this.byId("idCode").applyFocusInfo(true);
				}
			}
		},
		/**
		 * Event handler for Making Live changes in particular fields
		 * @param {Event} oEvent Change triggering on some particular fields
		 */
		onFieldLiveChange: function(oEvent) {
			var oSource = oEvent.getSource(),
				sPath = "/" + oSource.getBinding("value").sPath,
				oControlModel = this.getModel("oControlModel"),
				sValueState = sPath + "/valueState",
				sType = oControlModel.getProperty(sPath + "/type");
			if (sType !== "Number") {
				oControlModel.setProperty(sValueState, "None");
			} else {
				var sMaxValue = oControlModel.getProperty(sPath + "/maxLength"),
					sInputLen = oSource.getValue().length;
				if (sInputLen > sMaxValue) {
					oControlModel.setProperty(sValueState, "Error");
				} else if (oSource.getValue() < 0) {
					oControlModel.setProperty(sValueState, "Error");
				} else {
					oControlModel.setProperty(sValueState, "None");
				}
			}
		},
		/**
		 * Event handler function for GONumber
		 * @param {*} oEvent 
		 */
		onGOLiveChange: function(oEvent) {
			this.getModel("detailView").setProperty("/GoNumValueState", "None");
		},
		/**
		 * Updates the item count within the line item table's header
		 * @param {object} oEvent an event containing the total number of items in the list
		 * @private
		 */
		onListUpdateFinished: function(oEvent) {
			var sTitle,
				iTotalItems = oEvent.getParameter("total"),
				oViewModel = this.getModel("detailView");
			// only update the counter if the length is final
			if (this.byId("lineItemsList").getBinding("items").isLengthFinal()) {
				if (iTotalItems) {
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
				} else {
					//Display 'Line Items' instead of 'Line items (0)'
					sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
				}
				oViewModel.setProperty("/lineItemListTitle", sTitle);
			}
		},

		onhandleSanctionAuthority: function(oEvent) {
			this.getView().setBusy(true);
			this.sourcesancauth = oEvent.getSource();
			if (!this.sacauthority) {
				this.sacauthority = sap.ui.xmlfragment("com.goap.cfms.works.as.fragment.sacauthority", this);
				this.getView().addDependent(this.sacauthority);
			}
			var that = this;
			if (this.getOwnerComponent().getModel("migratedModel").getData().date === "" || this.getOwnerComponent().getModel("migratedModel").getData()
				.date === null || this.getOwnerComponent().getModel("migratedModel").getData().date === undefined) {
				sap.m.MessageBox.error("Please Select Sacntion Date");
			} else if (this.getOwnerComponent().getModel("migratedModel").getData().dept === "") {
				sap.m.MessageBox.error("Please Select Sacntion Department");
			} else {
				var sacdt = this.dateconv(this.getOwnerComponent().getModel("migratedModel").getData().date);
				var sacdept = this.getOwnerComponent().getModel("migratedModel").getData().beschr;
				var sactype = this.getOwnerComponent().getModel("migratedModel").getData().type;
				var selfilter = [];
				selfilter.push(new sap.ui.model.Filter("Auth_Type", sap.ui.model.FilterOperator.EQ, "AS"));
				selfilter.push(new sap.ui.model.Filter("DeptCode", sap.ui.model.FilterOperator.EQ, sacdept));
				selfilter.push(new sap.ui.model.Filter("SanDate", sap.ui.model.FilterOperator.EQ, sacdt));
				//selfilter.push(new sap.ui.model.Filter("Cat_Work", sap.ui.model.FilterOperator.EQ, "DCW"));
				that.getOwnerComponent().getModel().read("/AuthPositionSet", {
					async: true,
					filters: selfilter,
					success: function(oData) {
						that.getView().setBusy(false);
						that.sacauth = oData.results;
						var sacauthmodel = new sap.ui.model.json.JSONModel({
							results: that.sacauth
						});
						that.getOwnerComponent().setModel(sacauthmodel, "sacauthmodel");
						that.getOwnerComponent().getModel("sacauthmodel").refresh();
						that.sacauthority.setTitle("Sanction Authority (" + oData.results.length + ")");
						that.sacauthority.open();
					},
					error: function(error) {

					}
				});
			}
		},

		//Migrated Code Starts
		sacauthorityConfirm: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this.desc = oSelectedItem.getDescription();
				this.id = oSelectedItem.getTitle();
				this.sourcesancauth.setValue(this.id + " " + "(" + this.desc + ")");
			}
			if (oEvent.getSource().getBinding("items") !== undefined) {
				oEvent.getSource().getBinding("items").filter([]);
			}
			this.getOwnerComponent().getModel("migratedModel").getData().authority = this.id + " " + "(" + this.desc + ")";
			this.getOwnerComponent().getModel("migratedModel").updateBindings();
			this.sacauthority.destroy();
			this.sacauthority = undefined;
		},
		/**
		 * Event Handler for changes made in the text fields
		 * @param {sap.ui.base.Event} oEvent Changes made to fields in the View
		 */
		onFieldChange: function(oEvent) {
			var bLocation = false,
				sFNam = "",
				sFValue = "";
			if (oEvent.getSource().getValueState() !== "Error" || oEvent.getSource().getMetadata().getElementName() === "sap.m.DatePicker") {
				if (oEvent.getSource().getMetadata().getElementName() === "sap.m.DatePicker") {
					if (oEvent.getSource().getCustomData() && (oEvent.getSource().getCustomData()[0].getKey() === "apprField")) {
						this.getModel("detailView").setProperty("/goDateValueState", "None");
						var fieldDate = oEvent.getSource().getBindingContext().getProperty("GoRefDate");
						var oMaxDate = oEvent.getSource().getMaxDate();
						if (fieldDate > oMaxDate) {
							sap.m.MessageBox.error("Maximum Date for GOIR is Today's Date");
							oEvent.getSource().setDateValue(new Date());
						}
					} else {
						var sPath = "/" + oEvent.getSource().getBinding("value").sPath + "/valueState";
						this.getModel("oControlModel").setProperty(sPath, "None");
					}
					//sFValue = sap.ui.model.odata.ODataUtils.formatValue(oEvent.getSource().getDateValue(), "Edm.DateTime");
					sFValue = oEvent.getSource().getDateValue();
					sFNam = oEvent.getSource().getBindingInfo("value").binding.sPath;
					var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						format: "yyyy"
					});
					var sYear = oDateFormat.format(sFValue);
					oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						format: "MM"
					});
					var sMonth = oDateFormat.format(sFValue);
					oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						format: "dd"
					});
					var sDate = oDateFormat.format(sFValue);
					sFValue = sYear + sMonth + sDate;
					bLocation = true;

				} else if (oEvent.getSource().getMetadata().getElementName() === "sap.m.MultiInput") {
					bLocation = true;
					sFValue = this._getTokensAsString(oEvent);
					sFNam = this._getFieldName(oEvent.getSource().getCustomData()[0].getValue());
				} else if (oEvent.getSource().getMetadata().getElementName() === "sap.m.CheckBox") {
					sFValue = oEvent.getSource().getSelected();
					sFNam = oEvent.getSource().getBindingInfo("selected").binding.sPath;
				} else {
					sFNam = oEvent.getSource().getBindingInfo("value").binding.sPath;
					sFValue = this.getModel().getProperty(sFNam, oEvent.getSource().getBindingContext());

				}
				var oASUpdatePayload = {
					Action: "UPHDR",
					Guid: oEvent.getSource().getBindingContext().getProperty("Guid"),
					LockTimestamp: "\/Date(" + (new Date()).getTime() + ")\/",
					Fnam: sFNam,
					Fval: sFValue,
					Code: "",
					Position: this.getModel("appView").getProperty("/position"),
					InitiatinDept: "",
					DepartDesc: "",
					SessionGuid: jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").SessionGuid
				};
				if (oEvent.getSource().data("apprField") && (oEvent.getSource().getBindingContext().getProperty("Status") === "E0003")) {
					oASUpdatePayload.Action = "APPR_UPDT";
				}
				//var sUpdPath = "/WrkASDetailsDraftSet(Guid=guid'" + oEvent.getSource().getBindingContext().getProperty("Guid") + "'),LockTimestamp=\/Date(" +  ( new Date()).getTime() + ")\/ )";
				var sUpdPath = this.getModel().createKey("WrkASDetailsDraftSet", {
					Guid: oEvent.getSource().getBindingContext().getProperty("Guid"),
					LockTimestamp: new Date().getTime()
				});

				if (sFNam === "GoNumber" && !/\d/.test(sFValue)) {
					MessageBox.warning(this.getResourceBundle().getText("detail.ops.panel.content.label.GoNumberVal"), {
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function(sAction) {
							if (sAction === "YES") {
								sUpdPath = "/" + sUpdPath;
								this.getModel().update(sUpdPath, oASUpdatePayload, {
									success: function(oData, oResponse) {
										if (!bLocation) {
											this.getModel().setProperty(oASUpdatePayload.Fnam, oASUpdatePayload.Fval, this.getView().getElementBinding());
										}
										if (!this.getView().getBindingContext().getProperty("Status")) {
											this.getView().getElementBinding().refresh();
										}
									}.bind(this),
									error: function(oError) {

									},
									refreshAfterChange: false
								});
							}
						}.bind(this)
					});
				} else {
					sUpdPath = "/" + sUpdPath;
					this.getModel().update(sUpdPath, oASUpdatePayload, {
						success: function(oData, oResponse) {
							if (!bLocation) {
								this.getModel().setProperty(oASUpdatePayload.Fnam, oASUpdatePayload.Fval, this.getView().getElementBinding());
							}
							if (!this.getView().getBindingContext().getProperty("Status")) {
								this.getView().getElementBinding().refresh();
							}
						}.bind(this),
						error: function(oError) {

						},
						refreshAfterChange: false
					});
				}
			}
		},
		/**
		 * Select key after suggestionItems are loaded
		 * @param {sap.ui.base.event} oEvent Loading data recieved for the Suggestions fields.
		 */
		onSuggestDataReceived: function(oEvent) {
			var oSource = oEvent.getSource(),
				oContext = oSource.getContext(),
				oInputSource;
			//Checking if it is Ddo or Hoa
			if (oContext && oContext.getPath().includes("WrkHOASet")) {
				var aItems = this.byId("idWorksHoA").getItems();
				for (var i = 0; i < aItems.length; i++) {
					if (aItems[i].getBindingContextPath() === oContext.getPath()) {
						var aCells = aItems[i].getCells();
						for (var j = 0; j < aCells.length; j++) {
							if (aCells[j].getId().indexOf("Hoa") !== -1) {
								oInputSource = aCells[j];
								this._callingBindingParams(oInputSource);
							} else if (aCells[j].getId().indexOf("Ddo") !== -1) {
								oInputSource = aCells[j];
								this._callingBindingParams(oInputSource);
								break;
							}
						}
					}
				}
				//Checking for other value help fields
			} else {
				var aReferences = oSource._getEntityType().key.propertyRef,
					sProperty = aReferences[aReferences.length - 1].name,
					sId = this.getModel("detailView").getProperty("/propertyIdMapping/" + sProperty);
				oInputSource = this.byId(sId);
				this._callingBindingParams(oInputSource);
			}
		},
		/**
		 * Event Handler for changes made in selection
		 * @param {Event} oEvent Change made in Selection fields
		 */
		onSelectChange: function(oEvent) {
			var sFValue = "",
				sKey = oEvent.getSource().data("clearKey");
			if (sKey) {
				var oParams = {
					sProperty: sKey
				};
				this._clearDependentField(oParams);
			}
			if (oEvent.getSource().getMetadata().getElementName() === "sap.m.DatePicker") {
				sFValue = sap.ui.model.odata.ODataUtils.formatValue(oEvent.getSource().getDateValue(), "Edm.DateTime");
			} else {
				sFValue = oEvent.getSource().getSelectedKey();
			}
			if (sFValue || !oEvent.getSource().getValue()) {
				oEvent.getSource().setValueState();
				if (this.getModel("oControlModel")) {
					this.getModel("oControlModel").setProperty("/" + oEvent.getSource().getCustomData()[0].getProperty("value") + "/" + "/valueState",
						"None");
				}

			} else {
				oEvent.getSource().setValueState("Error");
			}
			if (oEvent.getSource().getCustomData()[0].getProperty("value") === "Category") {
				var oDetailViewModel = this.getModel("detailView");
				if (sFValue === "02") {
					oDetailViewModel.setProperty("/bUAVisible", true);
					oDetailViewModel.setProperty("/bOwnDCW", true);
				} else {
					oDetailViewModel.setProperty("/bUAVisible", false);
					oDetailViewModel.setProperty("/bOwnDCW", false);
				}

				this.bRefreshDDoTable = true;
				this._identifyHoaDdoFilters();
				this._setHoaDdoFilters();
			}
			//DCW type changes
			if (oEvent.getSource().getCustomData()[0].getProperty("value") === "DcwType") {
				var oDetailViewModel = this.getModel("detailView");
				if (sFValue === "01") {
					oDetailViewModel.setProperty("/bOwnDCW", true);
					this.getModel("oControlModel").setProperty("/SourceDdo/mandatory",
						false);
					this.getModel("oControlModel").setProperty("/SourceHoa/mandatory",
						false);
					this.getModel("oControlModel").setProperty("/SourceDdo/valueState", "None");
					this.getModel("oControlModel").setProperty("/SourceHoa/valueState", "None");
				} else {
					oDetailViewModel.setProperty("/bOwnDCW", false);
					this.getModel("oControlModel").setProperty("/SourceDdo/mandatory",
						true);
					this.getModel("oControlModel").setProperty("/SourceHoa/mandatory",
						true);
					this.getModel("oControlModel").setProperty("/SourceDdo/valueState", "Error");
					this.getModel("oControlModel").setProperty("/SourceHoa/valueState", "Error");
				}
				oDetailViewModel.updateBindings();
				this.bRefreshDDoTable = true;
				// this.byId("idWorksSrcHoA").getBinding("items").refresh(true);
				// this.byId("idWorksHoA").getBinding("items").refresh(true);
				this._identifyHoaDdoFilters();
				this._setHoaDdoFilters();
			}
			var oASUpdatePayload = {
				Action: "UPHDR",
				Guid: oEvent.getSource().getBindingContext().getProperty("Guid"),
				LockTimestamp: "\/Date(" + (new Date()).getTime() + ")\/",
				Fnam: oEvent.getSource().getCustomData()[0].getProperty("value"),
				Fval: sFValue,
				Code: "",
				Position: this.getModel("appView").getProperty("/position"),
				InitiatinDept: "",
				DepartDesc: "",
				SessionGuid: jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").SessionGuid
			};
			if (oEvent.getSource().data("apprField") && (oEvent.getSource().getBindingContext().getProperty("Status") === "E0003")) {
				oASUpdatePayload.Action = "APPR_UPDT";
			}
			if (oEvent.getSource().getCustomData() && oEvent.getSource().getCustomData()[0].getValue() === "Scheme" && (oEvent.getSource().getBindingContext()
					.getProperty("Status") === "E0003")) {
				oASUpdatePayload.Action = "APPR_UPDT";
			}
			//var sUpdPath = "/WrkASDetailsDraftSet(Guid=guid'" + oEvent.getSource().getBindingContext().getProperty("Guid") + "'),LockTimestamp=\/Date(" +  ( new Date()).getTime() + ")\/ )";
			var sUpdPath = this.getModel().createKey("WrkASDetailsDraftSet", {
				Guid: oEvent.getSource().getBindingContext().getProperty("Guid"),
				LockTimestamp: new Date().getTime()
			});
			//Prashil Add Code to attach suggest items to DDO

			sUpdPath = "/" + sUpdPath;
			this.getModel().update(sUpdPath, oASUpdatePayload, {
				success: function(oData, oResponse) {
					this.getModel().setProperty(oASUpdatePayload.Fnam, oASUpdatePayload.Fval, this.getView().getElementBinding());
					if (this.bRefreshDDoTable) {
						this.byId("idWorksSrcHoA").getBinding("items").refresh(true);
						this.byId("idWorksHoA").getBinding("items").refresh(true);
						this.byId("idBudgetCtrl").setValue("");
						this.byId("idBudgetCtrl").fireChange();
						this.bRefreshDDoTable = false;
					}
				}.bind(this),
				error: function(oError) {

				},
				refreshAfterChange: false
			});
		},

		onSelectChangeDetailWork: function(oEvent) {
			var sFValue = "",
				sKey = oEvent.getSource().data("clearKey");
			if (sKey) {
				var oParams = {
					sProperty: sKey
				};
				//		this._clearDependentFieldDetailWork(oParams);
			}

			sFValue = oEvent.getSource().getSelectedKey();

			if (sFValue || !oEvent.getSource().getValue()) {
				oEvent.getSource().setValueState();
				if (this.getModel("oControlModel")) {
					this.getModel("oControlModel").setProperty("/" + oEvent.getSource().getCustomData()[0].getProperty("value") + "/" + "/valueState",
						"None");
				}
			}

			var oASUpdatePayload = {
				Action: "UPHDR",
				Guid: oEvent.getSource().getBindingContext().getProperty("Guid"),
				LockTimestamp: "\/Date(" + (new Date()).getTime() + ")\/",
				Fnam: oEvent.getSource().getCustomData()[0].getProperty("value"),
				Fval: sFValue,
				Code: "",
				Position: this.getModel("appView").getProperty("/position"),
				InitiatinDept: "",
				DepartDesc: "",
				SessionGuid: jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").SessionGuid
			};
			if (oEvent.getSource().data("apprField") && (oEvent.getSource().getBindingContext().getProperty("Status") === "E0003")) {
				oASUpdatePayload.Action = "APPR_UPDT";
			}
			if (oEvent.getSource().getCustomData() && oEvent.getSource().getCustomData()[0].getValue() === "Scheme" && (oEvent.getSource().getBindingContext()
					.getProperty("Status") === "E0003")) {
				oASUpdatePayload.Action = "APPR_UPDT";
			}
			//var sUpdPath = "/WrkASDetailsDraftSet(Guid=guid'" + oEvent.getSource().getBindingContext().getProperty("Guid") + "'),LockTimestamp=\/Date(" +  ( new Date()).getTime() + ")\/ )";
			var sUpdPath = this.getModel().createKey("WrkASDetailsDraftSet", {
				Guid: oEvent.getSource().getBindingContext().getProperty("Guid"),
				LockTimestamp: new Date().getTime()
			});
			//Prashil Add Code to attach suggest items to DDO

			sUpdPath = "/" + sUpdPath;
			this.getModel().update(sUpdPath, oASUpdatePayload, {
				success: function(oData, oResponse) {
					//	this.getModel().setProperty(oASUpdatePayload.Fnam, oASUpdatePayload.Fval, this.getView().getElementBinding());

				}.bind(this),
				error: function(oError) {

				},
				refreshAfterChange: false
			});

		},

		_clearDependentFieldDetailWork: function(oParams) {
			var aFieldId = [];
			if (oParams.sProperty === "MAIN_WORK") {
				aFieldId = ["idSubClass01", "idSubClass02", "idSubClass03"];
			} else if (oParams.sProperty === "sub_work_01") {
				aFieldId = ["idSubClass02", "idSubClass03"];
			} else if (oParams.sProperty === "sub_work_02") {
				aFieldId = ["idSubClass03"];
			}
			this._clearField(aFieldId);
		},

		_clearField: function(aFieldId) {
			for (var i = 0; i < aFieldId.length; i++) {
				var oControl = this.byId(aFieldId[i]);
				oControl.setSelectedKey("");
				oControl.setValueState();
				if (oControl.getMetadata().getElementName() === "sap.m.Input") {
					oControl.setValue("");
					var sFname;
					switch (aFieldId[i]) {
						case "idSubClass01":
							sFname = "SubclassL01";
							break;
						case "idSubClass02":
							sFname = "SubclassL02";
							break;
						case "idSubClass03":
							sFname = "SubclassL03";
							break;

					}

					var oASUpdatePayload = {
						Action: "UPHDR",
						Guid: this.getView().getBindingContext().getProperty("Guid"),
						LockTimestamp: "\/Date(" + (new Date()).getTime() + ")\/",
						Fnam: sFname,
						Fval: "",
						Code: "",
						Position: this.getModel("appView").getProperty("/position"),
						InitiatinDept: "",
						DepartDesc: "",
						SessionGuid: jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").SessionGuid
					};

					var sUpdPath = this.getModel().createKey("WrkASDetailsDraftSet", {
						Guid: this.getView().getBindingContext().getProperty("Guid"),
						LockTimestamp: new Date().getTime()
					});
					sUpdPath = "/" + sUpdPath;
					this.getModel().update(sUpdPath, oASUpdatePayload, {
						success: function(oData, oResponse) {
							this.getModel().setProperty(oASUpdatePayload.Fnam, oASUpdatePayload.Fval, this.getView().getElementBinding());
							//	this.getView().getElementBinding().refresh();
						}.bind(this),
						error: function(oError) {

						},
						refreshAfterChange: false
					});

				}
			}
		},

		/**
		 * Event Handler for clicking on Cancel button in Detail View
		 * @param {sap.ui.base.Event} oEvent Pressing cancel in view
		 */
		onCancelPress: function(oEvent) {
			var that = this;
			var oParams = {
				Message: "detail.messageBox.cancel",
				action: "DFT_CNCL",
				event: oEvent
			};
			this._onActionConfirm(this._cancelPost.bind(this), oParams);
		},
		/**
		 * Event handler for additional note
		 * @param {*} oEvent 
		 */
		onCancelAdditionalNote: function(oEvent) {
			this._addNoteFrag.close();
		},
		/**
		 * 
		 * @param {*} param 
		 */
		_cancelPost: function(param) {
			var that = this;
			this.getModel().callFunction("/WrkLockEdit", {
				method: "GET",
				urlParameters: {
					LockTimeStamp: new Date().getTime(),
					Action: param.action,
					Guid: this.getView().getBindingContext().getProperty("Guid"),
					Application: "AS",
					SessionGuid: sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/SessionGuid")
				},
				success: function(oResponse, oTe) {
					that._notAllowEditOnDocument();
					that._changeFullScreenMode(false, "detail", "MasterPage", "asIdBtnScreenToggle");
					sap.ushell.Container.setDirtyFlag(false);
					that.getRouter().navTo("default", {}, true);
					that.getModel().refresh();
				},
				error: function(oError) {

				}
			});
		},
		/**
		 * Event Handler for clicking on Submit button in Detail View
		 * @param {sap.ui.base.Event} oEvent Pressing submit in view
		 */
		onSubmitPress: function(oEvent) {
			$.sap.ASNUMBER = undefined;
			this.updateControlModel("oControlModel");
			var bMandatoryCheck = this._mandatoryFieldCheckOnSave("oControlModel"),
				bValidated = this._validateBeforeSave("oControlModel"),
				bIsAmendDoc = parseInt(this.getView().getBindingContext().getProperty("Version")) > 0 ? true : false,
				bCheckListValidation = this._handleCheckListValidate("idChecklistTable", bIsAmendDoc);
			if (bMandatoryCheck && bValidated && bCheckListValidation) {
				var oParams = {
					Message: "detail.messageBox.submit",
					action: "SUBMIT",
					event: oEvent
				};
				if (this._checkNote()) {
					var backendValidationCheck = new Promise(function(resolve, reject) {
						this.checkBackendValidation(resolve, reject);
					}.bind(this));

					backendValidationCheck.then(function() {
						this._onActionConfirm(this._postAS.bind(this), oParams);
					}.bind(this));
				}

			} else {
				if (bCheckListValidation) {
					this.getModel("oControlModel").updateBindings();
					this._displayWarnMessge(this.getModel("i18n").getResourceBundle().getText("detail.message.error.mandatoryField"));
					this.byId("idCode").applyFocusInfo(true);
				}
			}
		},
		/**
		 * Event Handler for clicking on Next Level button in Detail View
		 * @param {sap.ui.base.Event} oEvent Pressing Next Level in view
		 */
		onNextLevelPress: function(oEvent) {
			var oParams = {
				Message: "detail.messageBox.next",
				action: "NEXT",
				event: oEvent
			};
			if (this._checkNote()) {
				var backendValidationCheck = new Promise(function(resolve, reject) {
					this.checkBackendValidation(resolve, reject);
				}.bind(this));

				backendValidationCheck.then(function() {
					this._onActionConfirm(this._postAS.bind(this), oParams);
				}.bind(this));
			}
		},

		/**
		 * Event Handler for clicking on Return button in Detail View
		 * @param {sap.ui.base.Event} oEvent Pressing return in view
		 */
		onReturnPress: function(oEvent) {
			var oParams = {
				Message: "detail.messageBox.return",
				action: "RETURN",
				event: oEvent
			};
			if (this._checkNote()) {
				this._onActionConfirm(this._postAS.bind(this), oParams);
			}
		},

		/**
		 * Event Handler for clicking on Approve button in Detail View
		 * @param {sap.ui.base.Event} oEvent Pressing approve in view
		 */
		onApprovePress: function(oEvent) {
			this.updateControlModel("oControlModel");
			var bMandatoryCheck = this._mandatoryFieldCheckOnSave("oControlModel"),
				bValidated = this._validateBeforeSave("oControlModel"),
				bApprovalMandatoryCheck = this._checkSecrataryMand();
			if (bApprovalMandatoryCheck && bMandatoryCheck && bValidated) {
				var oParams = {
					Message: "detail.messageBox.approve",
					action: "APPROVE",
					event: oEvent
				};
				if (this._checkNote()) {
					this._onActionConfirm(this._postAS.bind(this), oParams);
				}
			} else {
				this.getModel("oControlModel").updateBindings();
				this._displayWarnMessge(this.getModel("i18n").getResourceBundle().getText("detail.message.error.mandatoryField"));
				this.byId("idCode").applyFocusInfo(true);
			}
		},

		/**
		 * Event Handler for clicking on On Hold button in Detail View
		 * @param {sap.ui.base.Event} oEvent Pressing withhold in view
		 */
		onWithheldPress: function(oEvent) {
			var oParams = {
				Message: "detail.messageBox.withHeld",
				action: "WITHHELD",
				event: oEvent
			};
			//this._onActionConfirm(this._postAS.bind(this), oParams);
			if (this._checkNote()) {
				this._onActionConfirm(this._postAS.bind(this), oParams);
			}
		},
		/**
		 * Event handler for Add new Estimation
		 * @param {sap.ui.base.Event} oEvent Adding new estimate
		 */
		/*onAddNewEstimation: function(oEvent){
			var oBindingContext = this.getView().getBindingContext(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target:{
					semanticObject: "ZWorks",
					action: "estimation"
				},
				params:{
					refGuid: oBindingContext.getProperty("Guid"),
					refType : "ZWAS",
					RefNo : oBindingContext.getProperty("Code"),
					appState: this.getModel("detailView").getProperty("/stateId")
				}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});
		},*/

		onAddNewEstimation: function(oEvent) {
			var oBindingContext = this.getView().getBindingContext();
			sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/EST/bAddNewEST", true);
			sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", true);
			sap.ushell.Container.setDirtyFlag(false);
			this.getOwnerComponent().getModel().read("/WrkMigCheckSet(Code='" + oBindingContext.getProperty("Code") + "',AppType='ZWAS')", {
				// filters: aFilters,
				success: function(oData) {
					var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
					var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: "ZWorks",
							action: "estimation"
						},
						params: {
							refGuid: oBindingContext.getProperty("Guid"),
							refType: "ZWAS",
							RefNo: oBindingContext.getProperty("Code"),
							appState: this.getModel("detailView").getProperty("/stateId"),
							migInd: oData.Migrated
						}
					})) || "";
					var sNoteText = this.getModel("detailView").getProperty('/Notingstring');
					if (!sNoteText) {
						this._navToEst(hash);
					} else {
						var sMsgText = this.getModel("i18n").getResourceBundle().getText('detail.message.warning.notetextlost');
						MessageBox.confirm(sMsgText, {
							onClose: function(oAction) {
								if (oAction === MessageBox.Action.OK) {
									this._navToEst(hash);
								}
							}.bind(this)
						});
					}
					// oCrossAppNavigator.toExternal({
					// 	target: {
					// 		shellHash: hash
					// 	}
					// });
				}.bind(this),
				error: function(oData) {

				}.bind(this)
			});

		},
		/**
		 * Event handler for Link press
		 * @param {*} oEvent 
		 */
		onEstItemPress: function(oEvent) {

			if (this.getModel("detailView").getProperty("/bEditable")) {
				sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", true);
				sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/EST/parentEdit", true);
			} else {
				sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/EST/parentEdit", false);
			}
			sap.ushell.Container.setDirtyFlag(false);
			var sNoteText = this.getModel("detailView").getProperty('/Notingstring'),
				sEstGuid = oEvent.getSource().getBindingContext().getObject("EstGuid"),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sHash = oCrossAppNavigator.hrefForExternal({
				target: {
					shellHash: "ZWorks-estimation&/Detail/" + sEstGuid + "/D/ZDE/xapp"
				}
			});
			if (!sNoteText) {
				this._navToEst(sHash);
			} else {
				var sMsgText = this.getModel("i18n").getResourceBundle().getText("detail.message.warning.notetextlost");
				MessageBox.confirm(sMsgText, {
					onClose: function(oAction) {
						if (oAction === MessageBox.Action.OK) {
							this._navToEst(sHash);
						}
					}.bind(this)
				});
			}
		},
		/**
		 * Private function to navigate hash
		 * @param {string} sHash hash string
		 */
		_navToEst: function(sHash) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: sHash
				}
			});
		},
		/**
		 * Event Handler for deletions performed to the DDO table
		 * @param {sap.ui.base.Event} oEvent Delete press on estimate
		 */
		onDeleteEstimate: function(oEvent) {
			var oParams = {
				Message: "detail.messageBox.delete",
				source: oEvent.getSource(),
				action: "DEL_ESTMT",
				guid: oEvent.getSource().getBindingContext().getObject().EstGuid
			};
			this._onActionConfirm(this._onDeleteConfirmation.bind(this), oParams);
		},
		/**
		 * Event handler for pressing on Edit
		 * @param {Event} oEvent Button press for edit mode.
		 */
		onEditPress: function(oEvent) {
			var that = this;
			var AsNumber = that.getView().byId("idCode").getValue();
			that._getMigCheckSet();
			var oBtn = this.getView().byId("asIdBtnScreenToggle");
			this.getModel().callFunction("/WrkLockEdit", {
				method: "GET",
				urlParameters: {
					LockTimeStamp: new Date().getTime(),
					Action: "LOCKCHK",
					Guid: that.getView().getBindingContext().getProperty("Guid"),
					Application: "AS",
					SessionGuid: jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").SessionGuid
				},
				success: function(oResponse, oTe) {
					//Updating sessionguid in browser storage data
					if (oResponse.SessionGuid) {
						var oParamsBrowserStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage");
						oParamsBrowserStorage.SessionGuid = oResponse.SessionGuid;
						jQuery.sap.storage(jQuery.sap.storage.Type.session).put("zworksBrowserStorage", oParamsBrowserStorage);
					}
					sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/SessionGuid", oResponse.SessionGuid);
					sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", true);
					that._changeFullScreenMode(true, "detail", "MasterPage", "asIdBtnScreenToggle");
					//					oBtn.firePress();
					that._navToDetail.bind(that)("E");
					//					that._allowEditOnDocument();
				},
				error: function(oError) {

				}
			});
		},
		/**
		 * Event handler function for display button
		 * @param {Event} oEvent Button press for display mode.
		 */
		onDisplayPress: function(oEvent) {
			var that = this;
			var oBtn = this.getView().byId("asIdBtnScreenToggle");
			this.getModel().callFunction("/WrkLockEdit", {
				method: "GET",
				urlParameters: {
					LockTimeStamp: new Date().getTime(),
					Action: "LOCKDEL",
					Guid: oEvent.getSource().getBindingContext().getProperty("Guid"),
					Application: "AS",
					SessionGuid: sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/SessionGuid")

				},
				success: function(oResponse, oTe) {
					//					oBtn.firePress();
					sap.ushell.Container.setDirtyFlag(false);
					that._changeFullScreenMode(false, "detail", "MasterPage", "asIdBtnScreenToggle");
					that._notAllowEditOnDocument();
					that._navToDetail.bind(that)("D");

				},
				error: function(oError) {

				}
			});
		},
		/**
		 * Private function to bind 
		 * @param {*} oEvent 
		 */
		_updatePositionBinding: function() {
			var oPositon = this.byId("idPosition"),
				oFilter = new Filter("SUBPROCESS_AREA", FilterOperator.EQ, "AS"),
				aCreatedBy = this.getView().getBindingContext().getProperty("UserIdCr");
			if (!this.oPosItemTemp) {
				this.oPosItemTemp = new sap.ui.core.Item({
					text: "{STEXT}",
					key: "{position}"
				});
			}
			oPositon.bindAggregation("items", {
				path: "/ZWRK_C_USER_POSITIONS(p_user='" + aCreatedBy + "')/Set",
				filters: [oFilter],
				template: this.oPosItemTemp
			});
		},
		/**
		 * Event handler for Clicking on the details display for location 
		 * @param {Event} oEvent Button press on Location Details
		 */
		handleLocationListDisplay: function(oEvent) {
			var oLocationModel = this.getModel("location");
			if (oLocationModel.getProperty("/vDistrict")) {
				this.handleDistrictListDisplay();
			} else if (oLocationModel.getProperty("/vMandal")) {
				this.handleMandalListDisplay();
			} else if (oLocationModel.getProperty("/vVillage")) {
				this.handleVillageListDisplay();
			}
		},
		/**
		 * Function to handle live change on control
		 * @param {sap.ui.base.Event} oEvent Live changes on fields
		 */
		handleLiveChange: function(oEvent) {
			if (this.oSelectedObject) {
				this.oSelectedObject = null;
			}
		},
		/**
		 * Event handler for Clicking on the details display for constituency 
		 * @param {Event} oEvent Button press on Constituency Details
		 */
		handleConstListDisplay: function(oEvent) {
			var sCustomData = oEvent.getSource().getCustomData()[0].getValue();
			//var oLocationModel = this.getModel("location");
			if (sCustomData === this.getModel("i18n").getResourceBundle().getText("detail.ops.panel.content.label.assembly")) {
				this.handleAssemblyListDisplay();
			} else {
				this.onLoksabhaListClick();
			}
		},
		/**
		 * Event handler function for Radio button select, set enabled/desabled input field
		 * @param {Event} oEvent Selection of radio button
		 */
		onRadioSelect: function(oEvent) {
			var sLocationRBtn = oEvent.getSource().getCustomData()[0].getValue();
			switch (sLocationRBtn) {
				case "district":
					this._setPropertyValue("location", ["vDistrict"], true);
					this._setPropertyValue("location", ["vMandal", "vVillage"], false);
					break;
				case "mandal":
					this._setPropertyValue("location", ["vMandal"], true);
					this._setPropertyValue("location", ["vDistrict", "vVillage"], false);
					break;
				case "village":
					this._setPropertyValue("location", ["vVillage"], true);
					this._setPropertyValue("location", ["vDistrict", "vMandal"], false);
					break;
				case "loksabha":
					this._setPropertyValue("location", ["vLoksabha"], true);
					//	this._setPropertyValue("location", ["vAssembly"], false);
					break;
				default:
					this._setPropertyValue("location", ["vAssembly"], true);
					//	this._setPropertyValue("location", ["vLoksabha"], false);
			}
			this.getModel("location").updateBindings();
		},
		/**
		 * Event handler function for note edit press
		 * @param {Event} oEvent Button press on note edit
		 */
		onNoteActionPress: function(oEvent) {
			var sAction = oEvent.getSource().getKey();
			if (sAction === "edit") {
				var oDetailViewModel = this.getModel("detailView"),
					oNotePayload = oDetailViewModel.getProperty("/"),
					oParentBindingContext = oEvent.getSource().getParent().getBindingContext("detailView");
				oDetailViewModel = this.getModel("detailView");
				var sNoteText = oDetailViewModel.getProperty("Notingstring", oParentBindingContext);
				var sNotingId = oDetailViewModel.getProperty("Notingid", oParentBindingContext);
				var sPagent = oDetailViewModel.getProperty("Pagent", oParentBindingContext);
				oNotePayload.Notingstring = sNoteText;
				oNotePayload.Notingid = sNotingId;
				oNotePayload.Pagent = sPagent;
				oDetailViewModel.updateBindings();
				MessageToast.show(this.getResourceBundle().getText("detail.ObjPageSection.toast.editMessage.addedtoEditor"));
			}
		},
		/** 
		 * Event handler on click message popover at footer
		 * @param {Event} oEvent Button press on Error Messages display
		 */
		handleMessagePopoverPress: function(oEvent) {
			this.getOwnerComponent().oMessagePopover.toggle(oEvent.getSource());
		},
		/**
		 * @param {*} oEvent is the onselect event
		 */
		onHOADDOSelect: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				sCustomData = oSelectedItem.getCustomData()[1].getValue();
			var sBindingPath,
				sControlId;
			if (oSelectedItem) {
				if (sCustomData === "Ddo" || sCustomData === "SourceDdo") {
					var sDDO = oSelectedItem.getBindingContext().getProperty("fistl");
					var sDDODes = oSelectedItem.getBindingContext().getProperty("BESCHR");
					sBindingPath = oSelectedItem.data("sSrcBindingPath");
					sControlId = oSelectedItem.data("controlId");
					if (sCustomData === "Ddo") {
						this.getModel().setProperty(sBindingPath + "/Ddo", sDDO);
						this.getModel().setProperty(sBindingPath + "/DdoDes", sDDODes);
					} else {
						this.getModel().setProperty(sBindingPath + "/SourceDdo", sDDO);
						this.getModel().setProperty(sBindingPath + "/DdoDes", sDDODes);
					}
					//	this._destroyFrag(this._oDDOVHDialog);
				} else if (sCustomData === "Hoa" || sCustomData === "SourceHoa") {
					var sHOA = oSelectedItem.getBindingContext().getProperty("Hoa");
					// sGsh = oSelectedItem.getBindingContext().getProperty("gsh"),
					// aCells = this.oCurrentInput.getParent().getCells(),
					// oCell = aCells.filter(function(cell) {return cell.data("bindPath") === "PicCode";})[0];
					sBindingPath = oSelectedItem.data("sSrcBindingPath");
					sControlId = oSelectedItem.data("controlId");
					if (sCustomData === "Hoa") {
						this.getModel().setProperty(sBindingPath + "/Hoa", sHOA);
					} else {
						this.getModel().setProperty(sBindingPath + "/SourceHoa", sHOA);
						if (this.byId("idBudgetCtrl").getValue() === "") {
							this.byId("idBudgetCtrl").setValue(oSelectedItem.getBindingContext().getProperty("bcf"));
							this.byId("idBudgetCtrl").fireChange();
						}
						// if(sGsh === "07") {
						// 	oCell.setEditable(true);
						// } else {
						// 	oCell.setValue();
						// 	oCell.setEditable(false);
						// }
					}
				}
				// else if(sCustomData === "PicCode") {
				// 	var sPicsCode = oSelectedItem.getBindingContext().getProperty("Pics_Code");
				// 	sBindingPath = oSelectedItem.data("sSrcBindingPath");
				// 	if(sCustomData === "PicCode"){
				// 		this.getModel().setProperty( sBindingPath + "/PicsCode", sPicsCode);
				// 	}
				// }

				this.oCurrentInput.fireChange();
			}
		},
		/**
		 * Event handler for HoA Ddo search in value help
		 * @param {sap.ui.model.Event} oEvent is the event for Search
		 */
		handleHOADDOSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var aFilters = [],
				sCustomData = oEvent.getSource().getCustomData()[0].getValue();
			if (sCustomData === "Ddo" || sCustomData === "SourceDdo") {
				aFilters.push(new Filter("fistl", sap.ui.model.FilterOperator.Contains, sValue));
				aFilters.push(new Filter("BESCHR", sap.ui.model.FilterOperator.Contains, sValue));
			} else if (sCustomData === "Hoa" || sCustomData === "SourceHoa") {
				aFilters.push(new Filter("Hoa", sap.ui.model.FilterOperator.Contains, sValue));
			} else if (sCustomData === "PicCode") {
				aFilters.push(new Filter("Pics_Code", sap.ui.model.FilterOperator.Contains, sValue));
				aFilters.push(new Filter("District_name", sap.ui.model.FilterOperator.Contains, sValue));
			}
			var oFilter = new sap.ui.model.Filter({
				filters: aFilters,
				bAnd: false
			});
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilter);
		},
		/**
		 * Event handler for closing HoA DDO
		 * @param {sap.ui.base.Ecent} oEvent is the parameter control
		 */
		handleHOADDOClose: function(oEvent) {
			var sCustomData = oEvent.getSource().getCustomData()[0].getValue();
			if (sCustomData === "Ddo" || sCustomData === "SourceDdo") {
				if (this._oDDOVHDialog) {
					this._oDDOVHDialog.destroy();
					this._oDDOVHDialog = null;
				}
			} else if (sCustomData === "Hoa" || sCustomData === "SourceHoa") {
				if (this._oHOAVHDialog) {
					this._oHOAVHDialog.destroy();
					this._oHOAVHDialog = null;
				}
			} else if (sCustomData === "PicCode") {
				if (this._oPicCodeVHDialog) {
					this._oPicCodeVHDialog.destroy();
					this._oPicCodeVHDialog = null;
				}
			}
		},
		/**
		 * Event handler for Change Log
		 * @param {Event} oEvent event for change log press
		 */
		onChangeLogPress: function(oEvent) {
			if (!this._createChangeLogFrag) {
				var fragId = this.createId("IdChangeLog");
				this._createChangeLogFrag = sap.ui.xmlfragment(fragId, "com.goap.cfms.works.as.fragment.changeLog", this);
				this.getView().addDependent(this._createChangeLogFrag);
			}
			var oChangeTable = this._getFragControlById("idProductsTable", "IdChangeLog");

			oChangeTable.bindAggregation("items", {
				path: "AsDettoChangeLogs",
				template: this._returnChangeLogTemplate()
			});
			this._createChangeLogFrag.open();
		},
		/**
		 * Function to return the template for the Change Log Table
		 * @private
		 * @returns {Object} Template for the change log table list item
		 */
		_returnChangeLogTemplate: function() {
			var oLogTemplate = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{User}"
					}),
					new sap.m.Text({
						text: "{path:'Date',type: 'sap.ui.model.odata.type.DateTime'}"
					}),
					new sap.m.Text({
						text: "{Type}"
					}),
					new sap.m.Text({
						text: "{ShortDesc}"
					}),
					new sap.m.Text({
						text: "{Estimated Value}"
					}),
					new sap.m.Text({
						text: "{GoNumber}"
					}),
					new sap.m.Text({
						text: "{path:'GoRefDate',type: 'sap.ui.model.odata.type.DateTime'}"
					}),
					new sap.m.Text({
						text: "{Category}"
					}),
					new sap.m.Text({
						text: "{LocalClass}"
					}),
					new sap.m.Text({
						text: "{StatusText}"
					}),
					new sap.m.Text({
						text: "{MainWorkNature}"
					}),
					new sap.m.Text({
						text: "{SubclassL01}"
					}),
					new sap.m.Text({
						text: "{SubclassL02}"
					}),
					new sap.m.Text({
						text: "{SubclassL03}"
					}),
					new sap.m.Text({
						text: "{InitDepartDesc}"
					}),
					new sap.m.Text({
						text: "{Scheme}"
					}),
					new sap.m.Text({
						text: "{Stage}"
					}),
					new sap.m.Text({
						text: "{ExecutingDept}"
					}),
					new sap.m.Text({
						text: "{BcRatio}"
					}),
					new sap.m.Text({
						text: "{Agency}"
					}),
					new sap.m.Text({
						text: "{RefOrdnum}"
					}),
					new sap.m.Text({
						text: "{path:'RefDate',type: 'sap.ui.model.odata.type.DateTime'}"
					}),
					new sap.m.Text({
						text: "{ValueSactioned}"
					}), new sap.m.Text({
						text: "{CurrencySanctioned}"
					}),
					new sap.m.Text({
						text: "{ApprovOrder}"
					}),
					new sap.m.Text({
						text: "{path:'ApprovDate',type: 'sap.ui.model.odata.type.DateTime'}"
					}),
					new sap.m.Text({
						text: "{ApprovStatus}"
					}),
					new sap.m.Text({
						text: "{District}"
					}),
					new sap.m.Text({
						text: "{Mandal}"
					}),
					new sap.m.Text({
						text: "{Village}"
					}),
					new sap.m.Text({
						text: "{Loksabha}"
					}),
					new sap.m.Text({
						text: "{RefAsType}"
					}),
					new sap.m.Text({
						text: "{FundingAgencyId}"
					}),
					new sap.m.Text({
						text: "{RefernAgency}"
					}),
					new sap.m.Text({
						text: "{RefNumber}"
					}),
					new sap.m.Text({
						text: "{DcwType}"
					})
				]
			});
			return oLogTemplate;
		},
		/**
		 * Event handler for closing change log dialog
		 */
		onCloseChangeLogDialog: function() {
			this._createChangeLogFrag.close();
		},
		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function(oEvent) {
			if (this.getView().getModel("appView").getProperty("/bPositionChangeLoadFC")) {
				this.getView().getModel("appView").setProperty("/bPositionChangeLoadFC", false);
				this._callFieldControl({
					action: "LOAD",
					application: "AS",
					Positionid: this.getView().getModel("appView").getProperty("/position"),
					Role: this.getView().getModel("appView").getProperty("/role")
				});
			}
			var sViewState = "",
				sDraftState = "",
				aViewState,
				oDetailViewModel = this.getModel("detailView"),
				oAppViewModel = this.getModel("appView"),
				sObjectId = oEvent.getParameter("arguments").objectId,
				stateId = oEvent.getParameter("arguments").stateId,
				oParam = this.getOwnerComponent().getComponentData().startupParameters.Mode;
			if (oParam) {
				oDetailViewModel.setProperty("/Mode", oParam[0]);
			}
			if (stateId.indexOf(":") !== -1) {
				aViewState = stateId.split(":");
				sViewState = aViewState[0];
				sDraftState = aViewState[1];
			} else {
				sViewState = stateId;
			}
			//			oDetailViewModel.setProperty("/stateId", sViewState);
			oDetailViewModel.setProperty("/DraftStatus", sDraftState);
			this._authorizeUser(sObjectId);
			if (sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/bNavtoAsfromDocFlow")) {
				sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bNavtoAsfromDocFlow", false);
				this._notAllowEditOnDocument();
			} else {
				if (sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/bUserCreateAS")) {
					sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", false);
					this._changeFullScreenMode(true, "detail", "MasterPage", "asIdBtnScreenToggle");
					this._allowEditOnDocument();
				} else {
					this._notAllowEditOnDocument();
				}
			}
			//			var bEditable = false;
			//			if (sViewState !== "D") {
			//				bEditable = true;
			//				//Enabling/desabling the control based on Visible Mode of Detail view
			//				oAppViewModel.setProperty("/bEnabledMasterViewCtr", false);
			//				oAppViewModel.setProperty("/sMasterListMode", "None");
			//			} else {
			//
			//				bEditable = false;
			//				oAppViewModel.setProperty("/bEnabledMasterViewCtr", true);
			//				oAppViewModel.setProperty("/sMasterListMode", "SingleSelectMaster");
			//			}
			//			oDetailViewModel.setProperty("/bEditable", bEditable);
			oAppViewModel.updateBindings();
			oAppViewModel.setProperty("/layout", "TwoColumnsMidExpanded");

			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("WrkDetailsSet", {
					Guid: sObjectId
				});
				this._bindView("/" + sObjectPath, sObjectId);
			}.bind(this));

			//Migration Call
			if ($.sap.ASNUMBER === undefined) {
				this._getMigCheckSet();
			} else {
				this._getMigCheckSet($.sap.ASNUMBER.AsNumber);
			}
			//			if (sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/bFullScreen")) {
			//				this._changeFullScreenMode(true, "detail", "MasterPage", "asIdBtnScreenToggle");
			//			}
		},

		// Migration Code Start
		_getMigCheckSet: function(data) {
			if (data === undefined) {
				var NewASNumber = this.getView().byId("idCode").getValue();
			} else {
				var NewASNumber = data;
			}
			var that = this;
			var CheckUrl = "/WrkMigCheckSet(Code='" + NewASNumber + "',AppType='ZWAS')";
			this.getOwnerComponent().getModel().read(CheckUrl, {
				success: function(oData, oResponse) {
					that.NewASNumber = oData;
					if (oData.Migrated === "X") {
						that.getView().getModel("detailView").setProperty("/Migrated", true);
					} else {
						that.getView().getModel("detailView").setProperty("/Migrated", false);
					}
				},
				error: function(error) {}
			});
		},

		onAddMigPress: function(oEvent) {
			// this._setFormReset();
			this.getView().setBusy(true);
			var that = this;
			var Url = "/WrkMigCmmSet(Guid=guid'" + oEvent.getSource().getBindingContext().getProperty("Guid") + "',AsNumber='" + this.getView()
				.byId("idCode").getValue() + "',ApplicationName='ZWAS')";
			this.getOwnerComponent().getModel().read(Url, {
				urlParameters: {
					'$expand': "WrkOldAs_Nav"
				},
				success: function(oData, oResponse) {
					that.SancDate = oData.SanDate;
					that.SancAmount = oData.SanAmount;
					var oModelTable = new sap.ui.model.json.JSONModel();
					oModelTable.setData([]);
					var aArray = [];
					for (var i = 0; i < oData.WrkOldAs_Nav.results.length; i++) {
						if (that.getModel("detailView").getProperty("/WfRole") === "C" && that.getModel("detailView").getProperty("/stateId") === "E" ||
							that.getModel("detailView").getProperty("/WfRole") === "C" && that.getModel("detailView").getProperty("/stateId") === "D" ||
							that.getModel("detailView").getProperty("/WfRole") === "A" && that.getModel("detailView").getProperty("/stateId") === "E" ||
							that.getModel("detailView").getProperty("/WfRole") === "A" && that.getModel("detailView").getProperty("/stateId") === "D") {
							var Obj = {};
							Obj.MigASEditNumber = oData.WrkOldAs_Nav.results[i].OldAsNumber;
							Obj.SancEditAmunt = oData.WrkOldAs_Nav.results[i].SanAmount;
							Obj.ASEditDescription = oData.WrkOldAs_Nav.results[i].PrjDesc;
							Obj.SanctionEditRefe = oData.WrkOldAs_Nav.results[i].SanRefNo;
							Obj.SanEditAmntEditable = false;
							Obj.MigCDSEditable = false;
						} else if (that.getModel("detailView").getProperty("/stateId") !== "D") {
							var Obj = {};
							Obj.MigASEditNumber = oData.WrkOldAs_Nav.results[i].OldAsNumber;
							Obj.SancEditAmunt = oData.WrkOldAs_Nav.results[i].SanAmount;
							Obj.ASEditDescription = oData.WrkOldAs_Nav.results[i].PrjDesc;
							Obj.SanctionEditRefe = oData.WrkOldAs_Nav.results[i].SanRefNo;
							Obj.SanEditAmntEditable = true;
							Obj.MigCDSEditable = true;
							Obj.DelteEditable = true;
						} else if (that.getModel("detailView").getProperty("/stateId") === "D") {
							var Obj = {};
							Obj.MigASEditNumber = oData.WrkOldAs_Nav.results[i].OldAsNumber;
							Obj.SancEditAmunt = oData.WrkOldAs_Nav.results[i].SanAmount;
							Obj.ASEditDescription = oData.WrkOldAs_Nav.results[i].PrjDesc;
							Obj.SanctionEditRefe = oData.WrkOldAs_Nav.results[i].SanRefNo;
							Obj.SanEditAmntEditable = false;
							Obj.MigCDSEditable = false;
							Obj.DelteEditable = false;
						}

						aArray.push(Obj);
						Obj = {};
					}
					aArray = {
						"results": aArray
					};

					oModelTable.setData([]);
					oModelTable.setData(aArray);
					that.getView().setModel(oModelTable, "TableModel");
					that.getView().getModel("TableModel").updateBindings();
					if (!that._EditMigratedASFrag) {
						var fragId = that.createId("createMigratedASDialog");
						that._EditMigratedASFrag = sap.ui.xmlfragment(fragId, "com.goap.cfms.works.as.fragment.EditMigratedASDialog", that);
						that.getView().addDependent(that._EditMigratedASFrag);
						jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that._EditMigratedASFrag);
					}
					if (oData.SanType === "") {
						that._getMigratedCreateFragControlById("goCategory").setSelected(false);
						that._getMigratedCreateFragControlById("deptCategory").setSelected(true);
						that._getMigratedCreateFragControlById("SanctionNumber2").setVisible(true);
						that._getMigratedCreateFragControlById("SanctionNumber1").setVisible(false);
						that._getMigratedCreateFragControlById("SanctionType").setVisible(false);
						that._getMigratedCreateFragControlById("ASTypeId").setVisible(false);
						that._getMigratedCreateFragControlById("ASTypeId").setSelectedKey(oData.SanType);
						that._getMigratedCreateFragControlById("sancNo").setValue("");
						that._getMigratedCreateFragControlById("sancNo1").setValue(oData.SanNumber);
					} else {
						that._getMigratedCreateFragControlById("goCategory").setSelected(true);
						that._getMigratedCreateFragControlById("deptCategory").setSelected(false);
						that._getMigratedCreateFragControlById("SanctionNumber1").setVisible(true);
						that._getMigratedCreateFragControlById("SanctionNumber2").setVisible(false);
						that._getMigratedCreateFragControlById("SanctionType").setVisible(true);
						that._getMigratedCreateFragControlById("ASTypeId").setVisible(true);
						that._getMigratedCreateFragControlById("ASTypeId").setSelectedKey(oData.SanType);
						that._getMigratedCreateFragControlById("sancNo").setValue(oData.SanNumber);
						that._getMigratedCreateFragControlById("sancNo1").setValue("");

					}

					if (oData.NonCfmsInd === "X") {
						that.NonCfmsInd = oData.NonCfmsInd;
						if (that.getModel("detailView").getProperty("/WfRole") === "C" && that.getModel("detailView").getProperty("/stateId") === "E" ||
							that.getModel("detailView").getProperty("/WfRole") === "C" && that.getModel("detailView").getProperty("/stateId") === "D" ||
							that.getModel("detailView").getProperty("/WfRole") === "A" && that.getModel("detailView").getProperty("/stateId") === "E" ||
							that.getModel("detailView").getProperty("/WfRole") === "A" && that.getModel("detailView").getProperty("/stateId") === "D" ||
							that.getModel("detailView").getProperty("/stateId") === "D") {
							that._getMigratedCreateFragControlById("sancAmount").setEditable(false);
							that._getMigratedCreateFragControlById("UpdateBtnId").setVisible(false);
							that._getMigratedCreateFragControlById("CancelBtnId").setVisible(false);
							that._getMigratedCreateFragControlById("OkBtnId").setVisible(true);
						} else if (that.getModel("detailView").getProperty("/stateId") !== "D") {
							that._getMigratedCreateFragControlById("sancAmount").setEditable(true);
							that._getMigratedCreateFragControlById("UpdateBtnId").setVisible(true);
							that._getMigratedCreateFragControlById("CancelBtnId").setVisible(true);
							that._getMigratedCreateFragControlById("OkBtnId").setVisible(false);
						}
						that._getMigratedCreateFragControlById("SanctionAmountId").setVisible(true);
						that._getMigratedCreateFragControlById("sancAmount").setValue(oData.SanAmount);
						that._getMigratedCreateFragControlById("TableBelowForm").setVisible(false);
					} else {
						that.NonCfmsInd = oData.NonCfmsInd;
						if (that.getModel("detailView").getProperty("/WfRole") === "C" && that.getModel("detailView").getProperty("/stateId") === "E" ||
							that.getModel("detailView").getProperty("/WfRole") === "C" && that.getModel("detailView").getProperty("/stateId") === "D" ||
							that.getModel("detailView").getProperty("/WfRole") === "A" && that.getModel("detailView").getProperty("/stateId") === "E" ||
							that.getModel("detailView").getProperty("/WfRole") === "A" && that.getModel("detailView").getProperty("/stateId") === "D" ||
							that.getModel("detailView").getProperty("/stateId") === "D") {
							that._getMigratedCreateFragControlById("UpdateBtnId").setVisible(false);
							that._getMigratedCreateFragControlById("CancelBtnId").setVisible(false);
							that._getMigratedCreateFragControlById("OkBtnId").setVisible(true);
						} else if (that.getModel("detailView").getProperty("/stateId") !== "D") {
							that._getMigratedCreateFragControlById("UpdateBtnId").setVisible(true);
							that._getMigratedCreateFragControlById("CancelBtnId").setVisible(true);
							that._getMigratedCreateFragControlById("OkBtnId").setVisible(false);
						}
						that._getMigratedCreateFragControlById("sancAmount").setEditable(false);
						that._getMigratedCreateFragControlById("SanctionAmountId").setVisible(false);
						that._getMigratedCreateFragControlById("sancAmount").setValue("");
						that._getMigratedCreateFragControlById("TableBelowForm").setVisible(true);
					}
					if (that.getModel("detailView").getProperty("/stateId") === "D") {
						that._getMigratedCreateFragControlById("ASDescr").setEditable(false);
						that._getMigratedCreateFragControlById("SanctionDescr").setEditable(false);
						that._getMigratedCreateFragControlById("sancAmount").setEditable(false);
						that._getMigratedCreateFragControlById("goAmount").setEditable(false);
						that._getMigratedCreateFragControlById("goCategory").setEditable(false);
						that._getMigratedCreateFragControlById("deptCategory").setEditable(false);
						that._getMigratedCreateFragControlById("sancNo").setEditable(false);
						that._getMigratedCreateFragControlById("sancNo1").setEditable(false);
						that._getMigratedCreateFragControlById("ASTypeId").setEditable(false);
						that._getMigratedCreateFragControlById("SanctionDate").setEditable(false);
						that._getMigratedCreateFragControlById("SanctionDept").setEditable(false);
						that._getMigratedCreateFragControlById("sanAuthority").setEditable(false);
					} else {
						that._getMigratedCreateFragControlById("ASDescr").setEditable(true);
						that._getMigratedCreateFragControlById("SanctionDescr").setEditable(true);
						that._getMigratedCreateFragControlById("sancAmount").setEditable(true);
						that._getMigratedCreateFragControlById("goAmount").setEditable(true);
						that._getMigratedCreateFragControlById("goCategory").setEditable(true);
						that._getMigratedCreateFragControlById("deptCategory").setEditable(true);
						that._getMigratedCreateFragControlById("sancNo").setEditable(true);
						that._getMigratedCreateFragControlById("sancNo1").setEditable(true);
						that._getMigratedCreateFragControlById("ASTypeId").setEditable(true);
						that._getMigratedCreateFragControlById("SanctionDate").setEditable(true);
						if (oData.TsFlag === true) {
							that._getMigratedCreateFragControlById("SanctionDept").setEditable(false);
						} else {
							that._getMigratedCreateFragControlById("SanctionDept").setEditable(true);
						}
						that._getMigratedCreateFragControlById("sanAuthority").setEditable(true);
					}
					that._getMigratedCreateFragControlById("SanctionDate").setValue(that.dateconv(oData.SanDate));
					that._getMigratedCreateFragControlById("sanAuthority").setValue(oData.SanAuthority);
					that._getMigratedCreateFragControlById("goAmount").setValue(oData.GoAmount);

					that._getMigratedCreateFragControlById("SanctionDept").setValue(oData.SanDepartment + "-" + oData.Beschr);
					/*	date picker only select (no need enter date) - in fragment - -start cfms_ctm_npv(28_01_23)*/
					var dateArray = ["SanctionDate"];
					// dateArray.forEach(date => {
					// var oDatePicker = sap.ui.getCore().byId(date);
					var oDatePicker = that._getMigratedCreateFragControlById("SanctionDate");
					// var oDatePicker = 	this._getMigratedCreateFragControlById("sancDate").getId();
					// var oDatePicker = this.getView().byId(date);
					oDatePicker.addEventDelegate({
						onAfterRendering: function() {
							var oDateInner = this.$().find('.sapMInputBaseInner');
							// var oDateInner = this._getMigratedCreateFragControlById("sancDate").$().find('.sapMInputBaseInner');
							var oID = oDateInner[0].id;
							$('#' + oID).attr("disabled", "disabled");
						}
					}, oDatePicker);

					// sap.ui.getCore().byId("sancDate").setMaxDate(new Date());
					// sap.ui.getCore().byId("sancDate").setMaxDate(new Date());
					/*		date picker only select (no need enter date) - in fragment --End - cfms_ctm_npv(28_01_23)*/
					that._EditMigratedASFrag.open();
					that.getView().setBusy(false);
				},
				error: function(error) {}
			});
		},

		_getMigratedCreateFragControlById: function(sControlId) {
			return sap.ui.core.Fragment.byId(this.createId("createMigratedASDialog"), sControlId);
		},

		OnpressAddnewRow: function(oEvent) {

			var oCreateNewASModel = this.getModel("createNewASModel");
			var Obj = {
				MigASEditNumber: "",
				SancEditAmunt: "",
				ASEditDescription: "",
				SanctionEditRefe: ""
			};
			var data = this.getView().getModel("TableModel").getData().results;
			data.push(Obj);
			this.getView().getModel("TableModel").refresh();
		},

		OnpressDelete: function(oEvent) {

			var RowId = oEvent.getSource().getId().split("-")[10];
			this.getView().getModel("TableModel").getData().results.splice(RowId, 1);
			this.getView().getModel("TableModel").refresh();
		},

		onUpdateMigratedAS: function(oEvent) {
			this.getView().setBusy(true);
			var that = this;
			var sanAMount = "0";
			if (that.NonCfmsInd === "") {
				for (var i = 0; i < this.getView().getModel("TableModel").getData().results.length; i++) {
					var sanAMount = Number(sanAMount) + Number(this.getView().getModel("TableModel").getData().results[i].SancAmunt);
					var RowTable = i + 1;
					if (this.getView().getModel("TableModel").getData().results[i].MigASNumber === "") {
						sap.m.MessageBox.error("Please Enter the Old AS Number in Row '" + RowTable + "'. ");
						return;
					} else if (this.getView().getModel("TableModel").getData().results[i].SancAmunt === "") {
						sap.m.MessageBox.error("Please Enter the Old AS Number in Row '" + RowTable + "'. ");
						return;
					}
				}
			}

			var category, sancno;
			if (this._getMigratedCreateFragControlById("goCategory").getSelected()) {
				category = 'GO';
				sancno = that._getMigratedCreateFragControlById("sancNo").getValue();
			} else {
				category = 'DEP';
				sancno = that._getMigratedCreateFragControlById("sancNo1").getValue();
			}
			var Arry = [];
			var Obj = {};
			for (var i = 0; i < this.getView().getModel("TableModel").getData().results.length; i++) {
				Obj.ApplicationName = "ZWAS";
				Obj.OldAsNumber = this.getView().getModel("TableModel").getData().results[i].MigASEditNumber;
				if (this.getView().getModel("TableModel").getData().results[i].SancEditAmunt === "") {
					Obj.SanAmount = "0.00";
				} else {
					Obj.SanAmount = this.getView().getModel("TableModel").getData().results[i].SancEditAmunt;
				}
				Obj.SanRefNo = this.getView().getModel("TableModel").getData().results[i].SanctionEditRefe;
				Obj.PrjDesc = this.getView().getModel("TableModel").getData().results[i].ASEditDescription;
				Arry.push(Obj);
				Obj = {};
			}
			var dt = that._DateCoversion(that._getMigratedCreateFragControlById("SanctionDate").getValue());
			// oEvent.getSource().getBindingContext().getProperty("Guid")
			if (that._getMigratedCreateFragControlById("sancAmount").getValue() === "") {
				var Sanamnt = "0.00";
			} else {
				var Sanamnt = that._getMigratedCreateFragControlById("sancAmount").getValue();
			}
			var SanDepartment = "";
			if (this.getOwnerComponent().getModel("migratedModel").getData().beschr === "") {
				SanDepartment = this._getMigratedCreateFragControlById("SanctionDept").getValue().split("-")[0];
			} else {
				SanDepartment = this.getOwnerComponent().getModel("migratedModel").getData().beschr;
			}
			var migratedPayloadData = {
				Action: 'MIGSAVE',
				Guid: oEvent.getSource().getBindingContext().getProperty("Guid"),
				// OldAsNumber: that.oldASNumber,
				SanDate: dt,
				SanType: that._getMigratedCreateFragControlById("ASTypeId").getSelectedKey(),
				SanNumber: sancno,
				SanAmount: Sanamnt,
				GoAmount: that._getMigratedCreateFragControlById("goAmount").getValue(),
				SanAuthority: this._getMigratedCreateFragControlById("sanAuthority").getValue().split(" ")[0],
				SanCategory: category,
				SanDes: "X",
				SanDepartment: SanDepartment,
				Beschr: "",
				AsNumber: that.getView().byId("idCode").getValue(),
				NonCfmsInd: that.NonCfmsInd,
				Position: that.getModel("appView").getProperty("/position"),
				WrkOldAs_Nav: Arry,
				TsFlag: false
			};
			// below code added by SAGAR to clear the dependent field when user changes the sanction dept in mig screen
			if (SanDepartment !== this.getView().getBindingContext().getProperty("InitiatinDept")) {
				this.bSanctionDeptUpdateMig = true;
			} else {
				this.bSanctionDeptUpdateMig = false;
			}
			this._saveMigratedASData(migratedPayloadData);
		},

		_DateCoversion: function(value) {
			// var d = value.split(".")[0];
			// var m = value.split(".")[1];
			// var y = value.split(".")[2];
			// var FullDate = m + "." + d + "." + y;
			// return FullDate;
			var dt2 = value.split(".");
			if (dt2[1] === "01" && dt2[0] === "31" || dt2[1] === "03" && dt2[0] === "31" || dt2[1] === "05" && dt2[0] === "31" || dt2[1] ===
				"07" && dt2[0] === "31" || dt2[1] === "08" && dt2[0] === "31" || dt2[1] === "10" && dt2[0] === "31" || dt2[1] ===
				"12" && dt2[0] === "31") {
				dt2[0] = "01";
				if (dt2[1] === "12") {
					dt2[1] = "01";
					dt2[2] = parseInt(dt2[2]) + 1;
				} else {
					dt2[1] = parseInt(dt2[1]) + 1;
				}
			} else if (dt2[1] === "04" && dt2[0] === "30" || dt2[1] === "06" && dt2[0] === "30" || dt2[1] === "09" && dt2[0] === "30" || dt2[1] ===
				"11" && dt2[0] === "30") {
				/* old code -start*/
				// dt2[1] = "01";
				// dt2[2] = parseInt(dt2[2]) + 1;
				/* old code -end*/
				/*code changed on - cfms_ctm_npv -(23_01_23) -start*/
				dt2[0] = "01";
				dt2[1] = parseInt(dt2[1]) + 1;
				/*code changed on - cfms_ctm_npv -(23_01_23) -end*/
			} else if (dt2[1] === "02" && dt2[0] === "28" || dt2[1] === "02" && dt2[0] === "29") {
				/* old code -start*/
				// dt2[0] = "01";
				// dt2[1] = parseInt(dt2[1]) + 1;
				/* old code -end*/
				/*code changed on - cfms_ctm_npv -(23_01_23) -start*/
				dt2[0] = "01";
				dt2[1] = parseInt(dt2[1]) + 1;
				/*code changed on - cfms_ctm_npv -(23_01_23) -end*/
			} else if (dt2[1] === "01" && dt2[0] !== "31" || dt2[1] === "03" && dt2[0] !== "31" || dt2[1] === "05" && dt2[0] !== "31" || dt2[1] ===
				"07" && dt2[0] !== "31" || dt2[1] === "08" && dt2[0] !== "31" || dt2[1] === "10" && dt2[0] !== "31" || dt2[1] ===
				"12" && dt2[0] !== "31") {
				dt2[0] = parseInt(dt2[0]) + 1;
			} else if (dt2[1] === "04" && dt2[0] !== "30" || dt2[1] === "06" && dt2[0] !== "30" || dt2[1] === "09" && dt2[0] !== "30" || dt2[1] ===
				"11" && dt2[0] !== "30") {
				dt2[0] = parseInt(dt2[0]) + 1;
			} else if (dt2[1] === "02" && dt2[0] !== "28" || dt2[1] === "02" && dt2[0] !== "29") {
				dt2[0] = parseInt(dt2[0]) + 1;
			}

			function addZero(i) {
				if (i < 10) {
					i = "0" + i;
				}
				return i;
			}
			if (dt2[1].toString().length === 1) {
				dt2[1] = addZero(dt2[1]);
			}
			if (dt2[0].toString().length === 1) {
				dt2[0] = addZero(dt2[0]);
			}
			/*eslint-disable */
			//eslint-disable-no-implicit-coercion
			var dt = "" + dt2[2] + "" + dt2[1] + "" + dt2[0] + "";
			var dt1 = "" + dt.toString().slice(4, 6) + "." + dt.toString().slice(6, 8) + "." + dt.toString().slice(0, 4) + "";
			var Fulldate = "\/Date(" + new Date(dt1).getTime() + ")\/";
			return Fulldate;
			/*eslint-enable */
		},
		_saveMigratedASData: function(data) {
			var that = this;
			this.getOwnerComponent().getModel().create("/WrkMigCmmSet", data, {
				method: 'POST',
				success: function(oData, oResponse) {
					that.payloadData = oData;
					$.sap.ASNUMBER = oData;
					// below code a
					if (that.bSanctionDeptUpdateMig) {
						that.getModel().setProperty(that.byId("idExecDept").getBindingContext().getPath() + "/ExecutingDept", "");
						that.byId("idWorksSrcHoA").getBinding("items").refresh(true);
						that.byId("idWorksHoA").getBinding("items").refresh(true);
						// that.getView().getElementBinding().refresh();
						// that.byId("idExecDept").fireChange();
					}
					if (that._getMigratedCreateFragControlById("fileUpload").getSelected()) {
						if (!that._poUploadFragment) {
							that._poUploadFragment = sap.ui.xmlfragment("com.goap.cfms.works.as.fragment.POUpload", that);
							that.getView().addDependent(that._poUploadFragment);
						}
						if (that.getOwnerComponent().getModel("uploadedItem") != undefined) {
							that.getOwnerComponent().getModel("uploadedItem").setData([]);
							that.getOwnerComponent().getModel("uploadedItem").refresh();
							that.getOwnerComponent().getModel("uploadedItem").updateBindings();
							sap.ui.getCore().byId("fileUpload").setValue("");
						}
						that._poUploadFragment.open();
					} else {
						that._EditMigratedASFrag.close();
						that.getView().setBusy(false);
						that.getRouter().navTo("Detail", {
							objectId: oData.Guid,
							stateId: "C"
						}, true);
					}
				},
				error: function(error) {
					// sap.m.MessageBox.error("" + JSON.parse(error.responseText).error.message.value + "", {
					// 	actions: [sap.m.MessageBox.Action.OK],
					// 	onClose: function (sAction) {
					// 		if (sAction === "OK" || sAction === null) {}
					// 	}
					// });
				}
			});
		},

		OnPressCloseFrag: function(oEvent) {
			var that = this;
			that._EditMigratedASFrag.close();
			// that._EditMigratedASFrag.destroy();
		},

		OnPressOkCloseFrag: function(oEvent) {
			var that = this;
			that._EditMigratedASFrag.close();
			// that._EditMigratedASFrag.destroy();
		},

		dateconv: function(value) {
			var res = String(value).slice(4, 15);
			var m = res.slice(0, 3);
			var d = res.slice(4, 6);
			var y = res.slice(7, 15);
			switch (m) {
				case "Jan":
					m = "01";
					break;

				case "Feb":
					m = "02";
					break;

				case "Mar":
					m = "03";
					break;

				case "Apr":
					m = "04";
					break;

				case "May":
					m = "05";
					break;

				case "Jun":
					m = "06";
					break;

				case "Jul":
					m = "07";
					break;

				case "Aug":
					m = "08";
					break;

				case "Sep":
					m = "09";
					break;

				case "Oct":
					m = "10";
					break;

				case "Nov":
					m = "11";
					break;

				case "Dec":
					m = "12";
					break;
			}
			var frmdatemil = d + "." + m + "." + y;
			return frmdatemil;
		},

		// Migration Code Ends
		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @param {guid} sObjectId is the guid of the view to bind
		 * @private
		 */
		_bindView: function(sObjectPath, sObjectId) {
			var that = this,
				oLocationModel = this.getModel("location");
			// Local JSON model to set visibility of location 
			var oLocationModelData = {
				vDistrict: false,
				vMandal: false,
				vVillage: false,
				vLoksabha: false,
				vAssembly: false,
				bLoc: true,
				bConst: true
			};
			if (!oLocationModel) {
				oLocationModel = new JSONModel(oLocationModelData);
				this.setModel(oLocationModel, "location");
			} else {
				oLocationModel.setProperty("/", oLocationModelData);
			}

			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");
			this.getModel().invalidateEntry(this.getView().getBindingContext());
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					dataRequested: function() {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function(oData) {
						that.getModel().resetChanges();
						// oViewModel.setProperty("/busy", false);
						// 	that.getWorkFlowLogDetails({
						// 		ApplicationId : "AS",
						// 		Guid : sObjectId
						// });
						var oPromiseWorkFlowLog = new Promise(function(resolve1, reject1) {
							that.getWorkFlowLogDetails({
								ApplicationId: "AS",
								Guid: sObjectId
							}, resolve1, reject1);
						}.bind(that));
						oPromiseWorkFlowLog.then(function() {
							oViewModel.setProperty("/busy", false);
						});
						oViewModel.setProperty("/Notingstring", "");
						oViewModel.updateBindings();
						that.subClassL01Value = that.getView().getBindingContext().getProperty("SubclassL01");
						that.byId("idSubClass01").getBinding("suggestionItems").refresh();
						that.byId("idSubClass02").getBinding("suggestionItems").refresh();
						that.byId("idSubClass03").getBinding("suggestionItems").refresh();

						that.getView().getModel("detailView").setProperty("/CategoryKey", that.getView().getBindingContext().getProperty("Category"));
						that.getView().getModel("detailView").setProperty("/ExecutingDeptKey", that.getView().getBindingContext().getProperty(
							"ExecutingDept"));
						that.getView().getModel("detailView").setProperty("/SanctioningDeptKey", that.getView().getBindingContext().getProperty(
							"InitiatinDept"));

						that.getUserFeedList();
						that._setObjectSectionVisibility();
						that._setLocationListDisplay();
						if (that._clearValueStates) {
							that._clearValueStates("oControlModel");
						}
						that._switchControlModel();
						that._setAmendPageTitle(that.getModel("detailView").getProperty("/stateId"));
						//set the Object  Header Title
						that.setPageHeaderTitle(that.getModel("detailView").getProperty("/stateId"));
						//	that._bindTreeTableRows();
						that.byId("idWorksHoA").updateAggregation("items");
						that._identifyHoaDdoFilters();
						that._setHoaDdoFilters();
						//Bind Position
						that._updatePositionBinding();
						//Clear MainworkNature
						that._initControlValue();
						//Dynamic BindingLocal Class and catory
						that._bindSelectControl();
						//Dynamic enable of Executing Dept if No TS is create with this AS
						that._editableExectDepartment();

						var aAttachFilters = new Filter({
							filters: [
								new Filter("DocType", "EQ", 'ZWAS')
							],
							and: true
						});
						that.byId("idUploadCollection").getBinding("items").filter(aAttachFilters);

						var documentPosition;
						if (that.getView().getBindingContext().getProperty("Udf1")) {
							documentPosition = that.getView().getBindingContext().getProperty("Udf1");
						} else {
							documentPosition = this.getModel("appView").getProperty("/position");
						}
						var aFilters = [];
						var oFilter = new Filter(
							"UserPosition",
							sap.ui.model.FilterOperator.Contains, documentPosition
						);
						aFilters.push(oFilter);
						//			            if (oData.getParameters().data.MigrationInd) {
						var oFilterGuid = new Filter(
							"ASGuid",
							sap.ui.model.FilterOperator.EQ, oData.getParameters().data.MigrationInd === false ? "00000000-0000-0000-0000-000000000000" :
							sObjectId
						);
						aFilters.push(oFilterGuid);
						//			            }
						that.getView().byId("idInitDept").getBinding("items").filter(aFilters);
						//	that.getView().byId("idInitDept").getBinding("items").refresh();

						oViewModel.setProperty("/busy", false);
					}
				}
			});

			this._bindViewDone();
			var oChecklistTableBinding = this.byId("idChecklistTable").getBinding("items");
			var sFlmFilter = sObjectPath.substring(20, sObjectPath.length - 2);
			oChecklistTableBinding.filter([new Filter("ApplicationId", FilterOperator.EQ, "ZWAS"), new Filter("FlmGuid", FilterOperator.EQ,
				sFlmFilter)]);
			//		this.getModel().refresh(true);

		},
		/**
		 * Internal method to return the name of the field
		 * @param {String} sFName Name of the specific field
		 * @returns {String} Name of the field
		 */
		_getFieldName: function(sFName) {
			var sFieldName = "";
			if (sFName === "District" || sFName === "Mandal" || sFName === "Village") {
				sFieldName = "LocationDetails";
			} else if (sFName === "Constituency") {
				sFieldName = "AssemblyDetails";
			} else {
				sFieldName = "ConstituencyDetails";
			}
			return sFieldName;
		},
		/**
		 * Internal method to convert tokens to string and return the same with separators
		 * @param {Event} oEvent On recieving a token in the controller
		 * @returns {String} Value of the token as a string
		 */
		_getTokensAsString: function(oEvent) {
			var aTokenset = [],
				bRemovetokenAction = false,
				sRemoveTokenKey = "",
				aTokens = oEvent.getSource().getTokens(),
				sCustomeControlText = oEvent.getSource().getCustomData()[0].getValue();
			if (aTokens.length > 0) {
				for (var i = 0; i < aTokens.length; i++) {
					if (oEvent.getParameter("type") === "removed") {
						bRemovetokenAction = true;
						sRemoveTokenKey = oEvent.getParameter("removedTokens")[0].getKey();
					}
					if (bRemovetokenAction) {
						if (aTokens[i].getKey() !== sRemoveTokenKey) {
							aTokenset.push(aTokens[i].getKey());
						}
					} else {
						aTokenset.push(aTokens[i].getKey());
					}
				}
			}
			var sTokenASString = aTokenset.join("$");
			if (sTokenASString.indexOf("#") === -1) {
				if (sCustomeControlText === "District") {
					sTokenASString = "D" + "#" + sTokenASString;
				} else if (sCustomeControlText === "Mandal") {
					sTokenASString = "M" + "#" + sTokenASString;
				} else if (sCustomeControlText === "Village") {
					sTokenASString = "V" + "#" + sTokenASString;
				} else if (sCustomeControlText === "LokSabha") {
					sTokenASString = "L" + "#" + sTokenASString;
				} else {
					sTokenASString = "A" + "#" + sTokenASString;
				}
			}
			return sTokenASString;
		},
		/**
		 * Internal Method to set the Call Property for a change in the DDO table
		 * @param {EventSource} oSource Source of the event for Property Call during saving
		 */
		_setPropertyCall: function(oSource, sType, oBusyControl) {
			var that = this,
				oBindingContext = oSource.getBindingContext(),
				bNewItem = false,
				oDetailViewModelData = this.getModel("detailView").getProperty("/"),
				sAction = "",
				oHoaPayload,
				sUpdPath,
				sBindingPath = oSource.data("bindPath"),
				oHoaGuid = oBindingContext.getProperty("HoaGuid"),
				oLockTimestamp = oBindingContext.getProperty("LockTimestamp");

			if (!oHoaGuid) {
				if (oDetailViewModelData.SubmitBtnVisibility === "X") {
					sAction = sType === "TGT" ? "INSRI" : "SNSRI";
				} else {
					sAction = "APPR_UPDT";
				}
				bNewItem = true;
				oHoaGuid = "00000000-0000-0000-0000-000000000000";
				oLockTimestamp = "\/Date(" + (new Date()).getTime() + ")\/";
			} else {
				if (oDetailViewModelData.SubmitBtnVisibility === "X") {
					sAction = sType === "TGT" ? "UPDTI" : "UPDTS";
				} else {
					sAction = "APPR_UPDT";
				}
			}
			if (sType === "TGT") {
				oHoaPayload = {
					Action: sAction,
					Guid: oBindingContext.getProperty("Guid"),
					HoaGuid: oHoaGuid,
					LockTimestamp: oLockTimestamp,
					ItemNo: (oBindingContext.getProperty("ItemNo") || "0000"),
					Ddo: (oBindingContext.getProperty("Ddo") || ""),
					DdoDes: (oBindingContext.getProperty("DdoDes" || "")),
					Hoa: (oBindingContext.getProperty("Hoa") || ""),
					Zshare: (oBindingContext.getProperty("Zshare") || "0"),
					FundAgencyDesc: (oBindingContext.getProperty("FundAgencyDesc") || ""),
					RefNumber: (oBindingContext.getProperty("RefNumber") || "0"),
					ValidFrom: (oBindingContext.getProperty("ValidFrom") || new Date()),
					ValidTo: (oBindingContext.getProperty("ValidTo") || new Date("12/31/9999"))
				};
				sUpdPath = this.getModel().createKey("WrkHOASet", {
					Guid: oBindingContext.getProperty("Guid"),
					HoaGuid: oHoaPayload.HoaGuid
				});
			} else {
				oHoaPayload = {
					Action: sAction,
					Guid: oBindingContext.getProperty("Guid"),
					HoaGuid: oHoaGuid,
					LockTimestamp: oLockTimestamp,
					ItemNo: (oBindingContext.getProperty("ItemNo") || "0000"),
					SourceDdo: (oBindingContext.getProperty("SourceDdo") || ""),
					SourceHoa: (oBindingContext.getProperty("SourceHoa") || ""),
					SourceZShare: (oBindingContext.getProperty("SourceZShare") || "0"),
					FundAgencyDesc: (oBindingContext.getProperty("FundAgencyDesc") || ""),
					PicsCode: (oBindingContext.getProperty("PicsCode") || ""),
					SourceValidFrom: (oBindingContext.getProperty("ValidFrom") || new Date()),
					SourceValidTo: (oBindingContext.getProperty("ValidTo") || new Date("12/31/9999"))
				};
				sUpdPath = this.getModel().createKey("WrkDcwHOADDOSet", {
					Guid: oBindingContext.getProperty("Guid"),
					HoaGuid: oHoaPayload.HoaGuid
				});
			}

			if (bNewItem) {
				sUpdPath = sType === "TGT" ? "/WrkHOASet" : "/WrkDcwHOADDOSet";
				this.getModel().create(sUpdPath, oHoaPayload, {
					success: function(oData, oResponse) {
						that.byId("idWorksHoA").getBinding("items").refresh();
						that.byId("idWorksSrcHoA").getBinding("items").refresh();
						if (oBusyControl) {
							oBusyControl.setBusy(false);
						}
					},
					error: function(oError) {
						if (oBusyControl) {
							oBusyControl.setBusy(false);
						}
					},
					refreshAfterChange: false
				});
			} else {
				sUpdPath = "/" + sUpdPath;
				this.getModel().update(sUpdPath, oHoaPayload, {
					success: function(oData, oResponse) {
						if (sBindingPath === "SourceHoa" || sBindingPath === "Hoa") {
							if (sBindingPath === "SourceHoa") {
								that.byId("idWorksSrcHoA").getBinding("items").refresh();
							} else {
								that.byId("idWorksHoA").getBinding("items").refresh();
							}
						}
						if (oBusyControl) {
							oBusyControl.setBusy(false);
						}
					},
					error: function(oError) {
						if (oBusyControl) {
							oBusyControl.setBusy(false);
						}
					},
					refreshAfterChange: false
				});
			}
		},
		/**
		 * Internal Method to create a new Column List Item for the DDO Table
		 * @private
		 * @returns {Object} Template for items on the list
		 */
		_returnListItemTemplate: function() {
			var oListItemTemplate, that = this,
				oDdo = new sap.m.Input({
					change: that.onDdoChange.bind(that),
					placeholder: "{i18n>detail.ops.panel.content.table.column.text.PDDO}",
					maxLength: "{oControlModel>/Ddo/maxLength}",
					value: "{DdoDes}",
					showValueHelp: true,
					valueHelpOnly: true,
					valueHelpRequest: that.handleDDOValueHelp.bind(that),
					type: "{oControlModel>/Ddo/type}",
					valueState: "{oControlModel>/Ddo/valueState}",
					valueStateText: "{oControlModel>/Ddo/valueStateText}",
					editable: "{= ${oControlModel>/Ddo/display} && ${detailView>/bEditable} ? true: false}",
					tooltip: "{Ddo}"
				});
			oDdo.data("bindPath", "Ddo");
			var oHoa = new sap.m.Input({
				change: that.onDdoChange.bind(that),
				placeholder: "{i18n>detail.ops.panel.content.table.column.text.PHeadOfAccount}",
				maxLength: "{oControlModel>/Hoa/maxLength}",
				value: "{Hoa}",
				showValueHelp: true,
				valueHelpOnly: true,
				valueHelpRequest: that.handleHoaValueHelp.bind(that),
				type: "{oControlModel>/Hoa/type}",
				valueState: "{= ${oControlModel>/Hoa/valueState}}",
				valueStateText: "{oControlModel>/Hoa/valueStateText}",
				editable: "{= ${oControlModel>/Hoa/display} && ${detailView>/bEditable} ? true: false}",
				tooltip: "{Hoa}"
			});
			oHoa.data("bindPath", "Hoa");
			var oValidFrom = new sap.m.DatePicker({
				change: that.onDdoChange.bind(that),
				value: "{path:'ValidFrom', type:'sap.ui.model.type.Date', formatOptions: { style: 'medium', strictParsing: true, UTC: true}}",
				editable: "{detailView>/bEditable}"
			});
			oValidFrom.data("bindPath", "ValidFrom");
			var oValidTo = new sap.m.DatePicker({
				change: that.onDdoChange.bind(that),
				value: "{path:'ValidTo', type:'sap.ui.model.type.Date', formatOptions: { style: 'medium', strictParsing: true, UTC: true}}",
				editable: "{detailView>/bEditable}"
			});
			oValidTo.data("bindPath", "ValidTo");

			oListItemTemplate = new sap.m.ColumnListItem({
				cells: [
					// add created controls to item
					new sap.m.Text({
						type: "Text",
						value: "{HoaGuid}"
					}),
					new sap.m.Input({
						value: "{ItemNo}",
						editable: false,
						textDirection: "RTL"
					}),
					oDdo,
					oHoa,
					new sap.m.Input({
						change: that.onDdoShareChange.bind(that),
						placeholder: "{i18n>detail.ops.panel.content.table.column.text.PShare}",
						value: "{Zshare}",
						enabled: "{detailView>/bEditable}",
						editable: "{detailView>/bEditable}",
						textDirection: "LTR",
						textAlign: "Right"
					}),

					new sap.m.Input({
						change: that.onDdoChange.bind(that),
						value: "{RefNumber}",
						enabled: "{detailView>/bEditable}",
						editable: "{detailView>/bEditable}",
						textDirection: "LTR",
						visible: false
					}),
					new sap.m.Input({
						value: "{FundAgencyDesc}",
						editable: false,
						tooltip: "{FundAgencyDesc}"
					}),
					oValidFrom,
					oValidTo,
					new sap.m.Button({
						icon: "sap-icon://delete",
						type: "Transparent",
						press: that.onDeleteDDO.bind(that),
						visible: "{= ${detailView>/bEditable} ? true: false}"
					}),
					new sap.m.Text({
						text: "",
						visible: false,
						textDirection: "LTR"
					})
				]
			});
			return oListItemTemplate;
		},
		/**
		 * Internal Method to create a new Column List Item for the DDO Table
		 * @private
		 * @returns {Object} Template for items on the list
		 */
		_returnSrcListItemTemplate: function() {
			var oListItemTemplate,
				that = this;
			//Setting Control for DDO VH
			var oSrcDdo = new sap.m.Input({
				change: that.onSrcDdoChange.bind(that),
				placeholder: "{i18n>detail.ops.panel.content.table.column.text.PsrcDDO}",
				maxLength: "{oControlModel>/SourceDdo/maxLength}",
				value: "{DdoDes}",
				showValueHelp: true,
				valueHelpOnly: true,
				valueHelpRequest: that.handleDDOValueHelp.bind(that),
				type: "{oControlModel>/Ddo/type}",
				valueState: "{oControlModel>/SourceDdo/valueState}",
				valueStateText: "{oControlModel>/SourceDdo/valueStateText}",
				editable: "{= ${oControlModel>/SourceDdo/display} && ${detailView>/bEditable} && (${detailView>/SubmitBtnVisibility} === 'X' ? true: false)}",
				tooltip: "{SourceDdo}"
			});
			oSrcDdo.data("bindPath", "SourceDdo");
			//Setting Control for HOA VH
			var oSrcHoa = new sap.m.Input({
				change: that.onSrcDdoChange.bind(that),
				placeholder: "{i18n>detail.ops.panel.content.table.column.text.PsrcHOA}",
				maxLength: "{oControlModel>/SourceHoa/maxLength}",
				value: "{SourceHoa}",
				showValueHelp: true,
				valueHelpOnly: true,
				valueHelpRequest: that.handleHoaValueHelp.bind(that),
				type: "{oControlModel>/SourceHoa/type}",
				valueState: "{= ${oControlModel>/SourceHoa/valueState}}",
				valueStateText: "{oControlModel>/SourceHoa/valueStateText}",
				editable: "{= ${oControlModel>/SourceHoa/display} && ${detailView>/bEditable} && (${detailView>/SubmitBtnVisibility} === 'X' ? true: false)}",
				tooltip: "{SourceHoa}"
			});
			oSrcHoa.data("bindPath", "SourceHoa");

			//Setting Control for Pic Code VH
			// var oPicsCode = new sap.m.Input({
			// 	change:that.onSrcDdoChange.bind(that),
			// 	value:"{PicsCode}",
			// 	required:"{= ${oControlModel>/PicsCode/mandatory}}",
			// 	showValueHelp:true,
			// 	valueHelpRequest:that.handlePicCodeValueHelp.bind(that),
			// 	editable:"{= ${oControlModel>/PicsCode/display} && ${detailView>/bEditable} && (${detailView>/SubmitBtnVisibility} === 'X' ? true: false) && (${PicsCode} !== '' ? true : false)}",
			// 	valueState:"{oControlModel>/PicsCode/valueState}",
			// 	valueStateText:"{oControlModel>/PicsCode/valueStateText}" ,
			// 	maxLength:"{oControlModel>/PicsCode/maxLength}" ,
			// 	type:"{oControlModel>/PicsCode/type}",
			// 	tooltip:"{PicsCode}"
			// });
			// oPicsCode.data("bindPath", "PicCode");

			//Setting Control for Date
			var oSrcValidFrom = new sap.m.DatePicker({
				change: that.onSrcDdoChange.bind(that),
				placeholder: "{i18n>detail.ops.panel.content.table.column.text.PvalidFrom}",
				value: "{path:'SourceValidFrom', type:'sap.ui.model.type.Date', formatOptions: { style: 'medium', strictParsing: true, UTC: true}}",
				editable: "{detailView>/bEditable}"
			});
			oSrcValidFrom.data("bindPath", "SourceValidFrom");

			//Setting Control for Date
			var oSrcValidTo = new sap.m.DatePicker({
				change: that.onSrcDdoChange.bind(that),
				placeholder: "{i18n>detail.ops.panel.content.table.column.text.PvalidTo}",
				value: "{path:'SourceValidTo', type:'sap.ui.model.type.Date', formatOptions: { style: 'medium', strictParsing: true, UTC: true}}",
				editable: "{detailView>/bEditable}"
			});
			oSrcValidTo.data("bindPath", "SourceValidTo");

			oListItemTemplate = new sap.m.ColumnListItem({
				cells: [
					// add created controls to item
					new sap.m.Text({
						type: "Text",
						value: "{HoaGuid}"
					}),
					new sap.m.Input({
						value: "{ItemNo}",
						editable: false,
						textDirection: "RTL"
					}),
					oSrcDdo,
					oSrcHoa,
					new sap.m.Input({
						value: "{FundAgencyDesc}",
						editable: false,
						tooltip: "{FundAgencyDesc}"
					}),
					// new sap.m.Input({
					// 	change:that.onDdoShareChange.bind(that),
					// 	value:"{SourceZshare}",
					// 	enabled:"{detailView>/bEditable}",
					// 	editable:"{detailView>/bEditable}", 
					// 	textDirection:"RTL"
					// }),
					// oPicsCode,
					oSrcValidFrom,
					oSrcValidTo,
					new sap.m.Button({
						icon: "sap-icon://delete",
						type: "Transparent",
						press: that.onDeleteDDO.bind(that),
						visible: "{= ${detailView>/bEditable} && (${detailView>/SubmitBtnVisibility} === 'X' ? true: false)}"
					})
				]
			});
			return oListItemTemplate;
		},
		/**
		 * Function for calling _bindSuggestionItems function for binding suggestion Items
		 * @param {object} oInputSource 
		 */
		_callingBindingParams: function(oInputSource) {
			var oEntityInfo = oInputSource.data("entityInfo"),
				oParams = {
					oInputSource: oInputSource,
					sProperty: oInputSource.data("text"),
					sKey: oInputSource.data("key"),
					oVHData: this._getVHEntityDetail(oEntityInfo)
				};
			this._bindSuggestionItems(oParams, function() {
				var oObject = oInputSource.getBindingContext().getObject(),
					sPropertyKey = oObject[oInputSource.data("bindPath")];

				//edit mode AS Document go to estimate come back subClassL01 property value changing 
				//so we did some patch up
				if (oInputSource.data("bindPath") === "SubclassL01") {
					oInputSource.setSelectedKey(this.subClassL01Value);
				} else {
					oInputSource.setSelectedKey(sPropertyKey);
				}
				// oInputSource.setSelectedKey(sPropertyKey);
				this.byId("idCode").focus();
				oInputSource.getBinding("suggestionItems").attachEvent("dataReceived", this.onSuggestDataReceived.bind(this));
			}.bind(this));
		},
		/**
		 * Internal method for confirming delete action
		 * @param {sap.ui.base.Event} oParams 
		 */
		_onDeleteConfirmation: function(oParams) {
			var oSource = oParams.source,
				oBindingContext = oSource.getBindingContext(),
				sPath = oBindingContext.getPath();
			if (oParams.guid) {
				var oDeleteItem = new Promise(function(resolve, reject) {
					this.getOwnerComponent().oDraft.whenDeleteLine({
						path: sPath,
						busyControl: this.getView(),
						urlParameters: {
							Action: oParams.action
						}
					}, resolve, reject);
				}.bind(this));
				oDeleteItem.then(function(oResult) {
					this.getModel().refresh(true);
					//	this.getView().getElementBinding().refresh(true);
					MessageToast.show(this.getResourceBundle().getText("detail.message.delete.success"));
				}.bind(this));
			} else {
				var oItem = oSource.getParent(),
					oTable = oItem.getParent();
				oTable.removeItem(oItem);
				MessageToast.show(this.getResourceBundle().getText("detail.message.delete.success"));
			}
		},
		/**
		 * Private function to make location list display button editable
		 */
		_setLocationListDisplay: function() {
			var oLocationModel = this.getModel("location"),
				oBindingContext = this.getView().getBindingContext(),
				locDetailSX = oBindingContext.getProperty("LocationDetailsx"),
				locConstDetailSX = oBindingContext.getProperty("ConstituencyDetailsx");
			if (locDetailSX === "D") {
				oLocationModel.setProperty("/vDistrict", true);
				oLocationModel.setProperty("/bLoc", true);
			} else if (locDetailSX === "M") {
				oLocationModel.setProperty("/vMandal", true);
				oLocationModel.setProperty("/bLoc", true);
			} else if (locDetailSX === "V") {
				oLocationModel.setProperty("/vVillage", true);
				oLocationModel.setProperty("/bLoc", true);
			} else {
				oLocationModel.setProperty("/vVillage", false);
				oLocationModel.setProperty("/vMandal", false);
				oLocationModel.setProperty("/vDistrict", false);
				oLocationModel.setProperty("/bLoc", false);
			}
			if (locConstDetailSX === "L") {
				oLocationModel.setProperty("/vLoksabha", true);
				oLocationModel.setProperty("/bConst", true);
			} else if (locConstDetailSX === "A") {
				oLocationModel.setProperty("/vAssembly", true);
				oLocationModel.setProperty("/bConst", true);
			} else {
				oLocationModel.setProperty("/vAssembly", false);
				oLocationModel.setProperty("/vLoksabha", false);
				oLocationModel.setProperty("/bConst", false);
			}
			oLocationModel.updateBindings();
		},
		/**
		 * Internal function for change in the Detail View binding
		 */
		_onBindingChange: function() {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();
			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				/*eslint-disable */
				//eslint-disable-no-useless-return
				return;
				/*eslint-enable */
			}
		},

		/**
		 * Internal method for binding with metadata once detail view is loaded.
		 */
		_onMetadataLoaded: function() {
			// Store original busy indicator delay for the detail view
			var oViewModel = this.getModel("detailView");
			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);
		},

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function() {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function() {
			var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				// store current layout and go full screen
				this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
				this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
			}
		},
		/**
		 * function to set the Header title
		 * @param {string} sStateId Identifier for the editability state of the document
		 */
		setPageHeaderTitle: function(sStateId) {
			var oResourceBundle = this.getResourceBundle(),
				sStatus = this.getView().getBindingContext().getProperty("Status");
			if (sStateId === "D") {
				if (sStatus !== "E0006") {
					this.getModel("detailView").setProperty("/ObjectTitle", oResourceBundle.getText("detail.page.header.title.displayP"));
				} else {
					this.getModel("detailView").setProperty("/ObjectTitle", oResourceBundle.getText("detail.page.header.title.display"));
				}

			} else if (sStateId === "C") {
				this.getModel("detailView").setProperty("/ObjectTitle", oResourceBundle.getText("detail.page.header.title.create"));
			} else if (sStateId === "E") {
				this.getModel("detailView").setProperty("/ObjectTitle", oResourceBundle.getText("detail.page.header.title.edit"));
			}
			this.getModel().updateBindings();
		},
		/**
		 * Private function used for naviagation after success to detail
		 * @param {String} sState Identifier for the state of the document.
		 * @private
		 */
		_navToDetail: function(sState) {
			var sGuid = this.getView().getBindingContext().getProperty("Guid"),
				sViewState = this._getViewState(sState);
			this.getRouter().navTo("Detail", {
				objectId: sGuid,
				stateId: sViewState
			}, true);
		},
		/**
		 * Private function to get State of view
		 * @param {String} sViewState Initial View state determination
		 * @returns {String} Current State of the document
		 */
		_getViewState: function(sViewState) {
			var sState, sDraftStatus = this.getModel("detailView").getProperty("/DraftStatus");
			if (sDraftStatus) {
				sState = sViewState + ":" + sDraftStatus;
			} else {
				sState = sViewState;
			}
			return sState;
		},
		/**
		 * Private function to get the instance of ValueHelp fragment
		 * @private
		 * @returns {Object} value help dialog control
		 */
		_getHoaVH: function(oEvent, sCustomData) {
			if (this._oHOAVHDialog) {
				this._oHOAVHDialog.destroy();
				this._oHOAVHDialog = null;
			}
			if (this.oVHTemplate) {
				this.oVHTemplate.destroy();
				this.oVHTemplate = null;
			}
			var oBindingContext = this.getView().getBindingContext(),
				sExecDept = oBindingContext.getProperty("ExecutingDept"),
				sCategory = oBindingContext.getProperty("Category"),
				sBudgetCtrl = oBindingContext.getProperty("BudgetCtrl"),
				sSancDept = oBindingContext.getProperty("InitiatinDept"),
				isMigration = oBindingContext.getProperty("MigrationInd");

			if (!this._oHOAVHDialog) {
				this._oHOAVHDialog = this._createFragment(this.createId("idHoaVH"), "com.goap.cfms.works.as.fragment.hoaVH");
				this.getView().addDependent(this._oHOAVHDialog);
			}
			// create a filter for the binding
			var oSrcBindingPath = oEvent.getSource().getBindingContext().getPath();
			var sControlId = oEvent.getSource().getId();
			this.oVHTemplate = this._templateForHOADDOVH("idHOAVHList", oSrcBindingPath, sCustomData, sControlId);

			if (sCustomData === "SourceHoa") {
				this._oHOAVHDialog.bindAggregation("items", "/ZWRK_C_HOA_DCW(p_budget_ctrl='" + sBudgetCtrl + "',p_sancdept='" + sSancDept +
					"')/Set", this.oVHTemplate);
			} else {
				var aFilter = [];

				if (!sCategory) {
					var sMsgText = this.getModel("i18n").getResourceBundle().getText("detail.message.error.mandatory.hoa");
					MessageBox.show(sMsgText, {
						icon: MessageBox.Icon.WARNING,
						title: this.getModel("i18n").getResourceBundle().getText("warning.title"),
						action: MessageBox.Action.OK
					});
					return;
				}
				if (oBindingContext.getProperty("Category") === "02" && oBindingContext.getProperty("DcwType") === "02") {
					if (!sBudgetCtrl) {
						var sMsgText = this.getModel("i18n").getResourceBundle().getText("detail.message.error.mandatory.sourceHoa");
						MessageBox.show(sMsgText, {
							icon: MessageBox.Icon.WARNING,
							title: this.getModel("i18n").getResourceBundle().getText("warning.title"),
							action: MessageBox.Action.OK
						});
						return;
					}
				} else if (oBindingContext.getProperty("Category") === "04") {
					var sDDO = oEvent.getSource().getBindingContext().getProperty("Ddo");
					aFilter.push(new Filter("ddo", FilterOperator.EQ, sDDO));
				}
				var oBindingInfo = {
					path: "/ZWRK_C_HOA_V(p_category='" + sCategory + "',p_dept='" + sSancDept + "',p_budget_ctrl='" + sBudgetCtrl +
						"',p_exec_dept='" + sExecDept + "',p_migration=" + isMigration + ")/Set",
					template: this.oVHTemplate,
					filters: aFilter
				};
				this._oHOAVHDialog.bindAggregation("items", oBindingInfo);
			}

			this._oHOAVHDialog.data("CustomData", sCustomData);
			// open value help dialog filtered by the input value
			//this._valueHelpDialog.open();
			return this._oHOAVHDialog;
		},

		/**
		 * Private function to get the instance of ValueHelp fragment
		 * @private
		 * @returns {Object} value help dialog control
		 */
		_getDdoVH: function(oEvent, sCustomData) {
			if (this._oDDOVHDialog) {
				this._oDDOVHDialog.destroy();
				this._oDDOVHDialog = null;
			}
			if (this.oVHTemplate) {
				this.oVHTemplate.destroy();
				this.oVHTemplate = null;
			}
			var oBindingContext = this.getView().getBindingContext(),
				sSancDept = oBindingContext.getProperty("InitiatinDept"),
				sExecDept = oBindingContext.getProperty("ExecutingDept"),
				sUserCr = oBindingContext.getProperty("UserIdCr"),
				sDcwType = oBindingContext.getProperty("DcwType");
			if (!(sSancDept && sExecDept)) {
				var sMsgText = this.getModel("i18n").getResourceBundle().getText("detail.message.error.mandatory.ddo");
				MessageBox.show(sMsgText, {
					icon: MessageBox.Icon.WARNING,
					title: this.getModel("i18n").getResourceBundle().getText("warning.title"),
					action: MessageBox.Action.OK
				});
				return;
			}
			this._oDDOVHDialog = this._createFragment(this.createId("idDDOVH"), "com.goap.cfms.works.as.fragment.ddoVH");
			this.getView().addDependent(this._oDDOVHDialog);
			// create a filter for the binding
			var oSrcBindingPath = oEvent.getSource().getBindingContext().getPath();
			var sControlId = oEvent.getSource().getId();
			this.oVHTemplate = this._templateForHOADDOVH("idDDOVHList", oSrcBindingPath, sCustomData, sControlId);
			if (sCustomData === "SourceDdo") {
				this._oDDOVHDialog.bindAggregation("items", "/ZWRK_C_SDDO_V(p_execdept='" + sExecDept + "',p_sancdept='" + sSancDept +
					"',p_uname='" + sUserCr + "',p_DcwType='" + sDcwType + "')/Set", this.oVHTemplate);
			} else {
				this._oDDOVHDialog.bindAggregation("items", "/ZWRK_C_DDO_V(p_execdept='" + sExecDept + "',p_sancdept='" + sSancDept +
					"',p_uname='" + sUserCr + "',p_DcwType='" + sDcwType + "',p_SUBPROCESS_AREA='AS" + "')/Set", this.oVHTemplate);
			}
			this._oDDOVHDialog.data("CustomData", sCustomData);
			// open value help dialog filtered by the input value
			return this._oDDOVHDialog;
		},
		/**
		 * Private function to get the instance of ValueHelp fragment
		 * @private
		 * @returns {Object} value help dialog control
		 */
		_getPicCodeVH: function(oEvent, sCustomData) {
			if (this._oPicCodeVHDialog) {
				this._oPicCodeVHDialog.destroy();
				this._oPicCodeVHDialog = null;
			}
			var oBindingContext = this.getView().getBindingContext();

			this._oPicCodeVHDialog = this._createFragment(this.createId("idPicCodeVH"), "com.goap.cfms.works.as.fragment.picCodeVH");
			this.getView().addDependent(this._oPicCodeVHDialog);
			// create a filter for the binding
			var oSrcBindingPath = oEvent.getSource().getBindingContext().getPath();
			var oVHTemplate = this._templateForHOADDOVH("idPicCodeVHList", oSrcBindingPath, sCustomData);

			this._oPicCodeVHDialog.bindAggregation("items", "/ZWRK_C_PICCODE", oVHTemplate);
			this._oPicCodeVHDialog.data("CustomData", sCustomData);

			// open value help dialog filtered by the input value
			return this._oPicCodeVHDialog;
		},
		/**
		 * Private function to get the instance of ValueHelp fragment
		 * @private
		 * @returns {Object} value help dialog control
		 */
		getASHoaVH: function() {
			if (!this.oASHoaVH) {
				this.oASHoaVH = new VHDialog({
					component: this.getOwnerComponent(),
					id: "vhHoaAS",
					contentDensity: this.contentDensity,
					titleKey: "detail.ops.panel.content.table.column.vh.title.hoa",
					entitySet: "/ZWRK_C_HOA",
					sorter: new Sorter("hoa", false),
					bMultiSelect: false,
					key: "hoa",
					descriptionKey: "hoa",
					fields: [{
						key: "hoa",
						label: "{i18n>detail.table.ddo.hoa}",
						value: "{hoa}"
					}]
				});
			}
			return this.oASHoaVH;
		},
		/**
		 * Private function to get the instance of ValueHelp fragment
		 * @private
		 * @returns {Object} value help dialog control
		 */
		getASCurrVH: function() {
			if (!this.oASCurrVH) {
				this.oASCurrVH = new VHDialog({
					component: this.getOwnerComponent(),
					id: "vhCurrAS",
					contentDensity: this.contentDensity,
					titleKey: "detail.ops.panel.content.table.column.vh.title.curr",
					entitySet: "/ZWRK_C_CURRNKEY",
					sorter: new Sorter("waers", false),
					bMultiSelect: false,
					key: "waers",
					descriptionKey: "ktext",
					fields: [{
						key: "waers",
						label: "{/ZWRK_C_CURRNKEY/waers/#@sap:label}",
						value: "{waers}"
					}, {
						key: "ktext",
						label: "{/ZWRK_C_CURRNKEY/ktext/#@sap:label}",
						value: "{ktext}"
					}]
				});
			}
			return this.oASCurrVH;
		},
		/**
		 * To handle OK press in Location Value Help
		 * @param {object} oSource the control which triggered
		 * @param {sap.ui.base.event} oEvent object
		 * @returns {boolean} Whether ok or not.
		 */
		_handleOk: function(oSource, oEvent) {
			var oControl = oSource.getCustomData()[0].getValue(),
				oTable = this._getFragControlById("idSmartTable", "idVHDialog"),
				oSelectedItemContext = oTable.getTable().getSelectedContexts(),
				oModel = this.getModel(),
				i;
			if (oSelectedItemContext.length === 0) {
				MessageToast.show(this.getResourceBundle().getText("ymsg.smartvh.noselect"));
				return false;
			}
			switch (oControl) {
				case "District":
					this._removeAllToken(["idSelectVillage", "idSelectMandal"]);
					this._removeAllToken(["idSelectVillage", "idSelectMandal"]);
					this.getModel().getProperty("district", oTable.getTable().getSelectedContexts()[0]);
					for (i = 0; i < oSelectedItemContext.length; i++) {
						var oSelectedTokenKey = oModel.getProperty("district", oSelectedItemContext[i]),
							bDuplicateExist = this._checkTokenDuplicate(oSelectedTokenKey, oSource);
						if (!bDuplicateExist) {
							oSource.addToken(new Token({
								key: oSelectedTokenKey,
								text: oModel.getProperty("name", oSelectedItemContext[i])
							}));
						}
					}
					oSource.fireTokenUpdate();
					this._handleExit();
					break;
				case "Mandal":
					this._removeAllToken(["idSelectDistrict", "idSelectVillage"]);
					for (i = 0; i < oSelectedItemContext.length; i++) {
						var oSelectedTokenKey = oModel.getProperty("district", oSelectedItemContext[i]) + ":" + oModel.getProperty("mandal",
								oSelectedItemContext[i]),
							bDuplicateExist = this._checkTokenDuplicate(oSelectedTokenKey, oSource);
						if (!bDuplicateExist) {
							oSource.addToken(new Token({
								key: oSelectedTokenKey,
								text: oModel.getProperty("mandalx", oSelectedItemContext[i])
							}));
						}
					}
					oSource.fireTokenUpdate();
					this._handleExit();
					break;
				case "Village":
					this._removeAllToken(["idSelectDistrict", "idSelectMandal"]);

					for (i = 0; i < oSelectedItemContext.length; i++) {
						var oSelectedTokenKey = oModel.getProperty("district", oSelectedItemContext[i]) + ":" + oModel.getProperty("mandal",
								oSelectedItemContext[i]) + ":" + oModel.getProperty("village", oSelectedItemContext[i]),
							bDuplicateExist = this._checkTokenDuplicate(oSelectedTokenKey, oSource);
						if (!bDuplicateExist) {
							oSource.addToken(new Token({
								key: oSelectedTokenKey,
								text: oModel.getProperty("villagex", oSelectedItemContext[i])
							}));
						}
					}
					oSource.fireTokenUpdate();
					this._handleExit();
					break;
				case "LokSabha":
					//this._removeAllToken(["idMultiInputAssembly"]);
					for (i = 0; i < oSelectedItemContext.length; i++) {
						var oSelectedTokenKey = oModel.getProperty("loksabha", oSelectedItemContext[i]),
							bDuplicateExist = this._checkTokenDuplicate(oSelectedTokenKey, oSource);
						if (!bDuplicateExist) {
							oSource.addToken(new Token({
								key: oSelectedTokenKey,
								text: oModel.getProperty("loksabha_name", oSelectedItemContext[i])
							}));
						}
					}
					oSource.fireTokenUpdate();
					this._handleExit();
					break;
				case "project_id":
					var aArray = [];
					var Obj = {};
					var LstRsultRow = this.getView().getModel("TableModel").getData().results.length - 1;
					if (this.getView().getModel("TableModel").getData().results.length > 0 && this.getView().getModel("TableModel").getData().results[
							LstRsultRow].MigASEditNumber === "") {
						this.getView().getModel("TableModel").getData().results.splice(LstRsultRow, 1);
						this.getView().getModel("TableModel").refresh();
					}
					for (var k = 0; k < this.getView().getModel("TableModel").getData().results.length; k++) {
						Obj.MigASEditNumber = this.getView().getModel("TableModel").getData().results[k].MigASEditNumber;
						Obj.SancEditAmunt = this.getView().getModel("TableModel").getData().results[k].SancEditAmunt;
						Obj.ASEditDescription = this.getView().getModel("TableModel").getData().results[k].ASEditDescription;
						Obj.SanctionEditRefe = this.getView().getModel("TableModel").getData().results[k].SanctionEditRefe;
						aArray.push(Obj);
						Obj = {};
					}
					for (var i = 0; i < oSelectedItemContext.length; i++) {
						Obj.MigASEditNumber = oSelectedItemContext[i].getObject().project_id;
						Obj.SancEditAmunt = oSelectedItemContext[i].getObject().san_amt;
						Obj.ASEditDescription = oSelectedItemContext[i].getObject().prj_desc;
						Obj.SanctionEditRefe = oSelectedItemContext[i].getObject().san_ref_no;
						aArray.push(Obj);
						Obj = {};

					}
					aArray = {
						"results": aArray
					};
					var oModel = new sap.ui.model.json.JSONModel();
					oModel.setData(aArray);

					this.getView().setModel(oModel, "TableModel");
					this.getView().getModel("TableModel").refresh();
					this._handleExit();
					break;
				default:
					//this._removeAllToken(["idMultiInputLoksabha"]);
					for (i = 0; i < oSelectedItemContext.length; i++) {
						var oSelectedTokenKey = oModel.getProperty("constutuency", oSelectedItemContext[i]),
							bDuplicateExist = this._checkTokenDuplicate(oSelectedTokenKey, oSource);
						if (!bDuplicateExist) {
							oSource.addToken(new Token({
								key: oSelectedTokenKey,
								text: oModel.getProperty("assembly", oSelectedItemContext[i])
							}));
						}
					}
					oSource.fireTokenUpdate();
					this._handleExit();
					break;
			}
		},
		/**
		 * Private function used to remove all token from multi-input
		 * @private
		 * @param {Array} aControlId Array of IDs of controls
		 */
		_removeAllToken: function(aControlId) {
			var aEmpArray = [];
			for (var i = 0; i < aControlId.length; i++) {
				var oControl = this.byId(aControlId[i]);
				oControl.setTokens(aEmpArray);
				//	oControl.fireTokenUpdate();
			}
		},
		/**
		 * Private function used for Setting the token based on user selection
		 * @private
		 * @param {Source} oSource Source of Event
		 * @param {Array} aSelectedObjects Array of all selected objects in the suggestions
		 * @param {String} textProperty Corresponding Text of the selections
		 * @param {String} keyProperty Key of the Selections
		 */
		_setTokens: function(oSource, aSelectedObjects, textProperty, keyProperty) {
			var aTokens = oSource.getTokens();
			var that = this;
			jQuery.each(aSelectedObjects, function(index, oSelectedObject) {
				var oNewToken = that._createNewTokens(oSelectedObject, textProperty, keyProperty);
				var bNewToken = true;
				jQuery.each(aTokens, function(i, oToken) {
					if (oToken.getKey() === oNewToken.getKey()) {
						bNewToken = false;
					}
				});
				if (bNewToken) {
					aTokens.push(oNewToken);
				}
			});
			oSource.setTokens(aTokens);
		},
		/**
		 * Private function to create a token
		 * @private
		 * @param {Object} oSelectedObject Parameters of new Token
		 * @param {String} text Corresponding Text of selection
		 * @param {String} key Key of Selection
		 * @returns {Object} Token for selected keys and corresponding texts
		 */
		_createNewTokens: function(oSelectedObject, text, key) {
			return new Token({
				text: oSelectedObject[text],
				key: oSelectedObject[key]
			});
		},

		/**
		 * Private function to get instance of value help for district
		 * @private
		 * @returns {Object} Control for Location value help
		 */
		_getASDistrictVH: function() {
			if (!this.oASDistVH) {
				this.oASDistVH = new VHDialog({
					component: this.getOwnerComponent(),
					id: "vhDistrictAS",
					contentDensity: this.contentDensity,
					titleKey: "detail.ops.panel.content.table.column.vh.title.district",
					entitySet: "/ZWRK_C_DISTRICTS",
					sorter: new Sorter("district", false),
					bMultiSelect: false,
					key: "district",
					descriptionKey: "name",
					fields: [
						// {
						//     key: "district",
						//     label: "{i18n>detail.location.popup.districtId}",
						//     value: "{district}"
						// },
						{
							key: "name",
							label: "{i18n>detail.location.popup.districtName}",
							value: "{name}"
						}
					]
				});
			}
			return this.oASDistVH;
		},

		/**
		 * Private function to get instance of value help for mandal
		 * @private
		 * @returns {Object} Control for Location value help
		 */
		_getASMandalVH: function() {
			if (!this.oASMandalVH) {
				this.oASMandalVH = new VHDialog({
					component: this.getOwnerComponent(),
					id: "vhMandalAS",
					contentDensity: this.contentDensity,
					titleKey: "detail.ops.panel.content.table.column.vh.title.mandal",
					entitySet: "/ZWRK_C_MANDAL_LIST",
					sorter: new Sorter("mandal", false),
					bMultiSelect: false,
					key: "mandal",
					descriptionKey: "name",
					fields: [
						// {
						//     key: "district",
						//     label: "{i18n>detail.location.popup.districtId}",
						//     value: "{district}"
						// },
						{
							key: "districtx",
							label: "{i18n>detail.location.popup.districtName}",
							value: "{districtx}"
						},
						// {
						//     key: "mandal",
						//     label: "{i18n>detail.location.popup.mandalId}",
						//     value: "{mandal}"
						// },
						{
							key: "mandalx",
							label: "{i18n>detail.location.popup.mandalName}",
							value: "{mandalx}"
						}
					]
				});
			}
			return this.oASMandalVH;
		},

		/**
		 * Private function to get instance of value help for village
		 * @private
		 * @returns {Object} Control for Location value help
		 */
		_getASVillageVH: function() {
			if (!this.oASVillageVH) {
				this.oASVillageVH = new VHDialog({
					component: this.getOwnerComponent(),
					id: "vhVillageAS",
					contentDensity: this.contentDensity,
					titleKey: "detail.ops.panel.content.table.column.vh.title.village",
					entitySet: "/ZWRK_C_VILLAGES_LIST",
					sorter: new Sorter("village", false),
					bMultiSelect: false,
					key: "village",
					descriptionKey: "villagename",
					fields: [
						// {
						//     key: "district",
						//     label: "{i18n>detail.location.popup.districtId}",
						//     value: "{district}"
						// },
						{
							key: "districtx",
							label: "{i18n>detail.location.popup.districtName}",
							value: "{districtx}"
						},
						// {
						//     key: "mandal",
						//     label: "{i18n>detail.location.popup.mandalId}",
						//     value: "{mandal}"
						// },
						{
							key: "mandalx",
							label: "{i18n>detail.location.popup.mandalName}",
							value: "{mandalx}"
						},
						// {
						//     key: "village",
						//     label: "{i18n>detail.location.popup.villageId}",
						//     value: "{village}"
						// },
						{
							key: "villagex",
							label: "{i18n>detail.location.popup.villageName}",
							value: "{villagex}"
						}
					]
				});
			}
			return this.oASVillageVH;
		},

		/**
		 * Private function to get instance of value help for lok sabha
		 * @private
		 * @returns {Object} Control for Location value help
		 */
		_getASLoksabhaVH: function() {
			if (!this.oASLoksabhaVH) {
				this.oASLoksabhaVH = new VHDialog({
					component: this.getOwnerComponent(),
					id: "vhLoksabhaAS",
					contentDensity: this.contentDensity,
					titleKey: "detail.ops.panel.content.table.column.vh.title.loksabha",
					entitySet: "/ZWRK_C_LOKSABHA",
					sorter: new Sorter("loksabha", false),
					bMultiSelect: false,
					key: "loksabha",
					descriptionKey: "loksabha_name",
					fields: [{
						key: "District_name",
						label: "{/ZWRK_C_LOKSABHA/District_name/#@sap:label}",
						value: "{District_name}"
					}, {
						key: "loksabha_name",
						label: "{/ZWRK_C_LOKSABHA/loksabha_name/#@sap:label}",
						value: "{loksabha_name}"
					}]
				});
			}
			return this.oASLoksabhaVH;
		},

		/**
		 * Private function to get instance of value help for assembly
		 * @private
		 * @returns {Object} Control for Location value help
		 */
		_getASAssemblyVH: function() {
			if (!this.oASAssemblyVH) {
				this.oASAssemblyVH = new VHDialog({
					component: this.getOwnerComponent(),
					id: "vhAssemblyAS",
					contentDensity: this.contentDensity,
					titleKey: "detail.ops.panel.content.table.column.vh.title.assembly",
					entitySet: "/ZWRK_C_CONSTITUENCIES",
					sorter: new Sorter("constutuency", false),
					bMultiSelect: false,
					key: "constutuency",
					descriptionKey: "assembly",
					fields: [{
						key: "distx",
						label: "{/ZWRK_C_CONSTITUENCIES/distx/#@sap:label}",
						value: "{distx}"
					}, {
						key: "assembly",
						label: "{/ZWRK_C_CONSTITUENCIES/assembly/#@sap:label}",
						value: "{assembly}"
					}]
				});
			}
			return this.oASAssemblyVH;
		},

		/**
		 * Private function to return the getBinding Context
		 * @param {Array} aControlId Array of Controls for IDs
		 * @param {String} sFilterItems String of filter items
		 * @param {String} sSelectedKey String of Selected record key
		 */
		_setFilterOnBindings: function(aControlId, sFilterItems, sSelectedKey) {
			var aFilter = [];
			if (sFilterItems.length) {
				for (var j = 0; j < sFilterItems.length; j++) {
					aFilter.push(new Filter(sFilterItems[j], FilterOperator.EQ, sSelectedKey));
				}
			}
			if (aControlId.length > 0) {
				for (var i = 0; i < aControlId.length; i++) {
					this.byId(aControlId[i]).setSelectedKey("");
					this.byId(aControlId[i]).getBinding("items").filter(aFilter);
				}
			}
		},

		/**
		 * Private function to return the filter of selected token
		 * @private
		 * @param {String} sMultiInputCId Identifier for Multi Input Property
		 * @param {String} sFilterProperty Identifier for Filter Property
		 * @returns {aTokenFilters} Array of filtering tokens
		 */
		_getTokenFilter: function(sMultiInputCId, sFilterProperty) {
			var aTokenFilters = [],
				aTokens = this.byId(sMultiInputCId).getTokens();
			if (aTokens.length > 0) {
				for (var i = 0; i < aTokens.length; i++) {
					var sKey = aTokens[i].getKey();
					if (sKey) {
						aTokenFilters.push(new Filter(sFilterProperty, FilterOperator.EQ, sKey));
					}
				}
			} else {
				aTokenFilters.push(new Filter(sFilterProperty, FilterOperator.EQ, ""));
			}
			return aTokenFilters;
		},
		/**
		 * Event handler function for MultiInput value help for District
		 * @private
		 * @param {Event} oEvent Displaying list of Districts
		 */
		handleDistrictListDisplay: function(oEvent) {
			var aTokenFilters = this._getTokenFilter("idSelectDistrict", "district");
			this._getASDistrictVH().open({
				filters: aTokenFilters,
				mode: "None",
				hideFilter: true,
				displayTitle: "detail.ops.panel.content.table.column.vh.title.sdistrict",
				multiSelect: function(oSelectedObject) {

				},
				select: function(oSelectedObject) {

				}
			});
		},
		/**
		 * Event handler function for MultiInput value help for Mandals
		 * @private
		 * @param {Event} oEvent Displaying list of Mandals
		 */
		handleMandalListDisplay: function(oEvent) {
			var aTokenFilters = this._getTokenFilter("idSelectMandal", "filter");
			this._getASMandalVH().open({
				filters: aTokenFilters,
				mode: "None",
				hideFilter: true,
				displayTitle: "detail.ops.panel.content.table.column.vh.title.smandal",
				select: function(oSelectedObject) {

				},
				multiSelect: function(oSelectedObject) {

				}
			});
		},
		/**
		 * Event handler function for MultiInput value help for Villages
		 * @private
		 * @param {Event} oEvent Displaying list of Villages
		 */
		handleVillageListDisplay: function(oEvent) {
			var aTokenFilters = this._getTokenFilter("idSelectVillage", "filter");
			this._getASVillageVH().open({
				filters: aTokenFilters,
				mode: "None",
				hideFilter: true,
				displayTitle: "detail.ops.panel.content.table.column.vh.title.svillage",
				multiSelect: function(oSelectedObject) {

				},
				select: function(oSelectedObject) {

				}
			});
		},
		/**
		 * Event handler function for MultiInput value help for Lok Sabhas
		 * @private
		 * @param {Event} oEvent Displaying list of Lok Sabhas
		 */
		onLoksabhaListClick: function(oEvent) {
			var aTokenFilters = this._getTokenFilter("idMultiInputLoksabha", "loksabha");
			this._getASLoksabhaVH().open({
				filters: aTokenFilters,
				mode: "None",
				hideFilter: true,
				displayTitle: "detail.ops.panel.content.table.column.vh.title.sloksabha",
				select: function(oSelectedObject) {

				},
				multiSelect: function(oSelectedObject) {

				}
			});
		},
		/**
		 * Event handler function for MultiInput value help for Assemblies
		 * @private
		 * @param {Event} oEvent Displaying list of Assemblies
		 */
		handleAssemblyListDisplay: function(oEvent) {
			var aTokenFilters = this._getTokenFilter("idMultiInputAssembly", "constutuency");
			this._getASAssemblyVH().open({
				filters: aTokenFilters,
				mode: "None",
				hideFilter: true,
				displayTitle: "detail.ops.panel.content.table.column.vh.title.sassembly",
				select: function(oSelectedObject) {

				},
				multiSelect: function(oSelectedObject) {

				}
			});
		},
		/**
		 * private function to set value for multiple fields
		 * @param {string} sModelName Model Identifier
		 * @param {array} aProp1  Array of properties
		 * @param {string} sPropV Array of properties
		 */
		_setPropertyValue: function(sModelName, aProp1, sPropV) {
			for (var i = 0; i < aProp1.length; i++) {
				var sProperty = "/" + aProp1[i];
				this.getModel(sModelName).setProperty(sProperty, sPropV);
			}
		},
		/**
		 * private function to authorize a user
		 * @param {string} sObjectId Object Identifier
		 */
		_authorizeUser: function(sObjectId) {
			var that = this,
				sPositionId = this.getModel("appView").getProperty("/position"),
				oAppViewModel = this.getModel("appView"),
				oResourceBundle = this.getResourceBundle(),
				oDetailViewModel = this.getModel("detailView");
			var oAuth = new Promise(function(resolve, reject) {
				this.getOwnerComponent().oDraft.getAuthorization({
					fName: "/GetOpenItems",
					ApplicationId: "AS",
					Guid: sObjectId,
					PositionId: sPositionId
				}, resolve, reject);
			}.bind(this));

			oAuth.then(function(oResult) {
				var oOpenItems = oResult.data.GetOpenItems;
				this.getModel("detailView").setProperty("/WfRole", oOpenItems.Wfrole);
				if (oOpenItems.ApproveBt === "X" || oOpenItems.NextBt === "X" || oOpenItems.SubmitBt === "X") {
					this.getModel("detailView").setProperty("/authorized", true);
				} else {
					this.getModel("detailView").setProperty("/authorized", false);
					//					oDetailViewModel.setProperty("/stateId", "D");
					//					oDetailViewModel.setProperty("/bEditable", false);
					//					oAppViewModel.setProperty("/bEnabledMasterViewCtr", true);
					//					oAppViewModel.setProperty("/sMasterListMode", "SingleSelectMaster");
					//					this.getModel("detailView").setProperty("/ObjectTitle", oResourceBundle.getText("detail.page.header.title.display"));
				}
				this._setFooterButtonsVisibility(oOpenItems);
				if (oOpenItems.ApproveBt === "X") {
					this.getModel().callFunction("/User_Is_Secratary", {
						method: "GET",
						urlParameters: {
							Guid: sObjectId,
							Position: this.getModel("appView").getProperty("/position")
						},
						success: function(oResponse, oTe) {
							if (oResponse.User_Is_Secratary.IsSecratary === "X") {
								that.getModel("detailView").setProperty("/bIsSecratary", true);
							} else {
								that.getModel("detailView").setProperty("/bIsSecratary", false);
							}
						},
						error: function(oError) {

						}
					});
				}
			}.bind(this));
		},
		/**
		 * private function to update buttons visibility
		 * @param {object} oOpenItems Object containing accessibility options for the footer buttons
		 */
		_setFooterButtonsVisibility: function(oOpenItems) {
			this.getModel("detailView").setProperty("/ApproveBtnVisibility", oOpenItems.ApproveBt);
			this.getModel("detailView").setProperty("/NextBtnVisibility", oOpenItems.NextBt);
			this.getModel("detailView").setProperty("/OnholdBtnVisibility", oOpenItems.OnholdBt);
			this.getModel("detailView").setProperty("/ReturnBtnVisibility", oOpenItems.ReturnBt);
			this.getModel("detailView").setProperty("/SubmitBtnVisibility", oOpenItems.SubmitBt);
		},

		/**
		 * Function to get the User Feed list and Add action button in it
		 * @private
		 */
		getUserFeedList: function() {
			var that = this,
				aFilters = [],
				sGuid = this.getView().getBindingContext().getProperty("Guid");
			aFilters.push(new Filter("Tabtype", FilterOperator.EQ, "CREATE"));
			aFilters.push(new Filter("Caseguid", FilterOperator.EQ, sGuid));
			aFilters.push(new Filter("Wiid", FilterOperator.EQ, ""));
			aFilters.push(new Filter("Wfinfo", FilterOperator.EQ, ""));
			aFilters.push(new Filter("Application", FilterOperator.EQ, "AS"));
			this._getMigCheckSet();
			this.getView().setBusy(true);
			this.getModel().read("/WrkNoteSet", {
				filters: aFilters,
				success: function(oData) {
					for (var i = 0; i < oData.results.length; i++) {
						oData.results[i].Notingstring = decodeURIComponent(oData.results[i].Notingstring);
					}
					that.getModel("detailView").setProperty("/UserNotes", oData.results);
					that.getView().setBusy(false);
				},
				error: function(oError) {
					that.getView().setBusy(false);
				}
			});
		},
		/**
		 * Private function to assign the action Item on Comments
		 * @param {Array} aNoteList Array containing all notes of the document 
		 */
		_setActionItemOnFeedListItem: function(aNoteList) {
			if (this.getModel("detailView").getProperty("/stateId") !== "D") {
				if (aNoteList.length > 0) {
					for (var i = 0; i < aNoteList.length; i++) {
						var Actions = [];
						if (aNoteList[i].Noteflag) {
							Actions.push({
								"Text": "Edit",
								"Icon": "sap-icon://edit",
								"Key": "edit"
							});
						}
						aNoteList[i].Actions = Actions;
					}
				}
			}
		},
		/**
		 * Private function to fire the update for Message Popover message update
		 * @param {Event} oEvent Click on message popover
		 */
		_updateMessage: function(oEvent) {
			if (this.getView().byId("idMessagePopover")) {
				this.getView().byId("idMessagePopover").setText(sap.ui.getCore().getMessageManager().getMessageModel().getData().length);
			}
		},
		/**
		 * Private function to set visibility of components of the View
		 * @private
		 */
		_setObjectSectionVisibility: function() {
			var oBindingContext = this.getView().getBindingContext();
			if (oBindingContext) {
				var sCategory = oBindingContext.getProperty("Category"),
					oDetailViewModel = this.getModel("detailView");
				if (sCategory === "02") {
					oDetailViewModel.setProperty("/bUAVisible", true);
					var sDcwType = oBindingContext.getProperty("DcwType");
					if (sDcwType === "02") {
						oDetailViewModel.setProperty("/bOwnDCW", false);
					} else {
						oDetailViewModel.setProperty("/bOwnDCW", true);
					}
				} else {
					oDetailViewModel.setProperty("/bUAVisible", false);
				}
			}
		},
		/**
		 * Private function to create Params for Post Note
		 * @param {String} sAction Action specifier String
		 * @returns {Object} Note attributes to be saved
		 */
		_createPostCallParam: function(sAction) {
			var oDetailViewModelData = this.getModel("detailView").getProperty("/");
			return {
				notePath: "WrkNoteSet",
				path: "WrkSave",
				action: sAction,
				AppID: "AS",
				FPositionid: this.getModel("appView").getProperty("/position"),
				FUserid: "",
				Role: "",
				FFlag: "",
				Notingid: oDetailViewModelData.Notingid,
				Pagent: oDetailViewModelData.Pagent,
				Notingstring: oDetailViewModelData.Notingstring,
				Guid: this.getView().getBindingContext().getProperty("Guid")
			};
		},
		// /**
		//  * Private function for submit/return/approve
		//  * @private
		//  * @param {Object} oParams Object containing save parameters
		//  */
		// _workFlowCall: function(oParams){
		// 	var that = this;
		// 	this.oProcessActionPromise = new Promise(function(resolve, reject){
		// 		that._postCall(oParams, resolve, reject);
		// 	});
		// 	this.oProcessActionPromise.then(function(oData){
		// 		that.getModel("detailView").setProperty("/Notingstring", "");
		// 		that.oProcessActionPromise = null;
		// 		that.getModel("detailView").setProperty("/DraftStatus", "X");
		// 		that._successToastMsgDisplay(oParams.action);
		// 		that._navToDetail.bind(that)("D");
		// 	});
		// },
		/**
		 * Private function for submit/return/approve
		 * @private
		 * @param {Object} oParams Object containing save parameters
		 */
		_workFlowCall: function(oParams) {
			var that = this,
				sUser = "",
				sPath = "";
			if (sap.ushell) {
				sUser = sap.ushell.Container.getService("UserInfo").getId();
			}
			sPath = this.getModel().createKey("User_DetailsSet", {
				User_ID: sUser,
				Application: "AS",
				Role: this.getModel("detailView").getProperty("/WfRole")
			});
			var params = {
				path: "/" + sPath,
				busyControl: that.getView()
			};
			if (oParams.action !== "SAVE") {
				this.oValidateBio = new Promise(function(resolve, reject) {
					this._getBioValidation(params, resolve, reject);
				}.bind(this));
				this.oValidateBio.then(function(oData) {
					that._postWorkFlowCall(oParams);
				}, function(oError) {
					that._postWorkFlowCall(oParams);
				});
			} else {
				that._postWorkFlowCall(oParams);
			}

		},
		/**
		 * function for submit/return/approve
		 * @private
		 * @param {Object} oParams Object containing save parameters
		 */
		_postWorkFlowCall: function(oParams) {
			var that = this,
				oDetailViewModel = this.getModel("detailView"),
				oViewModel = this.getModel("detailView"),
				aWorkFlowLogData = oDetailViewModel.getProperty("/Worklog"),
				bWorkFlowDefined = true;
			//to determine the freeworkflow
			if (oParams.action === "SUBMIT" || oParams.action === "NEXT") {
				var sUserId = sap.ushell.Container.getService("UserInfo").getId();
				if (aWorkFlowLogData.length === 0) {
					var oPromiseWorkFlowLog = new Promise(function(resolve1, reject1) {
						that.getWorkFlowLogDetails({
							ApplicationId: "AS",
							Guid: that.getView().getBindingContext().getProperty("Guid")
						}, resolve1, reject1);
					}.bind(that));
					oPromiseWorkFlowLog.then(function() {
						oViewModel.setProperty("/busy", false);
						var aWrkFLogData = oDetailViewModel.getProperty("/Worklog");
						for (var i = 0; i < aWrkFLogData.length; i++) {
							if ((sUserId === aWrkFLogData[i].Pernr) && (aWrkFLogData[i].Wfrole === oDetailViewModel.getProperty("/WfRole")) && (
									aWrkFLogData.length - 1) === i) {
								bWorkFlowDefined = false;
							}
						}
						if (aWrkFLogData.length >= 1) {
							that._postSubmitCall(bWorkFlowDefined, oParams);
						}
					});
				} else if (aWorkFlowLogData.length >= 1) {
					for (var i = 0; i < aWorkFlowLogData.length; i++) {
						if ((sUserId === aWorkFlowLogData[i].Pernr) && (aWorkFlowLogData[i].Wfrole === oDetailViewModel.getProperty("/WfRole")) && (
								aWorkFlowLogData.length - 1) === i) {
							bWorkFlowDefined = false;
						}
					}
					that._postSubmitCall(bWorkFlowDefined, oParams);
				}
			} else {
				if (aWorkFlowLogData.length >= 1) {
					this._postSubmitCall(bWorkFlowDefined, oParams);
				} else {

					var oPromiseWorkFlowLogOnSave = new Promise(function(resolve1, reject1) {
						that.getWorkFlowLogDetails({
							ApplicationId: "AS",
							Guid: that.getView().getBindingContext().getProperty("Guid")
						}, resolve1, reject1);
					}.bind(that));
					oPromiseWorkFlowLogOnSave.then(function() {
						oViewModel.setProperty("/busy", false);
						var aWrkFLogData = oDetailViewModel.getProperty("/Worklog");
						if (aWrkFLogData.length >= 1) {
							that._postSubmitCall(bWorkFlowDefined, oParams);
						} else {
							sap.m.MessageBox.error("Maker Role in Workflow not maintain");
						}
					});
				}
			}
		},
		/**
		 * internal function to determine 
		 */
		_postSubmitCall: function(bWorkFlowDefined, oParams) {
			var that = this;
			if (bWorkFlowDefined) {
				this.oProcessActionPromise = new Promise(function(resolve, reject) {
					//	that.getView().getModel().resetChanges();   27JUL20
					//					that._postCall(oParams, resolve, reject);
					that._postCallNew(oParams, resolve, reject);
				});
				this.oProcessActionPromise.then(function(oData) {
					sap.ushell.Container.setDirtyFlag(false);
					that.getView().getElementBinding().refresh();
					that.getModel().refresh(true);
					that._bindViewDone();

					if (oParams.action === "APPROVE" && oData.data.DmsUrl) {
						that._handleDigitalSing(oData.data.DmsUrl, oData.data.FioriLink);
					} else {
						that.getModel("detailView").setProperty("/Notingstring", "");
						that.oProcessActionPromise = null;
						that.getModel("detailView").setProperty("/DraftStatus", "X");
						that._successToastMsgDisplay(oParams.action);
						that._changeFullScreenMode(false, "detail", "MasterPage", "asIdBtnScreenToggle");
						that._navToDetail.bind(that)("D");
					}
				});
				/*	this.oProcessActionPromise.catch(function(oError){
						that.getView().getElementBinding().refresh();
					});*/

			} else {
				this.getModel("appView").setProperty("/busy", false);
				MessageBox.alert(this.getResourceBundle().getText("detail.error.msg.wrkflowRoleNotMaint"), {
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function(sAction) {
						if (sAction === "YES") {
							this._reusePositionValueHelp(oParams);
						}
					}.bind(this)
				});
			}
		},
		/**
		 * Internal function called for free workflow
		 */
		workflowProcess: function() {
			var that = this,
				oWFCModel = this.getModel("WFCModel"),
				oParams = oWFCModel.getProperty("/oParams");
			oParams.Role = "C";
			oParams.FFlag = "X";
			oParams.FPositionid = oWFCModel.getProperty("/nextPositionID");
			oParams.FUserid = oWFCModel.getProperty("/nextUserID");
			this.oProcessActionPromise = new Promise(function(resolve, reject) {
				//				that._postCall(oParams, resolve, reject);
				that._postCallNew(oParams, resolve, reject);
			});
			this.oProcessActionPromise.then(function(oData) {
				sap.ushell.Container.setDirtyFlag(false);
				that._changeFullScreenMode(false, "detail", "MasterPage", "asIdBtnScreenToggle");
				that.getView().getElementBinding().refresh();
				that.getModel().refresh(true);
				that._bindViewDone();
				that.getModel("detailView").setProperty("/Notingstring", "");
				that.oProcessActionPromise = null;
				that.getModel("detailView").setProperty("/DraftStatus", "X");
				that._successToastMsgDisplay(oParams.action);
				that._navToDetail.bind(that)("D");
			});
		},
		/**
		 * Private function to create the process flow bar
		 * @private
		 */
		_makeProcessFlow: function() {
			this.createFlowBar("idProcessFlowBox");
		},

		/**
		 * Private function to get the I18n text
		 * @private
		 * @param {String} sText text value from i18n resource
		 * @returns {Object} Text contained in i18n Resources
		 */
		_getI18nText: function(sText) {
			return this.getResourceBundle().getText(sText);
		},

		/**
		 * Private function to post the Note and AS
		 * @private
		 * @param {Object} oParams Saving parameters
		 */
		_postAS: function(oParams) {
			var oParamsTemp = this._createPostCallParam(oParams.action);
			this._workFlowCall(oParamsTemp);
		},
		/**
		 * Function to check the Note before any workflow action
		 * @private
		 * @returns {String} Body of the note
		 */
		_checkNote: function() {
			var bNotingString = false,
				sDetailModel = this.getModel("detailView"),
				sLogInUser = sap.ushell.Container.getService("UserInfo").getId(),
				sNotingString = sDetailModel.getProperty("/Notingstring"),
				sNotes = sDetailModel.getProperty("/UserNotes");
			if (sNotes.length > 0 && sLogInUser === sNotes[0].Createdby) {
				bNotingString = true;
			} else if (sNotingString) {
				//bNotingString = true;
				this._displayWarnMessge(this.getModel("i18n").getResourceBundle().getText("detail.message.note.savebefore")); // return is as false beacuse on submit we are not saving the notes as per new change
			} else {
				this._displayWarnMessge(this.getModel("i18n").getResourceBundle().getText("detail.message.note.empty"));
			}
			return bNotingString;
		},

		_switchControlModel: function() {
			if (this.getView().getBindingContext()) {
				var sAsType = this.getView().getBindingContext().getProperty("RefAsType");
				switch (sAsType) {
					case "03":
						this.controlModelSwitch(this.oAmendControlModel);
						break;
					default:
						//		this.controlModelSwitch(this.oDefaultControlModel);
						this._getOpenItemRole();
						break;
				}
			}
		},

		/**
		 * Private function to set the header title for Amend Page
		 * @param {String} sStateId State Identifier of the Document
		 */
		_setAmendPageTitle: function(sStateId) {
			if (this.getView().getBindingContext()) {
				var sAsType = this.getView().getBindingContext().getProperty("RefAsType"),
					sStatus = this.getView().getBindingContext().getProperty("Status");
				if (sAsType === "03") {
					var oResourceBundle = this.getResourceBundle();
					if (sStateId === "D") {
						if (sStatus !== "E0006") {
							this.getModel("detailView").setProperty("/ObjectTitle", oResourceBundle.getText("detail.page.header.amend.title.displayP"));
						} else {
							this.getModel("detailView").setProperty("/ObjectTitle", oResourceBundle.getText("detail.page.header.amend.title.display"));
						}

					} else if (sStateId === "C") {
						this.getModel("detailView").setProperty("/ObjectTitle", oResourceBundle.getText("detail.page.header.amend.title.create"));
					} else if (sStateId === "E") {
						this.getModel("detailView").setProperty("/ObjectTitle", oResourceBundle.getText("detail.page.header.amend.title.edit"));
					}
					this.getModel().updateBindings();
				}
			}
		},
		_identifyHoaDdoFilters: function() {
			var bUAVisible = this.getModel("detailView").getProperty("/bUAVisible"),
				bOwnDCW = this.getModel("detailView").getProperty("/bOwnDCW");
			// var oHoaFilterNonDCW = {filter:[
			// 	{id: "idCategory", key: "category", value: "Category"}, 
			// 	{id: "idInitDept", key: "dept", value: "InitiatinDept"}
			// ]};
			// var oDdoFilterNonDCW = {filter:[
			// 	{id: 'idExecDept', key: 'fictr', value: 'ExecutingDept'}
			// ]};
			// var oHoaFilterOwnDCW = {filter: []};
			// var oDdoFilterOwnDCW = oDdoFilterNonDCW;
			// var oHoaFilterSource = oHoaFilterNonDCW;
			// var oDdoFilterSource = {filter: [
			// 	{id: "idInitDept", key: "dept", value: "InitiatinDept"}
			// ]};
			// var oHoaFilterTarget = {filter:[
			// 	{id: "idCategory", key: "category", value: "Category"}
			// ]};
			// var oDdoFilterTarget = {filter: []};
			if (!bUAVisible) {
				this.oHoaFilter = this.getModel("hoaDdoFilters").getProperty("/oHoaFilterNonDCW");
				this.oDdoFilter = this.getModel("hoaDdoFilters").getProperty("/oDdoFilterNonDCW");
			} else if (bUAVisible && bOwnDCW) {
				this.oHoaFilter = this.getModel("hoaDdoFilters").getProperty("/oHoaFilterOwnDCW");
				this.oDdoFilter = this.getModel("hoaDdoFilters").getProperty("/oDdoFilterOwnDCW");
			} else if (bUAVisible && !bOwnDCW) {
				this.oHoaFilter = this.getModel("hoaDdoFilters").getProperty("/oHoaFilterTarget");
				this.oDdoFilter = this.getModel("hoaDdoFilters").getProperty("/oDdoFilterTarget");
				this.oHoaSourceFilter = this.getModel("hoaDdoFilters").getProperty("/oHoaFilterSource");
				this.oDdoSourceFilter = this.getModel("hoaDdoFilters").getProperty("/oDdoFilterSource");
			}
		},
		_setHoaDdoFilters: function() {
			var aItems = this.byId("idWorksHoA").getItems(),
				aSourceItems = this.byId("idWorksSrcHoA").getItems();
			if (aItems) {
				for (var i = 0; i < aItems.length; i++) {
					var aCells = aItems[i].getCells();
					for (var j = 0; j < aCells.length; j++) {
						if (aCells[j].getId().indexOf("Hoa") !== -1) {
							aCells[j].data("filterArray", this.oHoaFilter);
						} else if (aCells[j].getId().indexOf("Ddo") !== -1) {
							aCells[j].data("filterArray", this.oDdoFilter);
							break;
						}
					}
				}
			}
			if (aSourceItems) {
				for (var i = 0; i < aSourceItems.length; i++) {
					var aCells = aSourceItems[i].getCells();
					for (var j = 0; j < aCells.length; j++) {
						if (aCells[j].getId().indexOf("SourceHoa") !== -1) {
							aCells[j].data("filterArray", this.oHoaSourceFilter);
						} else if (aCells[j].getId().indexOf("SourceDdo") !== -1) {
							aCells[j].data("filterArray", this.oDdoSourceFilter);
							break;
						}
					}
				}
			}
		},
		/**
		 * @private
		 * @param {*} sId is the id of the template to be generated
		 * @param {*} sSrcBindingPath is the binding path of the control
		 */
		_templateForHOADDOVH: function(sId, sSrcBindingPath, sCustomData, sControlId) {
			var oTemplate = "";
			if (sCustomData === "Ddo" || sCustomData === "SourceDdo") {
				oTemplate = new sap.m.StandardListItem(this.createId(sId), {
					title: "{fistl}",
					description: "{BESCHR}",
					type: "Active"
				});
			} else if (sCustomData === "Hoa" || sCustomData === "SourceHoa") {
				oTemplate = new sap.m.StandardListItem(this.createId(sId), {
					title: "{Hoa}",
					info: "{bcf}",
					// description : "{Hoa}",
					type: "Active"
				});
			} else if (sCustomData === "PicCode") {
				oTemplate = new sap.m.StandardListItem(this.createId(sId), {
					title: "{Pics_Code}",
					description: "{District_name}",
					type: "Active"
				});
			}

			oTemplate.data("sSrcBindingPath", sSrcBindingPath);
			oTemplate.data("CustomData", sCustomData);
			// oTemplate.data("controlId", sControlId);
			return oTemplate;
		},
		/**
		 * Validate the User Input
		 */
		_validateShare: function(oSource) {
			var zShare = parseFloat(oSource.getValue());
			if (zShare > 100 || zShare < 0) {
				oSource.setValueState("Error");
			} else {
				oSource.setValueState("None");
			}
		},
		/**
		 * Check the duplicate Token 
		 * @param{string} sTokenKey
		 * @param{Object} oSource
		 * @returns {boolean}
		 */
		_checkTokenDuplicate: function(sTokenKey, oSource) {
			var bDuplicateExist = false,
				aTokens = oSource.getTokens();
			for (var i = 0; i < aTokens.length; i++) {
				if (aTokens[i].getKey() === sTokenKey) {
					bDuplicateExist = true;
					break;
				}
			}
			return bDuplicateExist;
		},
		/**
		 * Private function to clear the Pre-existing value
		 */
		_initControlValue: function() {
			var sState = this.getModel("detailView").getProperty("/stateId"),
				oBindingcontext = this.getView().getBindingContext();
			var oAppViewModel = this.getModel("appView"),
				oModel = this.getModel();
			if (!oBindingcontext.getProperty("DepartDesc") && oAppViewModel.getProperty("/DepartDesc")) {
				oModel.setProperty("DepartDesc", oAppViewModel.getProperty("/DepartDesc"), oBindingcontext);
			}
			if (!oBindingcontext.getProperty("InitiatinDept") && oAppViewModel.getProperty("/InitiatinDept")) {
				oModel.setProperty("InitiatinDept", oAppViewModel.getProperty("/InitiatinDept"), oBindingcontext);
			}
			if (!oBindingcontext.getProperty("MainWorkNature")) {
				this.byId("idMainNatureWork").setValue("");
			}
			if (!oBindingcontext.getProperty("SubclassL03")) {
				this.byId("idSubClass03").setValue("");
			}
			if (!oBindingcontext.getProperty("SubclassL01")) {
				this.byId("idSubClass01").setValue("");
			}
			if (!oBindingcontext.getProperty("SubclassL02")) {
				this.byId("idSubClass02").setValue("");
			}
		},
		/**
		 * bind select control
		 * @param {*} url 
		 */
		_bindSelectControl: function() {
			var oBindingContext = this.getView().getBindingContext(),
				sCrUser = oBindingContext.getProperty("UserIdCr"),
				sSecDept = oBindingContext.getProperty("SecDept"),
				aFilterP = [{
					name: "SUBPROCESS_AREA",
					value: "AS"
				}],
				oParamLocalClass = {
					sPath: "/ZWRK_C_LOCATIONLIST(p_user='" + sCrUser + "')/Set",
					sControlId: "idLocationClass",
					sKey: "{location_id}",
					sDesc: "{location_text}",
					aFilterParam: aFilterP
				},
				oParamLocalClass1 = {
					sPath: "/ZWRK_C_CATEGORYLIST(p_user='" + sCrUser + "')/Set",
					sControlId: "idCategory",
					sKey: "{category}",
					sDesc: "{categorytext}",
					aFilterParam: aFilterP
				},
				oParamLocalClass2 = {
					sPath: "/ZWRK_C_GOSECTIONS(p_hdept='" + sSecDept + "',p_app='AS')/Set",
					sControlId: "idSecCode",
					sKey: "{sectioncode}",
					sDesc: "{sectioncode}",
					aFilterParam: []
				};
			this._bindSelectItems([oParamLocalClass, oParamLocalClass1, oParamLocalClass2]);
		},
		/*---------------------------------------------DIGITAL SIGNATURE PROCESS --------------------------------------------------*/
		_handleDigitalSing: function(url, fioriLink) {
			this.url = url;
			this.fioriLink = fioriLink;
			//var pdf_data = this.oObj.Content;
			this.getView().setBusy(true);
			this.getView().setBusyIndicatorDelay(0);
			myObj.SignDataInMemoryEx(pdf_data, "", true, true, 0, "", "", "", "", false, 0, resellerCode);
		},

		/**
		 * Callback function 
		 * @param {string} apiName 
		 * @param {string} status 
		 * @param {object} params 
		 */
		mycallback: function(apiName, status, params) {
			that = this;
			var retVal = "";
			this.getView().setBusy(false);
			if (apiName === "SignDataInMemoryEx") {
				//console.log(params);
				if (typeof params.sig === "undefined" || params.sig === "") {

					retVal = "";
					// alert("Certificate operation failed: " + status);
					var Errordialog = new sap.m.Dialog({
						title: "Error",
						type: "Message",
						state: "Error",
						content: new sap.m.Text({
							text: "Certificate operation failed: " + status
						}),
						beginButton: new sap.m.Button({
							text: "OK",
							press: function() {
								// window.history.go(-1);
								Errordialog.close();
							}
						}),
						afterClose: function() {
							Errordialog.destroy();
						}
					});
					Errordialog.open();
				} else {

					var signValue = params.sig;
					var fileURL = this.url;
					var oParameters = {
						"sig": signValue,
						// "MyReason": that.SingData.REASON,
						// "MyLocation": that.SingData.LOCATION,
						//"PageNumber": that.SingData.PAGENUMBER,
						"PageNumber": "1",
						// "SigBlockTitle": that.SingData.SIGN_TITLE,
						//"SigPosition": that.SingData.SIGN_POSITION,
						"SigPosition": "4",
						"filetosign": fileURL
					};

					// var getCertificateAPIUrl = serverUrl + "/getcert.jsp";
					//var getCertificateAPIUrl = that.SingData.URL;
					//var getCertificateAPIUrl = "https://devdigicert.apcfss.in:8443/sign/getcert.jsp";
					var getCertificateAPIUrl = that.fioriLink.toLowerCase();
					// oModel.loadData(getCertificateAPIUrl, oParameters, true, 'POST');
					$.ajax({
						url: getCertificateAPIUrl,
						data: oParameters,
						type: "POST",
						success: function(result) {
							// console.log(result);
							var html = $.parseHTML(result);

							strHash = html[5].value;
							signerName = html[7].value;
							offset = html[9].value;
							signerCert = html[11].value;
							outfile = html[13].value;

							var oError = html[15];
							if (oError !== undefined) {
								if (oError.value !== undefined && oError.value !== "") {
									var Errordialog = new sap.m.Dialog({
										title: "Error",
										type: "Message",
										state: "Error",
										content: new sap.m.Text({
											text: oError.value
										}),
										beginButton: new sap.m.Button({
											text: "OK",
											press: function() {
												// window.history.go(-1);
												Errordialog.close();
											}
										}),
										afterClose: function() {
											Errordialog.destroy();
										}
									});
									Errordialog.open();
								} else {
									var signerSubjectDN = signerName;
									myObj.SignEncodedDataInBatch(strHash, 1, 0, 0, signerSubjectDN, "", "", "", 1, 0, resellerCode);
								}

								// return;
							} else {
								var signerSubjectDN = signerName;
								myObj.SignEncodedDataInBatch(strHash, 1, 0, 0, signerSubjectDN, "", "", "", 1, 0, resellerCode);
							}

						},
						error: function(oError) {
							var Errordialog = new sap.m.Dialog({
								title: "Error",
								type: "Message",
								state: "Error",
								content: new sap.m.Text({
									text: "Error while signing the document"
								}),
								beginButton: new sap.m.Button({
									text: "OK",
									press: function() {
										// window.history.go(-1);
										Errordialog.close();
									}
								}),
								afterClose: function() {
									Errordialog.destroy();
								}
							});
							Errordialog.open();
							/*eslint-disable */
							//eslint-disable-no-useless-return
							return;
							/*eslint-enable */
						}
					});
				}
			} else if (apiName === "SignEncodedDataInBatch") {
				if (typeof params.sig === "undefined") {
					retVal = "";
					/*eslint-disable */
					//eslint-disable-no-alert
					alert("Certificate operation failed: " + status);
					/*eslint-enable */
				} else {

					var obj = {};
					retVal = params.sig;
					obj.Signername = retVal;
					obj.Offset = offset;
					obj.Strhash = strHash;
					obj.Signercert = signerCert;
					obj.Outfile = outfile;
					// obj.DocNo = this.WorkItemID;
					obj.Docyear = "";
					obj.PrintDocnr = "";
					obj.Docno = "";
					obj.Publaw = "";
					obj.Mandt = "";
					obj.Sysid = "";
					var oDigiModel = null;
					obj.Guid = this.getView().getBindingContext().getProperty("Guid");
					obj.Version = this.getView().getBindingContext().getProperty("Version");
					if (this.oAmendment === "X") {
						var oServiceULR = "/sap/opu/odata/sap/ZGW_BD_GO_AMD_SRV";
						oDigiModel = new sap.ui.model.odata.ODataModel(oServiceULR, true);
					} else {
						oDigiModel = this.getModel();
					}
					oDigiModel.create("/SendPdfSet", obj, {
						success: function(res) {
							that.getView().setBusy(false);
							that.getModel("detailView").setProperty("/Notingstring", "");
							that.oProcessActionPromise = null;
							that.getModel("detailView").setProperty("/DraftStatus", "X");
							that._successToastMsgDisplay("APPROVE");
							that._navToDetail.bind(that)("D");
						},
						error: function(E) {
							that.getView().setBusy(false);
							// sap.m.MessageBox.show(JSON.parse(E.responseText).error.message.value, {
							// 	icon: sap.m.MessageBox.Icon.ERROR,
							// 	title: "Error",
							// 	actions: [sap.m.MessageBox.Action.CLOSE]
							// });
						},
						async: false
					});
					/*eslint-disable */
					//eslint-disable-no-alert
					console.log(retVal);
					/*eslint-enable */
					//	var signAPIUrl = "https://332d4937.ngrok.io/signhash.jsp";
					var signAPIUrl = serverUrl + "/signhash.jsp";

				}
			}

		},
		/**
		 * Function to validate 
		 * @param {*} oEvent 
		 */
		_checkSecrataryMand: function() {
			var bValidAS = true,
				oResourceBundle = this.getResourceBundle(),
				oBindingContext = this.getView().getBindingContext(),
				oDetailViewModel = this.getModel("detailView"),
				bIsSecratary = oDetailViewModel.getProperty("/bIsSecratary");
			if (bIsSecratary) {
				var sSectionCode = oBindingContext.getProperty("SecDode");
				if (!sSectionCode) {
					bValidAS = false;
					oDetailViewModel.setProperty("/secCodeValueState", "Error");
					oDetailViewModel.setProperty("/secCodeValueStateText", oResourceBundle.getText("detail.message.error.mandatory"));
				}
			} else {
				var sGoNum = oBindingContext.getProperty("GoNumber"),
					oGoDate = oBindingContext.getProperty("GoRefDate");
				if (!sGoNum || !oGoDate) {
					bValidAS = false;
					if (!sGoNum) {
						oDetailViewModel.setProperty("/GoNumValueState", "Error");
						oDetailViewModel.setProperty("/GoNumValueStateText", oResourceBundle.getText("detail.message.error.mandatory"));
					}
					if (!oGoDate) {
						oDetailViewModel.setProperty("/goDateValueState", "Error");
						oDetailViewModel.setProperty("/goDateValueStateText", oResourceBundle.getText("detail.message.error.mandatory"));
					}
				}
			}
			return bValidAS;
		},
		_notAllowEditOnDocument: function() {
			var bEditable = false,
				oDetailViewModel = this.getModel("detailView"),
				oResourceBundle = this.getResourceBundle(),
				oAppViewModel = this.getModel("appView");
			sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCanEdit", false);
			oDetailViewModel.setProperty("/stateId", "D");
			oAppViewModel.setProperty("/bEnabledMasterViewCtr", true);
			oAppViewModel.setProperty("/sMasterListMode", "SingleSelectMaster");
			oDetailViewModel.setProperty("/bEditable", bEditable);
			sap.ushell.Container.setDirtyFlag(false);
		},
		_allowEditOnDocument: function() {
			var bEditable = true,
				oDetailViewModel = this.getModel("detailView"),
				oResourceBundle = this.getResourceBundle(),
				oAppViewModel = this.getModel("appView");

			sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCanEdit", true);
			oDetailViewModel.setProperty("/stateId", "E");
			oAppViewModel.setProperty("/bEnabledMasterViewCtr", false);
			oAppViewModel.setProperty("/sMasterListMode", "None");
			oDetailViewModel.setProperty("/bEditable", bEditable);
			sap.ushell.Container.setDirtyFlag(false);
		},

		_bindViewDone: function() {
			var that = this;
			var oViewModel = this.getModel("detailView");

			if (this.getView().getBindingContext()) {
				oViewModel.setProperty("/busy", true);
				var oPromiseWorkFlowLog = new Promise(function(resolve1, reject1) {
					that.getWorkFlowLogDetails({
						ApplicationId: "AS",
						Guid: that.getView().getBindingContext().getProperty("Guid")
					}, resolve1, reject1);
				}.bind(that));
				oPromiseWorkFlowLog.then(function() {
					oViewModel.setProperty("/busy", false);
				});
				oViewModel.setProperty("/Notingstring", "");
				oViewModel.updateBindings();
				that.subClassL01Value = that.getView().getBindingContext().getProperty("SubclassL01");
				that.byId("idSubClass01").getBinding("suggestionItems").refresh();
				that.byId("idSubClass02").getBinding("suggestionItems").refresh();
				that.byId("idSubClass03").getBinding("suggestionItems").refresh();

				that.getView().getModel("detailView").setProperty("/CategoryKey", that.getView().getBindingContext().getProperty("Category"));
				that.getView().getModel("detailView").setProperty("/ExecutingDeptKey", that.getView().getBindingContext().getProperty(
					"ExecutingDept"));
				that.getView().getModel("detailView").setProperty("/SanctioningDeptKey", that.getView().getBindingContext().getProperty(
					"InitiatinDept"));

				that.getUserFeedList();
				that._setObjectSectionVisibility();
				that._setLocationListDisplay();
				if (that._clearValueStates) {
					that._clearValueStates("oControlModel");
				}
				that._switchControlModel();
				that._setAmendPageTitle(that.getModel("detailView").getProperty("/stateId"));
				//set the Object  Header Title
				that.setPageHeaderTitle(that.getModel("detailView").getProperty("/stateId"));
				//	that._bindTreeTableRows();
				that.byId("idWorksHoA").updateAggregation("items");
				that._identifyHoaDdoFilters();
				that._setHoaDdoFilters();
				//Bind Position
				that._updatePositionBinding();
				//Clear MainworkNature
				that._initControlValue();
				//Dynamic BindingLocal Class and catory
				that._bindSelectControl();
				//Dynamic enable of Executing Dept if No TS is create with this AS
				that._editableExectDepartment();

				var documentPosition;
				if (that.getView().getBindingContext().getProperty("Udf1")) {
					documentPosition = that.getView().getBindingContext().getProperty("Udf1");
				} else {
					documentPosition = this.getModel("appView").getProperty("/position");
				}
				var aFilters = [];
				var oFilter = new Filter(
					"UserPosition",
					sap.ui.model.FilterOperator.Contains, documentPosition
				);
				aFilters.push(oFilter);
				//			            if (that.getView().getBindingContext().getProperty("MigrationInd")) {
				var oFilterGuid = new Filter(
					"ASGuid",
					sap.ui.model.FilterOperator.EQ, that.getView().getBindingContext().getProperty("MigrationInd") === false ?
					"00000000-0000-0000-0000-000000000000" : that.getView().getBindingContext().getProperty("Guid")
				);
				aFilters.push(oFilterGuid);
				//			            }
				that.getView().byId("idInitDept").getBinding("items").filter(aFilters);
				//		that.getView().byId("idInitDept").getBinding("items").refresh();
			}
		},

		_navBackPreventDefault: function(sMainAction, sWarningMsg) {
			if (sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/SessionGuid")) {
				if (this.getModel("detailView").getProperty("/bEditable")) {
					var sMsgText = this.getModel("i18n").getResourceBundle().getText(sWarningMsg);
					MessageBox.warning(sMsgText, {
						actions: [MessageBox.Action.YES, MessageBox.Action.NO],
						onClose: function(oAction) {
							if (oAction === MessageBox.Action.YES) {
								var oParam = {
									Application: "AS",
									Guid: this.getView().getBindingContext().getProperty("Guid"),
									SessionGuid: sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/SessionGuid")
								};
								sap.ushell.Container.setDirtyFlag(false);
								this._deleteLockAndNavBack("LOCKDEL", oParam.Guid, oParam.Application, oParam.SessionGuid, sMainAction);
							}
						}.bind(this)
					});
				} else {
					if (sMainAction === "BackBtnAction") {
						window.history.go(-1);
					} else {
						this._navToShellHome();
					}
				}
			}
		},

		onSelectChangeCategory: function(oEvent) {
			var sFValue = "",
				sKey = oEvent.getSource().data("clearKey");
			if (sKey) {
				var oParams = {
					sProperty: sKey
				};
				this._clearDependentField(oParams);
			}
			if (oEvent.getSource().getMetadata().getElementName() === "sap.m.DatePicker") {
				sFValue = sap.ui.model.odata.ODataUtils.formatValue(oEvent.getSource().getDateValue(), "Edm.DateTime");
			} else {
				sFValue = oEvent.getSource().getSelectedKey();
			}
			if (sFValue || !oEvent.getSource().getValue()) {
				oEvent.getSource().setValueState();
				if (this.getModel("oControlModel")) {
					this.getModel("oControlModel").setProperty("/" + oEvent.getSource().getCustomData()[0].getProperty("value") + "/" + "/valueState",
						"None");
				}

			} else {
				oEvent.getSource().setValueState("Error");
			}

			var sorceHoATable = this.getView().byId("idWorksHoA").getItems();
			var Fnam = oEvent.getSource().getCustomData()[0].getProperty("value");
			var previousCategory = this.getView().getModel("detailView").getProperty("/CategoryKey");
			var sMsgText = this.getModel("i18n").getResourceBundle().getText("detail.message.warning.changeCategory");
			if (previousCategory) {
				if (previousCategory !== sFValue && sorceHoATable.length > 0) {
					MessageBox.confirm(sMsgText, {
						onClose: function(oAction) {
							if (oAction !== MessageBox.Action.OK) {
								this.getView().byId("idCategory").setSelectedKey(previousCategory);
								//return;
							} else {
								this._changeCategorySuccessful(Fnam, sFValue);
							}
						}.bind(this)
					});
				} else {
					this._changeCategorySuccessful(Fnam, sFValue);
				}
			} else {
				this._changeCategorySuccessful(Fnam, sFValue);
			}
		},

		_changeCategorySuccessful: function(Fnam, sFValue) {
			var oDetailViewModel = this.getModel("detailView");
			if (sFValue === "02") {
				oDetailViewModel.setProperty("/bUAVisible", true);
				oDetailViewModel.setProperty("/bOwnDCW", true);
			} else {
				oDetailViewModel.setProperty("/bUAVisible", false);
				oDetailViewModel.setProperty("/bOwnDCW", false);
			}

			this.bRefreshDDoTable = true;
			this._identifyHoaDdoFilters();
			this._setHoaDdoFilters();
			this._updateCallForCategoryandExeDeptandSancDept(Fnam, sFValue);
			this.getView().getModel("detailView").setProperty("/CategoryKey", sFValue);
		},

		onSelectChangeExectDept: function(oEvent) {
			var sPreviousExetDept = this.getView().getModel("detailView").getProperty("/ExecutingDeptKey");
			var sFValue = oEvent.getSource().getSelectedKey();
			var Fnam = oEvent.getSource().getCustomData()[0].getProperty("value");
			var sorceHoATable = this.getView().byId("idWorksHoA").getItems();
			var sMsgText = this.getModel("i18n").getResourceBundle().getText("detail.message.warning.changeExectDept");
			if (sPreviousExetDept) {
				if (sPreviousExetDept !== sFValue && sorceHoATable.length > 0) {
					MessageBox.confirm(sMsgText, {
						onClose: function(oAction) {
							if (oAction !== MessageBox.Action.OK) {
								this.getView().byId("idExecDept").setSelectedKey(sPreviousExetDept);
								//									return;
							} else {
								this._changeExectDeptSuccessful(Fnam, sFValue);
							}
						}.bind(this)
					});
				} else {
					this._changeExectDeptSuccessful(Fnam, sFValue);
				}
			} else {
				this._changeExectDeptSuccessful(Fnam, sFValue);
			}
		},

		_changeExectDeptSuccessful: function(Fnam, sFValue) {
			this.bRefreshDDoTable = true;
			if (this.getView().getBindingContext().getProperty("Status") === "E0003") {
				this.bRefreshDDoTable = false;
			}
			this._identifyHoaDdoFilters();
			this._setHoaDdoFilters();
			this._updateCallForCategoryandExeDeptandSancDept(Fnam, sFValue);
			this.getView().getModel("detailView").setProperty("/ExecutingDeptKey", sFValue);
		},

		_updateCallForCategoryandExeDeptandSancDept: function(Fnam, sFValue) {
			var oASUpdatePayload = {
				Action: "UPHDR",
				Guid: this.getView().getBindingContext().getProperty("Guid"),
				LockTimestamp: "\/Date(" + (new Date()).getTime() + ")\/",
				Fnam: Fnam,
				Fval: sFValue,
				Code: "",
				Position: this.getModel("appView").getProperty("/position"),
				InitiatinDept: "",
				DepartDesc: "",
				SessionGuid: sap.ui.getCore().getModel("ZWRKGlobalModel").getProperty("/AS/SessionGuid")
			};
			/*if (oEvent.getSource().data("apprField") && (oEvent.getSource().getBindingContext().getProperty("Status") === "E0003")) {
				oASUpdatePayload.Action = "APPR_UPDT";
			}
			if (oEvent.getSource().getCustomData() && oEvent.getSource().getCustomData()[0].getValue() === "Scheme" && (oEvent.getSource().getBindingContext()
					.getProperty("Status") === "E0003")) {
				oASUpdatePayload.Action = "APPR_UPDT";
			}*/
			//var sUpdPath = "/WrkASDetailsDraftSet(Guid=guid'" + oEvent.getSource().getBindingContext().getProperty("Guid") + "'),LockTimestamp=\/Date(" +  ( new Date()).getTime() + ")\/ )";

			if (this.getView().getBindingContext().getProperty("Status") === "E0003") {
				oASUpdatePayload.Action = "APPR_UPDT";
			}

			var sUpdPath = this.getModel().createKey("WrkASDetailsDraftSet", {
				Guid: this.getView().getBindingContext().getProperty("Guid"),
				LockTimestamp: new Date().getTime()
			});

			sUpdPath = "/" + sUpdPath;
			this.getModel().update(sUpdPath, oASUpdatePayload, {
				success: function(oData, oResponse) {
					this.getModel().setProperty(oASUpdatePayload.Fnam, oASUpdatePayload.Fval, this.getView().getElementBinding());
					if (this.bRefreshDDoTable) {
						this.byId("idWorksSrcHoA").getBinding("items").refresh(true);
						this.byId("idWorksHoA").getBinding("items").refresh(true);
						this.byId("idBudgetCtrl").setValue("");
						this.byId("idBudgetCtrl").fireChange();
						this.bRefreshDDoTable = false;
					}
					if ((Fnam === "ExecutingDept" || Fnam === "InitiatinDept") && this.getView().getBindingContext().getProperty("Status") ===
						"E0003") {
						this._deleteDDOforCheckerandApprover();
					}
				}.bind(this),
				error: function(oError) {

				},
				refreshAfterChange: false
			});
		},

		_deleteDDOforCheckerandApprover: function() {
			var sGetPath = this.getModel().createKey("WrkHOASet", {
				Guid: this.getView().getBindingContext().getProperty("Guid"),
				HoaGuid: "00000000-0000-0000-0000-000000000000"
			});

			this.getView().getModel().remove("/" + sGetPath, {
				urlParameters: {
					Action: "APPR_DELI"
				},
				success: function(oData, oResponse) {
					this.byId("idWorksSrcHoA").getBinding("items").refresh(true);
					this.byId("idWorksHoA").getBinding("items").refresh(true);
					this.byId("idBudgetCtrl").setValue("");
					this.byId("idBudgetCtrl").fireChange();
					this.bRefreshDDoTable = false;
				}.bind(this),
				error: function(oError) {

				}.bind(this)

			});

		},

		_editableExectDepartment: function() {
			var bFieldControlOfExectDept = false;
			/*if(this.getView().getModel("oControlModel")){
				bFieldControlOfExectDept  = this.getView().getModel("oControlModel").getProperty("/").ExecutingDept.display;
			}*/

			//New create AS only guid is available
			//else call _editableExectDepartment after
			// _callFieldControlBasedOnRole where we have updated
			// field control
			if (!this.getView().getBindingContext().getProperty("Code")) {
				this.getView().getModel("detailView").setProperty("/bEditExectDept", true);
			} else {
				this._checkAvailableTSforASCode(bFieldControlOfExectDept);
			}

		},

		_checkAvailableTSforASCode: function(bFieldControlOfExectDept) {
			var sPath = "/ZWRK_C_TSHDR_DETAILS_C",
				aFilters = [];
			aFilters.push(new Filter("as_refcode", FilterOperator.EQ, this.getView().getBindingContext().getProperty("Code")));
			this.getView().getModel().read(sPath, {
				filters: aFilters,
				success: function(oData) {
					if (oData.results.length > 0) {
						this.getView().getModel("detailView").setProperty("/bEditExectDept", false);
					} else {
						this.getView().getModel("detailView").setProperty("/bEditExectDept", true);
					}
				}.bind(this),
				error: function() {
					this.getView().getModel("detailView").setProperty("/bEditExectDept", false);
				}.bind(this)
			});
		},

		/**
		 *Checking Document Role if role is same then don't call fieldControl
		 */
		_getOpenItemRole: function() {
			var oDynamicBusyIndicator = new DynamicBusyIndicator(this);
			oDynamicBusyIndicator.startBusy();
			var that = this,
				sPositionId = this.getModel("appView").getProperty("/position"),
				sObjectId = this.getView().getBindingContext().getProperty("Guid"),
				oAppViewModel = this.getModel("appView"),
				oResourceBundle = this.getResourceBundle(),
				oDetailViewModel = this.getModel("detailView");

			var oAuth = new Promise(function(resolve, reject) {
				this.getOwnerComponent().oDraft.getAuthorization({
					fName: "/GetOpenItems",
					ApplicationId: "AS",
					Guid: sObjectId,
					PositionId: sPositionId
				}, resolve, reject);
			}.bind(this));

			oAuth.then(function(oResult) {
				oDynamicBusyIndicator.endBusy();
				var oOpenItems = oResult.data.GetOpenItems;
				this.getModel("detailView").setProperty("/WfRole", oOpenItems.Wfrole);
				this._callFieldControlBasedOnRole();
			}.bind(this));
		},

		_callFieldControlBasedOnRole: function() {
			var oDynamicBusyIndicator = new DynamicBusyIndicator(this);
			oDynamicBusyIndicator.startBusy();
			var sStorePosition = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").PositionId;
			var sStorageRole = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").Role;
			var oViewAppModel = this.getOwnerComponent().getModel("appView");
			oViewAppModel.setProperty("/position", sStorePosition);
			oViewAppModel.setProperty("/role", sStorageRole);
			if ((this.getModel("detailView").getProperty("/WfRole") !== this.getModel("detailView").getProperty("/sFiledControlRole")) && (
					sStorageRole !== this.getModel("detailView").getProperty("/WfRole"))) {
				var fieldControlCall = new Promise(function(resolve1, reject1) {
					this._callFieldControl({
						action: "LOAD",
						application: "AS",
						Positionid: sStorePosition,
						Role: this.getModel("detailView").getProperty("/WfRole") ? this.getModel("detailView").getProperty("/WfRole") : sStorageRole
					}, resolve1, reject1);
				}.bind(this));

				fieldControlCall.then(function(oData) {
					oDynamicBusyIndicator.endBusy();
				}.bind(this));
				this.getModel("detailView").setProperty("/sFiledControlRole", this.getModel("detailView").getProperty("/WfRole"));
				//              
			} else if (this.getModel("detailView").getProperty("/sFiledControlRole")) {
				if (sStorageRole !== this.getModel("detailView").getProperty("/sFiledControlRole") && (this.getModel("detailView").getProperty(
						"/WfRole") !== this.getModel("detailView").getProperty("/sFiledControlRole"))) {
					var fieldControlCall = new Promise(function(resolve1, reject1) {
						this._callFieldControl({
							action: "LOAD",
							application: "AS",
							Positionid: sStorePosition,
							Role: this.getModel("detailView").getProperty("/WfRole") ? this.getModel("detailView").getProperty("/WfRole") : sStorageRole
						}, resolve1, reject1);
					}.bind(this));

					fieldControlCall.then(function(oData) {
						oDynamicBusyIndicator.endBusy();
					}.bind(this));
					this.getModel("detailView").setProperty("/sFiledControlRole", this.getModel("detailView").getProperty("/WfRole"));
				} else {
					oDynamicBusyIndicator.endBusy();
				}
			} else {
				this.controlModelSwitch(this.oDefaultControlModel);
				oDynamicBusyIndicator.endBusy();
			}

		},

		/**
		 * @param {sap.ui.base.Event} oEvent event raised on start of checklist attachment upload
		 */
		onBeforeChecklistUploadStarts: function(oEvent) {
			var sFileName = oEvent.getParameter("fileName"),
				sReason = this.byId("idTextAreaReason").getValue(),
				HGuid = this.getView().getBindingContext().getProperty("Guid"),
				sLongitude = "",
				sLatitude = "",
				sDocCategory = sap.ui.core.Fragment.byId(this.createId("idCheckList"), "idDocCategory").getValue();
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: HGuid + ";" + sFileName + ";" + sDocCategory + ";ChecList;" + sLongitude + ";" + sLatitude + ";" + "ZWAS"
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},

		/**
		 * @param {sap.ui.base.Event} oEvent event raised before upload starts
		 */
		onBeforeUploadStarts: function(oEvent) {
			var sFileName = oEvent.getParameter("fileName"),
				sReason = this.byId("idTextAreaReason").getValue(),
				sLongitude = "",
				sLatitude = "",
				HGuid = this.getView().getBindingContext().getProperty("Guid");
			this.byId("idTextAreaReason").setValue("");
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: HGuid + ";" + sFileName + ";;" + sReason + ";" + sLongitude + ";" + sLatitude + ";" + "ZWAS"
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},
		/**
		 * @param {sap.ui.base.Event} oEvent event raised on change of checklist
		 */

		onChecklistButtonPress: function(oEvent) {
			if (!this._checklistFrag) {
				var fragId = this.createId("idCheckList");
				this._checklistFrag = sap.ui.xmlfragment(fragId, "com.goap.cfms.works.as.fragment.checkListAttachment", this);
				this.getView().addDependent(this._checklistFrag);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._checklistFrag);
			}
			this._checklistFrag.open();
			var aFilter = [];
			aFilter.push(new Filter("DocCategory", FilterOperator.EQ, oEvent.getSource().getBindingContext().getProperty("ChkId")));
			aFilter.push(new Filter("DocGuid", FilterOperator.EQ, this.getView().getBindingContext().getProperty("Guid")));
			aFilter.push(new Filter("DocType", FilterOperator.EQ, "ZWAS"));
			sap.ui.core.Fragment.byId(this.createId("idCheckList"), "idChecklistUploadCollection").getBinding("items").filter(aFilter);
			sap.ui.core.Fragment.byId(this.createId("idCheckList"), "idDocCategory").setValue(oEvent.getSource().getBindingContext().getProperty(
				"ChkId"));
		},

		/**
		 * @param {sap.ui.base.Event} oEvent event raised after upload completes
		 */
		onUploadComplete: function(oEvent) {

			var aAttachFilters = new Filter({
				filters: [
					new Filter("DocType", "EQ", "ZWAS")
				],
				and: true
			});
			oEvent.getSource().getBinding("items").filter(aAttachFilters);
		},

		onUploadCompleteCheckList: function(oEvent) {
			var aFilter = [];
			var sDocCategory = sap.ui.core.Fragment.byId(this.createId("idCheckList"), "idDocCategory").getValue();
			aFilter.push(new Filter("DocCategory", FilterOperator.EQ, sDocCategory));
			aFilter.push(new Filter("DocGuid", FilterOperator.EQ, this.getView().getBindingContext().getProperty("Guid")));
			aFilter.push(new Filter("DocType", FilterOperator.EQ, "ZWAS"));
			sap.ui.core.Fragment.byId(this.createId("idCheckList"), "idChecklistUploadCollection").getBinding("items").filter(aFilter);

		},

		onSelectChangeSanctDept: function(oEvent) {
			var sPreviousExetDept = this.getView().getModel("detailView").getProperty("/SanctioningDeptKey");
			var sFValue = oEvent.getSource().getSelectedKey();
			var Fnam = "InitiatinDept";
			var sorceHoATable = this.getView().byId("idWorksHoA").getItems();
			var sMsgText = this.getModel("i18n").getResourceBundle().getText("detail.message.warning.changeSancDept");

			var sPath = oEvent.getSource().getSelectedItem().getBindingContext().getPath();
			var sDepartDesc = this.getView().getModel().getProperty(sPath).Depart_name;
			if (sPreviousExetDept) {
				if (sPreviousExetDept !== sFValue && sorceHoATable.length > 0) {
					MessageBox.confirm(sMsgText, {
						onClose: function(oAction) {
							if (oAction !== MessageBox.Action.OK) {
								this.getView().byId("idInitDept").setSelectedKey(sPreviousExetDept);
								//									return;
							} else {
								this._changeSanctDeptSuccessful(Fnam, sFValue);
								this._updateSanctDesc(sDepartDesc);
							}
						}.bind(this)
					});
				} else {
					this._changeSanctDeptSuccessful(Fnam, sFValue);
					this._updateSanctDesc(sDepartDesc);
				}
			} else {
				this._changeSanctDeptSuccessful(Fnam, sFValue);
				this._updateSanctDesc(sDepartDesc);
			}
		},

		_changeSanctDeptSuccessful: function(Fnam, sFValue) {
			this.bRefreshDDoTable = true;
			if (this.getView().getBindingContext().getProperty("Status") === "E0003") {
				this.bRefreshDDoTable = false;
			}
			this._identifyHoaDdoFilters();
			this._setHoaDdoFilters();
			this._updateCallForCategoryandExeDeptandSancDept(Fnam, sFValue);
			this.getView().getModel("detailView").setProperty("/SanctioningDeptKey", sFValue);
		},

		_updateSanctDesc: function(sDepartDesc) {
			var oASUpdatePayload = {
				Action: "UPHDR",
				Guid: this.getView().getBindingContext().getProperty("Guid"),
				LockTimestamp: "\/Date(" + (new Date()).getTime() + ")\/",
				Fnam: "InitDepartDesc",
				Fval: sDepartDesc,
				Code: "",
				Position: this.getModel("appView").getProperty("/position"),
				InitiatinDept: "",
				DepartDesc: "",
				SessionGuid: jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").SessionGuid
			};

			var sUpdPath = this.getModel().createKey("WrkASDetailsDraftSet", {
				Guid: this.getView().getBindingContext().getProperty("Guid"),
				LockTimestamp: new Date().getTime()
			});
			sUpdPath = "/" + sUpdPath;
			this.getModel().update(sUpdPath, oASUpdatePayload, {
				success: function(oData, oResponse) {

				}.bind(this),
				error: function(oError) {

				}
			});
		},

		checkBackendValidation: function(resolve, reject) {
			var that = this,
				oDetailViewModel = this.getModel("detailView"),
				oViewModel = this.getModel("detailView"),
				aWorkFlowLogData = oDetailViewModel.getProperty("/Worklog"),
				bWorkFlowDefined = true;
			if (aWorkFlowLogData.length >= 1) {
				this.getModel("appView").setProperty("/busy", true);
				this.getView().getModel().callFunction("/WrkSave", {
					method: "POST",
					urlParameters: {
						Action: "SAVE",
						Guid: this.getView().getBindingContext().getProperty("Guid"),
						Role: "",
						FPositionid: "",
						FFlag: "",
						AppID: "AS",
						FUserid: ""
					},
					success: function(oResponse) {
						resolve();
						//						this.getView().getElementBinding().refresh();
					}.bind(this),
					error: function(oResponse) {
						this.getModel("appView").setProperty("/busy", false);
					}.bind(this)
				});
			} else {
				var oPromiseWorkFlowLogOnSave = new Promise(function(resolve1, reject1) {
					that.getWorkFlowLogDetails({
						ApplicationId: "AS",
						Guid: that.getView().getBindingContext().getProperty("Guid")
					}, resolve1, reject1);
				}.bind(that));
				oPromiseWorkFlowLogOnSave.then(function() {
					oViewModel.setProperty("/busy", false);
					var aWrkFLogData = oDetailViewModel.getProperty("/Worklog");
					if (aWrkFLogData.length >= 1) {
						that._postSubmitCall(bWorkFlowDefined, oParams);
					} else {
						sap.m.MessageBox.error("Maker Role in Workflow not maintain");
					}
				});
			}
		},
		onWrkDocFlowAs: function(oEvent) {
			if (this.getModel("detailView").getProperty("/stateId") === "E" && oEvent.getSource().getBindingContext().getProperty("AppName") !==
				"AS") {
				sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", true);
			} else if (this.getModel("detailView").getProperty("/stateId") === "E" && oEvent.getSource().getBindingContext().getProperty(
					"AppName") === "AS") {
				sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bNavtoAsfromDocFlow", true);
				sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", true);
			}
			this.onWrkDocFlow(oEvent);
		},
		_handleSaveNotes: function(oEvent) {
			if (this._checkNoteforSave()) {
				var oParamsTemp = this._createPostCallParam("SUBMIT");
				var bNotesSave = new Promise(function(resolve, reject) {
					this._postCallforNotes(oParamsTemp, resolve, reject);
				}.bind(this));

				bNotesSave.then(function() {
					sap.m.MessageToast.show(this.getModel("i18n").getResourceBundle().getText("detail.message.note.saved"));
					var oDetailViewModel = this.getModel("detailView");
					if (oDetailViewModel) {
						oDetailViewModel.setProperty("/Notingstring", "");
					}
					this.getUserFeedList();
				}.bind(this));
			}
		},
		_checkNoteforSave: function() {
			var bNotingString = false,
				sDetailModel = this.getModel("detailView"),
				sLogInUser = sap.ushell.Container.getService("UserInfo").getId(),
				sNotingString = sDetailModel.getProperty("/Notingstring"),
				sNotes = sDetailModel.getProperty("/UserNotes");
			if (sNotingString === "" || !sNotingString) {
				this._displayWarnMessge(this.getModel("i18n").getResourceBundle().getText("detail.message.note.enter"));
			}
			//			else if (sNotes.length > 0 && sLogInUser === sNotes[0].Createdby) {
			//				sap.m.MessageBox.alert(this.getModel("i18n").getResourceBundle().getText("detail.message.note.present"));
			//			} 
			else {
				bNotingString = true;
			}
			return bNotingString;
		},
		_handleClearNote: function(oEvent) {
			var oDetailViewModel = this.getModel("detailView");
			if (oDetailViewModel) {
				oDetailViewModel.setProperty("/Notingstring", "");
				sap.m.MessageToast.show(this.getModel("i18n").getResourceBundle().getText("detail.message.note.cleared"));
			}
		},
		/**
		 * Create new scheme code
		 * @param {Object} oEvent Event Object
		 */
		_handlePressAddNewScheme: function(oEvent) {
			// create value help dialog
			if (!this._valueHelpSchemeDialog) {
				this._valueHelpSchemeDialog = sap.ui.xmlfragment(
					"com.goap.cfms.works.as.fragment.createScheme",
					this
				);
				this.getView().addDependent(this._valueHelpSchemeDialog);
			}
			// open value help dialog filtered by the input value
			this._valueHelpSchemeDialog.open();
		},
		_handleSaveSchemeCreate: function() {
			var oParams = this._getParamsForScheme();
			if (oParams.SchemeAbbr === "") {
				sap.m.MessageBox.error(this.getModel("i18n").getResourceBundle().getText("detail.ops.panel.content.label.Schme.Error"));
				return;
			}
			this._valueHelpSchemeDialog.setBusy(true);
			var sUpdPath = "/" + "WrkSchemesSet";
			this.getModel().create(sUpdPath, oParams, {
				success: function() {
					MessageToast.show(this.getResourceBundle().getText("detail.message.create.success"));
					this._valueHelpSchemeDialog.setBusy(false);
					this.byId("idSchemeCode").getBinding("items").refresh(true);
					this._handleCancelSchemeCreate();
				}.bind(this),
				error: function(oError) {
					this._valueHelpSchemeDialog.setBusy(false);
				}.bind(this)
			});
		},
		_handleCancelSchemeCreate: function() {
			if (this._valueHelpSchemeDialog) {
				this.getView().getModel("detailView").setProperty("/schemeDesc", "");
				this._valueHelpSchemeDialog.close();
				this._valueHelpSchemeDialog.destroy();
				delete this._valueHelpSchemeDialog;
			}
		},
		_getParamsForScheme: function() {
			var SchemDesc = this.getView().getModel("detailView").getProperty("/schemeDesc");
			return {
				Action: "INS_SCHEME",
				SchemeId: "",
				SchemeAbbr: this._handleGetJsFirstAlphaString(SchemDesc),
				SchemeDesc: SchemDesc.toUpperCase()
			};
		},
		_handleGetJsFirstAlphaString: function(sValue) {
			var matches = sValue.match(/\b(\w)/g);
			return matches.join('').toUpperCase();
		},
		updateControlModel: function(oModel) {
			var sCatagory = this.getView().getBindingContext().getProperty("Category"),
				sDcWType = this.getView().getBindingContext().getProperty("DcwType");
			if (sDcWType === "02" && sCatagory === "02") {
				this.getModel("oControlModel").setProperty("/SourceDdo/mandatory",
					true);
				this.getModel("oControlModel").setProperty("/SourceHoa/mandatory",
					true);
				this.getModel("oControlModel").setProperty("/SourceDdo/valueState", "Error");
				this.getModel("oControlModel").setProperty("/SourceHoa/valueState", "Error");
			} else {
				this.getModel("oControlModel").setProperty("/SourceDdo/mandatory",
					false);
				this.getModel("oControlModel").setProperty("/SourceHoa/mandatory",
					false);
				this.getModel("oControlModel").setProperty("/SourceDdo/valueState", "None");
				this.getModel("oControlModel").setProperty("/SourceHoa/valueState", "None");
			}
		}

	});
});