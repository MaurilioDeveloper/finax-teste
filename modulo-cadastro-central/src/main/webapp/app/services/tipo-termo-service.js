angular.module('cadastro-central-module').factory('tipoTermoService',TipoTermoService);

TipoTermoService.$inject = ['$http','PATHCONFIG']

function TipoTermoService($http,PATHCONFIG) {

    return {
        findAll : findAll
    }


    function findAll() {
        return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/termo/tipos');
    }

}
