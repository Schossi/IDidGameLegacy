    
    
    FFPointerLock = function (_canvas, _callback,_onLock,_onUnlock) {
    		var that = this;
    
        this.canvas = _canvas;
        this.callback = _callback;
        this.onLock=_onLock;
        this.onUnlock=_onUnlock

        this.canvas.requestPointerLock = this.canvas.requestPointerLock ||
                            this.canvas.mozRequestPointerLock ||
                            this.canvas.webkitRequestPointerLock;

        document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock ||
                           document.webkitExitPointerLock;

        this.canvas.addEventListener("mousemove", function (e) {
        		var x=e.movementX ||
						      e.mozMovementX          ||
						      e.webkitMovementX       ||
						      0;
			      var y=e.movementY ||
						      e.mozMovementY      ||
						      e.webkitMovementY   ||
						      0;
      
            that.callback(x , y);
        });
        
        var lockChangeCallback=function(){
        	that.lockChangeAlert();
        }
        
        if ("onpointerlockchange" in document) {
				  document.addEventListener('pointerlockchange', lockChangeCallback, false);
				} else if ("onmozpointerlockchange" in document) {
				  document.addEventListener('mozpointerlockchange', lockChangeCallback, false);
				} else if ("onwebkitpointerlockchange" in document) {
				  document.addEventListener('webkitpointerlockchange', lockChangeCallback, false);
				}
    }
    FFPointerLock.prototype.request = function () {
        this.canvas.requestPointerLock();
    }
    FFPointerLock.prototype.exitPointerLock=function(){
        document.exitPointerLock();
    }
    FFPointerLock.prototype.lockChangeAlert = function() {
		  if(document.pointerLockElement  ||
		  document.mozPointerLockElement  ||
		  document.webkitPointerLockElement ) {
		    console.log('The pointer lock status is now locked');
		    this.onLock();
		  } else {
		    console.log('The pointer lock status is now unlocked');      
		    this.onUnlock();
		  }
		}
