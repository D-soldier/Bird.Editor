/**
 * Created by lucifer on 2016/4/11.
 */
Project = function(editor){

    this.version = 3;
    this.editor = editor;
    this.objectList = [];
    this.mirrors = [];
    this.lights = [];
    this.dirtList = [];
    this.imagesDir = [];
    this.projectRoot = {};

    //多材质编辑
    this.materials = {};
    this.ModelStyles = [];
    this.currentStyle = null;

    this.importModelDir = '';
    this.saveDir = '';

    this.sideBar;
    //loader

    this.zipObjectLoader = new Bird.ZipModelLoader();

    this.jsonObjectLoader = new THREE.ObjectLoader();

    this.daeLoader = new MyColladaLoader();
    this.daeLoader.options.upAxis = 'Y';
    this.daeLoader.options.convertUpAxis = true;
    this.daeLoader.textureSharedMap = {};

    this.init();
};

Project.prototype.init = function(sideBar){

    //this.sideBar = sideBar;
    this.projectRoot = new THREE.Group();
    this.projectRoot.name = 'Root';
};

Project.prototype.clearProject = function(){

    //this.outSideWallGroup = {};
    //this.floor = {};
    //this.roof = {};
    //this.inSideWall= {};
    this.objectList = [];
    this.lights = [];
    this.mirrors = [];
    this.dirtList = [];
    this.helpler = [];
    this.importModelDir = '';
    this.saveDir = '';

   // this.projectRoot.children = [];
    if(this.projectRoot.parent !== undefined) {
        this.projectRoot.parent.remove(this.projectRoot);
    }
    this.projectRoot = {};

};

Project.prototype.saveProject = function(){

    this.saveAsProject(this.saveDir);

};

Project.prototype.setObjectVisible = function(object, visible){

    if(object instanceof Array){
        for(var i = 0; i < object.length; i++) {
            object[i].visible = visible;
        }
    }else{
        object.visible = visible;
    }
};

Project.prototype.addLight = function(){

    var LightCount = 0;
    return function(lightType) {

        var light = new THREE[lightType]();
        light.name = lightType + LightCount;
        LightCount++;
        this.projectRoot.add(light);
        this.lights.push(light);
        this.editor.addObjectHelper(light);

    }

}();

Project.prototype.addMirror = function(mirrorMesh){

    this.projectRoot.add(mirrorMesh);
    this.mirrors.push(mirrorMesh);

};

Project.prototype.removeObject = function(object){

    this.removeObjectInList(this.lights, object);
    this.removeObjectInList(this.objectList, object);
    this.removeObjectInList(this.mirrors, object);

};

Project.prototype.removeObjectInList = function(list, object){

    for(var i = 0; i < list.length; i++){
        if(list[i] === object){
            list.splice(i, 1);
        }
    }
};

Project.prototype.ExportMirror = function(scene){

    for(var i = 0; i < this.mirrors.length; i++){
        var mirror = this.mirrors[i];
        var mirrorObject = {};
        mirrorObject.name = mirror.name;
        mirrorObject.matrix = mirror.matrix.toArray();
        scene.mirrorList.push(mirrorObject);
    }
};

Project.prototype.ExportLight = function( scene ) {

    for ( i = 0, l = this.lights.length; i < l; i++ ) {

        json = this.lights[ i ].toJSON();
        if ( json.object ) {

            light = {

              type: json.object.type,
              name: json.object.name,
              matrix: json.object.matrix,
              color: json.object.color,
              intensity: json.object.intensity

            };
            if ( json.object.groundColor !== undefined ) light.groundColor = json.object.groundColor;
            if ( json.object.distance !== undefined ) light.distance = json.object.distance;
            if ( json.object.angle !== undefined ) light.angle = json.object.angle;
            if ( json.object.decay !== undefined ) light.decay = json.object.decay;
            if ( json.object.penumbra !== undefined ) light.penumbra = json.object.penumbra;
            if ( json.object.castShadow !== undefined ) { light.castShadow = json.object.castShadow; }

            scene.lightList.push( light );

        }

    }

};


