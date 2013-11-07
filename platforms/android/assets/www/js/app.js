$(document).ready(function(){
	homeView();
	$('.home').on('tap', renderHomeView);   
    $('.feedback').on('tap', renderFeedbackFormView); 
    
});

function renderHomeView(event){
	event.preventDefault();
	homeView();
}

function homeView(){
	$('#main').empty();
    $('.home').addClass("ui-btn-active");
    $('#main').html(template("home"));
    var url = 'http://30technologiesin30days-t20.rhcloud.com/api/v1/blogs';
    $.mobile.loading( 'show',{});
    $.ajax({
        url : url,
        dataType : 'json',
        success : function(data){
            $.mobile.loading( 'hide',{});
            $.each(data , function(i , obj){
                // alert(obj);
                // alert(JSON.stringify(obj));
                var template = $("#blog-template").html();
                obj.publishedOn = $.timeago(obj.publishedOn);
                $("#blogs").append(Mustache.to_html(template,obj));
                $('#blogs').listview('refresh');
            });
        },
        error : function(XMLHttpRequest,textStatus, errorThrown) {   
            $.mobile.loading( 'hide',{text:"Fetching blogs.."});  
            alert("Something wrong happended on the server. Try again..");  
                  
        }
    })
    
    $('#main').trigger('create');

}

function renderFeedbackFormView(event){
    event.preventDefault();
    $('#main').empty();
    $('#main').html(template("feedback-form"));
    $('#main').trigger('create');
    $('#create-button').bind('tap',shareFeedback);
}

function shareFeedback(event){
        event.preventDefault();
        $('#feedbackForm').mask();        
        var name = $('#name').val();
        var description = $('textarea#description').val();
        var sharemylocation = $("#sharemylocation:checked").val() === undefined ? "false" : "true";
        var data = {name:name , description:description , lngLat :[]};
        if(sharemylocation === "true"){
            navigator.geolocation.getCurrentPosition(function(position){
                var lngLat = [position.coords.longitude , position.coords.latitude];
                data.lngLat = lngLat;
                postFeedback(data);
            
            } , function(error){
                    alert('code: '    + error.code    + '\n' +
                      'message: ' + error.message + '\n');
                    $('#feedbackForm').unmask(); 
            });
        }else{
            postFeedback(data);
        }
        

        
          
}

function postFeedback(data){
    $.ajax({
                type : 'POST',
                url : 'http://30technologiesin30days-t20.rhcloud.com/api/v1/feedback',
                crossDomain : true,
                data : JSON.stringify(data),
                dataType : 'json',
                contentType: "application/json",
                success : function(data){
                    $('#feedbackForm').unmask();
                    $('#feedbackForm')[0].reset();
                    showNotification('Received your feedback', 'Info');
                    homeView();
                },
                error : function(XMLHttpRequest,textStatus, errorThrown) {     
                  $('#feedbackForm').unmask();
                  alert("Error status :"+textStatus);  
                  alert("Error type :"+errorThrown);  
                  
                }
        });
}

function template(name) {
        return Mustache.compile($('#'+name+'-template').html());
}

function showNotification(message , title){
        if (navigator.notification) {
        navigator.notification.alert(message, null, title, 'OK');
        } else {
            alert(title ? (title + ": " + message) : message);
        }
}