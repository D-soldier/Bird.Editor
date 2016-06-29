/**
 * Created by lucifer on 2016/4/19.
 */

SideBar = function(editor){

    this.editor = editor;
    this.currentObject;
    this.commodityID = {};
    this.styleContainer;
    this.container;
    this.array;
};

SideBar.prototype.init = function(){


    var scope = this;
    var sideBarContainer = new UI.Panel();
    sideBarContainer.setBorderTop('0');
    sideBarContainer.setPaddingTop('20px');

    var attributePanel = new UI.Button('属性').setWidth('40px').onClick(function(){
        
        scope.container.setDisplay('');
        scope.styleContainer.dom.setDisplay('none');

    });

    sideBarContainer.add(attributePanel);

    var stylePanel = new UI.Button('样式').setWidth('40px').onClick(function(){
        
        scope.container.setDisplay('none');
        scope.styleContainer.dom.setDisplay('');

    });

    sideBarContainer.add(stylePanel);

    //add modelStyle Panel;

    var styleContainer = new ModelStyles( scope.editor );
    styleContainer.dom.setDisplay('none');
    this.styleContainer = styleContainer;

    sideBarContainer.add( styleContainer.dom );


    var container = new UI.Panel();
    container.setDisplay('none');
    container.setBorderTop('0');
    container.setPaddingTop('20px');

    //this.container.setId("sidebar");
    var _this = this;

    function update(){

        var object = _this.currentObject;
        if(object) {
            var ProductID = _this.commodityID.getValue();
            if(ProductID !== "NONE") {
                object.userData.ProductID = ProductID;
            }

            var name = _this.objectName.getValue();
            if(object.name !== name){
                object.name = name;
            }

            if ( object.visible !== _this.objectVisible.getValue() ) {

                object.visible = _this.objectVisible.getValue();

            }

            var newPosition = new THREE.Vector3( _this.objectPositionX.getValue(), _this.objectPositionY.getValue(), _this.objectPositionZ.getValue() );
            if ( object.position.distanceTo( newPosition ) >= 0.01 ) {

                object.position.copy(newPosition);

            }

            var newRotation = new THREE.Euler( _this.objectRotationX.getValue(), _this.objectRotationY.getValue(), _this.objectRotationZ.getValue() );
            if ( object.rotation.toVector3().distanceTo( newRotation.toVector3() ) >= 0.01 ) {

                object.rotation.copy(newRotation);

            }

            var newScale = new THREE.Vector3( _this.objectScaleX.getValue(), _this.objectScaleY.getValue(), _this.objectScaleZ.getValue() );
            if ( object.scale.distanceTo( newScale ) >= 0.01 ) {

                object.scale.copy(newScale);

            }

        }
    }

    function generalCubeEnvMap(){

        if(_this.currentObject.userData.cubeCamera !== undefined){
            return;
        }
        var CubeCameraEnvMap = {};
        var resolution = _this.resolution.getValue();
        var cubeCamera = _this.editor.createCubeCamera(resolution);
        CubeCameraEnvMap.uuid = cubeCamera.uuid;
        CubeCameraEnvMap.type = 'CubeCamera';
        CubeCameraEnvMap.cubeResolution = resolution;
        CubeCameraEnvMap.materials = {};
       // _this.currentObject.add(cubeCamera);
        _this.currentObject.cubeCamera = cubeCamera;
        cubeCamera.userData.targetObject = _this.currentObject;
        _this.currentObject.userData.cubeCamera = CubeCameraEnvMap;

        _this.editor.renderCubeCamera(cubeCamera);

        //var material = _this.currentObject.material;
        //if(material instanceof THREE.MultiMaterial){
        //    material.materials.forEach(function(mater){
        //        mater.envMap = cubeCamera.renderTarget;
        //        mater.needsUpdate = true;
        //    });
        //}else{
        //    material.envMap = cubeCamera.renderTarget;
        //    material.needsUpdate = true;
        //}

    }

    //Object Type
    var objectTypeRow = new UI.Panel();
    this.objectType = new UI.Text();
    objectTypeRow.add(new UI.Text('Type').setWidth('90px'));
    objectTypeRow.add(this.objectType);

    container.add(objectTypeRow);

    //Object Name
    var objectNameRow = new UI.Panel();
    this.objectName = new UI.Input().setValue("NONE").setWidth('150px').setFontSize('12px').onChange(update);
    objectNameRow.add(new UI.Text('Name').setWidth('90px'));
    objectNameRow.add(this.objectName);

    container.add(objectNameRow);

    var objectPositionRow = new UI.Panel();
    this.objectPositionX = new UI.Number().setWidth( '50px' ).onChange( update );
    this.objectPositionY = new UI.Number().setWidth( '50px' ).onChange( update );
    this.objectPositionZ = new UI.Number().setWidth( '50px' ).onChange( update );

    objectPositionRow.add( new UI.Text( 'Position' ).setWidth( '90px' ) );
    objectPositionRow.add( this.objectPositionX, this.objectPositionY, this.objectPositionZ );

    container.add( objectPositionRow );

    // rotation

    var objectRotationRow = new UI.Panel();
    this.objectRotationX = new UI.Number().setWidth( '50px' ).onChange( update );
    this.objectRotationY = new UI.Number().setWidth( '50px' ).onChange( update );
    this.objectRotationZ = new UI.Number().setWidth( '50px' ).onChange( update );

    objectRotationRow.add( new UI.Text( 'Rotation' ).setWidth( '90px' ) );
    objectRotationRow.add( this.objectRotationX, this.objectRotationY, this.objectRotationZ );

    container.add( objectRotationRow );

    // scale

    var objectScaleRow = new UI.Panel();
    this.objectScaleX = new UI.Number( 1 ).setWidth( '50px' ).onChange( update );
    this.objectScaleY = new UI.Number( 1 ).setWidth( '50px' ).onChange( update );
    this.objectScaleZ = new UI.Number( 1 ).setWidth( '50px' ).onChange( update );

    objectScaleRow.add( new UI.Text( 'Scale' ).setWidth( '90px' ) );
    objectScaleRow.add( this.objectScaleX, this.objectScaleY, this.objectScaleZ );

    container.add( objectScaleRow );


    //Object ProductID
    var commodityName = new UI.Panel();
    this.commodityID = new UI.Input().setValue("NONE").setWidth('150px').setFontSize('12px').onChange(update);
    commodityName.add(new UI.Text('商品ID').setWidth('90px'));
    commodityName.add(this.commodityID);

    container.add(commodityName);

    //反射贴图生成
    var generalEnvMapRow = new UI.Panel();
    this.resolution = new UI.Number().setWidth('90px').onChange(function(){});
    this.resolution.setRange(64, 1024);
    this.resolution.setPrecision(0);
    this.resolution.setValue(256);

    this.generalEnvMapButton = new UI.Button('生成反射贴图').setWidth('90px').onClick(generalCubeEnvMap);

    generalEnvMapRow.add( new UI.Text('反射贴图').setWidth('90px'));
    generalEnvMapRow.add(this.resolution, this.generalEnvMapButton);

    container.add(generalEnvMapRow);

      // visible

    var objectVisibleRow = new UI.Panel();
    this.objectVisible = new UI.Checkbox().onChange( update );

    objectVisibleRow.add( new UI.Text( 'Visible' ).setWidth( '90px' ) );
    objectVisibleRow.add( this.objectVisible );

    container.add( objectVisibleRow );

    //add other panal

    this.wallDirection = new SideBar.WallDirection();
    container.add(this.wallDirection.dom);

    this.material = new SideBar.Material();
    container.add(this.material.dom);

    this.light = new SideBar.Light();
    container.add(this.light.dom);

    this.container = container;
    sideBarContainer.add(container);
    return sideBarContainer;

};

