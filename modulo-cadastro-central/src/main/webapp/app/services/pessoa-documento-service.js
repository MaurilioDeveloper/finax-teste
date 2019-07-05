angular.module('cadastro-central-module').factory('documentoService', DocumentoService);

DocumentoService.$inject = [ '$http', 'PATHCONFIG' ];

function DocumentoService($http, PATHCONFIG) {

	return {

		findAll : findAll,
		findAllByPrestadorServicoIdentificador : findAllByPrestadorServicoIdentificador,
		insertPessoaDocumento : insertPessoaDocumento,
		deletePessoaDocumento : deletePessoaDocumento,
		excluirPessoaDocumento : excluirPessoaDocumento

	};

	function findAll() {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/documento');
	}

	function findAllByPrestadorServicoIdentificador(identificador) {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/documento/' + identificador);
	}
	
	function insertPessoaDocumento(documento){
		return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/documento/inserir-documento/', documento);
	}
	
	function deletePessoaDocumento(idDocumento) {
		return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/documento/' + idDocumento);
	}
	
	function excluirPessoaDocumento(documento) {
		return $http['delete'](PATHCONFIG.CADASTRO_CENTRAL + '/documento/excluir-documento' + documento);
	}

}