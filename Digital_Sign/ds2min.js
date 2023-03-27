// Added silent_mode param to SignPDFInMemory API
// Also added signature_format to SignPDFData and SignPDFInMemory JSON communication. SignPDFData, API was not changed but SignPDFInMemory API was changed
// Requires at least 4.7.4.8 version of the client
var _elk_DSObjCount = 0;
var _elk_desksignObj = new _elk_DS();
var _elk_new_proto = true;
var _elk_err_try = false;
var _elk_send_queue = []; // Array of string buffers to send. Send from index 0 to last index
var _elk_lastmsg = "";

// Call following line from outside (perhaps in user's page)
// window.addEventListener("load", function(){_elk_desksignObj._elk_initialize(mycallback);}, false);

// _elk_DS Object constructor
function _elk_DS() {
	if (_elk_DSObjCount > 0) {
		alert("Cannot create object of type _elk_DS more than once")
		return;
	}
	_elk_DSObjCount++;

	this.bActiveX = false; // It indicates if we are using ActiveX plugin (if Websockets fails and we are IE/FF)
	this.activeXObj = null;

	/* elock protocol */
	this._elk_socket = null;
	this._elk_connectionOpen = false;
	this._elk_userCallback;

	this._elk_setCallback = function(callback) {
		if (typeof this._elk_socket == "undefined" || this._elk_socket == null)
			return;
		try {
			this._elk_socket.onmessage = function got_packet(msg) {
				var respObj = JSON.parse(msg.data);
				window.a.mycallback(respObj.resp, respObj.status, respObj.params);
			};

		} catch (exception) {
			alert('Error:' + exception);
		}
	}

	/* This function opens the connection to the E-Lock App */
	this._elk_open = function() {
		var sock_url;
		if (typeof this._elk_socket == "undefined" || this._elk_socket == null) {
			try {
				var protoString;
				if (_elk_new_proto)
					protoString = "E-Lock-protocol2";
				else
					protoString = "E-Lock-protocol";

				/*
				 * We open the websocket encrypted if this page came on an
				 * https:// url itself, otherwise unencrypted
				 */
				if (document.URL.substring(0, 5) == "https")
					sock_url = "wss://127.0.0.1:7681/xxx";
				else
					sock_url = "wss://127.0.0.1:7681/xxx";
				if (typeof MozWebSocket != "undefined") {
					//alert("MozWebSocket");
					this._elk_socket = new MozWebSocket(sock_url, protoString);
				} else {
					this._elk_socket = new WebSocket(sock_url, protoString);
				}
				this._elk_socket.onopen = _elk_onopenfn;
				this._elk_socket.onclose = _elk_onclosefn;
				this._elk_socket.onerror = _elk_onerrorfn;
			} catch (exception) {
				_elk_enablePage();
				//alert('Warning: ' + exception);
				this._elk_socket = null;
				_elk_switchToActiveX();
			}
			if (typeof this._elk_socket != "undefined" && this._elk_socket != null && this._elk_socket.readyState == 1) {
				_elk_enablePage();
				this._elk_connectionOpen = true;
			} else
				this._elk_connectionOpen = false;
		}
	}

	/* This function closes the connection to the E-Lock app */
	this._elk_close = function() {
		if (typeof this._elk_socket != "undefined" && this._elk_socket != null)
			this._elk_socket.close();
		this._elk_socket = null;
		this._elk_connectionOpen = false;
	}

	/* This function starts the E-Lock App. Calling it again if the App is already started has no effect */
	this._elk_start_app = function() {
		window.location = "elk://";
	}

	/* This function sends a request to the E-Lock App to terminate itself. Ideally this function should be called when the browser window is about to close */
	this._elk_end_app = function() {
		try {
			if (typeof this._elk_socket != "undefined" && this._elk_socket != null) {
				this._elk_buffered_send('{ "msg":"shutdown", "ver":0 }');
				this._elk_close();
			}
		} catch (exception) {}
	}

	// Call this function either explicitly before anything else or call it on onload
	this._elk_initialize = function(callback, a) {
		window.a = a;
		_elk_detectBrowser();
		_elk_createDiv();
		_elk_disablePage();
		this._elk_userCallback = callback;
		//this._elk_start_app();
		_elk_desksignObj._elk_open();
		_elk_desksignObj._elk_setCallback(_elk_desksignObj._elk_userCallback);
	}

	// Call this function either explicitly before anything else or call it on exit
	this._elk_uninitialize = function() {
		this._elk_end_app();
	}

	this._elk_check_connection = function() {
		if (typeof this._elk_socket == "undefined" || this._elk_socket == null || !this._elk_connectionOpen) {
			if (typeof this._elk_socket != "undefined" && this._elk_socket != null) {
				if (this._elk_socket.readyState == 1) {
					_elk_enablePage();
					this._elk_connectionOpen = true;
					return true;
				}
			}

			/* NO POINT IN TRYING TO OPEN NOW, AS WE WONT GET ENOUGH TIME TO GET THE CONNECTION OPENED FOR SENDING MESSAGES
			// try opening
			this._elk_open();
			this._elk_setCallback(this._elk_userCallback);
			*/
			if (typeof this._elk_socket == "undefined" || this._elk_socket == null || !this._elk_connectionOpen) {
				alert("Could not connect to E-Lock SignApp.\n\n" + _elk_lastmsg);
				return false;
			}
		}
		return true;
	}

	/* This function sends a request to E-Lock App. */
	this._elk_send_request = function(req) {
		if (!this._elk_check_connection()) return;
		// Hack for Chrome and Firefox as they have problem sending packets larger than 1k
		// Split the request into about < 1k length packets. The string version (8 decimal digit) of length of the entire request precedes the first packet
		try {
			if (_elk_new_proto) {
				var len = req.length;
				var MAX_PACKETLEN = 1000; // Less than 1K
				var start_pos = 0;

				req = _elk_round8(len) + req; // prepend 8 digit length
				len += 8;

				while (len > 0) {
					if (len > MAX_PACKETLEN) {
						this._elk_buffered_send(req.substr(start_pos, MAX_PACKETLEN));
						start_pos += MAX_PACKETLEN;
						len -= MAX_PACKETLEN;
					} else {
						this._elk_buffered_send(req.substr(start_pos));
						break; // this was the last of the packet
					}
				}
			} else
				this._elk_buffered_send(req);
		} catch (exception) {
			alert("Exception: " + exception);
		}
	}

	this._elk_buffered_send = function(req) {
		if (_elk_send_queue.length == 0 && this._elk_socket.bufferedAmount == 0) {
			// Queue is empty and buffer is clear. So actually send it
			this._elk_socket.send(req);
		} else {
			_elk_send_queue.push(req); // Add it to the end of the queue
			if (_elk_send_queue.length == 1) {
				_elk_disablePage();
				window.setTimeout(_elk_timerCallback, 5); // Start timer for 50ms only if this is the first element in the queue. Otherwise timer is already running
			}
		}
	}

	// This is a one-shot 50ms timer for sending queued request out on the socket
	function _elk_timerCallback() {
		while ((_elk_send_queue.length > 0) && (_elk_desksignObj._elk_socket.bufferedAmount == 0)) {
			// We have something to send and the buffer is clear. So send it
			var req = _elk_send_queue[0];
			_elk_send_queue.shift();
			_elk_desksignObj._elk_socket.send(req);
		}

		if (_elk_send_queue.length > 0 && _elk_desksignObj._elk_socket.bufferedAmount > 0) {
			// We have something more to send and buffer is not clear yet, so restart the timer
			window.setTimeout(_elk_timerCallback, 5);
		} else
			_elk_enablePage();
	}

	this._elk_activeX_returnResult = function(apiName, sig) {
		var params = {};
		if (!this.bActiveX)
			return;
		var res;
		if (apiName != "SignFile" && apiName != "SignPDFInMemory")
			res = this.activeXObj.GetOperationStatusString();
		else
			res = apiName + " functionality is not supported in this mode of signing";
		if (typeof sig != "undefined" && sig != null && sig != "") {
			if (apiName == "GetSubjectDN" || apiName == "GetIssuerDN")
				params.dn = sig;
			else if (apiName == "SignDataDetached" || apiName == "SignDataInMemoryEx" || apiName == "SignEncodedDataInBatch")
				params.sig = sig;
		}
		this._elk_userCallback(apiName, res, params);
	}

	this.SetTSParameters = function(server_host_name, server_port, server_url, ts_before, policy_id) {
		if (this.bActiveX) {
			this.activeXObj.SetTSParameters(server_host_name, server_port, server_url, ts_before, policy_id);
			this._elk_activeX_returnResult("SetTSParameters", "");
		} else {
			var jsontext = '{"server-host-name":"' + server_host_name + '","server-port":' + server_port + ',"server-url":"' + server_url +
				'","ts-before":' + ts_before + ',"policy-id":"' + policy_id + '"}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"SetTSParameters","params":' + jsontext + ' }');
		}
	}

	this.SignPDFData = function(in_file, out_file, signing_time, store_type, issued_to, issued_by, pfx_file, pwd, silent_mode, app_wnd,
		reseller_code, sig_type, sig_format, app_data) {
		if (this.bActiveX) {
			this.activeXObj.SignPDFData(in_file, out_file, signing_time, store_type, issued_to, issued_by, pfx_file, pwd, silent_mode, app_wnd,
				reseller_code, sig_type, sig_format, app_data);
			this._elk_activeX_returnResult("SignPDFData", "");
		} else {
			in_file = in_file.replace(/\\/g, "\\\\");
			out_file = out_file.replace(/\\/g, "\\\\");
			pfx_file = pfx_file.replace(/\\/g, "\\\\");
			var jsontext = '{"in-file":"' + in_file + '","out-file":"' + out_file + '","signing-time":' + signing_time + ',"store-type":' +
				store_type + ',"issued-to":"' + issued_to + '","issued-by":"' + issued_by + '","pfx-file":"' + pfx_file + '","pwd":"' + pwd +
				'","silent-mode":' + silent_mode + ',"reseller-code":' + reseller_code + ',"signature-format":' + sig_format + '}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"SignPDFData","params":' + jsontext + ' }');
		}
	}

	this.SignDataInMemoryEx = function(data, sig, detached, signing_time, store_type, issued_to, issued_by, pfx_file, pwd, silent_mode,
		app_wnd, reseller_code) {
		if (this.bActiveX) {
			sig = this.activeXObj.SignDataInMemoryEx(data, sig, detached, signing_time, store_type, issued_to, issued_by, pfx_file, pwd,
				silent_mode, app_wnd, reseller_code);
			this._elk_activeX_returnResult("SignDataInMemoryEx", sig);
		} else {
			pfx_file = pfx_file.replace(/\\/g, "\\\\");
			var jsontext = '{"data":"' + data + '","sig":"' + sig + '","detached":' + detached + ',"signing-time":' + signing_time +
				',"store-type":' + store_type + ',"issued-to":"' + issued_to + '","issued-by":"' + issued_by + '","pfx-file":"' + pfx_file +
				'","pwd":"' + pwd + '","silent-mode":' + silent_mode + ',"reseller-code":' + reseller_code + '}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"SignDataInMemoryEx","params":' + jsontext + ' }');
		}
	}

	this.SignEncodedDataInBatch = function(data, detached, signing_time, store_type, issued_to, issued_by, pfx_file, pwd, silent_mode, app_wnd,
		reseller_code) {
		if (this.bActiveX) {
			sig = this.activeXObj.SignEncodedDataInBatch(data, detached, signing_time, store_type, issued_to, issued_by, pfx_file, pwd, silent_mode,
				app_wnd, reseller_code);
			this._elk_activeX_returnResult("SignEncodedDataInBatch", sig);
		} else {
			pfx_file = pfx_file.replace(/\\/g, "\\\\");
			var jsontext = '{"data":"' + data + '","detached":' + detached + ',"signing-time":' + signing_time + ',"store-type":' + store_type +
				',"issued-to":"' + issued_to + '","issued-by":"' + issued_by + '","pfx-file":"' + pfx_file + '","pwd":"' + pwd + '","silent-mode":' +
				silent_mode + ',"reseller-code":' + reseller_code + '}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"SignEncodedDataInBatch","params":' + jsontext + ' }');
		}
	}

	this.SignDataAttached = function(in_file, signing_time, store_type, issued_to, issued_by, pfx_file, pwd, silent_mode, app_wnd,
		reseller_code, out_file) {
		if (this.bActiveX) {
			this.activeXObj.SignDataAttached(in_file, signing_time, store_type, issued_to, issued_by, pfx_file, pwd, silent_mode, app_wnd,
				reseller_code, out_file);
			this._elk_activeX_returnResult("SignDataAttached", "");
		} else {
			in_file = in_file.replace(/\\/g, "\\\\");
			out_file = out_file.replace(/\\/g, "\\\\");
			pfx_file = pfx_file.replace(/\\/g, "\\\\");
			var jsontext = '{"in-file":"' + in_file + '","out-file":"' + out_file + '","signing-time":' + signing_time + ',"store-type":' +
				store_type + ',"issued-to":"' + issued_to + '","issued-by":"' + issued_by + '","pfx-file":"' + pfx_file + '","pwd":"' + pwd +
				'","silent-mode":' + silent_mode + ',"reseller-code":' + reseller_code + '}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"SignDataAttached","params":' + jsontext + ' }');
		}
	}

	this.SignDataDetached = function(in_file, in_signature, is_encoded, is_hash, signing_time, store_type, issued_to, issued_by, pfx_file, pwd,
		silent_mode, app_wnd, reseller_code) {
		var sig = "";
		if (this.bActiveX) {
			sig = this.activeXObj.SignDataDetached(in_file, in_signature, is_encoded, is_hash, signing_time, store_type, issued_to, issued_by,
				pfx_file, pwd, silent_mode, app_wnd, reseller_code);
			this._elk_activeX_returnResult("SignDataDetached", sig);
		} else {
			in_file = in_file.replace(/\\/g, "\\\\");
			pfx_file = pfx_file.replace(/\\/g, "\\\\");
			var jsontext = '{"in-file":"' + in_file + '","in-signature":"' + in_signature + '","is-encoded":' + is_encoded + ',"is-hash":' +
				is_hash + ',"signing-time":' + signing_time + ',"store-type":' + store_type + ',"issued-to":"' + issued_to + '","issued-by":"' +
				issued_by + '","pfx-file":"' + pfx_file + '","pwd":"' + pwd + '","silent-mode":' + silent_mode + ',"reseller-code":' + reseller_code +
				'}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"SignDataDetached","params":' + jsontext + ' }');
		}
	}

	this.ConfigSigBlock = function(elements, width, height, image_position, orientation, sig_text, x_margin, y_margin) {
		if (this.bActiveX) {
			this.activeXObj.ConfigSigBlock(elements, width, height, image_position, orientation, sig_text, x_margin, y_margin);
			this._elk_activeX_returnResult("ConfigSigBlock", "");
		} else {
			var jsontext = '{"elements":' + elements + ',"width":' + width + ',"height":' + height + ',"image-position":' + image_position +
				',"orientation":' + orientation + ',"sig-text":"' + sig_text + '","x-margin":' + x_margin + ',"y-margin":' + y_margin + '}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"ConfigSigBlock","params":' + jsontext + ' }');
		}
	}

	this.EnablePDFArchivalSignature = function(enable) {
		if (this.bActiveX) {
			this.activeXObj.EnablePDFArchivalSignature(enable);
			this._elk_activeX_returnResult("EnablePDFArchivalSignature", "");
		} else {
			var jsontext = '{"enable":' + enable + '}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"EnablePDFArchivalSignature","params":' + jsontext + ' }');
		}
	}

	this.DoValidationBeforeSigningEx = function(trusted_root_dns, do_rev_checking, ignore_validation_res, reseller_code) {
		if (this.bActiveX) {
			this.activeXObj.DoValidationBeforeSigningEx(trusted_root_dns, do_rev_checking, ignore_validation_res, reseller_code);
			this._elk_activeX_returnResult("DoValidationBeforeSigningEx", "");
		} else {
			var jsonDNs;
			if (trusted_root_dns == null)
				jsonDNs = '[]';
			else
				dns = JSON.stringify(trusted_root_dns);
			var jsontext = '{"trusted-root-dns":' + jsonDNs + ',"do-rev-checking":' + do_rev_checking + ',"ignore-validation-res":' +
				ignore_validation_res + ',"reseller-code":' + reseller_code + '}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"DoValidationBeforeSigningEx","params":' + jsontext + ' }');
		}
	}

	this.SetSigningParametersEx = function(reason, location, signing_provider, hash_algorithm) {

		if (typeof hash_algorithm == "undefined")
			hash_algorithm = "";
		if (this.bActiveX) {
			this.activeXObj.SetSigningParametersEx(reason, location, signing_provider, hash_algorithm);
			this._elk_activeX_returnResult("SetSigningParametersEx", "");
		} else {
			var jsontext = '{"":"' + reason + '","":"' + location + '","signing-provider":"' + signing_provider + '","hash-algorithm":"' +
				hash_algorithm + '"}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"SetSigningParametersEx","params":' + jsontext + ' }');
		}
	}

	this.SetSigAppearanceParam = function(visibility_position, page_position, image_path) {
		if (this.bActiveX) {
			this.activeXObj.SetSigAppearanceParam(visibility_position, page_position, image_path);
			this._elk_activeX_returnResult("SetSigAppearanceParam", "");
		} else {
			image_path = image_path.replace(/\\/g, "\\\\");
			var jsontext = '{"visibility-position":' + visibility_position + ',"page-position":' + page_position + ',"image-path":"' + image_path +
				'"}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"SetSigAppearanceParam","params":' + jsontext + ' }');
		}
	}

	this.EnableExpiredCertEnumeration = function(enable) {
		if (this.bActiveX) {
			this.activeXObj.EnableExpiredCertEnumeration(enable);
			this._elk_activeX_returnResult("EnableExpiredCertEnumeration", "");
		} else {
			var jsontext = '{"enable":' + enable + '}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"EnableExpiredCertEnumeration","params":' + jsontext + ' }');
		}
	}

	this.GetSubjectDN = function() {
		var dn = "";
		if (this.bActiveX) {
			dn = this.activeXObj.GetSubjectDN();
			this._elk_activeX_returnResult("GetSubjectDN", dn);
		} else {
			var jsontext = '{}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"GetSubjectDN","params":' + jsontext + ' }');
		}
	}

	this.GetIssuerDN = function() {
		var dn = "";
		if (this.bActiveX) {
			dn = this.activeXObj.GetIssuerDN();
			this._elk_activeX_returnResult("GetIssuerDN", dn);
		} else {
			var jsontext = '{}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"GetIssuerDN","params":' + jsontext + ' }');
		}
	}

	this.SignFile = function(in_file, signing_time, store_type, issued_to, issued_by, pfx_file, pwd, reseller_code, getSig) {
		// the following is done for backward compatibility where this parameter was not present for a short time.
		// TODO: REMOVE THIS LATER
		if (typeof getSig == "undefined" || getSig != false)
			getSig = true;

		if (this.bActiveX) {
			alert("SignFile functionality is not supported in this mode of signing");
			this._elk_activeX_returnResult("SignFile", "");
		} else {
			in_file = in_file.replace(/\\/g, "\\\\");
			pfx_file = pfx_file.replace(/\\/g, "\\\\");
			var jsontext = '{"file-to-sign":"' + in_file + '","signing-time":' + signing_time + ',"store-type":' + store_type + ',"issued-to":"' +
				issued_to + '","issued-by":"' + issued_by + '","pfx-file":"' + pfx_file + '","pwd":"' + pwd + '","reseller-code":' + reseller_code +
				',"get-sig":' + getSig + '}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"SignFile","params":' + jsontext + ' }');
		}
	}

	this.SignPDFInMemory = function(pdf_data, signing_time, store_type, issued_to, issued_by, pfx_file, pwd, silent_mode, signature_format,
		reseller_code) {
		if (typeof signature_format == "undefined") {
			// Support backward compatibility
			reseller_code = silent_mode;
			signature_format = 1;
			silent_mode = false;
		} else if (typeof reseller_code == "undefined") {
			// Support backward compatibility
			reseller_code = signature_format;
			signature_format = 1;
		}
		if (this.bActiveX) {
			alert("SignPDFInMemory functionality is not supported in this mode of signing");
			this._elk_activeX_returnResult("SignPDFInMemory", "");
		} else {
			pfx_file = pfx_file.replace(/\\/g, "\\\\");
			var jsontext = '{"pdf-data":"' + pdf_data + '","signing-time":' + signing_time + ',"store-type":' + store_type + ',"issued-to":"' +
				issued_to + '","issued-by":"' + issued_by + '","pfx-file":"' + pfx_file + '","pwd":"' + pwd + '","silent-mode":' + silent_mode +
				',"reseller-code":' + reseller_code + ',"signature-format":' + signature_format + '}';
			this._elk_send_request('{ "msg":"sign","ver":0,"cmd":"SignPDFInMemory","params":' + jsontext + ' }');
		}
	}

}

