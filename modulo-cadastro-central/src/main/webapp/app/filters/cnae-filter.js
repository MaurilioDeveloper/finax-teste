angular.module('cadastro-central-module').filter('cnae',function(){

	return function(input){
		if(input){
			return input.toString().replace(/(\d{4})(\d{1})(\d{2})/,"$1-$2/$3");
		}
	}
});