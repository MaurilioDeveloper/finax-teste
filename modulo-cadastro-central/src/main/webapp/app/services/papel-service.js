angular.module('cadastro-central-module').factory('papelService', PapelService);

PapelService.$inject = [ '$http', 'PATHCONFIG' ];

function PapelService($http, PATHCONFIG) {

	return {

		findAll : findAll,
		findAllByTipoCadastro : findAllByTipoCadastro,
		insertPapel : insertPapel,
		deletePapel : deletePapel

	};

	function findAll() {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/papel');
	}

	function findAllByTipoCadastro(tipoCadastro) {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/papel/tipo/'
				+ tipoCadastro);
	}
	
	function insertPapel(papel){
		return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/papel/inserir-papel/', papel);
	}
	
	function deletePapel(idPapel) {
		return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/papel/' + idPapel);
	}

}