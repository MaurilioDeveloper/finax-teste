angular.module('cadastro-central-module').factory('usuarioService', UsuarioService);

UsuarioService.$inject = [ '$http', 'PATHCONFIG' ];

function UsuarioService($http, PATHCONFIG) {

	return {
		getUsuarioLogado : getUsuarioLogado
	}

	function getUsuarioLogado() {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/usuario');
	}

}