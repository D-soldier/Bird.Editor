/**
 * Created by lucifer on 2016/4/13.
 */
TreeView = function(editor){

    var _this = this;
    this.project = {};
    this.editor = editor;
    this.currentMenuItem = false;
    this.openTree = {};
    this.treeList = null;
    this.root = {};
    this.treeObject = {
        core:{
            check_callback: function(operation, node, parent, position, more){

                if(parent.id === "#"){
                    return false;
                }

                if(operation === "delete_node"){

                    console.log("move node id is:" + node.id + "\nposition is" + position + "\n" + "parent node is" + parent.id);
                    _this.editor.removeObjectById(parseInt(node.id));
                    return true;

              }else if(operation === 'rename_node'){

                    console.log("node id is " + node.id + "rename is" + more);
                    _this.editor.renameObjectById(parseInt(node.id), position);
              } else{
                  return false;
              }
            },
            data:[]
        },
        plugins : [ "contextmenu" ]
    }
};

TreeView.prototype.init = function(){

    var _this = this;

    $("#TreeView")
        .on('changed.jstree',function(e, data){
           // alert("select id is:" + data.node.id);
            _this.editor.selectObjectById(parseInt(data.node.id));
            console.log("select node id is" + data.node.id)
        })
        .jstree(this.treeObject);

};


TreeView.prototype.reset = function(){

    //for(var i = 0; i < this.treeObject.core.data.length; i++){
    //    this.treeObject.core.data[i].children = [];
    //}

    this.treeObject.core.data = [];
    this.show();

};

TreeView.prototype.injectNodeToRoot = function(root, projectRoot){

	var child;
	for (child in root.children){
		this.createProjectItem(root.children[child], projectRoot)
	}

};

TreeView.prototype.createProjectItem = function(key, projectRoot){

	var  id;
    var childObject = {};

    id = key.id;

    if(key.name === ''){
        childObject.text = key.id;
    }else{
        childObject.text = key.name;
    }

    childObject.id = id;

    childObject.children = [];
    projectRoot.children.push(childObject);
    this.injectNodeToRoot(key, childObject);


};

TreeView.prototype.refreshTree = function(project){

    this.reset();
    this.project = project;

    if(project.type === 'house'){
        this.refreshHouseTree(this.project);
    }else if(project.type === 'estate'){
        this.refreshEstateTree(this.project);
    }else if(project.type === 'exhibition'){
        this.refreshExhibition(this.project);
    }

  //  $("#TreeView").jstree(this.treeObject);
    this.show();

};

TreeView.prototype.refreshExhibition = function(project){

    var exhibitionDataList = [
        {
            id:'-1',
            text:"商品",
            children:[]
        },
        {
            id:'-2',
            text:'尺寸',
            children:[]
        },
        {
            id:'-3',
            text:"灯光",
            children:[]
        },
        {
            id:'-4',
            text:"镜子",
            children:[]
        },
        {
            id:'-5',
            text: '动画',
            children: []
        }
    ];

    this.treeObject.core.data = exhibitionDataList;

    var ExhibitionTreeRoot = this.treeObject.core.data[0];
    var SizeTreeRoot = this.treeObject.core.data[1];
    var LightTreeRoot = this.treeObject.core.data[2];
    var MirrorTreeRoot = this.treeObject.core.data[3];
    var AnimationTreeRoot = this.treeObject.core.data[4];

    //ExhibitionTreeRoot.text = this.project.exhibition.name;
    //this.injectNodeToRoot(this.project.exhibition,  ExhibitionTreeRoot);

    if(this.project.exhibition.name !== undefined) {
        this.createProjectItem(this.project.exhibition, ExhibitionTreeRoot);
    }

    if(this.project.size.name !== undefined) {
        this.createProjectItem(this.project.size, SizeTreeRoot);
    }

    for(var i = 0, l = this.project.lights.length; i < l; i++) {

        this.createProjectItem(this.project.lights[i],  LightTreeRoot);

    }

    for(var i = 0, l = this.project.mirrors.length; i < l; i++){
    
        this.createProjectItem(this.project.mirrors[i],  MirrorTreeRoot);

    }

    for(var i = 0, l = this.project.animations.length; i < l; i++){
    
        this.createProjectItem(this.project.animations[i],  AnimationTreeRoot);

    }

};

