angular.module('cadastro-central-module').controller('DadosBancariosFundosCtrl', DadosBancariosFundosCtrl);

DadosBancariosFundosCtrl.$inject = ['$modal','$stateParams','$scope','$http','$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService','dialogService','fundoService','bancoService','agenciaService','tipoTituloFundoService','fundoService'];

function DadosBancariosFundosCtrl($modal,$stateParams,$scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService,dialogService,fundoService,bancoService,agenciaService,tipoTituloFundoService,fundoService) {

	
	var controller = this;
	
	controller.salvar = salvar;
	controller.excluir = excluir;
	controller.editar = editar;
	controller.cancelar = cancelar;
	controller.atualizar = atualizar;
	controller.abrirModalDescricao = abrirModalDescricao;
	controller.abrirModalBoleto = abrirModalBoleto;
	controller.abrirModalContaVirtual = abrirModalContaVirtual;
	controller.aoSelecionarBanco = aoSelecionarBanco;
	controller.habilitarBtnIncluir = habilitarBtnIncluir;
	controller.validarContaVirtual = validarContaVirtual;
	controller.disable = true;
	controller.contaCorrenteFundo={};
	controller.pessoaFundo={};
	controller.especieTitulo=null;
	controller.banco;
	controller.emEdicao;
	controller.bancoDr;
	controller.bancoRf;
	controller.salvarPessoaFundo = salvarPessoaFundo;
	
	controller.especieTitulos=[];	
	controller.dadosBancario=[];
	controller.bancos=[];
	controller.bancosDr=[];
	controller.bancosRf=[];
	controller.contasCorrenteFundos=[];
	controller.contasListadas=[];
	controller.cotasListadasAux=[];
	
	listarEspecieTitulos();
	
	controller.contaCorrenteFundo = { 
			informacaoCarteira : {

			},
			inContaVirtual : 0,
			possuiContaDestinoDePara : 0,
			pagamentoAutomatizado : 0
	}
	
	usSpinnerService.spin('spinner-1');
	fundoService.findPessoaFundoByIdentificador($stateParams.identificador).then(function(response){
		controller.pessoaFundo = response.data;
		controller.bancoDr = response.data.idBancoCustodiaDr;
		controller.bancoRf = response.data.idBancoCustodiaRf;
		carregarListaDadosBancarios();
		

	}).finally(function () {
		usSpinnerService.stop('spinner-1');
    });
	
//	carregarBancos();
	
	function listarEspecieTitulos(){
		tipoTituloFundoService.listarEspecieTitulos().then(function(response){
			controller.especieTitulos = response.data;
		});
	}
	
	
	
	function carregarListaDadosBancarios(){
		fundoService.findDadosBancario(controller.pessoaFundo.id).then(function (response){
			controller.contasCorrenteFundos = response.data;
			carregarBancos();
		});
		
		
	}
	
	
	function carregarBancos(){
		bancoService.findAll().success(function(bancos){
			controller.bancos = angular.copy(bancos);
			controller.bancosDr = angular.copy(bancos);
			controller.bancosRf = angular.copy(bancos);
			
			listaBancoDr();
			listaBancoRf();
			buscaDescBancoNaListaBancos();
		});
	}
	
	function buscaDescBancoNaListaBancos(){
		for (var j = 0; j <  controller.contasCorrenteFundos.length; ++j) { 
			for (var i = 0; i <  controller.bancos.length; ++i) {
				if (controller.contasCorrenteFundos[j].idBanco == controller.bancos[i].id ) {
					controller.contasCorrenteFundos[j].nome = controller.bancos[i].nome;
				}
			}
		}
	}
	
	
	function listaBancoDr(){
		
		for (var i = 0; i <  controller.bancosDr.length; ++i) {
			if (controller.bancoDr == controller.bancosDr[i].id ) {
				controller.bancoDr = controller.bancosDr[i];
			}
		}
		
	}
	
	function listaBancoRf(){
		for (var i = 0; i <  controller.bancosRf.length; ++i) {
			if (controller.bancoRf == controller.bancosRf[i].id ) {
				controller.bancoRf = controller.bancosRf[i];
			}
		}
	}
	
	/**
	 * Ao selecionar um banco.
	 */
	function aoSelecionarBanco(item,model) {
		if(model.id) {
			controller.contaCorrenteFundo.idBanco = model.id;
			controller.contaCorrenteFundo.banco = model;
		} else {
			controller.banco = null;
			controller.contaCorrenteFundo.idBanco = null;
			controller.contaCorrenteFundo.banco = null;
			controller.banco = null;
			controller.disable = true;
		}
		habilitarBtnIncluir();
	}
	
	function salvarPessoaFundo(){
		controller.pessoaFundo.idBancoCustodiaDr = controller.bancoDr != null ? controller.bancoDr.id : '';
		controller.pessoaFundo.idBancoCustodiaRf = controller.bancoRf != null ? controller.bancoRf.id : '';
		fundoService.inserirAtualizarPessoaFundo(controller.pessoaFundo);
	}
	
	function salvar(){
		if (controller.especieTitulo.tpTitulo != undefined) {
			controller.contaCorrenteFundo.tpTitulo = controller.especieTitulo.tpTitulo.trim();
			controller.contaCorrenteFundo.pessoaFundo = controller.pessoaFundo;
			controller.contaCorrenteFundo.pessoaFundo.idBancoCustodiaDr = controller.bancoDr != null ? controller.bancoDr.id : '';
			controller.contaCorrenteFundo.pessoaFundo.idBancoCustodiaRf = controller.bancoRf != null ? controller.bancoRf.id : '';
			fundoService.insertDadosBancarios(controller.contaCorrenteFundo).then(function (response){
				
				if(response.data.msg != null ){
					notify({message:response.data.msg, classes:'alert-danger',position:'right'});
					return false;
				}
				controller.disable = true;
				controller.banco = '';
				controller.contaCorrenteFundo = {};
				//controller.bancos = [];
				//controller.especieTitulos = [];
				carregarListaDadosBancarios();
				//carregarBancos();
				//listarEspecieTitulos();
				controller.especieTitulo = {};
				controller.contaCorrenteFundo = { 
					informacaoCarteira : {},
					inContaVirtual : 0,
					possuiContaDestinoDePara : 0,
					pagamentoAutomatizado : 0
				}
				$scope.fundoCtrl.abas.dadosBancariosFundos.erros.forEach(function(erro, index){
					if(!erro.campo){
						$scope.fundoCtrl.abas.dadosBancariosFundos.erros.splice(index, 1);
					}
				});
				
				$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
				
			});
		}
		$scope.formContaCorrente.$setUntouched();
		$scope.formContaCorrente.$setPristine();
	}
	
	function atualizar(){
		controller.contaCorrenteFundo.pessoaFundo.idBancoCustodiaDr = controller.bancoDr != null ? controller.bancoDr.id : '';
		controller.contaCorrenteFundo.pessoaFundo.idBancoCustodiaRf = controller.bancoRf != null ? controller.bancoRf.id : '';
		controller.contaCorrenteFundo.tpTitulo = controller.especieTitulo.tpTitulo.trim();
		fundoService.atualizarDadosBancarios(controller.contaCorrenteFundo).then(function (response){
			
			if(response.data.msg != null ){
				notify({message:response.data.msg, classes:'alert-danger',position:'right'});
				return false;
			}
			
			controller.contaCorrenteFundo = {};
			controller.bancos = [];
			controller.especieTitulos = [];
			controller.especieTitulo = null;
			controller.banco = null;
			carregarListaDadosBancarios();
			listarEspecieTitulos();
			controller.emEdicao = false;
			controller.disable = true;
			controller.contaCorrenteFundo = { 
				informacaoCarteira : {},
				inContaVirtual : 0,
				possuiContaDestinoDePara : 0,
				pagamentoAutomatizado : 0
			}
//			habilitarBtnIncluir();
			$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
		});
		$scope.formContaCorrente.$setPristine();
		$scope.formContaCorrente.$setUntouched();
	}
	
	function excluir(contaCorrenteFundo){
		for (var i = 0; i <  controller.bancos.length; ++i) {
			if (contaCorrenteFundo.idBanco == controller.bancos[i].id ) {
				contaCorrenteFundo.nome = controller.bancos[i].nome;
			}
		}
		if(!controller.emEdicao){
			
			var descricao = contaCorrenteFundo.dsContaCorrente != null ? contaCorrenteFundo.dsContaCorrente : ' - ';
			
			var str = "Espécie do título: "+ contaCorrenteFundo.tpTitulo +"  "
			+"Banco: "+contaCorrenteFundo.idBanco+" - " + contaCorrenteFundo.nome+"  "
			+"Agência: "+contaCorrenteFundo.nrAgencia+"  "
			+"Conta com o dígito verificador: "+contaCorrenteFundo.nrDigitoConta+"  "
			+"Descrição completa da conta: "+descricao;
		 
			dialogService.show('Excluir conta corrente', 
					str
					,'Sim','Não').result.then(function(){
				
						fundoService.exlcuirDadosBancarios(contaCorrenteFundo.id).then(function  (){
							notify({message:'Conta corrente excluída com sucesso.', classes:'alert-success',position:'right'});
							carregarListaDadosBancarios();
							$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
						});
				
			},
			function(){
				
			});
			
		}
		$scope.formContaCorrente.$setPristine();
		$scope.formContaCorrente.$setUntouched();
	}
	
	function abrirModalDescricao(contaCorrenteFundo){
		
		$modal.open({
			size:'md',
			backdropClass:'backdrop',
			backdrop:'static',
			windowClass:'smartmodal',
			animation:true,
			templateUrl:'app/views/fundo/modalDescDadosBancarioFundo.html',
			controller:'ModalDescDadosBacarioFundoCtrl',
			controllerAs:'modalDescDadosBacarioFundoCtrl',
			resolve:{
				contaCorrenteFundo: function (){
					return contaCorrenteFundo;
				}
			}
		});
	}
	
	function abrirModalBoleto(informacaoCarteira){
		
		$modal.open({
			size:'md',
			backdropClass:'backdrop',
			backdrop:'static',
			windowClass:'smartmodal',
			animation:true,
			templateUrl:'app/views/fundo/modalDescBoletoEmitido.html',
			controller:'ModalDescBoletoEmitidoCtrl',
			controllerAs:'modalDescBoletoEmitidoCtrl',
			resolve:{
				informacaoCarteira: function (){
					return informacaoCarteira;
				}
			}
		});
	}
	
	function abrirModalContaVirtual(contaCorrenteFundo){
		
		$modal.open({
			size:'md',
			backdropClass:'backdrop',
			backdrop:'static',
			windowClass:'smartmodal',
			animation:true,
			templateUrl:'app/views/fundo/modalDescContaVirtual.html',
			controller:'ModalDescContaVirtualCtrl',
			controllerAs:'modalDescContaVirtualCtrl',
			resolve:{
				contaCorrenteFundo: function (){
					return contaCorrenteFundo;
				}
			}
		});
	}
	
	function editar(contaCorrentePessoa){
		if(!controller.emEdicao){
			
			
			for (var i = 0; i <  controller.especieTitulos.length; ++i) {
				if (contaCorrentePessoa.tpTitulo == controller.especieTitulos[i].tpTitulo.trim() ) {
					controller.especieTitulo = controller.especieTitulos[i];
				}
			}
			
			for (var i = 0; i <  controller.bancos.length; ++i) {
				if (contaCorrentePessoa.idBanco == controller.bancos[i].id ) {
					controller.banco = controller.bancos[i]
				}
			}
			
			removeContaDaLista(contaCorrentePessoa);
			habilitarBtnIncluir();
		}
		$scope.formContaCorrente.$setPristine();
		$scope.formContaCorrente.$setUntouched();
	}

	
	function removeContaDaLista(contaCorrentePessoa) {
		
		controller.contasListadasAux = controller.contasCorrenteFundos;
		controller.emEdicao = true;
		
	    for (var i = 0; i <  controller.contasCorrenteFundos.length; ++i) {
	        if (contaCorrentePessoa == controller.contasCorrenteFundos[i] ) {
	          controller.contaCorrenteFundo = controller.contasCorrenteFundos[i];
	          controller.contasCorrenteFundos.splice(i, 1);
	          i = i - 1;
	          controller.contasCorrenteFundos
	          break;
	        }
	    }
	}
	
	function cancelar(){
		controller.contaCorrenteFundo = {
			inContaVirtual : 0,
			possuiContaDestinoDePara : 0,
			pagamentoAutomatizado : 0
		};
		controller.disable = true;
		controller.emEdicao = false;
		controller.bancos = [];
		controller.especieTitulos = [];
		controller.especieTitulo = null;
		controller.banco = null;
		carregarListaDadosBancarios();
		listarEspecieTitulos();
		$scope.formContaCorrente.$setPristine();
		$scope.formContaCorrente.$setUntouched();
	}
	
	function validarContaVirtual(inContaVirtual){
		controller.contaCorrenteFundo.inContaVirtual = inContaVirtual;
		
		controller.habilitarBtnIncluir();
	}
	
	// verify
	function habilitarBtnIncluir(){
		controller.disable = true;
		var contaVirtualValida = false;

		var contaCorrente = controller.contaCorrenteFundo;
		if(contaCorrente.inContaVirtual == 0
			|| (contaCorrente.inContaVirtual == 1 && contaCorrente.nrAgenciaVirtual && contaCorrente.nrContaVirtual && contaCorrente.nrDigitoContaVirtual)){
			contaVirtualValida = true;
		}

		if(controller.contaCorrenteFundo.nrAgencia != null && controller.contaCorrenteFundo.nrContaCorrente != null
				&& controller.contaCorrenteFundo.nrDigitoConta  != null && controller.contaCorrenteFundo.cdContaExterna != null
				&& controller.contaCorrenteFundo.inContaCobranca != null && controller.contaCorrenteFundo.inPagamentoCessao != null
				&& controller.contaCorrenteFundo.inPagamentoCessao  != null && controller.contaCorrenteFundo.vlDoc != null
				&& controller.contaCorrenteFundo.vlTed  != null && controller.contaCorrenteFundo.inAtivo  != null
				&& controller.especieTitulo != null && controller.especieTitulo.tpTitulo != null && controller.banco != null 
				&& controller.banco.id != undefined && controller.contaCorrenteFundo.inContaIsenta != null 
				&& contaVirtualValida){
			
			controller.disable = false;
		} 
	}
	
	controller.limpaContaDPara = () => {
		controller.contaCorrenteFundo.agenciaDePara = undefined
		controller.contaCorrenteFundo.contaCorrenteDePara = undefined
		controller.contaCorrenteFundo.digitoContaDePara = undefined
	}
	
}