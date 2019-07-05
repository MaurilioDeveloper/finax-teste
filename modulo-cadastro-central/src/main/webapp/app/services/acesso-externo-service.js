angular.module('cadastro-central-module').factory('acessoExternoService', acessoExternoService);

acessoExternoService.$inject = [ '$http', 'PATHCONFIG' ];

function acessoExternoService($http, PATHCONFIG) {

    return {

        saveAcess: saveAcess,
        getAcessByIdentificador: getAcessByIdentificador,
        updateRequestBody : updateRequestBody

    };

    function getAcessByIdentificador(identificador) {
        return $http({
            url: PATHCONFIG.PORTAL_API_PESSOA + '/'+ identificador + '/acessos',
            method: 'GET',
            headers : {
                'Authorization' : 'header_Domain',
            }
        });
    }

    function saveAcess(acessos, identificador) {
        return $http({
            url: PATHCONFIG.PORTAL_API_PESSOA + '/'+ identificador + '/acessos',
            method: 'POST',
            data: acessos,
            headers : {
                'Authorization' : 'header_Domain',
                'Content-Type':'application/json'
            }
        });
    }

    function updateRequestBody(acessos, identificador) {
        return $http({
            url: PATHCONFIG.PORTAL_API_PESSOA + '/'+ identificador + '/acessos',
            method: 'PUT',
            data: acessos,
            headers : {
                'Authorization' : 'header_Domain',
                'Content-Type':'application/json'
            }
        });
    }

}