angular.module('cadastro-central-module').directive('number', function(){
    return {
    	restrict:'A',
    	scope:{
    		ngModel:'='
    	},
    	require:'ngModel',
        link: function(scope, element, attrs, ngModel) {
        	
        	ngModel.$parsers.push(function(valor){
        		return angular.element(element).autoNumeric('get'); 
        	});
        	
        	ngModel.$formatters.push(function(valor){
        		if(valor) return valor.toString().replace('.',',');
        		else return valor;
        	});
        	
        	scope.$watch('ngModel',function(){
        		angular.element(element).trigger('focusout');
        	});
        	
        	angular.element(element).autoNumeric('init');
        	
        }
    };
});