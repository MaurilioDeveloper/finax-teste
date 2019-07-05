angular.module('cadastro-central-module').controller('InfFinanceirasPessoaJuridicaCtrl', InfFinanceirasPessoaJuridicaCtrl);

InfFinanceirasPessoaJuridicaCtrl.$inject = ['utilsService','notify','pessoaService','$scope','$timeout','$filter','$q'];

function InfFinanceirasPessoaJuridicaCtrl(utilsService,notify,pessoaService,$scope,$timeout,$filter,$q) {
	
	var controller = this;
	
	controller.salvar = salvar;
	controller.isCotista = isCotista;
	controller.changeDataBaseFaturamento = changeDataBaseFaturamento;
	controller.changeDataFaturamentoMedioMensalDe = changeDataFaturamentoMedioMensalDe;
	controller.changeDataFaturamentoMedioMensalAte = changeDataFaturamentoMedioMensalAte;
	controller.changeDataBaseCapitalSocial = changeDataBaseCapitalSocial;
	controller.changeDataBasePatrimonioLiquido = changeDataBasePatrimonioLiquido;
	controller.changeDataBasePatrimonioLiquido = changeDataBasePatrimonioLiquido;
	controller.changeFaturamentoBrutoAnual = changeFaturamentoBrutoAnual;
	controller.changeFaturamentoMensal = changeFaturamentoMensal;
	controller.changePatrimonioLiquido = changePatrimonioLiquido;
	controller.vlFaturamentoBrutoAnualDirty = false;
	controller.vlFaturamentoMensalDirty = false;
	controller.vlPatrimonioLiquidoDirty = false;
	
	verificarValorBens();
	
	/*
	 * Função para verificar a soma total de patrimonios de uma pessoa.
	 * Esta informação é utilizada para definir o porte da Empresa.
	 */
	function verificarValorBens(){
		
		$q.all([pessoaService.findImoveisByPessoa($scope.pessoaCtrl.pessoa.id),
		        pessoaService.findBensByPessoa($scope.pessoaCtrl.pessoa.id)]).then(function(retornos){
		        	var bensImoveis = retornos[0].data;
		        	var outrosBens = retornos[1].data;
		        
		        	controller.valorTotalBens = 0;
		        	
		        	bensImoveis.forEach(function(imovel){
		        		controller.valorTotalBens += imovel.valorMercado;
		        	});
		        	
		        	outrosBens.forEach(function(bem){
		        		controller.valorTotalBens += bem.valorMercado;
		        	});
		        	
		        	console.log(controller.valorTotalBens);
		        });
	}
	
	
	/**
	 * Objeto que será utilizado para preenchimento
	 * dos dados da tela.
	 */
	controller.infFinanceira = {
		pessoa:$scope.pessoaCtrl.pessoa
	};
	
	//Combo 'Porte da empresa'
	controller.portesEmpresa = ['Grande','Média','Micro','Pequena'];
	
	//Combo 'Classificação clientes' 
	//A definir
	controller.classificacoesClientes = [];
	
	carregaInfFinanceira();
	
	/**
	 * Ao mudar a data base de faturamento mensal, realiza uma validação, caso válido, salva os dados.
	 */
	function changeDataBaseFaturamento(){
		
		var mDataBaseFaturamento = moment(controller.infFinanceira.dataBaseFaturamento,'MM/YYYY').endOf('month');
		
		//Data base de faturamento mensal deve ser menor que a data atual e maior que a data atual - 2 anos.
		if(mDataBaseFaturamento.isBefore(moment(new Date()).endOf('month').subtract(2,'years'))){
			notify({message:"A data base do faturamento mensal não pode ser superior a 2 anos!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataBaseFaturamento = '';
		} else if(mDataBaseFaturamento.isAfter(moment(new Date()).endOf('month'))){
			notify({message:"A data base do faturamento mensal deve ser inferior à data atual!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataBaseFaturamento = '';
		} else {
			salvar();
		}
		
	}
	
	/**
	 * Ao mudar a data base de faturamento médio mensal "De", realiza uma validação, caso válido, salva os dados.
	 */
	function changeDataFaturamentoMedioMensalDe(){
		
		var mDataFaturamentoMedioMensalDe = moment(controller.infFinanceira.dataFaturamentoMedioMensalDe,'MM/YYYY').endOf('month');
		var mDataFaturamentoMedioMensalAte = moment(controller.infFinanceira.dataFaturamentoMedioMensalAte,'MM/YYYY').endOf('month');
		
		//Data faturamento mensal médio De menor que data atual e maior que a data atual - 2 anos.
		if(mDataFaturamentoMedioMensalDe.isBefore(moment(new Date()).endOf('month').subtract(2,'years'))){
			notify({message:"A data faturamento médio mensal De não pode ser inferior a 2 anos!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataFaturamentoMedioMensalDe = '';
		} else if(mDataFaturamentoMedioMensalDe.isAfter(moment(new Date()).endOf('month'))){
			notify({message:"A data faturamento médio mensal De deve ser inferior à data atual!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataFaturamentoMedioMensalDe = '';
		} else if(mDataFaturamentoMedioMensalDe.isAfter(mDataFaturamentoMedioMensalAte)){
			notify({message:"A data faturamento médio mensal 'Até' deve ser superior à faturamento médio mensal 'De'!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataFaturamentoMedioMensalDe = '';
		} else {
			salvar();
		}
		
	}
	
	/**
	 * Ao mudar a data base de faturamento médio mensal "Até", realiza uma validação, caso válido, salva os dados.
	 */
	function changeDataFaturamentoMedioMensalAte(){
		
		var mDataFaturamentoMedioMensalDe = moment(controller.infFinanceira.dataFaturamentoMedioMensalDe,'MM/YYYY').endOf('month');
		var mDataFaturamentoMedioMensalAte = moment(controller.infFinanceira.dataFaturamentoMedioMensalAte,'MM/YYYY').endOf('month');
		
		//Data faturamento mensal médio Até menor que a data atual e maior que a data atual - 2 anos.
		if(mDataFaturamentoMedioMensalAte.isBefore(moment(new Date()).endOf('month').subtract(2,'years'))){
			notify({message:"A data faturamento médio mensal Até não pode ser inferior a 2 anos!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataFaturamentoMedioMensalAte = '';
		} else if(mDataFaturamentoMedioMensalAte.isAfter(moment(new Date()).endOf('month'))){
			notify({message:"A data faturamento médio mensal Até deve ser inferior à data atual!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataFaturamentoMedioMensalAte = '';
		} else if(mDataFaturamentoMedioMensalDe.isAfter(mDataFaturamentoMedioMensalAte)){
			notify({message:"A data faturamento médio mensal 'Até' deve ser superior à faturamento médio mensal 'De'!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataFaturamentoMedioMensalAte = '';
		} else {
			salvar();
		}
		
		
	}
	
	/**
	 * Ao mudar a data base de capital social, realiza uma validação, caso válido, salva os dados.
	 */
	function changeDataBaseCapitalSocial() {
		
		var mDataBaseCapitalSocial = moment(controller.infFinanceira.dataBaseCapitalSocial,'MM/YYYY').endOf('month');
		
		if(mDataBaseCapitalSocial.isBefore(moment(new Date()).endOf('month').subtract(2,'years'))){
			notify({message:"A data base do capital social não pode ser superior a 2 anos!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataBaseCapitalSocial = '';
		} else if(mDataBaseCapitalSocial.isAfter(moment(new Date()).endOf('month'))){
			notify({message:"A data base do capital social deve ser inferior à data atual!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataBaseCapitalSocial = '';
		} else {
			salvar();
		}
		
	}
	
	////////////////////////////////////////////////////////////
	/**
	 * Ao mudar a data base do patrimonio liquido, realiza uma validação, caso válido, salva os dados.
	 */
	function changeDataBasePatrimonioLiquido() {
		
		var mDataBasePatrimonioLiquido = moment(controller.infFinanceira.dataBasePatrimonioLiquido,'dd/MM/yyyy');
		
		if(mDataBasePatrimonioLiquido.isBefore(moment(new Date()).subtract(2,'years'))){
			notify({message:"A data base do patrimônio líquido não pode ser superior a 2 anos!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataBasePatrimonioLiquido = '';
		} else if(mDataBasePatrimonioLiquido.isAfter(moment(new Date()))){
			notify({message:"A data base do patrimônio líquido deve ser inferior à data atual!", classes:'alert-danger',position:'right'});
			controller.infFinanceira.dataBasePatrimonioLiquido = '';
		} else {
			salvar();
		}
		
	}
	
	////////////////////////////////////////////////////////////
	/**
	 * Salva os dados preenchidos.
	 */
	function salvar() {	
		
		if(controller.form.faturamentoMensal.$valid) {
			var index = $scope.pessoaCtrl.abas.infFinanceiras.erros.findIndex(function(erro){
				return erro.campo == 'faturamentoMensal';
			});
			if(index >= 0)
				$scope.pessoaCtrl.abas.infFinanceiras.erros.splice(index,1);
		}
		if(controller.form.vlFaturamentoMensal.$valid) {
			var index = $scope.pessoaCtrl.abas.infFinanceiras.erros.findIndex(function(erro){
				return erro.campo == 'vlFaturamentoMensal';
			});
			if(index >= 0)
				$scope.pessoaCtrl.abas.infFinanceiras.erros.splice(index,1);
		}
		if(controller.form.capitalSocial.$valid) {
			var index = $scope.pessoaCtrl.abas.infFinanceiras.erros.findIndex(function(erro){
				return erro.campo == 'capitalSocial';
			});
			if(index >= 0)
				$scope.pessoaCtrl.abas.infFinanceiras.erros.splice(index,1);
		}
		if(controller.form.patrimonioLiquido.$valid) {
			var index = $scope.pessoaCtrl.abas.infFinanceiras.erros.findIndex(function(erro){
				return erro.campo == 'patrimonioLiquido';
			});
			if(index >= 0)
				$scope.pessoaCtrl.abas.infFinanceiras.erros.splice(index,1);
		}
		
		pessoaService.insertPessoaInfFinanceira(controller.infFinanceira).success(function(infFinanceira){
			carregaInfFinanceira();
		});
		
	}
	
	/**
	 * 	Busca as informação financeira da pessoa jurídica.
	 */
	function carregaInfFinanceira() {
		
		pessoaService.findPessoaInfFinanceiras($scope.pessoaCtrl.pessoa.id).success(function(infFinanceiras){
			if(infFinanceiras.length){
				controller.infFinanceira = infFinanceiras[0];
				controller.infFinanceira.dataBaseFaturamento = controller.infFinanceira.dataBaseFaturamento ? moment(controller.infFinanceira.dataBaseFaturamento,'DD/MM/YYYY').format('MM/YYYY') : controller.infFinanceira.dataBaseFaturamento; 
				controller.infFinanceira.dataFaturamentoMedioMensalDe = controller.infFinanceira.dataFaturamentoMedioMensalDe ? moment(controller.infFinanceira.dataFaturamentoMedioMensalDe,'DD/MM/YYYY').format('MM/YYYY') : controller.infFinanceira.dataFaturamentoMedioMensalDe;
				controller.infFinanceira.dataFaturamentoMedioMensalAte = controller.infFinanceira.dataFaturamentoMedioMensalAte ?  moment(controller.infFinanceira.dataFaturamentoMedioMensalAte,'DD/MM/YYYY').format('MM/YYYY') : controller.infFinanceira.dataFaturamentoMedioMensalAte;
				controller.infFinanceira.dataBaseCapitalSocial = controller.infFinanceira.dataBaseCapitalSocial ? moment(controller.infFinanceira.dataBaseCapitalSocial,'DD/MM/YYYY').format('MM/YYYY') : controller.infFinanceira.dataBaseCapitalSocial;
			}
			
			if ($scope.pessoaCtrl.acao == "V") {
				$scope.pessoaCtrl.bloqueiaCampos();
			}
		});
		
	}
	
	/**
	 * Verifica se a pessoa possui papel cotista.
	 */
	function isCotista() {
		
		return $scope.pessoaCtrl.pessoa.papeis.some(function(papel){
			return papel.descricao.toUpperCase() == 'COTISTA';
		});
		
	}
	
	function changeFaturamentoBrutoAnual(){
		controller.vlFaturamentoBrutoAnualDirty = true;		
		if(controller.infFinanceira.faturamentoBrutoAnual){
			if (controller.infFinanceira.faturamentoBrutoAnual != '0.01'){
				if(controller.infFinanceira.faturamentoBrutoAnual > 0 && controller.infFinanceira.faturamentoBrutoAnual <= 360000){
					controller.infFinanceira.porteEmpresa = 'Micro';
				}else if(controller.infFinanceira.faturamentoBrutoAnual > 360000 && controller.infFinanceira.faturamentoBrutoAnual <= 3600000){
					controller.infFinanceira.porteEmpresa = 'Pequena';
				}else if(controller.infFinanceira.faturamentoBrutoAnual > 3600000 && controller.infFinanceira.faturamentoBrutoAnual <= 300000000){
					controller.infFinanceira.porteEmpresa = 'Média';
				}else{
					controller.infFinanceira.porteEmpresa = 'Grande';
				}
			}
		}else{
			controller.infFinanceira.porteEmpresa = '';
		}
	}
	
	function changeFaturamentoMensal(){
		controller.vlFaturamentoMensalDirty = true;
	}	
	
	function changePatrimonioLiquido(){
		controller.vlPatrimonioLiquidoDirty = true;
	}	
	
	//Inicializa o feedback de possíveis erros de validação
	$timeout(function(){
		
		if($scope.pessoaCtrl.abas.infFinanceiras.erros.length){
			
			controller.form.$submitted = true;
			
			$scope.pessoaCtrl.abas.infFinanceiras.erros.filter(function(erro){
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