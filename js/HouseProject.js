/**
 * Created by lucifer on 2016/5/12.
 */
/**
 * Created by lucifer on 2016/4/11.
 */
HouseProject = function(editor){

    Project.call(this, editor);
    this.type = 'house';

    this.outSideWallGroup = {};
    this.floor = {};
    this.roof = {};
    this.inSideWall= {};

};

HouseProject.prototype = Object.create(Project.prototype);
HouseProject.prototype.constructor = HouseProject;


HouseProject.prototype.closeProject = function(){

    this.outSideWallGroup = {};
    this.floor = {};
    this.roof = {};
    this.inSideWall= {};

    this.clearProject();

};

HouseProject.prototype.onLoadModel = function(model){

    this.mapNode('name', 'glass_window_', this.createWindow, model);
    this.mapNode('type', 'Mesh', this.createCubeCamera, model);

};

HouseProject.prototype.editWallDirection = function(editorWallDirectionState){

    this.setObjectVisible(this.inSideWall, editorWallDirectionState);
    this.setObjectVisible(this.floor, editorWallDirectionState);
    this.setObjectVisible(this.roof, editorWallDirectionState);
    this.setObjectVisible(this.objectList, editorWallDirectionState);

};

HouseProject.prototype.saveAsProject = function(saveDir){

    var i, l, json, light;
    this.saveDir = saveDir;
    var scene = {
        version: this.version,
        format:"zip",
        type: this.type,
        cameraPos:{
            "x": 0,
            "y": 12,
            "z": 8
        },
        mirrorList:[],
        lightList:[],
        floor:"Floor",
        outsidewall:"OutSideWall",
        insidewall:"InSideWall",
        roof:"Roof",
        modelList:[]
    };

    if(this.cameraPos !== undefined) {
        scene.cameraPos = this.cameraPos;
    }
    this.ExportObjectToFile(this.outSideWallGroup, saveDir, "OutSideWall");
    this.ExportObjectToFile(this.inSideWall, saveDir, "InSideWall");
    this.ExportObjectToFile(this.floor, saveDir, "Floor");
    this.ExportObjectToFile(this.roof, saveDir, "Roof");

    for ( i = 0, l = this.objectList.length; i < l; i++ ) {
        objectName = this.objectList[i].name;
        this.ExportObjectToFile(this.objectList[i], saveDir, objectName);
        scene.modelList.push(objectName);
    }

    this.ExportLight( scene );

    this.ExportMirror(scene);
    this.writeJsonToFile(saveDir + "/scene.json", this.JsonToString(scene));
    this.copyImagesToTargetDir(this.importModelDir + 'images\\', saveDir + '\\images\\');

};

HouseProject.prototype.loadModel = function(fileBasePath,scene, loadFun){

    var i, l, light;

    var fun = loadFun.bind(this);

    fun(fileBasePath + scene.floor);
    fun(fileBasePath + scene.outsidewall);
    fun(fileBasePath + scene.insidewall);
    
    for(var i = 0; i < scene.modelList.length; i++) {
        fun(fileBasePath + scene.modelList[i]);
    }
    
    this.loadMirrorModel(scene.mirrorList);

    if ( scene.version < 3 ) {

        for ( i = 0, l = scene.lightList.length; i < l; i ++ ) {
        
            fun(fileBasePath + scene.lightList[i]);

        }

    } else {

        this.parseLight( scene.lightList );

    }
    
    fun(fileBasePath + scene.roof);

};

HouseProject.prototype.sortModel = function(node){

    var isRoof = /RoofGroup/.test(node.name);
    var isFloorGroup = /FloorGroup/.test(node.name);
    var isFloor = /floor/.test(node.name);
    var isOutSideWallGroup = /hide_WallGroup/.test(node.name);
    var isInSideWall = /WallGroup/.test(node.name);
    var isLight = /Light/.test(node.type);
    if(isRoof){
        this.roof = node;
    }else if(isFloor || isFloorGroup){
        this.floor = node;
    }else if(isOutSideWallGroup){
        this.outSideWallGroup = node;
    }else if(isInSideWall){
        this.inSideWall = node;
    }else if(isLight) {
        this.lights.push(node);
    }else{
        this.objectList.push(node);
    }

};

HouseProject.prototype.createWindow = function(model){

    var _this = this;
    model.traverse(function (node) {

        var childNode = node.children[0];
        if (childNode && childNode.type === 'Mesh') {
            var texture = _this.createEquirecTexture('glass_window_00');
            if (texture === undefined) {
                return;
            }


            if(childNode.material.envMap === null){

                childNode.material.emissive.set(0xffffff);
                childNode.material.envMap = texture;
                childNode.material.needsUpdate = true;

            }

        }
    });
};

HouseProject.prototype.createEquirecTexture = (function(){

    var loader = new THREE.ImageLoader();
    return function(name) {

        var texture = new THREE.Texture();

        var imageUrl = this.importModelDir + '/images/' + name + '.jpg';
        //var imageUrl = './images/' + name + '.jpg';
        loader.load(imageUrl, function(image){
            texture.image = image;
            texture.needsUpdate = true;
        });

        texture.format = THREE.RGBAFormat;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;

        return texture;
    };
})();

HouseProject.prototype.removeRedundantObject3Ds = function () {

    Utils.removeRedundantObject3Ds( this.roof );
    Utils.removeRedundantObject3Ds( this.floor );
    Utils.removeRedundantObject3Ds( this.outSideWallGroup );
    Utils.removeRedundantObject3Ds( this.inSideWall );

    for ( var i = 0, l = this.objectList.length; i < l; i ++ ) {

        Utils.removeRedundantObject3Ds( this.objectList[ i ] );

    }

};