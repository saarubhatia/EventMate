$(document).ready(function(){
    $('#validationServerUsername,#validationServerUsernameLog,#validationServerUsernameLogStore,#validationServer01,#validationServer02,#validationServer03,#validationServer04,#validationServer05,#validationServer06,#invalidCheck3').removeClass('is-invalid is-valid');
  
    $('#validationServer01,#validationServer02,#validationServer03,#validationServer05,#validationServer06').keyup(function(){ 
      if($(this).val()!=""){
        $(this).removeClass("is-invalid"); 
        $(this).addClass("is-valid"); 
        $("#reg-btn").prop("disabled", false);
      }
      else
      {
        $(this).removeClass("is-valid"); 
        $(this).addClass("is-invalid"); 
        $("#reg-btn").prop("disabled", true);
      }
    });
  
    $('#validationServer06').focus(function(){
      if($('#validationServerUsernameLogStore').val()==""){
        $('#validationServerUsernameLogStore').focus();
      }
    });
  
    $('#validationServer05').focus(function(){
      if($('#validationServerUsernameLog').val()==""){
        $('#validationServerUsernameLog').focus();
      }
    });
  
    $('#validationServer04').focus(function(){
      if($('#validationServer03').val()==""){
        $('#validationServer03').focus();
      }
    });
  
    $('#invalidCheck3').click(function(){
      if($(this).prop("checked") == true){
        $(this).removeClass("is-invalid"); 
        $(this).addClass("is-valid"); 
        $("#reg-btn").prop("disabled", false);
      }
      else if($(this).prop("checked") == false){
        $(this).removeClass("is-valid"); 
        $(this).addClass("is-invalid");
        $("#reg-btn").prop("disabled", true);
      }
    });
  
    $('#validationServer03').keyup(function(){
      if($(this).val().length>0 && $(this).val().length<5){
        $('.pass').html("Poor");
      }
      else if($(this).val().length>=5 && $(this).val().length<7){
        $('.pass').html("Good");
      }
      else if($(this).val().length>=7){
        $('.pass').html("Strong");
      }
    });
    $('#validationServer04').keyup(function(){
      if($(this).val() == $('#validationServer03').val()){
        $('#validationServer04').removeClass("is-invalid");
        $('#validationServer04').addClass("is-valid");
        $('.cpass-y').html("You may proceed.");
        $("#reg-btn").prop("disabled", false);
      }
      else{
        $('#validationServer04').removeClass("is-valid");
        $('#validationServer04').addClass("is-invalid");
        $('.cpass-n').html("Password doesn't match.");
        $("#reg-btn").prop("disabled", true);
      }
    });
  
    $('#validationServerUsernameLog').keyup(function(){
      var email=$('#validationServerUsernameLog').val();
      var atpos=email.indexOf("@");
      var dotpos=email.indexOf(".");
      var dotposLast=email.lastIndexOf(".");
      if(atpos>=1 && dotpos>atpos+2 && dotposLast+2<email.length)
      {
        $(this).removeClass("is-invalid"); 
        $(this).addClass("is-valid");
      }
      else if (email=="")
      {
        $(this).removeClass("is-valid"); 
        $(this).addClass("is-invalid");
        $('.usernamelog-n').html("Please provide a valid username.");
      }
      else
      {
        $(this).removeClass("is-valid"); 
        $(this).addClass("is-invalid");
        $('.usernamelog-n').html("Username must be in the form username@service.com");
      }
    });
    $('#validationServerUsername').keyup(function(){
      var email=$('#validationServerUsername').val();
      var atpos=email.indexOf("@");
      var dotpos=email.indexOf(".");
      var dotposLast=email.lastIndexOf(".");
      if(atpos>=1 && dotpos>atpos+2 && dotposLast+2<email.length)
      {
        $(this).removeClass("is-invalid"); 
        $(this).addClass("is-valid");
        $("#reg-btn").prop("disabled", false);
      }
      else if (email=="")
      {
        $(this).removeClass("is-valid"); 
        $(this).addClass("is-invalid");
        $('.username-n').html("Please choose a valid username.");
        $("#reg-btn").prop("disabled", true);
      }
      else
      {
        $(this).removeClass("is-valid"); 
        $(this).addClass("is-invalid");
        $('.username-n').html("Username must be in the form username@service.com");
        $("#reg-btn").prop("disabled", true);
      }
    });
  });