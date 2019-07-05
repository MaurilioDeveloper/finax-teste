angular.module('cadastro-central-module').factory('bancoService',function($http, PATHCONFIG){
	return {
	
		findAll : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/banco');
		}
	
	}
});