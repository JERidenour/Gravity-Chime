//preload audio
// var kick = document.getElementById("kick_audio");
// var snare = document.getElementById("snare_audio");
// var hat1 = document.getElementById("hat1_audio");
// var hat2 = document.getElementById("hat2_audio");
// kick.preload = 'auto';
// snare.preload = 'auto';
// hat1.preload = 'auto';
// hat2.preload = 'auto';

//locks to control buttons
var status = 0,
    key = 0;

$('#set_variables_form').submit(function (e) {
  e.preventDefault();
  key = 0;
  m1     = $('#mass1').val();
  m2     = $('#mass2').val();
  Phi1   = $('#Phi1').val()/180*(pi);
  Phi2   = $('#Phi2').val()/180*(pi);
  d2Phi1 = 0;
  d2Phi2 = 0;
  dPhi1  = 0;
  dPhi2  = 0;
  kicktarget =$('#kicktarget').val()/180*(pi);
  snaretarget =$('#snaretarget').val()/180*(pi);
  hattarget1 =$('#hattarget1').val()/180*(pi);
  hattarget2 =$('#hattarget2').val()/180*(pi);
  startButton.disabled = true;
  if(status == 0){
    run();
  }
  status = 1;
});

function stopAnimation(){
  if(status == 1){
    startButton.disabled = false;
    startButton.value = 'Restart Chime';
    key = 1;
  };
  status = 0;
}

//Physics Constants
var pi = Math.PI,
    d2Phi1 = 0.0,
    d2Phi2 = 0.0,
    dPhi1  = 0.0,
    dPhi2  = 0.0,
    Phi1   = 0*(pi)/2,  //initial values if not given by sliders
    Phi2   = 2.3*(pi)/2,
    Phi1_prev = Phi1,
    Phi2_prev = Phi2,
    m1     = 10,
    m2     = 10,
    l1     = 150,
    l2     = 150,
    X0     = 350,
    Y0     = 200,
    g      = 2*3.81,
    time   = 0.2;

//sound locks
var kickLock = 1,
    snareLock = 1,
    hat1Lock = 1,
    hat2Lock = 1;

//where you want the sounds to trigger (phi values):
var kicktarget = 0.0,
    snaretarget = pi/4,
    hattarget1 = 0.0,
    hattarget2 = pi/4;

//create canvases:
var canvas  = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var preCanvas = document.createElement('canvas');
preCanvas.width = canvas.width;
preCanvas.height = canvas.height;
var preContext = preCanvas.getContext('2d');

//add the how-to drawing to the screen
base_image = new Image();
base_image.src = 'sketch.jpg';
base_image.onload = function(){
  context.drawImage(base_image, 0, 0);
}

