
var state = false;

var aikatsu_loop = null;

function start_aikatsu() {
    state = false;
    aikatsu_loop = setInterval(() => {
    
        if (!state){
            $("#left").attr("class", "active");
            $("#right").removeAttr("class", "active");
            aplay1.play();
        }else{
            $("#right").attr("class", "active");
            $("#left").removeAttr("class", "active");
            aplay2.play();
        }
        
        state = !state;
    }, 500);
            
}

function stop_aikatsu() {
    clearInterval(aikatsu_loop);
    aikatsu_loop = null;
    $("#left").attr("class", "active");
    $("#right").attr("class", "active");

}

function is_playing() {
    return (aikatsu_loop !== null);
}

function click() {
    if (is_playing()) {
        stop_aikatsu();
    }else{
        start_aikatsu();
    }
}
document.getElementById('main').onclick = () => {
    click();    
};

aplay1.load();
aplay2.load();
