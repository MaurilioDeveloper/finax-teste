angular.module('cadastro-central-module').factory('responsavelService', ResponsavelService);

ResponsavelService.$inject = [ '$http', 'PATHCONFIG' ];

function ResponsavelService($http, PATHCONFIG) {

	return {

		findAll : findAll,
		findAllByIdentificador : findAllByIdentificador,
		insertPessoaResponsavel : insertPessoaResponsavel,
		deletePessoaResponsavel : deletePessoaResponsavel

	};

	function findAll() {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/responsavel');
	}

	function findAllByIdentificador(identificador) {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/responsavel/' + identificador);
	}
	
	function insertPessoaResponsavel(responsavel){
		return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/responsavel/inserir-responsavel/', responsavel);
	}
	
	function deletePessoaResponsavel(idResponsavel) {
		return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/responsavel/' + idResponsavel);
	}

}