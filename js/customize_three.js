// 定制three.js

(function () {

// 图片序列化改base64为文件路径
THREE.Texture.prototype.toJSON = function ( meta ) {

	if ( meta.textures[ this.uuid ] !== undefined ) {

		return meta.textures[ this.uuid ];

	}

	function getDataURL( image ) {

		var canvas;

		// 如果定义了userDefinedSrc属性，则直接返回文件路径
		if ( image.userDefinedSrc && image.userDefinedSrc.length > 0 ) {

			// var parts = image.userDefinedSrc.split('/');
			// return './images/' + parts[ parts.length - 1 ];
			return image.userDefinedSrc;
			
		}

		if ( image.toDataURL !== undefined ) {

			canvas = image;

		} else {

			canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
			canvas.width = image.width;
			canvas.height = image.height;

			canvas.getContext( '2d' ).drawImage( image, 0, 0, image.width, image.height );

		}

		if ( canvas.width > 2048 || canvas.height > 2048 ) {

			return canvas.toDataURL( 'image/jpeg', 0.6 );

		} else {

			return canvas.toDataURL( 'image/png' );

		}

	}

	var output;

	// 来自于动态设置的renderTarget，则只保存uuid
	if ( this.fromRenderTarget ) {

		output = {
			uuid: this.uuid,
			fromRenderTarget: true
		};

	} else {

		output = {
			metadata: {
				version: 4.4,
				type: 'Texture',
				generator: 'Texture.toJSON'
			},

			uuid: this.uuid,
			name: this.name,

			mapping: this.mapping,

			repeat: [ this.repeat.x, this.repeat.y ],
			offset: [ this.offset.x, this.offset.y ],
			wrap: [ this.wrapS, this.wrapT ],

			minFilter: this.minFilter,
			magFilter: this.magFilter,
			anisotropy: this.anisotropy
		};

		if ( this.image !== undefined ) {

			// TODO: Move to THREE.Image

			var image = this.image;

			if ( image.uuid === undefined ) {

				image.uuid = THREE.Math.generateUUID(); // UGH

			}

			if ( meta.images[ image.uuid ] === undefined ) {

				meta.images[ image.uuid ] = {
					uuid: image.uuid,
					url: getDataURL( image )
				};

			}

			output.image = image.uuid;

		}

	}

	meta.textures[ this.uuid ] = output;

	return output;
};

// 修改图片加载完成事件调用错误
THREE.ImageLoader.prototype.load = function ( url, onLoad, onProgress, onError ) {

	var scope = this;

	var image = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'img' );
	image.onload = function () {

		URL.revokeObjectURL( image.src );

		if ( onLoad ) onLoad( image );

		scope.manager.itemEnd( url );

	};

	if ( url.indexOf( 'data:' ) === 0 ) {

		image.src = url;

	} else {

		var loader = new THREE.XHRLoader();
		loader.setPath( this.path );
		loader.setResponseType( 'blob' );
		loader.load( url, function ( blob ) {

			image.src = URL.createObjectURL( blob );

		}, onProgress, onError );

	}
	scope.manager.itemStart( url );

	return image;

};

// 增加对InterleavedBufferAttribute序列化的支持
THREE.Object3D.prototype.toJSON = function ( meta ) {

	// meta is '' when called from JSON.stringify
	var isRootObject = ( meta === undefined || meta === '' );

	var output = {};

	// meta is a hash used to collect geometries, materials.
	// not providing it implies that this is the root object
	// being serialized.
	if ( isRootObject ) {

		// initialize meta obj
		meta = {
			geometries: {},
			materials: {},
			textures: {},
			images: {},
			buffers: {}		// 增加buffers输出
		};

		output.metadata = {
			version: 4.4,
			type: 'Object',
			generator: 'Object3D.toJSON'
		};

	}

	// standard Object3D serialization

	var object = {};

	object.uuid = this.uuid;
	object.type = this.type;

	if ( this.name !== '' ) object.name = this.name;
	if ( JSON.stringify( this.userData ) !== '{}' ) object.userData = this.userData;
	if ( this.castShadow === true ) object.castShadow = true;
	if ( this.receiveShadow === true ) object.receiveShadow = true;
	if ( this.visible === false ) object.visible = false;

	object.matrix = this.matrix.toArray();

	//

	if ( this.geometry !== undefined ) {

		if ( meta.geometries[ this.geometry.uuid ] === undefined ) {

			meta.geometries[ this.geometry.uuid ] = this.geometry.toJSON( meta );

		}

		object.geometry = this.geometry.uuid;

	}

	if ( this.material !== undefined ) {

		if ( meta.materials[ this.material.uuid ] === undefined ) {

			meta.materials[ this.material.uuid ] = this.material.toJSON( meta );

		}

		object.material = this.material.uuid;

	}

	//

	if ( this.children.length > 0 ) {

		object.children = [];

		for ( var i = 0; i < this.children.length; i ++ ) {

			object.children.push( this.children[ i ].toJSON( meta ).object );

		}

	}

	if ( isRootObject ) {

		var geometries = extractFromCache( meta.geometries );
		var materials = extractFromCache( meta.materials );
		var textures = extractFromCache( meta.textures );
		var images = extractFromCache( meta.images );
		var buffers = extractFromCache( meta.buffers );		// 输出buffers

		if ( geometries.length > 0 ) output.geometries = geometries;
		if ( materials.length > 0 ) output.materials = materials;
		if ( textures.length > 0 ) output.textures = textures;
		if ( images.length > 0 ) output.images = images;
		if ( buffers.length > 0 ) output.buffers = buffers;

	}

	output.object = object;

	return output;

	// extract data from the cache hash
	// remove metadata on each item
	// and return as array
	function extractFromCache ( cache ) {

		var values = [];
		for ( var key in cache ) {

			var data = cache[ key ];
			delete data.metadata;
			values.push( data );

		}
		return values;

	}

};
THREE.BufferGeometry.prototype.toJSON = function ( meta ) {

	var isRoot = meta === undefined;

	if ( isRoot ) {

		meta = {
			buffers: {}
		};

	}

	var data = {
		metadata: {
			version: 4.4,
			type: 'BufferGeometry',
			generator: 'BufferGeometry.toJSON'
		}
	};

	// standard BufferGeometry serialization

	data.uuid = this.uuid;
	data.type = this.type;
	if ( this.name !== '' ) data.name = this.name;

	if ( this.parameters !== undefined ) {

		var parameters = this.parameters;

		for ( var key in parameters ) {

			if ( parameters[ key ] !== undefined ) data[ key ] = parameters[ key ];

		}

		return data;

	}

	data.data = { attributes: {} };

	var index = this.index;

	if ( index !== null ) {

		var array = Array.prototype.slice.call( index.array );

		data.data.index = {
			type: index.array.constructor.name,
			array: array
		};

	}

	var attributes = this.attributes;
	var key, attribute, array; 
	var interleavedBuffer;

	// 处理交叉存储的顶点属性
	if ( attributes.position && attributes.position instanceof THREE.InterleavedBufferAttribute ) {

		interleavedBuffer = attributes.position.data;

		if ( meta.buffers[ interleavedBuffer.uuid ] === undefined ) {

			meta.buffers[ interleavedBuffer.uuid ] = {
				id: interleavedBuffer.uuid,
				stride: interleavedBuffer.stride,
				array: interleavedBuffer.array
			};
		}

		for ( key in attributes ) {

			attribute = attributes[ key ];

			data.data.attributes[ key ] = {
				buffer: interleavedBuffer.uuid,
				itemSize: attribute.itemSize,
				offset: attribute.offset
			};

		}


	} else {

		for ( key in attributes ) {

			attribute = attributes[ key ];

			array = Array.prototype.slice.call( attribute.array );

			data.data.attributes[ key ] = {
				itemSize: attribute.itemSize,
				type: attribute.array.constructor.name,
				array: array,
				normalized: attribute.normalized
			};

		}

	}

	var groups = this.groups;

	if ( groups.length > 0 ) {

		data.data.groups = JSON.parse( JSON.stringify( groups ) );

	}

	var boundingSphere = this.boundingSphere;

	if ( boundingSphere !== null ) {

		data.data.boundingSphere = {
			center: boundingSphere.center.toArray(),
			radius: boundingSphere.radius
		};

	}

	function extractFromCache ( cache ) {

		var values = [];

		for ( var key in cache ) {

			var data = cache[ key ];
			delete data.metadata;
			values.push( data );

		}

		return values;

	}

	if ( isRoot ) {

		var buffers = extractFromCache( meta.buffers );

		if ( buffers.length > 0 ) data.buffers = buffers;

	}

	return data;

};

// 支持InterleavedBufferAttribute
THREE.Mesh.prototype.raycast = (function () {

	var inverseMatrix = new THREE.Matrix4();
	var ray = new THREE.Ray();
	var sphere = new THREE.Sphere();

	var vA = new THREE.Vector3();
	var vB = new THREE.Vector3();
	var vC = new THREE.Vector3();

	var tempA = new THREE.Vector3();
	var tempB = new THREE.Vector3();
	var tempC = new THREE.Vector3();

	var uvA = new THREE.Vector2();
	var uvB = new THREE.Vector2();
	var uvC = new THREE.Vector2();

	var barycoord = new THREE.Vector3();

	var intersectionPoint = new THREE.Vector3();
	var intersectionPointWorld = new THREE.Vector3();

	function uvIntersection( point, p1, p2, p3, uv1, uv2, uv3 ) {

		THREE.Triangle.barycoordFromPoint( point, p1, p2, p3, barycoord );

		uv1.multiplyScalar( barycoord.x );
		uv2.multiplyScalar( barycoord.y );
		uv3.multiplyScalar( barycoord.z );

		uv1.add( uv2 ).add( uv3 );

		return uv1.clone();

	}

	function checkIntersection( object, raycaster, ray, pA, pB, pC, point ) {

		var intersect;
		var material = object.material;

		if ( material.side === THREE.BackSide ) {

			intersect = ray.intersectTriangle( pC, pB, pA, true, point );

		} else {

			intersect = ray.intersectTriangle( pA, pB, pC, material.side !== THREE.DoubleSide, point );

		}

		if ( intersect === null ) return null;

		intersectionPointWorld.copy( point );
		intersectionPointWorld.applyMatrix4( object.matrixWorld );

		var distance = raycaster.ray.origin.distanceTo( intersectionPointWorld );

		if ( distance < raycaster.near || distance > raycaster.far ) return null;

		return {
			distance: distance,
			point: intersectionPointWorld.clone(),
			object: object
		};

	}

	function checkBufferGeometryIntersection( object, raycaster, ray, positions, uvs, a, b, c ) {

		vA.fromArray( positions.array, a * positions.stride + positions.offset );
		vB.fromArray( positions.array, b * positions.stride + positions.offset );
		vC.fromArray( positions.array, c * positions.stride + positions.offset );

		var intersection = checkIntersection( object, raycaster, ray, vA, vB, vC, intersectionPoint );

		if ( intersection ) {

			if ( uvs ) {

				uvA.fromArray( uvs.array, a * uvs.stride + uvs.offset );
				uvB.fromArray( uvs.array, b * uvs.stride + uvs.offset );
				uvC.fromArray( uvs.array, c * uvs.stride + uvs.offset );

				intersection.uv = uvIntersection( intersectionPoint,  vA, vB, vC,  uvA, uvB, uvC );

			}

			intersection.face = new THREE.Face3( a, b, c, THREE.Triangle.normal( vA, vB, vC ) );
			intersection.faceIndex = a;

		}

		return intersection;

	}

	return function raycast( raycaster, intersects ) {

		var geometry = this.geometry;
		var material = this.material;
		var matrixWorld = this.matrixWorld;

		if ( material === undefined ) return;

		// Checking boundingSphere distance to ray

		if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

		sphere.copy( geometry.boundingSphere );
		sphere.applyMatrix4( matrixWorld );

		if ( raycaster.ray.intersectsSphere( sphere ) === false ) return;

		//

		inverseMatrix.getInverse( matrixWorld );
		ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

		// Check boundingBox before continuing

		if ( geometry.boundingBox !== null ) {

			if ( ray.intersectsBox( geometry.boundingBox ) === false ) return;

		}

		var uvs, intersection;

		if ( geometry instanceof THREE.BufferGeometry ) {

			var a, b, c;
			var index = geometry.index;
			var attributes = geometry.attributes;
			var positions;
			if ( attributes.position instanceof THREE.InterleavedBufferAttribute ) {

				positions = {
					array: attributes.position.data.array,
					offset: attributes.position.offset,
					stride: attributes.position.data.stride
				};

			} else {

				positions = {
					array: attributes.position.array,
					offset: 0,
					stride: 3
				};

			}

			if ( attributes.uv !== undefined ) {

				if ( attributes.uv instanceof THREE.InterleavedBufferAttribute ) {

					uvs = {
						array: attributes.uv.data.array,
						offset: attributes.uv.offset,
						stride: attributes.uv.data.stride
					};

				} else {

					uvs = {
						array: attributes.uv.array,
						offset: 0,
						stride: 2
					};
				}

			}

			if ( index !== null ) {

				var indices = index.array;

				for ( var i = 0, l = indices.length; i < l; i += 3 ) {

					a = indices[ i ];
					b = indices[ i + 1 ];
					c = indices[ i + 2 ];

					intersection = checkBufferGeometryIntersection( this, raycaster, ray, positions, uvs, a, b, c );

					if ( intersection ) {

						intersection.faceIndex = Math.floor( i / 3 ); // triangle number in indices buffer semantics
						intersects.push( intersection );

					}

				}

			} else {


				for ( var i = 0, l = positions.array.length / positions.stride; i < l; i += 3 ) {

					a = i;
					b = a + 1;
					c = a + 2;

					intersection = checkBufferGeometryIntersection( this, raycaster, ray, positions, uvs, a, b, c );

					if ( intersection ) {

						intersection.index = a; // triangle number in positions buffer semantics
						intersects.push( intersection );

					}

				}

			}

		} else if ( geometry instanceof THREE.Geometry ) {

			var fvA, fvB, fvC;
			var isFaceMaterial = material instanceof THREE.MultiMaterial;
			var materials = isFaceMaterial === true ? material.materials : null;

			var vertices = geometry.vertices;
			var faces = geometry.faces;
			var faceVertexUvs = geometry.faceVertexUvs[ 0 ];
			if ( faceVertexUvs.length > 0 ) uvs = faceVertexUvs;

			for ( var f = 0, fl = faces.length; f < fl; f ++ ) {

				var face = faces[ f ];
				var faceMaterial = isFaceMaterial === true ? materials[ face.materialIndex ] : material;

				if ( faceMaterial === undefined ) continue;

				fvA = vertices[ face.a ];
				fvB = vertices[ face.b ];
				fvC = vertices[ face.c ];

				if ( faceMaterial.morphTargets === true ) {

					var morphTargets = geometry.morphTargets;
					var morphInfluences = this.morphTargetInfluences;

					vA.set( 0, 0, 0 );
					vB.set( 0, 0, 0 );
					vC.set( 0, 0, 0 );

					for ( var t = 0, tl = morphTargets.length; t < tl; t ++ ) {

						var influence = morphInfluences[ t ];

						if ( influence === 0 ) continue;

						var targets = morphTargets[ t ].vertices;

						vA.addScaledVector( tempA.subVectors( targets[ face.a ], fvA ), influence );
						vB.addScaledVector( tempB.subVectors( targets[ face.b ], fvB ), influence );
						vC.addScaledVector( tempC.subVectors( targets[ face.c ], fvC ), influence );

					}

					vA.add( fvA );
					vB.add( fvB );
					vC.add( fvC );

					fvA = vA;
					fvB = vB;
					fvC = vC;

				}

				intersection = checkIntersection( this, raycaster, ray, fvA, fvB, fvC, intersectionPoint );

				if ( intersection ) {

					if ( uvs ) {

						var uvs_f = uvs[ f ];
						uvA.copy( uvs_f[ 0 ] );
						uvB.copy( uvs_f[ 1 ] );
						uvC.copy( uvs_f[ 2 ] );

						intersection.uv = uvIntersection( intersectionPoint, fvA, fvB, fvC, uvA, uvB, uvC );

					}

					intersection.face = face;
					intersection.faceIndex = f;
					intersects.push( intersection );

				}

			}

		}

	};

})();

// 支持InterleavedBufferAttribute
THREE.Box3.prototype.setFromObject = (function () {

	// Computes the world-axis-aligned bounding box of an object (including its children),
	// accounting for both the object's, and children's, world transforms

	var v1 = new THREE.Vector3();

	return function setFromObject( object ) {

		var scope = this;

		object.updateMatrixWorld( true );

		this.makeEmpty();

		object.traverse( function ( node ) {

			var geometry = node.geometry;

			if ( geometry !== undefined ) {

				if ( geometry instanceof THREE.Geometry ) {

					var vertices = geometry.vertices;

					for ( var i = 0, il = vertices.length; i < il; i ++ ) {

						v1.copy( vertices[ i ] );
						v1.applyMatrix4( node.matrixWorld );

						scope.expandByPoint( v1 );

					}

				} else if ( geometry instanceof THREE.BufferGeometry && geometry.attributes[ 'position' ] !== undefined ) {

					var positions, offset, stride;
					var attribute = geometry.attributes[ 'position' ];

					if ( attribute instanceof THREE.InterleavedBufferAttribute ) {

						positions = attribute.data.array;
						offset = attribute.offset;
						stride = attribute.data.stride;

					}
					else {

						positions = geometry.attributes[ 'position' ].array;
						offset = 0;
						stride = 3;
					}

					for ( var i = offset, il = positions.length; i < il; i += stride ) {

						v1.fromArray( positions, i );
						v1.applyMatrix4( node.matrixWorld );

						scope.expandByPoint( v1 );

					}

				}

			}

		} );

		return this;

	};

})();


})();