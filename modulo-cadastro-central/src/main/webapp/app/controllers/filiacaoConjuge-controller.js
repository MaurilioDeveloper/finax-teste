angular.module('cadastro-central-module').controller('FiliacaoConjugeCtrl', FiliacaoConjugeCtrl);

FiliacaoConjugeCtrl.$inject = ['$scope','$http', '$timeout','$filter','PATHCONFIG','notify','usSpinnerService', 'pessoaService','tipoService','utilsService'];

function FiliacaoConjugeCtrl($scope,$http,$timeout,$filter,PATHCONFIG,notify, usSpinnerService, pessoaService,tipoService,utilsService) {
	
	var controller = this;

	controller.pessoaFiliacao = {};
	controller.pessoaMatrimonio = {};
	controller.dataMax = new Date();
	controller.open = false;
	controller.isConjuge = false;
	controller.disableNomeConjuge = false;
	controller.disableDataConjuge = false;
	
	controller.salvarPessoaFiliacao = salvarPessoaFiliacao;
	controller.salvarPessoaMatrimonio = salvarPessoaMatrimonio;
	controller.validarCPF = validarCPF;
	controller.validarData = validarData;
	controller.buscarConjuge = buscarConjuge;
	
	//Verifica se o estado Civil da pessoa é casado, caso não, oculta a view de matrimonio.
	if($scope.pessoaCtrl.pessoa && $scope.pessoaCtrl.pessoa.estadoCivil && $scope.pessoaCtrl.pessoa.estadoCivil.toUpperCase().match(/CASAD/)){
		controller.isConjuge = true;
	}
	
	pessoaService.findFiliacaoByPessoa($scope.pessoaCtrl.pessoa.id).success(function(filiacao){
		if(filiacao){
			controller.pessoaFiliacao = filiacao;
		}else{
			controller.pessoaFiliacao = {};
		}

		if ($scope.pessoaCtrl.acao == "V") {
			$scope.pessoaCtrl.bloqueiaCampos();
		}
	}).error(function(){
		notify({message:'Erro ao buscar dados da filiação!', classes:'alert-danger',position:'right'});
	});
	
	pessoaService.findMatrimonioByPessoa($scope.pessoaCtrl.pessoa.id).success(function(matrimonio){
		tipoService.getTipoRegimesCasamento().success(function(data){
			controller.regimesCasamento = data;
			if(matrimonio && matrimonio.nomeConjuge){
				controller.pessoaMatrimonio = matrimonio;
				controller.disableNomeConjuge = true;
				controller.disableDataConjuge = true;
			}else{
				controller.pessoaMatrimonio = {};
			}
		});
	}).error(function(){
		notify({message:'Erro ao buscar dados matrimoniais!', classes:'alert-danger',position:'right'});
	});
	
	function salvarPessoaFiliacao(){
		controller.pessoaFiliacao.pessoa = {
			id:$scope.pessoaCtrl.pessoa.id
		};
		pessoaService.insertPessoaFiliacao(controller.pessoaFiliacao).success(function(data){
			if(data.nomeMae){
				$scope.pessoaCtrl.abas.filiacaoConjuge.erros = [];
			}
			controller.pessoaFiliacao = data;
		});
	}
	
	function validarCPF(){
		if(utilsService.validarCPF(controller.pessoaMatrimonio.cpfConjuge)){
			salvarPessoaMatrimonio();
		}else{
			notify({message:'Número do documento CPF do cônjuge é inválido!', classes:'alert-danger',position:'right'});
			controller.pessoaMatrimonio.cpfConjuge = '';
		}
	}
	
	function validarCampos(campo){
		
	}
	
	function salvarPessoaMatrimonio(){
		controller.pessoaMatrimonio.pessoa = {
			id:$scope.pessoaCtrl.pessoa.id
		}
		pessoaService.insertPessoaMatrimonio(controller.pessoaMatrimonio).success(function(data){
			controller.pessoaMatrimonio = data;
		});
	}
	
	function dateParser(date) {
		return $filter('date')(date, 'dd/MM/yyyy');
	}
	
	function validarData(){
		var pastDate = moment(new Date()).subtract(120, 'years');
		if(controller.pessoaMatrimonio.dataNascimento >= pastDate && controller.pessoaMatrimonio.dataNascimento <= new Date()){
			salvarPessoaMatrimonio();
		}else{
			if(controller.pessoaMatrimonio.dataNascimento > pastDate){
				notify({message:'A data de nascimento do cônjuge deve ser inferior à data atual!', classes:'alert-danger',position:'right'});
			}else if(controller.pessoaMatrimonio.dataNascimento < new Date()){
				notify({message:'A data de nascimento do cônjuge não pode ser superior a 120 anos!', classes:'alert-danger',position:'right'});
			}else{
				notify({message:'A data de nascimento do cônjuge é inválida!', classes:'alert-danger',position:'right'});
			}
			controller.pessoaMatrimonio.dataNascimento = '';
		}
	}
	
	function buscarConjuge(){
		var cpf = controller.pessoaMatrimonio.cpfConjuge;
		if(cpf && cpf.length == 11){
			pessoaService.findByIdentificador(cpf).then(function(response){
				controller.disableNomeConjuge = false;
				controller.disableDataConjuge = false;
				if(response){
					controller.pessoaMatrimonio.nomeConjuge = response.nomeRazao;
					controller.pessoaMatrimonio.dataNascimento = response.dataNascConstituicao;
					if(controller.pessoaMatrimonio.nomeConjuge){
						controller.disableNomeConjuge = true;
					}
					if(controller.pessoaMatrimonio.dataNascimento){
						controller.disableDataConjuge = true;
					}
				}
			});
		}
		else{
			controller.disableNomeConjuge = false;
			controller.disableDataConjuge = false;
			controller.pessoaMatrimonio.nomeConjuge = null;
			controller.pessoaMatrimonio.dataNascimento = null;
			salvarPessoaMatrimonio();
		}
	}
	
	//Inicializa o feedback de possíveis erros de validação
	$timeout(function(){
		
		if($scope.pessoaCtrl.abas.filiacaoConjuge.erros.length){
			
			controller.form.$submitted = true;
			
			$scope.pessoaCtrl.abas.filiacaoConjuge.erros.filter(function(erro){
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