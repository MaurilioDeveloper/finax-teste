angular.module('cadastro-central-module').directive('uiSelectMatch',function($filter){
	return {
		require:'^uiSelect',
		link:function(scope,element,attrs,uiSelect){
			
			uiSelect.searchInput.on('blur', function() {
				if(uiSelect.search){
					var results = $filter('filter')(uiSelect.items,uiSelect.search);
					if(!results.length)
						uiSelect.select(uiSelect.search);					
				}
			});
			
			var input = element.parent().find('input[type=search]');
			if (attrs && attrs.tabindex) {
				input[0].tabIndex = attrs.tabindex;
			}
			
			if(attrs.maxlength && !isNaN(attrs.maxlength)){
				input.attr('maxlength',attrs.maxlength);				
			}
			if(attrs.numberOnly && attrs.numberOnly == "true"){
				input.keypress(function(e){
					if(isNaN(e.key))
						e.preventDefault();
				});
			}
		}
	}
});