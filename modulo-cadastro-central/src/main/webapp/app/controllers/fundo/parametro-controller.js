angular.module('cadastro-central-module').controller('ParametroCtrl', ParametroCtrl);

ParametroCtrl.$inject = [ '$scope', '$http', '$stateParams', '$timeout', '$filter', '$q', '$state', 'PATHCONFIG', 'notify', 'usSpinnerService', 'parametroWriteOfflService', 'dialogService', 'usuarioService' ];

function ParametroCtrl($scope, $http, $stateParams, $timeout, $filter, $q, $state, PATHCONFIG, notify, usSpinnerService, parametroWriteOfflService, dialogService, usuarioService) {
	var controller = this;
	controller.restUrl = PATHCONFIG.PORTAL_API_FUNDO_PARAMETRO;
	controller.usuarioLogado = 'PETRA';
	controller.mudarParaEdicao = mudarParaEdicao;
	controller.dsProWriteoff = '';
	controller.nrDias = '';
	controller.parametro = {
		nome : '',
		quantidadeDias : '',
		regraAtiva : true,
		usuario : {
			nome : ''
		}
	};
	controller.incluir = incluir;
	controller.cadastrarParametroFundo = cadastrarParametroFundo;
	// I - incluir, V - Visualizar, E - Editar
	controller.acao = $stateParams.acao;
	controller.tab = $stateParams.tab;
	var promises = [];
	if ($stateParams.identificador) {
		promises.push($q(function(resolve) {
			parametroWriteOfflService.findAllById($stateParams.identificador).then(function(response) {
				controller.parametro = response.data;
				controller.codigo = controller.parametro[0].codigo;
				controller.idProWriteoff = controller.parametro[0].idParametro;
				controller.dsProWriteoff = controller.parametro[0].nome;
				controller.nrDias = controller.parametro[0].quantidadeDias;
				controller.old = {
						dsProWriteoff : controller.parametro[0].nome,
						nrDias : controller.parametro[0].quantidadeDias
				};
			}).finally(function() {
				reload : true
			});
		}));
	}

	function incluir(isInserir) {
		if (controller.dsProWriteoff.length == 0) {
			notify({
				message : 'Informar o nome (Campo Obrigatório).',
				classes : 'alert-danger',
				position : 'right'
			});
			return;
		}
		if (controller.nrDias.length == 0) {
			notify({
				message : 'Informar a quantidade de dias (Campo Obrigatório).',
				classes : 'alert-danger',
				position : 'right'
			});
			return;
		}
		if (isInserir == "inserir"){
			cadastrarParametroFundo();
		} else {
			cadastrarParametroFundo().then(function(){
			controller.parametro = {
					idParametro : controller.idProWriteoff,
					codigo: controller.codigo,
					nome : controller.dsProWriteoff,
					quantidadeDias : controller.nrDias,
					regraAtiva : true,
					usuario : {
						nome : controller.usuarioLogado
					}
			}
			parametroWriteOfflService.updateParametro(controller.parametro).then(function(){
				mudarParaPesquisa();
			});
			});
		}
	}
	
	function cadastrarParametroFundo() {
		return $q(function(resolve, reject){
			if (controller.acao == "I") {
				controller.parametro = {
					codigo: controller.codigo,
					nome : controller.dsProWriteoff,
					quantidadeDias : controller.nrDias,
					regraAtiva : true,
					usuario : {
						nome : controller.usuarioLogado
					}
				}
			} else if (controller.acao == "E") {
				controller.parametro = {
					idParametro : null,
					codigo: controller.codigo,
					diasCorridos : true,
					isRegraAtiva : false,
					nome : controller.old.dsProWriteoff,
					quantidadeDias : controller.old.nrDias,
					dataAlteracao: new Date(),
					regraAtiva : false,
					usuario : {
						nome : controller.usuarioLogado
					}
				}
			} else if (controller.acao == "X") {
				controller.parametro = {
					idParametro : controller.idProWriteoff,
					regraAtiva : false,
					dataAlteracao: new Date(),
					usuario : {
						nome : controller.usuarioLogado
					}
				}
			}
	
			//Validar se Nome da Regra ou Numero de dias Já Existe
	
			$http({
				method : 'GET',
				url : controller.restUrl + '?statusParametro=T&nomeParametro=' + controller.dsProWriteoff + '&quantidadeDias=' + controller.nrDias
			}).success(function(response) {
				controller.Parametros = response;
	
				if (controller.Parametros.length == 0) {
					controller.bloquearBotaoIncluir = true;
					parametroWriteOfflService.insertParametro(controller.parametro)
						.success(function(response) {
							controller.bloquearBotaoIncluir = false;
							controller.parametro = response;
							notify({
								message : 'O cadastro do Parâmetro foi concluído com sucesso.',
								classes : 'alert-success',
								position : 'right'
							});
							if(controller.acao == "I"){
								mudarParaPesquisa();
							}
							resolve();
					}).error(function(msg) {
						notify({
							message : 'Falha ao Cadastrar Parâmetro. Verifique! - ' + msg,
							classes : 'alert-danger',
							position : 'right'
						});
						reject();
					});
				} else {
					controller.parametro.idProWriteoff = controller.Parametros[0].id;
					dialogService.show('Editar', 'Parâmetro já cadastrado. Deseja alterar para a tela de parametro do fundo?', 'Sim', 'Não').result.then(function() {
						mudarParaPesquisa();
						resolve();
					});
				}
			}).error(function(response) {
				usSpinnerService.stop('spinner-1');
				notify({
					message : 'Falha ao Cadastrar Parâmetros. Verifique.',
					classes : 'alert-danger',
					position : 'right'
				});
				reject();
			});
		});
	}

	function mudarParaEdicao() {
		$state.go("parametro.editar", {
			'identificador' : controller.parametro.idProWriteoff,
			'acao' : 'E'
		}, {
			reload : true
		});
	}

	function mudarParaPesquisa() {
		$state.go("cadastro-parametro-writeoff", {
			reload : true
		});
	}

	function getUsuarioLogado(){
		usuarioService.getUsuarioLogado()
		.success(function(response){
			controller.usuarioLogado = response;
		})
		.error(function(response){
			controller.usuarioLogado = 'PETRA';
		});
	}
	
	getUsuarioLogado();
}