SideBar.prototype.refresh = function(node, arror){

    this.currentObject = node;
    if(this.currentObject) {

        this.container.setDisplay('');
        this.styleContainer.dom.setDisplay('none');
        
        this.objectName.setValue(this.currentObject.name);
        this.objectType.setValue(this.currentObject.type);

        this.objectPositionX.setValue( this.currentObject.position.x );
        this.objectPositionY.setValue( this.currentObject.position.y );
        this.objectPositionZ.setValue( this.currentObject.position.z );

        this.objectRotationX.setValue( this.currentObject.rotation.x );
        this.objectRotationY.setValue( this.currentObject.rotation.y );
        this.objectRotationZ.setValue( this.currentObject.rotation.z );

        this.objectScaleX.setValue( this.currentObject.scale.x );
        this.objectScaleY.setValue( this.currentObject.scale.y );
        this.objectScaleZ.setValue( this.currentObject.scale.z );

        this.objectVisible.setValue( this.currentObject.visible );

        if (node.userData && node.userData.ProductID !== undefined) {
            this.commodityID.setValue(node.userData.ProductID);
        } else {
            this.commodityID.setValue("NONE");
        }

        this.wallDirection.refresh(this.currentObject, arror);
        this.material.refresh(this.currentObject);
        this.light.refresh(this.currentObject);
        //if(this.currentObject.material !== undefined){
        //    var material = this.currentObject.material;
        //
        //    if(material instanceof THREE.MultiMaterial){
        //
        //    }
        //}
    }else{
        this.hide();
    }

};

SideBar.prototype.refreshStyleList = function( styleList ) {

    var scope = this;
    scope.styleContainer.refresh( styleList );

};

SideBar.prototype.hide = function(){
    this.container.setDisplay('none');
};

//SideBar.prototype.

