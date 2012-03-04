/**
 * Content
 * 
 * 
 */
window.App.content = {

	/**
	 * Initialized content.
	 */
	init: function() {

		this._locked = false;
		this.article = jQuery('.content');
	},
	
	/**
	 * Posts events to content to safely and synhchronously be run.
	 * 
	 * @param contextId The user contenxt ID at the time of the call.
	 * @param caller The object type of the caller.
	 * @param fn The function to be posted.
	 */
	post: function(contextId, caller, fn) {
		try {
			if(caller == App.navigation.selected && contextId == App.user.content.id) {
				if(this._locked) {
					this.post(contextId, caller, fn);
				}
				else {
					this._locked = true;
					fn();
					this._locked = false;
				}
			}
		}
		catch(error) {
			// TODO: App.close();
			console.log(error);
		}
	},
	
	/**
	 * Displays content.
	 * 
	 * @param content The content to be displayed.
	 */
	display: function(content) {
		this.article.removeClass('loading').html(content);
	},
	
	/**
	 * Shows loading.
	 */
	loading: function() {
		this.article.html("").addClass('loading');
	}
};