function run(){ 

  var kickLine = {x0: X0, y0: Y0, x: 0.0, y: 0.0},
      snareLine1 = {x0: X0, y0: Y0, x: 0.0, y: 0.0},
      snareLine2 = {x0: X0, y0: Y0, x: 0.0, y: 0.0},
      hatLine1 = {x0: X0, y0: Y0, x: 0.0, y: 0.0},
      hatLine2 = {x0: X0, y0: Y0, x: 0.0, y: 0.0},
      hatLine3 = {x0: X0, y0: Y0, x: 0.0, y: 0.0};
  
  var myLine1 = {x0: X0, y0: Y0, x: 0.0, y: 0.0}
      myLine2 = {x0: 0.0, y0: 0.0, x: 0.0, y: 0.0},
      myCircle1 = {x: X0+l1*Math.sin(Phi1), y: Y0+l1*Math.cos(Phi1), mass: m1},
      myCircle2 = {x: X0+l1*Math.sin(Phi1)+l2*Math.sin(Phi2), y: Y0+l1*Math.cos(Phi1)+l2*Math.cos(Phi2), mass: m2};

  //reset the pre-canvas:
  preContext.clearRect(0, 0, preCanvas.width, preCanvas.height);

  //prerender non-moving lines
  kickLine.x = X0+l1*Math.sin(kicktarget);
  kickLine.y = Y0+l1*Math.cos(kicktarget);

  snareLine1.x = X0+l1*Math.sin(snaretarget);
  snareLine1.y = Y0+l1*Math.cos(snaretarget);
  snareLine2.x = X0-l1*Math.sin(snaretarget);
  snareLine2.y = Y0+l1*Math.cos(snaretarget);

  preContext.beginPath();

  preContext.moveTo(kickLine.x0, kickLine.y0);
  preContext.lineTo(kickLine.x, kickLine.y);

  preContext.moveTo(snareLine1.x0, snareLine1.y0);
  preContext.lineTo(snareLine1.x, snareLine1.y);

  preContext.moveTo(snareLine2.x0, snareLine2.y0);
  preContext.lineTo(snareLine2.x, snareLine2.y);

  preContext.strokeStyle = 'rgba(255, 105, 180, 0.5)';
  preContext.lineWidth = 2;
  preContext.stroke();

  //the animation loop:
  function animate(){

    if (key == 0){
      requestAnimationFrame(animate);
    };

    mu      =  1+m1/m2;
    d2Phi1  =  (g*(Math.sin(Phi2)*Math.cos(Phi1-Phi2)-mu*Math.sin(Phi1))-(l2*dPhi2*dPhi2+l1*dPhi1*dPhi1*Math.cos(Phi1-Phi2))*Math.sin(Phi1-Phi2))/(l1*(mu-Math.cos(Phi1-Phi2)*Math.cos(Phi1-Phi2)));
    d2Phi2  =  (mu*g*(Math.sin(Phi1)*Math.cos(Phi1-Phi2)-Math.sin(Phi2))+(mu*l1*dPhi1*dPhi1+l2*dPhi2*dPhi2*Math.cos(Phi1-Phi2))*Math.sin(Phi1-Phi2))/(l2*(mu-Math.cos(Phi1-Phi2)*Math.cos(Phi1-Phi2)));
    dPhi1   += d2Phi1*time;
    dPhi2   += d2Phi2*time;
    Phi1    += dPhi1*time;
    Phi2    += dPhi2*time;

    //remove multiples of 2pi:
    if(Phi1 < -pi){
      Phi1 += 2*pi;
    };

    if(Phi2 < -pi){
      Phi2 += 2*pi;
    };

    if(Phi1 > pi){
      Phi1 -= 2*pi;
    };

    if(Phi2 > pi){
      Phi2 -= 2*pi;
    };

    //unlock sounds if a target is passed:
    if (Phi1_prev < kicktarget && Phi1 > kicktarget){
      kickLock = 0;
    };
    if (Phi1_prev > kicktarget && Phi1 < kicktarget){
      kickLock = 0;
    };

    if (Phi1_prev < snaretarget && Phi1 > snaretarget){
      snareLock = 0;
    };
    if (Phi1_prev > snaretarget && Phi1 < snaretarget){
      snareLock = 0;
    };

    if (Phi1_prev < -snaretarget && Phi1 > -snaretarget){
      snareLock = 0;
    };
    if (Phi1_prev > -snaretarget && Phi1 < -snaretarget){
      snareLock = 0;
    };

    if (Phi2_prev < hattarget1 && Phi2 > hattarget1){
      hat1Lock = 0;
    };
    if (Phi2_prev > hattarget1 && Phi2 < hattarget1){
      hat1Lock = 0;
    };

    if (Phi2_prev < hattarget2 && Phi2 > hattarget2){
      hat2Lock = 0;
    };
    if (Phi2_prev > hattarget2 && Phi2 < hattarget2){
      hat2Lock = 0;
    };

    if (Phi2_prev < -hattarget2 && Phi2 > -hattarget2){
      hat2Lock = 0;
    };
    if (Phi2_prev > -hattarget2 && Phi2 < -hattarget2){
      hat2Lock = 0;
    };

    //exceptions:
    if(Phi1_prev/Math.abs(Phi1_prev) != Phi1/Math.abs(Phi1) && Math.abs(Phi1) > pi/2){
      kickLock = 1;
      snareLock = 1;
    };
    if(Phi2_prev/Math.abs(Phi2_prev) != Phi2/Math.abs(Phi2) && Math.abs(Phi2) > pi/2){
      hat1Lock = 1;
      hat2Lock = 1;
    };

    //create coordinates:
    myCircle1.x = X0+l1*Math.sin(Phi1);
    myCircle1.y = Y0+l1*Math.cos(Phi1);
    myCircle2.x = X0+l1*Math.sin(Phi1)+l2*Math.sin(Phi2);
    myCircle2.y = Y0+l1*Math.cos(Phi1)+l2*Math.cos(Phi2);

    myLine1.x  = myCircle1.x;
    myLine1.y  = myCircle1.y;
    myLine2.x0 = myCircle1.x;
    myLine2.y0 = myCircle1.y;
    myLine2.x  = myCircle2.x;
    myLine2.y  = myCircle2.y;

    hatLine1.x0= myLine2.x0;
    hatLine1.y0= myLine2.y0;
    hatLine1.x = X0+l1*Math.sin(Phi1)+l2*Math.sin(hattarget1);
    hatLine1.y = Y0+l1*Math.cos(Phi1)+l2*Math.cos(hattarget1);

    hatLine3.x0= myLine2.x0;
    hatLine3.y0= myLine2.y0;
    hatLine3.x = X0+l1*Math.sin(Phi1)-l2*Math.sin(hattarget2);
    hatLine3.y = Y0+l1*Math.cos(Phi1)+l2*Math.cos(hattarget2);

    hatLine2.x0= myLine2.x0;
    hatLine2.y0= myLine2.y0;
    hatLine2.x = X0+l1*Math.sin(Phi1)+l2*Math.sin(hattarget2);
    hatLine2.y = Y0+l1*Math.cos(Phi1)+l2*Math.cos(hattarget2);

    //reset the canvas:
    context.clearRect(0, 0, canvas.width, canvas.height);

    //draw trigger lines:
    context.drawImage(preCanvas, 0,0);

    context.beginPath();

    context.moveTo(hatLine1.x0, hatLine1.y0);
    context.lineTo(hatLine1.x, hatLine1.y);

    context.moveTo(hatLine2.x0, hatLine2.y0);
    context.lineTo(hatLine2.x, hatLine2.y);

    context.moveTo(hatLine3.x0, hatLine3.y0);
    context.lineTo(hatLine3.x, hatLine3.y);

    context.strokeStyle = 'rgba(255, 105, 180, 0.5)';
    context.lineWidth = 2;
    context.stroke();

    //draw pendulum lines:
    context.beginPath();

    context.moveTo(myLine1.x0, myLine1.y0);
    context.lineTo(myLine1.x, myLine1.y);

    context.moveTo(myLine2.x0, myLine2.y0);
    context.lineTo(myLine2.x, myLine2.y);

    context.strokeStyle = 'rgba(148, 0, 211, 1)';
    context.lineWidth = 2;
    context.stroke();

    //draw circles:
    context.beginPath();
    context.arc(myCircle1.x, myCircle1.y, myCircle1.mass, 0, 2 * pi, false);
    context.arc(myCircle2.x, myCircle2.y, myCircle2.mass, 0, 2 * pi, false);
    context.fillStyle = 'rgba(255, 165, 0, 1)';
    context.fill();

    //play sounds:
    if (kickLock == 0){
      //console.log('kick');
      var kick = new Audio('sounds/Asharp2.mp3');
      kick.play();
      // kick.currentTime = 0;
      kickLock = 1;
    } 
     
    if (snareLock == 0) {
      //console.log('snare');
      var snare = new Audio('sounds/G2.mp3');
      snare.play();
      // snare.currentTime=0;
      snareLock = 1;
    };

    if (hat1Lock == 0) {
      //console.log('hat1');
      var hat1 = new Audio('sounds/E3.mp3');
      hat1.play();
      // hat1.currentTime = 0;
      hat1Lock = 1;
    };

    if (hat2Lock == 0) {
      //console.log('hat2');
      var hat2 = new Audio('sounds/C2.mp3');
      hat2.play();
      hat2Lock = 1;
    };

    Phi1_prev = Phi1;
    Phi2_prev = Phi2;

  } /* end of animate() */

requestAnimationFrame(animate);
} /*end of run()*/