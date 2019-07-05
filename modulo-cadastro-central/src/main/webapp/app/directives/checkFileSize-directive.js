angular.module('cadastro-central-module').directive('checkFilesize', function(notify) {
	  return {
		    link: function(scope, elem, attr, ctrl) {
		      function bindEvent(element, type, handler) {
		        if (element.addEventListener) {
		          element.addEventListener(type, handler, false);
		        } else {
		          element.attachEvent('on' + type, handler);
		        }
		      }

		      bindEvent(elem[0], 'change', function() {
		    	  //Limit Size: 5 MB
		    	  if(this.files[0].size > 5000000){
		    		  notify({message:'Arquivo não pode ultrapassar o tamanho de 5MB', classes:'alert-danger',position:'right'});
		    		  angular.element("input[type='file']").val(null);
		    	  }
		      });
		    }
		  }
		});