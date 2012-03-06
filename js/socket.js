/*
 * Chrome Extension Socket
 * <https://github.com/jjNford/chrome-extension-socket>
 * 
 * Copyright (C) 2012, JJ Ford (jj.n.ford@gmail.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */
(function() {

	window.Socket = {
	
		/**
		 * Initialize
		 */
		init: function() {
			this.port = chrome.extension.connect({name: "popupToBackground"});
			this.tasks = 0;

			chrome.extension.onConnect.addListener(function(port) {
				if(port.name == "backgroundToPopup") {}
				else if(port.name == "popupToBackground") {
					Socket.port = chrome.extension.connect({name: "backgroundToPopup"});
				}
				else {
					return;
				}
				
				port.onMessage.addListener(function(msg) {
					try {
						window[msg.namespace][msg.literal][msg.method].apply(this, msg.args);
						
						// Keep track of tasks running in background page.
						if(Socket.port.name == "backgroundToPopup") {
							Socket.tasks++;
						}
					}
					catch(UnknownDestination) {
						if(msg == "complete") {
							jQuery('.user_links.loading').hide();
						}
					}
				});
			});
		},
		
		/**
		 * Post Complete
		 */
		postComplete: function() {
			this.tasks--;
			if(this.tasks == 0) {
				this.port.postMessage("complete");
			}
		},
				
		/**
		 * Post Message 
		 * 
		 * @param - namespace - Namespace of message destination.
		 * @param - literal - Object of message destination.
		 * @param - method - Method of message destination. 
		 */
		postMessage: function(namespace, literal, method, args) {
						
			// Display loading notification.
			if(this.port.name == "popupToBackground") {
				jQuery('.user_links.loading').show();
			}

			this.port.postMessage({namespace: namespace, literal: literal, method: method, args: args});
		}
	};

	Socket.init();
})();