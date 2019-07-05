angular.module('cadastro-central-module').controller('ModalTipoDocumentoCtrl', ModalTipoDocumentoCtrl);

ModalTipoDocumentoCtrl.$inject = ['$modalInstance','$scope','$http','$timeout','PATHCONFIG','$q','$state','notify','usSpinnerService', 'pessoaService', 'papelService', 'dialogService'];

function ModalTipoDocumentoCtrl($modalInstance,$scope,$http,$timeout,PATHCONFIG,$q,$state,notify, usSpinnerService, pessoaService, papelService, dialogService) {
	
	var controller = this;
	
	
	
	
	function carregaDocumentosETiposDocumento() {
		
	$q.all([tipoService.getTiposDocumentoByTipoPessoa(controller.prestadorServico.pessoa.tipoPessoa),
				pessoaService.findPessoaDocumentos(controller.prestadorServico.pessoa.id),
				tipoService.getTiposDocumento()]).then(function(retornos){
					
			controller.documentos = retornos[1].data;
			controller.tiposDocumento = retornos[0].data;
			controller.tiposDocumento = controller.tiposDocumento.filter(function(tipoDocumento){
				return !controller.documentos.some(function(documento){
					return tipoDocumento.id == documento.id.tipoDocumento.id;
				});
			});
			controller.allDocumentosModal =  retornos[2].data;
			newOption = {id:"new", descricao:"Novo Tipo de Documento"};
			controller.tiposDocumento.unshift(newOption);

		});
	}
}