// Callback functions...
// This name is now a misnomer. It is used if Websocket fails and we have to fall back on ActiveX Plugin for IE or Firefox
function _elk_switchToActiveX() {
	var msgPlugin2 =
		"If you get a message similar to Allow file... to run E-Lock WebSigning DeskSign Control, please click on Allow and Allow and Remember";
	var msgPlugin =
		"Your browser neither supports Websockets nor ActiveX plugins. Please upgrade your browser version or use a different browser";
	if (!_elk_desksignObj.bActiveX && _elk_desksignObj._elk_connectionOpen == false) {
		if (!bIE && !bFirefox) {
			// Not IE or Firefox: No fallback available
			_elk_savealert("Error in loading E-Lock Signing component for this browser. Please use Internet Explorer or Firefox");
		} else {
			// Connection did not open and we are IE or Firefox, then fall back to plugin
			// alert(msgPlugin2);
			var a = document.createElement("div");
			a.innerHTML = '<object id="pluginSign" type="application/x-ELOCK-Plugin-For-Desk-Sign" height="0" width="0"></object>';
			document.body.appendChild(a);
			_elk_desksignObj.activeXObj = document.getElementById("pluginSign");
			if (typeof _elk_desksignObj.activeXObj == "undefined" || _elk_desksignObj.activeXObj == null) {
				_elk_savealert("Error: " + msgPlugin);
				return;
			}
			try {
				_elk_desksignObj.activeXObj.GetOperationStatusString();
			} catch (b) {
				_elk_savealert("Error: " + msgPlugin);
				return;
			}
			_elk_desksignObj.bActiveX = true; // indicate we are using plugin
		}
	}
}

