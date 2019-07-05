angular.module('cadastro-central-module').filter('cnpj',function(){

	return function(input){
		
		return input.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,"$1.$2.$3/$4-$5");
		
	}
	
}).filter('cpfcnpj',function(){
	return function(input, tipo){
		input = input + "";
		if (input.toString().length > 11) {
			input = "00000000000000" + input;
			input = input.substring(input.length-14,input.length);
			return input.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,"$1.$2.$3/$4-$5");
		} else {
			input = "00000000000" + input;
			input = input.substring(input.length-11,input.length);
			return input.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,"$1.$2.$3-$4");
		}
	}
});