angular.module('cadastro-central-module').factory('paisService',PaisService);

PaisService.$inject = ['$http','PATHCONFIG'];

function PaisService($http,PATHCONFIG){
	
	return {
		
		findAll : function(){
			return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/pais');
		}
	
	}
	
}