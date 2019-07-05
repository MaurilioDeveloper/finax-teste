angular.module('cadastro-central-module').filter('telefone',function(){

	return function(input){
		
		if(input.toString().length == 13) {
			return input.toString().replace(/(\d{2})(\d{2})(\d{5})(\d{4})/,'+$1 ($2) $3-$4'); //Ex. +99 (99) 99999-9999
		} else if(input.toString().length == 12) {
			return input.toString().replace(/(\d{2})(\d{2})(\d{4})(\d{4})/,'+$1 ($2) $3-$4'); //Ex. +99 (99) 9999-9999
		} else if(input.toString().length == 10)
			return input.toString().replace(/(\d{2})(\d{4})(\d{4})/,'($1) $2-$3'); //Ex. (99) 99999-9999
		else if(input.toString().length == 11)
			return input.toString().replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3'); //Ex. (99) 9999-9999 
		
		return input;
		
	}
	
});