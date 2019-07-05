angular.module('cadastro-central-module').factory('tagsTermoService',TagsTermoService);

TagsTermoService.$inject = ['$http','PATHCONFIG']

function TagsTermoService($http,PATHCONFIG) {

    return {
        findAllTermo : findAllTermo,
        findAllIntervenientes : findAllIntervenientes,
        findAllResponsavelSolidario : findAllResponsavelSolidario,
        findAllContrato : findAllContrato,
        findAllRepresentanteLegal : findAllRepresentanteLegal,
        findAllCedente : findAllCedente,
        findAllConsultora : findAllConsultora,
        findAllTestemunha : findAllTestemunha,
        findAllFundo : findAllFundo,
        findAllAdministrador : findAllAdministrador,
        findAllCessao : findAllCessao,
        findAllGestor : findAllGestor,
        findAllSacado : findAllSacado
    }

    function findAllTermo() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/termo');
    }

    function findAllIntervenientes() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/intervenientes');
    }

    function findAllResponsavelSolidario() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/responsavel-solidario');
    }
    
    function findAllContrato() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/contrato');
    }

    function findAllRepresentanteLegal() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/representante-legal');
    }

    function findAllCedente() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/cedente');
    }
    
    function findAllConsultora() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/consultora');
    }
    
    function findAllTestemunha() {
    	return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/testemunha');
    }

    function findAllFundo() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/fundo');
    }

    function findAllAdministrador() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/administrador');
    }

    function findAllCessao() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/cessao');
    }

    function findAllGestor() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/gestor');
    }

    function findAllSacado() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tags/sacado');
    }

}
