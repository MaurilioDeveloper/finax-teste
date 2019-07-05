angular.module('cadastro-central-module').factory('relacionadaService', RelacionadaService);

RelacionadaService.$inject = [ '$http', 'PATHCONFIG' ];

function RelacionadaService($http, PATHCONFIG) {

	return {

		inserirPessoaRelacionada : inserirPessoaRelacionada,
		deletePessoaRelacionada : deletePessoaRelacionada,
		findAllPessoaRelacionadaByIdentificador : findAllPessoaRelacionadaByIdentificador,
		findAllPessoaRelacionadaByIdentificadorPessoa : findAllPessoaRelacionadaByIdentificadorPessoa,
		atualizarPessoaRelacionada : atualizarPessoaRelacionada,
		findAllPessoaRelacionadaByIdPessoa : findAllPessoaRelacionadaByIdPessoa,
		findAllPessoaRelacionadaByIdPapel : findAllPessoaRelacionadaByIdPapel,
		findAllPessoaRelacionadaByIdPapelAndIdPessoa : findAllPessoaRelacionadaByIdPapelAndIdPessoa

	};

	function inserirPessoaRelacionada(relacionada){
		return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/relacionada/inserir-relacionada/', relacionada);
	}
	
	function deletePessoaRelacionada(pessoaRelacionada) {
		
		return $http({
			url:PATHCONFIG.CADASTRO_CENTRAL + '/relacionada/excluir-relacionada/',
			method:'DELETE',
			data:pessoaRelacionada,
			headers:{
				'Content-Type':'application/json'
			}
		});
	}
	
	function findAllPessoaRelacionadaByIdentificador(identificador) {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/relacionada/' + identificador);
	}
	
	function findAllPessoaRelacionadaByIdentificadorPessoa(identificador) {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/relacionada/' + identificador + '/pessoa');
	}
	
	function atualizarPessoaRelacionada(relacionada){
		return $http.put(PATHCONFIG.CADASTRO_CENTRAL + '/relacionada/atualizar-relacionada/', relacionada);
	}
	
	function findAllPessoaRelacionadaByIdPessoa(idPessoa) {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/relacionada/prestador-servico-fundo/' + idPessoa);
	}
	
	function findAllPessoaRelacionadaByIdPapel(idPapel) {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/relacionada/papel-relacionada/' + idPapel);
	}
	
	function findAllPessoaRelacionadaByIdPapelAndIdPessoa(idPapel,idPessoa) {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/relacionada/papel-relacionada/' + idPapel + "/" + idPessoa);
	}
}

