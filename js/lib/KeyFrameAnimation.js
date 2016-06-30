/**
 * @author mikael emtinger / http://gomo.se/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author khang duong
 * @author erik kitson
 */

THREE.KeyFrameAnimation = function ( data ) {

	this.root = data.node;
	this.data = THREE.AnimationHandler.init( data );
	this.hierarchy = THREE.AnimationHandler.parse( this.root );
	this.currentTime = 0;
	this.timeScale = 0.001;
	this.isPlaying = false;
	this.isPaused = true;
	this.loop = true;

	// initialize to first keyframes

	for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {
    
		var keys = this.data.hierarchy[ h ].keys,
			sids = this.data.hierarchy[ h ].sids,
			obj = this.hierarchy[ h ];
    
		if ( keys.length && sids ) {
    
			for ( var s = 0; s < sids.length; s ++ ) {
    
				var sid = sids[ s ],
					next = this.getNextKeyWith( sid, h, 0 );
    
				if ( next ) {
    
					next.apply( sid );
    
				}
    
			}
    
			//obj.matrixAutoUpdate = false;
			// this.data.hierarchy[ h ].node.updateMatrix();
			// obj.matrixWorldNeedsUpdate = true;
    
		}
    
	}

};

THREE.KeyFrameAnimation.prototype = {

	constructor: THREE.KeyFrameAnimation,

	play: function ( startTime ) {

		this.currentTime = startTime !== undefined ? startTime : 0;

		if ( this.isPlaying === false ) {

			this.isPlaying = true;

			// reset key cache

			var h, hl = this.hierarchy.length,
				object,
				node;

			for ( h = 0; h < hl; h ++ ) {

				object = this.hierarchy[ h ];
				node = this.data.hierarchy[ h ];
 
				if ( node.animationCache === undefined ) {

					node.animationCache = {};
					node.animationCache.prevKey = null;
					node.animationCache.nextKey = null;
					node.animationCache.originalMatrix = object.matrix;

				}

				var keys = this.data.hierarchy[ h ].keys;

				if ( keys.length > 1 ) {

					node.animationCache.prevKey = keys[ 0 ];
					node.animationCache.nextKey = keys[ 1 ];

					this.startTime = Math.min( keys[ 0 ].time, this.startTime );
					this.endTime = Math.max( keys[ keys.length - 1 ].time, this.endTime );

				}

			}

			this.update( 0 );

		}

		this.isPaused = false;

	},

	stop: function () {

		this.isPlaying = false;
		this.isPaused  = false;

		// reset JIT matrix and remove cache

		for ( var h = 0; h < this.data.hierarchy.length; h ++ ) {

			var obj = this.hierarchy[ h ];
			var node = this.data.hierarchy[ h ];

			if ( node.animationCache !== undefined ) {

				var original = node.animationCache.originalMatrix;

				original.copy( obj.matrix );
				obj.matrix = original;

				delete node.animationCache;

			}

		}

	},

	update: function ( delta ) {

		if ( this.isPlaying === false ) return;

		this.currentTime += delta * this.timeScale;

		//

		var duration = this.data.length;

		if ( this.loop === true && this.currentTime > duration ) {

			this.currentTime %= duration;

		}

		this.currentTime = Math.min( this.currentTime, duration );

		for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {

			var object = this.hierarchy[ h ];
			var node = this.data.hierarchy[ h ];

			var keys = node.keys,
				animationCache = node.animationCache;


			if ( keys.length ) {

				var prevKey = animationCache.prevKey;
				var nextKey = animationCache.nextKey;

				if ( nextKey.time <= this.currentTime ) {

					while ( nextKey.time < this.currentTime && nextKey.index > prevKey.index ) {

						prevKey = nextKey;
						nextKey = keys[ prevKey.index + 1 ];

					}

					animationCache.prevKey = prevKey;
					animationCache.nextKey = nextKey;

				}

				if ( nextKey.time >= this.currentTime ) {

					prevKey.interpolate( nextKey, this.currentTime );

				} else {

					prevKey.interpolate( nextKey, nextKey.time );

				}

				this.data.hierarchy[ h ].node.updateMatrix();
				object.matrixWorldNeedsUpdate = true;

			}

		}

	},

	getNextKeyWith: function ( sid, h, key ) {

		var keys = this.data.hierarchy[ h ].keys;
		key = key % keys.length;

		for ( ; key < keys.length; key ++ ) {

			if ( keys[ key ].hasTarget( sid ) ) {

				return keys[ key ];

			}

		}

		return keys[ 0 ];

	},

	getPrevKeyWith: function ( sid, h, key ) {

		var keys = this.data.hierarchy[ h ].keys;
		key = key >= 0 ? key : key + keys.length;

		for ( ; key >= 0; key -- ) {

			if ( keys[ key ].hasTarget( sid ) ) {

				return keys[ key ];

			}

		}

		return keys[ keys.length - 1 ];

	},

	testTransform: function(){

		var duration = this.data.length;


		for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {

			var object = this.hierarchy[ h ];
			var node = this.data.hierarchy[ h ];
			var keys = node.keys;
			var transforms = node.node.transforms;

			if ( keys.length ) {

				var key = {};
				var target = {};
				var matrix = object.matrix.clone();

				var tracks = [];
				var times = [];
				var posValues = [];
				var quaternValues = [];
				var sclValues = [];

				for ( var k = 0; k < keys.length; k++ ) {

					key = keys[ k ];
					times.push( key.time );
					matrix.identity();
					var targets = key.targets;

					for ( var i = 0; i < targets.length; i++ ) {

						target = targets[i];
						target.transform.update( target.data, target.member );

					}


					for ( var t = 0; t < transforms.length; t++ ) {

						transforms[ t ].apply( matrix );

					}

					var position = new THREE.Vector3();
					var quaternion = new THREE.Quaternion();
					var scale = new THREE.Vector3();

					matrix.decompose( position, quaternion, scale );

					position.toArray(posValues, posValues.length);
					scale.toArray(sclValues, sclValues.length);
					quaternion.toArray(quaternValues, quaternValues.length);

				}

				//toClip
				var positionArray = new THREE.VectorKeyframeTrack(object.name + '.position', times, posValues);
				var rotationArray = new THREE.QuaternionKeyframeTrack(object.name + '.quaternion', times, quaternValues);
				var scaleArray = new THREE.VectorKeyframeTrack( object.name + '.scale', times, sclValues);

				tracks.push(positionArray);
				tracks.push(rotationArray);
				tracks.push(scaleArray);

				var clip = new THREE.AnimationClip(this.name, duration, tracks);

				return clip;

			}

		}

	},

	translateToAnimationClip: function(){

		var members = [ 'X', 'Y', 'Z', 'ANGLE' ];
		var tracks = [];

		var times = [];
		var posValues = [];
		var rotValues = [];
		var sclValues = [];

		for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {

			var keys = this.data.hierarchy[ h ].keys,
				sids = this.data.hierarchy[ h ].sids,
				//obj = this.hierarchy[ h ],
				obj = this.root;
				pos = obj.position.toArray(),
				rot = new THREE.Quaternion().setFromEuler( obj.rotation),
				scl = obj.scale.toArray();

			if ( keys.length && sids ) {

				var position = new THREE.Vector3();
				var scale = new THREE.Vector3();
				var rotate = new THREE.Euler();
				var quatern = new THREE.Quaternion();

				position.copy(obj.position);
				scale.copy(obj.scale);
				rotate.copy(obj.rotation);


				for (var k = 0; k < keys.length; k ++) {

					var key = keys[ k ];
					times.push(key.time);

					this.getTransformOffset(key.targets, position, scale, rotate);

					position.toArray(posValues, posValues.length);
					scale.toArray(sclValues, sclValues.length);

					quatern.setFromEuler(rotate);
					quatern.toArray(rotValues, rotValues.length);

				}

				var positionArray = new THREE.VectorKeyframeTrack(obj.name + '.position', times, posValues);
				var rotationArray = new THREE.QuaternionKeyframeTrack(obj.name + '.quaternion', times, rotValues);
				var scaleArray = new THREE.VectorKeyframeTrack( obj.name + '.scale', times, sclValues);

				tracks.push(positionArray);
				tracks.push(rotationArray);
				tracks.push(scaleArray);

			}

		}

		if( tracks.length === 0) {

			return null;

		}

		var duration = this.data.length;

		var clip = new THREE.AnimationClip(this.name, duration, tracks);

		return clip;

	},

	getTransformOffset: function(targets, position, scale, rotation){

		var type = '';

		for (var t = 0; t < targets.length; t ++) {

			var target = targets[t];

			var data = target.data;

			var member = target.sid.split('.');

			switch( member[0] ) {

				case 'translate':
				case 'translation':

					this.VectorTransform(member[1], data, position);
					break;

				case 'scale':

					this.VectorTransform(member[1], data, scale);
					break;

				case 'rotateX':
				case 'rotationX':
				case 'rotateY':
				case 'rotationY':
				case 'rotateZ':
				case 'rotationZ':

					this.VectorTransform(member[0], data, rotation, true);
					break;

			}

		}
	},

	update : function ( data, member ) {

		var members = [ 'X', 'Y', 'Z', 'ANGLE' ];
		var obj = new THREE.Vector3();
		var angle = 0;

		switch ( this.type ) {

			case 'translate':
			case 'scale':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						break;

				}

				break;

			case 'rotate':

				if ( Object.prototype.toString.call( member ) === '[object Array]' ) {

					member = members[ member[ 0 ] ];

				}

				switch ( member ) {

					case 'X':

						this.obj.x = data;
						break;

					case 'Y':

						this.obj.y = data;
						break;

					case 'Z':

						this.obj.z = data;
						break;

					case 'ANGLE':

						this.angle = THREE.Math.degToRad( data );
						break;

					default:

						this.obj.x = data[ 0 ];
						this.obj.y = data[ 1 ];
						this.obj.z = data[ 2 ];
						this.angle = THREE.Math.degToRad( data[ 3 ] );
						break;

				}
				break;

		}

	},

	VectorTransform: function(member, data, object, type){

		if( type ) {

			data = -THREE.Math.degToRad(data);

		}
		switch (member) {

			case 'X':
			case 'rotateX':
			case 'rotationX':

				object.x = data;
				break;

			case 'Y':
			case 'rotateY':
			case 'rotationY':

				object.z = data;
				break;

			case 'Z':
			case 'rotateZ':
			case 'rotationZ':

				object.y = data * -1;
				break;

			default:

				object.x = data[0];
				object.z = data[1];
				object.y = data[2] * -1;
				break;

		}
	},

	VectorRotate: function(member, data, object, type){

		if( type ) {

			data = Math.PI - THREE.Math.degToRad(data);

		}
		switch (member) {

			case 'X':
			case 'rotateX':
			case 'rotationX':

				object.x = data;
				break;

			case 'Y':
			case 'rotateY':
			case 'rotationY':

				object.z = data;
				break;

			case 'Z':
			case 'rotateZ':
			case 'rotationZ':

				object.y = data;
				break;

			default:

				object.x = data[0];
				object.z = data[1];
				object.y = data[2];
				break;

		}
	},


	SelectTarget: function(member, data){

		var object = new THREE.Vector3();
		var angle;
		var type;
		switch (member) {
			case 'translate':
			case 'scale':

				if (Object.prototype.toString.call(member) === '[object Array]') {

					member = members[member[0]];

				}

				switch (member) {

					case 'X':

						object.x = data;
						break;

					case 'Y':

						object.y = data;
						break;

					case 'Z':

						object.z = data;
						break;

					default:

						object.x = data[0];
						object.y = data[1];
						object.z = data[2];
						break;

				}

				break;

			case 'rotate':

				if (Object.prototype.toString.call(member) === '[object Array]') {

					member = members[member[0]];

				}

				switch (member) {

					case 'X':

						object.x = data;
						break;

					case 'Y':

						object.y = data;
						break;

					case 'Z':

						object.z = data;
						break;

					case 'ANGLE':

						angle = THREE.Math.degToRad(data);
						break;

					default:

						object.x = data[0];
						object.y = data[1];
						object.z = data[2];
						angle = THREE.Math.degToRad(data[3]);
						break;

				}
				break;

		}

		return {obj: object, angle: angle};

	}
};
