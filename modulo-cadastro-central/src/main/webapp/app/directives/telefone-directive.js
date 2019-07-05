angular.module('cadastro-central-module').directive('telefoneInput', function($timeout){
	
	return {
		restrict:'A',
		scope:{
			ngModel:'='
		},
		require:'ngModel',
		link:function(scope,element,attrs,ngModel){
			
			if(attrs.clearIfNotMatch == "false"){
				attrs.clearIfNotMatch = false;
			}else{
				attrs.clearIfNotMatch = true;
			}
			
			ngModel.$parsers.push(function(value) {
    			return angular.element(element).cleanVal();
    		});        		
			
			scope.$watch('ngModel',function(newValue,oldValue){
				$timeout(function(){
					element.trigger('keyup');
				});					
			});
			
			angular.element(element).blur(function(){
				if(!angular.element(element).val()){
					ngModel.$setViewValue('');
				}
			});
			
		    mask(element, attrs.clearIfNotMatch);
		    
		}
	};
	
	
	function mask(element, clear){
		
		var SPMaskBehavior = function (val) {
			if(val.replace(/\D/g, '').length == 13) {
				return '+00 (00) 00000-0000';
			} else if(val.replace(/\D/g, '').length == 12){
				return '+00 (00) 0000-00009';
			} else if(val.replace(/\D/g, '').length == 11){
				return '(00) 00000-00009';
			} else {
				return '(00) 0000-00009';
			}
	    };
	    
	    var spOptions = {
    		onKeyPress: function(val, e, field, options) {
		         field.mask(SPMaskBehavior.apply({}, arguments), options);
		    },
		    clearIfNotMatch: clear
	    };
	    
		angular.element(element).mask(SPMaskBehavior,spOptions);
		
		
	}
	
});