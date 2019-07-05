angular.module('cadastro-central-module').directive('datepickerPopup',['$rootScope',function($rootScope){
	return {
		link:function(scope,element,attrs){
			if(attrs.maskDate){
				element.mask(attrs.maskDate,{
					clearIfNotMatch:true
				});
			}else{
				element.mask('00/00/0000',{
					clearIfNotMatch:true
				});
			}
			$rootScope.$on('datepicker.focus',function(){
				//alert('maoe');
			});
		}
	}
}]);