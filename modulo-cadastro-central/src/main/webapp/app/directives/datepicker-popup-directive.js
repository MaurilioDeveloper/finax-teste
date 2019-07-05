angular.module('cadastro-central-module').directive('datepickerPopup',function(){
	return {
		require:'ngModel',
		link:function(scope,element,attrs,ngModel){

			angular.element(element).mask(attrs.datepickerPopup.replace(/\w/g,'0'),
			{
				clearIfNotMatch:true,
				onComplete:function(val){
					var mData = moment(val,attrs.datepickerPopup.toUpperCase());
					if(!mData.isValid()){
						ngModel.$viewValue = undefined;
						ngModel.$render();
					}
				}
			});
		}
	}
});