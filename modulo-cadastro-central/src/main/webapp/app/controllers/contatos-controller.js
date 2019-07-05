angular.module('cadastro-central-module').controller('ContatosCtrl', ContatosCtrl);

ContatosCtrl.$inject = ['$scope','$stateParams','$http','$timeout','$filter','PATHCONFIG','$q','$state','notify','usSpinnerService','pessoaService', 'tipoService', 'dialogService', 'relacionadaService'];

function ContatosCtrl($scope,$stateParams,$http,$timeout,$filter,PATHCONFIG,$q,$state,notify, usSpinnerService,pessoaService, tipoService, dialogService, relacionadaService) {
	
	var controller = this;

	controller.pessoaContatoTelefones = [];
	controller.pessoaContatoEmails = [];
	controller.telefone = {};
	
	controller.telefoneCelular;
	controller.telefoneResidencial;
	controller.telefoneComercial;
	controller.openModal = openModal;
	
	controller.email = {};
	
	controller.incluirTelefone = incluirTelefone;
	controller.updateTelefone = updateTelefone;
	controller.deleteTelefone = deleteTelefone;
	controller.validaTelefone = validaTelefone;
	controller.cancelTelefone = cancelTelefone;
	
	controller.incluirEmail = incluirEmail;
	controller.updateEmail = updateEmail;
	controller.deleteEmail = deleteEmail;
	controller.validateEmail = validateEmail;
	controller.cancelEmail = cancelEmail;
	
	controller.salvarPessoa = salvarPessoa;
	
	controller.validarTipoEmail = validarTipoEmail;
	controller.incluirTipoEmail = incluirTipoEmail;
	controller.excluirTipoEmail = excluirTipoEmail;
	
	controller.buscarContatoExclusivo = buscarContatoExclusivo;
	buscarContatoExclusivo();
			
	tipoService.getTipoTelefones().success(function(data){
		controller.tipoTelefones = data;
	});
	
	function carregarTiposEmail(){
		tipoService.getTipoEmails().success(function(data){
			controller.tipoEmails = angular.copy(data);
			controller.allEmailsModal = angular.copy(data);
			newOption = {id:"new", dsTipoEmail:"Novo Tipo de E-mail"};
			controller.tipoEmails.unshift(newOption);
		});
	}
	
	carregarTiposEmail();
	
	function cancelEmail() {
		controller.email = {};
	}
	
	function cancelTelefone(){
		controller.telefone = {};
	}
	
	function inicializarTelefoneCelular(data){
		var telefonesCelulares = data.filter(function (telefone) {
		    return (telefone.tipoTelefone === 'Celular');
		});
		
		if (telefonesCelulares.length > 0){
			controller.telefoneCelular = telefonesCelulares[0];
		} else {
			controller.telefoneCelular = {tipoTelefone: 'Celular'};
		}
	}
	
	function inicializarTelefoneResidencial(data){
		var telefonesResidenciais =	data.filter(function (telefone) {
		    return (telefone.tipoTelefone === 'Residencial');
		});
		
		if(telefonesResidenciais.length > 0){
			controller.telefoneResidencial = telefonesResidenciais[0];
		} else {
			controller.telefoneResidencial = {tipoTelefone: 'Residencial'};
		}
	}
	
	function inicializarTelefoneComercial(data){
		var telefonesComerciais = data.filter(function (telefone) {
		    return (telefone.tipoTelefone === 'Comercial');
		});			
		
		if (telefonesComerciais.length > 0){
			controller.telefoneComercial = telefonesComerciais[0]
		} else {
			controller.telefoneComercial = {tipoTelefone: 'Comercial'};
		}
	}
	
	function inicializarTelefone(data){
		controller.pessoaContatoTelefones = data.filter(function (telefone) {
		    return (telefone.tipoTelefone != 'Celular' && telefone.tipoTelefone != 'Residencial' && telefone.tipoTelefone != 'Comercial');
		});
	}	
	
	function buscaContatos(){
		pessoaService.findContatoTelefonesByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
			inicializarTelefone(data);			
			inicializarTelefoneCelular(data);
			inicializarTelefoneResidencial(data);
			inicializarTelefoneComercial(data);			
		});		
		
		pessoaService.findContatoEmailsByPessoa($scope.pessoaCtrl.pessoa.id).success(function(data){
			controller.pessoaContatoEmails = data;
		});
		
		$timeout(function(){
			angular.element('#participacao').blur();			
		});
	}
	
	function incluirTelefone(telefone){
		if(validaTelefone(telefone)){		
			if(telefone.id != null && !telefone.telefone) {
				pessoaService.excluirPessoaContatoTelefone(telefone.id).success(function(data){
					buscaContatos();
				});
			} else {			
				telefone.pessoa = {
					id: $scope.pessoaCtrl.pessoa.id
				}
				pessoaService.insertPessoaContatoTelefone(telefone).success(function(data){
					buscaContatos();
					if (telefone.tipoTelefone == 'Celular'){
						controller.telefoneCelular = data;
					} else if (telefone.tipoTelefone == 'Residencial'){
						controller.telefoneResidencial = data;
					} else if (telefone.tipoTelefone == 'Comercial'){
						controller.telefoneComercial = data;
					} else {
						controller.telefone = {};
					}
					
					$scope.pessoaCtrl.abas.contatos.erros = [];
				});
			}
		} 
	}
	
	function updateTelefone(telefone){
		controller.telefone = angular.copy(telefone);
	}
	
	function deleteTelefone(telefone){
		dialogService.show('Excluir', 'Deseja excluir o telefone ' + $filter('telefone')(telefone.telefone) + '?', 'Sim', 'Não').result.then(function(){
			pessoaService.excluirPessoaContatoTelefone(telefone.id).success(function(data){
				buscaContatos();
			});
		});
	}
	
	function validaTelefone(telefone){
		var retorno = true;
		if(telefone.telefone.toString().length > 0 && telefone.telefone.toString().length < 10){			
				notify({message:'O número de telefone é inválido!', classes:'alert-danger',position:'right'});
				telefone.telefone = '';			
				retorno = false;			
		} 
		
		return retorno;
	}
	
	function incluirEmail(){
		controller.email.pessoa = {
			id: $scope.pessoaCtrl.pessoa.id	
		}
		if(validateEmail(controller.email.email)){
			pessoaService.insertPessoaContatoEmail(controller.email).success(function(data){
				controller.email = {};
				buscaContatos();
			});
		}else{
			notify({message:'O e-mail é inválido!', classes:'alert-danger',position:'right'});
		}
	}
	
	function updateEmail(email){
		controller.email = angular.copy(email);
	}
	
	function deleteEmail(email){
		dialogService.show('Excluir', 'Deseja excluir o e-mail ' + email.email + '?', 'Sim', 'Não').result.then(function(){
			pessoaService.excluirPessoaContatoEmail(email.id).success(function(data){
				buscaContatos();
				controller.email = {};
			});
		});
	}
	
	function validateEmail(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	}
	
	function salvarPessoa(){
		pessoaService.insertPessoa($scope.pessoaCtrl.pessoa).then(function(data){
			$scope.pessoaCtrl.pessoa = data;
		});
	}	
	
	function openModal(){
		controller.telefone = {};
		buscaContatos();
		$timeout(function(){
			angular.element("#modalOutrosTelefones").modal("show");						
		},250);
	}
	
	// I - incluir, V - Visualizar, E - Editar
	controller.acao = $stateParams.acao;
	function bloqueiaCampos() {
		// I - incluir, V - Visualizar, E - Editar
		if (controller.acao == "V") {
			angular.element('input').attr("disabled",true);
			angular.element('select').attr("disabled",true);
			angular.element('label').attr("disabled",true);				
		}
	}	

	buscaContatos();
	bloqueiaCampos();
	
	function validarTipoEmail(){
		controller.tipoEmail = {};
		if(controller.email.tipoEmail.id  == "new"){
			$timeout(function(){
				controller.email.tipoEmail = null;
				angular.element("#modalTipoEmail").modal("show");					
			},250);
		}
	}
	
	function incluirTipoEmail(){
		
		var tipoEmail = angular.copy(controller.tipoEmail);
		
		tipoService.insertTipoEmail(tipoEmail).success(function(tipoEmail){
			if( angular.isObject(tipoEmail)){
				carregarTiposEmail();
				$timeout(function(){
					angular.element("#modalTipoEmail").modal("hide");	
					controller.tipoEmail.dsTipoEmail = null;
				},250);
			}else{
				notify({message:'Tipo de e-mail já cadastrado!', classes:'alert-danger',position:'right'});
				controller.tipoEmail.dsTipoEmail = null;
			}	
		});
	}
	
	function excluirTipoEmail(tipoEmail){
		
		dialogService.show('Excluir','Deseja excluir o tipo de e-mail ' + tipoEmail.dsTipoEmail + '?','Sim','Não').result.then(function(){
			
			tipoService.excluirTipoEmail(tipoEmail.id).success(function(){
				carregarTiposEmail();
			}).error(function(){
				notify({message:'Esse tipo de e-mail possui vínculo com outro registro e por isso não poderá ser excluído!!', classes:'alert-danger',position:'right'});
			});
			
		});
		
	}
	
	function buscarContatoExclusivo() {
		pessoaService.findContatoExclusivo($scope.pessoaCtrl.pessoa.id).then(function(retorno) {
			controller.contatoExclusivo = retorno.data;
			
			controller.descricaoContatoExclusivo = "Contato exclusivo com a(s) consultora(s): ";
			for (var i = 0; i < controller.contatoExclusivo.length; i++) {
				var virgula =  (i+1) != controller.contatoExclusivo.length ? "," : "";
				controller.descricaoContatoExclusivo += " Consultora " + controller.contatoExclusivo[i].pessoa.nomeRazao + virgula;
			}
		});
	}
}