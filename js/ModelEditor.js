/**
 * Created by lucifer on 2016/4/11.
 */

var gui = require('nw.gui');
var path = require('path');
var fs = require('fs');
var child = require('child_process');

(function(){

    var elements = {}, projectObject = undefined,treeView = {},sideBar = {},
        editor,ObjectHelper = {},ArrorHelpers = [],
        win;

    var currentSelected = null;
    var mirrors = [], cubeCameras = [];
    var root;
    var renderer, controls, camera, scene, transformControls;
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    var boxHelper = {};
    var fileInPutFun = null;

    //Animation
    var Clock = new THREE.Clock();
    var animationMixers = null;
    this.path = path.resolve(path.dirname());

    /**
     * 加载dom节点
     */
    this.preloadDom = function(){
        elements.body = document.body;
        elements.container = document.getElementById('ViewPort');
        elements.treeView = document.getElementById('TreeView');
        elements.projectRoot = document.getElementById('project-root-list');
        elements.propertyPort = document.getElementById('sidebar');
        elements.selectFilesInput = document.getElementById("select-files");
        elements.openDirectoryInput = document.getElementById("open-directory");
        elements.saveDirectoryInput = document.getElementById("save-as-directory");
        elements.saveFilesInput = document.getElementById("save-file");

        //add file Event
        elements.selectFilesInput.addEventListener('change', function(event){

            if ( fileInPutFun !== null) {
                
                fileInPutFun( this.value );
                fileInPutFun = null;
                this.value = '';

            }
            //editor.importModel(this.value);
        }, false);

        elements.saveDirectoryInput.addEventListener('change', function(event){
            editor.saveAs(this.value);
        }, false);

        elements.openDirectoryInput.addEventListener('change', function(event){
            editor.openProject(this.value);
        }, false);

        elements.saveFilesInput.addEventListener('change', function(event){
           // editor.save(this.value);
        })
    };

    /**
     * 初始化三维信息
     */
    this.initThree = function(){

        var width = elements.container.clientWidth;
        var height = elements.container.clientHeight;
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor(0xa9a9a9, 0.5);
        renderer.setSize(width, height);

        renderer.shadowMap.enabled = true;
       // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        elements.container.appendChild(renderer.domElement);

        renderer.domElement.addEventListener('mousedown', editor.onMouseDown, false);
        renderer.domElement.addEventListener('mouseup', editor.onMouseUp, false);

        camera = new THREE.PerspectiveCamera(60, width / height, 0.2, 100000);
        camera.position.set(0, 20, 20);
        camera.lookAt(new THREE.Vector3());
        camera.name = 'Camera';

        controls = new THREE.OrbitControls(camera, renderer.domElement);

        scene = new THREE.Scene();
        scene.name = 'Scene';

        transformControls = new THREE.TransformControls(camera, renderer.domElement);
        transformControls.addEventListener('change', function(){
            sideBar.refresh(currentSelected);
        });
        scene.add(transformControls);

        root = new THREE.Group();
        root.name = 'Root';
        scene.add(root);
        var gridHelper = new THREE.GridHelper(20, 1);
        gridHelper.position.y = -0.2;
        var XarrorHelper = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 10, 0xff0000 );
        var YarrorHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 10, 0x00ff00 );
        var ZarrorHelper = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), 10, 0x0000ff );

        scene.add(gridHelper);
        scene.add(XarrorHelper);
        scene.add(YarrorHelper);
        scene.add(ZarrorHelper);
        editor.initBoxHelper();
    };

    this.initBoxHelper = function(){

        boxHelper = new THREE.BoxHelper();
        boxHelper.material.depthTest = false;
        boxHelper.material.transparent = true;
        boxHelper.visible = false;
        scene.add(boxHelper);

    };

    /**
     * 初始化按钮
     */
    this.initMenu = function(){

        var primaryMenuBar = {};
        var menus = {};
        primaryMenuBar = new gui.Menu({type: 'menubar'});
        /*
         * File menu
         */
        menus.fileMenu = new gui.MenuItem({
            label: '文件',
            submenu: new gui.Menu()
        });

        //new project

        menus.fileMenu.submenu.append(new gui.MenuItem({
            label: '重置工程',
            click: function(){
                editor.closeProject();
            }
        }));


        menus.fileMenu.submenu.append(new gui.MenuItem({
            label: '新建样板间工程',
            click: function(){
                editor.newHouseProject();
            }
        }));

        menus.fileMenu.submenu.append(new gui.MenuItem({
            label: '新建小区工程',
            click: function(){
                editor.newEstateProject();
            }
        }));

        menus.fileMenu.submenu.append(new gui.MenuItem({
            label: '新建商品工程',
            click: function(){
                editor.newExhibitionProject();
            }
        }));

        //open project
        menus.fileMenu.submenu.append(new gui.MenuItem({
            label: '打开工程',
            tooltip: 'Ctrl + O',
            click: function(){
                elements.openDirectoryInput.click();
               // treeView.show();
            }
        }));

        //save project
        menus.fileMenu.submenu.append(new gui.MenuItem({
            label: '保存工程',
            tooltip: 'Ctrl + S',
            click: function(){
                editor.save();
            }
        }));

        //save as
        menus.fileMenu.submenu.append(new gui.MenuItem({
            label: '另存为',
            click: function(){
                elements.saveDirectoryInput.click();
            }
        }));

        //import Model
        menus.fileMenu.submenu.append(new gui.MenuItem({
            label: '导入模型',
            click: function(){

                fileInPutFun = editor.importModel;
                elements.selectFilesInput.click();

            }
        }));

        //Exit
        menus.fileMenu.submenu.append(new gui.MenuItem({
            label: '退出',
            click: function(){
                editor.closeModelEditor();
            }
        }));

        primaryMenuBar.append( menus.fileMenu );

        //Editor
        menus.editorMenu = new gui.MenuItem({
            label: '编辑',
            submenu: new gui.Menu()
        });

        var AddMenu = new gui.MenuItem({
            label: '添加灯光',
            submenu:new gui.Menu()
        });

        AddMenu.submenu.append(new gui.MenuItem({
            label: 'AmbientLight',
            click: function(){
                editor.addLight('AmbientLight');
            }
        }));

        AddMenu.submenu.append(new gui.MenuItem({
            label: 'DirectionalLight',
            click: function(){
                editor.addLight('DirectionalLight');
            }
        }));

        AddMenu.submenu.append(new gui.MenuItem({
            label: 'HemisphereLight',
            click: function(){
                editor.addLight('HemisphereLight');
            }
        }));

        AddMenu.submenu.append(new gui.MenuItem({
            label: 'PointLight',
            click: function(){
                editor.addLight('PointLight');
            }
        }));

        AddMenu.submenu.append(new gui.MenuItem({
            label: 'SpotLight',
            click: function(){
                editor.addLight('SpotLight');
            }
        }));
        menus.editorMenu.submenu.append(AddMenu);

        menus.editorMenu.submenu.append(new gui.MenuItem({
            label: '记录当前相机位置',
            click: function(){
                editor.recordCurrentCameraPosition();
            }
        }));

        menus.editorMenu.submenu.append(new gui.MenuItem({
            label: '添加模型样式',
            click: function(){
                editor.addModelStyle();
            }
        }));        

        menus.editorMenu.submenu.append(new gui.MenuItem({
            label: '编辑/退出墙体法线',
            click: function(){
                editor.editWallDirection();
            }
        }));

        menus.editorMenu.submenu.append(new gui.MenuItem({
            label: '隐藏/显示屋顶',
            click: function(){
                editor.hideRoof();
            }
        }));

        menus.editorMenu.submenu.append(new gui.MenuItem({
            label: '添加镜子',
            click: function(){
                editor.addMirror();
            }
        }));

        menus.editorMenu.submenu.append(new gui.MenuItem({
            label: '添加标牌',
            click: function(){
                editor.addBillBoard();
            }
        }));

        menus.editorMenu.submenu.append(new gui.MenuItem({
            label: '移除多余中间节点',
            click: function(){
                editor.removeRedundantObject3Ds();
            }
        }));

        primaryMenuBar.append( menus.editorMenu );

        menus.animationMenu = new gui.MenuItem({

            label: '动画',
            submenu: new gui.Menu()

        });

        menus.animationMenu.submenu.append(new gui.MenuItem({

            label: '播放',
            click: function(){
                //editor.importAnimationDialog();
                if ( projectObject.currentAnimation !== null ) {

                    projectObject.animationPlay();

                }
            }
        }));


        menus.animationMenu.submenu.append(new gui.MenuItem({

            label: '暂停',
            click: function(){
                //editor.importAnimationDialog();

                if ( projectObject.currentAnimation !== null ) {

                    projectObject.animationPause();

                }
            }
        }));


        menus.animationMenu.submenu.append(new gui.MenuItem({

            label: '停止',
            click: function(){
                //editor.importAnimationDialog();

                if ( projectObject.currentAnimation !== null ) {

                    projectObject.animationStop();

                }
            }
        }));

        menus.animationMenu.submenu.append(new gui.MenuItem({

            label: '导入动画',
            click: function(){
                editor.importAnimationDialog();
            }
        }));

        primaryMenuBar.append( menus.animationMenu );


        menus.helpMenu = new gui.MenuItem({
            label: '帮助',
            submenu: new gui.Menu()
        });

        menus.helpMenu.submenu.append(new gui.MenuItem({
            label: '版本信息',
            click: function(){
                editor.versionInfo();
            }
        }));

        primaryMenuBar.append(menus.helpMenu);
        win.menu = primaryMenuBar;

    };

    this.versionInfo = function(){
        alert('版本号：1.0.0');
    };

    /**
     * 打开工程
     */
    this.openProject = function(projectpath){

        var scope = this;
        editor.loadSceneFile(projectpath, function(scene){
            document.title = projectpath;
            var type = scene.type;
            if(type === 'house'){
                scope.newHouseProject();
            }else if(type === 'estate'){
                scope.newEstateProject();
            }else if(type === 'exhibition'){
                scope.newExhibitionProject();
            }

            projectObject.loadModelFromScene(projectpath, scene, scope.onLoadProject);

        });

    };

    this.loadSceneFile = function(filePath,onload){

        var _this = this;
        var scenePath = filePath + '/scene.json';
        this.importModelDir = filePath;
        this.saveDir = filePath;
        var sceneLoader = new THREE.XHRLoader();
        sceneLoader.load(scenePath, function(text){

            var scene = JSON.parse(text);
            if(onload !== undefined){
                onload(scene);
            }
            //_this.loadModelFromScene(scene, onload);
        });

    };

    this.onLoadProject = function(){

        treeView.refreshTree(projectObject);
        sideBar.refreshStyleList( projectObject.ModelStyles );
        editor.render();
        editor.renderCubeCamera();
    };

    /**
     * 保存工程
     */
    this.saveAs = function(saveDir){

        if(saveDir === ""){
            return;
        }
        projectObject.saveAsProject(saveDir);

    };

    this.save = function(){

        if(projectObject.saveDir === ''){
            elements.saveDirectoryInput.click();
        }else{
            projectObject.saveProject();
        }

    };

    /**
     * 导入模型
     */
    this.importModel = function(filePath){

        projectObject.importModel(filePath, function(){
        
           // root.add(object.scene);
            treeView.refreshTree(projectObject);
        
        });

    };

    /**
     * 重置工程
     */
    this.closeProject = function(){

        var sureCloseProject = window.confirm("确认关闭当前工程");
        if(!sureCloseProject){
            return !sureCloseProject;
        }
        elements.saveDirectoryInput.value = '';
        elements.openDirectoryInput.value = '';
        elements.selectFilesInput.value = '';
        elements.treeView.innerHTML = '';
        //editor.init();
        editor.removeArrorHelpers();
        editor.removeHelper();

        boxHelper.visible = false;
        transformControls.detach();
        sideBar.refreshStyleList( projectObject.ModelStyles );
        sideBar.hide();


        projectObject.closeProject();

        document.title = '模型编辑器';

        return true;

    };

    /**
     *
     * 导入动画
     */

    this.importAnimation = function( name, filePath ) {

        projectObject.importAnimation( name, filePath, function() {

            //refresh animationList;
            treeView.refreshTree(projectObject);

        });

    };

    this.importAnimationDialog = function(){

        var scope = this;
        var dialog = document.createElement('div');
        dialog.className = "outDiv";

        var animationTitle = document.createElement('h3');
        animationTitle.innerHTML = "动画名称";

        var animationName = document.createElement('input');
        animationName.type = 'text';

        var optionDiv = document.createElement('div');
        optionDiv.className = "optDiv";

        var fileDiv = document.createElement('div');
        fileDiv.className = "fileDiv";
        fileDiv.innerHTML = '选择文件';

        var animationSelect = document.createElement('select');
        animationSelect.name = 'animationName';

        var displayOption = document.createElement('option');
        displayOption.value = 'displayAnimation';
        displayOption.innerHTML = '使用动画';

        var buildOption = document.createElement('option');
        buildOption.value = 'buildAnimation';
        buildOption.innerHTML = '组装动画';

        animationSelect.appendChild(displayOption);
        animationSelect.appendChild(buildOption);

        var animationFile = document.createElement('input');
        animationFile.type = 'file';
        animationFile.id = 'select-files';

        var okButton = document.createElement('input');
        okButton.className = "certainBtn";
        okButton.type = 'button';
        okButton.value = '确定';
        

        okButton.addEventListener('click', function( event ) {

            //var name = animationName.value;
            var name = animationSelect.value;
            var filePath = animationFile.value;
            scope.importAnimation( name, filePath );
            document.body.removeChild( dialog );

        });

        var cancelButton = document.createElement('input');
        cancelButton.className = "cancelBtn";
        cancelButton.type = 'button';
        cancelButton.value = '取消';
        

        cancelButton.addEventListener('click', function( event ) {
            
            document.body.removeChild( dialog );

        });
        var buttons = document.createElement('div');
        buttons.className = "innerDiv";
        buttons.appendChild(okButton);
        buttons.appendChild( cancelButton );

        optionDiv.appendChild( animationSelect );
        fileDiv.appendChild( animationFile );
        optionDiv.appendChild( fileDiv );

        dialog.appendChild( animationTitle );
       // dialog.appendChild( animationName );
        dialog.appendChild( optionDiv );
        dialog.appendChild( buttons );

        document.body.appendChild( dialog );
    }

    this.newHouseProject = function(){

        if(projectObject !== undefined) {

            if (!editor.closeProject()) {
                return;
            }
        }

        projectObject = new HouseProject(this);
        //projectObject.init(sideBar);
        scene.add(projectObject.projectRoot);
        treeView.refreshTree(projectObject);
    };

    this.newEstateProject = function(){

        if(projectObject !== undefined) {

            if (!editor.closeProject()) {
                return;
            }
        }

        projectObject = new EstateProject(this);
        //projectObject.init(sideBar);
        scene.add(projectObject.projectRoot);
        treeView.refreshTree(projectObject);

    };

    this.newExhibitionProject = function(){

        if(projectObject !== undefined) {

            if (!editor.closeProject()) {
                return;
            }
        }

        projectObject = new Exhibition(this);
        //projectObject.init(sideBar);
        scene.add(projectObject.projectRoot);
        treeView.refreshTree(projectObject);
    };

    /**
     * 根据根节点生成场景树
     * @param root
     * @return {bool}
     */
    this.buildTreeView = function(root){

    };

    /**
     * 向场景中添加模型
     * @param object
     * @return {bool}
     */
    this.addLight = function(lightType){

        projectObject.addLight(lightType);
        treeView.refreshTree(projectObject);
    };

    /**
     * 在商品展示工程中对主模型添加多种样式
     * @param name
     * @return null
     *
     */
    this.addModelStyle = function( name ) {

        if ( projectObject.type === 'exhibition' ) {
        
            projectObject.createModelStyle( name );

            //refresh style List
            sideBar.refreshStyleList( projectObject.ModelStyles );
        
        } else {

            alert('该工程不支持添加多个样式');

        }
        
    };

    /**
     * 删除样式列表中的特定样式
     * @param style index
     * @return null
     */
    this.deleteModelStyle = function( index ) {

        projectObject.deleteModelStyle( index );

        //refresh style List
        sideBar.refreshStyleList( projectObject.ModelStyles );

    };

    this.changeStyle = function( index ) {

        projectObject.changeCurrentStyle( index );

    };

    /**
     * 向场景中添加镜子
     */
    this.addMirror = function(){
        var MirrorCount = 0;
        var matrix = new THREE.Matrix4();
        return function(mirrorData) {

            var mirror = new THREE.Mirror(renderer, camera, { clipBias: 0.003, textureWidth: WIDTH, textureHeight: HEIGHT, color:0x889999 });
            mirrors.push(mirror);
            var mirrorMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), mirror.material);
            mirrorMesh.add(mirror);
            if(mirrorData !== undefined){
                mirrorMesh.name = mirrorData.name;
                matrix.fromArray( mirrorData.matrix );
                matrix.decompose( mirrorMesh.position, mirrorMesh.quaternion, mirrorMesh.scale );
            }else {
                mirrorMesh.name = 'mirror_' + MirrorCount;
                MirrorCount++;
            }
            projectObject.addMirror(mirrorMesh);
            treeView.refreshTree(projectObject);

        }
    }();

    this.addBillBoard = function(){

        if(currentSelected === null){
            alert('选择要添加标牌的模型');
            return;
        }

        var buildingNum = currentSelected.userData.ProductID;

        var sprite = projectObject.createBillBoard(buildingNum);
        //
        //var texture = editor.createBillBoardTexture('./source/noselect.png', 11);
        //var bildBoardMaterial = new THREE.SpriteMaterial({map: texture});
        //var sprite = new THREE.Sprite(bildBoardMaterial);
        //sprite.scale.multiplyScalar(12);
        //sprite.name = 'billBoard';
        sprite.userData.target = currentSelected;
        currentSelected.add(sprite);
        currentSelected.userData.billboard = sprite.uuid;

        editor.selectObject(sprite);

    };

    this.removeRedundantObject3Ds = function () {

        if ( !projectObject.removeRedundantObject3Ds ) {

            alert( '当前工程不支持该操作！' );
        
        }
        else {

            projectObject.removeRedundantObject3Ds();
            treeView.refreshTree(projectObject);
            alert( '移除多余中间节点操作完成！' );

        }

    };


    this.createCubeCamera = function(resolution){

        resolution = resolution !== undefined ? resolution : 128;
        var cubeCamera = new THREE.CubeCamera(0.1, 40, resolution);
        cubeCameras.push(cubeCamera);
        return cubeCamera;

    };

    /**
     * 编辑相机初始位置
     */
    this.recordCurrentCameraPosition = function(){
        var cameraPosition = camera.position.clone();
        projectObject.setSceneCameraPos(cameraPosition);
    };

    /**
     * 编辑墙体法线
     */
    this.editWallDirection = function(){

        var currentState = false;
        return function() {

            projectObject.editWallDirection(currentState);
            currentState = !currentState;

        }

    }();

    this.hideRoof = function(){
        var hideRoofState = false;
        return function(){
            projectObject.setObjectVisible(projectObject.roof, hideRoofState);
            hideRoofState = !hideRoofState;
        }
    }();

    this.renameObjectById = function(id, newName) {

        var object = scene.getObjectById(id);
        if (object) {
            object.name = newName;
        }

    };

    this.selectObjectById = function(id){

        var object = scene.getObjectById(id);
        this.selectObject(object);

    };

    this.selectAnimationByindex = function( index ) {

        var result = projectObject.setCurrentAnimationByIndex( index );
        return result;

    }

    this.renderCubeCamera = function(cubeCamera){

        cubeCamera.parent.visible = false;
        cubeCamera.updateCubeMap(renderer, scene);
        cubeCamera.parent.visible = true;

    };

    this.selectObject = function(object){

        this.removeArrorHelpers();
        transformControls.detach();
        boxHelper.visible = false;
        currentSelected = null;
        if(object) {

            var isOutSideWall = /hide_wall_/.test(object.name);
            var isMirror = /mirror_/.test(object.name);
            var isLight = /Light/.test(object.type);
            var isBillBoard = object instanceof THREE.Sprite;

            currentSelected = object;
            boxHelper.update(object);

            if(isLight) {
                boxHelper.visible = false;
            }else{
                boxHelper.visible = true;
            }

            if (isOutSideWall) {
                var wallDirection = this.getCenterAndDirection(object);
                var Arror = new THREE.ArrowHelper(wallDirection.direction.clone(), wallDirection.center.clone(), 3);
                object.userData.direction = wallDirection;
                scene.add(Arror);
                ArrorHelpers.push(Arror);
            }

            if(isMirror || isLight || isBillBoard) {
                transformControls.attach(object);
            }
            sideBar.refresh(object, Arror);
        }

    };

    this.removeArrorHelpers = function(){

        ArrorHelpers.forEach(function(helper){
            scene.remove(helper);
        });

        ArrorHelpers = [];

    };

    this.removeObjectById = function(id){
        var object = scene.getObjectById(id);
        if(object){

            if(object === currentSelected){
                boxHelper.visible = false;
                sideBar.hide();
            }

            projectObject.removeObject(object);
            this.removeHelper(object);
            object.parent.remove(object);
            console.log(object.name + 'is removed!!!');

        }
    };

    this.addObjectHelper = function () {

        var geometry = new THREE.SphereBufferGeometry( 0.5, 4, 2 );
        var material = new THREE.MeshBasicMaterial( { color: 0xff0000, visible: false } );

        return function ( object ) {

            var helper;

           if ( object instanceof THREE.PointLight ) {

                helper = new THREE.PointLightHelper( object, 1 );

            } else if ( object instanceof THREE.DirectionalLight ) {

                helper = new THREE.DirectionalLightHelper( object, 1 );

            } else if ( object instanceof THREE.SpotLight ) {

                helper = new THREE.SpotLightHelper( object, 1 );

            } else if ( object instanceof THREE.HemisphereLight ) {

                helper = new THREE.HemisphereLightHelper( object, 1 );

            } else if ( object instanceof THREE.SkinnedMesh ) {

                helper = new THREE.SkeletonHelper( object );

            } else {

                // no helper for this object type
                return;

            }

            var picker = new THREE.Mesh( geometry, material );
            picker.name = 'picker';
            picker.userData.object = object;
            helper.add( picker );

            scene.add( helper );
            ObjectHelper[ object.id ] = helper;

        };

    }();

    this.removeHelper = function ( object ) {

        if(object !== undefined) {

            if (ObjectHelper[object.id] !== undefined) {

                var helper = ObjectHelper[object.id];
                helper.parent.remove(helper);

                delete ObjectHelper[object.id];

            }
        }else{

            for(var i in ObjectHelper){

                var helper = ObjectHelper[i];
                helper.parent.remove(helper);
                delete ObjectHelper[i];

            }
        }

    };

    this.getCenterAndDirection = (function(){

        var box = new THREE.Box3();

        var point2 = new THREE.Vector3();
        var point3 = new THREE.Vector3();
        var point6 = new THREE.Vector3();

        var direction2to3 = new THREE.Vector3();
        var direction2to6 = new THREE.Vector3();

        var up = new THREE.Vector3(0, 1, 0);

        return function(object) {

            if ( object instanceof THREE.Box3 ) {

                box.copy( object );

            } else {

                box.setFromObject( object );

            }

            if ( box.isEmpty() ) {
                return;
            }

            var min = box.min;
            var max = box.max;
            /*
             5____4
             1/___0/|
             | 6__|_7
             2/___3/

             0: max.x, max.y, max.z
             1: min.x, max.y, max.z
             2: min.x, min.y, max.z
             3: max.x, min.y, max.z
             4: max.x, max.y, min.z
             5: min.x, max.y, min.z
             6: min.x, min.y, min.z
             7: max.x, min.y, min.z
             */
            var position = box.center();
            var Direction = new THREE.Vector3();

            point2.set(min.x, min.y, max.z);
            point3.set(max.x, min.y, max.z);
            point6.set(min.x, min.y, min.z);

            direction2to3.subVectors(point3, point2);
            direction2to6.subVectors(point6, point2);

            if(direction2to3.length() > direction2to6.length() ){
                Direction.crossVectors(direction2to3, up);
            }else{
                Direction.crossVectors(direction2to6, up);
            }

            box.makeEmpty();

            if(object.userData.direction !== undefined){
                Direction.copy(object.userData.direction.direction);
            }
            Direction.normalize();

            return {
                direction: Direction,
                center: position
            };

        };
    })();

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    function getIntersects( point, objects ) {

        mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

        raycaster.setFromCamera( mouse, camera );

        return raycaster.intersectObjects( objects , true);

    }

    var onDownPosition = new THREE.Vector2();
    var onUpPosition = new THREE.Vector2();

    function getMousePosition( dom, x, y ) {

        var rect = dom.getBoundingClientRect();
        return [ x / dom.clientWidth, y / dom.clientHeight ];


    }

    function handleClick() {

        if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {

            var intersects = getIntersects( onUpPosition, projectObject.projectRoot.children);

            if ( intersects.length > 0 ) {

                var object = intersects[ 0 ].object;

                editor.selectObject( object );


            } else {

                editor.selectObject( null );

            }

        }

    }


    this.onMouseDown = function(event){

        event.preventDefault();

        var array = getMousePosition( renderer.domElement, event.offsetX, event.offsetY );
        onDownPosition.fromArray( array );


    };

    this.onMouseUp = function(event){

        var array = getMousePosition( renderer.domElement, event.offsetX, event.offsetY );
        onUpPosition.fromArray( array );

        handleClick();

    };

    /**
     * 初始化工程对象
     */
    this.initPorject = function(){


        sideBar = new SideBar(this);
        var panal = sideBar.init();
        elements.propertyPort.appendChild(panal.dom);

        //projectObject = new HouseProject(this);
        //projectObject.init(sideBar);
        //scene.add(projectObject.projectRoot);

        treeView = new TreeView(this);
        treeView.init();

    };

    this.frame = function(){

        requestAnimationFrame(editor.frame);
        editor.render();

    };

    this.render = function(){

        var delta = 0.75 * Clock.getDelta();
        controls.update();
        transformControls.update();
        this.updateHelpers();
        editor.renderMirrors();
        if ( projectObject && projectObject.currentAnimation && projectObject.currentAnimation.animationMixers !== undefined ) {

            animationMixers = projectObject.currentAnimation.animationMixers;
            for (var i = 0; i < animationMixers.length; i++ ) {

                animationMixers[i].update( delta );

            }

        }
        renderer.render(scene, camera);

    };

    this.updateHelpers = function(){
        var count = 0;
        return function(){
            if(currentSelected === null){
                return;
            }
            if(true) {

                count = 0;
                if(boxHelper.visible === true) {
                    boxHelper.update(currentSelected);
                }
                if (ObjectHelper[currentSelected.id] !== undefined) {
                    ObjectHelper[currentSelected.id].update();
                }

            }else{

                count++;

            }
        }
    }();

    this.renderMirrors = function(){
        mirrors.forEach(function(mirror){
            mirror.render();
        })
    };

    this.renderCubeCamera = function(cubeCamera){

        function render(cubecamera){

            cubecamera.userData.targetObject.visibel = false;
            position = cubecamera.userData.targetObject.position.clone();
            position.applyMatrix4(cubecamera.userData.targetObject.matrixWorld);
            cubecamera.position.copy(position);

            cubecamera.updateCubeMap(renderer, scene);
            cubecamera.userData.targetObject.visibel = true;

        }

        var position;
        if(cubeCamera !== undefined){

            render(cubeCamera);

        }else{
            cubeCameras.forEach(function(cube){

                render(cube);

            });
        }
    };

    this.onWindowResize = function() {

        var width = elements.container.clientWidth;
        var height = elements.container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    this.onContextMenu = function(event){
        event.preventDefault();
    };

    this.init = function(){

        editor = this;
        win = gui.Window.get();
        win.on('close', function(){
            editor.closeModelEditor();
        });
        window.addEventListener( 'resize', onWindowResize, false );
        window.addEventListener('contextmenu', function(event){
            event.preventDefault();
        }, false);
        editor.preloadDom();
        editor.initMenu();
        editor.initThree();
        editor.initPorject();
        document.title = '模型编辑器';
        win.show();
        win.maximize();
        editor.frame();

    };

    this.closeModelEditor = function(){
        process.exit(0);
    };
this.init();

}());