angular.module('cadastro-central-module').directive('mask', function($timeout){
    return {
    	restrict:'A',
    	scope:{
    		ngModel:'='
    	},
    	require:'?ngModel',
        link : function(scope, element, attrs, ngModel) {
        	
        	//Só utiliza os parses se o elemento for do tipo input
        	if(element.prop('tagName') == 'INPUT'){
        		ngModel.$parsers.push(function(value) {
        			if(attrs.maskedModel && attrs.maskedModel == "true"){
        				return value;
        			} else {
        				return angular.element(element).cleanVal();        				
        			}
        		});        		
        	}
        	
        	//Máscara quando o conteúdo do ng-model for mudado programaticamente
        	scope.$watch('ngModel',function(){
        		$timeout(function(){
            		angular.element(element).trigger('keyup');
            	});
        	});
        	
        	angular.element(element).blur(function(){
				if(!angular.element(element).val()){
					ngModel.$setViewValue('');
				}
			});

        	//Mascara ao entrar na tela com a diretiva
        	$timeout(function(){
        		angular.element(element).mask(attrs.mask, {
        			clearIfNotMatch : attrs.clearIfNotMatch == "true" || attrs.clearIfNotMatch == undefined || attrs.clearIfNotMatch == null  ? true : false
        		});        		
        	});

		}
    };
});