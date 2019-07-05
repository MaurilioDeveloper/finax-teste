angular.module('cadastro-central-module').controller('ConsultaRelatorioCtrl',
		ConsultaRelatorioCtrl);

ConsultaRelatorioCtrl.$inject = [ '$scope', '$http', '$timeout', '$filter',
		'PATHCONFIG', '$q', '$state', 'notify', 'usSpinnerService',
		'pessoaService', 'utilsService', 'papelService', 'dialogService',
		'paisService', 'cidadeService', 'estadoService', 'bancoService',
		'nacionalidadeService', 'tipoService', 'formaConstituicaoService' ];

function ConsultaRelatorioCtrl($scope, $http, $timeout, $filter, PATHCONFIG,
		$q, $state, notify, usSpinnerService, pessoaService, utilsService,
		papelService, dialogService, paisService, cidadeService, estadoService,
		bancoService, nacionalidadeService, tipoService, formaConstituicaoService) {

	var controller = this;

	controller.aoSelecionarPais = aoSelecionarPais;
	controller.aoSelecionarEstado = aoSelecionarEstado;
	controller.changeDataFundacaoDe = changeDataFundacaoDe;
	controller.changeDataFundacaoAte = changeDataFundacaoAte;
	controller.resetForm = resetForm;
	controller.onError = onError;
	controller.moment = moment;

	controller.pessoas = [];
	controller.restUrl = PATHCONFIG.CADASTRO_CENTRAL;
	controller.filtro = {};
	controller.paises = [];
	controller.estados = [];
	controller.bancos = [];

	controller.invalidDate = false;
	controller.disableEstadoCidade = true;
	controller.isToShowMessage = true;

	carregaNacionalidades();
	
	formaConstituicaoService.findAll().success(function(formas) {
		controller.formaConstituicao = formas;
		newOption = {
			idFormaConstituicao : "",
			dsFormaConstituicao : "Todos"
		};
		controller.formaConstituicao.unshift(newOption);
	});

	paisService.findAll().success(function(paises) {
		controller.paises = paises;
		newOption = {
			id : "",
			nome : "Todos"
		};
		controller.paises.unshift(newOption);
	});

	bancoService.findAll().success(function(bancos) {
		controller.bancos = bancos;
		newOption = {
			id : "",
			nome : "Todos"
		};
		controller.bancos.unshift(newOption);
	});

	// Combo 'Tipo de Pessoa'
	controller.tipoPessoa = [ {
		id : ' ',
		descricao : 'Todos'
	}, {
		id : 'F',
		descricao : 'Física'
	}, {
		id : 'J',
		descricao : 'Jurídica'
	} ];

	// Combo 'Status'
	controller.status = [ {
		id : ' ',
		descricao : 'Todos'
	}, {
		id : '1',
		descricao : 'Ativo'
	}, {
		id : '0',
		descricao : 'Inativo'
	} ];

	// Combo 'FATCA'
	controller.fatca = [ {
		id : ' ',
		descricao : 'Todos'
	}, {
		id : 'S',
		descricao : 'Sim'
	}, {
		id : 'N',
		descricao : 'Não'
	} ];

	// Combo 'Porte da Empresa'
	controller.porteEmpresa = [ 
		{
			id : ' ',
			descricao : 'Todos'
		}, {
			id : 'Grande',
			descricao : 'Grande'
		}, {
			id : 'Média',
			descricao : 'Média'
		}, {
			id : 'Micro',
			descricao : 'Micro'
		}, {
			id : 'Pequena',
			descricao : 'Pequena'
		} 
	];

	// Combo 'Perfil do Investidor'
	controller.perfilInvestidor = [ {
		id : ' ',
		descricao : 'Todos'
	}, {
		id : 'Agressivo',
		descricao : 'Agressivo'
	}, {
		id : 'Conservador',
		descricao : 'Conservador'
	}, {
		id : 'Moderado',
		descricao : 'Moderado'
	} ];

	// Combo 'Declaração do Cliente'
	controller.declaracaoCliente = [ {
		id : ' ',
		descricao : 'Todas'
	}, {
		id : 'Qualificado',
		descricao : 'Qualificado'
	}, {
		id : 'Profissional',
		descricao : 'Profissional'
	} ];

	// Combo 'PEP/Relacionamento PEP'
	controller.pep = [ {
		id : ' ',
		descricao : 'Todos'
	}, {
		id : 'S',
		descricao : 'Sim'
	}, {
		id : 'N',
		descricao : 'Não'
	} ];

	// Combo 'Capital Social'
	controller.capitalSocial = [ {
		id : ' ',
		descricao : 'Todos'
	}, {
		id : 'S',
		descricao : 'Aberto'
	}, {
		id : 'N',
		descricao : 'Fechado'
	} ];

	// Combo 'Tipo de Conta'
	controller.tipoConta = [ {
		id : ' ',
		descricao : 'Todas'
	}, {
		id : 'Conta Corrente',
		descricao : 'Conta Corrente'
	}, {
		id : 'Conta Investimento',
		descricao : 'Conta Investimento'
	}, {
		id : 'Conta Poupança',
		descricao : 'Conta Poupança'
	} ];

	// Combo 'Modelo de Conta'
	controller.modeloConta = [ {
		id : ' ',
		descricao : 'Todas'
	}, {
		id : 'Conjunta',
		descricao : 'Conjunta'
	}, {
		id : 'Individual',
		descricao : 'Individual'
	} ];
	
	function resetForm(){
		controller.invalidDate = false;
		controller.filtro = undefined;
		controller.disableEstadoCidade = true;
		controller.pessoas = [];
		$scope.$broadcast('cleanDataTable');
	}

	/**
	 * Ao selecionar um país na combo de países.
	 * 
	 */
	function aoSelecionarPais(item, model) {

		controller.filtro.estado = undefined;
		controller.filtro.cidade = undefined;

		controller.disableEstadoCidade = false;

		if (item) {
			if (item.id == 'BR') {
				estadoService.findAllByPais(item.nome).success(
						function(estados) {
							controller.estados = estados;
							newOption = {
								id : "",
								nome : "Todos"
							};
							controller.estados.unshift(newOption);
						});
			} else if (item.id == '') {
				controller.disableEstadoCidade = true;
			}
		}

	}

	/**
	 * Ao selecionar um estado no combo de estados.
	 */
	function aoSelecionarEstado(item, model) {

		controller.filtro.cidade = undefined;

		if (item) {
			cidadeService.findAllByEstado(item.id).success(function(cidades) {
				controller.cidades = cidades;
				newOption = {
					id : "",
					nome : "Todas"
				};
				controller.cidades.unshift(newOption);
			});
		}

	}
	
	function onError(message){
		notify({
			message : message,
			classes : 'alert-danger',
			position : 'right'
		});
	}

	function changeDataFundacaoDe() {

		controller.invalidDate = false;
		
		if(controller.filtro && controller.filtro.dataNascFundacaoDe){
			var mDataFaturamentoMedioMensalDe = moment(
					controller.filtro.dataNascFundacaoDe, 'DD/MM/YYYY');
		}
		
		if(controller.filtro && controller.filtro.dataNascFundacaoAte){
			var mDataFaturamentoMedioMensalAte = moment(
					controller.filtro.dataNascFundacaoAte, 'DD/MM/YYYY');
		}
		
		if(mDataFaturamentoMedioMensalDe && mDataFaturamentoMedioMensalAte){
			if (mDataFaturamentoMedioMensalDe
					.isAfter(mDataFaturamentoMedioMensalAte)) {
				
				controller.invalidDate = true;
				
				if(controller.isToShowMessage){
					controller.isToShowMessage = false;
					notify({
						message : "A data Nascimento/Fundação 'Até' deve ser superior à Nascimento/Fundação 'De'!",
						classes : 'alert-danger',
						position : 'right'
					});
				}
				
			}else{
				controller.invalidDate = false;
				controller.isToShowMessage = true;
			}
		}
	}

	function changeDataFundacaoAte() {

		controller.invalidDate = false;
		
		if(controller.filtro && controller.filtro.dataNascFundacaoDe){
			var mDataFaturamentoMedioMensalDe = moment(
					controller.filtro.dataNascFundacaoDe, 'DD/MM/YYYY');
		}
		
		if(controller.filtro && controller.filtro.dataNascFundacaoAte){
			var mDataFaturamentoMedioMensalAte = moment(
					controller.filtro.dataNascFundacaoAte, 'DD/MM/YYYY');
		}

		if(mDataFaturamentoMedioMensalDe && mDataFaturamentoMedioMensalAte){
			if (mDataFaturamentoMedioMensalDe
					.isAfter(mDataFaturamentoMedioMensalAte)) {
				
				controller.invalidDate = true;
				
				if(controller.isToShowMessage){
					controller.isToShowMessage = false;
					notify({
						message : "A data Nascimento/Fundação 'Até' deve ser superior à Nascimento/Fundação 'De'!",
						classes : 'alert-danger',
						position : 'right'
					});
				}
			}else{
				controller.invalidDate = false;
				controller.isToShowMessage = true;
			}
		}
	}

	/**
	 * Carrega a tabela de documentos e os tipos de documentos.
	 */
	function carregaNacionalidades() {

		nacionalidadeService.findAll().then(function(retorno) {

			controller.nacionalidades = angular.copy(retorno.data);

			newOption = {
				id : "",
				descricao : "Todas"
			};
			controller.nacionalidades.unshift(newOption);

		});

	}

	papelService.findAll().success(function(papeis) {

		controller.papeis = papeis;

		newOption = {
			id : "",
			descricao : "Todos"
		};
		controller.papeis.unshift(newOption);
	});

	tipoService.getTipoEstadosCivis().success(function(retorno) {

		controller.estadoCivil = retorno;

		newOption = {
			id : "",
			nome : "Todos"
		};
		controller.estadoCivil.unshift(newOption);
	});
	
	angular.element('input[name=dataNascFundacaoAte]').on("input", function(e) {
		let string = angular.element(this).val();
		angular.element(this).val(string.substr(0,(string.length - 1)));
	});
	
	angular.element('input[name=dataNascFundacaoDe]').on("input", function(e,a,c) {
		let string = angular.element(this).val();
		angular.element(this).val(string.substr(0,(string.length - 1)));
	});

}