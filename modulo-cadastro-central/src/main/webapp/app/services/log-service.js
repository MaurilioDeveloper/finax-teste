angular.module('cadastro-central-module').factory('logService', LogService);

LogService.$inject = [ '$http', 'PATHCONFIG' ];

function LogService($http, PATHCONFIG) {

	return {

		findAll : findAll,
		insertLog : insertLog
	};

	function findAll() {
		return $http.get(PATHCONFIG.CADASTRO_CENTRAL + '/log');
	}

	function insertLog(log){
		return $http.post(PATHCONFIG.CADASTRO_CENTRAL + '/log/inserir-log/', log);
	}
}