angular.module('cadastro-central-module').directive('stringNumeric', function(){
    return {
    	restrict:'A',
        link: function(scope, element, attrs) {
        	angular.element(element).keypress(function (event) {

				if( event.keyCode != 8 ) { //Firefox backspace
					var regex = new RegExp("^[0-9]$");
					var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
					if (!regex.test(key)) {
						event.preventDefault();
						return false;
					}
				}
        	});
        	
        	angular.element(element).keyup(function (event) {
        		var str = '';
        		var regex = new RegExp("^[0-9]$");
        		$.each($(element).val().split(''), function(index, char){
        			if (regex.test(char)) {
        				str += char;
					}
        		});
        		$(element).val(str);
        	});
        }
    };
});