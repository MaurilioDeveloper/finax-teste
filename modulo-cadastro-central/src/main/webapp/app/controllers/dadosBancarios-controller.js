angular.module('cadastro-central-module').controller('DadosBancariosCtrl', DadosBancariosCtrl);

DadosBancariosCtrl.$inject = ['$scope','$http','$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService','dialogService','pessoaService','bancoService','agenciaService','tipoService'];

function DadosBancariosCtrl($scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService,dialogService,pessoaService,bancoService,agenciaService,tipoService) {
	
	var controller = this;
	
	controller.incluir = incluir;
	controller.editar = editar;
	controller.excluir = excluir;
	controller.validaTelefone = validaTelefone;
	controller.aoSelecionarBanco = aoSelecionarBanco;
	controller.aoSelecionarAgencia = aoSelecionarAgencia;
	controller.validaAgencia = validaAgencia;
	controller.validarTipoConta = validarTipoConta;
	controller.incluirTipoConta = incluirTipoConta;
	controller.excluirTipoConta = excluirTipoConta;
	
	/**
	 * Objeto que será utilizado para preenchimento
	 * dos dados da tela.
	 */
	controller.dadosBancario = {
		preferenciaLiquidacao:'S',
		pais:'Brasil'
	};
	
	//Combo 'Tipo Conta'
	controller.tiposConta = [];
	
	//Combo 'Modelo Conta'
	controller.modelosConta = ['Conjunta','Individual']; 
	
	controller.bancos = [];
	controller.agencias = [];
	
	controller.dadosBancarios = [];
	
	carregaDadosBancarios();
	
	bancoService.findAll().success(function(bancos){
		controller.bancos = bancos;
	});
	
	function carregarTiposConta(){
		tipoService.getTipoContas().success(function(tipoContas){
			controller.tiposConta = angular.copy(tipoContas);
			controller.allContasModal = angular.copy(tipoContas);
			newOption = {id:"new", dsTipoConta:"Novo Tipo de Conta"};
			controller.tiposConta.unshift(newOption);
		});
	}
	
	carregarTiposConta();
	
	/**
	 * Cadastra na base de dados uma nova conta
	 * para a pessoa. 
	 */
	function incluir() {
		
		var contaPrefLiquid = preferenciaLiquidacaoExistente();
		
		if(controller.dadosBancario.preferenciaLiquidacao == 'S' 
			&& contaPrefLiquid
			&& contaPrefLiquid.id != controller.dadosBancario.id){
			dialogService.show('Aviso','Já existe uma conta de preferência de liquidação','OK');
		} else {
			
			controller.dadosBancario.pessoa = $scope.pessoaCtrl.pessoa;
			
			pessoaService.insertPessoaDadosBancario(controller.dadosBancario).success(function(){
				carregaDadosBancarios();
				controller.dadosBancario = {
						preferenciaLiquidacao:'N',
						pais:'Brasil'
				};
				$scope.pessoaCtrl.abas.dadosBancarios.erros = [];
			});
			
		}
		
		
	}
	
	/**
	 * Carrega uma conta para a área de edição/inclusão.
	 * 
	 * @param dadosBancario a conta a ser editada
	 */
	function editar(dadosBancario) {
		
		controller.dadosBancario = angular.copy(dadosBancario);
		
		/*if(!controller.dadosBancario.agencia)
			controller.dadosBancario.agencia = controller.dadosBancario.idAgencia;
		
		if(!controller.dadosBancario.banco) {
			controller.dadosBancario.banco = controller.dadosBancario.idBanco;			
		}
		
		agenciaService.findAllByBancoId(controller.dadosBancario.idBanco).success(function(agencias){
			controller.agencias = agencias;
		});*/
		
		agenciaService.findAllByBancoId(controller.dadosBancario.idBanco).success(function(agencias){
			controller.agencias = agencias;
		});
		
		controller.dadosBancario.agencia = controller.dadosBancario.idAgencia;
		
		controller.dadosBancario.telefoneContatoGerente = controller.dadosBancario.telefoneContatoGerente ? controller.dadosBancario.telefoneContatoGerente.toString() : controller.dadosBancario.telefoneContatoGerente;
		
		
	}
	
	/**
	 * Exclui uma conta.
	 * 
	 * @param idDadosBancario o id da conta
	 */
	function excluir(dadoBancario) {
		
		dialogService.show('Excluir','Deseja excluir a conta ' + dadoBancario.numeroConta + '?','Sim','Não').result.then(function(){
			
			pessoaService.excluirPessoaDadosBancario(dadoBancario.id).success(function(){
				carregaDadosBancarios();
				controller.dadosBancario = {
					pais:'Brasil'
				};
			});
			
		});
		
	}
	
	/**
	 * 	Busca os dados bancários da pessoa.
	 */
	function carregaDadosBancarios() {
		
		pessoaService.findPessoaDadosBancarios($scope.pessoaCtrl.pessoa.id).success(function(dadosBancarios){
			controller.dadosBancarios = dadosBancarios;
			
			if(preferenciaLiquidacaoExistente()){
				controller.dadosBancario.preferenciaLiquidacao='N';
			} else {
				controller.dadosBancario.preferenciaLiquidacao='S';
			}
			
		});
		
	}
	
	/**
	 * Verifica se já existe uma conta com preferência de liquidação.
	 */
	function preferenciaLiquidacaoExistente() {
		
		return controller.dadosBancarios.find(function(dadosBancario){
			return dadosBancario.preferenciaLiquidacao == 'S';
		});
		
	}
	
	/**
	 * Valida o telefone.
	 */
	function validaTelefone(){
		if(controller.dadosBancario.telefoneContatoGerente.toString().length > 0 
				&& controller.dadosBancario.telefoneContatoGerente.toString().length < 10){
			notify({message:'O telefone do gerente é inválido!', classes:'alert-danger',position:'right'});
			controller.dadosBancario.telefoneContatoGerente = '';
		}
	}
	
	/**
	 * Ao selecionar um banco.
	 */
	function aoSelecionarBanco(item,model) {
//		controller.agencias = [];
//		controller.dadosBancario.agencia = undefined;
		if(model.id) {
			controller.dadosBancario.idBanco = model.id;			
//			usSpinnerService.spin('spinner-1');
//			agenciaService.findAllByBancoId(model.id).success(function(agencias){
//				controller.agencias = agencias;
//				usSpinnerService.stop('spinner-1');
//			});
		} else {
			controller.dadosBancario.idBanco = model;
		}
		validaAgencia();
	}
	
	/**
	 * Ao selecionar uma agencia.
	 */
	function aoSelecionarAgencia(item,model) {
		console.log(controller.agencias);
		if(model.id){
			controller.dadosBancario.idAgencia = model.id.codAgencia;
		} else {
			controller.dadosBancario.idAgencia = model;
		}
	}
	
	function validaAgencia(){
		if(controller.dadosBancario.banco != null && controller.dadosBancario.banco.id.length > 0 && controller.dadosBancario.agencia != null && controller.dadosBancario.agencia.length > 0){
			usSpinnerService.spin('spinner-1');
			agenciaService.findByBancoAndAgencia(controller.dadosBancario.banco.id, controller.dadosBancario.agencia).success(function(agencia){
				if(agencia.id == null){
					notify({message:'O número da agência é inválido!', classes:'alert-danger',position:'right'});
					controller.dadosBancario.agencia = '';
				} else {
					controller.dadosBancario.idAgencia = agencia.id.codAgencia;
				}
				usSpinnerService.stop('spinner-1');
			});
		}
	}
	
	function validarTipoConta(){
		controller.tipoConta = {}
		if(controller.dadosBancario.tipoConta.id  == "new"){
			$timeout(function(){
				controller.dadosBancario.tipoConta = null;
				angular.element("#modalTipoConta").modal("show");					
			},250);
		}
	}
	
	function incluirTipoConta(){
		
		var tipoConta = angular.copy(controller.tipoConta);
		
		tipoService.insertTipoConta(tipoConta).success(function(tipoConta){
			if( angular.isObject(tipoConta)){
				carregarTiposConta();
				$timeout(function(){
					angular.element("#modalTipoConta").modal("hide");	
					controller.tipoConta.dsTipoConta = null;
				},250);
			}else{
				notify({message:'Tipo de conta já cadastrada!', classes:'alert-danger',position:'right'});
				controller.tipoConta.dsTipoConta = null;
			}	
		});
	}
	
	function excluirTipoConta(tipoConta){
		
		dialogService.show('Excluir','Deseja excluir o tipo de conta ' + tipoConta.dsTipoConta + '?','Sim','Não').result.then(function(){
			
			tipoService.excluirConta(tipoConta.id).success(function(){
				carregarTiposConta();
			}).error(function(){
				notify({message:'Esse tipo de conta possui vínculo com outro registro e por isso não poderá ser excluído!!', classes:'alert-danger',position:'right'});
			});
			
		});
		
	}
}