/**
 * @author mrdoob / http://mrdoob.com/
 */

myObjectLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.texturePath = '';
	this.finishOtherFile = false;

	this.textureSharedMap = null;
	this.materialSharedMap = null;

};

myObjectLoader.prototype = {

	constructor: THREE.ObjectLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		if ( this.texturePath === '' ) {

			this.texturePath = url.slice(0,url.lastIndexOf('/')+1);

		}

		var scope = this;

		var binFileUrl = url + '.zip';
		var objectName = url.slice(url.lastIndexOf('/')+1);

		var xhr = new XMLHttpRequest();
		xhr.open('GET', binFileUrl, true);
		xhr.responseType = "blob";
		xhr.setRequestHeader("If-Modified-Since", "Sat, 01 Jan 1970 00:00:00 GMT");
		xhr.onload = function(e) {
			if ((xhr.status == 200) || (xhr.status == 206)|| (xhr.status == 0)) {
				var fileReader = new FileReader();
				fileReader.addEventListener('load', function () {
					var buffer = fileReader.result;
					var zip = new JSZip();
					try {
						zip.load(buffer);
					}
					catch (e) {
						console.log(e);
						//TODO:���ݴ�����ҳ������ʾ������ʾ
						alert('ģ�����ݴ���');
						return;
					}

					var data = zip.file(objectName + '.bin');
					var json = zip.file(objectName + '.json');
					if(data == undefined){
						scope.parse(JSON.parse(json.asText()), null, onLoad);
					}else{
						scope.parse(JSON.parse(json.asText()), data.asArrayBuffer(), onLoad);
					}

				}, false);
				fileReader.readAsArrayBuffer(xhr.response);
			}
		};
		xhr.send(null);

	},

	setTexturePath: function ( value ) {

		this.texturePath = value;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( json,data, onLoad ) {

		var geometries = {};
		if(data !== null){
			geometries =  this.parseGeometries( json.geometries, json.accessors, data );
		}

		var images = this.parseImages( json.images, function () {

			if ( onLoad !== undefined ) onLoad( object );

		} );

		var textures  = this.parseTextures( json.textures, images );
		var materials = this.parseMaterials( json.materials, textures );

		var object = this.parseObject( json.object, geometries, materials );

		if ( json.animations ) {

			object.animations = this.parseAnimations( json.animations );

		}

		if ( json.images === undefined || json.images.length === 0 ) {

			if ( onLoad !== undefined ) onLoad( object );

		}

		return object;

	},

	parseGeometries: function ( json, accessors, bufferdata  ) {

		var geometries = {};

		if ( json !== undefined ) {

			var geometryLoader = new THREE.JSONLoader();
			var bufferGeometryLoader = new myBufferGeometryLoader();

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var geometry;
				var data = json[ i ];

				switch ( data.type ) {

					case 'PlaneGeometry':
					case 'PlaneBufferGeometry':

						geometry = new THREE[ data.type ](
							data.width,
							data.height,
							data.widthSegments,
							data.heightSegments
						);

						break;

					case 'BoxGeometry':
					case 'BoxBufferGeometry':
					case 'CubeGeometry': // backwards compatible

						geometry = new THREE[ data.type ](
							data.width,
							data.height,
							data.depth,
							data.widthSegments,
							data.heightSegments,
							data.depthSegments
						);

						break;

					case 'CircleGeometry':
					case 'CircleBufferGeometry':

						geometry = new THREE[ data.type ](
							data.radius,
							data.segments,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'CylinderGeometry':
					case 'CylinderBufferGeometry':

						geometry = new THREE[ data.type ](
							data.radiusTop,
							data.radiusBottom,
							data.height,
							data.radialSegments,
							data.heightSegments,
							data.openEnded,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'SphereGeometry':
					case 'SphereBufferGeometry':

						geometry = new THREE[ data.type ](
							data.radius,
							data.widthSegments,
							data.heightSegments,
							data.phiStart,
							data.phiLength,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'DodecahedronGeometry':

						geometry = new THREE.DodecahedronGeometry(
							data.radius,
							data.detail
						);

						break;

					case 'IcosahedronGeometry':

						geometry = new THREE.IcosahedronGeometry(
							data.radius,
							data.detail
						);

						break;

					case 'OctahedronGeometry':

						geometry = new THREE.OctahedronGeometry(
							data.radius,
							data.detail
						);

						break;

					case 'TetrahedronGeometry':

						geometry = new THREE.TetrahedronGeometry(
							data.radius,
							data.detail
						);

						break;

					case 'RingGeometry':
					case 'RingBufferGeometry':

						geometry = new THREE[ data.type ](
							data.innerRadius,
							data.outerRadius,
							data.thetaSegments,
							data.phiSegments,
							data.thetaStart,
							data.thetaLength
						);

						break;

					case 'TorusGeometry':
					case 'TorusBufferGeometry':

						geometry = new THREE[ data.type ](
							data.radius,
							data.tube,
							data.radialSegments,
							data.tubularSegments,
							data.arc
						);

						break;

					case 'TorusKnotGeometry':
					case 'TorusKnotBufferGeometry':

						geometry = new THREE[ data.type ](
							data.radius,
							data.tube,
							data.tubularSegments,
							data.radialSegments,
							data.p,
							data.q
						);

						break;

					case 'LatheGeometry':

						geometry = new THREE.LatheGeometry(
							data.points,
							data.segments,
							data.phiStart,
							data.phiLength
						);

						break;

					case 'BufferGeometry':

						geometry = bufferGeometryLoader.parse( data, accessors, bufferdata);

						break;

					case 'Geometry':

						geometry = geometryLoader.parse( data.data, this.texturePath ).geometry;

						break;

					default:

						console.warn( 'THREE.ObjectLoader: Unsupported geometry type "' + data.type + '"' );

						continue;

				}

				geometry.uuid = data.uuid;

				if ( data.name !== undefined ) geometry.name = data.name;

				geometries[ data.uuid ] = geometry;

			}

		}

		return geometries;

	},

	parseMaterials: function ( json, textures ) {

		var materials = {};

		function getOrCreateMaterial ( map, json ) {

			var material = null;

			if ( map && map[json.uuid] ) {

				material = map[json.uuid];

			}
			else {

				material = parseMaterial( map, json );

				if ( map ) {

					map[json.uuid] = material;

				}

			}

			return material;

		}

		function parseMaterial ( map, json ) {

			var material = new THREE[ json.type ];

			if ( json.uuid !== undefined ) material.uuid = json.uuid;
			if ( json.name !== undefined ) material.name = json.name;
			if ( json.color !== undefined ) material.color.setHex( json.color );
			if ( json.roughness !== undefined ) material.roughness = json.roughness;
			if ( json.metalness !== undefined ) material.metalness = json.metalness;
			if ( json.emissive !== undefined ) material.emissive.setHex( json.emissive );
			if ( json.specular !== undefined ) material.specular.setHex( json.specular );
			if ( json.shininess !== undefined ) material.shininess = json.shininess;
			if ( json.uniforms !== undefined ) material.uniforms = json.uniforms;
			if ( json.vertexShader !== undefined ) material.vertexShader = json.vertexShader;
			if ( json.fragmentShader !== undefined ) material.fragmentShader = json.fragmentShader;
			if ( json.vertexColors !== undefined ) material.vertexColors = json.vertexColors;
			if ( json.shading !== undefined ) material.shading = json.shading;
			if ( json.blending !== undefined ) material.blending = json.blending;
			if ( json.side !== undefined ) material.side = json.side;
			if ( json.opacity !== undefined ) material.opacity = json.opacity;
			if ( json.transparent !== undefined ) material.transparent = json.transparent;
			if ( json.alphaTest !== undefined ) material.alphaTest = json.alphaTest;
			if ( json.depthTest !== undefined ) material.depthTest = json.depthTest;
			if ( json.depthWrite !== undefined ) material.depthWrite = json.depthWrite;
			if ( json.colorWrite !== undefined ) material.colorWrite = json.colorWrite;
			if ( json.wireframe !== undefined ) material.wireframe = json.wireframe;
			if ( json.wireframeLinewidth !== undefined ) material.wireframeLinewidth = json.wireframeLinewidth;

			// for PointsMaterial
			if ( json.size !== undefined ) material.size = json.size;
			if ( json.sizeAttenuation !== undefined ) material.sizeAttenuation = json.sizeAttenuation;

			// maps

			if ( json.map !== undefined ) material.map = textures[json.map ];

			if ( json.alphaMap !== undefined ) {

				material.alphaMap = textures[ json.alphaMap ];
				material.transparent = true;

			}

			if ( json.bumpMap !== undefined ) material.bumpMap = textures[ json.bumpMap ];
			if ( json.bumpScale !== undefined ) material.bumpScale = json.bumpScale;

			if ( json.normalMap !== undefined ) material.normalMap = textures[ json.normalMap ];
			if ( json.normalScale !== undefined ) {

				var normalScale = json.normalScale;

				if ( Array.isArray( normalScale ) === false ) {

					// Blender exporter used to export a scalar. See #7459

					normalScale = [ normalScale, normalScale ];

				}

				material.normalScale = new THREE.Vector2().fromArray( normalScale );

			}

			if ( json.displacementMap !== undefined ) material.displacementMap = textures[ json.displacementMap ];
			if ( json.displacementScale !== undefined ) material.displacementScale = json.displacementScale;
			if ( json.displacementBias !== undefined ) material.displacementBias = json.displacementBias;

			if ( json.roughnessMap !== undefined ) material.roughnessMap = textures[ json.roughnessMap ];
			if ( json.metalnessMap !== undefined ) material.metalnessMap = textures[ json.metalnessMap ];

			if ( json.emissiveMap !== undefined ) material.emissiveMap = textures[ json.emissiveMap ];
			if ( json.emissiveIntensity !== undefined ) material.emissiveIntensity = json.emissiveIntensity;

			if ( json.specularMap !== undefined ) material.specularMap = textures[ json.specularMap ];

			if ( json.envMap !== undefined ) {

				material.envMap = textures[ json.envMap ];
				material.combine = THREE.MultiplyOperation;

			}

			if ( json.reflectivity ) material.reflectivity = json.reflectivity;

			if ( json.lightMap !== undefined ) material.lightMap = textures[ json.lightMap ];
			if ( json.lightMapIntensity !== undefined ) material.lightMapIntensity = json.lightMapIntensity;

			if ( json.aoMap !== undefined ) material.aoMap = textures[ json.aoMap ];
			if ( json.aoMapIntensity !== undefined ) material.aoMapIntensity = json.aoMapIntensity;

			// 根据纹理用途设置纹理格式（对于共享纹理用于不同的通道时可能会有问题）
			if ( material.transparent && material.map && material.map instanceof THREE.Texture ) {

				material.map.format = THREE.RGBAFormat;

			}
			if ( material.lightMap && material.lightMap instanceof THREE.Texture ) {

				material.lightMap.format = THREE.LuminanceFormat;
				material.lightMap.generateMipmaps = false;
				material.lightMap.minFilter = THREE.LinearFilter;

			}

			// MultiMaterial

			if ( json.materials !== undefined ) {

				for ( var i = 0, l = json.materials.length; i < l; i ++ ) {

					material.materials.push( getOrCreateMaterial( map, json.materials[i] ) );

				}

			}

			return material;

		}

		if ( json !== undefined ) {

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var material = getOrCreateMaterial( this.materialSharedMap, json[i] );

				materials[ material.uuid ] = material;

			}

		}

		return materials;

	},

	parseAnimations: function ( json ) {

		var animations = [];

		for ( var i = 0; i < json.length; i ++ ) {

			var clip = THREE.AnimationClip.parse( json[ i ] );

			animations.push( clip );

		}

		return animations;

	},

	parseImages: function ( json, onLoad ) {

		var scope = this;
		var images = {};

		function loadImage( url ) {

			scope.manager.itemStart( url );

			return loader.load( url, function () {

				scope.manager.itemEnd( url );

			} );

		}

		if ( json !== undefined && json.length > 0 ) {

			var manager = new THREE.LoadingManager( onLoad );

			var loader = new THREE.ImageLoader( manager );
			loader.setCrossOrigin( this.crossOrigin );

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var image = json[ i ];
				var path = /^(\/\/)|([a-z]+:(\/\/)?)/i.test( image.url ) ? image.url : scope.texturePath + image.url;

				images[ image.uuid ] = loadImage( path );

			}

		}

		return images;

	},

	parseTextures: function ( json, images ) {

		function parseConstant( value ) {

			if ( typeof( value ) === 'number' ) return value;

			console.warn( 'THREE.ObjectLoader.parseTexture: Constant should be in numeric form.', value );

			return THREE[ value ];

		}

		var textures = {};

		if ( json !== undefined ) {

			for ( var i = 0, l = json.length; i < l; i ++ ) {

				var data = json[ i ];

				var texture = null;

				if ( this.textureSharedMap && this.textureSharedMap[data.uuid] ) {

					texture = this.textureSharedMap[data.uuid];

				}
				else {

					if ( data.image === undefined ) {

						console.warn( 'THREE.ObjectLoader: No "image" specified for', data.uuid );

					}

					if ( images[ data.image ] === undefined ) {

						console.warn( 'THREE.ObjectLoader: Undefined image', data.image );

					}

					texture = new THREE.Texture( images[ data.image ] );
					texture.format = THREE.RGBFormat;
					texture.needsUpdate = true;

					texture.uuid = data.uuid;

					if ( data.name !== undefined ) texture.name = data.name;
					if ( data.mapping !== undefined ) texture.mapping = parseConstant( data.mapping );
					if ( data.offset !== undefined ) texture.offset = new THREE.Vector2( data.offset[ 0 ], data.offset[ 1 ] );
					if ( data.repeat !== undefined ) texture.repeat = new THREE.Vector2( data.repeat[ 0 ], data.repeat[ 1 ] );
					if ( data.minFilter !== undefined ) texture.minFilter = parseConstant( data.minFilter );
					if ( data.magFilter !== undefined ) texture.magFilter = parseConstant( data.magFilter );
					if ( data.anisotropy !== undefined ) texture.anisotropy = data.anisotropy;
					if ( Array.isArray( data.wrap ) ) {

						texture.wrapS = parseConstant( data.wrap[ 0 ] );
						texture.wrapT = parseConstant( data.wrap[ 1 ] );

					}

					if ( this.textureSharedMap ) {

						this.textureSharedMap[data.uuid] = texture;

					}

				}

				textures[ data.uuid ] = texture;

			}

		}

		return textures;

	},

	parseObject: function () {

		var matrix = new THREE.Matrix4();

		return function ( data, geometries, materials ) {

			var object;

			function getGeometry( name ) {

				if ( geometries[ name ] === undefined ) {

					console.warn( 'THREE.ObjectLoader: Undefined geometry', name );

				}

				return geometries[ name ];

			}

			function getMaterial( name ) {

				if ( name === undefined ) return undefined;

				if ( materials[ name ] === undefined ) {

					console.warn( 'THREE.ObjectLoader: Undefined material', name );

				}

				return materials[ name ];

			}

			switch ( data.type ) {

				case 'Scene':

					object = new THREE.Scene();

					break;

				case 'PerspectiveCamera':

					object = new THREE.PerspectiveCamera( data.fov, data.aspect, data.near, data.far );

					break;

				case 'OrthographicCamera':

					object = new THREE.OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );

					break;

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

				case 'Mesh':

					var geometry = getGeometry( data.geometry );
					var material = getMaterial( data.material );

					if ( geometry.bones && geometry.bones.length > 0 ) {

						object = new THREE.SkinnedMesh( geometry, material );

					} else {

						object = new THREE.Mesh( geometry, material );

					}

					break;

				case 'LOD':

					object = new THREE.LOD();

					break;

				case 'Line':

					object = new THREE.Line( getGeometry( data.geometry ), getMaterial( data.material ), data.mode );

					break;

				case 'PointCloud':
				case 'Points':

					object = new THREE.Points( getGeometry( data.geometry ), getMaterial( data.material ) );

					break;

				case 'Sprite':

					object = new THREE.Sprite( getMaterial( data.material ) );

					break;

				case 'Group':

					object = new THREE.Group();

					break;

				default:

					object = new THREE.Object3D();

			}

			object.uuid = data.uuid;

			if ( data.name !== undefined ) object.name = data.name;
			if ( data.matrix !== undefined ) {

				matrix.fromArray( data.matrix );
				matrix.decompose( object.position, object.quaternion, object.scale );

			} else {

				if ( data.position !== undefined ) object.position.fromArray( data.position );
				if ( data.rotation !== undefined ) object.rotation.fromArray( data.rotation );
				if ( data.scale !== undefined ) object.scale.fromArray( data.scale );

			}

			if ( data.castShadow !== undefined ) object.castShadow = data.castShadow;
			if ( data.receiveShadow !== undefined ) object.receiveShadow = data.receiveShadow;

			if ( data.visible !== undefined ) object.visible = data.visible;
			if ( data.userData !== undefined ) object.userData = data.userData;

			if ( data.children !== undefined ) {

				for ( var child in data.children ) {

					object.add( this.parseObject( data.children[ child ], geometries, materials ) );

				}

			}

			if ( data.type === 'LOD' ) {

				var levels = data.levels;

				for ( var l = 0; l < levels.length; l ++ ) {

					var level = levels[ l ];
					var child = object.getObjectByProperty( 'uuid', level.object );

					if ( child !== undefined ) {

						object.addLevel( child, level.distance );

					}

				}

			}

			return object;

		};

	}()

};
