sap.ui.define([
    "com/goap/cfms/works/reuselib/formatter",
    "sap/ui/core/format/NumberFormat",
    "sap/m/Token"
], function (
    Formatter,
    NumberFormat,
    Token
) {
    "use strict";

    return  {
    	goAmountInput: function(value){
    		if (value == '0.000' || value == '0.00') {
    			return '';
    		} else {
    			return value;
    		}
    	},
    	goAmountInputEditable: function(value){
    		if (value == '0.000' || value == '0.00') {
    			return true;
    		} else {
    			return false;
    		}
    	},
    	sancNoInput  : function(value){
    		if (value == '0000') {
    			return '';
    		} else {
    			return value;
    		}
    	},
    	sancNoInputEditable: function(value){
    		
    	},
        formatAmount: function(amount){
            var oNumberFormatInstance = NumberFormat.getFloatInstance({
                minIntegerDigits: 1,
                maxIntegerDigits: 10,
                minFractionDigits: 2,
                maxFractionDigits: 2,
                decimals : 2,
                groupingEnabled: true,
                shortLimit: 3,
                style : "standard",
                pattern : "#,##,##,##,###.00"
            }, sap.ui.getCore().getConfiguration().getLocale());
            // if(amount/10000000 >= 1){ 
            //     return oNumberFormatInstance.format(amount/10000000) + " Cr";
            // } else 
            // if(amount/100000 >= 1) {
            //     return oNumberFormatInstance.format(amount/100000) + " Lakhs";
            // } else if(amount/1000 >= 1) {
            //     return oNumberFormatInstance.format(amount/1000) + " K";
            // } else {
            //     return oNumberFormatInstance.format(amount);
            // }
            return oNumberFormatInstance.format( amount / 100000 ) + " Lakhs";
        },
        getSerialNo: function(sCheckId){
            var serialNo;
            if (!serialNo) {
                serialNo = 0;
            } else {
                serialNo++;
            }
            return serialNo;
        },
        formatDistrict: function(sLocation, sValue){
           var aFirstIteration = [],
                aNewTokens = [],
                oControl = this.getView().byId("idSelectDistrict");
                if (sLocation && sValue === "D") {
                    aFirstIteration = sLocation.split("$");
                        for (var i = 0; i < aFirstIteration.length; i ++) {
                            var skey, aLocDesc = aFirstIteration[i].split("^");
                            if (aLocDesc[0].indexOf("#") !== -1) {
                                skey =  aLocDesc[0].split("#")[1];
                            } else {
                                skey = aLocDesc[0];
                            }
                            if (aLocDesc[1]) {
                                aNewTokens.push(new Token({text: aLocDesc[1], key: skey}));
                            }
                    }
                }
                oControl.setTokens(aNewTokens); 
            if (aNewTokens.length > 0) {
              //  this.getModel('location').setProperty("/bRDistrict", true);
                this.getModel("location").setProperty("/vDistrict", true);
            }
            return "";    
        },
        formatMandal: function(sLocation, sValue){
            var aFirstIteration = [],
            aNewTokens = [],
            oControl = this.getView().byId("idSelectMandal");
            if (sLocation && sValue === "M") {
                aFirstIteration = sLocation.split("$");
                for (var i = 0; i < aFirstIteration.length; i ++) {
                        var skey, aLocDesc = aFirstIteration[i].split("^");
                        if (aLocDesc[0].indexOf("#") !== -1) {
                            skey =  aLocDesc[0].split("#")[1];
                        } else {
                            skey = aLocDesc[0];
                        }
                        if (aLocDesc[1]) {
                            aNewTokens.push(new Token({text: aLocDesc[1], key: skey}));
                        }
                }
            }
            oControl.setTokens(aNewTokens); 
            if (aNewTokens.length > 0) {
                this.getModel("location").setProperty("/vMandal", true);
            }
            return ""; 
        },
        formatVillage: function(sLocation, sValue){
            var aFirstIteration = [],
            aNewTokens = [],
            oControl = this.getView().byId("idSelectVillage");
            if (sLocation && sValue === "V") {
                aFirstIteration = sLocation.split("$");
                    for (var i = 0; i < aFirstIteration.length; i ++) {
                        var skey, aLocDesc = aFirstIteration[i].split("^");
                            if (aLocDesc[0].indexOf("#") !== -1) {
                                skey =  aLocDesc[0].split("#")[1];
                            } else {
                                skey = aLocDesc[0];
                            }
                        if (aLocDesc[1]) {
                            aNewTokens.push(new Token({text: aLocDesc[1], key: skey}));
                        }    
                    }
            }
            oControl.setTokens(aNewTokens); 
            if (aNewTokens.length > 0) {
                this.getModel("location").setProperty("/vVillage", true);
            }
            return ""; 
        },
        formatLoksabha: function(sConstituency){
            var aFirstIteration = [],
            aNewTokens = [],
            oControl = this.getView().byId("idMultiInputLoksabha");
            if (sConstituency) {
                aFirstIteration = sConstituency.split("$");
                    for (var i = 0; i < aFirstIteration.length; i ++) {
                        var skey, aLocDesc = aFirstIteration[i].split("^");
                            if (aLocDesc[0].indexOf("#") !== -1) {
                                skey =  aLocDesc[0].split("#")[1];
                            } else {
                                skey = aLocDesc[0];
                            }
                            if (aLocDesc[1]) {
                                aNewTokens.push(new Token({text: aLocDesc[1], key: skey}));
                            }
                   }
            }
            oControl.setTokens(aNewTokens); 
            if (aNewTokens.length > 0) {
                this.getModel("location").setProperty("/vLoksabha", true);
            }
            return "";  
        },
        formatAssembly: function(sConstituency){
            var aFirstIteration = [],
            aNewTokens = [],
            oControl = this.getView().byId("idMultiInputAssembly");
            if (sConstituency) {
                aFirstIteration = sConstituency.split("$");
                
                    for (var i = 0; i < aFirstIteration.length; i ++) {
                        var skey, aLocDesc = aFirstIteration[i].split("^");
                        if (aLocDesc[0].indexOf("#") !== -1) {
                            skey =  aLocDesc[0].split("#")[1];
                        } else {
                            skey = aLocDesc[0];
                        }
                        if (aLocDesc[1]) {
                            aNewTokens.push(new Token({text: aLocDesc[1], key: skey}));
                        }

                    }
            }
            oControl.setTokens(aNewTokens); 
            if (aNewTokens.length > 0) {
                this.getModel("location").setProperty("/vAssembly", true);
            }
            return ""; 
        },
        _getSaveVisibility: function(sDraftState, sViewState, sRole){
            var bSaveVisible = false;
                if (sDraftState !== "X" && sViewState !== "D" && sRole === "M") {
                    bSaveVisible = true;
                }
            return bSaveVisible;
        },
        _getSubmitVisibility: function(sDraftState, sViewState, sSubmitBtnVisibility){
            var bSaveVisible = false;
            if (sDraftState === "X" && sViewState !== "D" && sSubmitBtnVisibility === "X") {
                bSaveVisible = true;
            }
            return bSaveVisible;
        },
        _getNextLevelVisibility: function(sViewState, sRole) {
            var bSaveVisible = false;
            if (sViewState === "E" && (sRole === "C" || sRole === "QC")) {
                bSaveVisible = true;
            }
            return bSaveVisible;
        },
        _getApproverVisibility: function(sViewState, sRole) {
            var bSaveVisible = false;
            if (sViewState === "E" && sRole === "A") {
                bSaveVisible = true;
            }
            return bSaveVisible;
        },
        _getReturnVisibility: function(sViewState, sRole) {
            var bSaveVisible = false;
            if (sViewState === "E" && (sRole === "A" || sRole === "C" || sRole === "QC")) {
                bSaveVisible = true;
            }
            return bSaveVisible;
        },
        _getCancelVisibility: function(sViewState, sRole) {
            var bSaveVisible = false;
            if (sViewState !== "D" && sRole === "M") {
                bSaveVisible = true;
            }
            return bSaveVisible;
        },

        _statusformat: function(sStatus){
            var sHtmlText = "";
                if (sStatus === "Draft") {
                    sHtmlText = "<p style=\"color:orange;font-size:22px;margin-top: 4px;\">" + sStatus + "</p>";
                } else if ( sStatus === "In Process") {
                    sHtmlText = "<p style=\"color:orange;font-size:22px;margin-top: 4px;\">" + sStatus + "</p>";
                } else if (sStatus === "Returned") {
                    sHtmlText = "<p style=\"color:red;font-size:22px;margin-top: 4px;\">" + sStatus + "</p>";
                } else if (sStatus === "Approved") {
                    sHtmlText = "<p style=\"color:green;font-size:22px;margin-top: 4px;\">" + sStatus + "</p>";
                } else {
                    sHtmlText = "<p style=\"font-size:22px;margin-top: 4px;\">" + sStatus + "</p>";
                }
            return sHtmlText;
        },

        _roleIconformat: function(sRole){
            var sIconName;
            if (sRole === "M") {
                sIconName = "sap-icon://write-new";
            } else if (sRole === "C") {
                sIconName = "sap-icon://detail-view";
            } else if (sRole === "A") {
                sIconName = "sap-icon://approvals";
            }
            return sIconName;
        },

        _laneStateFormat: function(sStatus){
            var sState = [{
				"state": "",
				"value": 100
            }];
            
            if (sStatus === "COMPLETED") {
                sState[0].state = "Positive";
            } else if (sStatus === "READY") {
                sState[0].state = "Critical";
            } else {
                sState[0].state = "Neutral";
            }
            return sState;
        },
        
        getEstimationLink: function(sEstGuid){
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			// var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
			// 	target:{
			// 		semanticObject: "ZWorks",
			// 		action: "estimation"
			// 	}
            // })) || "";
            var sLink = oCrossAppNavigator.hrefForExternal({
            //    target : { shellHash : "ZWorks-estimation&/Detail/" + sEstGuid + "/" +sRefGuid + "/D/ZDE/xapp" }
            target : { shellHash : "ZWorks-estimation&/Detail/" + sEstGuid + "/D/ZDE/xapp" }
              });
			//var sLink = oCrossAppNavigator.hrefForAppSpecificHash("Detail/" + sEstId + "/D/ZDE");
            return sLink;
        },

        _removeZeroes: function(sValue){
            var sRetVal;
            if (sValue) {
                sRetVal = sValue.replace(/^0+/, "");
            }
            return sRetVal;
        },
        _addVersion: function(sVersion){
            if (sVersion) {
                var sVersionText = this.getModel("i18n").getResourceBundle().getText("master.list.item.version");
                return sVersionText + ": " + sVersion;
            } else {
                return "";
            }
        },
        getProcessIndState: function(state){
            var sState = "";
            if (state <= 50) {
                sState = "Success";
            } else if (state > 50 && state <= 75) {
                sState = "Warning";
            } else {
                sState = "Error";
            }
            return sState;
        },
        getPercentage: function(percentage){
            return parseFloat(percentage);
        },
        digitialFilePath : function(v) {
            var path = "";
            if (v){
            	path = jQuery.sap.getModulePath("com.goap.cfms.works.as", "/Image/info.png");
            } else {
            	 path = jQuery.sap.getModulePath("com.goap.cfms.works.as", "/Image/check.png");
            }
        return path;
     }
        /**
         * Formatter function to make the URL for External navigation
         */
        // _setURLForNav: function(semObj, sAction, sGuid){
        //     var sUrl = "#" + semObj + "-" + sAction;
        //     return sUrl;
        // }
    };
});