
var Utils = {};

Utils.removeRedundantObject3Ds = function ( node ) {

	var i, j;
	var nameStack = [],
		matrixStack = [],
		userDataStack = [],
		objects = [];

	var children = node.children;
	for ( i = 0, l = children.length; i < l; i ++ ) {

		collect( children[ i ] );
		children[ i ].parent = null;

	}
	node.children = [];

	for ( i = 0, l = objects.length; i < l; i ++ ) {

		node.add( objects[ i ] );
	}


	function collect ( object ) {

		object.updateMatrix();
		
		if ( object.type === 'Object3D' ) {

			var matrix = new THREE.Matrix4();
			if ( matrixStack.length > 0 ) {

				matrix.multiplyMatrices( matrixStack[ matrixStack.length - 1 ], object.matrix );
			
			} else {

				matrix.copy( object.matrix );
			}
			matrixStack.push( matrix );

			if ( nameStack.length > 0 ) {

				nameStack.push( nameStack[ nameStack.length - 1 ] + object.name );
			
			} else {

				nameStack.push( object.name );

			}

			userDataStack.push( object.userData );

			var children = object.children;
			for ( i = 0, l = children.length; i < l; i ++ ) {

				collect( children[ i ] );

			}

			matrixStack.pop();
			nameStack.pop();
			userDataStack.pop();


		} else {

			if ( matrixStack.length > 0 ) {

				object.matrix.multiplyMatrices( matrixStack[ matrixStack.length - 1 ], object.matrix );
				object.matrix.decompose( object.position, object.quaternion, object.scale );

			}

			if ( nameStack.length > 0 ) {

				object.name = nameStack[ nameStack.length - 1 ] + object.name;

			}

			if ( userDataStack.length > 0 ) {

				for ( var i = 0, l = userDataStack.length; i < l; i ++ ) {

					var userData = userDataStack[ i ];
					for ( var attr in userData ) {

						object[ attr ] = userData[ attr ];
					}

				}

			}

			objects.push( object );

		}
		
	}

};