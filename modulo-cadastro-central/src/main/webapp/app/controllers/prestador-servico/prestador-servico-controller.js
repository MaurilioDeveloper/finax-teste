angular.module('cadastro-central-module').controller('PrestadorServicoCtrl', PrestadorServicoCtrl);

PrestadorServicoCtrl.$inject = ['$scope','$stateParams','$modal','$timeout','$filter','$q','$state','notify','usSpinnerService','pessoaService', 'pessoaContatoService', 'responsavelService', 'utilsService','papelService','dialogService','$rootScope', 'prestadorServicoService'];

function PrestadorServicoCtrl($scope,$stateParams,$modal,$timeout,$filter,$q,$state,notify,usSpinnerService,pessoaService, pessoaContatoService, responsavelService, utilsService,papelService,dialogService,$rootScope, prestadorServicoService) {
	
	var controller = this;

	controller.prestadorServico = {
		pessoa : {
			identificador: '',
			tipoPessoa : 'J',
			papeis : []
		}
	}
	
	controller.papel = {};
	controller.papeis = [];
	
	controller.mudarTab = mudarTab;
	controller.verificaPapelHabilitacaoPortalCedente = verificaPapelHabilitacaoPortalCedente;
	controller.incluir = incluir;
	controller.mudarParaEdicao = mudarParaEdicao;
	controller.aoClicarCPF = aoClicarCPF; 
	controller.aoClicarCNPJ = aoClicarCNPJ; 
	controller.buscaPessoa = buscaPessoa;
	controller.carregarPapelPrestadorServico = carregarPapelPrestadorServico;
	controller.novoPapelPrestadorServico = novoPapelPrestadorServico;
	controller.salvarPapelPrestadorServico = salvarPapelPrestadorServico;
	controller.deleteTipoPrestador = deleteTipoPrestador;
	controller.updateTipoPrestador = updateTipoPrestador;
	controller.tipoPrestadorSelecionado = null;
	controller.habilitarAcao = false;
	controller.excluir = excluir;
	controller.cancel = cancel;
	controller.limparCampo = limparCampo;
	controller.contatoExclusivoConsultora =  contatoExclusivoConsultora;
	controller.habilitaContatoExclusivo = false;
	controller.habilitaListaContatoExclusivo = false;
	controller.habilitarPortalCedente = habilitarPortalCedente;
	
	carregarPapelPrestadorServico();
	
	function carregarPapelPrestadorServico() {
		$q.all([prestadorServicoService.getPrestadorServicoByIdentificador($stateParams.identificador),
			papelService.findAllByTipoCadastro('PRESTADOR DE SERVICO')]
		).then(function(retornos){
			controller.tipoPrestadorSelecionado = null;
			controller.prestadorServico = retornos[0].data == '' ? controller.prestadorServico : retornos[0].data;	
			controller.papeis = retornos[1].data;
			controller.habilitarAcao = false;
			
			controller.papeis = controller.papeis.filter(function(papel) {
				return !controller.prestadorServico.pessoa.papeis.some(function(myPapel){
					if(!controller.habilitaListaContatoExclusivo)
						controller.habilitaListaContatoExclusivo = myPapel.descricao == 'CONSULTORA';
					
					return papel.descricao.toUpperCase() == myPapel.descricao;
				});
			});
			
			newOption = {id:"new", descricao:"NOVO TIPO DE PRESTADOR DE SERVIÇO"};
			controller.papeis.unshift(newOption);
		});
	}
	
	function novoPapelPrestadorServico(){
		
		if(controller.tipoPrestadorSelecionado.descricao == "NOVO TIPO DE PRESTADOR DE SERVIÇO"){
			$modal.open({
				size:'md',
				backdropClass:'backdrop',
				backdrop:'static',
				windowClass:'smartmodal',
				animation:true,
				templateUrl:'app/views/prestador-servico/modal-tipo-prestador-servico.html',
				controller:'ModalTipoPrestadorServicoCtrl',
				controllerAs:'modalTipoPrestadorServicoCtrl'
			}).result.then(function(papel){
				controller.tipoPrestadorSelecionado = papel;
				carregarPapelPrestadorServico();
			},function(){
				controller.tipoPrestadorSelecionado.descricao = "";
				controller.tipoPrestadorSelecionado = null;
				carregarPapelPrestadorServico();
			});
		}
	}
	
	function contatoExclusivoConsultora() {
		
		if(controller.tipoPrestadorSelecionado.descricao == "CONSULTORA"){
			controller.habilitaContatoExclusivo =  true;
		} else {
			controller.habilitaContatoExclusivo =  false;
		}
	}
	
	function limparCampo() {
		controller.prestadorServico.pessoa.nomeRazao = '';
	}
	
	function salvarPapelPrestadorServico(){
		
		controller.prestadorServico.pessoa.papeis.push(controller.tipoPrestadorSelecionado);
		controller.acaoTipo = 'I';
		controller.habilitarAcao = false;
		controller.habilitaContatoExclusivo = false;
		// carregarPapelPrestadorServico();
		
		var indice = controller.papeis.indexOf(controller.tipoPrestadorSelecionado);
		controller.papeis.splice(indice, 1);
		if(controller.tipoPrestadorSelecionado.descricao == 'CONSULTORA') {
			controller.habilitaListaContatoExclusivo = true;
		}
		
		controller.tipoPrestadorSelecionado = "";

	}
	
	function deleteTipoPrestador(papel){
		
		dialogService.show('Excluir', 'Deseja excluir o prestador de serviço ' + papel.descricao + '?','Sim','Não').result.then(function(){
			var listaPapeis = [];
			listaPapeis.push(papel);
			
			controller.prestadorServico.pessoa.papeis = controller.prestadorServico.pessoa.papeis.filter(function(papel) {
				return !listaPapeis.some(function(myPapel){
					return papel.descricao.toUpperCase() == myPapel.descricao;
				});
			});
			
			controller.tipoPrestadorSelecionado = null;
			carregarPapelPrestadorServico();
			controller.tipoPrestadorSelecionado = null;
			controller.prestadorServico.inContatoExclusivo = papel.descricao == "CONSULTORA" ? undefined : controller.prestadorServico.inContatoExclusivo;
			controller.habilitaListaContatoExclusivo = false;
		})
	}
	
	function updateTipoPrestador(papel){
		
		controller.tipoPrestadorSelecionado = papel;
		controller.acaoTipo = 'E';
		controller.habilitarAcao = true;
		controller.prestadorServicoAux = angular.copy(controller.prestadorServico);
		for (var i = 0; i < controller.prestadorServico.pessoa.papeis.length; ++i) {
			 if(controller.prestadorServico.pessoa.papeis[i].id == controller.tipoPrestadorSelecionado.id){
				 controller.prestadorServico.pessoa.papeis.splice(i, 1);
				 i = i-1
				 break;
			 }
		} 
	}
	
	function cancel(){
		$timeout(function(){
			controller.acaoTipo = 'I';
			controller.habilitarAcao = false;
			controller.prestadorServico =  angular.copy(controller.prestadorServicoAux);
			controller.tipoPrestadorSelecionado.id = null;
			controller.tipoPrestadorSelecionado.descricao = '';
			controller.tipoPrestadorSelecionado = '';
		});
	}
	
	/**
	 * Objeto utilizado para armazenar possíveis erros ao concluir o cadastro da
	 * pessoa
	 */
	controller.abas = {
		dadosBasicos : { erros : [] },
		infFinanceiras : { erros : [] },
		dadosPessoais : { erros : [] },
		dadosBancarios : { erros : [] },
		filiacaoConjuge : { erros : [] },
		enderecos : { erros : [] },
		contatos : { erros : [] },
        acessos : { erros : [] },
		afirmacoes : { erros : [] }
	};
	
	// Se houver abas e porque veio redirecionado do botão concluir
	if($stateParams.abas) {
		controller.abas = $stateParams.abas;
		controller.pessoa = $stateParams.pessoa;
	}
	
	if($stateParams.pessoaRelacionada){
		controller.pessoaRelacionada = $stateParams.pessoaRelacionada;
		controller.pessoa.tipoPessoa = $stateParams.tipoPessoa;
	}else{
		controller.pessoaRelacionada = false;
	}

	// I - incluir, V - Visualizar, E - Editar
	controller.acao = $stateParams.acao;
	controller.tab = $stateParams.tab;
	
	var _papeis = []; // Lista de todos os papeis da base de dados para evitar
						// ficar buscando a todo momento.
	var promises = []; // Todos os serviços que devem ser chamados antes de
						// iniciar o carregamento e funcionamento da tela

	promises.push($q(function (resolve) {
		papelService.findAll().success(function(papeis){
			_papeis = papeis.sort(function(papel1,papel2){
				return papel1.descricao > papel2.descricao;
			});
		}).finally(function () {
			resolve();
		});
	}));

	if($stateParams.identificador) {
		promises.push($q(function (resolve) {
			pessoaService.findByIdentificador($stateParams.identificador).then(function (pessoa) {
				controller.prestadorServico.pessoa = pessoa;
			}).finally(function () {
				resolve();
			});
		}));
	}

	function incluir() {
		
		controller.acaoTipo = 'I';
		if(!controller.prestadorServico.pessoa.identificador){
			if(controller.prestadorServico.pessoa.tipoPessoa == 'F'){
				notify({message:'O campo TODO CPF é obrigatório', classes:'alert-danger',position:'right'});
				return;
			} else {
				notify({message:'O campo TODO CNPJ é obrigatório', classes:'alert-danger',position:'right'});
				return;
			}
		} else {
			if (controller.prestadorServico.pessoa.tipoPessoa == 'F') {
				if (!utilsService.validarCPF(controller.prestadorServico.pessoa.identificador.toString())) {
					notify({
						message: 'Número do documento CPF é inválido!',
						classes: 'alert-danger',
						position: 'right'
					});
					return;
				}
			} else {
				if (!utilsService.validarCNPJ(controller.prestadorServico.pessoa.identificador.toString())) {
					notify({
						message: 'Número do documento CNPJ é inválido!',
						classes: 'alert-danger',
						position: 'right'
					});
					return;
				}
			}
		}
		
		buscaPessoa().then(function(pessoa){
			if(!pessoa){
				if(!controller.prestadorServico.pessoa.nomeRazao){
					if(controller.prestadorServico.pessoa.tipoPessoa == 'F'){
						notify({message:'Informar o nome completo (Campo Obrigatório)!', classes:'alert-danger',position:'right'});
					} else {
						notify({message:'Informar a razão social (Campo Obrigatório)!', classes:'alert-danger',position:'right'});
					}
				} else {
					cadastrarNovaPessoa();
				}
			} 
		});

	}
	
	function buscaPessoa() {
		return $q(function(resolve,reject){
			if(controller.prestadorServico.pessoa.identificador){
				pessoaService.findByIdentificadorPessoa(controller.prestadorServico.pessoa.identificador).then(function(pessoa){
					if(pessoa) {
						prestadorServicoService.getPrestadorServicoByIdentificador(pessoa.identificador).then(function(retorno){
							
							if(retorno.data == '') {
								controller.newPrestador = {pessoa : {nomeFantasia : ''}};
								controller.newPrestador.pessoa =  pessoa;
								// controller.newPrestador.pessoa.nomeFantasia =
								// controller.prestadorServico.pessoa.nomeFantasia;
								controller.newPrestador.pessoa.papeis = controller.newPrestador.pessoa.papeis.concat(controller.prestadorServico.pessoa.papeis);
								prestadorServicoService.insertPessoaPrestadorServico(controller.newPrestador).then(function(prestador){
									reject();
									notify({message:'Prestador de Serviço cadastrado com sucesso.', classes:'alert-success',position:'right'});
									mudarParaEdicao();
									
								});
							}
							reject();
							notify({message:'CPF/CNPJ informado já está cadastrado', classes:'alert-success',position:'right'});
							mudarParaEdicao();
						});
					}else {
						resolve();
					}
					
				});
			}else{
				notify({message: 'O identificador é obrigatório!', classes:'alert-danger',position:'right'});
			}
		});
	}
	
	function cadastrarNovaPessoa() {
			
		prestadorServicoService.insertPessoaPrestadorServico(controller.prestadorServico).then(function(prestador){
			controller.prestadorServico= prestador.data;
			notify({message:'Prestador de Serviço cadastrado com sucesso.', classes:'alert-success',position:'right'});
			mudarParaEdicao();
		});
	}
	
	function mudarTab(numero){
		controller.tab = numero;
	}
	
	function mudarParaEdicao() {
		mudarTab(2);
		$state.go("prestador-servico.editar", {'identificador':controller.prestadorServico.pessoa.identificador, 'acao':'E', 'tab': '2'}, {reload: true});
	}
	
	
	function aoClicarCPF() {
		
		controller.prestadorServico.pessoa.tipoPessoa = 'F'; 
		controller.prestadorServico.pessoa.identificador = '';
		controller.prestadorServico.pessoa.nomeRazao = '';
		$timeout(function(){
			angular.element('#cpf').focus();			
		});
	}
	
	function aoClicarCNPJ() {	

		controller.prestadorServico.pessoa.tipoPessoa = 'J'; 
		controller.prestadorServico.pessoa.identificador = '';
		controller.prestadorServico.pessoa.nomeRazao = '';
		controller.prestadorServico.pessoa.estrangeiro = false;
		$timeout(function(){
			angular.element('#cnpj').focus();			
		});
	}
	
	function validaCnpj() {

		if (!controller.prestadorServico.pessoa.identificador
				|| controller.prestadorServico.pessoa.identificador == '') {
			return;
		}

		if (!utilsService
				.validarCNPJ(controller.prestadorServico.pessoa.identificador)) {
			notify({
				message : 'Número de documento CNPJ inválido',
				classes : 'alert-danger',
				position : 'right'
			});
		}
	}

	function validaCpf() {
		if (!controller.prestadorServico.pessoa.identificador
				|| controller.prestadorServico.pessoa.identificador == '') {
			return;
		}
		if (!utilsService
				.validarCPF(controller.prestadorServico.pessoa.identificador)) {
			notify({
				message : 'Número de documento CPF inválido',
				classes : 'alert-danger',
				position : 'right'
			});
		}
	}
	
	function excluir() {
		dialogService.show('Excluir','Deseja excluir o prestador de serviço ' + controller.prestadorServico.pessoa.nomeRazao +'?','Sim','Não').result.then(function(){
			prestadorServicoService.deletePrestadorServico(controller.prestadorServico.id).success(function() {
				$('#filterLink').click();
				notify({message:'O prestador de serviço foi excluído com sucesso!', classes:'alert-success',position:'right'});
				$state.go("cadastro-prestador-servico", {reload: true});
			}).error(function(){
				notify({message:'Esse prestador de serviços possui vínculo com um fundo e por isso não poderá ser excluído!', classes:'alert-danger',position:'right'});
			}); 
		});
	}
	
	function verificaPapelHabilitacaoPortalCedente(){
		if(controller.prestadorServico && controller.prestadorServico.pessoa && controller.prestadorServico.pessoa.papeis)
		{
			for(var i=0; i<controller.prestadorServico.pessoa.papeis.length; i++){
				var currentPapel = controller.prestadorServico.pessoa.papeis[i];
				if(currentPapel.descricao == "CONSULTORA" || currentPapel.descricao == "GESTOR"){
					return true;
				}
			}
		}
		
		return false;
	}
	
	function carregarResponsaveis() {
		var deferred = $q.defer();
		responsavelService.findAllByIdentificador(controller.prestadorServico.pessoa.identificador).then(function(responsaveis){
			deferred.resolve(responsaveis.data);
		}, function(){
			deferred.reject(null);
		});
		return deferred.promise;
	}
	
	function carregaEnderecos() {
		var deferred = $q.defer();
		pessoaService.findEnderecosByPessoaSemEnderecoFundo(controller.prestadorServico.pessoa.id).then(function(enderecos){
			deferred.resolve(enderecos.data);
		}, function(){
			deferred.reject(null);
		});
		return deferred.promise;
	}
	
	function carregarContatoPrestadorServico() {
		var deferred = $q.defer();
		pessoaContatoService.findAllContatoByIdentificador(controller.prestadorServico.pessoa.identificador).then(
			function(contatos){
				deferred.resolve(contatos.data);
		}, function(response){
			deferred.reject(null);
		});
		return deferred.promise;
	}
	
	function validateEmail(email) {
	    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(String(email).toLowerCase());
	}
		
	function habilitarPortalCedente()
	{		
		carregarContatoPrestadorServico().then(function(contatos){
		
			if(contatos && contatos.length>0)
			{
				var passMail = false;
				
				for(var e = 0; e<contatos.length; e++){
					if(validateEmail(contatos[e].email))
				    {
						passMail = true;
				    }
				}
				if(passMail)
				{
					carregarResponsaveis().then(function(responsaveis){
						if(responsaveis)
						{
							controller.prestadorServico.responsaveis = responsaveis;
						}
						carregaEnderecos().then(function(enderecos){
							if(enderecos){
								controller.prestadorServico.enderecos = enderecos;
							}
							dialogService.show('Habilitar','Deseja habilitar o prestador de serviço ' + controller.prestadorServico.pessoa.nomeRazao +' para o portal cedente?','Sim','Não').result.then(function(){
								prestadorServicoService.habilitarPortalCedente(controller.prestadorServico).then(function(prestador){
									notify({message:'Prestador de Serviço habilitado com sucesso.', classes:'alert-success',position:'right'});
								});
							});
						});
					});
				}
			}
			else{
				notify({message:'Prestador de Serviço não possui um e-mail válido.', classes:'alert-warning',position:'right'});
			}
		});
	}
}