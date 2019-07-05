angular.module('cadastro-central-module').controller('DadosBasicosFundosCtrl', DadosBasicosFundosCtrl);

DadosBasicosFundosCtrl.$inject = ['$modal','$scope','$stateParams','$timeout','$filter','$q','$state','notify',
	'usSpinnerService','autorizacaoService','fundoService','utilsService','papelService','dialogService','$rootScope'];

function DadosBasicosFundosCtrl($modal, $scope, $stateParams, $timeout, $filter, $q, $state, notify, 
		usSpinnerService, autorizacaoService, fundoService, utilsService, papelService, dialogService, $rootScope) {
	
	var controller = this;

	controller.mudarTab = mudarTab;
	controller.salvar = salvar;
	controller.validarData = validarData;
	controller.novoTipoFundos = novoTipoFundos;
	controller.permission = false;
	
	controller.acao = $stateParams.acao;
	controller.tab = $stateParams.tab;
	
	controller.tipoFundos =[];
	
	controller.subTipos =[
		{
		    id: '',
			dsSigla: 'Padronizado',
			dsSubTipo: '1'
		},
		{
		    id: '',
			dsSigla: 'Não Padronizado',
			dsSubTipo: '0'
		}
	]
	
	
	controller.pessoaFundo=	{
		id: '',
		codigo: '',
		ativo: '',
		subTipo: '',
		nomeReduzido: '',
		codCetip: '',
		codSelic: '',
		codGiin: '',
		dataSubscricaoInicial: new Date(),
		dataEncerramento: new Date(),
		tipoFundo: {
			id: '',
			dsSigla: '',
			dsTipoFundo: '',
		},
		pessoa: {
			id: '',
			tipoPessoa: 'J',
			tipoDeclaracao: '',
			nomeRazao: '',
			sexo: '',
			identificador: '',
			estadoCivil: '',
			dataCadastro: '',
			dataUltimaAtualizacao: '',
			dataNascConstituicao: '',
			dataInicioRelacionamento: '',
			dataFimRelacionamento: '',
			formaConstituicao: '',
			ativo: '',
			estrangeiro: '',
			statusCadastro: '',
			site: '',
			pais: '',
			estado: '',
			cidade: '',
			papeis: [
			  {
				id: '',
				descricao: '',
				nivelRelacionamento: '',
				tipoCadastro: '',
			  }
			],
			nomeFantasia: '',
			loaded: '',
		}
	}
	
	// Objeto utilizado para armazenar possíveis erros
	// ao concluir o cadastro da pessoa
	controller.abas = {
		documentos : { erros : [] },
		infFinanceiras : { erros : [] },
		dadosPessoais : { erros : [] },
		dadosBancarios : { erros : [] },
		filiacaoConjuge : { erros : [] },
		enderecos : { erros : [] },
		contatos : { erros : [] },
		afirmacoes : { erros : [] }
	};

	if($stateParams.abas) {
		controller.abas = $stateParams.abas;
		controller.pessoa = $stateParams.pessoa;
	}

	function mudarTab(numero){
		controller.tab = numero;
	}
	
	var promises = []; // Todos os serviços que devem ser chamados antes de
						// iniciar o carregamento e funcionamento da tela

	if($stateParams.identificador) {
		promises.push($q(function (resolve) {
			fundoService.findPessoaFundoByIdentificador($stateParams.identificador).then(function (response) {
				controller.pessoaFundo = response.data;
				controller.pessoaFundo.dataSubscricaoInicial = moment(controller.pessoaFundo.dataSubscricaoInicial, 'DD/MM/YYYY')._i;
				controller.pessoaFundo.dataEncerramento = moment(controller.pessoaFundo.dataEncerramento, 'DD/MM/YYYY')._i;
			}).finally(function () {
				resolve();
			});
		}));
	}
	
	autorizacaoService.checkPermission('incluir-tipo-fundo').success(function(data){
		controller.permission = true;
	});
	
	fundoService.pesquisarTipoFundos().then(function (response) {
				controller.tipoFundos = response.data;
		}).finally(function () {
				resolve();
	});

	function salvar(){
		if(validarNomeRazao() && validarNomeReduzido()){
			fundoService.inserirAtualizarPessoaFundo(controller.pessoaFundo).success(function(data){
				if(data.pessoa.identificador
					&& data.pessoa.nomeRazao
					&& data.nomeReduzido
					&& data.codigo
					&& data.ativo
					&& data.dataSubscricaoInicial
					&& data.dataEncerramento) {
					$scope.fundoCtrl.abas.dadosBasicosFundos.erros = {};
				}
				$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
			});
		}
	}
	
	function novoTipoFundos(){
	
		$modal.open({
			size:'md',
			backdropClass:'backdrop',
			backdrop:'static',
			windowClass:'smartmodal',
			animation:true,
			templateUrl:'app/views/fundo/cadastro-modalTipoFundos.html',
			controller:'ModalTipoFundosCtrl',
			controllerAs:'modalTipoFundosCtrl'
				
		}).result.then(function(tipoFundos){
			carregarTiposFundos();
		},function(){
			carregarTiposFundos();
		});
	}
	
	function carregarTiposFundos(){
		fundoService.pesquisarTipoFundos().then(function (response) {
			controller.tipoFundos = response.data;
		}).finally(function () {
			resolve();
		});
	}
	
	function isValidData(data) {
		try {
			var patternData = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
			if (patternData.test(data)) {
				return true;
			} else {
				var dataFormatada = $filter('date')(data, 'dd/MM/yyyy');
				if (patternData.test(dataFormatada)) {
					return true;
				} else {
					return false;
				}
			}
		} catch (err) {
			return false;
		}
	}
	
	function validarData(tipo){
		
		// <-------------------Variáveis------------------->
		var dataSubscricaoInicial = false;
		var dataEncerramento = false;
		var dataSubscricaoInicialDate = new Date();
		var dataEncerramentoDate = new Date();
		// <-------------------Variáveis------------------->
		
		// <-------------------Verificando se datas estão válidas------------------->
		if (isValidData(angular.copy(controller.pessoaFundo.dataSubscricaoInicial))) {
			dataSubscricaoInicial = true;
		} else {
			if (isValidData(new Date(angular.copy(controller.pessoaFundo.dataSubscricaoInicial)))) {
				dataSubscricaoInicial = true;
			} else {
				dataSubscricaoInicial = false;
			}
		}
		
		if (isValidData(angular.copy(controller.pessoaFundo.dataEncerramento))) {
			dataEncerramento = true;
		} else {
			if (isValidData(new Date(angular.copy(controller.pessoaFundo.dataEncerramento)))) {
				dataEncerramento = true;
			} else {
				dataEncerramento = false;
			}
		}
		// <-------------------Verificando se datas estão válidas------------------->
		
		// <-------------------Validação de regra de negócio de datas------------------->
		if (dataSubscricaoInicial && dataEncerramento) {
			
			var dataInicial = angular.copy(controller.pessoaFundo.dataSubscricaoInicial);
			var encerramento = angular.copy(controller.pessoaFundo.dataEncerramento);
			
			if (dataInicial instanceof Date) {
				var dataInicial = formataData(dataInicial);
			}
			
			if (encerramento instanceof Date) {
				var encerramento = formataData(encerramento);
			}
			
			var datasInicial = dataInicial.split('/');
			var datasEncerramento = encerramento.split('/');
			
			dataInicial = new Date(datasInicial[2], datasInicial[1] -1, datasInicial[0]);
			datasEncerramento = new Date(datasEncerramento[2], datasEncerramento[1] -1, datasEncerramento[0]);
			
			if (dataInicial > datasEncerramento) {
				if (tipo == 'dataSubscricaoInicial') {
					notify({message:'A data de subscrição inicial deve ser menor que a data de encerramento.', classes:'alert-danger',position:'right'});
					controller.pessoaFundo.dataSubscricaoInicial = '';
					return;
				} else if (tipo == 'dataEncerramento') {
					notify({message:'A data de encerramento deve ser maior que a data de subscrição inicial.', classes:'alert-danger',position:'right'});
					controller.pessoaFundo.dataEncerramento = '';
					return;
				}
			} else {
				salvar();
			}
		} else {
			salvar();
		}
		// <-------------------Validação de regra de negócio de datas------------------->
		
	}
	
	function formataData(data){
	    //var data = new Date();
	    var dia = data.getDate();
	    if (dia.toString().length == 1)
	      dia = "0"+dia;
	    var mes = data.getMonth()+1;
	    if (mes.toString().length == 1)
	      mes = "0"+mes;
	    var ano = data.getFullYear();  
	    return dia+"/"+mes+"/"+ano;
	}
	
	function validarNomeReduzido(){
		if (controller.pessoaFundo.nomeReduzido == undefined || controller.pessoaFundo.nomeReduzido.length > 5) {
			notify({message:'O nome reduzido do fundo deve possuir cinco caractéres para ser válido.', classes:'alert-danger',position:'right'});
			return false;
		} else {
			return true;
		}
	}
	
	function validarNomeRazao(){
		if (controller.pessoaFundo.pessoa.nomeRazao == undefined) {
			notify({message:'A Razão Social é obrigatório ', classes:'alert-danger',position:'right'});
			return false;
		} else {
			return true;
		}
	}
		
	$timeout(function(){
		
		if($scope.fundoCtrl.abas.dadosBasicosFundos.erros.length){
			
			controller.form.$submitted = true;
			
			$scope.fundoCtrl.abas.dadosBasicosFundos.erros.filter(function(erro){
				return erro.campo; 
			}).forEach(function(erro){
				controller.form[erro.campo].$setValidity('required',false);
				angular.element('[name=' + erro.campo + ']').attr('tooltip',erro.mensagem);
				$timeout(function(){
					angular.element('[name=' + erro.campo + ']').trigger('mouseover');
				});
			});
		}		
	});
}