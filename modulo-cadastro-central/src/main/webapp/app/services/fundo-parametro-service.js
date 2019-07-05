angular.module('cadastro-central-module')

	.factory('fundoParametroService', FundoParametroService);

FundoParametroService.$inject = [ '$http', 'PATHCONFIG' ];

function FundoParametroService($http, PATHCONFIG) {
	return {
		listaRegras : listaRegras,
		buscaParametros : buscaParametros,
		buscaRegra : buscaRegra,
		inserirRegraFundo : inserirRegraFundo,
		updateRegraFundo : updateRegraFundo
	};

	function listaRegras() {
		return $http.get(PATHCONFIG.PORTAL_API_FUNDO_PARAMETRO + '?statusParametro=S', {
		});
	}

	function buscaParametros(idParametro, nomeParametro) {
		if (idParametro != null) {
			return $http.get(PATHCONFIG.PORTAL_API_FUNDO_PARAMETRO + '/' + idParametro + '?statusParametro=T', {
			});
		} else if (nomeParametro != null) {
			return $http.get(PATHCONFIG.PORTAL_API_FUNDO_PARAMETRO + '?nomeParametro=' + nomeParametro + '&statusParametro=T', {
			});
		}
	}

	function buscaRegra(cdFundo) {
		return $http.get(PATHCONFIG.PORTAL_API_FUNDO + '/' + cdFundo + '/parametros', {
		});
	}

	function inserirRegraFundo(cdFundo, parametro) {
		var parametros = [];
		parametros.push(parametro);
		return $http.post(PATHCONFIG.PORTAL_API_FUNDO + '/' + cdFundo + '/parametros', parametros);
	}

	function updateRegraFundo(cdFundo, parametro) {
		var parametros = [];
		parametros.push(parametro);
		return $http.patch(PATHCONFIG.PORTAL_API_FUNDO + '/' + cdFundo + '/parametros', parametros);
	}
	
}