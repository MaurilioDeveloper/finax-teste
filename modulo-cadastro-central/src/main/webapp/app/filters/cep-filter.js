angular.module('cadastro-central-module').filter('cep',function(){

	return function(input){
		if(input){
			return input.toString().replace(/(\d{2})(\d{3})(\d{3})/,"$1.$2-$3");
		}
	}
});