/**
 * Created by lucifer on 2016/5/17.
 */
Exhibition = function(editor){

    Project.call(this, editor);
    this.type = 'exhibition';
    this.exhibition = {};
    this.size = {};
    
    //animation
    this.animations = [];
    this.currentAnimation = null;

};

Exhibition.prototype = Object.create(Project.prototype);
Exhibition.prototype.constructor = Exhibition;

Exhibition.prototype.closeProject = function(){

    this.exhibition = {};
    this.size = {};
    this.clearProject();

};

Exhibition.prototype.onLoadModel = function(model){

    this.mapNode('type', 'Mesh', this.createCubeCamera, model);
};

Exhibition.prototype.saveAsProject = function(saveDir){

    
    this.animationStop();

    this.saveDir = saveDir;
    var scene = {
        version: this.version,
        format:"zip",
        type: this.type,
        cameraPos:{
            "x": 0,
            "y": 1.6,
            "z": 2
        },
        exhibition:this.exhibition.name,
        lightList:[],
        mirrorList:[],
        animations: 'Animation.json'

    };

    if(this.cameraPos !== undefined) {
        scene.cameraPos = this.cameraPos;
    }

    this.styleSerialization( this.currentStyle );

    this.ExportObjectToFile(this.exhibition, saveDir, this.exhibition.name);

    if(this.size !== undefined){
        scene.size = this.size.name;
        this.ExportObjectToFile(this.size, saveDir, this.size.name);
    }

    this.ExportLight( scene );
    this.ExportMirror(scene);

    //save Animation
    var animationJson = this.animationsToJson( this.animations );
    this.writeJsonToFile(saveDir + "/Animation.json", this.JsonToString(animationJson));

    this.writeJsonToFile(saveDir + "/scene.json", this.JsonToString(scene));
    //this.copyImagesToTargetDir(this.importModelDir + 'images\\', saveDir + '\\images\\');

};

Exhibition.prototype.loadModel = function(fileBasePath, scene, loadFun){

    var fun = loadFun.bind(this);

    fun(fileBasePath + scene.exhibition);

    if(scene.size !== undefined) {
        fun(fileBasePath + scene.size);
    }


    if ( scene.version < 3 ) {

        for ( i = 0, l = scene.lightList.length; i < l; i ++ ) {
        
            fun(fileBasePath + scene.lightList[i]);

        }

    } else {

        this.parseLight( scene.lightList );

    }

    this.loadAnimationModel( fileBasePath + scene.animations );

    this.loadMirrorModel(scene.mirrorList);
};

Exhibition.prototype.sortModel = function(node){

    var isExhibition = /main_/.test(node.name);
    var isSizeLayer = /size_/.test(node.name);
    var isLight = /Light/.test(node.type);
    if ( isExhibition ) {

        this.exhibition = node;
       // this.createModelStyle('default', this.exhibition);

       if ( this.ModelStyles.length === 0 ) {

            this.editor.addModelStyle( 'default' );

        }

    }else if ( isSizeLayer ) {
        
        this.size = node;

    }else if ( isLight ) {
        
        this.lights.push(node);
        
    }
};

//动画
Exhibition.prototype.setCurrentAnimationByIndex = function( index ) {

    var scope = this;
    if ( scope.currentAnimation !== scope.animations[index] ) {

        if ( scope.currentAnimation !== null ) {
            
            scope.animationStop();

        }

        scope.currentAnimation = scope.animations[ index ];
        var animationClips = scope.currentAnimation.animationClips;

        var animationMixers = [];
        var animationActions = [];
        for ( var i = 0; i < animationClips.length; i++ ) {

            var animationMixer = new THREE.AnimationMixer( scope.projectRoot );
            var animationAction = animationMixer.clipAction( animationClips[i]);
            animationMixers.push( animationMixer );
            animationActions.push( animationAction );

        }
        
        scope.currentAnimation.animationMixers = animationMixers;
        scope.currentAnimation.animationActions = animationActions;

    }

};

Exhibition.prototype.animationsToJson = function( animationList ) {

    var AnimationJson = {};

    for ( var i = 0; i < animationList.length; i++ ) {

        var animation = animationList[i];
        var name = animation.name;
        var id = animation.id;
        var clips = [];
        AnimationJson[name] = {

            name:name,
            id: id,
            clips: clips

        };

        var animationClips = animation.animationClips;

        for ( var c = 0; c < animationClips.length; c++ ) {

            var clip = animationClips[c];
            var clipJson = THREE.AnimationClip.toJSON( clip );

            clips.push( clipJson );

        }

    }

    return AnimationJson;

};

Exhibition.prototype.animationPlay = function( ) {

    var scope = this;
    var animationActions = scope.currentAnimation.animationActions;

    for ( var i = 0; i < animationActions.length; i++ ) {

        animationActions[i].play();

    }

};

Exhibition.prototype.animationPause = function() {

    var scope = this;
    var animationActions = scope.currentAnimation.animationActions;

    for ( var i = 0; i < animationActions.length; i++ ) {

        animationActions[i].paused = !animationActions[i].paused;

    }

};

Exhibition.prototype.animationStop = function(){

    var scope = this;

    var animationActions = scope.currentAnimation.animationActions;

    for ( var i = 0; i < animationActions.length; i++ ) {

        animationActions[i].stop();

    }

};

Exhibition.prototype.loadAnimationModel = (function( ) {

    var animationLoader = new THREE.XHRLoader();

    return function( filePath ) {

        var scope = this;

        animationLoader.load( filePath, function( text ){

            var animationJson = JSON.parse( text );

            var animations = scope.animationJsonToAnimations( animationJson );

            scope.animations = animations;

            if ( scope.onload !== undefined ) {
                
                scope.onload();

            }

        });
    }

})();

Exhibition.prototype.animationJsonToAnimations = function( json ) {

    var animations = [];

    for ( var i in json ) {

        var aniJson = json[i];
        var animation = {};
        animation.name = aniJson.name;
        animation.id = aniJson.id;
        var clips = aniJson.clips;
        var animationClipList = [];

        for ( var c = 0; c < clips.length; c++ ) {

            var clip = clips[c];
            var animationClip = THREE.AnimationClip.parse( clip );
            animationClipList.push( animationClip );

        }

        animation.animationClips = animationClipList;

        animations.push( animation );

    }

    return animations;

};

Exhibition.prototype.importAnimation = function( name, filePath, callBack ) {

    function daeAnimationToAnimationClip( animations ) {

        var animationList = [];
        for ( var i = 0; i < animations.length; ++i ) {

            var animation = animations[ i ];

            var kfAnimation = new THREE.KeyFrameAnimation( animation );
            // var animationClip = kfAnimation.translateToAnimationClip();
            var animationClip = kfAnimation.testTransform();
            
            if ( animationClip !== null ) {
                
                animationList.push( animationClip );

            }

        }

        return animationList;

    }

    var scope = this;
    var animationClips = [];
  
    this.daeLoader.load(filePath, function (object) {

        if ( object.animations.length !== 0 ) {

            var animation = {};
            animation.name = name;
            animationClips = daeAnimationToAnimationClip( object.animations );
            animation.animationClips = animationClips;
            animation.id = scope.animations.length + '';

            scope.animations.push( animation );

        }

        if ( callBack !== undefined ) {

            callBack();

        }

        scope.daeLoader.reset();

    });

};                                                                                                                              