TreeView.prototype.refreshEstateTree = function(project){

    var estateDataList = [
        {
            id:'-1',
            text:"地面",
            children:[]
        },
        {
            id:'-2',
            text:"单元楼",
            children:[]
        },
        {
            id:'-3',
            text:"其他",
            children:[]
        },
        {
            id:'-4',
            text:"灯光",
            children:[]
        }
    ];

    this.treeObject.core.data = estateDataList;

    var GrountTreeRoot = this.treeObject.core.data[0];
    var BuildingTreeRoot = this.treeObject.core.data[1];
    var OtherTreeRoot = this.treeObject.core.data[2];
    var LightTreeRoot = this.treeObject.core.data[3];

    this.injectNodeToRoot(this.project.ground,  GrountTreeRoot);
    this.injectNodeToRoot(this.project.buildings,  BuildingTreeRoot);

    for(var i = 0, l = this.project.lights.length; i < l; i++){
        this.createProjectItem(this.project.lights[i],  LightTreeRoot);
    }
    for(var i = 0, l = this.project.objectList.length; i < l; i++){
        this.createProjectItem(this.project.objectList[i],  OtherTreeRoot);
    }

};

TreeView.prototype.refreshHouseTree = function(project){

    var houseDataList = [
        {
            id:'-1',
            text:"外墙",
            children:[]
        },
        {
            id:'-2',
            text:"内墙",
            children:[]
        },
        {
            id:'-3',
            text:"地板",
            children:[]
        },
        {
            id:'-4',
            text:"屋顶",
            children:[]
        },
        {
            id:'-5',
            text:"其他",
            children:[]
        },
        {
            id:'-6',
            text:"灯光",
            children:[]
        },
        {
            id:'-7',
            text: "镜子",
            children:[]
        }
    ];

    this.treeObject.core.data = houseDataList;

    var OutSideWallTreeRoot = this.treeObject.core.data[0];
    var InSideWallTreeRoot = this.treeObject.core.data[1];
    var FloorTreeRoot = this.treeObject.core.data[2];
    var RoofTreeRoot = this.treeObject.core.data[3];
    var OtherTreeRoot = this.treeObject.core.data[4];
    var LightTreeRoot = this.treeObject.core.data[5];
    var MirrorTreeRoot = this.treeObject.core.data[6];

    this.injectNodeToRoot(this.project.outSideWallGroup,  OutSideWallTreeRoot);
    this.injectNodeToRoot(this.project.floor,  FloorTreeRoot);
    this.injectNodeToRoot(this.project.roof,  RoofTreeRoot);
    this.injectNodeToRoot(this.project.inSideWall,  InSideWallTreeRoot);

    for(var i = 0, l = this.project.lights.length; i < l; i++){
        this.createProjectItem(this.project.lights[i],  LightTreeRoot);
    }
    for(var i = 0, l = this.project.objectList.length; i < l; i++){
        this.createProjectItem(this.project.objectList[i],  OtherTreeRoot);
    }

    for(var i = 0, l = this.project.mirrors.length; i < l; i++){
        this.createProjectItem(this.project.mirrors[i],  MirrorTreeRoot);
    }

};

TreeView.prototype.show = function(){

    var scope = this;
    $("#TreeView").jstree('destroy');
    //$("#TreeView").data('jstree', false).empty().jstree(this.treeObject);
    $("#TreeView")
        .on('changed.jstree',function(e, data){
            // alert("select id is:" + data.node.id);
            if ( scope.project.type === 'exhibition' && data.node.parent === '-5' ) {

                scope.project.setCurrentAnimationByIndex( data.node.id );

            } else {
                
                scope.editor.selectObjectById(parseInt(data.node.id));
                console.log("select node id is" + data.node.id)

            }

        }).jstree(this.treeObject);

};