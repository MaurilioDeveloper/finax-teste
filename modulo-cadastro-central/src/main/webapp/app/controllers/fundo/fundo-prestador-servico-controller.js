angular.module('cadastro-central-module').controller(
		'PrestadorServicoFundosCtrl', PrestadorServicoFundosCtrl);

PrestadorServicoFundosCtrl.$inject = [ '$stateParams', '$scope', '$http',
		'$timeout', 'PATHCONFIG', '$q', '$state', 'notify', 'usSpinnerService',
		'dialogService', 'papelService', 'fundoService', 'prestadorServicoService',
		'logService', 'relacionadaService', '$modal', 'termoCessaoService'];

function PrestadorServicoFundosCtrl($stateParams, $scope, $http, $timeout,
		PATHCONFIG, $q, $state, notify, usSpinnerService, dialogService, papelService, 
		fundoService, prestadorServicoService, logService, relacionadaService, $modal, termoCessaoService) {

	var controller = this;
		
	controller.log = {};
	
	controller.selecionaNomePrestadorServico = selecionaNomePrestadorServico;
	controller.selecionaPapelPrestadorServico = selecionaPapelPrestadorServico;
	controller.selecionaIdentificadorPrestadorServico = selecionaIdentificadorPrestadorServico;
	controller.salvarPrestadorServicoFundo = salvarPrestadorServicoFundo;
	controller.preparaAtualizacao = preparaAtualizacao;
	controller.atualizarPrestadorServicoFundo = atualizarPrestadorServicoFundo;
	controller.exibirContatoPrestadorServico = exibirContatoPrestadorServico;
	controller.deletePessoaRelacionada = deletePessoaRelacionada;
	controller.limpaCampos = limpaCampos;
	controller.cancel = cancel;
	controller.habilitarAcao = false;
	controller.confirmarInclusaoCertificadora = confirmarInclusaoCertificadora;
	controller.confirmarAlteracaoCertificadora = confirmarAlteracaoCertificadora;
	controller.confirmaDeleteCertificadora = confirmaDeleteCertificadora;
	
	carregaDados();
	
	function limpaCampos() {
		controller.acao = 'I';
		controller.papelPrestadorSelecionado = null;
		controller.prestadorSelecionado = null
		controller.identificadorPrestadorSelecionado = null;
		controller.pessoaRelacionada = {
				id : {
					pessoaRelacionada: {},
					pessoa : {},
					papel : {}
				}, 
				ativo : null,
				usuario : ""
			}
		controller.pessoaRelacionada.ativo = false;
	}
	
	function getUsuarioLogado() {
		return $http.get(PATHCONFIG.PORTAL_API_CADASTRO_CENTRAL + '/usuario').then(function(data){
					controller.pessoaRelacionada.usuario = data.data;
				})
				.catch(function(data){
					controller.pessoaRelacionada.usuario = "ERRO";
				});
	}
	
	function carregaDados() {
		controller.limpaCampos();
		
		getUsuarioLogado();
		
		$q.all([papelService.findAllByTipoCadastro('PRESTADOR DE SERVICO'),
			prestadorServicoService.findAll(),
			fundoService.findPessoaFundoByIdentificador($stateParams.identificador),
			relacionadaService.findAllPessoaRelacionadaByIdentificadorPessoa($stateParams.identificador)]
		).then(function(retornos){
			controller.papeis = retornos[0].data;
			controller.papeisOriginal = angular.copy(controller.papeis);
			newOption = {descricao:"Selecione", tipoCadastro : "PRESTADOR DE SERVICO"};
			controller.papeis.unshift(newOption);
			
			controller.prestadores = retornos[1].data;
			controller.prestadoresOriginal = angular.copy(controller.prestadores);
			newOption = {pessoa: {nomeRazao:"Selecione"}};
			controller.prestadores.unshift(newOption);
			
			controller.prestadoresIdentificador = angular.copy(controller.prestadores);
			controller.prestadoresIdentificadorOriginal = angular.copy(controller.prestadoresIdentificador);
			newOption = {pessoa: {identificador:"Selecione"}};
			controller.prestadoresIdentificador.unshift(newOption);
			
			controller.pessoaFundo = retornos[2].data;
			
			controller.relacionadas = retornos[3].data;
			controller.acao = 'I';
			controller.habilitarAcao = false;
			
		});
	}
	
	
	function selecionaPapelPrestadorServico() {
		controller.prestadores = controller.prestadoresOriginal.filter(function(prestador) {
			if (!controller.papelPrestadorSelecionado.id) return true;
			if(!prestador.pessoa.papeis || !prestador.pessoa) {
				return false;
			}
			for (index = 0; index < prestador.pessoa.papeis.length; ++index) {
			    if (prestador.pessoa.papeis[index].id == controller.papelPrestadorSelecionado.id)
			    	return true
			}
			return false;
			
		});
		
		controller.prestadoresIdentificador = controller.prestadoresIdentificadorOriginal.filter(function(prestador) {
			if (!controller.papelPrestadorSelecionado.id) return true;
			if(!prestador.pessoa.papeis || !prestador.pessoa) {
				return false;
			}
			for (index = 0; index < prestador.pessoa.papeis.length; ++index) {
			    if (prestador.pessoa.papeis[index].id == controller.papelPrestadorSelecionado.id)
			    	return true
			}
			return false;
			
		});
		
		
		newOption = {pessoa: {nomeRazao:"Selecione"}};
		controller.prestadores.unshift(newOption);
		
		newOption2 = {pessoa: {identificador:"Selecione"}};
		controller.prestadoresIdentificador.unshift(newOption2);
		controller.disableIncluirAlterar = disableIncluirAlterar();
	}
	
	function selecionaNomePrestadorServico() {
		
		if (!controller.prestadorSelecionado.id){
			controller.papeis = angular.copy(controller.papeisOriginal);
			controller.prestadoresIdentificador = angular.copy(controller.prestadoresIdentificadorOriginal);
		} 
		else {
			controller.papeis = angular.copy(controller.prestadorSelecionado.pessoa.papeis);
			controller.prestadoresIdentificador = [angular.copy(controller.prestadorSelecionado)];
		}
			
		newOption = {descricao:"Selecione", tipoCadastro : "PRESTADOR DE SERVICO"};
		controller.papeis.unshift(newOption);
		
		newOption2 = {pessoa: {identificador:"Selecione"}};
		controller.prestadoresIdentificador.unshift(newOption2);
		controller.disableIncluirAlterar = disableIncluirAlterar();
	}
	
	function selecionaIdentificadorPrestadorServico() {
		
		if (!controller.identificadorPrestadorSelecionado.id){
			controller.papeis = angular.copy(controller.papeisOriginal);
			controller.prestadores = angular.copy(controller.prestadoresOriginal);
		} 
		else {
			controller.papeis = angular.copy(controller.identificadorPrestadorSelecionado.pessoa.papeis);
			controller.prestadores = [angular.copy(controller.identificadorPrestadorSelecionado)];
		}
			
		newOption2= {pessoa: {nomeRazao:"Selecione"}};
		controller.prestadores.unshift(newOption2);
		
		newOption = {descricao:"Selecione", tipoCadastro : "PRESTADOR DE SERVICO"};
		controller.papeis.unshift(newOption);
		controller.disableIncluirAlterar = disableIncluirAlterar();
	}
	
	function salvarPrestadorServicoFundo() {
		
		controller.pessoaRelacionada.id.pessoaRelacionada = controller.prestadorSelecionado.pessoa;
		controller.pessoaRelacionada.id.pessoa = controller.pessoaFundo.pessoa;
		controller.pessoaRelacionada.id.papel = controller.papelPrestadorSelecionado;
		
		relacionadaService.inserirPessoaRelacionada(controller.pessoaRelacionada).success(function(){
			
			notify({message:'Prestador de Serviço cadastrado com sucesso.', classes:'alert-success',position:'right'});
			
			controller.log.pessoa = controller.pessoaFundo.id;
			controller.log.pessoaRelacionada = controller.prestadorSelecionado.id;
			controller.log.papel = controller.papelPrestadorSelecionado.id;
			controller.log.descricaoAcao = "INCLUSÃO";
			controller.papelEscolhido = angular.copy(controller.papelPrestadorSelecionado);
			
			carregaDados();
			logService.insertLog(controller.log).then(function(){
				controller.log = {};
			});
			
			$scope.fundoCtrl.abas.prestadorServicoFundos.erros.forEach(function(erro, index){
				if(!erro.campo && erro.tipo == controller.papelEscolhido.descricao){
					$scope.fundoCtrl.abas.prestadorServicoFundos.erros.splice(index, 1);
				}
			});
			
			$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
		}).error(function(status){
			verificiaStatus(status, controller.papelPrestadorSelecionado.id);
		});
	}
	
	function verificiaStatus(status, id) {
		if(status == 412){
			if(id == 182){
				notify({message: status.message, classes:'alert-danger',position:'right'});				
			} else{
				notify({message:'Este fundo já tem um prestador de serviços exercendo esta função.', classes:'alert-danger',position:'right'});				
			}
		} else {
			if(id == 182){
				notify({message:'Erro de processamento da solicitação.', classes:'alert-danger',position:'right'});				
			} else {
				notify({message:'Este prestador de serviços já está exercendo esta função para este fundo.', classes:'alert-danger',position:'right'});
			}
		}
	}
	
	function confirmarInclusaoCertificadora(){
		if (controller.papelPrestadorSelecionado.id == 182 
				&& controller.pessoaRelacionada.ativo
				&& controller.relacionadas
				&& controller.relacionadas.some(function(relacionada){
					return relacionada.id.papel.descricao == "ASSINATURA DIGITAL"
						&& relacionada.ativo
				})
			){
			dialogService.showWithWarning('Ativar', 'Confirma ativação da certificadora ' + controller.prestadorSelecionado.pessoa.nomeRazao + 
					' para o fundo ' + controller.pessoaFundo.pessoa.nomeRazao + '?', 'Importante: Os contratos pendentes com a certificadora ' + 
					controller.relacionadas.find(function(relacionada){return relacionada.id.papel.id == 182}).id.pessoaRelacionada.nomeRazao +
					' serão cancelados e reenviados à certificadora ' + controller.prestadorSelecionado.pessoa.nomeRazao + '.'
					,'Sim','Não').result.then(function(){
					salvarPrestadorServicoFundo();
					termoCessaoService.regerarContrato(controller.pessoaFundo.codigo);
				})
		} else if (controller.papelPrestadorSelecionado.id == 182 
				&& !controller.pessoaRelacionada.ativo
				&& controller.relacionadas
				&& !controller.relacionadas.some(function(relacionada){
					return relacionada.id.papel.descricao == "ASSINATURA DIGITAL"
				})) {
			notify({message:'Não é possível incluir certificadora como inativa se não houver nenhuma outra associada.', classes:'alert-danger', position:'right'});
		} else {
			salvarPrestadorServicoFundo();
		}
	}
	
	function disableIncluirAlterar(){
		if( !controller.prestadorSelecionado
			|| !controller.papelPrestadorSelecionado
			|| !controller.identificadorPrestadorSelecionado
			|| controller.prestadorSelecionado.pessoa.nomeRazao == "Selecione"
			|| controller.papelPrestadorSelecionado.descricao == "Selecione"
			|| controller.identificadorPrestadorSelecionado.pessoa.identificador == "Selecione"
			|| controller.relacionadas.find(function(relacionada){
			return relacionada.id.papel.id == controller.papelPrestadorSelecionado.id
			&& relacionada.id.pessoaRelacionada.nomeRazao == controller.prestadorSelecionado.pessoa.nomeRazao
			&& relacionada.id.pessoaRelacionada.identificador == controller.identificadorPrestadorSelecionado.pessoa.identificador
			})
		){
			return true;
		}
		return false;
	}
	
	function confirmarAlteracaoCertificadora(){
		if (controller.papelPrestadorSelecionado.id == 182 
				&& controller.pessoaRelacionada.ativo
				&& controller.relacionadas.some(function(relacionada){
					return relacionada.id.papel.descricao == "ASSINATURA DIGITAL"
						&& relacionada.ativo
				})
			){
			dialogService.showWithWarning('Ativar', 'Confirma ativação da certificadora ' + controller.prestadorSelecionado.pessoa.nomeRazao + 
					' para o fundo ' + controller.pessoaFundo.pessoa.nomeRazao + '?', 'Importante: Os contratos pendentes com a certificadora ' + 
					controller.relacionadas.find(function(relacionada){return relacionada.id.papel.id == 182}).id.pessoaRelacionada.nomeRazao +
					' serão cancelados e reenviados à certificadora ' + controller.prestadorSelecionado.pessoa.nomeRazao + '.' 
					,'Sim','Não').result.then(function(){
					atualizarPrestadorServicoFundo();
					termoCessaoService.regerarContrato(controller.pessoaFundo.codigo);
				})
		} else if (controller.papelPrestadorSelecionado.id == 182 
				&& !controller.pessoaRelacionada.ativo
				&& controller.relacionadas.some(function(relacionada){
					return relacionada.id.papel.descricao == "ASSINATURA DIGITAL"
						&& !relacionada.ativo
				})) {
			dialogService.showWithWarning('Desativar', 'Confirma inativação da certificadora ' + controller.prestadorSelecionado.pessoa.nomeRazao + 
					' para o fundo ' + controller.pessoaFundo.pessoa.nomeRazao + '?', 'Importante: Os contratos pendentes com a certificadora ' + 
					controller.prestadorSelecionado.pessoa.nomeRazao + ' serão cancelados e reenviados à certificadora ' + 
					controller.relacionadas.find(function(relacionada){return relacionada.id.papel.id == 182}).id.pessoaRelacionada.nomeRazao + '.' 
					,'Sim','Não').result.then(function(){
					atualizarPrestadorServicoFundo();
					termoCessaoService.regerarContrato(controller.pessoaFundo.codigo);
				})
		} else if (controller.papelPrestadorSelecionado.id == 182 
				&& !controller.pessoaRelacionada.ativo
				&& controller.relacionadas.filter(function(relacionada){
					return relacionada.id.papel.descricao == "ASSINATURA DIGITAL"
				}).length == 0) {
			notify({message:'Não é possível desativar certificadora se não houver nenhuma outra associada.', classes:'alert-danger', position:'right'});
		} else {
			atualizarPrestadorServicoFundo();
		}
	}
	
	function preparaAtualizacao(relacionada) {
		for (index = 0; index < controller.prestadores.length; ++index) {
		    if (controller.prestadores[index].pessoa.id == relacionada.id.pessoaRelacionada.id){
		    	controller.prestadorSelecionado = controller.prestadores[index];
				controller.identificadorPrestadorSelecionado = controller.prestadores[index];
		    }
		}
		
		controller.papelPrestadorSelecionado = relacionada.id.papel;
		
		selecionaPapelPrestadorServico();
		selecionaNomePrestadorServico();
		selecionaIdentificadorPrestadorServico();
		
		controller.acao = 'E';
		
		controller.pessoaRelacionada.pessoaRelacionadaOriginal = relacionada;
		controller.pessoaRelacionada.id.pessoaRelacionada = relacionada.id.pessoaRelacionada;
		controller.pessoaRelacionada.ativo = relacionada.ativo;
		
		controller.relacionadasAux = angular.copy(controller.relacionadas);
		controller.habilitarAcao = true;
		for (var i = 0; i < controller.relacionadas.length; ++i) {
			 if(controller.relacionadas[i].id == relacionada.id){
				 controller.relacionadas.splice(i, 1);
				 i = i-1
				 break;
			 }
		}
		controller.disableIncluirAlterar = disableIncluirAlterar();
	}

	function atualizarPrestadorServicoFundo() {
		
		controller.pessoaRelacionada.id.pessoaRelacionada = controller.prestadorSelecionado.pessoa;
		controller.pessoaRelacionada.id.pessoa = controller.pessoaFundo.pessoa;
		controller.pessoaRelacionada.id.papel = controller.papelPrestadorSelecionado;
		
		relacionadaService.atualizarPessoaRelacionada(controller.pessoaRelacionada).then(function(){
			
			notify({message:'Prestador de Serviço alterado com sucesso.', classes:'alert-success',position:'right'});
			
			$scope.fundoCtrl.abas.prestadorServicoFundos.erros.forEach(function(erro, index){
				if(!erro.campo && erro.tipo == controller.pessoaRelacionada.id.papel.descricao){
					$scope.fundoCtrl.abas.prestadorServicoFundos.erros.splice(index, 1);
				}
			});
			
			controller.log.pessoa = controller.pessoaFundo.id;
			controller.log.pessoaRelacionada = controller.prestadorSelecionado.id;
			controller.log.papel = controller.papelPrestadorSelecionado.id;
			controller.log.descricaoAcao = "ALTERAÇÃO";
			
			carregaDados();
			logService.insertLog(controller.log).then(function(){
				controller.log = {};
			});
			
			$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
			
		}).catch(function(status){
			verificiaStatus(status, controller.papelPrestadorSelecionado.id);
		});
	}
	
	function confirmaDeleteCertificadora(relacionada){
		if (relacionada.id.papel.id == 182
				&& relacionada.ativo
				&& controller.relacionadas.filter(function(certificadora){
					return certificadora.id.papel.descricao == "ASSINATURA DIGITAL"
				}).length == 1) {
			dialogService.showWithWarning('Excluir', 'Confirma a exclusão da certificadora ' + relacionada.id.pessoaRelacionada.nomeRazao  + 
					' para o fundo ' + relacionada.id.pessoa.nomeRazao + '?', 'Importante: A remoção da certificadora cancelará os contratos pendentes existentes.','Sim','Não').result.then(function(){
				relacionada.ativo = false;
				relacionada.usuario = controller.pessoaRelacionada.usuario;
				relacionadaService.deletePessoaRelacionada(relacionada).then(function(){
					carregaDados();
					termoCessaoService.regerarContrato(controller.pessoaFundo.codigo);
					notify({message:'Prestador de Serviço excluido com sucesso.', classes:'alert-success', position:'right'});
				});
				
				controller.log.pessoa = controller.pessoaFundo.id;
				controller.log.pessoaRelacionada = relacionada.id.pessoaRelacionada.id;
				controller.log.papel = relacionada.id.papel.id;
				controller.log.descricaoAcao = "EXCLUSÃO";
				
				logService.insertLog(controller.log).then(function(){
					controller.log = {};
				});
			})
		} else if (relacionada.id.papel.id == 182
				&& relacionada.ativo
				&& controller.relacionadas.filter(function(certificadora){
					return certificadora.id.papel.descricao == "ASSINATURA DIGITAL"
				}).length > 1) {
			
			dialogService.showWithWarning('Excluir', 'Confirma a exclusão da certificadora ' + relacionada.id.pessoaRelacionada.nomeRazao  + 
					' para o fundo ' + relacionada.id.pessoa.nomeRazao + '?', 'Importante: A certificadora ' + 
					controller.relacionadas.find(function(rel){return rel.id.pessoaRelacionada.identificador != relacionada.id.pessoaRelacionada.identificador
						&& rel.id.papel.id == 182}).id.pessoaRelacionada.nomeRazao + 
					' será ativada e os contratos pendentes com a certificadora ' 
					+ relacionada.id.pessoaRelacionada.nomeRazao  + ' serão cancelados e reenviados para a certificadora ' + 
					controller.relacionadas.find(function(rel){return rel.id.pessoaRelacionada.identificador != relacionada.id.pessoaRelacionada.identificador 
						&& rel.id.papel.id == 182}).id.pessoaRelacionada.nomeRazao + 
					'.','Sim','Não').result.then(function(){
				relacionada.ativo = false;
				relacionada.usuario = controller.pessoaRelacionada.usuario;
				relacionadaService.deletePessoaRelacionada(relacionada).then(function(){
					carregaDados();
					termoCessaoService.regerarContrato(controller.pessoaFundo.codigo);
					notify({message:'Prestador de Serviço excluido com sucesso.', classes:'alert-success', position:'right'});
				});
				
				controller.log.pessoa = controller.pessoaFundo.id;
				controller.log.pessoaRelacionada = relacionada.id.pessoaRelacionada.id;
				controller.log.papel = relacionada.id.papel.id;
				controller.log.descricaoAcao = "EXCLUSÃO";
				
				logService.insertLog(controller.log).then(function(){
					controller.log = {};
				});
			})
		} else {
			deletePessoaRelacionada(relacionada);
		}
	}
	
	function deletePessoaRelacionada(relacionada) {
		dialogService.show('Excluir', 'Deseja remover o vínculo do prestador de serviço ' + relacionada.id.pessoaRelacionada.nomeRazao 
				+ ' com o fundo ' + relacionada.id.pessoa.nomeRazao + '?','Sim','Não').result.then(function(){
			relacionada.usuario = controller.pessoaRelacionada.usuario;
			relacionadaService.deletePessoaRelacionada(relacionada).then(function(){
				carregaDados();
				notify({message:'Prestador de Serviço excluido com sucesso.', classes:'alert-success', position:'right'});
			});
			
			controller.log.pessoa = controller.pessoaFundo.id;
			controller.log.pessoaRelacionada = relacionada.id.pessoaRelacionada.id;
			controller.log.papel = relacionada.id.papel.id;
			controller.log.descricaoAcao = "EXCLUSÃO";
			
			logService.insertLog(controller.log).then(function(){
				controller.log = {};
			});
			
			$scope.fundoCtrl.pessoaFundo.stCadastroFundo = 'Em Andamento';
		})
	}
	
	function cancel() {
		$timeout(function() {
			controller.acao = 'I';
			controller.habilitarAcao = false;
			controller.relacionadas =  angular.copy(controller.relacionadasAux);
			controller.prestadores = angular.copy(controller.prestadoresOriginal);
			carregaDados();
		});
	}
	
	function exibirContatoPrestadorServico(identificadorPrestador){
		$modal.open({
			size:'md',
			backdropClass:'backdrop',
			backdrop:'static',
			windowClass:'smartmodal',
			templateUrl:'app/views/fundo/cadastro-modal-contato-prestador-servico.html',
			controller:'ModalContatoPrestadorServicoCtrl',
			controllerAs:'modalContatoPrestadorServicoCtrl',
			resolve: {
			    identificador: function () {
			      return identificadorPrestador;
			    }
			  }
		});
	}
}