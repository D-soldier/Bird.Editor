ModelStyles = function( editor ){
	
	this.project = {};
	this.editor = editor;
	this.currentStyle;
	this.styleList;
	this.styleListDom;
	this.dom;

	var scope = this;
	/**
	 *add style List
	 */
	 var container = new UI.Panel();
	 container.setDisplay('none');

	 var styleListDom = new UI.CollapsiblePanel();
	 styleListDom.dom.classList.add('styleList');
	 styleListDom.addStatic(new UI.Text().setValue('样式列表'));
	 styleListDom.add(new UI.Break());

	 var styleList = new UI.Outliner();
	// styleList.setPaddingTop('20px');
	 styleList.setId('outliner');
	 styleList.onChange( function() {

	 	var index = styleList.getValue();
	 	scope.currentStyle = index;
	 	scope.editor.changeStyle(index);

	 });

	 this.styleListDom = styleList;

	 container.add(styleListDom);
	 container.add(styleList);

	 var addButton = new UI.Button('添加样式').setWidth('90px').onClick( function() {

	 	scope.addDialog();

	 });

	 container.add(addButton);

	 var deleteButton = new UI.Button('删除样式').setWidth('90px').onClick( function() {

	 	scope.delete( scope.currentStyle );

	 });

	 container.add(deleteButton);

	// return container;
	this.dom = container;
	  
};

ModelStyles.prototype.refresh = function(styleSource){

	var scope = this;
	var stylesOption = [];

	if ( styleSource !== this.styleList ) {
		
		this.styleList = styleSource;

	}

	for (var i = 0; i < styleSource.length; i++) {

		var styleObject = {};
		styleObject.static = true;
		styleObject.value = i;
		styleObject.html = '<span class="type' + styleSource[i].type + '"></span>' + styleSource[i].name;
		stylesOption.push( styleObject );

	}

	scope.styleListDom.setOptions( stylesOption );

	return stylesOption;

};

ModelStyles.prototype.delete = function( index ){

	//todo:delete material that style quote this;

	this.styleList.splice(index, 1);

	//todo: refresh modelStyle List;
	this.refresh(this.styleList);

};

ModelStyles.prototype.add = function( name ){

	this.editor.addModelStyle( name );

	//todo: refresh modelStyle List;

};

ModelStyles.prototype.addDialog = function() {

	var scope = this;
	var dialog = document.createElement('div');
	dialog.className = "outDiv";

	var styleTitle = document.createElement('h3');
	styleTitle.innerHTML = "风格名称";

	var styleName = document.createElement('input');
	styleName.type = 'text';
	styleName.name = '风格名称';

	var okButton = document.createElement('input');
	okButton.className = "certainBtn";
	okButton.type = 'button';
	okButton.value = '确定';
	

	okButton.addEventListener('click', function( event ) {

		var name = styleName.value;
		scope.add( name );
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

	dialog.appendChild( styleTitle );
	dialog.appendChild( styleName );
	dialog.appendChild( buttons );

	document.body.appendChild( dialog );

};