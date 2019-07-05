angular.module('cadastro-central-module').factory('parametroWriteOfflService', ParametroWriteOfflService);

ParametroWriteOfflService.$inject = [ '$http', 'PATHCONFIG' ];

function ParametroWriteOfflService($http, PATHCONFIG) {
	return {
		findAll : findAll,
		findAllById : findAllById,
		insertParametro : insertParametro,
		updateParametro : updateParametro
	};

	function findAll() {
		return $http.get(PATHCONFIG.PORTAL_API_FUNDO_PARAMETRO);
	}

	function findAllById(id) {
		return $http.get(PATHCONFIG.PORTAL_API_FUNDO_PARAMETRO + '/' + id + '?statusParametro=T');
	}

	function insertParametro(parametro) {
		var parametros = [];
		parametros.push(parametro);
		return $http.post(PATHCONFIG.PORTAL_API_FUNDO_PARAMETRO, parametros);
	}
	
	function updateParametro(parametro) {
		var parametros = [];
		parametros.push(parametro);
		return $http.patch(PATHCONFIG.PORTAL_API_FUNDO_PARAMETRO, parametros);
	}

}