//复制源文件夹到目标文件夹
Project.prototype.copyImagesToTargetDir = function(sourceDir, targetDir){
    var _this = this;
    fs.readdir(sourceDir,function(err, files){
        if(err){
            console.log('readDir error!!!');
            return;
        }

        fs.readdir(targetDir, function(err){
            if(err){
                fs.mkdir(targetDir, function(err){
                    if(err){
                        console.error("make dir fail!"-yu);
                        return;
                    }

                    _this.copySourceDirToTargetDir(sourceDir, targetDir, files);

                });
            }

            _this.copySourceDirToTargetDir(sourceDir, targetDir, files);

        });

    });

};


Project.prototype.copyFile = function( sourceFile, targetDir ) {

    var fileName = sourceFile.splice('/');
    var fileName = fileName[fileName.length - 1];

    fs.readFile( sourceFile, function( err, data ) {

        if ( err ) {

            console.error('Read File Error!');

        }

        fs.writeFile( targetDir + '/' + fileName, data, function( err ){

            if (err) {

                console.error('Write File Error!');

            }

        });

    });

};

Project.prototype.copySourceDirToTargetDir = function(sourcePath, targetPath, fileList){

    function copyFile(sourceFile, targetFile){

        fs.readFile(sourceFile, function (err, data) {
            if (err) {
                console.log('read error')
            }

            fs.writeFile(targetFile, data, function (err) {
                if (err) {
                    console.log("save error");
                }
                console.log('saved');
            });
        });

    }

    for(var i = 0; i < fileList.length; i++) {
        var file = sourcePath + fileList[i];
        var targetFile = targetPath + fileList[i];

        copyFile(file, targetFile);

    }
};


Project.prototype.setSceneCameraPos = function(position){

    this.cameraPos = {};
    this.cameraPos.x = position.x;
    this.cameraPos.y = position.y;
    this.cameraPos.z = position.z;

    alert("已将当前相机位置设置为样板间初始位置！！");

};

Project.prototype.loadModelFromScene = function(url, scene, onload){

    this.importModelDir = url;
    this.saveDir = url;
    var fileBasePath = this.importModelDir + '/';
    this.onload = onload;
    scene.version = parseInt( scene.version);

    if ( scene.version < 2 ) {

        this.loadModel(fileBasePath, scene, this.loadJsonModel);
    
    } else {

        this.loadModel(fileBasePath, scene, this.loadZipModel);
    
    }

};

Project.prototype.loadLight = (function () {

    var matrix = new THREE.Matrix4();

    return function ( data ) {

        var object;

        switch ( data.type ) {

            case 'AmbientLight':

                object = new THREE.AmbientLight( data.color, data.intensity );

                break;

            case 'DirectionalLight':

                object = new THREE.DirectionalLight( data.color, data.intensity );

                break;

            case 'PointLight':

                object = new THREE.PointLight( data.color, data.intensity, data.distance, data.decay );

                break;

            case 'SpotLight':

                object = new THREE.SpotLight( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay );

                break;

            case 'HemisphereLight':

                object = new THREE.HemisphereLight( data.color, data.groundColor, data.intensity );

                break;

            default:

                object = null;

        }

        if ( object ) {

            if ( data.name !== undefined ) { object.name = data.name; }
            if ( data.matrix !== undefined ) {

                matrix.fromArray( data.matrix );
                matrix.decompose( object.position, object.quaternion, object.scale );

            }
            if ( data.castShadow !== undefined ) { object.castShadow = data.castShadow; }

        }

        return object;

    };

})();

Project.prototype.loadJsonModel = function() {

    var LoadCount = 0;
    var CallCount = 0;

    return function(filePath) {
        var _this = this;
        CallCount++;
        this.jsonObjectLoader.load(filePath, function (object) {

            _this.onLoadModel(object);
            _this.projectRoot.add(object);
            _this.sortModel(object);
            LoadCount++;
            if (CallCount === LoadCount) {
                _this.onload();
                CallCount = 0;
                LoadCount = 0;
            }
        });
    }
}();

