angular.module('cadastro-central-module').controller('DadosBasicosCtrl', DadosBasicosCtrl);

DadosBasicosCtrl.$inject = ['$scope','$http','$timeout','$modal','$filter','PATHCONFIG','$q','$state','notify','usSpinnerService', '$stateParams', 'relacionadaService', 'pessoaService', 'tipoService', 'dialogService', 'paisService', 'estadoService','cidadeService','nacionalidadeService', 'prestadorServicoService', 'papelService'];

function DadosBasicosCtrl($scope,$http,$timeout,$modal, $filter,PATHCONFIG,$q,$state,notify, usSpinnerService, $stateParams, relacionadaService, pessoaService, tipoService, dialogService, paisService, estadoService,cidadeService,nacionalidadeService, prestadorServicoService, papelService) {
	
	var controller = this;
	
	controller.prestadorServico = {
		pessoa : {
			tipoPessoa : 'J',
			papeis : []
		}
	}
	
	var promises = [];
	
	controller.validaCpf = validaCpf;
	controller.validaCnpj = validaCnpj;
	controller.aoClicarCPF = aoClicarCPF;
	controller.aoClicarCNPJ = aoClicarCNPJ;
	
	controller.validarData = validarData;
	controller.salvar = salvar;
	
	controller.carregarPapelPrestadorServico = carregarPapelPrestadorServico;
	controller.novoPapelPrestadorServico = novoPapelPrestadorServico;
	controller.salvarPapelPrestadorServico = salvarPapelPrestadorServico;
	controller.deleteTipoPrestador = deleteTipoPrestador;
	controller.updateTipoPrestador = updateTipoPrestador;
	controller.cancel = cancel;
	controller.tipoPrestadorSelecionado = null;
	controller.habilitarAcao = false;
	controller.papeis = [];
	
	controller.contatoExclusivoConsultora =  contatoExclusivoConsultora;
	controller.habilitaContatoExclusivo = false;
	controller.habilitaListaContatoExclusivo = false;
	carregarPapelPrestadorServico();
	
	function carregarPapelPrestadorServico() {
		usSpinnerService.spin('spinner-1');
		$q.all([prestadorServicoService.getPrestadorServicoByIdentificador($stateParams.identificador),
			papelService.findAllByTipoCadastro('PRESTADOR DE SERVICO')]
		).then(function(retornos){
			controller.prestadorServico = retornos[0].data;
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
			controller.tipoPrestadorSelecionado = null;
			usSpinnerService.stop('spinner-1');
		});
	}
	
	function carregarPapelPrestadorServicoPromise() {
		usSpinnerService.spin('spinner-1');
		return $q.all([prestadorServicoService.getPrestadorServicoByIdentificador($stateParams.identificador),
			papelService.findAllByTipoCadastro('PRESTADOR DE SERVICO')]
		).then(function(retornos){
			controller.prestadorServico = retornos[0].data;
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
			controller.tipoPrestadorSelecionado = null;
			usSpinnerService.stop('spinner-1');
		});
	}
	
	function novoPapelPrestadorServico(){
		console.log(controller.tipoPrestadorSelecionado);
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
	
	
	/**
	 * VALIDAÇÕES
	 */
	
	function validarData(){
		
		console.log(controller.prestadorServico.dataAprovacao);
		var pastDate = moment(new Date()).subtract(120, 'years');
		if(controller.prestadorServico.dataAprovacao) {
			if(typeof controller.prestadorServico.dataAprovacao == "string"){
				controller.prestadorServico.dataAprovacao = moment(controller.prestadorServico.dataAprovacao, 'DD/MM/YYYY');
			}
			if(!(controller.prestadorServico.dataAprovacao >= pastDate && controller.prestadorServico.dataAprovacao <= new Date())){
				if(controller.prestadorServico.dataAprovacao > pastDate){
					notify({message:'A data de  aprovação do prestador não pode ser superior à data atual!', classes:'alert-danger',position:'right'});
					return;
				}
//				else{
//					notify({message:'A data de aprovação do prestador não pode ser superior a 120 anos!', classes:'alert-danger',position:'right'});
//				}
//				controller.prestadorServico.dataAprovacao = '';
			}
			else{
				if(controller.prestadorServico.dataAprovacao._i){
					controller.prestadorServico.dataAprovacao = controller.prestadorServico.dataAprovacao._i;
				}
			}
			salvar();
		}
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

	function aoClicarCPF() {
		controller.prestadorServico.pessoa.tipoPessoa = 'F';
		controller.prestadorServico.pessoa.identificador = '';
		$timeout(function() {
			angular.element('#cpf').focus();
		});
	}

	function aoClicarCNPJ() {
		controller.prestadorServico.pessoa.tipoPessoa = 'J';
		controller.prestadorServico.pessoa.identificador = '';
		$timeout(function() {
			angular.element('#cnpj').focus();
		});
	}
	
	function salvar(){
		console.log("Salvando..");
		prestadorServicoService.insertPessoaPrestadorServico(controller.prestadorServico).then(function(response){
			controller.prestadorServico.id = response.data.id;
		});
	}
	
	function salvarPapelPrestadorServico(){
		var prestadorToSave = angular.copy(controller.prestadorServico);
		prestadorToSave.pessoa.papeis.push(controller.tipoPrestadorSelecionado);
		prestadorServicoService.insertPessoaPrestadorServico(prestadorToSave).success(function(response){
			controller.tipoPrestadorSelecionado = null;
			controller.acao = 'I';
			controller.habilitaContatoExclusivo = false;
			carregarPapelPrestadorServico();
		});
	}
	
	function deleteTipoPrestador(papel){
		
		dialogService.show('Excluir', 'Deseja excluir o tipo de prestador de serviço ' + papel.descricao + '?','Sim','Não').result.then(function(){
			usSpinnerService.spin('spinner-1');
			
			var listaPapeis = [];
			listaPapeis.push(papel);
			controller.habilitaListaContatoExclusivo = false;
			
			relacionadaService.findAllPessoaRelacionadaByIdPapelAndIdPessoa(papel.id, controller.prestadorServico.pessoa.id).then(function(retorno){
				controller.pessoaRelacionada = retorno.data;
				if(controller.pessoaRelacionada.length > 0) {
					for(var i = 0; i < controller.pessoaRelacionada.length; i++) {
						console.log(controller.pessoaRelacionada[i].id.pessoaRelacionada.id + ' == ' + controller.prestadorServico.pessoa.id)
						if(controller.pessoaRelacionada[i].id.pessoaRelacionada.id == controller.prestadorServico.pessoa.id) {
							
							notify({message:'Esse tipo de prestador de serviço possui vínculo com um fundo e por isso não pode ser excluído!', classes:'alert-danger',position:'right'});
							carregarPapelPrestadorServico();
							return;
						}
					}
				} 

				controller.prestadorServico.pessoa.papeis = controller.prestadorServico.pessoa.papeis.filter(function(papel) {
					return !listaPapeis.some(function(myPapel){
						return papel.descricao.toUpperCase() == myPapel.descricao;
					});
				});
				
				controller.prestadorServico.inContatoExclusivo = papel.descricao == "CONSULTORA" ? undefined : controller.prestadorServico.inContatoExclusivo;
				
				prestadorServicoService.insertPessoaPrestadorServico(controller.prestadorServico).success(function(response){
					controller.tipoPrestadorSelecionado = null;
					controller.habilitaListaContatoExclusivo = false;
					usSpinnerService.stop('spinner-1');
					
					carregarPapelPrestadorServicoPromise().then(function(){
						notify({message:'Tipo de prestador de serviço excluido com sucesso!', classes:'alert-success',position:'right'});
					});
				});
			});
		})
	}
	
	function updateTipoPrestador(papel){
		
		controller.tipoPrestadorSelecionado = papel;
		controller.acao = 'E';
		controller.habilitarAcao = true;
		for (var i = 0; i < controller.prestadorServico.pessoa.papeis.length; ++i) {
			 if(controller.prestadorServico.pessoa.papeis[i].id == controller.tipoPrestadorSelecionado.id){
				 controller.prestadorServico.pessoa.papeis.splice(i, 1);
				 i = i-1
				 break;
			 }
		} 
		
	}
	

	function cancel() {
		$timeout(function() {
			controller.acao = 'I';
			controller.tipoPrestadorSelecionado = null;
			carregarPapelPrestadorServico();
		});
	}
	
}