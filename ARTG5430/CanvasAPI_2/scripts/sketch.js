window.addEventListener('load', eventWindowLoaded, false);

function eventWindowLoaded() {
   canvasApp();
}

function canvasApp() {

    function  drawScreen () {
      context.fillStyle = '#EEEEEE';
      context.fillRect(0, 0, theCanvas.width, theCanvas.height);
      //Box
      context.strokeStyle = '#000000';
      context.strokeRect(1,  1, theCanvas.width-2, theCanvas.height-2);

      // Create ball

      y += speed;

      context.fillStyle = "#000000";
      context.beginPath();
      context.arc(x,y,15,0,Math.PI*2,true);
      context.closePath();
      context.fill();
   }

   theCanvas = document.getElementById("canvas");
   context = theCanvas.getContext("2d");

   var speed = 5;
   
   var y = 10;
   var x = 250;

   setInterval(drawScreen, 33);
}