Project.prototype.loadZipModel = function() {

    var LoadCount = 0;
    var CallCount = 0;

    return function(filePath) {

        var scope = this;
        CallCount++;
        this.zipObjectLoader.load(filePath, function ( model ) {

            var object = model.object;

            if ( model.styles !== undefined ) {

                scope.ModelStyles = model.styles;

            }

            scope.onLoadModel(object);
            scope.projectRoot.add(object);
            scope.sortModel(object);
            LoadCount++;
            if (CallCount === LoadCount) {

                scope.onload();
                CallCount = 0;
                LoadCount = 0;

            }

        });

    }

}();

Project.prototype.parseLight = function( lightList ) {

    for ( var i = 0, l = lightList.length; i < l; i ++ ) {

        var light = this.loadLight( lightList[ i ] );
        this.projectRoot.add( light );
        this.lights.push( light );

    }
}

Project.prototype.loadMirrorModel = function(mirrorList){

    for(var i = 0; i < mirrorList.length; i++){
        var mirror = mirrorList[i];
        this.editor.addMirror(mirror);
    }
};

Project.prototype.importModel = function(filePath, onload) {

    var _this = this;
    var parts = filePath.split('\\');
    parts.pop();
    this.importModelDir = ( parts.length < 1 ? '.' : parts.join('\\') ) + '\\';
    //this.workDir = filePath;
    this.daeLoader.load(filePath, function (object) {

        var model = object.scene;
        _this.onLoadModel(model);
        _this.projectRoot.add(model);
        for (var i = 0; i < model.children.length; i++) {
            _this.sortModel(model.children[i]);
        }

        // if ( object.animations.length !== 0 ) {

        //     _this.animationList = object.animations;

        // }

        if (onload !== undefined) {
            onload();
        }
        _this.daeLoader.reset();
    });
};

Project.prototype.ExportObjectToFile = function(object, Dirpath, objectName){

    if(object instanceof THREE.Object3D) {

        if(object.userData && object.userData.direction !== undefined){

            object.userData.direction.center = object.userData.direction.center.toArray();
            object.userData.direction.direction = object.userData.direction.direction.toArray();

        }

        var json = object.toJSON();

        if ( /main_/.test( object.name ) ) {

            if ( this.ModelStyles.length > 1 ) {
             
                json.styles = this.ModelStyles;
                
            }
            
        }

        if ( json.images !== undefined ) {

            //复制images图片到工程文件图片文件夹中
            this.getImageAndCopyToTargetDir( json.images );

        }

        if ( json.styles !== undefined ) {

            //获取images图片对象，复制图片
            for ( var i = 0; i < json.styles.length; i++ ) {

                var images = json.styles[i].materialLib.images;
                this.getImageAndCopyToTargetDir( images );

            }

        }
		
		var exportJsonfile = new exportJson();
        exportJsonfile.exportFile(Dirpath, json, objectName);

        //this.writeJsonToFile(Dirpath + '/' + objectName + '.js', this.JsonToString(json));

    }

}; 

Project.prototype.comparisonMaterial = function( material1, material2) {

    //对比两个材质，实现材质共享

}

Project.prototype.getImageAndCopyToTargetDir = function( images ) {

    var scope = this;

    for ( var i = 0; i < images.length; i++ ) {

        var image = images[i];
        var imageUrl = image.url;

        //解析文件名
        var fileName = imageUrl.split('/');
    
        if ( fileName.length === 1 ) {

            fileName = imageUrl.split('\\');

        }

        fileName = fileName[fileName.length - 1];

        //修改json文件中文件路径
        image.url = './images/' + fileName;

        var isImages = /^\.\/images/.test( imageUrl );

        if ( isImages ) {

            console.log('isImages image');
            scope.copyFileToTargetDir( this.importModelDir + imageUrl, scope.saveDir + '\\images\\', fileName)

        } else {

            scope.copyFileToTargetDir( imageUrl, scope.saveDir + '\\images\\', fileName);

        }

    }
};

Project.prototype.copyFileToTargetDir = function( sourceFile, targetDir, fileName ) {

    function copyFile(sourceFile, targetFile){

        fs.readFile(sourceFile, function (err, data) {

            if (err) {

                console.log('read error')

            }

            fs.writeFile(targetFile, data, function (err) {
                
                if (err) {
                
                    console.log("save error");

                }

                console.log('saved');

            });
            
        });

    }

    var targetFile = targetDir + '/' + fileName;

    fs.readdir(targetDir, function(err){

        if(err){

            fs.mkdir(targetDir, function(err){
                if(err){
                    console.error("make dir fail!"-yu);
                    return;
                }

                copyFile(sourceFile, targetFile );

            });
        }

        copyFile(sourceFile, targetFile );

    });

};