function _elk_savealert(str) {
	_elk_lastmsg = str;
}

function _elk_onopenfn() {
	_elk_enablePage();
	_elk_desksignObj._elk_connectionOpen = true;
}

function _elk_onclosefn() {
	_elk_desksignObj._elk_connectionOpen = false;
	_elk_desksignObj._elk_socket = null;
	if (_elk_new_proto && _elk_err_try) {
		_elk_new_proto = false;
		_elk_err_try = false;
		_elk_desksignObj._elk_socket = null;
		_elk_desksignObj._elk_open();
		_elk_desksignObj._elk_setCallback(_elk_desksignObj._elk_userCallback);
	} else {
		_elk_enablePage();
		_elk_switchToActiveX(); // NEW
	}
}

function _elk_onerrorfn() {
	if (_elk_new_proto) {
		// It failed with new protocol. So, try with old protocol
		_elk_err_try = true; // We will actually try it in _elk_onclosefn, so just remember that we have to try
	} else {
		_elk_enablePage();
		/*
				alert("onerror");
				// It failed with old protocol also. So, switch to ActiveX method
				this._elk_socket = null;
				this._elk_connectionOpen = false;
				_elk_switchToActiveX(); // NEW
		*/
	}
}

function _elk_round8(num) {
	var disp = "";
	for (i = 0; i < 8; i++) {
		disp = (num % 10) + disp;
		num = Math.floor(num / 10);
	}
	return disp;
}

