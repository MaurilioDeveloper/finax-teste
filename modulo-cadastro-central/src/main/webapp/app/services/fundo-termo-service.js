angular.module('cadastro-central-module').factory('fundoTermoService',FundoTermoService);

FundoTermoService.$inject = ['$http','PATHCONFIG']

function FundoTermoService($http,PATHCONFIG) {

    return {
        excluir : excluir,
        cadastrar : cadastrar,
        atualizar : atualizar,
        findById : findById,
        findByFundoAndName : findByFundoAndName,
        gerarPdf : gerarPdf,
        validar : validar,
        findAllNomesTermos : findAllNomesTermos,
        findAllNomesFundos : findAllNomesFundos
    }

    function excluir(id) {
        return $http.delete(PATHCONFIG.CADASTRO_CENTRAL + '/termo/' + id);
    }

    function cadastrar(termo) {
        return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/termo',termo);
    }

    function atualizar(termo) {
        return $http.put(PATHCONFIG.CADASTRO_CENTRAL + '/termo',termo);
    }

    function findById(id) {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/' + id);
    }

    function findByFundoAndName(nmTermo,idPessoaFundo) {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/' + nmTermo + '/fundo/' + idPessoaFundo);
    }
    
    function gerarPdf(termo){
		return $http({
			method:'GET',
			responseType: 'arraybuffer',
			url:PATHCONFIG.CADASTRO_CENTRAL + '/termo/gerarPdf/' + termo.idPessoaFundoTermo
		});
	}
    
    function validar(termo){
    	return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/termo/validar',termo);
    }
    
    function findAllNomesTermos() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/findAllNomesTermos');
    }
    
    function findAllNomesFundos() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/findAllNomesFundos');
    }

}