var down = false;
var dragBegin;
var objectSelected = true;

//Get mouse position
function getMousePos(event,normalize=true) {
    var rect = canvas.getBoundingClientRect();
	if(normalize==false)
		return {
		  x: (event.clientX - rect.left-20),
		  y: (rect.bottom - event.clientY-20)
		};
	
	return {
		  x: (event.clientX - rect.left)/rect.width -1/2,
		  y: (event.clientY - rect.top)/rect.height -1/2
		};
	
}

var prevColors= null;
//Check if object selected by mouse
function isObjectSelected(event){

	let pixels = new Uint8Array(4); // A single RGBA value
	let mousePos = getMousePos(event,false);
	let canv = document.getElementById( "gl-canvas" );
	var context = canv.getContext('webgl', {preserveDrawingBuffer: true});
	let mainObj = objects[objects.length-1];
	prevColors = copy(mainObj.colors);

	for(i=0;i<mainObj.colors.length;i++)
		mainObj.colors[i]= [255,255,255,0];
	
	buffer(mainObj);
	context.readPixels(mousePos.x, mousePos.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	console.log(pixels);
	if(pixels.reduce((a, b) => a + b, 0) == 0 || pixels[3]!=0){
		mainObj.colors = prevColors;
		prevColors = null;
	}
	return pixels[0]!=0 && pixels[3]==0;
	
}

//Mouse pressed
window.onmousedown = function(event){
	//Save current mouse position
	dragBegin =  {
	  x: event.clientX,
	  y: event.clientY
	};
	down = true;
	if(event.button!=4)
		objectSelected= isObjectSelected(event);
	
}

//Mouse released
window.onmouseup= function(event){
	down = false;
	
	if(objectSelected && prevColors != null){
		let mainObj = objects[objects.length-1];
		mainObj.colors = prevColors;
		prevColors = null;
	}
	objectSelected=false;
}

//Mouse moved
window.onmousemove = function(event){
	if(!down) return;
	
	
	
	let x_change = (event.clientX-dragBegin.x)/25;
	let y_change = (event.clientY-dragBegin.y)/25;
	//If pressed mouse button is wheel, event.buttons == 4
	if(event.buttons == 4){
		//Change camera coordinates
		cameraCoord[0] += -x_change/10;
		cameraCoord[1] += y_change/10;
		gl.uniform2fv(cameraCoordLoc, cameraCoord);
	}
	else{
		if(objectSelected){
				if(x_change!=0 && Math.abs(x_change/2)>=move_scale){
					let directionX = Math.abs(x_change)/x_change > 0 ? directions.RIGHT : directions.LEFT;
					moveSound.play();
					move(objects[objects.length-1],move_scale,directionFix(directionX));
				}
				if(y_change!=0 && Math.abs(y_change/2)>=move_scale ){
					let directionZ = Math.abs(y_change)/y_change > 0 ? directions.FRONT : directions.BEHIND;
					moveSound.play();
					move(objects[objects.length-1],move_scale,directionFix(directionZ));
				}
			}
		else{
			//Rotate camera for given 
			rotateCamera(directions.LEFT,scale=x_change);
			rotateCamera(directions.UP ,scale=y_change);
		}
	}
	//Update current mouse coordinates
	dragBegin.x = event.clientX;
	dragBegin.y = event.clientY;
	 
}

//Mouse Wheel rotated
window.addEventListener('wheel', ({ deltaY }) => {

	//ZOOM
	
	let mousePos = getMousePos(event);
	cameraTheta[3] += deltaY/3000;
	
	//IF zoomed out then get camera coordinates to normal
	if(deltaY>0)
		cameraCoord = [0.2,0];
	
	//Zoom In
	else{
		cameraCoord[0] += -mousePos.x;
		cameraCoord[1] += mousePos.y;
	}

	//Update variables
	gl.uniform2fv(cameraCoordLoc, cameraCoord);
	gl.uniform4fv(camera_theta_loc, cameraTheta);
});

//Key pressed
window.onkeydown = function(event) {
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	
	switch(key){
		
		//Camera Rotation
		case '&': //yukarı
			rotateCamera(directions.UP);
			break;
		case '%':  //sol
			rotateCamera(directions.LEFT);
			break;
		case '(': //aşağı
			rotateCamera(directions.DOWN);
			break;
		case '\'': //sağ
			rotateCamera(directions.RIGHT);
			break;
			
		//Object Rotation
		case 'q':
			rotateSound.play();
			rotateS(objects[objects.length-1],directions.UP);
			break;
		case 'e':
			rotateSound.play();
			rotateS(objects[objects.length-1],directions.LEFT);
			break;
			
		//Object Movement
		case 'w':
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.BEHIND));
			break;
		case 'a':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.LEFT));
			break;
		case 's':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.FRONT));
			break;
		case 'd':
		
			moveSound.play();
			move(objects[objects.length-1],move_scale,directionFix(directions.RIGHT));
			break;
			
		//Gravity
		case ' ':
			if(gravity_speed!=SPACE_SPEED)
				fallSound.play();
			gravity_speed = SPACE_SPEED;
			break;
			
	}
}

//Key released
window.onkeyup = function(){
	let key = String.fromCharCode(event.keyCode).toLowerCase();
	
	switch(key){
		//If you release spacebar, set gravity speed to default
		case ' ':
			gravity_speed = gravity_speed_init;
			break;
	}
}