// This function creates a transparent DIV over the whole page so that we can disable/enable the page
function _elk_createDiv() {
	var d = document.createElement("div");
	d.id = "_elk_disablingDiv";
	document.body.insertBefore(d, document.body.childNodes[0]);

	var x = document.createElement("STYLE");
	var t = document.createTextNode(
		"%23_elk_disablingDiv {display: none; z-index:10001; position: absolute; top: 0%; left: 0%; width: 100%; height: 100%; background-color: white; opacity:.00; filter: alpha(opacity=00);}"
	);
	try {
		x.appendChild(t);
		document.head.insertBefore(x, document.head.childNodes[0]);
	} catch (Exception) {};
}

function _elk_disablePage() {
	document.getElementById('_elk_disablingDiv').style.display = 'block';
}

function _elk_enablePage() {
	document.getElementById('_elk_disablingDiv').style.display = 'none';
}
var bChrome = false;
var bFirefox = false;
var bEdge = false;
var bIE = false;

function _elk_detectBrowser() {
	if (navigator.userAgent.indexOf("Edge") != -1) {
		bEdge = true;
	} else if (navigator.userAgent.indexOf("Firefox") != -1) {
		bFirefox = true;
	} else if (navigator.userAgent.indexOf("Chrome") != -1) {
		bChrome = true;
	} else {
		bIE = true;
	}
	// ANI: TODO: Detect Opera
}