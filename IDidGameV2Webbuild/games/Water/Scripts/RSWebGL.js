
var RSWebGL = (function (pub, undefined) {
    "use strict";
    var swapActive = false;

    pub.sheets = [];

    function createShader(str, type) {
        var shader =pub.gl.createShader(type);
       pub.gl.shaderSource(shader, str);
       pub.gl.compileShader(shader);
        if (!pub.gl.getShaderParameter(shader,pub.gl.COMPILE_STATUS)) {
            throw pub.gl.getShaderInfoLog(shader);
        }
        return shader;
    }

    function createProgram(vstr, fstr) {
        var program =pub.gl.createProgram();
        var vshader = createShader(vstr,pub.gl.VERTEX_SHADER);
        var fshader = createShader(fstr,pub.gl.FRAGMENT_SHADER);
       pub.gl.attachShader(program, vshader);
       pub.gl.attachShader(program, fshader);
       pub.gl.linkProgram(program);
        if (!pub.gl.getProgramParameter(program,pub.gl.LINK_STATUS)) {
            throw pub.gl.getProgramInfoLog(program);
        }
        return program;
    }

    function linkProgram(program) {
        var vshader = createShader(program.vshaderSource,pub.gl.VERTEX_SHADER);
        var fshader = createShader(program.fshaderSource,pub.gl.FRAGMENT_SHADER);
       pub.gl.attachShader(program, vshader);
       pub.gl.attachShader(program, fshader);
       pub.gl.linkProgram(program);
        if (!pub.gl.getProgramParameter(program,pub.gl.LINK_STATUS)) {
            throw pub.gl.getProgramInfoLog(program);
        }
    }

    function loadFile(file, callback, noCache, isJson) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 1) {
                if (isJson) {
                    request.overrideMimeType('application/json');
                }
                request.send();
            } else if (request.readyState == 4) {
                if (request.status == 200) {
                    callback(request.responseText);
                } else if (request.status == 404) {
                    throw 'File "' + file + '" does not exist.';
                } else {
                    throw 'XHR error ' + request.status + '.';
                }
            }
        };
        var url = file;
        if (noCache) {
            url += '?' + (new Date()).getTime();
        }
        request.open('GET', url, true);
    }

    function loadProgram(vs, fs, callback) {
        var program =pub.gl.createProgram();
        function vshaderLoaded(str) {
            program.vshaderSource = str;
            if (program.fshaderSource) {
                linkProgram(program);
                callback(program);
            }
        }
        function fshaderLoaded(str) {
            program.fshaderSource = str;
            if (program.vshaderSource) {
                linkProgram(program);
                callback(program);
            }
        }
        loadFile(vs, vshaderLoaded, true);
        loadFile(fs, fshaderLoaded, true);
        return program;
    }

    function initProgram(program) {
        var gl = pub.gl;

        pub.program = program;
        pub.gl.useProgram(program);

        var resolutionLocation = pub.gl.getUniformLocation(program, "u_resolution");
        pub.gl.uniform2f(resolutionLocation, pub.canvas.width, pub.canvas.height);


        program.swapColorUniform= gl.getUniformLocation(program, 'uSwapColor');
        program.swapUniform = gl.getUniformLocation(program, 'uSwap');

        program.samplerUniform = gl.getUniformLocation(program, 'uSampler');
        program.scaleUniform = gl.getUniformLocation(program, 'uScale');
        program.transformUniform = gl.getUniformLocation(program, 'uTransform');
        program.multiplyUniform = gl.getUniformLocation(program, 'uMultiply');
        program.fragOffsetUniform = gl.getUniformLocation(program, 'uFragOffset');

        pub.scale = { x: 1, y: 1 };
        pub.transform = { x: 0, y: 0 };

        
        pub.swapColorLocation = pub.gl.getAttribLocation(program, "aSwapColor");
        pub.swapColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pub.swapColorBuffer);
        pub.swapColorBuffer.itemSize = 4;
        pub.swapColorArr = [];

        program.swapColorAttrib = pub.swapColorLocation;
        gl.enableVertexAttribArray(pub.swapColorLocation);
        gl.vertexAttribPointer(program.swapColorAttrib, pub.swapColorBuffer.itemSize, gl.FLOAT, false, 0, 0);


        pub.positionLocation = pub.gl.getAttribLocation(program, "aVertexPosition");
        pub.vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pub.vertexPosBuffer);
        pub.vertexPosBuffer.itemSize = 2;
        pub.vertexArr = [];

        program.vertexPosAttrib = pub.positionLocation;
        gl.enableVertexAttribArray(pub.positionLocation);
        gl.vertexAttribPointer(program.vertexPosAttrib, pub.vertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        

        pub.texPosLocation = pub.gl.getAttribLocation(program, "aTexPosition");
        pub.texPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pub.texPosBuffer);
        pub.texPosBuffer.itemSize = 2;
        pub.texArr = [];

        program.texPosAttrib = pub.texPosLocation;
        gl.enableVertexAttribArray(pub.texPosLocation);
        gl.vertexAttribPointer(program.texPosAttrib, pub.texPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);

        pub.loaded = true;
    }


    pub.screenQuad = function (x, y, width, height,add) {
        var gl = pub.gl;

        var vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        /*var vertices = [    0, 0,
                            0.5, 0,
                            0, 0.5,
                            0.5, 0.5,
                            -0.5, -0.5,
                            -1, -0.5,
                            0.5, -1,
                            -1, -1];*/

        var vertices = [];
        vertices.push(x, y,
                    x + width, y,
                    x, y + height,
                    x + width, y + height,
                    x + width, y,
                    x, y + height);
        if (add) {
            x += 0.5;
            //y += 1;
        }
        else {
            x += 0.5;
        }
        vertices.push(x, y,
                   x + width, y,
                   x, y + height,
                   x + width, y + height,
                   x + width, y,
                   x, y + height);

        if (add) {
            y += 0.5;
        }
        else {
            y += 0.5;
        }
        vertices.push(x, y,
                   x + width, y,
                   x, y + height,
                   x + width, y + height,
                   x + width, y,
                   x, y + height);

        if (add) {
            y += 0.5;
        }
        else {
        }
        vertices.push(x, y,
                   x + width, y,
                   x, y + height,
                   x + width, y + height,
                   x + width, y,
                   x, y + height);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        vertexPosBuffer.itemSize = 2;
        vertexPosBuffer.numItems = vertices.length/2;

        /*
         2___3
         |\  |
         | \ |
         |__\|
         0   1
        */
        return vertexPosBuffer;
    };



    pub.SetGeoColor = function (r, g, b, a) {
        pub.geoColorLocation = pub.gl.getUniformLocation(pub.program, "u_geoColor");
        pub.gl.uniform4f(pub.geoColorLocation, r, g, b, a);
    }
    pub.addBuffer = function (posX, posY, texX, texY) {
        var texQuantity = 2,
            width = 1 / texQuantity, height = 1 / texQuantity,
            x, y;

        texY = texQuantity - texY - 1;

        texX /= texQuantity;
        texY /= texQuantity;

        x = posX - texX;
        y = posY - texY;

        pub.texArr.push(x, y,
                   x + width, y,
                   x, y + height,
                   x + width, y + height,
                   x + width, y,
                   x, y + height);

        x = texX;
        y = texY;

        pub.vertexArr.push(x, y,
                   x + width, y,
                   x, y + height,
                   x + width, y + height,
                   x + width, y,
                   x, y + height);
    };

    pub.init = function (_canvas, _vs, _fs) {
        pub.canvas = _canvas;
        pub.gl = pub.canvas.getContext("webgl");
        pub.gl.blendFunc(pub.gl.ONE, pub.gl.ONE_MINUS_SRC_ALPHA);
        loadProgram(_vs, _fs, initProgram);
    }
    pub.initTexture = function (_image) {
        var gl = pub.gl;

        var texture = gl.createTexture();
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        return texture;
    };
    pub.clear = function () {
        pub.gl.clearColor(0, 0, 0, 1);
        pub.gl.clear(pub.gl.COLOR_BUFFER_BIT);
    };
    pub.setUniforms = function () {
        var gl = pub.gl,
            program = pub.program,
            i;

        gl.uniform1i(program.swapUniform, 0);
        gl.uniform1i(program.samplerUniform, 0);
        gl.uniform2f(program.scaleUniform, pub.scale.x, pub.scale.y);
        gl.uniform2f(program.transformUniform, pub.transform.x, pub.transform.y);
        gl.uniform2f(pub.program.fragOffsetUniform, 0, 0);
    };
    pub.setMultiply = function (_r, _g, _b) {
        pub.gl.uniform4f(pub.program.multiplyUniform, _r, _g, _b, 1);
    };
    pub.setSwap = function (_r, _g, _b) {
        swapActive = true;
        pub.gl.uniform1i(pub.program.swapUniform, 1);
        pub.gl.uniform4f(pub.program.swapColorUniform, _r, _g, _b, 1);
    };
    pub.resetSwap = function () {
        if (swapActive) {
            gl.uniform1i(program.swapUniform, 1);
        }
        swapActive = false;
    }
    pub.setFragOffset = function (_x, _y) {
        pub.gl.uniform2f(pub.program.fragOffsetUniform, _x, _y);
    };

    pub.SpriteSheetGL = function () { };
    pub.SpriteSheetGL.init = function (_image,_texSize,_maxSize) {
        this.image = _image;
        this.imgWidth = this.image.width;
        this.imgHeight = this.image.height;

        this.texQuantity = this.image.width / _texSize;
        this.texture = pub.initTexture(_image);
        this.size = 0;
        this.swapSize = 0;
        this.maxSize = _maxSize;
        this.vertexArr = new Float32Array(this.maxSize);
        this.texArr = new Float32Array(this.maxSize);
        this.active = true;

        this.swapArr = new Float32Array(this.maxSize * 2);
    };
    pub.SpriteSheetGL.add = function (posX, posY, texX, texY, _width, _height) {
        var texQuantity = this.texQuantity,
            gap=2/this.imgWidth,
            width = 1 / texQuantity, height = 1 / texQuantity,
            preWidth = _width || 1, preHeight = _height || 1,
            x, y,
            tempX, tempY;

        if (!this.active) {
            return;
        }

        
        posX = posX / (32 * texQuantity) * 60;
        posY = posY / (32 * texQuantity) * 60;
          

        width *= preWidth;
        height *= preHeight;
                
        width -= gap * 2 * preWidth;
        height -= gap * 2 * preHeight;
        

        texX /= texQuantity;
        texY /= texQuantity;

        texX += gap;
        texY += gap;

        x = posX - texX;
        y = posY - texY;

        this.addQuad(this.texArr, x, y, width, height);

        x = texX;
        y = texY;

        this.addQuad(this.vertexArr, x, y, width, height);

        this.size += 12;
    };
    pub.SpriteSheetGL.addQuad = function (arr, x, y, width, height) {
        var size = this.size;

        arr[size+0]=x;
        arr[size+1]=y;

        arr[size+2]=x+width;
        arr[size+3]=y;
        
        arr[size+4]=x;
        arr[size+5]=y+height;

        arr[size+6]=x+width;
        arr[size+7]=y+height;
        
        arr[size+8]=x+width;
        arr[size+9]=y;
        
        arr[size+10]=x;
        arr[size+11]=y+height;

    };
    pub.SpriteSheetGL.addSwap = function (_r, _g, _b) {
        var i = 0;

        for (i = 0; i < 24; i += 4) {
            this.swapArr[this.swapSize + i] = _r;
            this.swapArr[this.swapSize + i + 1] = _g;
            this.swapArr[this.swapSize + i + 2] = _b;
            this.swapArr[this.swapSize + i + 3] = 1;
        }

        this.swapSize += 24;
    };
    pub.SpriteSheetGL.draw = function () {
        var gl = pub.gl;

        //pub.setFragOffset(1 / (this.imgWidth * 2), 1 / (this.imgHeight * 2));

        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        gl.bindBuffer(gl.ARRAY_BUFFER, pub.swapColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.swapArr.subarray(0, this.size * 2), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, pub.vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArr.subarray(0,this.size), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, pub.texPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.texArr.subarray(0,this.size), gl.STATIC_DRAW);
                
        gl.drawArrays(gl.TRIANGLES, 0, this.size / 2);
        this.size = 0;
        this.swapSize = 0;
    };

    return pub;
}(RSWebGL || {}, undefined));