Project.prototype.modelAndStyleToJSON = function(object, styles){

    var scope = this;

};

Project.prototype.createModelStyle = function( name, object ) {

    var scope = this;

    //当前样式序列化
    scope.styleSerialization( scope.currentStyle );

    //创建新的样式
    object = object !== undefined ? object : scope.exhibition;

    var modelStyle = {};
    modelStyle.name = name;
    modelStyle.type = 'style';

    //清空材质缓存对象
    scope.materials = {};
    modelStyle.materialMaps = scope.getModelMaterialMaps( object );

    scope.ModelStyles.push( modelStyle );

    scope.currentStyle = modelStyle;
    return modelStyle;

};

Project.prototype.getModelMaterialMaps = function( object ) {

    function getMaterialMaps( node ){

        if (node.material !== undefined ) {

            node.material = node.material.clone();
            material = node.material;

            if ( scope.materials[material.uuid] === undefined ) {
            
               scope.materials[material.uuid] = material;

            }

            materialMaps[node.geometry.uuid] = node.material.uuid;

        }

    }

    var scope = this;
    var materialMaps = {};
    var material = {};

    object.traverse( getMaterialMaps );

    return materialMaps;

};

/**
 * 更换当前样式
 * @param styles index
 * @return bool
 *
 */
Project.prototype.changeCurrentStyle = function( index ) {

    var scope = this;
    scope.styleSerialization( scope.currentStyle );

    var style = scope.ModelStyles[index];

    if ( style === scope.currentStyle ) {

        return true;

    }

    if ( style !== undefined ) {

        scope.styleDeserialization( style, this.exhibition );
        scope.currentStyle = style;

    } else {

        return false;

    }

    return true;

};

Project.prototype.styleSerialization = function( style ) {

    if ( style === null ) {

        return;

    }

    var scope = this;
    var materialLib = scope.modelStyleToJSON( style );
    style.materialLib = materialLib;

};

Project.prototype.styleDeserialization = (function( style ) {

    var parse = new THREE.ObjectLoader();

    return function( style, object ){

        function getMaterial( name ) {

            if ( name === undefined ) return undefined;

            if ( materials[ name ] === undefined ) {

                console.warn( 'THREE.ObjectLoader: Undefined material', name );

            }

            return materials[ name ];

        }

        function changeMaterial( node ) {

            if (node.geometry !== undefined && materialMaps[node.geometry.uuid] !== undefined) {

                var materialuuid = materialMaps[node.geometry.uuid];
                node.material = getMaterial( materialuuid );
                node.material.needsUpdate = true;

            }

        }

        function parseImages( json, onLoad ) {

            var scope = this;
            var images = {};

            function loadImage( url ) {

                manager.itemStart( url );

                return loader.load( url, function () {

                    manager.itemEnd( url );

                } );

            }

            if ( json !== undefined && json.length > 0 ) {

                var manager = new THREE.LoadingManager( onLoad );

                var loader = new THREE.ImageLoader( manager );
                //loader.setCrossOrigin( this.crossOrigin );

                for ( var i = 0, l = json.length; i < l; i ++ ) {

                    var image = json[ i ];
                    var path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test( image.url ) ? image.url : scope.importModelDir + '/' + image.url;

                    images[ image.uuid ] = loadImage( path );
                    images[ image.uuid ].userDefinedSrc = path;

                }

            }

            return images;

        }

        function changeMesh() {

            object.traverse( changeMaterial );

            scope.materials = materials;

            style.materialLib = undefined;

        }

        if ( style.materialLib === undefined ) {

            return;

        }

        var scope = this;

        var materialLib = style.materialLib;
        parse.setTexturePath( scope.importModelDir );
        var images = parseImages( materialLib.images, changeMesh );
        var textures  = parse.parseTextures( materialLib.textures, images );
        var materials = parse.parseMaterials( materialLib.materials, textures );

        var materialMaps = style.materialMaps;

    }

})();

