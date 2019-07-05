angular.module('cadastro-central-module').factory('cnaeService',CnaeService);

CnaeService.$inject = ['$http','PATHCONFIG'];

function CnaeService($http,PATHCONFIG) {
	
	return {
		findByCodigo : findByCodigo
	};
	
	/**
	 * Busca a descricao de um cnae pelo código
	 */
	function findByCodigo(codigo) {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/cnae/' + codigo);
	}
	
}