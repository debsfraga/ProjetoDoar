var botaoEnviar = document.querySelector("#enviar");

botaoEnviar.addEventListener("click", function(event){
    event.preventDefault();

    //Captura o formulário 
    var form = document.querySelector("#frmContato");

    //Verifica se o usuario o preencheu e-mail ou telefone 
    if(form.email.value=='' && form.telefone.value==''){
        return alert('Por favor, informe um e-mail ou telefone para que possamos entrar em contato com você.')
    } else{
        //Monta o texto de retorno 
        msgRetorno=form.nomesobrenome.value + ", obrigada por nos escrever! Vamos analisar com carinho suas considerações e logo entraremos em contato."
    
        //Abre div de retorno 
        document.getElementById('formRetorno').style.display="block";
        //Efetua o retorno 
        document.getElementById('textoRetorno').innerHTML=msgRetorno;
        //Fecha o formulário 
        document.getElementById('formulario').style.display="none";
        return;
    }
});