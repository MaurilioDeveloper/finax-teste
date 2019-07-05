angular.module('cadastro-central-module').controller('ConsultaParametroCtrl', ConsultaParametroCtrl);

ConsultaParametroCtrl.$inject = [ '$scope', '$http', '$timeout', '$filter', 'PATHCONFIG', '$q', '$state', 'notify', 'usSpinnerService', 'utilsService', 'dialogService', 'fundoParametroService', 'tipoService', 'parametroWriteOfflService' ];

function ConsultaParametroCtrl($scope, $http, $timeout, $filter, PATHCONFIG, $q, $state, notify, usSpinnerService, utilsService, dialogService, fundoParametroService, tipoService, parametroWriteOfflService) {
	var controller = this;

	controller.Parametros = [];
	controller.excluir = excluir;
	controller.usuarioLogado = 'PETRA';
	controller.currentPage = 1;
	controller.inAtivo = "S";
	controller.buscarParametros = buscarParametros;
	controller.resetForm = resetForm;
	controller.parametro = {};
	controller.url_caRest = PATHCONFIG.CONTROLE_ACESSO;
	controller.restUrl = PATHCONFIG.PORTAL_API_FUNDO_PARAMETRO;

	_getUserLogado();
	buscarParametros();
	
	function _getUserLogado() {
		var settings = {
			"async" : true,
			"url" : controller.url_caRest + "/usuario/username",
			"method" : "GET",
		}
		$.ajax(settings).done(function(response) {
			$scope.usuarioLogado = response;			
		});
	}
	
	function buscarParametros() {
		usSpinnerService.spin('spinner-1');

		if ((controller.dsProWriteoff != undefined && controller.dsProWriteoff != '') &&
			(controller.codigoProWriteoff != undefined && controller.codigoProWriteoff != '')) {
			$http({
				method : 'GET',
				url : controller.restUrl + '?codigo=' + controller.codigoProWriteoff + '&nomeParametro=' + controller.dsProWriteoff + '&statusParametro=' + controller.inAtivo,
			}).success(function(response) {
				controller.Parametros = response;
				paginador();
				usSpinnerService.stop('spinner-1');
			}).error(function(response) {
				usSpinnerService.stop('spinner-1');
				notify({
					message : 'Falha ao buscar Parâmetro.',
					classes : 'alert-danger',
					position : 'right'
				});
			});
		} else if (controller.codigoProWriteoff != undefined && controller.codigoProWriteoff != '') {
			$http({
				method : 'GET',
				url : controller.restUrl + '?codigo=' + controller.codigoProWriteoff + '&statusParametro=' + controller.inAtivo,
			}).success(function(response) {
				controller.Parametros = response;
				paginador();
				usSpinnerService.stop('spinner-1');
			}).error(function(response) {
				usSpinnerService.stop('spinner-1');
				notify({
					message : 'Falha ao buscar Parâmetro.',
					classes : 'alert-danger',
					position : 'right'
				});
			});
		} else if (controller.dsProWriteoff != undefined && controller.dsProWriteoff != '') {
			$http({
				method : 'GET',
				url : controller.restUrl + '?nomeParametro=' + controller.dsProWriteoff + '&statusParametro=' + controller.inAtivo,
			}).success(function(response) {
				controller.Parametros = response;
				paginador();
				usSpinnerService.stop('spinner-1');
			}).error(function(response) {
				usSpinnerService.stop('spinner-1');
				notify({
					message : 'Falha ao buscar Parâmetro.',
					classes : 'alert-danger',
					position : 'right'
				});
			});

		} else {
			$http({
				method : 'GET',
				url : controller.restUrl + '?statusParametro=' + controller.inAtivo,
			}).success(function(response) {
				controller.Parametros = response;
				paginador();
				usSpinnerService.stop('spinner-1');
			}).error(function(response) {
				usSpinnerService.stop('spinner-1');
				notify({
					message : 'Falha ao buscar Parâmetro.',
					classes : 'alert-danger',
					position : 'right'
				});
			});
		}
	}

	function excluir(idParametro, nome, nrdias, codigo) {
		var nomeTratado = "";
		var dist = 60;
		var resultado = new Array(parseInt(nome.length / dist));
		for (var x = 0; x < nome.length / dist; x++) {
			nomeTratado += nome.substring(0 + x * dist, (x + 1) * dist) + '\n';
		}
		if (nomeTratado == "") {
			nomeTratado = nome;
		}

		dialogService.show('Excluir', 'Deseja inativar o Parâmetro: ' + '\n' + nomeTratado + '?', 'Sim', 'Não').result.then(function() {

			controller.parametro = {
				idParametro : idParametro,
				codigo : codigo,
				nome : nome,
				quantidadeDias : nrdias,
				regraAtiva : false,
				dataAlteracao: new Date(),
				usuario : {
					nome : controller.usuarioLogado
				}
			}
			$http({
				method : 'GET',
				url : controller.restUrl + '/' + idParametro + '?statusParametro=T',
			}).success(function(response) {
				controller.Parametros = response;
				if (controller.Parametros[0].fundos == null) {
					parametroWriteOfflService.updateParametro(controller.parametro).success(function(response) {
						controller.parametro = response;
						notify({
							message : 'Parâmetro foi inativado com sucesso.',
							classes : 'alert-success',
							position : 'right'
						});
						resetForm();
					}).error(function(msg) {
						notify({
							message : 'Falha ao Inativar Parâmetro. Verifique. - ' + msg,
							classes : 'alert-danger',
							position : 'right'
						});
					});
				} else {
					notify({
						message : 'Existe Fundo(s) Vinculado(s) a esse Parâmetro. Remova os vinculos e tente novamente.',
						classes : 'alert-danger',
						position : 'right'
					});
					resetForm();
				}
			}).error(function(response) {
				usSpinnerService.stop('spinner-1');
				notify({
					message : 'Falha ao buscar Parâmetro.',
					classes : 'alert-danger',
					position : 'right'
				});
			});
		});
	}

	function resetForm() {
		controller.Parametro = {};
		controller.inAtivo = "S";
		controller.codigoProWriteoff = "";
		controller.dsProWriteoff = "";
		buscarParametros();
	}

	function paginador() {
		controller.itemsPerPage = 10;
		controller.maxSize = 10;
		controller.totalItems = controller.Parametros.length;
	}

	$(document).keypress(function(e) {
		if (e.which == 13)
			buscarParametros();
	});


}