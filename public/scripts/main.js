$(document).ready(function () {
    /* Flash Messages */
    setTimeout(function(){
        $("div.alert").remove();
    }, 5000 );

    $('[type="datetime-local"]').prop('max', function(){
        return new Date().toJSON();
    });

    /* events/index */
    $("select.dropdown").change(function () {
        var value = $(this).children("option:selected").val();
        if (value == "Groups") {
            $(".all-rows").show();
            $('#add-new-row').show();
        }
        if (value == "Self") {
            $(".all-rows").hide();
            $('#add-new-row').hide();
        }
    });
    
    /* events/show */
    var i = 1;
    $("#toggle-form").click(function () {
        $("#new-row-"+i).show();
        i++;
        if (i == 4) {
            $("#add-new-row").hide();
        }
    });
    

});