/**
 * 删除index制定的样式,成功返回true， 失败返回false
 * @param style index
 * @return bool
 */
Project.prototype.deleteModelStyle = function( index ) { 

    var scope = this;
    var result = false;
    var style = scope.ModelStyles[index];

    var materialMaps = style.materialMaps;

    for ( var i in materialMaps) {

        var materialuuid = materialMaps[i];

        if ( scope.materials[materialuuid] !== undefined ) {

            delete scope.materials[materialuuid];
            result = true;

        }

    }

    return result;

};

Project.prototype.modelStyleToJSON = function( style ){

    function extractFromCache ( cache ) {

        var values = [];
        for ( var key in cache ) {

            var data = cache[ key ];
            delete data.metadata;
            values.push( data );

        }
        return values;

    }

    var scope = this;
    var outPut = {};
    var meta = {
        materials: {},
        textures: {},
        images: {}
    };


    var style = style
    var materialMaps = style.materialMaps;

    for ( var j in materialMaps ) {

        var materialuuid = materialMaps[j];
        var material = scope.materials[materialuuid];
        meta.materials[material.uuid]  = material.toJSON( meta );

    }


    var materials = extractFromCache( meta.materials );
    var textures = extractFromCache( meta.textures );
    var images = extractFromCache( meta.images );

    if ( materials.length > 0 ){

        outPut.materials = materials;

    }

    if ( textures.length > 0 ) {

        outPut.textures = textures;

    }

    if ( images.length > 0 ) {

        outPut.images = images;

    }

    return outPut;

};

Project.prototype.writeJsonToFile = function( filepath, json){

    var writeCount = 0;
    var callCount = 0;
    return function( filepath, json) {
        callCount++;
        fs.writeFile(filepath, json, function (err) {
            if (err) {
                console.log("Write failed" + err);
                alert("保存失败!!");
                return;
            }
            console.log("Write completed");
            writeCount++;
            if(callCount === writeCount){
                alert("保存成功");
            }
        });
    }
}();

Project.prototype.JsonToString = function(jsonObject){

    if(Object === undefined){
        console.error('没有对象可以导出为json模型');
        return;
    }
    var outPut = "";
    try{
        outPut = JSON.stringify(jsonObject, null, '\t');
        outPut = outPut.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
    } catch(e) {
        outPut = JSON.stringify(jsonObject);
    }
    return outPut;

};

Project.prototype.mapNode = function(checktype, checkString, fun, model){
    var _this = this;
    var func = fun.bind(this);
    var checkReg = new RegExp(checkString);
    var checkResult = checkReg.test(model[checktype]);
    if(checkResult){
        func(model);
    }else{
        model.traverse(function(node){
            checkResult = checkReg.test(node[checktype]);
            if(checkResult){
                func(node);
            }
        });
    }
};

Project.prototype.createCubeCamera = function(mesh){

    if(mesh.userData && mesh.userData.cubeCamera !== undefined){
        var cubeCameraObject = mesh.userData.cubeCamera;
        var cubeCamera = this.editor.createCubeCamera(cubeCameraObject.cubeResolution);
        cubeCamera.uuid = cubeCameraObject.uuid;
        mesh.cubeCamera = cubeCamera;
        cubeCamera.userData.targetObject = mesh;

        if(mesh.material instanceof THREE.MultiMaterial){

            var materials = mesh.material.materials;
            var material;
            for(var i = 0; i < materials.length; i++){
                material = materials[i];
                if(cubeCameraObject.materials[material.uuid] !== undefined){
                    material.envMap = cubeCamera.renderTarget.texture;
                    // 标明该Texture来自动态创建的renderTarget
                    material.envMap.fromRenderTarget = true;
                    material.reflectivity = cubeCameraObject.materials[material.uuid];
                }
               
            }
        }else if(cubeCameraObject.materials[mesh.material.uuid] !== undefined){
            mesh.material.envMap = cubeCamera.renderTarget.texture;
            // 标明该Texture来自动态创建的renderTarget
            mesh.material.envMap.fromRenderTarget = true;
            mesh.material.reflectivity = cubeCameraObject.materials[mesh.material.uuid];
        }

    }
};


