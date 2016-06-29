/**
 * Created by lucifer on 2016/5/12.
 */
EstateProject = function(editor){

    Project.call(this, editor);
    this.type = 'estate';
    this.ground = {};
    this.buildings = {};

};

EstateProject.prototype = Object.create(Project.prototype);
EstateProject.prototype.constructor = EstateProject;

EstateProject.prototype.closeProject = function(){

    this.ground = {};
    this.buildings = {};

    this.clearProject();

};

EstateProject.prototype.onLoadModel = function(model){

    this.addBuildingBillBoard(model);
};

EstateProject.prototype.saveAsProject = function(saveDir){

    this.saveDir = saveDir;
    var scene = {
        version: this.version,
        format:"zip",
        type: this.type,
        cameraPos:{
            "x": 0,
            "y": 102,
            "z": 80
        },

        ground:"Ground",
        buildings:"Buildings",
        lightList:[],
        modelList:[]
    };

    if(this.cameraPos !== undefined) {
        scene.cameraPos = this.cameraPos;
    }


    this.ExportObjectToFile(this.ground, saveDir, "Ground");
    this.getBuildingsBillBoard(this.buildings);
    this.ExportObjectToFile(this.buildings, saveDir, "Buildings");

    this.ExportLight( scene );

    for( i = 0; i < this.objectList.length; i++) {
        objectName = this.objectList[i].name;
        this.ExportObjectToFile(this.objectList[i], saveDir, objectName);
        scene.modelList.push(objectName);
    }

    this.writeJsonToFile(saveDir + "/scene.json", this.JsonToString(scene));
    this.copyImagesToTargetDir(this.importModelDir + 'images\\', saveDir + '\\images\\');

    this.addBuildingBillBoard(this.buildings);

};

EstateProject.prototype.getBuildingsBillBoard = function(buildings){

    buildings.traverse(function(node){

        var isBillBoard = /billBoard/.test(node.name);
        if(isBillBoard){

            var billBoard = {};
            var parent = node.parent;
            parent.remove(node);
            billBoard.uuid = node.uuid;
            billBoard.matrix = node.matrix.toArray();
            billBoard.type = node.type;

            parent.userData.billboard = billBoard;

        }
    });

    //return buildings;
};

EstateProject.prototype.addBuildingBillBoard = function(buildings){

    var scope = this;
    buildings.traverse(function(node){

        if(node.userData && node.userData.billboard !== undefined){

            var billBoard = scope.createBillBoard(node.userData.ProductID, node.userData.billboard);
            billBoard.userData.target = node;
            node.add(billBoard);
            node.userData.billboard = billBoard.uuid;
        }
    });
};

EstateProject.prototype.createBillBoard = function(buildingNum, parameters){

    if(buildingNum === undefined){
        buildingNum = '#';
    }
    var texture = this.createBillBoardTexture('./source/noselect.png', buildingNum);
    var bildBoardMaterial = new THREE.SpriteMaterial({map: texture});
    var sprite = new THREE.Sprite(bildBoardMaterial);
    sprite.scale.multiplyScalar(12);
    sprite.name = 'billBoard';

    if(parameters !== undefined){
        var matrix = new THREE.Matrix4().fromArray(parameters.matrix);
        sprite.applyMatrix(matrix);
        sprite.uuid = parameters.uuid;
    }
    return sprite;
};

EstateProject.prototype.createBillBoardTexture = function(){

    var imageLoader = new THREE.ImageLoader();
    return function(url, num){

        var canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        var texture = new THREE.Texture(canvas);
        imageLoader.load( url , function(img){

            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            ctx.font = 'Bold 22px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(num, 27, 62);

            texture.needsUpdate = true;
        });

        return texture;
    }
}();

EstateProject.prototype.loadModel = function(fileBasePath, scene, loadFun){

    var fun = loadFun.bind(this);
    fun(fileBasePath + scene.ground);
    fun(fileBasePath + scene.buildings);

    for(var i = 0; i < scene.lightList.length; i++) {
        fun(fileBasePath + scene.lightList[i]);
    }

    for(var i = 0; i < scene.modelList.length; i++) {
        fun(fileBasePath + scene.modelList[i]);
    }

    
    if ( scene.version < 3 ) {

        for ( i = 0, l = scene.lightList.length; i < l; i ++ ) {
        
            fun(fileBasePath + scene.lightList[i]);

        }

    } else {

        this.parseLight( scene.lightList );

    }

};

EstateProject.prototype.sortModel = function(node){

    var isGround = /ground/.test(node.name);
    var isBuilding = /buildings/.test(node.name);
    var isLight = /Light/.test(node.type);

    if(isGround){
        this.ground = node;
    }else if(isBuilding){
        this.buildings = node;
    }else if(isLight){
        this.lights.push(node);
    }else{
        this.objectList.push(node);
    }
};
