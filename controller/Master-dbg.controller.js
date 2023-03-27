sap.ui.define([
	"com/goap/cfms/works/reuselib/WorksBaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"com/goap/cfms/works/as/model/formatter",
	"com/goap/cfms/works/reuselib/VHDialog.controller",
	"com/goap/cfms/works/as/util/Constants",
	"sap/m/MessageBox",
	"com/goap/cfms/works/reuselib/DynamicBusyIndicator"
	//"as/sap/DemoApp/model/formatter"
], function(BaseController, JSONModel, History, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Formatter, VHDialog,
	Constants, MessageBox, DynamicBusyIndicator) {
	"use strict";

	return BaseController.extend("com.goap.cfms.works.as.controller.Master", {

		formatter: Formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit: function() {
			// Control state model
			var oList = this.byId("ItemsST"),
				oViewModel = this._createViewModel();
			// Put down master list's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the master list is
			// taken care of by the master list itself.
			var iOriginalBusyDelay = oList.getBusyIndicatorDelay();
			this._oList = oList;
			// keeps the filter and search state
			this._oListFilterState = {
				aFilter: [],
				aSearch: []
			};
			this.setModel(oViewModel, "masterView");

			this.setModel(new JSONModel({
				amendEditable: false,
				copyEditable: false
			}), "createNewASModel");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oList.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for the list
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
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

			var sStorePosition = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").PositionId;
			var oViewAppModel = this.getOwnerComponent().getModel("appView");
			oViewAppModel.setProperty("/position", sStorePosition);
			oViewAppModel.setProperty("/role", jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").Role);
			//			oViewAppModel.setProperty("/bPositionChangeLoadFC", true);
			if (!sStorePosition) {
				sStorePosition = "00000000";
			}
			this._getUserRole(sStorePosition);

			this.getRouter().getRoute("default").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().getRoute("Detail").attachPatternMatched(this._onDetailRouteMatch, this);
			this.getRouter().attachRouteMatched(function(oEvent) {

				var sRouteName;
				sRouteName = oEvent.getParameter("name");
				if (sRouteName === "default") {
					//Select first item from list
					/*eslint-disable */
					//eslint-disable-invalid-this
					this._oListLoaded = new Promise(function(resolve, reject) {
						this.onListLoaded = resolve;
					}.bind(this));
					this._oListLoaded.then(function() {
						this._selectMasterListItem();
					}.bind(this));
					/*eslint-enable */
				}
			}, this);
			this.getRouter().attachBypassed(this.onBypassed, this);
			var oSmartFilterBar = this.byId("smartFilterBar");
			this.oMicBtn = this.byId("idMicBtn");
			if (!this.SpeechRecognition && this.oMicBtn) {
				/*eslint-disable */
				//eslint-disable-no-undef
				this.SpeechRecognition = new SpeechRecognizer(this);
				/*eslint-enable */
			}
			if (this.SpeechRecognition) {
				this.SpeechRecognition.registerTriggerButton(this.oMicBtn, function(sText) {
					var innerSearchBar = oSmartFilterBar.getBasicSearchControl();
					if (sText.length !== 0) {
						innerSearchBar.setValue(sText);
						innerSearchBar.fireSearch();
					}
				});
			}
			//Migrated Code
			var model = new sap.ui.model.json.JSONModel();
			model.setData([]);
			var data = {
				date: "",
				authority: "",
				dept: "",
				beschr: "",
				number: "",
				reNumber: "",
				type: "",
				goAmount: "",
				sancAmount: "",
				ddo: "",
				hoa: "",
				desc: "",
				oldasnumber: "",
				asnumber: "",
				guid: ""
			};
			model.setData([]);
			model.setData(data);
			this.getOwnerComponent().setModel(model, "migratedModel");
			this.getOwnerComponent().getModel("migratedModel").updateBindings();
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 * Event handler function 
		 * Hide the master view on Mode display
		 * @param {*} oEvent 
		 */
		onBeforeRendering: function(oEvent) {
			var oParam = this.getOwnerComponent().getComponentData().startupParameters.Mode;
			//var oParam = undefined;
			if (oParam) {
				var param = {
					target: "detail",
					masterPage: "MasterPage",
					detailPage: "DetailPage"
				};
				this._setScreenSize(param);

			}
		},
		/**
		 * After list data is available, this handler method updates the
		 * master list counter
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the master list object counter after new data is loaded
			this._updateListItemCount(oEvent.getParameter("total"));

		},
		/**
		 * Event handler for the value help to select Position
		 * @param {sap.ui.base.Event} oEvent is the event raised by the control
		 */
		onChangePosition: function(oEvent) {
			//var sCreatedBy = "14482503";
			var sCreatedBy = sap.ushell.Container.getService("UserInfo").getId();
			if (!this._opositionVHDialog) {
				this._opositionVHDialog = this._createFragment(this.createId("idPositionVH"), "com.goap.cfms.works.as.fragment.positionVH");
				this.getView().addDependent(this._opositionVHDialog);
			}
			if (!this.oTemplate) {
				var sId = "idPositionTemp";
				this.oTemplate = new sap.m.StandardListItem(this.createId(sId), {
					title: "{position}",
					description: "{STEXT}",
					type: "Active"
				});
			}
			var filter = new Filter("SUBPROCESS_AREA", FilterOperator.EQ, "AS");
			this._opositionVHDialog.bindAggregation("items", {
				path: "/ZWRK_C_USER_POSITIONS(p_user='" + sCreatedBy + "')/Set",
				filters: [filter],
				template: this.oTemplate
			});
			this._opositionVHDialog.open();
		},

		/**
		 * Event handler for HoA Ddo search in value help
		 * @param {sap.ui.model.Event} oEvent is the event for Search
		 */
		handlePositionSearch: function(oEvent) {
			var oFilter,
				aFilters = [],
				sValue = oEvent.getParameter("value");
			aFilters.push(new Filter("position", sap.ui.model.FilterOperator.Contains, sValue));
			oFilter = new Filter({
				filters: aFilters,
				bAnd: false
			});
			oEvent.getSource().getBinding("items").filter(oFilter);
		},
		/**
		 * Event handler function for Position selection
		 * 
		 */
		OnPositionSelect: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				sPosition = oSelectedItem.getTitle(),
				sDescription = oSelectedItem.getDescription();
			if (sPosition) {
				this.getModel("appView").setProperty("/position", sPosition);
				this.getModel("appView").setProperty("/positionText", sDescription);
				this.getModel("appView").setProperty("/bPositionChangeLoadFC", true);
				this.getModel("masterView").setProperty("/bPositionSelected", true);
				this._getUserRole(sPosition);
				this.byId("ItemsST").rebindList();
			}

		},

		/**
		 * Event handler for clicking Cancel on the Fragment to create AS
		 * @param {Event} oEvent of the cancel
		 */
		onCancelAS: function(oEvent) {
			//Migrated Code Starts
			this._createASFrag.close();
			sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", false);
			var oCreateNewASModel = this.getModel("createNewASModel");
			this._getCreateFragControlById("idNewRadioBtn").setSelected(true);
			oCreateNewASModel.setProperty("/amendEditable", false);
			oCreateNewASModel.setProperty("/copyEditable", false);
			oCreateNewASModel.setProperty("/migratedASRadioButtons", false);
			this._getCreateFragControlById("idMigratedASCode").resetProperty("value");
			this._getCreateFragControlById("idMigratedRadioBtnNonCfms").resetProperty("value");
			this._getCreateFragControlById("idMigratedASCode").resetProperty("valueState");
			this._getCreateFragControlById("idMigratedRadioBtnNonCfms").resetProperty("valueState");

			this._getCreateFragControlById("idCopyFromASCode").resetProperty("value");
			this._getCreateFragControlById("idAmendASCode").resetProperty("value");
			this._getCreateFragControlById("idCopyFromASCode").resetProperty("valueState");
			this._getCreateFragControlById("idAmendASCode").resetProperty("valueState");
			this.getModel("masterView").setProperty("bCreateBtnEnable", true);
			if (this.getModel("oBundleCodeModel")) {
				this.getModel("oBundleCodeModel").setData(null);
			}
			this.oSelectedObject = null;
			//Migrated Code Ends
		},

		/**
		 * function to create migrated as.
		 * @public
		 */
		_CreatePayLoadDupli: function() {
			var that = this;
			var sPosition = this.getModel("appView").getProperty("/position"),
				oPayload1 = {
					Action: "AMEND",
					Guid: $.sap.GUID,
					LockTimestamp: "\/Date(" + (new Date()).getTime() + ")\/",
					Fnam: "",
					Fval: "",
					Code: $.sap.ASNUMBER,
					Position: sPosition,
					InitiatinDept: "",
					DepartDesc: ""
				};

			//Migrated Code Starts
			// if (that._getCreateFragControlById("idMigratedRadioBtnPhaseOne").getSelected()) {
			// 	oPayload1.Action = "AMEND";
			// 	oPayload1.Guid = that.oSelectedObject.guid;
			// 	oPayload1.Code = that._getCreateFragControlById("idMigratedASCode").getValue();
			// }
			return oPayload1;
			//Migrated Code Ends
		},
		_SaveAmendActionDupli: function() {
			var that = this;
			var oCreateASDupli = new Promise(function(resolve, reject) {
				that.getOwnerComponent().oDraft.whenHdrCreate({
					path: "/WrkASDetailsDraftSet",
					data: that._CreatePayLoadDupli(),
					busyControl: that._createASFrag
				}, resolve, reject);
			}.bind(this));

			oCreateASDupli.then(function(oResult) {
				that._createASFrag.close();
				if (oResult.data.Action === "NEW") {
					that.getModel("appView").setProperty("/DepartDesc", oResult.data.DepartDesc);
					that.getModel("appView").setProperty("/InitiatinDept", oResult.data.InitiatinDept);
				} else if (oResult.data.Action === "COPY") {
					that._getCreateFragControlById("idCopyFromASCode").resetProperty("value");
					that.oSelectedObject = null;
					var oCreateNewASModel = that.getModel("createNewASModel");
					oCreateNewASModel.setProperty("/amendEditable", false);
					oCreateNewASModel.setProperty("/copyEditable", false);
				} else if (oResult.data.Action === "AMEND") {
					that._getCreateFragControlById("idAmendASCode").resetProperty("value");
					that.oSelectedObject = null;
					var oCreateNewASModel = that.getModel("createNewASModel");
					oCreateNewASModel.setProperty("/amendEditable", false);
					oCreateNewASModel.setProperty("/copyEditable", false);
				}
				that.getRouter().navTo("Detail", {
					objectId: oResult.data.Guid,
					stateId: "C"
				}, true);
			}.bind(this));
		},
		//Migrated Code Starts
		onCreateMigratedAS: function(oEvent) {
			var that = this;

			var sanAMount = "0";
			if (this._getMigratedCreateFragControlById("goCategory").getSelected() === true) {
				if (this._getMigratedCreateFragControlById("sancNo").getValue() === "") {
					sap.m.MessageBox.error("Please Enter the Sanction Number First!");
					return;
				}
				if (this._getMigratedCreateFragControlById("idMigratedASType").getSelectedItem() === null) {
					sap.m.MessageBox.error("Please Select Sanction Type First!");
					return;
				}
			}
			if (this._getMigratedCreateFragControlById("goCategory").getSelected() === false) {
				if (this._getMigratedCreateFragControlById("sancNo1").getValue() === "") {
					sap.m.MessageBox.error("Please Enter the Sanction Number First!");
					return;
				}
			}
			if (this._getMigratedCreateFragControlById("sancDate").getValue() === "") {
				sap.m.MessageBox.error("Please Select Sanction Date First!");
				return;
			}
			if (this._getMigratedCreateFragControlById("sancDept").getSelectedItem() === null) {
				sap.m.MessageBox.error("Please Select Sanction Department First!");
				return;
			}
			if (this._getMigratedCreateFragControlById("sanAuthority").getValue() === "") {
				sap.m.MessageBox.error("Please Select Sanction Authority First!");
				return;
			}
			if (that.getModel("createNewASModel").getData().migratedPhaseOneEditable === false) {
				if (this._getMigratedCreateFragControlById("sancAmount").getValue() === "") {
					sap.m.MessageBox.error("Please Select Sanction Amount First!");
					return;
				}
			}
			if (this._getMigratedCreateFragControlById("goAmount").getValue() === "") {
				sap.m.MessageBox.error("Please Select Go Amount First!");
				return;
			}

			if (that.getModel("createNewASModel").getData().migratedPhaseOneEditable === true) {
				for (var i = 0; i < this.getView().getModel("modelName").getData().results.length; i++) {
					var sanAMount = Number(sanAMount) + Number(this.getView().getModel("modelName").getData().results[i].SancAmunt);
					var RowTable = i + 1;
					if (this.getView().getModel("modelName").getData().results[i].MigASNumber === "") {
						sap.m.MessageBox.error("Please Enter the Old AS Number in Row '" + RowTable + "'. ");
						return;
					} else if (this.getView().getModel("modelName").getData().results[i].SancAmunt === "") {
						sap.m.MessageBox.error("Please Enter the Old AS Number in Row '" + RowTable + "'. ");
						return;
					}
				}
			} else {
				sanAMount = that._getMigratedCreateFragControlById("sancAmount").getValue();
				if (parseInt(this._getMigratedCreateFragControlById("goAmount").getValue()) < sanAMount) {
					sap.m.MessageBox.error("GO Amount sholud be greater than Sanction Amount!");
					return;
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
			for (var i = 0; i < this.getView().getModel("modelName").getData().results.length; i++) {
				Obj.ApplicationName = "ZWAS";
				Obj.OldAsNumber = this.getView().getModel("modelName").getData().results[i].MigASNumber;
				if (this.getView().getModel("modelName").getData().results[i].SancAmunt === "") {
					Obj.SanAmount = "0.00";
				} else {
					Obj.SanAmount = this.getView().getModel("modelName").getData().results[i].SancAmunt;
				}
				Obj.SanRefNo = this.getView().getModel("modelName").getData().results[i].SanctionRefe;
				Obj.PrjDesc = this.getView().getModel("modelName").getData().results[i].ASDescription;
				Arry.push(Obj);
				Obj = {};
			}
			var dt = this._DateCoversion(that.getOwnerComponent().getModel("migratedModel").getData().date);
			if (that.getModel("createNewASModel").getData().migratedPhaseOneEditable === true) {
				var migratedPayloadData = {
					Action: 'MIGDUPLI',
					Guid: "00000000-0000-0000-0000-000000000000",
					Sessionguid: "00000000-0000-0000-0000-000000000000",
					// OldAsNumber: that.oldASNumber,
					SanDate: dt,
					SanType: that.getOwnerComponent().getModel("migratedModel").getData().type,
					SanNumber: sancno,
					SanAmount: "0.00",
					GoAmount: that._getMigratedCreateFragControlById("goAmount").getValue(),
					SanAuthority: this._getMigratedCreateFragControlById("sanAuthority").getValue().split(" ")[0],
					SanCategory: category,
					SanDes: "",
					SanDepartment: that.getOwnerComponent().getModel("migratedModel").getData().beschr,
					Beschr: "",
					AsNumber: "",
					NonCfmsInd: that.getModel("createNewASModel").getProperty("/nonCfms"),
					Position: that.getModel("appView").getProperty("/position"),
					WrkOldAs_Nav: Arry
				};
			} else {
				var migratedPayloadData = {
					Action: 'MIGDUPLI',
					Guid: "00000000-0000-0000-0000-000000000000",
					Sessionguid: "00000000-0000-0000-0000-000000000000",
					// OldAsNumber: that.oldASNumber,
					SanDate: dt,
					SanType: that.getOwnerComponent().getModel("migratedModel").getData().type,
					SanNumber: sancno,
					SanAmount: that._getMigratedCreateFragControlById("sancAmount").getValue(),
					GoAmount: that._getMigratedCreateFragControlById("goAmount").getValue(),
					SanAuthority: this._getMigratedCreateFragControlById("sanAuthority").getValue().split(" ")[0],
					SanCategory: category,
					SanDes: "",
					SanDepartment: that.getOwnerComponent().getModel("migratedModel").getData().beschr,
					Beschr: "",
					AsNumber: "",
					NonCfmsInd: that.getModel("createNewASModel").getProperty("/nonCfms"),
					Position: that.getModel("appView").getProperty("/position"),
					WrkOldAs_Nav: Arry,
					TsFlag: false
				};
			}

			this.getOwnerComponent().getModel().create("/WrkMigCmmSet", migratedPayloadData, {
				method: 'POST',
				success: function(oData, oResponse) {
					$.sap.GUID = oData.Guid;
					$.sap.ASNUMBER = oData.AsNumber;
					// var this.AmendGuid = oData.Guid;
					// var this.AmendAsNumber = oData.AsNumber;
					that.getModel("appView").setProperty("/DepartDesc", oData.Beschr);
					that.getModel("appView").setProperty("/InitiatinDept", oData.SanDepartment);
					if (that.getOwnerComponent().getModel("uploadedItem") != undefined) {
						that.getOwnerComponent().getModel("uploadedItem").setData([]);
						that.getOwnerComponent().getModel("uploadedItem").refresh();
						that.getOwnerComponent().getModel("uploadedItem").updateBindings();
						sap.ui.getCore().byId("fileUpload").setValue("");
					}
					if (oData.MessageType == 'W') {
						sap.m.MessageBox.warning(oData.Message, {
							actions: ['OK', 'Cancel'],
							onClose: function(sAction) {

								if (sAction == 'OK') {
									that._saveMigratedASData(migratedPayloadData);
									// that._SaveAmendActionDupli();
								}
							}
						});
					} else {
						that._saveMigratedASData(migratedPayloadData);
					}
				},
				error: function(error) {
					// debugger;
					// sap.m.MessageBox.error("" + JSON.parse(error.responseText).error.message.value + "", {
					// 	actions: [sap.m.MessageBox.Action.OK],
					// 	onClose: function (sAction) {
					// 		if (sAction === "OK" || sAction === null) {}
					// 	}
					// });
				}
			});
		},

		// dateFormatForMasterList: function (sValue) {
		// 	var dDate = new Date();
		// 	if (sValue) {
		// 		dDate = new Date(sValue);
		// 		var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
		// 			style: "medium",
		// 			strictParsing: "true",
		// 			UTC: "true"
		// 		});
		// 		return oDateFormat.format(dDate);
		// 	}
		// },

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
				/*code changed on - cfms_ctm_npv -(27_01_23) -start*/
				/* old code -end*/
				dt2[0] = "01";
				dt2[1] = parseInt(dt2[1]) + 1;
				/*code changed on - cfms_ctm_npv -(27_01_23) -end*/
			} else if (dt2[1] === "02" && dt2[0] === "28" || dt2[1] === "02" && dt2[0] === "29") {
				/* old code -start*/
				// dt2[0] = "01";
				// dt2[1] = parseInt(dt2[1]) + 1;
				/* old code -end*/
				/*code changed on - cfms_ctm_npv -(27_01_23) -start*/
				/* old code -end*/
				dt2[0] = "01";
				dt2[1] = parseInt(dt2[1]) + 1;
				/*code changed on - cfms_ctm_npv -(27_01_23) -end*/
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

		_handleOk: function(oSource) {
			var oControl = oSource.getCustomData()[0].getValue(),
				oTable = this._getFragControlById("idSmartTable", "idVHDialog"),
				oSelectedObject = oTable.getTable().getSelectedContexts(),
				oModel = this.getModel();
			var aArray = [];
			var Obj = {};
			var LstRsultRow = this.getView().getModel("modelName").getData().results.length - 1;
			if (this.getView().getModel("modelName").getData().results.length > 0) {
				if (this.getView().getModel("modelName").getData().results.length > 0 && this.getView().getModel("modelName").getData().results[
						LstRsultRow].MigASNumber === "") {
					this.getView().getModel("modelName").getData().results.splice(LstRsultRow, 1);
					this.getView().getModel("modelName").refresh();
				}
				for (var k = 0; k < this.getView().getModel("modelName").getData().results.length; k++) {
					Obj.MigASNumber = this.getView().getModel("modelName").getData().results[k].MigASNumber;
					Obj.SancAmunt = this.getView().getModel("modelName").getData().results[k].SancAmunt;
					Obj.ASDescription = this.getView().getModel("modelName").getData().results[k].ASDescription;
					Obj.SanctionRefe = this.getView().getModel("modelName").getData().results[k].SanctionRefe;
					aArray.push(Obj);
					Obj = {};
				}
			}
			for (var i = 0; i < oSelectedObject.length; i++) {
				Obj.MigASNumber = oSelectedObject[i].getObject().project_id;
				Obj.SancAmunt = oSelectedObject[i].getObject().san_amt;
				Obj.ASDescription = oSelectedObject[i].getObject().prj_desc;
				Obj.SanctionRefe = oSelectedObject[i].getObject().san_ref_no;
				aArray.push(Obj);
				Obj = {};
			}
			aArray = {
				"results": aArray
			};
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(aArray);

			this.getView().setModel(oModel, "modelName");
			this.getView().getModel("modelName").refresh();
			this._handleExit();
		},
		//Migrated Code Ends

		/**
		 * function to close Migrated AS frag
		 * @public
		 */

		//Migrated Code Starts
		onCancelMigratedAS: function(oEvent) {
			var that = this;
			// var url = "/WrkAsMigSet(Guid=guid'" + this.getOwnerComponent().getModel("migratedModel").getData().guid + "',OldAsNumber='" + this.getOwnerComponent()
			// 	.getModel("migratedModel").getData().oldasnumber + "')";

			// this.getOwnerComponent().getModel().remove(url, {
			// 	method: 'DELETE',
			// 	async: true,
			// 	success: function (oData, oResponse) {
			// 		debugger;
			that._createMigratedASFrag.close();
			var oCreateNewASModel = that.getModel("createNewASModel");
			oCreateNewASModel.setProperty("/refVisible", false);
			oCreateNewASModel.setProperty("/typeVisible", true);
			oCreateNewASModel.updateBindings();
			sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", false);
			// 	},
			// 	error: function (e) {

			// 	}
			// });

		},
		//Migrated Code Ends

		/**
		 * Event handler for Radio button selection
		 * @param {sap.ui.base.Event} oEvent Event for selecting radio button on Create Fragment
		 */

		//Migrated Code Starts
		onSelectRadioButton: function(oEvent) {
			var sControlId = oEvent.getSource().getId(),
				oCreateNewASModel = this.getModel("createNewASModel");
			if (sControlId === this._getCreateFragControlById("idMigratedRadioBtnPhaseOne").getId()) {
				oCreateNewASModel.setProperty("/nonCfms", "");
				this._getCreateFragControlById("idCopyFromASCode").setValue("");
				this._getCreateFragControlById("idCopyFromASCode").resetProperty("valueState");
				this._getCreateFragControlById("idAmendASCode").setValue("");
				this._getCreateFragControlById("idAmendASCode").resetProperty("valueState");
				oCreateNewASModel.setProperty("/migratedPhaseOneEditable", true);
				oCreateNewASModel.setProperty("/migratedRadioBtnPhaseOneSelected", true);
				oCreateNewASModel.setProperty("/migratedRadioBtnNonCfmsSelected", false);
				oCreateNewASModel.setProperty("/migratedNonCfmsEditable", false);
				oCreateNewASModel.setProperty("/migratedSanctionVisible", false);
				// oCreateNewASModel.setProperty("/migratedPhaseOneTabelVisible", false);
			} else {
				oCreateNewASModel.setProperty("/nonCfms", "X");
				this._getCreateFragControlById("idCopyFromASCode").setValue("");
				this._getCreateFragControlById("idCopyFromASCode").resetProperty("valueState");
				this._getCreateFragControlById("idAmendASCode").setValue("");
				this._getCreateFragControlById("idAmendASCode").resetProperty("valueState");
				oCreateNewASModel.setProperty("/migratedPhaseOneEditable", false);
				oCreateNewASModel.setProperty("/migratedNonCfmsEditable", true);
				oCreateNewASModel.setProperty("/migratedRadioBtnPhaseOneSelected", false);
				oCreateNewASModel.setProperty("/migratedRadioBtnNonCfmsSelected", true);
				oCreateNewASModel.setProperty("/migratedSanctionVisible", true);
				// oCreateNewASModel.setProperty("/migratedPhaseOneTabelVisible", true);
			}
		},

		OnPressAddNewMigNumber: function(oEvent) {
			var oCreateNewASModel = this.getModel("createNewASModel");
			var Obj = {
				MigASNumber: "",
				SancAmunt: "",
				ASDescription: "",
				SanctionRefe: ""
			};
			var data = this.getView().getModel("modelName").getData().results;
			data.push(Obj);
			this.getView().getModel("modelName").refresh();
		},

		onPressDeleteRowForSanction: function(oEvent) {
			var RowId = oEvent.getSource().getId().split("-")[6];
			this.getView().getModel("modelName").getData().results.splice(RowId, 1);
			this.getView().getModel("modelName").refresh();
		},

		onMigratedDialogDateChange: function(oEvent) {
			var Sandate = oEvent.getSource().getValue();
			this.getOwnerComponent().getModel("migratedModel").getData().date = Sandate;
			this.getOwnerComponent().getModel("migratedModel").refresh();
		},
		//Migrated Code Ends

		//Migrated Code Starts
		_createMigAS: function(Code) {
			var Obj = {
				MigASNumber: "",
				SancAmunt: "",
				ASDescription: "",
				SanctionRefe: ""
			};
			var oModel = new sap.ui.model.json.JSONModel({
				results: []
			});
			oModel.getData().results.push(Obj);

			this.getView().setModel(oModel, "modelName");
			this.getView().getModel("modelName").refresh();
			$.sap.CreateNewASModel = this.getModel("createNewASModel");
			var oCreateNewASModel = this.getModel("createNewASModel");
			var model = new sap.ui.model.json.JSONModel();
			model.setData([]);
			var data = {
				EditableField: true
			};
			model.setData([]);
			model.setData(data);
			this.getOwnerComponent().setModel(model, "migratedModel");
			this.getOwnerComponent().getModel("migratedModel").updateBindings();
			if (oCreateNewASModel.getProperty("/migratedRadioBtnPhaseOneSelected") === true) {
				oCreateNewASModel.setProperty("/nonCfms", "");
				this._getCreateFragControlById("idCopyFromASCode").setValue("");
				this._getCreateFragControlById("idCopyFromASCode").resetProperty("valueState");
				this._getCreateFragControlById("idAmendASCode").setValue("");
				this._getCreateFragControlById("idAmendASCode").resetProperty("valueState");
				oCreateNewASModel.setProperty("/migratedPhaseOneEditable", true);
				oCreateNewASModel.setProperty("/migratedRadioBtnPhaseOneSelected", true);
				oCreateNewASModel.setProperty("/migratedRadioBtnNonCfmsSelected", false);
				oCreateNewASModel.setProperty("/migratedNonCfmsEditable", false);
				oCreateNewASModel.setProperty("/migratedSanctionVisible", false);
				oCreateNewASModel.setProperty("/migratedPhaseOneTabelVisible", true);
			} else {
				oCreateNewASModel.setProperty("/nonCfms", "X");
				this._getCreateFragControlById("idCopyFromASCode").setValue("");
				this._getCreateFragControlById("idCopyFromASCode").resetProperty("valueState");
				this._getCreateFragControlById("idAmendASCode").setValue("");
				this._getCreateFragControlById("idAmendASCode").resetProperty("valueState");
				oCreateNewASModel.setProperty("/migratedPhaseOneEditable", false);
				oCreateNewASModel.setProperty("/migratedNonCfmsEditable", true);
				oCreateNewASModel.setProperty("/migratedRadioBtnPhaseOneSelected", false);
				oCreateNewASModel.setProperty("/migratedRadioBtnNonCfmsSelected", true);
				oCreateNewASModel.setProperty("/migratedSanctionVisible", true);
				oCreateNewASModel.setProperty("/migratedPhaseOneTabelVisible", false);
			}
			this._createASFrag.close();
			// this._getCreateFragControlById("idMigratedASCode").resetProperty("value");
			this.oSelectedObject = null;
			oCreateNewASModel.setProperty("/amendEditable", false);
			oCreateNewASModel.setProperty("/copyEditable", false);
			oCreateNewASModel.setProperty("/refVisible", false);
			oCreateNewASModel.setProperty("/typeVisible", true);
			// oCreateNewASModel.setProperty("/creatBtnVisible", false);
			oCreateNewASModel.setProperty("/backBtnVisible", false);
			oCreateNewASModel.setProperty("/nextBtnVisible", true);
			oCreateNewASModel.setProperty("/sancno1", true);
			oCreateNewASModel.setProperty("/sancno2", false);
			if (!this._createMigratedASFrag) {
				var fragId = this.createId("createMigratedASDialog");
				this._createMigratedASFrag = sap.ui.xmlfragment(fragId, "com.goap.cfms.works.as.fragment.createMigratedASDialog", this);
				this.getView().addDependent(this._createMigratedASFrag);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._createMigratedASFrag);
			}
			
					/*	date picker only select (no need enter date) - in fragment - -start cfms_ctm_npv(27_01_23)*/
			// var dateArray = ["sancDate"];
			// dateArray.forEach(date => {
					// var oDatePicker = this._getMigratedCreateFragControlById("sancDate").getId();
					var oDatePicker = this._getMigratedCreateFragControlById("sancDate");
				// var oDatePicker = sap.ui.getCore().byId(date);
				// var oDatePicker = this.getView().byId(date);
				oDatePicker.addEventDelegate({
					onAfterRendering: function() {
						var oDateInner = this.$().find('.sapMInputBaseInner');
							// var oDateInner = this._getMigratedCreateFragControlById("sancDate").$().find('.sapMInputBaseInner');
						var oID = oDateInner[0].id;
						$('#' + oID).attr("disabled", "disabled");
					}
				}, oDatePicker);
			// });
			// sap.ui.getCore().byId("sancDate").setMaxDate(new Date());
			// sap.ui.getCore().byId("sancDate").setMaxDate(new Date());
			/*		date picker only select (no need enter date) - in fragment --End - cfms_ctm_npv(27_01_23)*/
			this._createMigratedASFrag.open();
			this._getMigratedCreateFragControlById("fileUpload").setSelected(false);
			this._setInputFieldsNumberOnly(this._getMigratedCreateFragControlById("sancAmount"));
			this._setInputFieldsNumberOnly(this._getMigratedCreateFragControlById("goAmount"));
			this._getMigratedCreateFragControlById("goCategory").setSelected(true);
			oCreateNewASModel.setProperty("/sancno1", true);
			oCreateNewASModel.setProperty("/sancno2", false);
			oCreateNewASModel.updateBindings();
			this._setInputFieldsNumberOnly(this._getMigratedCreateFragControlById("sancNo"));
			this._setFormReset();
			// old code -start
		//	this._manuallyDisabledDatePicker(this._getMigratedCreateFragControlById("sancDate"));
		// old code end
		},
		//Migrated Code Ends

		//Migrated Code Starts
		_setFormReset: function() {
			var goSanctionForm = this._getMigratedCreateFragControlById("goSanctionForm");
			for (var i = 0; i < goSanctionForm.getFormContainers().length; i++) {
				goSanctionForm.getFormContainers()[i].getFormElements()[0].getFields()[0].setValueState(sap.ui.core.ValueState.None);
				goSanctionForm.getFormContainers()[i].getFormElements()[0].getFields()[0].setValueStateText("");
				goSanctionForm.getFormContainers()[i].getFormElements()[0].getFields()[0].setValue("");
			}
			var goSanctionForm1 = this._getMigratedCreateFragControlById("goSanctionFormRight");
			for (var j = 0; j < goSanctionForm1.getFormContainers().length; j++) {
				if (goSanctionForm1.getFormContainers()[j].getFormElements()[0].getFields()[0].getMetadata()._sClassName != 'sap.m.CheckBox') {
					goSanctionForm1.getFormContainers()[j].getFormElements()[0].getFields()[0].setValueStateText("");
					goSanctionForm1.getFormContainers()[j].getFormElements()[0].getFields()[0].setValue("");
				}
				goSanctionForm1.getFormContainers()[j].getFormElements()[0].getFields()[0].setValueState(sap.ui.core.ValueState.None);

			}
		},
		//Migrated Code Ends

		/**
		 * function to close po upload dialog.
		 * @public
		 */

		//Migrated Code Starts
		onOKPOUploadDialog: function() {
			var that = this;
			var oCreateNewASModel = this.getModel("createNewASModel");
			this._poUploadFragment.close();
			this._createMigratedASFrag.close();
			oCreateNewASModel.setProperty("/backBtnVisible", false);
			oCreateNewASModel.setProperty("/nextBtnVisible", true);
			oCreateNewASModel.updateBindings();
			sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", true);
			this.getRouter().navTo("Detail", {
				objectId: that.payloadData.Guid,
				stateId: "C"
			}, true);
		},
		//Migrated Code Ends

		// onClosePOUploadDialog: function (oEvent) {
		// 	this.closeEventForDialog = oEvent.getSource();
		// 	this._poUploadFragment.close();
		// },
		/**
		 * event handler for upload button.
		 * @public
		 */

		//Migrated Code Starts
		onPOUpload: function() {
			var that = this;
			var poFile;
			if (this.poFile) {
				poFile = this.poFile;
			} else {
				poFile = [];
			}
			if (poFile.length > 0) {
				var payload = {
					AppType: "ZWAS",
					Guid: that.payloadData.Guid,
					WrkAppType_Nav: poFile,
					WrkUplRet_Nav: []
				};
				this.getOwnerComponent().getModel().create("/WrkAppTypeSet", payload, {
					method: 'POST',
					success: function(oData, oResponse) {
						var model = new sap.ui.model.json.JSONModel();
						model.setData([]);
						if (oData.WrkUplRet_Nav.results.length > 0) {
							model.setData(oData.WrkUplRet_Nav.results);
						}
						that.getOwnerComponent().setModel(model, "uploadedItem");
						that.getOwnerComponent().getModel("uploadedItem").refresh();
						that.getOwnerComponent().getModel("uploadedItem").updateBindings();
					},
					error: function(e) {}
				});
			} else {
				sap.m.MessageBox.error("Please select a file First!");
			}
		},
		//Migrated Code Ends

		/**
		 * Method to restrict user numbers only.
		 * @private
		 */

		//Migrated Code Starts
		_setInputFieldsNumberOnly: function(id) {
			id.attachBrowserEvent("keydown", function(e) {
				var isModifierkeyPressed = e.metaKey || e.ctrlKey || e.shiftKey;
				var isCursorMoveOrDeleteAction = [46, 8, 37, 38, 39, 40, 9].indexOf(e.keyCode) !== -1;
				var isNumKeyPressed = e.keyCode >= 48 && e.keyCode <= 58 || e.keyCode >= 96 && e.keyCode <= 105;
				var vKey = 86,
					cKey = 67,
					aKey = 65;

				switch (true) {
					case isCursorMoveOrDeleteAction:
					case isModifierkeyPressed === false && isNumKeyPressed:
					case (e.metaKey || e.ctrlKey) && [vKey, cKey, aKey].indexOf(e.keyCode) !== -1:
						break;

					default:
						e.preventDefault();
				}
			});
		},
		//Migrated Code Ends
		/**
		 * Method to fetch csrf token.
		 * @private
		 */

		//Migrated Code Starts
		getResponse: function getResponse(serverUrl, token) {
			var oResp;
			$.ajax(encodeURI(serverUrl), {
				type: "GET",
				async: false,
				beforeSend: function beforeSend(xhr) {
					xhr.setRequestHeader('Accept', 'application/json');
					xhr.setRequestHeader('Content-Type', 'application/json');
					xhr.setRequestHeader('X-CSRF-Token', token);
				}
			}).fail(function() {}).complete(function(response) {
				oResp = response;
			});
			return oResp;
		},
		/**
		 * Method to feed csv file to a file uploader.
		 * @private
		 */
		_import: function(file) {
			if (file && window.FileReader) {
				var reader = new FileReader();
				var that = this;
				reader.onload = function(evt) {
					var strCSV = evt.target.result;
					that.csvJSON(strCSV);
				};
				reader.readAsText(file);
			}
		},
		/**
		 * Method to convert csv to json.
		 * @private
		 */
		csvJSON: function(csv) {
			var lines = csv.split("\n");
			// for (var i = 0; i < lines.length; i++) {
			// 	lines[i] = lines[i] + ",zzz";
			// }
			lines.splice(0, 1);
			lines.unshift(
				"Item,Shorttext,Specification,Quantity,Grossprice"
				// "Purchdoc,Item,Shorttext,Doctype,Cocd,Plnt,Purorg,Purgrp,Matlgrp,Vendor,Itemcat,Acctasmt,Docdate,Specification,Shortxt,Quantity,BaseUnit,PriceUnit,Grossprice,Userfield1,Userfield2,Glaccount,Busienessarea,Wbs,Hoa,Ddo,Treasuryoffice,TsNumber"
			);
			var result = [];
			var headers = lines[0].split(",");
			lines.map(function(line, indexLine) {
				if (indexLine < 1) return; // Jump header line

				var obj = {};
				var currentline = line.split(",");

				headers.map(function(header, indexHeader) {
					if (header == "Docdate") {
						obj[header] = "\/Date(" + new Date().getTime() + ")\/";
					} else if (header == "Treasuryoffice\r") {
						obj["Treasuryoffice"] = currentline[indexHeader];
					} else {
						obj[header] = currentline[indexHeader];
					}

				});
				result.push(obj);
			});
			this.poFile = result;
		},
		/**
		 * Event Handler - when a file is being uploaded.
		 * @public
		 */
		/*eslint-disable */
		//eslint-disable-func-name-matching
		onFileUploaderChange: function onChange(oEvent) {
			this._import(oEvent.getParameter("files")[0]);
		},
		/*eslint-enable */
		/**
		 * Event Handler - to control file size.
		 * @public
		 */
		onFileSizeExceed: function onFileSizeExceed() {
			sap.m.MessageToast.show("File Size Exceed, File should be less than 2 mb");
		},
		/**
		 * Event Handler - to maintain file type.
		 * @public
		 */
		onTypeMissmatch: function onTypeMissmatch(oEvent) {
			sap.m.MessageToast.show("File type should be CSV only.");
		},
		//Migrated Code Starts

		onSelectChange: function(oEvent) {
			// var value =
			if (oEvent.getSource().getName() == 'SanDepartment') {
				this.SanCDepart = oEvent.getSource().getSelectedItem().getText();
				this.getOwnerComponent().getModel("migratedModel").getData().dept = oEvent.getParameter("selectedItem").getProperty("key");
			} else if (oEvent.getSource().getName() == 'SanType') {
				this.getOwnerComponent().getModel("migratedModel").getData().type = oEvent.getParameter("selectedItem").getProperty("key");
			}
			this.getOwnerComponent().getModel("migratedModel").updateBindings();
		},
		//Migrated Code Ends

		//Migrated Code Starts
		dateconv: function(value) {
			// var res = String(value).slice(4, 15);
			// var m = res.slice(0, 3);
			// var d = res.slice(4, 6);
			// var y = res.slice(7, 15);
			// switch (m) {
			// case "Jan":
			// 	m = "01";
			// 	break;

			// case "Feb":
			// 	m = "02";
			// 	break;

			// case "Mar":
			// 	m = "03";
			// 	break;

			// case "Apr":
			// 	m = "04";
			// 	break;

			// case "May":
			// 	m = "05";
			// 	break;

			// case "Jun":
			// 	m = "06";
			// 	break;

			// case "Jul":
			// 	m = "07";
			// 	break;

			// case "Aug":
			// 	m = "08";
			// 	break;

			// case "Sep":
			// 	m = "09";
			// 	break;

			// case "Oct":
			// 	m = "10";
			// 	break;

			// case "Nov":
			// 	m = "11";
			// 	break;

			// case "Dec":
			// 	m = "12";
			// 	break;
			// }
			var y = value.split(".")[2];
			var m = value.split(".")[1];
			var d1 = value.split(".")[0];
			/*eslint-disable */
			//eslint-disable-no-implicit-coercion
			var frmdatemil = y + "" + m + "" + d1;
			/*eslint-enable */
			return frmdatemil;
		},
		//Migrated Code Ends

		//Migrated Code Starts
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
		//Migrated Code Ends

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

		sacauthoritySearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var filters = new Array();
			var oFilter = new sap.ui.model.Filter([
				new sap.ui.model.Filter("Auth_Pos", sap.ui.model.FilterOperator.Contains, sValue),
				new sap.ui.model.Filter("Name_Pos", sap.ui.model.FilterOperator.Contains, sValue)
			]);
			filters.push(oFilter);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},
		//Migrated Code Ends

		/**
		 * @param {*} oEvent is the onselect event
		 */

		//Migrated Code Starts
		onSancTypeSelect: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this.getOwnerComponent().getModel("migratedModel").getData().type = oSelectedItem.getTitle();
				this.getOwnerComponent().getModel("migratedModel").updateBindings();
			}
		},
		//Migrated Code Ends

		/**
		 * function to return the Control 
		 * @param {string} sControlId Identifier for the Control Structure of Create Migrated Fragment
		 * @returns {Object} Control inside the fragment
		 */

		//Migrated Code Starts
		_getMigratedCreateFragControlById: function(sControlId) {
			return sap.ui.core.Fragment.byId(this.createId("createMigratedASDialog"), sControlId);
		},
		//Migrated Code Ends

		/**
		 * function to save migrated as data.
		 * @public
		 */

		//Migrated Code Starts
		_saveMigratedASData: function(data) {
			var that = this;
			data.Action = "MIGSAVE";
			this.getOwnerComponent().getModel().create("/WrkMigCmmSet", data, {
				method: 'POST',
				success: function(oData, oResponse) {

					//Updating sessionguid to browser storage
					var oParamsBrowserStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage");
					oParamsBrowserStorage.SessionGuid = oData.Sessionguid;
					jQuery.sap.storage(jQuery.sap.storage.Type.session).put("zworksBrowserStorage", oParamsBrowserStorage);

					sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/SessionGuid", oData.Sessionguid);
					sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", true);

					that.payloadData = oData;
					$.sap.ASNUMBER = oData;
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
						// sap.ui.getCore("fileUpload").setValue("");
					} else {
						that._createMigratedASFrag.close();
						var oCreateNewASModel = that.getModel("createNewASModel");
						oCreateNewASModel.setProperty("/backBtnVisible", false);
						oCreateNewASModel.setProperty("/nextBtnVisible", true);
						oCreateNewASModel.updateBindings();
						sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", true);
						that.getRouter().navTo("Detail", {
							objectId: oData.Guid,
							stateId: "C"
						}, true);
					}
				},
				error: function(error) {
					sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", false);
					// debugger;
					// sap.m.MessageBox.error("" + JSON.parse(error.responseText).error.message.value + "", {
					// 	actions: [sap.m.MessageBox.Action.OK],
					// 	onClose: function (sAction) {
					// 		if (sAction === "OK" || sAction === null) {}
					// 	}
					// });
				}
			});
		},
		//Migrated Code Ends

		/**
		 * Event handler for Multiprocess 
		 * @param {*} oEvent 
		 */
		onMultiProcessBtnPress: function(oEvent) {
			var oSource = oEvent.getSource();
			this._setMultiPosition(oSource.getIcon());
		},
		/**
		 * Private function to set Multi-Position 
		 * @param {string} sBtnTxt Button Icon text 
		 */
		_setMultiPosition: function(sBtnTxt) {
			var oMasterViewModel = this.getModel("masterView");
			if (sBtnTxt === "sap-icon://activate") {
				this.getModel("appView").setProperty("/sMasterListMode", "MultiSelect");
				oMasterViewModel.setProperty("/bMultiSelectVisible", true);
				this.byId("idMultiSelectBtn").setIcon("sap-icon://sys-cancel");
				this.byId("idStatusTab").setBusy(true);
			} else {
				this.getModel("appView").setProperty("/sMasterListMode", "SingleSelectMaster");
				oMasterViewModel.setProperty("/bMultiSelectVisible", false);
				this.byId("idMultiSelectBtn").setIcon("sap-icon://activate");
				this.byId("idStatusTab").setBusy(false);
			}
		},
		/**
		 * Event Handler function for Process Multiple AS
		 * @param {*} oEvent 
		 */
		onProcessPress: function(oEvent) {
			if (!this._massProcessFrag) {
				var fragId = this.createId("fragMassProcess");
				this._massProcessFrag = sap.ui.xmlfragment(fragId, "com.goap.cfms.works.as.fragment.massProcessNote", this);
				this.getView().addDependent(this._massProcessFrag);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._massProcessFrag);
			}
			this._massProcessFrag.open();
		},
		/**
		 * Event handler function to post selected AS
		 * @param {*} oEvent 
		 */
		onMultiProcess: function(oEvent) {
			var that = this,
				sUser = "",
				sPath = "";
			if (sap.ushell) {
				sUser = sap.ushell.Container.getService("UserInfo").getId();
			}
			sPath = this.getModel().createKey("User_DetailsSet", {
				User_ID: sUser,
				Application: 'AS',
				Role: this.getView().getModel("appView").getProperty("/role")
			});
			var params = {
				path: "/" + sPath,
				busyControl: that.getView()
			};
			if (this.getModel("masterView").getProperty("/Notingstring")) {
				this.oValidateBio = new Promise(function(resolve, reject) {
					this._getBioValidation(params, resolve, reject);
				}.bind(this));
				this.oValidateBio.then(function(oData) {
					that._bioCheckSuccessful({});
				}, function(oError) {
					that._bioCheckSuccessful({});
				});
			} else {
				this._displayWarnMessge(this.getModel("i18n").getResourceBundle().getText("detail.message.note.empty"));
			}
		},

		_bioCheckSuccessful: function(oParams) {
			var bWorkFlowDefined = true,
				oMultiProcessNoteDialog = sap.ui.core.Fragment.byId(this.createId("fragMassProcess"), "idMassProcessNoteDialog"),
				oMassPayload = this._getMassPayload();
			oMultiProcessNoteDialog.setBusy(true);
			if (oMassPayload.MassHeaderItems[0].Guid) {
				var sUserId = sap.ushell.Container.getService("UserInfo").getId();
				var oWorkFlow = new Promise(function(resolve, reject) {
					this.getOwnerComponent().oDraft.getWorkflow({
						method: "GET",
						fName: "/GetWorkFlowLog",
						urlParameters: {
							ApplicationId: "AS",
							Guid: oMassPayload.MassHeaderItems[0].Guid,
							busyControl: this.getView()
						}
					}, resolve, reject);
				}.bind(this));
				oWorkFlow.then(function(oResult) {
					var aWorkFlowLogData = oResult.data.results;
					if (aWorkFlowLogData.length >= 1) {
						for (var i = 0; i < aWorkFlowLogData.length; i++) {
							if ((sUserId === aWorkFlowLogData[i].Pernr) && (aWorkFlowLogData.length - 1) === i) {
								bWorkFlowDefined = false;
							}
						}
					}
					if (bWorkFlowDefined) {
						this.workflowProcess();
					} else {
						this.getModel("appView").setProperty("/busy", false);
						MessageBox.alert(this.getResourceBundle().getText("detail.error.msg.wrkflowRoleNotMaint"), {
							actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
							onClose: function(sAction) {
								if (sAction === "YES") {
									this._reusePositionValueHelp(oMassPayload);
								}
							}.bind(this)
						});
					}
				}.bind(this));
			}
		},
		/**
		 * multi-Process of AS document
		 */
		workflowProcess: function() {
			var oWFCModel = this.getModel("WFCModel"),
				oMultiProcessNoteDialog = sap.ui.core.Fragment.byId(this.createId("fragMassProcess"), "idMassProcessNoteDialog"),
				oMassPayload = this._getMassPayload();
			oMassPayload.Fflag = "X";
			oMassPayload.Fposition = oWFCModel.getProperty("/nextPositionID");
			oMassPayload.Fuserid = oWFCModel.getProperty("/nextUserID");
			var oMultiProcess = new Promise(function(resolve, reject) {
				this.getOwnerComponent().oDraft.whenHdrCreate({
					path: "/ZWRK_MASS_HEADERSet",
					data: oMassPayload,
					busyControl: this.getView()
				}, resolve, reject);
			}.bind(this));
			oMultiProcess.then(function(oResult) {
				oMultiProcessNoteDialog.setBusy(false);
				this._massProcessFrag.close();
				this.getModel("masterView").setProperty("/Notingstring", "");
				this.getModel("appView").setProperty("/sMasterListMode", "SingleSelectMaster");
				this.getModel("masterView").setProperty("/bMultiSelectVisible", false);
				this.byId("idMultiSelectBtn").setIcon("sap-icon://activate");
				this.byId("idStatusTab").setBusy(false);
				this.getModel().refresh();
			}.bind(this));
		},
		/**
		 * Event handler to close the Note fragment
		 * @param {*} oEvent 
		 */
		onCancelMultiProcess: function() {
			this._massProcessFrag.close();
		},
		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
				return;
			}

			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				this._oListFilterState.aSearch = [new Filter("ShortDesc", FilterOperator.Contains, sQuery)];
			} else {
				this._oListFilterState.aSearch = [];
			}
			this._applyFilterSearch();
		},
		/**
		 * Event Handler function to Open Create AS frag
		 * @param {Event} oEvent is the event
		 */
		onCreateNewAS: function(oEvent) {
			var oCreateNewASModel = this.getModel("createNewASModel");
			if (!this._createASFrag) {
				var fragId = this.createId("fragCreateFrag");
				this._createASFrag = sap.ui.xmlfragment(fragId, "com.goap.cfms.works.as.fragment.createAS", this);
				this.getView().addDependent(this._createASFrag);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._createASFrag);
			}
			this._getCreateFragControlById("idNewRadioBtn").setSelected(true);
			oCreateNewASModel.setProperty("/amendEditable", false);
			oCreateNewASModel.setProperty("/copyEditable", false);
			//Migrated Code Starts
			oCreateNewASModel.setProperty("/migratedASRadioButtons", false);
			//Migrated Code Ends
			if (this.getModel("oBundleCodeModel")) {
				this.getModel("oBundleCodeModel").setData(null);
			}
			oCreateNewASModel.updateBindings();
			this._createASFrag.open();
		},

		/**
		 * Event Handler function to Create New Admin Sanction
		 * @param {Event} oEvent is the event handler
		 */
		onCreateAS: function(oEvent) {
			var oASPayload;
			if (this._validateCreate()) {
				//Migrated Code Starts
				/*if (this._getCreateFragControlById("idMigratedRadioBtnPhaseOne").getSelected() || this._getCreateFragControlById(
						"idMigratedRadioBtnNonCfms").getSelected()) {*/
				if (this._getCreateFragControlById("idMigratedRadioBtn").getSelected()) {
					if (this._getCreateFragControlById("idMigratedRadioBtnPhaseOne").getSelected()) {
						var code = "0000000001";
						this._createMigAS(code);
					}
					if (this._getCreateFragControlById("idMigratedRadioBtnNonCfms").getSelected()) {
						var code = "0000000001";
						this._createMigAS(code);
						// this._createMigAS(oASPayload.Code);
					}
					//Migrated Code Ends
				} else {
					//					this._createASFrag.setBusy(true);
					var oDynamicBusyIndicator = new DynamicBusyIndicator(this);
					oDynamicBusyIndicator.startBusy();
					this.getModel("masterView").setProperty("bCreateBtnEnable", false);
					oASPayload = this._createPayload();
					this.oldASNumber = oASPayload.Code;
					var oCreateAS = new Promise(function(resolve, reject) {
						this.getOwnerComponent().oDraft.whenHdrCreate({
							path: "/WrkASDetailsDraftSet",
							data: oASPayload,
							busyControl: this._createASFrag
						}, resolve, reject);
					}.bind(this));

					oCreateAS.then(function(oResult) {
						//						this._createASFrag.setBusy(false);
						oDynamicBusyIndicator.endBusy();
						this._createASFrag.close();
						if (oResult.data.Action === "NEW") {
							this.getModel("appView").setProperty("/DepartDesc", oResult.data.DepartDesc);
							this.getModel("appView").setProperty("/InitiatinDept", oResult.data.InitiatinDept);
						} else if (oResult.data.Action === "COPY") {
							this._getCreateFragControlById("idCopyFromASCode").resetProperty("value");
							this.oSelectedObject = null;
							var oCreateNewASModel = this.getModel("createNewASModel");
							oCreateNewASModel.setProperty("/amendEditable", false);
							oCreateNewASModel.setProperty("/copyEditable", false);
						} else if (oResult.data.Action === "AMEND") {
							this._getCreateFragControlById("idAmendASCode").resetProperty("value");
							this.oSelectedObject = null;
							var oCreateNewASModel = this.getModel("createNewASModel");
							oCreateNewASModel.setProperty("/amendEditable", false);
							oCreateNewASModel.setProperty("/copyEditable", false);
						}

						//Updating sessionguid to browser storage
						var oParamsBrowserStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage");
						oParamsBrowserStorage.SessionGuid = oResult.data.SessionGuid;
						jQuery.sap.storage(jQuery.sap.storage.Type.session).put("zworksBrowserStorage", oParamsBrowserStorage);

						sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/SessionGuid", oResult.data.SessionGuid);
						sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", true);
						this.getModel("masterView").setProperty("bCreateBtnEnable", true);
						this.getRouter().navTo("Detail", {
							objectId: oResult.data.Guid,
							stateId: "C"
						}, true);
					}.bind(this));
					oCreateAS.catch(function(oError) {
						oDynamicBusyIndicator.endBusy();
						this.getModel("masterView").setProperty("bCreateBtnEnable", true);
					}.bind(this));
				}
			}
		},

		/**
		 * Function to call for check validation for mandatory feilds
		 */

		_validateInputs: function() {
			var ainputs;
			if (this._getMigratedCreateFragControlById("goCategory").getSelected()) {
				//Migrated Code Starts
				ainputs = Constants.userInputControls.inputsForMigratedAgrFrag;
				//Migrated Code Ends
			} else {
				ainputs = Constants.userInputControls.inputs;
			}
			for (var i = 0; i < ainputs.length; i++) {
				//Migrated Code Starts
				var aControls = this._getMigratedCreateFragControlById(ainputs[i]);
				//Migrated Code Ends
				var oElementName = aControls.getMetadata().getElementName();
				switch (oElementName) {
					case "sap.m.Input":
						var svalue = aControls.getValue();
						if (svalue === "") {
							aControls.setValueState("Error");
							aControls.setValueStateText("Enter Mandatory Fields");
							return false;
						} else {
							aControls.setValueState("None");
							aControls.setValueStateText("");
						}
						break;
					case "sap.m.DatePicker":
						var svalue = aControls.getDateValue();
						if (svalue === null) {
							aControls.setValueState("Error");
							aControls.setValueStateText("Enter Mandatory Fields");
							return false;
						} else {
							aControls.setValueState("None");
							aControls.setValueStateText("");
						}
						break;
					case "sap.m.Select":
						var svalue = aControls.getSelectedKey();
						if (svalue === "") {
							aControls.setValueState("Error");
							aControls.setValueStateText("Enter Mandatory Fields");
							return false;
						} else {
							aControls.setValueState("None");
							aControls.setValueStateText("");

						}
						break;
				}

			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			this._oList.getBinding("items").refresh();
		},

		/**
		 * Event handler for the filter, sort and group buttons to open the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the button press event
		 * @public
		 */
		onOpenViewSettings: function(oEvent) {
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = sap.ui.xmlfragment("as.sap.DemoApp.view.ViewSettingsDialog", this);
				this.getView().addDependent(this._oViewSettingsDialog);
				// forward compact/cozy style into Dialog
				this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			var sDialogTab = "sort";

			this._oViewSettingsDialog.open(sDialogTab);
		},

		/**
		 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
		 * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
		 * are applied to the master list, which can also mean that they
		 * are removed from the master list, in case they are
		 * removed in the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
		onConfirmViewSettingsDialog: function(oEvent) {

			this._applySortGroup(oEvent);
		},

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
		onSelectionChange: function(oEvent) {
			var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");

			// skip navigation when deselecting an item in multi selection mode
			// if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
			if (!(oList.getMode() === "MultiSelect")) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this.getView().byId("ItemsST").getList().setSelectedItem(oList);
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			}
		},

		/**
		 * Event handler for the bypassed event, which is fired when no routing pattern matched.
		 * If there was an object selected in the master list, that selection is removed.
		 * @public
		 */
		onBypassed: function() {
			this._oList.removeSelections(true);
		},

		/**
		 * Used to create GroupHeaders with non-capitalized caption.
		 * These headers are inserted into the master list to
		 * group the master list's items.
		 * @param {Object} oGroup group whose text is to be displayed
		 * @public
		 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
		 */
		createGroupHeader: function(oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.text,
				upperCase: false
			});
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will navigate to the shell home
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},
		/**
		 * Private function for selected Item based on Position select
		 * @param {*} oEvent 
		 */
		_applyPositionSelect: function() {
			var oMasterModel = this.getModel("masterView"),
				bPositionSelected = oMasterModel.getProperty("/bPositionSelected");
			if (bPositionSelected) {
				this._selectMasterListItem();
				oMasterModel.setProperty("/bPositionSelected", false);
			}
		},
		/**
		 * Event Handler for numbers of records under each type of document status - Draft, In Process & Approved
		 * @param {Event}
		 */
		onDataReceived: function(oEvent) {
			if (this.onListLoaded) {
				this.onListLoaded();
			}

			var sStorePosition = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").PositionId;
			var sPosition = this.getModel("appView").getProperty("/position");
			var Udf1;
			if (sStorePosition === sPosition) {
				Udf1 = sPosition;
			} else {
				Udf1 = sStorePosition;
			}

			var oFilter1 = new Filter("udf1", FilterOperator.EQ, Udf1);
			this._applyPositionSelect();
			var oStatusControl = this.getView().byId("idStatusTab");
			var sSearchTerm = this._concatStarToSearchValue(this.byId(oEvent.getSource().getSmartFilter()).getBasicSearchControl().getValue());
			var aSmartFilter = [];
			if (this.byId(oEvent.getSource().getSmartFilter()).getFilters().length > 0) {
				$(this.byId(oEvent.getSource().getSmartFilter()).getFilters()[0].aFilters).each(function(index, value) {
					aSmartFilter.push(value);
				});
			}

			var oDraftCount = new Promise(function(resolve, reject) {
				var aStatusFilter = aSmartFilter.slice();
				aStatusFilter.push(new Filter("status", FilterOperator.EQ, "E0001"), oFilter1);
				this.getOwnerComponent().oDraft.getCount({
					path: "/ZWRK_C_ASHDR_DETAILS_C",
					urlParameters: {
						search: sSearchTerm
					},
					filters: aStatusFilter,
					busyControl: oStatusControl
				}, resolve, reject);
			}.bind(this));

			oDraftCount.then(function(oResult) {
				this.getModel("masterView").setProperty("/dCount", oResult.data);
			}.bind(this));

			var oInpCount = new Promise(function(resolve, reject) {
				var aStatusFilter = aSmartFilter.slice();
				aStatusFilter.push(new Filter("status", FilterOperator.EQ, "E0003"), oFilter1);
				this.getOwnerComponent().oDraft.getCount({
					path: "/ZWRK_C_ASHDR_DETAILS_C",
					urlParameters: {
						search: sSearchTerm
					},
					filters: aStatusFilter,
					busyControl: oStatusControl
				}, resolve, reject);
			}.bind(this));

			oInpCount.then(function(oResult) {
				this.getModel("masterView").setProperty("/inPCount", oResult.data);
			}.bind(this));

			var oApprCount = new Promise(function(resolve, reject) {
				var aStatusFilter = aSmartFilter.slice();
				aStatusFilter.push(new Filter("status", FilterOperator.EQ, "E0006"), oFilter1);
				this.getOwnerComponent().oDraft.getCount({
					path: "/ZWRK_C_ASHDR_DETAILS_C",
					urlParameters: {
						search: sSearchTerm
					},
					filters: aStatusFilter,
					busyControl: oStatusControl
				}, resolve, reject);
			}.bind(this));

			oApprCount.then(function(oResult) {
				this.getModel("masterView").setProperty("/apprCount", oResult.data);
			}.bind(this));

			var oHoldCount = new Promise(function(resolve, reject) {
				var aStatusFilter = aSmartFilter.slice();
				aStatusFilter.push(new Filter("status", FilterOperator.EQ, "E0005"), oFilter1);
				this.getOwnerComponent().oDraft.getCount({
					path: "/ZWRK_C_ASHDR_DETAILS_C",
					urlParameters: {
						search: sSearchTerm
					},
					filters: aStatusFilter,
					busyControl: oStatusControl
				}, resolve, reject);
			}.bind(this));

			oHoldCount.then(function(oResult) {
				this.getModel("masterView").setProperty("/holdCount", oResult.data);
			}.bind(this));

			var oReturnCount = new Promise(function(resolve, reject) {
				var aStatusFilter = aSmartFilter.slice();
				aStatusFilter.push(new Filter("status", FilterOperator.EQ, "E0004"), oFilter1);
				this.getOwnerComponent().oDraft.getCount({
					path: "/ZWRK_C_ASHDR_DETAILS_C",
					urlParameters: {
						search: sSearchTerm
					},
					filters: aStatusFilter,
					busyControl: oStatusControl
				}, resolve, reject);
			}.bind(this));

			oReturnCount.then(function(oResult) {
				this.getModel("masterView").setProperty("/returnCount", oResult.data);
			}.bind(this));

			var oAllCount = new Promise(function(resolve, reject) {
				var aStatusFilter = aSmartFilter.slice();
				aStatusFilter.push(oFilter1);
				this.getOwnerComponent().oDraft.getCount({
					path: "/ZWRK_C_ASHDR_DETAILS_C",
					urlParameters: {
						search: sSearchTerm
					},
					filters: aStatusFilter,
					busyControl: oStatusControl
				}, resolve, reject);
			}.bind(this));

			oAllCount.then(function(oResult) {
				this.getModel("masterView").setProperty("/aCount", oResult.data);
			}.bind(this));
		},
		/**
		 * Event Handler for clicking on Sort in the Master List
		 * @param {sap.ui.base.Event} oEvent Event for Pressing Sort on the master list
		 */
		onSortPress: function(oEvent) {
			this._getSortDialog().open();
		},
		/**
		 * Function to refresh Master List Model
		 * @private
		 */
		onMasterListRefresh: function() {
			this.getModel().refresh();
		},

		_onDetailRouteMatch: function() {
			//		this.getView().byId("ItemsST").rebindList();	
		},

		/**
		 * Event Handler for clicking the confirm button on the Sort Dialog
		 * @param {Event} oEvent Event for confirming sort parameters
		 */
		handleConfirm: function(oEvent) {
			var oBinding = this.byId("ItemsST").getList().getBinding("items"),
				SORTKEY = oEvent.getParameter("sortItem").getProperty("key"),
				aSorter = [];
			aSorter.push(new sap.ui.model.Sorter(SORTKEY, oEvent.getParameter("sortDescending")));
			oBinding.sort(aSorter);
		},
		/**
		 * Lifecycle method for setting filters everytime the list is rebound
		 * @param {Event} oEvent Event for list binding redone
		 */
		beforeRebindList: function(oEvent) {
			var mBindingParams = oEvent.getParameter("bindingParams");
			if (mBindingParams.parameters.custom && mBindingParams.parameters.custom.search) {
				mBindingParams.parameters.custom.search = this._concatStarToSearchValue(mBindingParams.parameters.custom.search);
			}
			var sStorePosition = jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").PositionId;
			var sPosition = this.getModel("appView").getProperty("/position");
			var Udf1;
			if (sStorePosition === sPosition) {
				Udf1 = sPosition;
			} else {
				Udf1 = sStorePosition;
			}

			var oFilter1 = new Filter("udf1", FilterOperator.EQ, Udf1),
				oFilter2 = new Filter("status", FilterOperator.EQ, this.getModel("masterView").getProperty("/listStatusCode")),
				aFilters = new Filter([oFilter1, oFilter2], true),
				oDefSorter = new sap.ui.model.Sorter("changetat", true);
			if (this.getModel("masterView").getProperty("/highStatus") !== "X") {
				oEvent.getParameter("bindingParams").filters.push(oFilter2);
			}
			if (!sPosition) {
				sPosition = "00000000";
			}
			if (sPosition) {
				oEvent.getParameter("bindingParams").filters.push(oFilter1);
			}
			if (this.byId("ItemsST").getList().getBinding("items") && this.byId("ItemsST").getList().getBinding("items").aSorters.length > 0) {
				oEvent.getParameter("bindingParams").sorter = this.byId("ItemsST").getList().getBinding("items").aSorters;
			} else {
				oEvent.getParameter("bindingParams").sorter.push(oDefSorter);
			}
			this._setMultiPosition("sap-icon://sys-cancel");
		},
		/**
		 * Event Handler for clicking on the Draft filter on the Master List
		 * @param {sap.ui.base.Event} oEvent Event for pressing on "ALL" filter
		 */
		onAllPress: function(oEvent) {
			var oMasterViewModel = this.getModel("masterView");
			oMasterViewModel.setProperty("/listFilter", "");
			oMasterViewModel.setProperty("/listStatusCode", "");
			oMasterViewModel.setProperty("/highStatus", "X");
			oMasterViewModel.setProperty("/bMultiSelectEnabled", false);
			this.getView().byId("ItemsST").rebindList();
		},

		/**
		 * Event Handler for clicking on the Draft filter on the Master List
		 * @param {Event}  oEvent Event for pressing on "DRAFT" filter
		 */
		onDraftPress: function(oEvent) {
			var oMasterViewModel = this.getModel("masterView");
			oMasterViewModel.setProperty("/listFilter", "Draft");
			oMasterViewModel.setProperty("/listStatusCode", "E0001");
			oMasterViewModel.setProperty("/highStatus", "D");
			oMasterViewModel.setProperty("/bMultiSelectEnabled", false);
			this.getView().byId("ItemsST").rebindList();
		},

		/**
		 * Event Handler for clicking on the In Process filter on the Master List
		 * @param {Event}  oEvent Event for pressing on "IN PROCESS" filter
		 */
		onInprocessPress: function(oEvent) {
			var oMasterViewModel = this.getModel("masterView");
			oMasterViewModel.setProperty("/listFilter", "");
			//Code for In-Process
			oMasterViewModel.setProperty("/listStatusCode", "E0003");
			oMasterViewModel.setProperty("/highStatus", "I");
			if (this.getView().getModel("appView").getProperty("/role") === "C") {
				oMasterViewModel.setProperty("/bMultiSelectEnabled", true);
			}
			this.getView().byId("ItemsST").rebindList();
		},

		/**
		 * Event Handler for clicking on the Return filter on the Master List
		 * @param {Event}  oEvent Event for pressing on "RETURN" filter
		 */
		onReturnPress: function(oEvent) {
			var oMasterViewModel = this.getModel("masterView");
			oMasterViewModel.setProperty("/listFilter", "");
			oMasterViewModel.setProperty("/listStatusCode", "E0004");
			oMasterViewModel.setProperty("/highStatus", "R");
			oMasterViewModel.setProperty("/bMultiSelectEnabled", false);
			this.getView().byId("ItemsST").rebindList();
		},

		/**
		 * Event Handler for clicking on the Approved filter on the Master List
		 * @param {Event}  oEvent Event for pressing on "APPROVED" filter
		 */
		onApprovedPress: function(oEvent) {
			var oMasterViewModel = this.getModel("masterView");
			oMasterViewModel.setProperty("/listFilter", "Approved");
			//Code for Approve
			oMasterViewModel.setProperty("/listStatusCode", "E0006");
			oMasterViewModel.setProperty("/highStatus", "A");
			oMasterViewModel.setProperty("/bMultiSelectEnabled", false);
			this.getView().byId("ItemsST").rebindList();
		},
		/**
		 * Event Handler for clicking on the Approved filter on the Master List
		 * @param {Event}  oEvent Event for pressing on "ON HOLD" filter
		 */
		onHoldPress: function(oEvent) {
			var oMasterViewModel = this.getModel("masterView");
			oMasterViewModel.setProperty("/listFilter", "Hold");
			//Code for Approve
			oMasterViewModel.setProperty("/listStatusCode", "E0005");
			oMasterViewModel.setProperty("/highStatus", "H");
			oMasterViewModel.setProperty("/bMultiSelectEnabled", false);
			this.getView().byId("ItemsST").rebindList();
		},
		/**
		 * Event handler for Radio button selection
		 * @param {sap.ui.base.Event} oEvent Event for selecting radio button on Create Fragment
		 */
		onSelectRadioAS: function(oEvent) {
			var sControlId = oEvent.getSource().getId(),
				oCreateNewASModel = this.getModel("createNewASModel");
			oCreateNewASModel.setProperty("/amendEditable", false);
			oCreateNewASModel.setProperty("/copyEditable", false);
			//Controlling the Visibility of Bundle Table
			if (sControlId === this._getCreateFragControlById("idBundleRadioBtn").getId()) {
				if (!this.getModel("oBundleCodeModel")) {
					var oBundleCodeModelData = [{
						code: "",
						description: "",
						amount: ""
					}];
					this.setModel(new JSONModel(oBundleCodeModelData), "oBundleCodeModel");
				}
				this._getCreateFragControlById("idMasterBundleCodeTable").setVisible(true);
			} else {
				this._getCreateFragControlById("idMasterBundleCodeTable").setVisible(false);
			}
			//Migrated Code Starts
			if (sControlId === this._getCreateFragControlById("idAmendRadioBtn").getId()) {
				oCreateNewASModel.setProperty("/amendEditable", true);
				this._getCreateFragControlById("idCopyFromASCode").setValue("");
				this._getCreateFragControlById("idCopyFromASCode").resetProperty("valueState");
				oCreateNewASModel.setProperty("/migratedASRadioButtons", false);
			} else if (sControlId === this._getCreateFragControlById("idCopyFromRadioBtn").getId()) {
				oCreateNewASModel.setProperty("/copyEditable", true);
				this._getCreateFragControlById("idAmendASCode").setValue("");
				this._getCreateFragControlById("idAmendASCode").resetProperty("valueState");
				oCreateNewASModel.setProperty("/migratedASRadioButtons", false);
				this.oSelectedObject = null;
			} else if (sControlId === this._getCreateFragControlById("idMigratedRadioBtn").getId()) {
				this._getCreateFragControlById("idCopyFromASCode").setValue("");
				this._getCreateFragControlById("idCopyFromASCode").resetProperty("valueState");
				this._getCreateFragControlById("idAmendASCode").setValue("");
				this._getCreateFragControlById("idAmendASCode").resetProperty("valueState");
				oCreateNewASModel.setProperty("/migratedASRadioButtons", true);
				oCreateNewASModel.setProperty("/migratedPhaseOneEditable", true);
				oCreateNewASModel.setProperty("/migratedNonCfmsEditable", false);
				oCreateNewASModel.setProperty("/migratedRadioBtnPhaseOneSelected", true);
				oCreateNewASModel.setProperty("/migratedRadioBtnNonCfmsSelected", false);
				this.oSelectedObject = null;
			} else {
				this._getCreateFragControlById("idCopyFromASCode").resetProperty("value");
				this._getCreateFragControlById("idAmendASCode").resetProperty("value");
				this._getCreateFragControlById("idCopyFromASCode").resetProperty("valueState");
				this._getCreateFragControlById("idAmendASCode").resetProperty("valueState");
				oCreateNewASModel.setProperty("/migratedASRadioButtons", false);
			}
			//Migrated Code Ends
		},
		/**
		 * Event handler for adding a new row to bundle table
		 * @param {sap.ui.base.Event} oEvent Event for pressing on new row addition
		 */
		onAddNewRow: function(oEvent) {
			var oNewRowData = {
					code: "",
					description: "",
					amount: ""
				},
				oBundleModel = this.getModel("oBundleCodeModel");
			var oModelData = oBundleModel.getProperty("/");
			oModelData.splice(0, 0, oNewRowData);
			oBundleModel.updateBindings();
		},
		/**
		 * Event handler funtion for Deleting the Row of Bundle table
		 * @param {sap.ui.base.Event} oEvent Event for removing row
		 */
		onDeleteRow: function(oEvent) {
			var oModel = this.getModel("oBundleCodeModel"),
				oModelData = oModel.getProperty("/"),
				sDltItemIndex = this._getCreateFragControlById("idMasterBundleCodeTable").getSelectedItem().getBindingContext("oBundleCodeModel")
				.getPath().split("/")[1];
			oModelData.splice(sDltItemIndex, 1);
			oModel.updateBindings();
		},
		/**
		 * Event handler for code value help
		 * @param {sap.ui.base.Event} oEvent Event for pressing on value help dialog button
		 */
		handleCodeValueHelp: function(oEvent) {
			this.ASCode = oEvent.getSource();
			this.getASCodeVH().open({
				filters: [new Filter([new Filter("status", FilterOperator.NE, "E0001"), new Filter("status", FilterOperator.NE, "Draft")],
					true)],
				//for single select pass this method
				select: function(oSelectedObject) {
					this.ASCode.setValue(oSelectedObject.code);
					this.getModel("masterView").setProperty("/copyObject", oSelectedObject);
				}.bind(this)
			});
		},
		/**
		 * Event handler when suggestion item is selected
		 * @param {sap.ui.base.Event} oEvent  Event for selecting an item out of suggestions
		 */
		handleSuggestionItemSelected: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				this.oSelectedObject = oSelectedItem.getBindingContext().getObject();
				oEvent.getSource().setValueState();
			}
		},
		/**
		 * Event handler for live change on Input fields
		 * @param {sap.ui.base.Event} oEvent Event for live change
		 */
		handleLiveChange: function(oEvent) {
			if (this.oSelectedObject) {
				this.oSelectedObject = null;
			}
		},
		/**
		 * Internal function for Value help dialog
		 * @private
		 * @returns {Object} Value help dialog control
		 */
		getASCodeVH: function() {
			if (!this.oASCodeVH) {
				this.oASCodeVH = new VHDialog({
					component: this.getOwnerComponent(),
					id: "vhCodeAS",
					titleKey: "detail.ops.panel.content.table.column.vh.title.code",
					entitySet: "/ZWRK_C_CODE",
					sorter: new Sorter("code", false),
					bMultiSelect: false,
					key: "code",
					descriptionKey: "guid",
					fields: [{
						key: "code",
						label: "{i18n>master.fragment.table.code}",
						value: "{code}"
					}, {
						key: "short_desc",
						label: "{i18n>master.fragment.table.shortdesc}",
						value: "{short_desc}"
					}, {
						key: "stext",
						label: "{i18n>master.fragment.table.status}",
						value: "{stext}"
					}]
				});
			}
			return this.oASCodeVH;
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/*
		 * Function to create a Model for the Master View
		 */
		_createViewModel: function() {
			var iCount = 0;
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: this.getResourceBundle().getText("master.count.title", [0]),
				noDataText: this.getResourceBundle().getText("master.nodatatext"),
				sortBy: "ShortDesc",
				groupBy: "None",
				dCount: iCount,
				inPCount: 0,
				apprCount: 0,
				highStatus: "D",
				listFilter: "Draft",
				listStatusCode: "E0001",
				bPositionSelected: false,
				bMultiSelectVisible: false,
				bMultiSelectEnabled: false,
				Notingstring: "",
				bCreateBtnEnable: true

			});
		},

		/*
		 * Event handler When the Master List is received
		 */
		_onMasterMatched: function() {
			//Set the layout property of the FCL control to 'OneColumn'
			this.getModel("appView").setProperty("/layout", sap.f.LayoutType.TwoColumnsMidExpanded);
			//Enabling/desabling the view ctrs based on Detail view visibility mode
			var oAppViewModel = this.getModel("appView");
			if (!oAppViewModel.getProperty("/bEnabledMasterViewCtr")) {
				oAppViewModel.setProperty("/bEnabledMasterViewCtr", true);
				oAppViewModel.setProperty("/sMasterListMode", "SingleSelectMaster");
			} else {
				oAppViewModel.setProperty("/bEnabledMasterViewCtr", false);
				oAppViewModel.setProperty("/sMasterListMode", "None");
			}
			oAppViewModel.updateBindings();
		},

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail: function(oItem) {
			var bReplace = !Device.system.phone;
			// set the layout property of FCL control to show two columns
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			sap.ui.getCore().getModel("ZWRKGlobalModel").setProperty("/AS/bUserCreateAS", false);
			this.getRouter().navTo("Detail", {
				objectId: oItem.getBindingContext().getProperty("guid"),
				stateId: "D" + ":" + oItem.getBindingContext().getProperty("IsActive")
			}, bReplace);
		},
		/**
		 * 
		 * @param {*} sGuid is the document Guid to navigate
		 */
		_showDetailWithCrossApp: function(sGuid) {
			var bReplace = !Device.system.phone;
			this.getRouter().navTo("Detail", {
				objectId: sGuid,
				stateId: "D" + ":"
			}, bReplace);
		},
		/**
		 * Apply the chosen sorter and grouper to the master list
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @private
		 */
		_applySortGroup: function(oEvent) {
			var mParams = oEvent.getParameters(),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			this._oList.getBinding("items").sort(aSorters);
		},

		/**
		 * Internal function to return the payload for create
		 * @returns{oPayload} payload for create AS
		 */
		_createPayload: function() {
			var sPosition = this.getModel("appView").getProperty("/position"),
				oPayload = {
					Action: "",
					Guid: "00000000-0000-0000-0000-000000000000",
					LockTimestamp: "\/Date(" + (new Date()).getTime() + ")\/",
					Fnam: "",
					Fval: "",
					Code: "",
					Position: sPosition,
					InitiatinDept: "",
					DepartDesc: "",
					SessionGuid: jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").SessionGuid
				};

			//Migrated Code Starts
			if (this._getCreateFragControlById("idNewRadioBtn").getSelected()) {
				oPayload.Action = "NEW";
			} else if (this._getCreateFragControlById("idAmendRadioBtn").getSelected()) {
				oPayload.Action = "AMEND";
				oPayload.Guid = this.oSelectedObject.guid;
				oPayload.Code = this._getCreateFragControlById("idAmendASCode").getValue();
			} else if (this._getCreateFragControlById("idCopyFromRadioBtn").getSelected()) {
				oPayload.Action = "COPY";
				oPayload.Guid = this.oSelectedObject.guid;
				oPayload.Code = this._getCreateFragControlById("idCopyFromASCode").getValue();
			} else if (this._getCreateFragControlById("idMigratedRadioBtnPhaseOne").getSelected()) {
				oPayload.Action = "MIGRATED";
				oPayload.Code = this._getCreateFragControlById("idMigratedASCode").getValue();
			} else if (this._getCreateFragControlById("idMigratedRadioBtnNonCfms").getSelected()) {
				oPayload.Action = "MIGRATED";
				// oPayload.Code = this._getCreateFragControlById("idMigratedNonCfms").getValue();
			} else {
				oPayload.Action = "BUNDLE";
				var sASCode = "",
					aBundleModelData = this.getModel("oBundleCodeModel").getProperty("/");
				for (var i = 0; i < aBundleModelData.length; i++) {
					if (sASCode) {
						sASCode = "," + aBundleModelData[i];
					} else {
						sASCode = aBundleModelData[i];
					}
				}
				oPayload.Code = sASCode;
			}
			return oPayload;
			//Migrated Code Ends
		},

		/**
		 * function to handle radio buttons
		 * @public
		 */

		//Migrated Code Starts
		onRadioButtonSelect: function(oEvent) {
			var oCreateNewASModel = this.getModel("createNewASModel");
			if (oEvent.getSource().getId().indexOf("goCategory") >= 0) {
				oCreateNewASModel.setProperty("/refVisible", false);
				oCreateNewASModel.setProperty("/typeVisible", true);
				oCreateNewASModel.setProperty("/sancno1", true);
				oCreateNewASModel.setProperty("/sancno2", false);
				this._setInputFieldsNumberOnly(this._getMigratedCreateFragControlById("sancNo"));
			} else if (oEvent.getSource().getId().indexOf("deptCategory") >= 0) {
				oCreateNewASModel.setProperty("/refVisible", true);
				oCreateNewASModel.setProperty("/typeVisible", false);
				oCreateNewASModel.setProperty("/sancno2", true);
				oCreateNewASModel.setProperty("/sancno1", false);
			}
			oCreateNewASModel.updateBindings();
		},
		//Migrated Code Ends

		/**
		 * Sets the item count on the master list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount: function(iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oList.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("master.count.title", [iTotalItems]);
				this.getModel("masterView").setProperty("/title", sTitle);
			}
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		_applyFilterSearch: function() {
			var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
				oViewModel = this.getModel("masterView");
			this._oList.getBinding("items").filter(aFilters, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aFilters.length !== 0) {
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
			} else if (this._oListFilterState.aSearch.length > 0) {
				// only reset the no data text to default when no new search was triggered
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
			}
		},

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param {string} sFilterBarText the selected filter value
		 * @private
		 */
		_updateFilterBar: function(sFilterBarText) {
			var oViewModel = this.getModel("masterView");
			oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
			oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
		},
		/**
		 * Selects first item of the list
		 * @param {object} sGuid Header guid of the record 
		 */
		_selectMasterListItem: function(sGuid) {
			// if(this._oList.getList().getItems().length && sGuid){
			// 	if(!this._oList.getList().getSelectedItem()) {
			// 		this._oList.getList().setSelectedItem(oItem);
			// 	}
			// } else 
			var startupParams = this.getOwnerComponent().getComponentData().startupParameters;
			if (this._oList.getList().getItems().length || startupParams.Mode) {
				//var startupParams = oStartupParameters; // get Startup params from Owner Component
				if (startupParams.GUID && startupParams.GUID[0]) {
					this._showDetailWithCrossApp(startupParams.GUID[0]);
				} else {
					var oFirstItem = this._oList.getList().getItems()[0];
					this._oList.getList().setSelectedItem(oFirstItem);
					this._showDetail(oFirstItem);
				}
			} else {
				var bReplace = !Device.system.phone;
				// set the layout property of FCL control to show two columns
				this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
				this.getRouter().navTo("notFound", bReplace);
			}
		},
		/**
		 * Internal Function for the Dialog Box of Sorting Parameters
		 * @private
		 * @returns {Object} Dialog box for sort
		 */
		_getSortDialog: function() {
			if (!this._oSortDialog) {
				var fragId = this.createId("fragSortDialog");
				this._oSortDialog = sap.ui.xmlfragment(fragId, "com.goap.cfms.works.as.fragment.sort", this);
				this.getView().addDependent(this._oSortDialog);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oSortDialog);
			}
			return this._oSortDialog;
		},
		/**
		 * Internal function to validate when Create button is pressed
		 * @private
		 * @returns {boolean} Check condition for create dialog close
		 */
		_validateCreate: function() {
			var bCopy = this._getCreateFragControlById("idCopyFromRadioBtn").getSelected(),
				sCopyCode = this._getCreateFragControlById("idCopyFromASCode").getValue(),
				bAmend = this._getCreateFragControlById("idAmendRadioBtn").getSelected(),
				sAmendCode = this._getCreateFragControlById("idAmendASCode").getValue(),
				bRetVal = true;

			this._getCreateFragControlById("idCopyFromASCode").setValueState(sap.ui.core.ValueState.None);
			if (bCopy && (!sCopyCode || !this.oSelectedObject)) {
				bRetVal = false;
				this._getCreateFragControlById("idCopyFromASCode").setValueState(sap.ui.core.ValueState.Error);
			} else if (bAmend && (!sAmendCode || !this.oSelectedObject)) {
				bRetVal = false;
				this._getCreateFragControlById("idAmendASCode").setValueState(sap.ui.core.ValueState.Error);
			}
			return bRetVal;
		},
		/**
		 * function to return the Control 
		 * @param {string} sControlId Identifier for the Control Structure of Create Fragment
		 * @returns {Object} Control inside the fragment
		 */
		_getCreateFragControlById: function(sControlId) {
			return sap.ui.core.Fragment.byId(this.createId("fragCreateFrag"), sControlId);
		},

		/**
		 * Private function to read Role
		 * @param{Object} oData
		 */
		_getUserRole: function(sPosition) {
			var Mode = this.getOwnerComponent().getComponentData().startupParameters.Mode;
			if (!Mode) {
				//var sUserId = "14482503";
				//sPosition = "30058277";
				var sUserId = sap.ushell.Container.getService("UserInfo").getId();
				var oRole = new Promise(function(resolve, reject) {
					this.getOwnerComponent().oDraft.getRole({
						fName: "/GetRole",
						ApplicationId: "AS",
						UserId: sUserId,
						PositionId: sPosition
					}, resolve, reject);
				}.bind(this));
				oRole.then(function(oResult) {
					var oViewAppModel = this.getOwnerComponent().getModel("appView");
					if (oResult.data.results.length > 0) {
						oViewAppModel.setProperty("/role", oResult.data.results[0].Role);
						oViewAppModel.setProperty("/position", oResult.data.results[0].PositionId);
						oViewAppModel.setProperty("/positionText", oResult.data.results[0].PositionText);

						var sCreatedBy = sap.ushell.Container.getService("UserInfo").getId();
						var oParamsBrowserStorage = {
							UserId: sCreatedBy,
							PositionId: oResult.data.results[0].PositionId,
							Role: oResult.data.results[0].Role,
							SessionGuid: jQuery.sap.storage(jQuery.sap.storage.Type.session).get("zworksBrowserStorage").SessionGuid
						};
						jQuery.sap.storage(jQuery.sap.storage.Type.session).put("zworksBrowserStorage", oParamsBrowserStorage);

						var role = oViewAppModel.getData().role;
						if (role === "A" || role === "C") {
							this.byId("idInProcess").firePress();
						} else {
							var oMasterViewModel = this.getModel("masterView");
							oMasterViewModel.setProperty("/listFilter", "Draft");
							oMasterViewModel.setProperty("/listStatusCode", "E0001");
							oMasterViewModel.setProperty("/highStatus", "D");
							oMasterViewModel.setProperty("/bMultiSelectEnabled", false);
							this.getView().byId("ItemsST").rebindList();
						}
					}

				}.bind(this));
				oRole.catch(function(oError) {
					this.getModel("appView").setProperty("/role", "");
				}.bind(this));
			}
		},
		/**
		 * Private function to create payload for MassPayload Note
		 */
		_getMassPayload: function() {
			var oMassPayload = {
					Fflag: "",
					Fposition: "",
					Fuserid: "",
					Aplication: "AS",
					Action: "D",
					Guid: "00000000-0000-0000-0000-000000000000",
					Notingid: "CREATE",
					Pagent: "INCFMS_CNS_",
					Textid: "0004",
					Notingstring: encodeURIComponent(this.getModel("masterView").getProperty("/Notingstring")),
					MassHeaderItems: []
				},
				aSelectedItems = this.byId("ItemsST").getList().getSelectedItems();
			if (aSelectedItems.length > 0) {
				for (var i = 0; i < aSelectedItems.length; i++) {
					var oBindingContext = aSelectedItems[i].getBindingContext(),
						oItems = {
							Aplication: "AS",
							Action: "D",
							Guid: this.getModel().getProperty("guid", oBindingContext)
						};
					oMassPayload.MassHeaderItems.push(oItems);
				}
			}
			return oMassPayload;
		}
	});
});